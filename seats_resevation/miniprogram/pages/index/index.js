const cloud = require("../../envList").CLOUD_ENV;

Page({
  data: {
    openid: "",
    isAdmin: false,
    loading: true,
    bannerImages: [
       "/images/test1.jpg",
       "/images/test3.jpg"
    ],
    floors: [
      { id: 1, name: "1楼", desc: "入口阅读区（协作型）", icon: "📚", color: "#4CAF50" },
      { id: 2, name: "2楼", desc: "安静自习区（单人）", icon: "📖", color: "#2196F3" },
      { id: 3, name: "3楼", desc: "多媒体学习区", icon: "💻", color: "#FF9800" }
    ],
    todayStats: {
      totalReservations: 0,
      availableSeats: 0,
      occupiedRate: "0%"
    }
  },

  onLoad() {
    this.initCloud();
  },

  onShow() {
  },

  async initCloud() {
    wx.cloud.init({ env: cloud });
    try {
      const res = await wx.cloud.callFunction({ name: "getOpenId" });
      const openid = res.result.openid;
      this.setData({ openid });
      await this.ensureUser(openid);
      await this.checkAdmin(openid);
      await wx.cloud.callFunction({ name: "autoExpireReservations" });
      await this.loadTodayStats();
      this.setData({ loading: false });
    } catch (e) {
      console.error("initCloud error:", e);
      this.setData({ loading: false });
    }
  },

  async ensureUser(openid) {
    const db = wx.cloud.database();
    const userRes = await db.collection("users").where({ openid }).get();
    if (userRes.data.length === 0) {
      await db.collection("users").add({
        data: {
          openid,
          nickName: "新读者",
          role: "user",
          credit: 100,
          createTime: Date.now()
        }
      });
    }
  },

  async checkAdmin(openid) {
    const db = wx.cloud.database();
    const userRes = await db.collection("users").where({ openid }).get();
    if (userRes.data.length > 0) {
      this.setData({ isAdmin: userRes.data[0].role === "admin" });
    }
  },

  async loadTodayStats() {
    const db = wx.cloud.database();
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const today = `${year}-${month}-${day}`;
    
    try {
      const seatsRes = await wx.cloud.callFunction({ name: "getAllSeats" });
      const allSeats = seatsRes.result.data || [];
      
      const maintenanceCount = allSeats.filter(s => s.status === "maintenance").length;
      
      const reservationRes = await db.collection("reservations")
        .where({
          date: today,
          status: db.command.in(["pending", "checked"])
        })
        .count();
      
      const available = allSeats.length - reservationRes.total - maintenanceCount;
      const rate = allSeats.length > 0 ? Math.round((reservationRes.total / allSeats.length) * 100) : 0;
      
      this.setData({
        todayStats: {
          totalReservations: reservationRes.total,
          availableSeats: Math.max(0, available),
          occupiedRate: rate + "%"
        }
      });
    } catch (e) {
      console.error("loadTodayStats error:", e);
    }
  },

  goToFloorPlan(e) {
    const floor = e.currentTarget.dataset.floor;
    wx.navigateTo({
      url: `/pages/floor-plan/floor-plan?floor=${floor}`
    });
  },

  goToMyReservations() {
    wx.switchTab({ url: "/pages/myReservations/index" });
  },

  goToProfile() {
    wx.switchTab({ url: "/pages/profile/index" });
  },

  goToAdmin() {
    wx.navigateTo({ url: "/pages/admin/index" });
  }
});