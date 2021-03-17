import { SpaceTraders } from "./lib/stio.js";
const { ST_USERNAME, ST_TOKEN } = process.env;

console.log(`== Space Traders - Market Comparison ==`);

const STIO = new SpaceTraders(ST_USERNAME, ST_TOKEN);
await STIO.getStatus(true);

const ships = STIO.getShips();
const marketMatrix = {};

for (let i = 0, l = ships.length; i < l; i++) {
  const location = STIO.getShipLocation(ships[i]);
  console.log(`Check location: ${location}`);
  const market = await STIO.getMarket(location);
  for (const key in market) {
    const good = { ...market[key], location };
    const { symbol } = good;
    delete good.symbol;
    const matrixGood = marketMatrix[symbol] || [];
    matrixGood.push(good);
    marketMatrix[symbol] = matrixGood;
  }
}

const assessGood = (symbol, good) => {
  const sorted = good.sort((a, b) => {
    if (a.pricePerUnit > b.pricePerUnit) return 1;
    if (a.pricePerUnit < b.pricePerUnit) return -1;
    return 0;
  });
  const cheapest = sorted[0];
  const costliest = sorted[sorted.length - 1];
  const margin = costliest.pricePerUnit - cheapest.pricePerUnit;
  const { volumePerUnit } = cheapest;
  if (margin > 0) {
    const mpv = volumePerUnit > 0 ? margin / volumePerUnit : "not cargo";
    console.log(
      `Buy ${symbol} at ${cheapest.location} and sell at ${costliest.location} for profit of ${margin} per unit (mpv: ${mpv}).`
    );
  }
};

for (const key in marketMatrix) {
  const good = marketMatrix[key];
  if (good.length > 1) {
    assessGood(key, good);
  }
}
