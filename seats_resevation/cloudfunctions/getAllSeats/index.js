const cloud = require("wx-server-sdk");
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  try {
    let allSeats = [];
    let skip = 0;
    const limit = 100;
    
    while (true) {
      const res = await db.collection("seats")
        .skip(skip)
        .limit(limit)
        .get();
      
      allSeats = allSeats.concat(res.data);
      
      if (res.data.length < limit) {
        break;
      }
      skip += limit;
    }
    
    return {
      success: true,
      data: allSeats,
      total: allSeats.length
    };
  } catch (e) {
    return { success: false, message: e.message };
  }
};