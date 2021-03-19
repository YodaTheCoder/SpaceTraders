# SpaceTraders

Requires node version 13.2 or higher.

A [Postman](https://www.postman.com/) collection and environment is included in this repo. Configure the environment value for `username`. Running the `Create Username` Postman script will store the generated `token` as an environment variable which will be used in all subsequent requests.

Use the `Get Startup Loan` (run the `View Account` script after getting the loan to store available credits in the environment). Then use te `Purchase Ship` to but 2 `JW-MK-I` at `OE-PM-TR`.

Fuel one of the ships using the Postman script, the ID of the ships are in the output of `View Account`.

The automated operations are controlled via NodeJS scripts.

Configure a .env file with the following data.

```
ST_USERNAME=<your username>
ST_TOKEN=<your token>
```

Use the `send-ship` script to move the fuelled ship to `OE-PM`.

`node -r dotenv/config send-ship.js <ship-id> OE-PM`

Once the ship has arrived at `OE-PM` the `compare-the-markets` script can be used to assess which goods to trade and in which direction.

`node -r dotenv/config compare-the-markets.js`

```
== Space Traders - Market Comparison ==


Status Report for readme-example:
--------------
- Credits: 11,996
- Ships:
-	Jackshaw MK-I (ckmg6w915145214715s6ue87lvlr) @ OE-PM
	- FUEL: 2 units
-	Jackshaw MK-I (ckmg6wa3z145239315s6da04i3va) @ OE-PM-TR
Check location: OE-PM
Check location: OE-PM-TR
Buy WORKERS at OE-PM and sell at OE-PM-TR for profit of 7 per unit (mpv: 3.5).
Buy METALS at OE-PM-TR and sell at OE-PM for profit of 2 per unit (mpv: 2).
Buy SHIP_PLATING at OE-PM and sell at OE-PM-TR for profit of 12 per unit (mpv: 6).
Buy SHIP_PARTS at OE-PM and sell at OE-PM-TR for profit of 38 per unit (mpv: 7.6).
```

Using the output of the compare script, configure `demo-loop-pm-1.js` (or a copy) with the appropriate data.

```
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
  buy: "METALS,
  destination: "OE-PM",
  trades,
  fuel: 4,
};

export const Mission = [leg1, leg2];
```

Run the trade loop script. The configured ship will continually run the legs of each journey selling and buying the goods and reporting the profits generated.

```
== Space Traders - Trade Loop ==


Status Report for readme-example:
--------------
- Credits: 11,996
- Ships:
-	Jackshaw MK-I (ckmg6w915145214715s6ue87lvlr) @ OE-PM
	- FUEL: 2 units
-	Jackshaw MK-I (ckmg6wa3z145239315s6da04i3va) @ OE-PM-TR


Mission Time!
-------------

[
  {
    ship: 'ckmg6w915145214715s6ue87lvlr',
    source: 'OE-PM',
    sell: 'METALS',
    buy: 'WORKERS',
    destination: 'OE-PM-TR',
    trades: { purchases: {}, sales: {} },
    fuel: 4
  },
  {
    ship: 'ckmg6w915145214715s6ue87lvlr',
    source: 'OE-PM-TR',
    sell: 'WORKERS',
    buy: 'METALS',
    destination: 'OE-PM',
    trades: { purchases: {}, sales: {} },
    fuel: 4
  }
]

== At OE-PM prepping for OE-PM-TR ==
Fuel on board: 2
Refuelling +2
{ good: 'WORKERS', quantity: 48, pricePerUnit: 23, total: 1104 }
Purchased: 48 WORKERS for 1104 credits
Flight plan ckmg7j1kf164793015s67gkosfgr filed, ETA 89

== At OE-PM-TR prepping for OE-PM ==
Sold: 48 WORKERS for 1440 credits
Profit: 336 credits
Fuel on board: 0
Refuelling +4
{ good: 'METALS', quantity: 96, pricePerUnit: 6, total: 576 }
Purchased: 96 METALS for 576 credits
Flight plan ckmg7l1y8166216415s6fdlkd3rg filed, ETA 89

== At OE-PM prepping for OE-PM-TR ==
Sold: 96 METALS for 768 credits
Profit: 192 credits
Fuel on board: 2
Refuelling +2
{ good: 'WORKERS', quantity: 48, pricePerUnit: 23, total: 1104 }
Purchased: 48 WORKERS for 1104 credits
Flight plan ckmg7n2bu167638015s6zs4oarmf filed, ETA 89
```

If a trade results in a loss the script will exit, this is to prevent continually making losing trades if the market values move.

Configure a second loop file for the other ship and run both simultaneously for additional income.
