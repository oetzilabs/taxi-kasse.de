import { Companies } from "./companies";
import { Users } from "./users";
import { Vehicles } from "./vehicles";

process.on("unhandledRejection", (reason, p) => {
  console.error("Unhandled Rejection at: Promise", p, "reason:", reason);
});

const main = async () => {
  console.log("Importing vehicle brands and models, this might take a while...");
  const brands_vehicles = await Vehicles.importVehicleBrands();
  console.log(`${brands_vehicles.length} brands and models imported`);

  console.log("Creating admin user and company");
  const adminUserExists = await Users.findByEmail("admin@taxikassede.de");
  if (!adminUserExists) {
    const adminUser = await Users.create({
      email: "admin@taxikassede.de",
      role: "admin",
      verifiedAt: new Date(),
      name: "Admin",
    });
    console.log("Admin user created");
    const adminCompanyExists = await Companies.findByName("Taxi Kasse");

    if (!adminCompanyExists) {
      const adminCompany = await Companies.create({
        email: "admin@taxikassede.de",
        ownerId: adminUser!.id,
        name: "Taxi Kasse",
        phoneNumber: "123456789",
        website: "https://taxi-kasse.de",
        base_charge: 0,
        distance_charge: 0,
        time_charge: 0,
        uid: "",
      });
      console.log("Admin company created");
    }
  }

  console.log("Creating test user and company");
  const testUserExists = await Users.findByEmail("test@taxikassede.de");

  if (!testUserExists) {
    const testUser = await Users.create({
      email: "test@taxikassede.de",
      role: "member",
      verifiedAt: new Date(),
      name: "Test",
    });
    console.log("Test user created");
    const testCompanyExists = await Companies.findByName("Test Company");
    if (!testCompanyExists) {
      const testCompany = await Companies.create({
        email: "test@taxikassede.de",
        ownerId: testUser!.id,
        name: "Test Company",
        phoneNumber: "123456789",
        website: "https://test.taxi-kasse.de",
        base_charge: 0,
        distance_charge: 0,
        time_charge: 0,
        uid: "",
      });
      console.log("Test company created");
    }
  }

  process.exit(0);
};

await main();
