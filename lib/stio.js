import axios from "axios";

const printShipStatus = (ship) => {
  const { manufacturer, id, location, cargo } = ship;
  const clazz = ship["class"];
  console.log(`-\t${manufacturer} ${clazz} (${id}) @ ${location}`);
  cargo.forEach(listCargo);
};

const listCargo = (cargo) => {
  const { good, quantity, totalVolume } = cargo;
  const volume = quantity !== totalVolume ? ` - volume ${totalVolume}` : "";
  console.log(`\t- ${good}: ${quantity} units${volume}`);
};

const getMaxQuantityForHold = (ship, material) => {
  if (material.volumePerUnit === 0) return 9999999999;
  return parseInt(Math.floor(ship.spaceAvailable / material.volumePerUnit), 10);
};

const getMaxQuantityForCredits = (credits, material) => {
  return parseInt(Math.floor(credits / material.pricePerUnit));
};

export class SpaceTraders {
  username = null;
  token = null;
  credits = 0;
  ships = [];
  loans = [];

  constructor(username, token) {
    this.username = username;
    this.token = token;
    this.axios = axios;

    this.axios = axios.create({
      baseURL: "https://api.spacetraders.io",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async getStatus(print) {
    const response = await this.axios.get(`/users/${this.username}`);
    const { credits, ships, loans } = response.data.user;
    this.credits = credits;
    this.ships = ships;
    this.loans = loans;

    if (!print) return;

    console.log(`\n\nStatus Report for ${this.username}:\n--------------`);
    console.log(`- Credits: ${this.credits.toLocaleString("en-GB")}`);

    if (this.ships.length > 0) {
      console.log(`- Ships:`);
      this.ships.forEach(printShipStatus);
    }
  }

  getShip(shipId) {
    return this.ships.find((s) => s.id === shipId);
  }

  getShips() {
    return this.ships.map((s) => s.id);
  }

  getShipLocation(shipId) {
    const ship = this.getShip(shipId);
    return ship.location;
  }

  getShipsAtLocation(location) {
    const shipsAtLocation = this.ships.filter((s) => s.location === location);
    return shipsAtLocation.map((s) => s.id);
  }

  async checkFuelLevel(shipId) {
    await this.getStatus(false);
    const fuelLevel = this.checkCargoQuantity(shipId, "FUEL");
    return fuelLevel;
  }

  checkCargoQuantity(shipId, material) {
    const ship = this.getShip(shipId);
    if (!ship) return null;
    const { cargo } = ship;
    const stuff = cargo.find((c) => c.good === material);
    if (!stuff) return 0;
    return stuff.quantity;
  }

  async fillHold(shipId, material) {
    try {
      const ship = this.getShip(shipId);
      const marketMaterial = await this.getMarketMaterial(
        ship.location,
        material
      );

      const maxQuantityForHold = getMaxQuantityForHold(ship, marketMaterial);
      if (maxQuantityForHold <= 0)
        return { good: material, quantity: 0, pricePerUnit: 0, total: 0 };

      const maxQuantityForCredits = getMaxQuantityForCredits(
        this.credits,
        marketMaterial
      );

      let purchaseQuantity = Math.min(
        maxQuantityForHold,
        maxQuantityForCredits
      );

      if (purchaseQuantity === 0)
        return { good: material, quantity: 0, pricePerUnit: 0, total: 0 };

      purchaseQuantity = Math.min(
        purchaseQuantity,
        marketMaterial.quantityAvailable
      );

      const purchase = await this.buyGoods(shipId, material, purchaseQuantity);
      console.log(purchase);
      return purchase;
    } catch (e) {
      console.error(e.message);
      process.exit;
    }
  }

  async getMarket(location) {
    const response = await this.axios.get(
      `/game/locations/${location}/marketplace`
    );
    const marketplace = response.data.location.marketplace;
    return marketplace;
  }

  async getMarketMaterial(location, material) {
    const market = await this.getMarket(location);
    const good = market.find((g) => g.symbol === material);
    return good;
  }

  async fuelShip(shipId, quantity) {
    await this.buyGoods(shipId, "FUEL", quantity);
    return await this.checkFuelLevel(shipId);
  }

  async buyGoods(shipId, good, quantity) {
    const data = {
      shipId,
      good,
      quantity,
    };
    const response = await this.axios.post(
      `/users/${this.username}/purchase-orders`,
      data
    );
    const order = response.data.order;
    await this.getStatus(false);
    return order;
  }

  async sellGoods(shipId, good, quantity) {
    const response = await this.axios.post(
      `/users/${this.username}/sell-orders`,
      {
        shipId,
        good,
        quantity,
      }
    );
    const order = response.data.order;
    await this.getStatus(false);
    return order;
  }

  async fileFlightPlan(shipId, destination) {
    const response = await this.axios.post(
      `/users/${this.username}/flight-plans`,
      {
        shipId,
        destination,
      }
    );
    return response.data.flightPlan;
  }
}
