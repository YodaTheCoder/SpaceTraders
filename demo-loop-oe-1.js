const trades = {
  purchases: {},
  sales: {},
};

const ship = "ship-id-here";

const leg1 = {
  ship,
  source: "OE-PM",
  sell: null,
  buy: "SHIP_PLATING",
  destination: "OE-PM-TR",
  trades,
  fuel: 4,
};

const leg2 = {
  ship,
  source: "OE-PM-TR",
  sell: "SHIP_PLATING",
  buy: null,
  destination: "OE-PM",
  trades,
  fuel: 4,
};

export const Mission = [leg1, leg2];
