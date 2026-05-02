const cloud = require("wx-server-sdk");
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  const { openid, reservationId } = event;

  if (!openid || !reservationId) {
    return { success: false, message: "参数不完整" };
  }

  try {
    const res = await db.collection("reservations")
      .where({
        _id: reservationId,
        userOpenid: openid
      })
      .get();

    if (!res.data.length) {
      return { success: false, message: "预约记录不存在" };
    }

    const reservation = res.data[0];
    if (reservation.status !== "checked") {
      return { success: false, message: `当前状态(${reservation.status})不允许结束` };
    }

    const now = new Date();
    const endTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    const [sh, sm] = reservation.startTime.split(":").map(Number);
    const [eh, em] = endTime.split(":").map(Number);
    const actualDuration = (eh * 60 + em) - (sh * 60 + sm);

    await db.collection("reservations")
      .where({ _id: reservationId })
      .update({
        data: {
          status: "ended",
          endTime: endTime,
          actualDuration: actualDuration > 0 ? actualDuration : 0,
          endedAt: now.toISOString()
        }
      });

    return { success: true, message: "已结束使用", endTime, actualDuration };
  } catch (e) {
    console.error("endReservation error:", e);
    return { success: false, message: e.message || "操作失败" };
  }
};