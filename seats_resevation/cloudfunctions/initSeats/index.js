const cloud = require("wx-server-sdk");
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

const FLOOR_DATA = {
  1: {
    name: "1楼 - 自习室",
    seats: [
      { id: "A01", x: 190, y: 47 }, { id: "A02", x: 216, y: 47 }, { id: "A03", x: 242, y: 47 }, { id: "A04", x: 268, y: 47 },
      { id: "A05", x: 190, y: 88 }, { id: "A06", x: 216, y: 88 }, { id: "A07", x: 242, y: 88 }, { id: "A08", x: 268, y: 88 },
      { id: "A09", x: 190, y: 102 }, { id: "A10", x: 216, y: 102 }, { id: "A11", x: 242, y: 102 }, { id: "A12", x: 268, y: 102 },
      { id: "A13", x: 190, y: 143 }, { id: "A14", x: 216, y: 143 }, { id: "A15", x: 242, y: 143 }, { id: "A16", x: 268, y: 143 },
      { id: "A17", x: 190, y: 157 }, { id: "A18", x: 216, y: 157 }, { id: "A19", x: 242, y: 157 }, { id: "A20", x: 268, y: 157 },
      { id: "A21", x: 190, y: 198 }, { id: "A22", x: 216, y: 198 }, { id: "A23", x: 242, y: 198 }, { id: "A24", x: 268, y: 198 },
      { id: "A25", x: 190, y: 212 }, { id: "A26", x: 216, y: 212 }, { id: "A27", x: 242, y: 212 }, { id: "A28", x: 268, y: 212 },
      { id: "A29", x: 190, y: 253 }, { id: "A30", x: 216, y: 253 }, { id: "A31", x: 242, y: 253 }, { id: "A32", x: 268, y: 253 },
    ]
  },
  2: {
    name: "2楼 - 自习室",
    seats: [
      { id: "B01", x: 70, y: 35 }, { id: "B02", x: 100, y: 35 }, { id: "B03", x: 130, y: 35 }, { id: "B04", x: 160, y: 35 },
      { id: "B05", x: 70, y: 72 }, { id: "B06", x: 100, y: 72 }, { id: "B07", x: 130, y: 72 }, { id: "B08", x: 160, y: 72 },
      { id: "B09", x: 70, y: 95 }, { id: "B10", x: 100, y: 95 }, { id: "B11", x: 130, y: 95 }, { id: "B12", x: 160, y: 95 },
      { id: "B13", x: 70, y: 132 }, { id: "B14", x: 100, y: 132 }, { id: "B15", x: 130, y: 132 }, { id: "B16", x: 160, y: 132 },
      { id: "B17", x: 70, y: 155 }, { id: "B18", x: 100, y: 155 }, { id: "B19", x: 130, y: 155 }, { id: "B20", x: 160, y: 155 },
      { id: "B21", x: 70, y: 192 }, { id: "B22", x: 100, y: 192 }, { id: "B23", x: 130, y: 192 }, { id: "B24", x: 160, y: 192 },
      { id: "B25", x: 70, y: 215 }, { id: "B26", x: 100, y: 215 }, { id: "B27", x: 130, y: 215 }, { id: "B28", x: 160, y: 215 },
      { id: "B29", x: 70, y: 252 }, { id: "B30", x: 100, y: 252 }, { id: "B31", x: 130, y: 252 }, { id: "B32", x: 160, y: 252 },
      { id: "B33", x: 210, y: 35 }, { id: "B34", x: 240, y: 35 }, { id: "B35", x: 270, y: 35 }, { id: "B36", x: 300, y: 35 },
      { id: "B37", x: 210, y: 72 }, { id: "B38", x: 240, y: 72 }, { id: "B39", x: 270, y: 72 }, { id: "B40", x: 300, y: 72 },
      { id: "B41", x: 210, y: 95 }, { id: "B42", x: 240, y: 95 }, { id: "B43", x: 270, y: 95 }, { id: "B44", x: 300, y: 95 },
      { id: "B45", x: 210, y: 132 }, { id: "B46", x: 240, y: 132 }, { id: "B47", x: 270, y: 132 }, { id: "B48", x: 300, y: 132 },
      { id: "B49", x: 210, y: 155 }, { id: "B50", x: 240, y: 155 }, { id: "B51", x: 270, y: 155 }, { id: "B52", x: 300, y: 155 },
      { id: "B53", x: 210, y: 192 }, { id: "B54", x: 240, y: 192 }, { id: "B55", x: 270, y: 192 }, { id: "B56", x: 300, y: 192 },
      { id: "B57", x: 210, y: 215 }, { id: "B58", x: 240, y: 215 }, { id: "B59", x: 270, y: 215 }, { id: "B60", x: 300, y: 215 },
      { id: "B61", x: 210, y: 252 }, { id: "B62", x: 240, y: 252 }, { id: "B63", x: 270, y: 252 }, { id: "B64", x: 300, y: 252 },
    ]
  },
  3: {
    name: "3楼 - 自习室",
    seats: [
      { id: "C01", x: 60, y: 35 }, { id: "C02", x: 90, y: 35 }, { id: "C03", x: 120, y: 35 }, { id: "C04", x: 150, y: 35 },
      { id: "C05", x: 60, y: 72 }, { id: "C06", x: 90, y: 72 }, { id: "C07", x: 120, y: 72 }, { id: "C08", x: 150, y: 72 },
      { id: "C09", x: 60, y: 95 }, { id: "C10", x: 90, y: 95 }, { id: "C11", x: 120, y: 95 }, { id: "C12", x: 150, y: 95 },
      { id: "C13", x: 60, y: 142 }, { id: "C14", x: 90, y: 142 }, { id: "C15", x: 120, y: 142 }, { id: "C16", x: 150, y: 142 },
      { id: "C17", x: 60, y: 165 }, { id: "C18", x: 90, y: 165 }, { id: "C19", x: 120, y: 165 }, { id: "C20", x: 150, y: 165 },
      { id: "C21", x: 60, y: 212 }, { id: "C22", x: 90, y: 212 }, { id: "C23", x: 120, y: 212 }, { id: "C24", x: 150, y: 212 },
      { id: "C25", x: 60, y: 235 }, { id: "C26", x: 90, y: 235 }, { id: "C27", x: 120, y: 235 }, { id: "C28", x: 150, y: 235 },
      { id: "C29", x: 60, y: 282 }, { id: "C30", x: 90, y: 282 }, { id: "C31", x: 120, y: 282 }, { id: "C32", x: 150, y: 282 },
      { id: "C33", x: 210, y: 35 }, { id: "C34", x: 240, y: 35 }, { id: "C35", x: 270, y: 35 }, { id: "C36", x: 300, y: 35 },
      { id: "C37", x: 210, y: 72 }, { id: "C38", x: 240, y: 72 }, { id: "C39", x: 270, y: 72 }, { id: "C40", x: 300, y: 72 },
      { id: "C41", x: 210, y: 95 }, { id: "C42", x: 240, y: 95 }, { id: "C43", x: 270, y: 95 }, { id: "C44", x: 300, y: 95 },
      { id: "C45", x: 210, y: 142 }, { id: "C46", x: 240, y: 142 }, { id: "C47", x: 270, y: 142 }, { id: "C48", x: 300, y: 142 },
      { id: "C49", x: 210, y: 165 }, { id: "C50", x: 240, y: 165 }, { id: "C51", x: 270, y: 165 }, { id: "C52", x: 300, y: 165 },
      { id: "C53", x: 210, y: 212 }, { id: "C54", x: 240, y: 212 }, { id: "C55", x: 270, y: 212 }, { id: "C56", x: 300, y: 212 },
      { id: "C57", x: 210, y: 235 }, { id: "C58", x: 240, y: 235 }, { id: "C59", x: 270, y: 235 }, { id: "C60", x: 300, y: 235 },
      { id: "C61", x: 210, y: 282 }, { id: "C62", x: 240, y: 282 }, { id: "C63", x: 270, y: 282 }, { id: "C64", x: 300, y: 282 },
    ]
  }
};

exports.main = async (event, context) => {
  const { floor, reset } = event;

  try {
    const targetFloors = floor ? [parseInt(floor)] : [1, 2, 3];
    let totalAdded = 0;

    for (const f of targetFloors) {
      const floorConfig = FLOOR_DATA[f];
      if (!floorConfig) continue;

      if (reset === true) {
        await db.collection("seats").where({ floor: f }).remove();
      }

      const existingCount = await db.collection("seats").where({ floor: f }).count();

      if (existingCount.total < floorConfig.seats.length) {
        const seatsToAdd = floorConfig.seats.map(seat => ({
          floor: f,
          seatNo: seat.id,
          seatId: seat.id,
          x: seat.x,
          y: seat.y,
          type: "single",
          features: [],
          status: "available",
          lastUpdate: Date.now()
        }));

        for (const seat of seatsToAdd) {
          await db.collection("seats").add({ data: seat });
        }

        totalAdded += seatsToAdd.length;
      }
    }

    return {
      success: true,
      message: `成功初始化 ${totalAdded} 个座位`,
      total: totalAdded
    };
  } catch (e) {
    return { success: false, errMsg: e.message };
  }
};
