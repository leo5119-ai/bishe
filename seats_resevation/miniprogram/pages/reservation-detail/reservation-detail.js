const cloud = require("../../envList").CLOUD_ENV;

Page({
  data: {
    seatId: "",
    floor: 1,
    seatInfo: null,
    openid: "",
    today: "",
    minStartTime: "",
    maxStartTime: "",
    startTime: "",
    endTime: "",
    duration: 30,
    durationOptions: ["30", "60", "90", "120", "150", "180"],
    occupiedSlots: [],
    timeConflict: "",
    loading: false,
    showStartTimePicker: false,
    tempStartTime: "",
    startTimeColumns: []
  },

  onLoad(options) {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const today = `${year}-${month}-${day}`;
    
    this.setData({
      seatId: options.seatId,
      floor: parseInt(options.floor) || 1,
      today: today,
      durationIndex: 0,
      minDate: Date.now()
    });
    this.initCloud();
  },

  async initCloud() {
    wx.cloud.init({ env: cloud });
    const res = await wx.cloud.callFunction({ name: "getOpenId" });
    this.setData({ openid: res.result.openid });
    await this.loadSeatInfo();
    await this.loadOccupiedSlots();
    this.setMinStartTime();
  },

  async loadSeatInfo() {
    const db = wx.cloud.database();
    const seatRes = await db.collection("seats")
      .where({ seatId: this.data.seatId, floor: this.data.floor })
      .get();
    
    if (seatRes.data.length > 0) {
      const seatInfo = seatRes.data[0];
      this.setData({ seatInfo });
      
      if (seatInfo.status === "maintenance") {
        wx.showModal({
          title: "座位维护中",
          content: "该座位正在维护，暂时无法预约",
          showCancel: false,
          success: () => {
            wx.navigateBack();
          }
        });
      }
    }
  },

  async loadOccupiedSlots() {
    const db = wx.cloud.database();
    const today = this.data.today;
    
    const reservations = await db.collection("reservations")
      .where({
        seatId: this.data.seatId,
        date: today,
        status: db.command.in(["pending", "checked"])
      })
      .get();
    
    const occupiedSlots = [];
    reservations.data.forEach(res => {
      occupiedSlots.push({
        start: res.startTime,
        end: res.endTime
      });
    });
    
    this.setData({ occupiedSlots });
  },

  setMinStartTime() {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentMinutes = currentHour * 60 + currentMinute;
    
    const minMinutes = Math.ceil(currentMinutes / 5) * 5;
    let maxMinutes = minMinutes + 30;
    const endMinutes = 22 * 60;
    
    if (maxMinutes > endMinutes) {
      maxMinutes = endMinutes;
    }
    
    const timeOptions = [];
    for (let m = minMinutes; m <= maxMinutes; m += 5) {
      const hour = Math.floor(m / 60);
      const min = m % 60;
      timeOptions.push(`${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}`);
    }
    
    const minTimeStr = timeOptions[0];
    const maxTimeStr = timeOptions[timeOptions.length - 1];
    
    this.setData({
      startTimeColumns: timeOptions,
      minStartTime: minTimeStr,
      maxStartTime: maxTimeStr,
      tempStartTime: minTimeStr
    });
  },

  openStartTimePicker() {
    this.setData({
      showStartTimePicker: true,
      tempStartTime: this.data.startTime || this.data.minStartTime
    });
  },

  closeStartTimePicker() {
    this.setData({ showStartTimePicker: false });
  },

  onStartTimeChange(e) {
    const { value } = e.detail;
    if (typeof value === 'string') {
      this.setData({ tempStartTime: value });
    } else if (Array.isArray(value)) {
      this.setData({ tempStartTime: value[0] });
    }
  },

  confirmStartTime() {
    this.setData({ showStartTimePicker: false });
    this.updateReservation(this.data.tempStartTime, this.data.duration);
  },

  onDurationChange(e) {
    const durationIndex = e.detail.value;
    const duration = parseInt(this.data.durationOptions[durationIndex]);
    this.updateReservation(this.data.startTime, duration);
    this.setData({ durationIndex });
  },

  updateReservation(startTime, duration) {
    let timeConflict = "";
    let endTime = "";
    
    if (startTime) {
      const [sh, sm] = startTime.split(":").map(Number);
      let endMinutes = sh * 60 + sm + duration;
      if (endMinutes > 22 * 60) endMinutes = 22 * 60;
      const endHour = Math.floor(endMinutes / 60);
      const endMin = endMinutes % 60;
      endTime = `${String(endHour).padStart(2, "0")}:${String(endMin).padStart(2, "0")}`;
      
      timeConflict = this.checkConflict(startTime, endTime);
    }
    
    this.setData({
      startTime,
      endTime,
      duration,
      timeConflict
    });
  },

  checkConflict(start, end) {
    const [sH, sM] = start.split(":").map(Number);
    const [eH, eM] = end.split(":").map(Number);
    const startMinutes = sH * 60 + sM;
    const endMinutes = eH * 60 + eM;
    
    for (const slot of this.data.occupiedSlots) {
      const [ssH, ssM] = slot.start.split(":").map(Number);
      const [seH, seM] = slot.end.split(":").map(Number);
      const slotStart = ssH * 60 + ssM;
      const slotEnd = seH * 60 + seM;
      
      if (!(endMinutes <= slotStart || startMinutes >= slotEnd)) {
        return `该时段与 ${slot.start}-${slot.end} 的预约冲突`;
      }
    }
    return "";
  },

  async onConfirmReservation() {
    const { seatId, floor, openid, today, startTime, endTime, duration, timeConflict } = this.data;
    
    if (!startTime || !endTime) {
      wx.showToast({ title: "请选择预约时段", icon: "none" });
      return;
    }
    
    if (duration > 180 || duration <= 0) {
      wx.showToast({ title: "预约时长无效", icon: "none" });
      return;
    }
    
    if (timeConflict) {
      wx.showToast({ title: timeConflict, icon: "none" });
      return;
    }
    
    this.setData({ loading: true });
    
    try {
      const result = await wx.cloud.callFunction({
        name: "createReservation",
        data: {
          openid,
          reservation: {
            seatId,
            floor,
            date: today,
            startTime,
            endTime,
            duration
          }
        }
      });
      
      this.setData({ loading: false });
      
      if (result.result.success) {
        wx.showToast({ title: "预约成功", icon: "success" });
        
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      } else {
        wx.showModal({
          title: "预约失败",
          content: result.result.message || "该时段已被预约",
          showCancel: false
        });
      }
    } catch (e) {
      this.setData({ loading: false });
      wx.showModal({
        title: "预约失败",
        content: "网络错误，请重试",
        showCancel: false
      });
    }
  }
});