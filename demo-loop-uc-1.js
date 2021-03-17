const trades = {
  purchases: {},
  sales: {},
};

const ship = "ship-id-here";

const leg1 = {
  ship,
  source: "OE-UC",
  sell: null,
  buy: "ELECTRONICS",
  destination: "OE-UC-AD",
  trades,
  fuel: 5,
};

const leg2 = {
  ship,
  source: "OE-UC-AD",
  sell: "ELECTRONICS",
  buy: null,
  destination: "OE-UC",
  trades,
  fuel: 5,
};

export const Mission = [leg1, leg2];
