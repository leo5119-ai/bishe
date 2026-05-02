const cloud = require("../../envList").CLOUD_ENV;

Page({
  data: {
    openid: "",
    isAdmin: false,
    activeTab: "seats",
    floors: [
      { text: "1楼", value: 1 },
      { text: "2楼", value: 2 },
      { text: "3楼", value: 3 }
    ],
    selectedFloor: 1,
    selectedFloorIndex: 0,
    seats: [],
    reservations: [],
    users: [],
    todayStats: {
      totalSeats: 0,
      occupied: 0,
      available: 0,
      maintenance: 0,
      reservationCount: 0
    },
    qrcodeUrl: "",
    showCreditEditor: false,
    editingUserId: "",
    editingCredit: 100
  },

  onLoad() {
    this.initCloud();
  },

  async initCloud() {
    wx.cloud.init({ env: cloud });
    const res = await wx.cloud.callFunction({ name: "getOpenId" });
    const openid = res.result.openid;
    this.setData({ openid });
    await this.checkAdmin(openid);
    if (this.data.isAdmin) {
      await this.loadData();
    }
  },

  async checkAdmin(openid) {
    const db = wx.cloud.database();
    const userRes = await db.collection("users").where({ openid }).get();
    if (userRes.data.length > 0 && userRes.data[0].role === "admin") {
      this.setData({ isAdmin: true });
    } else {
      wx.showModal({
        title: "无权限",
        content: "您不是管理员，无法访问后台",
        showCancel: false,
        success: () => {
          wx.navigateBack();
        }
      });
    }
  },

  async loadData() {
    await Promise.all([
      this.loadSeats(),
      this.loadStats(),
      this.loadUsers()
    ]);
  },

  async loadUsers() {
    const db = wx.cloud.database();
    const usersRes = await db.collection("users").get();
    this.setData({ users: usersRes.data });
  },

  onRefreshUsers() {
    this.loadUsers();
  },

  onAdjustCredit(e) {
    const { id, credit } = e.currentTarget.dataset;
    this.setData({
      showCreditEditor: true,
      editingUserId: id,
      editingCredit: credit || 100
    });
  },

  onCreditInput(e) {
    this.setData({ editingCredit: parseInt(e.detail.value) || 0 });
  },

  async onConfirmCredit() {
    const { editingUserId, editingCredit } = this.data;
    if (!editingUserId) return;

    wx.showLoading({ title: "更新中..." });
    try {
      const db = wx.cloud.database();
      await db.collection("users").where({ _id: editingUserId }).update({
        data: { credit: Math.max(0, Math.min(100, editingCredit)) }
      });
      wx.hideLoading();
      wx.showToast({ title: "更新成功", icon: "success" });
      this.setData({ showCreditEditor: false });
      await this.loadUsers();
    } catch (e) {
      wx.hideLoading();
      wx.showToast({ title: "更新失败", icon: "none" });
    }
  },

  onCancelCredit() {
    this.setData({ showCreditEditor: false });
  },

  async onToggleAdmin(e) {
    const { id, role } = e.currentTarget.dataset;
    const newRole = role === "admin" ? "user" : "admin";
    const action = newRole === "admin" ? "设为管理员" : "取消管理员";

    wx.showModal({
      title: "确认",
      content: `确定要${action}吗？`,
      success: async (modal) => {
        if (modal.confirm) {
          wx.showLoading({ title: "更新中..." });
          try {
            const db = wx.cloud.database();
            await db.collection("users").where({ _id: id }).update({
              data: { role: newRole }
            });
            wx.hideLoading();
            wx.showToast({ title: "更新成功", icon: "success" });
            await this.loadUsers();
          } catch (e) {
            wx.hideLoading();
            wx.showToast({ title: "更新失败", icon: "none" });
          }
        }
      }
    });
  },

  async loadSeats() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const today = `${year}-${month}-${day}`;
    const floor = this.data.selectedFloor;

    wx.showLoading({ title: "加载中..." });
    
    const res = await wx.cloud.callFunction({ name: "getAllSeats" });
    const allSeats = res.result.data || [];
    
    const filteredSeats = allSeats.filter(s => s.floor === floor);

    const db = wx.cloud.database();
    const occupiedRes = await db.collection("reservations")
      .where({
        date: today,
        status: db.command.in(["pending", "checked"])
      })
      .get();

    const occupiedSeatIds = occupiedRes.data.map(r => r.seatId);

    const seatsWithStatus = filteredSeats.map(seat => ({
      ...seat,
      isOccupied: occupiedSeatIds.includes(seat.seatId)
    }));

    this.setData({ seats: seatsWithStatus });
    
    wx.hideLoading();
  },

  async loadTodayReservations() {
    const db = wx.cloud.database();
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const today = `${year}-${month}-${day}`;

    await wx.cloud.callFunction({ name: "autoExpireReservations" });

    const reservationsRes = await db.collection("reservations")
      .where({
        date: today,
        status: db.command.in(["pending", "checked", "ended"])
      })
      .orderBy("createTime", "desc")
      .limit(50)
      .get();

    const seatIds = reservationsRes.data.map(r => r.seatId);
    let seatsMap = {};
    if (seatIds.length > 0) {
      const seats = await db.collection("seats")
        .where({ seatId: db.command.in([...new Set(seatIds)]) })
        .get();
      seatsMap = seats.data.reduce((acc, seat) => {
        acc[seat.seatId] = seat;
        return acc;
      }, {});
    }

    const reservations = reservationsRes.data.map(r => ({
      ...r,
      seatNo: seatsMap[r.seatId]?.seatNo || r.seatId,
      floor: seatsMap[r.seatId]?.floor || r.floor
    }));

    this.setData({ reservations });
  },

  async loadStats() {
    const db = wx.cloud.database();
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const today = `${year}-${month}-${day}`;

    const [seatsRes, reservationsRes] = await Promise.all([
      db.collection("seats").count(),
      db.collection("reservations")
        .where({
          date: today,
          status: db.command.in(["pending", "checked"])
        })
        .count()
    ]);

    const maintenanceRes = await db.collection("seats")
      .where({ status: "maintenance" })
      .count();

    const stats = {
      totalSeats: seatsRes.total,
      reservationCount: reservationsRes.total,
      occupied: reservationsRes.total,
      available: seatsRes.total - reservationsRes.total - maintenanceRes.total,
      maintenance: maintenanceRes.total
    };

    this.setData({ todayStats: stats });
  },

  onTabChange(e) {
    const tab = e.detail.name;
    this.setData({ activeTab: tab });
    if (tab === "seats") {
      this.loadSeats();
    } else if (tab === "users") {
      this.loadUsers();
    } else if (tab === "stats") {
      this.loadStats();
    }
  },

  onFloorChange(e) {
    const index = e.detail.value;
    const floor = index + 1;
    this.setData({ 
      selectedFloor: floor,
      selectedFloorIndex: index
    });
    this.loadSeats();
  },

  onSelectFloor(e) {
    const floor = parseInt(e.currentTarget.dataset.floor);
    this.setData({ selectedFloor: floor });
    this.loadSeats();
  },

  async onToggleMaintenance(e) {
    const { id, status } = e.currentTarget.dataset;
    const newStatus = status === "maintenance" ? "available" : "maintenance";

    wx.showLoading({ title: "更新中..." });
    try {
      const res = await wx.cloud.callFunction({
        name: "updateSeatStatus",
        data: { seatId: id, status: newStatus }
      });
      
      wx.hideLoading();
      if (res.result.success) {
        wx.showToast({ title: res.result.message, icon: "success" });
        await this.loadSeats();
        await this.loadStats();
      } else {
        wx.showToast({ title: res.result.message || "更新失败", icon: "none" });
      }
    } catch (e) {
      console.error("更新失败:", e);
      wx.hideLoading();
      wx.showToast({ title: "更新失败", icon: "none" });
    }
  },

  onRefreshData() {
    this.loadData();
  },

  async onInitDatabase() {
    wx.showLoading({ title: "初始化中..." });
    try {
      const res = await wx.cloud.callFunction({
        name: "initDatabase"
      });
      wx.hideLoading();
      if (res.result.success) {
        wx.showToast({ title: "集合创建成功", icon: "success" });
      } else {
        wx.showToast({ title: "初始化失败", icon: "none" });
      }
    } catch (e) {
      wx.hideLoading();
      wx.showToast({ title: "初始化失败", icon: "none" });
    }
  },

  async onInitSeats() {
    wx.showLoading({ title: "初始化中..." });
    try {
      const res = await wx.cloud.callFunction({
        name: "initSeats",
        data: { reset: true }
      });
      wx.hideLoading();
      if (res.result.success) {
        wx.showToast({ title: res.result.message, icon: "success" });
        this.loadData();
      } else {
        wx.showToast({ title: "初始化失败", icon: "none" });
      }
    } catch (e) {
      wx.hideLoading();
      wx.showToast({ title: "初始化失败", icon: "none" });
    }
  },

  async onGenerateQRCode() {
    wx.showLoading({ title: "生成中..." });
    try {
      const now = new Date();
      const today = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
      const result = await wx.cloud.callFunction({
        name: "generateCheckinCode",
        data: { date: today }
      });
      wx.hideLoading();
      if (result.result.success) {
        this.setData({ qrcodeUrl: result.result.url });
        wx.showToast({ title: "生成成功", icon: "success" });
      } else {
        wx.showToast({ title: "生成失败", icon: "none" });
      }
    } catch (e) {
      wx.hideLoading();
      wx.showToast({ title: "生成失败", icon: "none" });
    }
  }
});