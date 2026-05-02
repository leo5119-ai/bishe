const cloud = require("wx-server-sdk");
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

exports.main = async (event, context) => {
  const { code } = event;

  if (!code) {
    return { success: false, message: "code不能为空" };
  }

  try {
    const wxContext = cloud.getWXContext();
    const openid = wxContext.OPENID;

    return {
      success: true,
      openid: openid,
      appid: wxContext.APPID
    };
  } catch (e) {
    return { success: false, message: e.message || "登录失败" };
  }
};