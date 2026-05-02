const cloud = require("wx-server-sdk");
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  const { date } = event;
  const today = date || new Date().toISOString().split("T")[0].replace(/-/g, "");
  const checkinCode = `library_checkin_${today}`;

  try {
    const existing = await db.collection("checkinCodes").where({ date: today }).get();
    
    if (existing.data.length > 0) {
      return {
        success: true,
        code: existing.data[0].code,
        url: existing.data[0].url,
        message: "今日签到码已存在"
      };
    }

    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(checkinCode)}`;

    await db.collection("checkinCodes").add({
      data: {
        code: checkinCode,
        url: qrUrl,
        date: today,
        createTime: Date.now()
      }
    });

    return {
      success: true,
      code: checkinCode,
      url: qrUrl
    };
  } catch (e) {
    return { success: false, message: e.message || "生成失败" };
  }
};