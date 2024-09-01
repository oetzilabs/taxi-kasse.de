// this is a seed file for the database
import { Vehicles } from "./vehicles";

process.on("unhandledRejection", (reason, p) => {
  console.error("Unhandled Rejection at: Promise", p, "reason:", reason);
});

const main = async () => {
  const brands_vehicles = await Vehicles.importVehicleBrands();

  console.log(`${brands_vehicles.length} brands and models imported`);

  process.exit(0)
};

await main();



