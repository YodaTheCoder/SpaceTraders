import { SpaceTraders } from "./lib/stio.js";
const { ST_USERNAME, ST_TOKEN } = process.env;

console.log(`== Space Traders - Ship Mover ==`);

const STIO = new SpaceTraders(ST_USERNAME, ST_TOKEN);

if (process.argv.length !== 4) {
  console.log(`Usage: node send-ship <ship id> <location>`);
  process.exit(0);
}

const ship = process.argv[2];
const destination = process.argv[3];

const flightPlan = await STIO.fileFlightPlan(ship, destination);
console.log(
  `Flight plan ${flightPlan.id} filed, ETA ${flightPlan.timeRemainingInSeconds}`
);
setTimeout(() => {
  console.log(`${ship} arrived at ${destination}`);
}, (flightPlan.timeRemainingInSeconds + 1) * 1000);
