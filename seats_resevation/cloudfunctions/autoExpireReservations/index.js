const cloud = require("wx-server-sdk");
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

const CREDIT_PENALTY_NO_SHOW = 10;

exports.main = async (event, context) => {
  try {
    const now = new Date();
    const beijingOffset = 8 * 60;
    const utcMinutes = now.getHours() * 60 + now.getMinutes();
    let currentMinutes = utcMinutes + beijingOffset;
    if (currentMinutes >= 24 * 60) {
      currentMinutes -= 24 * 60;
    }

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const today = `${year}-${month}-${day}`;

    const pendingRes = await db.collection("reservations")
      .where({
        date: today,
        status: "pending"
      })
      .get();

    let expiredCount = 0;

    for (const res of pendingRes.data) {
      const [sh, sm] = res.startTime.split(":").map(Number);
      const startMinutes = sh * 60 + sm;
      const [eh, em] = res.endTime.split(":").map(Number);
      const endMinutes = eh * 60 + em;

      if (currentMinutes > startMinutes + 15) {
        await db.collection("reservations").where({ _id: res._id }).update({
          data: {
            status: "expired",
            expireTime: now.toISOString(),
            creditChange: -CREDIT_PENALTY_NO_SHOW
          }
        });

        const userRes = await db.collection("users").where({ openid: res.userOpenid }).get();
        if (userRes.data.length > 0) {
          const user = userRes.data[0];
          const newCredit = Math.max(0, Math.min(100, user.credit - CREDIT_PENALTY_NO_SHOW));
          await db.collection("users").where({ openid: res.userOpenid }).update({
            data: { credit: newCredit }
          });
        }

        expiredCount++;
      }
    }

    const checkedRes = await db.collection("reservations")
      .where({
        date: today,
        status: "checked"
      })
      .get();

    let endedCount = 0;

    for (const res of checkedRes.data) {
      const [eh, em] = res.endTime.split(":").map(Number);
      const endMinutes = eh * 60 + em;

      if (currentMinutes > endMinutes) {
        await db.collection("reservations").where({ _id: res._id }).update({
          data: {
            status: "ended"
          }
        });
        endedCount++;
      }
    }

    return {
      success: true,
      expiredCount,
      endedCount,
      message: `自动过期 ${expiredCount} 条，标记 ${endedCount} 条已结束`
    };
  } catch (e) {
    return { success: false, message: e.message || "处理失败" };
  }
};