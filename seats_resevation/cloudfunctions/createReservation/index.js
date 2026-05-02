const cloud = require("wx-server-sdk");
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

const OPEN_HOUR = 8;
const CLOSE_HOUR = 22;
const MAX_DURATION_MINUTES = 180;
const MIN_GRANULARITY_MINUTES = 10;

exports.main = async (event, context) => {
  const { openid } = event;
  const { seatId, floor, date, startTime, endTime, duration } = event.reservation;

  if (!openid || !seatId || !date || !startTime || !endTime) {
    return { success: false, message: "参数不完整" };
  }

  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);
  const startMinutes = sh * 60 + sm;
  const endMinutes = eh * 60 + em;

  if (startMinutes >= endMinutes) {
    return { success: false, message: "结束时间必须晚于开始时间" };
  }

  const durationMinutes = endMinutes - startMinutes;
  if (durationMinutes % MIN_GRANULARITY_MINUTES !== 0) {
    return { success: false, message: "预约时间必须为10分钟的倍数" };
  }

  if (durationMinutes > MAX_DURATION_MINUTES) {
    return { success: false, message: "单次预约最长3小时" };
  }

  if (startMinutes < OPEN_HOUR * 60 || endMinutes > 24 * 60) {
    return { success: false, message: `预约时间必须在${OPEN_HOUR}:00之后` };
  }

  const now = new Date();
  const [nowH, nowM] = [now.getHours(), now.getMinutes()];
  const nowMinutes = nowH * 60 + nowM;
  const earliestBookable = Math.ceil(nowMinutes / MIN_GRANULARITY_MINUTES) * MIN_GRANULARITY_MINUTES;

  if (startMinutes < earliestBookable) {
    return { success: false, message: "不能预约过去的时间" };
  }

  try {
    const seatQuery = await db.collection("seats").where({ seatId: seatId, floor: floor }).get();

    if (!seatQuery.data.length) {
      return { success: false, message: "座位不存在" };
    }

    const seat = seatQuery.data[0];
    if (seat.status === "maintenance") {
      return { success: false, message: "该座位正在维护中" };
    }

    const conflictQuery = await db.collection("reservations").where({
      seatId: seatId,
      date: date,
      status: _.in(["pending", "checked"])
    }).get();

    for (const res of conflictQuery.data) {
      const [rs, re] = [res.startTime, res.endTime].map(t => {
        const [h, m] = t.split(":").map(Number);
        return h * 60 + m;
      });
      if (!(endMinutes <= rs || startMinutes >= re)) {
        return { success: false, message: `该时间段已被预约 (${res.startTime}-${res.endTime})` };
      }
    }

    const userQuery = await db.collection("users").where({ openid: openid }).get();
    if (!userQuery.data.length) {
      return { success: false, message: "用户不存在" };
    }

    const user = userQuery.data[0];
    if (user.credit < 20) {
      return { success: false, message: "信用分不足20分，无法预约" };
    }

    const userConflictQuery = await db.collection("reservations").where({
      userOpenid: openid,
      date: date,
      status: _.in(["pending", "checked"])
    }).get();

    for (const res of userConflictQuery.data) {
      const [rs, re] = [res.startTime, res.endTime].map(t => {
        const [h, m] = t.split(":").map(Number);
        return h * 60 + m;
      });
      if (!(endMinutes <= rs || startMinutes >= re)) {
        return { success: false, message: "您在同一时段已有预约" };
      }
    }

    const addRes = await db.collection("reservations").add({
      data: {
        userOpenid: openid,
        seatId: seatId,
        floor: floor,
        date: date,
        startTime: startTime,
        endTime: endTime,
        duration: durationMinutes,
        status: "pending",
        createTime: Date.now()
      }
    });

    return { success: true, reservationId: addRes._id };
  } catch (e) {
    return { success: false, message: e.message || "预约失败" };
  }
};