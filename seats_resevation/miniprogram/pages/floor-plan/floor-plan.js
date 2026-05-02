const cloud = require("../../envList").CLOUD_ENV;

const FLOOR_DATA = {
  1: {
    name: "1楼 - 自习室",
    tables: [
      { id: 1, x: 30, y: 50, width: 100, height: 25, label: "书架" },
      { id: 2, x: 30, y: 90, width: 100, height: 25, label: "书架" },
      { id: 3, x: 30, y: 130, width: 100, height: 25, label: "书架" },
      { id: 4, x: 30, y: 170, width: 100, height: 25, label: "书架" },
      { id: 5, x: 30, y: 210, width: 100, height: 25, label: "书架" },
      { id: 6, x: 30, y: 250, width: 100, height: 25, label: "书架" },
      { id: 7, x: 180, y: 65, width: 100, height: 15 },
      { id: 8, x: 180, y: 120, width: 100, height: 15 },
      { id: 9, x: 180, y: 175, width: 100, height: 15 },
      { id: 10, x: 180, y: 230, width: 100, height: 15 },
    ],
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
    tables: [
      { id: 1, x: 60, y: 50, width: 120, height: 15 },
      { id: 2, x: 60, y: 110, width: 120, height: 15 },
      { id: 3, x: 60, y: 170, width: 120, height: 15 },
      { id: 4, x: 60, y: 230, width: 120, height: 15 },
      { id: 5, x: 200, y: 50, width: 120, height: 15 },
      { id: 6, x: 200, y: 110, width: 120, height: 15 },
      { id: 7, x: 200, y: 170, width: 120, height: 15 },
      { id: 8, x: 200, y: 230, width: 120, height: 15 },
    ],
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
    tables: [
      { id: 1, x: 50, y: 50, width: 120, height: 15 },
      { id: 2, x: 50, y: 120, width: 120, height: 15 },
      { id: 3, x: 50, y: 190, width: 120, height: 15 },
      { id: 4, x: 50, y: 260, width: 120, height: 15 },
      { id: 5, x: 200, y: 50, width: 120, height: 15 },
      { id: 6, x: 200, y: 120, width: 120, height: 15 },
      { id: 7, x: 200, y: 190, width: 120, height: 15 },
      { id: 8, x: 200, y: 260, width: 120, height: 15 },
    ],
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

Page({
  data: {
    floor: 1,
    floorName: "",
    tables: [],
    currentSeats: [],
    occupiedIds: [],
    myReservedIds: [],
    maintenanceIds: [],
    selectedSeatId: "",
    selectedSeatStatus: "",
    openid: ""
  },

  onLoad(options) {
    const floor = parseInt(options.floor) || 1;
    const floorData = FLOOR_DATA[floor];
    this.setData({
      floor,
      floorName: floorData.name,
      tables: floorData.tables || []
    });
    this.initCloud();
  },

  async initCloud() {
    wx.cloud.init({ env: cloud });
    const res = await wx.cloud.callFunction({ name: "getOpenId" });
    this.setData({ openid: res.result.openid });
    await wx.cloud.callFunction({ name: "autoExpireReservations" });
    await this.initSeats();
    await this.loadReservations();
  },

  async initSeats() {
    const db = wx.cloud.database();
    const floor = this.data.floor;
    const floorConfig = FLOOR_DATA[floor];

    const existingSeats = await db.collection("seats").where({ floor }).count();

    if (existingSeats.total < floorConfig.seats.length) {
      wx.showLoading({ title: "初始化座位..." });
      
      const seatsToAdd = floorConfig.seats.map(seat => ({
        floor,
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
        try {
          await db.collection("seats").add({ data: seat });
        } catch (e) {
          console.error("添加座位失败:", seat.seatId, e);
        }
      }
      
      wx.hideLoading();
    }

    const baseSeats = floorConfig.seats.map(s => ({ ...s, seatStatus: "available" }));
    this.setData({ currentSeats: baseSeats, maintenanceIds: [] });
  },

  async loadReservations() {
    const db = wx.cloud.database();
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    const floor = this.data.floor;

    const seatsRes = await wx.cloud.callFunction({ name: "getAllSeats" });
    const allSeats = seatsRes.result.data || [];
    const floorSeats = allSeats.filter(s => s.floor === floor);
    const maintenanceIds = floorSeats.filter(s => s.status === "maintenance").map(s => s.seatId);
    const seatIds = floorSeats.map(s => s.seatId);

    if (seatIds.length === 0) return;

    const myRes = await db.collection("reservations")
      .where({
        userOpenid: this.data.openid,
        date: today,
        status: db.command.in(["pending", "checked"]),
        seatId: db.command.in(seatIds)
      })
      .get();

    const myReservedIds = myRes.data.map(r => r.seatId);

    const occupiedRes = await db.collection("reservations")
      .where({
        date: today,
        status: db.command.in(["pending", "checked"]),
        seatId: db.command.in(seatIds)
      })
      .field({ seatId: true })
      .get();

    const occupiedIds = occupiedRes.data.map(r => r.seatId);

    this.setData({ myReservedIds, occupiedIds, maintenanceIds });
    this.updateSeatStatuses();
  },

  updateSeatStatuses() {
    const { currentSeats, occupiedIds, myReservedIds, maintenanceIds } = this.data;
    const updatedSeats = currentSeats.map(seat => {
      let seatStatus = "available";
      if (maintenanceIds.includes(seat.id)) {
        seatStatus = "maintenance";
      } else if (myReservedIds.includes(seat.id)) {
        seatStatus = "mine";
      } else if (occupiedIds.includes(seat.id)) {
        seatStatus = "occupied";
      }
      return { ...seat, seatStatus };
    });
    this.setData({ currentSeats: updatedSeats });
  },

  onSeatTap(e) {
    const { id, status } = e.currentTarget.dataset;

    if (status === "occupied") {
      wx.showModal({
        title: "座位已占用",
        content: `座位 ${id} 已被预约`,
        showCancel: false
      });
      return;
    }

    if (status === "mine") {
      wx.navigateTo({
        url: `/pages/myReservations/index?highlight=${id}`
      });
      return;
    }

    if (status === "maintenance") {
      wx.showModal({
        title: "座位维护中",
        content: `座位 ${id} 正在维护，暂时无法预约`,
        showCancel: false
      });
      return;
    }

    wx.navigateTo({
      url: `/pages/reservation-detail/reservation-detail?seatId=${id}&floor=${this.data.floor}`
    });
  },

  onShow() {
    if (this.data.openid) {
      this.setData({
        selectedSeatId: "",
        selectedSeatStatus: ""
      });
      this.loadReservations();
    }
  },

  goToReserve() {
    const { selectedSeatId, floor } = this.data;
    if (selectedSeatId) {
      wx.navigateTo({
        url: `/pages/reservation-detail/reservation-detail?seatId=${selectedSeatId}&floor=${floor}`
      });
    }
  }
});
