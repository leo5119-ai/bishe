const cloud = require("wx-server-sdk");
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

const CREDIT_REWARD_CHECKIN = 10;
const CREDIT_PENALTY_LATE = 10;
const LATE_THRESHOLD_MINUTES = 15;

exports.main = async (event, context) => {
  const { openid, reservationId, action } = event;

  if (!openid || !reservationId) {
    return { success: false, message: "参数不完整" };
  }

  if (action !== "checkin") {
    return { success: false, message: "无效的操作" };
  }

  try {
    const resQuery = await db.collection("reservations").where({
      _id: reservationId,
      userOpenid: openid
    }).get();

    if (!resQuery.data.length) {
      return { success: false, message: "预约记录不存在" };
    }

    const reservation = resQuery.data[0];

    if (reservation.status === "checked") {
      return { success: false, message: "已完成签到，无需重复签到" };
    }

    if (reservation.status !== "pending") {
      return { success: false, message: `当前状态(${reservation.status})不允许签到` };
    }

    const now = new Date();
    const beijingOffset = 8 * 60;
    const utcMinutes = now.getHours() * 60 + now.getMinutes();
    const currentMinutes = (utcMinutes + beijingOffset) % (24 * 60);

    const [sh, sm] = reservation.startTime.split(":").map(Number);
    const startMinutes = sh * 60 + sm;
    const lateMinutes = currentMinutes - startMinutes;

    let creditChange = CREDIT_REWARD_CHECKIN;
    let newStatus = "checked";

    if (lateMinutes > LATE_THRESHOLD_MINUTES) {
      newStatus = "expired";
      creditChange = -CREDIT_PENALTY_LATE;
    }

    await db.collection("reservations").where({ _id: reservationId }).update({
      data: {
        status: newStatus,
        checkinTime: now.toISOString(),
        creditChange: creditChange
      }
    });

    const userQuery = await db.collection("users").where({ openid: openid }).get();

    if (userQuery.data.length) {
      const user = userQuery.data[0];
      const newCredit = Math.max(0, Math.min(100, user.credit + creditChange));
      await db.collection("users").where({ openid: openid }).update({
        data: { credit: newCredit }
      });
    }

    return {
      success: true,
      status: newStatus,
      creditChange: creditChange,
      message: newStatus === "checked"
        ? `签到成功 +${CREDIT_REWARD_CHECKIN}分`
        : `迟到超过${LATE_THRESHOLD_MINUTES}分钟，预约已失效 -${CREDIT_PENALTY_LATE}分`
    };
  } catch (e) {
    return { success: false, message: e.message || "签到失败" };
  }
};