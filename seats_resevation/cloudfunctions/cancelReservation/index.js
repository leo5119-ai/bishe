const cloud = require("wx-server-sdk");
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  const { openid, reservationId } = event;

  if (!openid || !reservationId) {
    return { success: false, message: "参数不完整" };
  }

  try {
    const res = await db.collection("reservations")
      .where({ _id: reservationId, userOpenid: openid })
      .get();

    if (!res.data.length) {
      return { success: false, message: "预约记录不存在" };
    }

    const reservation = res.data[0];
    if (reservation.status !== "pending") {
      return { success: false, message: "该预约无法取消" };
    }

    const now = new Date();
    const [sh, sm] = reservation.startTime.split(":").map(Number);
    const startMinutes = sh * 60 + sm;
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    if (startMinutes <= nowMinutes) {
      return { success: false, message: "预约已开始，无法取消" };
    }

    await db.collection("reservations")
      .where({ _id: reservationId })
      .update({ data: { status: "cancelled" } });

    return { success: true };
  } catch (e) {
    return { success: false, message: e.message || "取消失败" };
  }
};