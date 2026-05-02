const cloud = require("../../envList").CLOUD_ENV;

Page({
  data: {
    canUseGetUserProfile: false,
    nickname: "",
    loading: false
  },

  onLoad() {
    this.checkLoginStatus();
  },

  checkLoginStatus() {
    const canUse = wx.canIUse("getUserProfile");
    this.setData({ canUseGetUserProfile: canUse });
    
    const openid = wx.getStorageSync("openid");
    if (openid) {
      this.goToIndex();
    }
  },

  async handleLogin() {
    if (this.data.loading) return;
    this.setData({ loading: true });

    try {
      const loginRes = await wx.login().catch(() => null);
      if (!loginRes) {
        throw new Error("登录失败");
      }

      const code = loginRes.code;

      const cloudRes = await wx.cloud.callFunction({
        name: "login",
        data: { code }
      }).catch(e => {
        console.error("login cloud error:", e);
        return null;
      });

      if (cloudRes && cloudRes.result && cloudRes.result.openid) {
        const openid = cloudRes.result.openid;
        wx.setStorageSync("openid", openid);
        await this.ensureUserInfo(openid);
        wx.setStorageSync("loggedIn", true);
        this.goToIndex();
      } else {
        throw new Error("获取用户信息失败");
      }
    } catch (e) {
      wx.showToast({
        title: e.message || "登录失败",
        icon: "none"
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  async ensureUserInfo(openid) {
    const db = wx.cloud.database();
    const userRes = await db.collection("users").where({ openid }).get();
    
    if (userRes.data.length === 0) {
      let nickName = "读者";
      let avatarUrl = "";
      
      if (this.data.canUseGetUserProfile) {
        try {
          const profileRes = await wx.getUserProfile({
            desc: "用于完善用户资料"
          });
          nickName = profileRes.userInfo.nickName;
          avatarUrl = profileRes.userInfo.avatarUrl;
        } catch (e) {
        }
      }
      
      await db.collection("users").add({
        data: {
          openid,
          nickName,
          avatarUrl,
          role: "user",
          credit: 100,
          createTime: Date.now()
        }
      });
    }
  },

  goToIndex() {
    wx.reLaunch({ url: "/pages/index/index" });
  }
});