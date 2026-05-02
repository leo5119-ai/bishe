const cloud = require("wx-server-sdk");
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  const { seatId, status } = event;

  if (!seatId || !status) {
    return { success: false, message: "参数不完整" };
  }

  try {
    const res = await db.collection("seats")
      .where({ _id: seatId })
      .update({
        data: {
          status: status,
          lastUpdate: Date.now()
        }
      });

    return {
      success: true,
      updated: res.updated,
      message: `已更新为${status === 'maintenance' ? '维护' : '空闲'}状态`
    };
  } catch (e) {
    return { success: false, message: e.message };
  }
};