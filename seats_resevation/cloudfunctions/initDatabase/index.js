const cloud = require("wx-server-sdk");
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  const collections = ["users", "seats", "reservations", "announcements"];
  const results = [];

  for (const collName of collections) {
    try {
      await db.createCollection(collName);
      results.push({ collection: collName, status: "created" });
    } catch (e) {
      if (e.message.includes("already exists")) {
        results.push({ collection: collName, status: "already exists" });
      } else {
        results.push({ collection: collName, status: "error", message: e.message });
      }
    }
  }

  try {
    await db.collection("users").add({
      data: {
        openid: "admin_test",
        nickName: "管理员测试",
        role: "admin",
        credit: 100,
        createTime: Date.now()
      }
    });
    results.push({ collection: "users", action: "admin user created" });
  } catch (e) {
  }

  return {
    success: true,
    results
  };
};