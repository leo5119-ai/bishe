const cloud = require("../../envList").CLOUD_ENV;

const CHECKIN_QR_CONTENT = "library_checkin_2024";

Page({
  data: {
    reservations: [],
    openid: "",
    loading: true,
    activeTab: "today",
    todayReservations: [],
    historyReservations: []
  },

  onLoad(options) {
    this.initCloud();
  },

  onShow() {
    if (this.data.openid) {
      this.loadReservations();
    }
  },

  onPullDownRefresh() {
    this.loadReservations().finally(() => {
      wx.stopPullDownRefresh();
    });
  },

  async initCloud() {
    wx.cloud.init({ env: cloud });
    const res = await wx.cloud.callFunction({ name: "getOpenId" });
    this.setData({ openid: res.result.openid });
    await this.loadReservations();
  },

  async loadReservations() {
    this.setData({ loading: true });
    const db = wx.cloud.database();
    const openid = this.data.openid;
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

    if (!openid) {
      wx.showToast({ title: "openid为空", icon: "none" });
      this.setData({ loading: false });
      return;
    }

    try {
      await this.autoExpireReservations();
      const allRes = await db.collection("reservations").where({ userOpenid: openid }).get();
      const todayList = [];
      const historyList = [];

      for (const res of allRes.data) {
        if (res.date === today) {
          if (res.status === "pending") {
            todayList.push({ ...res, statusLabel: "待签到" });
          } else if (res.status === "checked") {
            todayList.push({ ...res, statusLabel: "已签到" });
          } else if (res.status === "ended") {
            todayList.push({ ...res, statusLabel: "已结束" });
          } else {
            const label = res.status === "expired" ? "已过期" : "已取消";
            historyList.push({ ...res, statusLabel: label });
          }
        } else {
          const label = res.status === "expired" ? "已过期" : res.status === "ended" ? "已结束" : "已取消";
          historyList.push({ ...res, statusLabel: label });
        }
      }

      const allSeatIds = allRes.data.map(r => r.seatId);
      let seatsMap = {};
      if (allSeatIds.length > 0) {
        const seats = await db.collection("seats").get();
        seats.data.forEach(seat => {
          seatsMap[seat.seatId] = seat;
        });
      }

      const formatRes = (r) => {
        const seatData = seatsMap[r.seatId];
        const seatNo = seatData?.seatNo || seatData?.setNo || seatData?.seatId || r.seatId || "未知";
        let floor = seatData?.floor;
        if (floor === undefined || floor === null || floor === "") {
          floor = r.floor;
        }
        if (floor === undefined || floor === null || floor === "" || floor === 0) {
          floor = 1;
        }
        const result = {
          ...r,
          seatNo,
          floor: Number(floor),
          features: seatData?.features || []
        };
        return result;
      };

      const formattedToday = todayList.map(formatRes);
      const formattedHistory = historyList.map(formatRes);

      formattedToday.sort((a, b) => a.startTime.localeCompare(b.startTime));
      formattedHistory.sort((a, b) => b.createTime - a.createTime);

      this.setData({
        todayReservations: formattedToday,
        historyReservations: formattedHistory.slice(0, 20),
        loading: false
      });
    } catch (e) {
      console.error("loadReservations error:", e);
      this.setData({ loading: false });
    }
  },

  async autoExpireReservations() {
    try {
      await wx.cloud.callFunction({
        name: "autoExpireReservations"
      });
    } catch (e) {
      console.error("autoExpireReservations error:", e);
    }
  },

  onTabChange(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ activeTab: tab });
  },

  async onCancel(e) {
    const { id } = e.currentTarget.dataset;
    const reservation = this.data.todayReservations.find(r => r._id === id);
    if (!reservation) return;

    wx.showModal({
      title: "确认取消",
      content: `确定要取消座位 ${reservation.seatNo} 的预约吗？`,
      success: async (modal) => {
        if (modal.confirm) {
          wx.showLoading({ title: "取消中..." });
          try {
            const result = await wx.cloud.callFunction({
              name: "cancelReservation",
              data: { openid: this.data.openid, reservationId: id }
            });
            wx.hideLoading();
            if (result.result.success) {
              wx.showToast({ title: "已取消", icon: "success" });
              await this.loadReservations();
            } else {
              wx.showToast({ title: result.result.message || "取消失败", icon: "none" });
            }
          } catch (e) {
            wx.hideLoading();
            wx.showToast({ title: "取消失败", icon: "none" });
          }
        }
      }
    });
  },

  async onCheckIn() {
    const pendingRes = this.data.todayReservations.filter(r => r.statusLabel === "待签到");

    if (pendingRes.length === 0) {
      wx.showToast({ title: "暂无待签到预约", icon: "none" });
      return;
    }

    wx.showModal({
      title: "扫码签到",
      content: "请扫描图书馆签到二维码完成签到",
      confirmText: "扫描",
      success: (modal) => {
        if (modal.confirm) {
          this.scanQRCode();
        }
      }
    });
  },

  scanQRCode() {
    wx.scanCode({
      onlyFromCamera: true,
      success: (res) => {
        if (res.result === CHECKIN_QR_CONTENT || res.result.includes("library_checkin")) {
          const pendingRes = this.data.todayReservations.filter(r => r.statusLabel === "待签到");
          if (pendingRes.length > 0) {
            this.doCheckIn(pendingRes[0]._id);
          } else {
            wx.showToast({ title: "暂无待签到预约", icon: "none" });
          }
        } else {
          wx.showToast({ title: "无效的签到码", icon: "none" });
        }
      },
      fail: () => {
        wx.showToast({ title: "扫码失败", icon: "none" });
      }
    });
  },

  async onCardCheckIn(e) {
    const reservationId = e.currentTarget.dataset.id;
    const reservation = this.data.todayReservations.find(r => r._id === reservationId);
    if (!reservation) return;
    
    wx.showModal({
      title: "确认签到",
      content: `确定要签到座位 ${reservation.floor}楼 ${reservation.seatNo} 吗？`,
      success: (modal) => {
        if (modal.confirm) {
          this.doCheckIn(reservationId);
        }
      }
    });
  },

  async onEndUse(e) {
    const reservationId = e.currentTarget.dataset.id;
    const reservation = this.data.todayReservations.find(r => r._id === reservationId);
    if (!reservation) return;

    wx.showModal({
      title: "确认结束",
      content: `确定要结束座位 ${reservation.floor}楼 ${reservation.seatNo} 的使用吗？`,
      success: async (modal) => {
        if (modal.confirm) {
          wx.showLoading({ title: "处理中..." });
          try {
            const result = await wx.cloud.callFunction({
              name: "endReservation",
              data: {
                openid: this.data.openid,
                reservationId: reservationId
              }
            });
            wx.hideLoading();
            if (result.result && result.result.success) {
              wx.showToast({ title: "已结束使用", icon: "success" });
              await this.loadReservations();
            } else {
              wx.showToast({ title: result.result?.message || "操作失败", icon: "none" });
            }
          } catch (err) {
            wx.hideLoading();
            console.error("endReservation error:", err);
            wx.showToast({ title: "操作失败", icon: "none" });
          }
        }
      }
    });
  },

  async doCheckIn(reservationId) {
    if (!this.data.openid) {
      wx.showToast({ title: "用户未登录", icon: "none" });
      return;
    }
    wx.showLoading({ title: "签到中..." });
    try {
      const result = await wx.cloud.callFunction({
        name: "checkIn",
        data: {
          openid: this.data.openid,
          reservationId: reservationId,
          action: "checkin"
        }
      });

      wx.hideLoading();
      if (result.result.success) {
        wx.showModal({
          title: "签到成功",
          content: result.result.message,
          showCancel: false
        });
        await this.loadReservations();
      } else {
        wx.showModal({
          title: "签到失败",
          content: result.result.message,
          showCancel: false
        });
      }
    } catch (e) {
      wx.hideLoading();
      wx.showModal({
        title: "签到失败",
        content: "网络错误，请重试",
        showCancel: false
      });
    }
  }
});
