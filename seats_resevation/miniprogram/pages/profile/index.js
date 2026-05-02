const cloud = require("../../envList").CLOUD_ENV;

Page({
  data: {
    openid: "",
    userInfo: null,
    isAdmin: false,
    credit: 100,
    weekReservationCount: 0,
    monthReservationCount: 0,
    totalReservationCount: 0,
    consecutiveDays: 0,
    showNicknameEditor: false,
    showRules: false,
    showHelp: false,
    nickname: "",
    editNickname: ""
  },

  onLoad() {
    this.initCloud();
  },

  onShow() {
    if (this.data.openid) {
      this.loadUserInfo();
    }
  },

  async initCloud() {
    wx.cloud.init({ env: cloud });
    const res = await wx.cloud.callFunction({ name: "getOpenId" });
    this.setData({ openid: res.result.openid });
    await this.loadUserInfo();
  },

  async loadUserInfo() {
    const db = wx.cloud.database();
    const openid = this.data.openid;

    const userRes = await db.collection("users").where({ openid }).get();
    if (userRes.data.length > 0) {
      const user = userRes.data[0];
      this.setData({
        userInfo: user,
        isAdmin: user.role === "admin",
        credit: user.credit || 100,
        nickname: user.nickName || "新读者"
      });
    } else {
      this.setData({
        nickname: "新读者"
      });
    }

    await this.loadStatistics();
  },

  async loadStatistics() {
    const db = wx.cloud.database();
    const openid = this.data.openid;
    const now = new Date();

    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    const weekStart = `${startOfWeek.getFullYear()}-${String(startOfWeek.getMonth() + 1).padStart(2, "0")}-${String(startOfWeek.getDate()).padStart(2, "0")}`;

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthStart = `${startOfMonth.getFullYear()}-${String(startOfMonth.getMonth() + 1).padStart(2, "0")}-${String(startOfMonth.getDate()).padStart(2, "0")}`;

    const [weekRes, monthRes, totalRes, consecutiveRes] = await Promise.all([
      db.collection("reservations")
        .where({
          userOpenid: openid,
          date: db.command.gte(weekStart),
          status: db.command.in(["pending", "checked", "expired"])
        })
        .count(),
      db.collection("reservations")
        .where({
          userOpenid: openid,
          date: db.command.gte(monthStart),
          status: db.command.in(["pending", "checked", "expired"])
        })
        .count(),
      db.collection("reservations")
        .where({
          userOpenid: openid,
          status: db.command.in(["checked"])
        })
        .count(),
      db.collection("reservations")
        .where({
          userOpenid: openid,
          status: "checked"
        })
        .orderBy("checkinTime", "desc")
        .limit(30)
        .get()
    ]);

    let consecutiveDays = 0;
    if (consecutiveRes.data.length > 0) {
      const checkinDates = consecutiveRes.data
        .map(r => r.date)
        .filter(d => d);
      const uniqueDates = [...new Set(checkinDates)].sort().reverse();

      let count = 0;
      const now = new Date();
      const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
      let checkDate = today;

      for (let i = 0; i < uniqueDates.length; i++) {
        if (uniqueDates[i] === checkDate) {
          count++;
          const d = new Date(checkDate);
          d.setDate(d.getDate() - 1);
          checkDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        } else {
          break;
        }
      }
      consecutiveDays = count;
    }

    this.setData({
      weekReservationCount: weekRes.total,
      monthReservationCount: monthRes.total,
      totalReservationCount: totalRes.total,
      consecutiveDays
    });
  },

  onEditNickname() {
    this.setData({ 
      showNicknameEditor: true,
      editNickname: this.data.nickname || ""
    });
  },

  onNicknameInput(e) {
    this.setData({ editNickname: e.detail.value });
  },

  async onSaveNickname() {
    const { openid, editNickname } = this.data;
    if (!editNickname || editNickname.trim().length === 0) {
      wx.showToast({ title: "昵称不能为空", icon: "none" });
      return;
    }

    wx.showLoading({ title: "保存中..." });
    try {
      const db = wx.cloud.database();
      await db.collection("users")
        .where({ openid })
        .update({
          data: { nickName: editNickname.trim() }
        });

      this.setData({ 
        showNicknameEditor: false,
        nickname: editNickname.trim()
      });
      wx.showToast({ title: "保存成功", icon: "success" });
    } catch (e) {
      wx.showToast({ title: "保存失败", icon: "none" });
    } finally {
      wx.hideLoading();
    }
  },

  onCancelEdit() {
    this.setData({ showNicknameEditor: false });
  },

  onShowRules() {
    this.setData({ showRules: true });
  },

  onCloseRules() {
    this.setData({ showRules: false });
  },

  onShowHelp() {
    this.setData({ showHelp: true });
  },

  onCloseHelp() {
    this.setData({ showHelp: false });
  },

  onGoToAdmin() {
    wx.navigateTo({ url: "/pages/admin/index" });
  },

  onLogout() {
    wx.showModal({
      title: "退出登录",
      content: "确定要退出登录吗？",
      success: (res) => {
        if (res.confirm) {
          wx.clearStorageSync();
          wx.reLaunch({ url: "/pages/login/login" });
        }
      }
    });
  }
});