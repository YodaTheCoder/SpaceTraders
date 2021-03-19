import { SpaceTraders } from "./lib/stio.js";
const { ST_USERNAME, ST_TOKEN } = process.env;
const STIO = new SpaceTraders(ST_USERNAME, ST_TOKEN);

console.log(process.argv);

if (process.argv.length !== 3) {
  console.log(`Usage: node trade-loop.js <loop-file>`);
  process.exit(1);
}

let { Mission } = await import(process.argv[2]);

console.log(`== Space Traders - Trade Loop ==`);
await STIO.getStatus(true);

const fuelShip = async (ship, fuelNeeded) => {
  let fuelOnboard = await STIO.checkFuelLevel(ship);
  console.log(`Fuel on board: ${fuelOnboard}`);
  if (fuelOnboard < fuelNeeded) {
    const diff = fuelNeeded - fuelOnboard;
    console.log(`Refuelling +${diff}`);
    fuelOnboard = await STIO.fuelShip(ship, diff);
  }
};

const tradeTrip = async (missionLoop, step) => {
  const config = missionLoop[step];
  const nextStep = step + 1 === missionLoop.length ? 0 : step + 1;
  const { ship, source, sell, buy, destination, trades, fuel } = config;
  const { purchases } = trades;

  console.log(`\n== At ${source} prepping for ${destination} ==`);

  // sell existing cargo
  const cargoOnBoard = STIO.checkCargoQuantity(ship, sell);
  if (cargoOnBoard > 0) {
    const tripSale = await STIO.sellGoods(ship, sell, cargoOnBoard);
    console.log(
      `Sold: ${tripSale.quantity} ${tripSale.good} for ${tripSale.total} credits`
    );

    // log P/L
    if (purchases[sell]) {
      const purchasePrice = purchases[sell].price;
      const profit = tripSale.total - purchasePrice;
      console.log(`Profit: ${profit} credits`);

      if (profit < 0) {
        console.log(`Market moved and goods sold at a loss. Exiting.`);
        process.exit(0);
      }
    }
  }

  // refuel if necessary
  await fuelShip(ship, fuel);

  // buy new cargo
  if (buy) {
    const tripPurchase = await STIO.fillHold(ship, buy);
    console.log(
      `Purchased: ${tripPurchase.quantity} ${tripPurchase.good} for ${tripPurchase.total} credits`
    );

    // log the purchase price for P/L
    purchases[buy] = { price: tripPurchase.total };
  }

  // file flight plan for destination
  const flightPlan = await STIO.fileFlightPlan(ship, destination);
  console.log(
    `Flight plan ${flightPlan.id} filed, ETA ${flightPlan.timeRemainingInSeconds}`
  );

  // wait for arrival, move to next step
  setTimeout(() => {
    tradeTrip(missionLoop, nextStep);
  }, (flightPlan.timeRemainingInSeconds + 1) * 1000);
};

console.log(`\n\nMission Time!\n-------------\n`);
console.log(Mission);

tradeTrip(Mission, 0);
