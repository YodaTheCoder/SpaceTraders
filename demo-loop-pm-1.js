const trades = {
  purchases: {},
  sales: {},
};

const ship = "ckmg6w915145214715s6ue87lvlr";

const leg1 = {
  ship,
  source: "OE-PM",
  sell: "METALS",
  buy: "WORKERS",
  destination: "OE-PM-TR",
  trades,
  fuel: 4,
};

const leg2 = {
  ship,
  source: "OE-PM-TR",
  sell: "WORKERS",
  buy: "METALS",
  destination: "OE-PM",
  trades,
  fuel: 4,
};

export const Mission = [leg1, leg2];
