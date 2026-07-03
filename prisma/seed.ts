import bcrypt from "bcryptjs";
import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

async function upsertUser(input: {
  name: string;
  email: string;
  phone: string;
  role: Role;
  password: string;
}) {
  const passwordHash = await bcrypt.hash(input.password, 10);

  return prisma.user.upsert({
    where: { email: input.email },
    update: {
      name: input.name,
      phone: input.phone,
      role: input.role,
      passwordHash,
      emailVerified: new Date(),
      isActive: true,
    },
    create: {
      name: input.name,
      email: input.email,
      phone: input.phone,
      role: input.role,
      passwordHash,
      emailVerified: new Date(),
    },
  });
}

// 50 Major Indian Cities with coordinate markers
const majorCities = [
  { name: "Mumbai", state: "Maharashtra", stateIso: "MH", lat: 19.0760, lng: 72.8777, agentName: "Eren Yeager", agentEmail: "agent.mumbai@lastmile.test" },
  { name: "Delhi", state: "Delhi", stateIso: "DL", lat: 28.6139, lng: 77.2090, agentName: "Luffy", agentEmail: "agent.delhi@lastmile.test" },
  { name: "Bengaluru", state: "Karnataka", stateIso: "KA", lat: 12.9716, lng: 77.5946 },
  { name: "Hyderabad", state: "Telangana", stateIso: "TG", lat: 17.3850, lng: 78.4867 },
  { name: "Ahmedabad", state: "Gujarat", stateIso: "GJ", lat: 23.0225, lng: 72.5714 },
  { name: "Chennai", state: "Tamil Nadu", stateIso: "TN", lat: 13.0827, lng: 80.2707 },
  { name: "Kolkata", state: "West Bengal", stateIso: "WB", lat: 22.5726, lng: 88.3639 },
  { name: "Surat", state: "Gujarat", stateIso: "GJ", lat: 21.1702, lng: 72.8311 },
  { name: "Pune", state: "Maharashtra", stateIso: "MH", lat: 18.5204, lng: 73.8567 },
  { name: "Jaipur", state: "Rajasthan", stateIso: "RJ", lat: 26.9124, lng: 75.7873 },
  { name: "Lucknow", state: "Uttar Pradesh", stateIso: "UP", lat: 26.8467, lng: 80.9462 },
  { name: "Kanpur", state: "Uttar Pradesh", stateIso: "UP", lat: 26.4499, lng: 80.3319 },
  { name: "Nagpur", state: "Maharashtra", stateIso: "MH", lat: 21.1458, lng: 79.0882 },
  { name: "Indore", state: "Madhya Pradesh", stateIso: "MP", lat: 22.7196, lng: 75.8577 },
  { name: "Thane", state: "Maharashtra", stateIso: "MH", lat: 19.2183, lng: 72.9781 },
  { name: "Bhopal", state: "Madhya Pradesh", stateIso: "MP", lat: 23.2599, lng: 77.4126 },
  { name: "Visakhapatnam", state: "Andhra Pradesh", stateIso: "AP", lat: 17.6868, lng: 83.2185 },
  { name: "Patna", state: "Bihar", stateIso: "BR", lat: 25.5941, lng: 85.1376 },
  { name: "Vadodara", state: "Gujarat", stateIso: "GJ", lat: 22.3072, lng: 73.1812 },
  { name: "Ghaziabad", state: "Uttar Pradesh", stateIso: "UP", lat: 28.6692, lng: 77.4538 },
  { name: "Ludhiana", state: "Punjab", stateIso: "PB", lat: 30.9010, lng: 75.8573 },
  { name: "Agra", state: "Uttar Pradesh", stateIso: "UP", lat: 27.1767, lng: 78.0081 },
  { name: "Nashik", state: "Maharashtra", stateIso: "MH", lat: 19.9975, lng: 73.7898 },
  { name: "Faridabad", state: "Haryana", stateIso: "HR", lat: 28.4089, lng: 77.3178 },
  { name: "Meerut", state: "Uttar Pradesh", stateIso: "UP", lat: 28.9845, lng: 77.7064 },
  { name: "Rajkot", state: "Gujarat", stateIso: "GJ", lat: 22.3039, lng: 70.8022 },
  { name: "Kalyan-Dombivli", state: "Maharashtra", stateIso: "MH", lat: 19.2354, lng: 73.1291 },
  { name: "Vasai-Virar", state: "Maharashtra", stateIso: "MH", lat: 19.3919, lng: 72.8397 },
  { name: "Varanasi", state: "Uttar Pradesh", stateIso: "UP", lat: 25.3176, lng: 82.9739 },
  { name: "Srinagar", state: "Jammu and Kashmir", stateIso: "JK", lat: 34.0837, lng: 74.7973 },
  { name: "Aurangabad", state: "Maharashtra", stateIso: "MH", lat: 19.8762, lng: 75.3433 },
  { name: "Dhanbad", state: "Jharkhand", stateIso: "JH", lat: 23.7957, lng: 86.4304 },
  { name: "Amritsar", state: "Punjab", stateIso: "PB", lat: 31.6340, lng: 74.8723 },
  { name: "Navi Mumbai", state: "Maharashtra", stateIso: "MH", lat: 19.0330, lng: 73.0297 },
  { name: "Prayagraj", state: "Uttar Pradesh", stateIso: "UP", lat: 25.4358, lng: 81.8463 },
  { name: "Howrah", state: "West Bengal", stateIso: "WB", lat: 22.5958, lng: 88.2636 },
  { name: "Gwalior", state: "Madhya Pradesh", stateIso: "MP", lat: 26.2183, lng: 78.1828 },
  { name: "Jabalpur", state: "Madhya Pradesh", stateIso: "MP", lat: 22.1702, lng: 79.9322 },
  { name: "Coimbatore", state: "Tamil Nadu", stateIso: "TN", lat: 11.0168, lng: 76.9558 },
  { name: "Vijayawada", state: "Andhra Pradesh", stateIso: "AP", lat: 16.5062, lng: 80.6480 },
  { name: "Jodhpur", state: "Rajasthan", stateIso: "RJ", lat: 26.2389, lng: 73.0243 },
  { name: "Madurai", state: "Tamil Nadu", stateIso: "TN", lat: 9.9252, lng: 78.1198 },
  { name: "Raipur", state: "Chhattisgarh", stateIso: "CG", lat: 21.2514, lng: 81.6296 },
  { name: "Kota", state: "Rajasthan", stateIso: "RJ", lat: 25.2138, lng: 75.8648 },
  { name: "Guwahati", state: "Assam", stateIso: "AS", lat: 26.1158, lng: 91.7086 },
  { name: "Chandigarh", state: "Punjab", stateIso: "PB", lat: 30.7333, lng: 76.7794 },
  { name: "Solapur", state: "Maharashtra", stateIso: "MH", lat: 17.6599, lng: 75.9064 },
  { name: "Hubli-Dharwad", state: "Karnataka", stateIso: "KA", lat: 15.3647, lng: 75.1240 },
  { name: "Bareilly", state: "Uttar Pradesh", stateIso: "UP", lat: 28.3640, lng: 78.4126 },
  { name: "Mysore", state: "Karnataka", stateIso: "KA", lat: 12.2958, lng: 76.6394 }
];

async function main() {
  // 1. Seed Core Administrative Roles
  const admin = await upsertUser({
    name: "Abhinav",
    email: "admin@lastmile.test",
    phone: "+919999000001",
    role: "ADMIN",
    password: "Admin@12345",
  });
  const manager = await upsertUser({
    name: "Rishi",
    email: "manager@lastmile.test",
    phone: "+919999000002",
    role: "MANAGER",
    password: "Manager@12345",
  });
  const customer = await upsertUser({
    name: "Zoro",
    email: "customer@lastmile.test",
    phone: "+919999000005",
    role: "CUSTOMER",
    password: "Customer@12345",
  });
  await upsertUser({
    name: "Nami",
    email: "customer.two@lastmile.test",
    phone: "+919999000006",
    role: "CUSTOMER",
    password: "Customer@12345",
  });

  // 2. Countries
  const india = await prisma.country.upsert({
    where: { isoCode: "IN" },
    update: { name: "India" },
    create: { name: "India", isoCode: "IN" },
  });
  const usa = await prisma.country.upsert({
    where: { isoCode: "US" },
    update: { name: "United States" },
    create: { name: "United States", isoCode: "US" },
  });

  // USA Specific data for international delivery tests
  const newYorkState = await prisma.state.upsert({
    where: { countryId_isoCode: { countryId: usa.id, isoCode: "NY" } },
    update: { name: "New York" },
    create: { name: "New York", isoCode: "NY", countryId: usa.id },
  });
  const newYork = await prisma.city.upsert({
    where: { countryId_name: { countryId: usa.id, name: "New York" } },
    update: { stateId: newYorkState.id },
    create: { name: "New York", countryId: usa.id, stateId: newYorkState.id },
  });
  const newYorkCentral = await prisma.zone.upsert({
    where: { code: "NYC-CENTRAL" },
    update: { name: "New York Central", cityId: newYork.id },
    create: { name: "New York Central", code: "NYC-CENTRAL", cityId: newYork.id },
  });
  const manhattan = await prisma.area.upsert({
    where: { cityId_name: { cityId: newYork.id, name: "Manhattan" } },
    update: { zoneId: newYorkCentral.id, pincode: "10001" },
    create: {
      name: "Manhattan",
      pincode: "10001",
      latitude: 40.7831,
      longitude: -73.9712,
      cityId: newYork.id,
      zoneId: newYorkCentral.id,
    },
  });

  // 3. Seed 50 Indian Cities and create local Agents/Stations
  console.log("Seeding 50 major cities and agents...");
  
  let delhiCentralId = "";
  let delhiSouthId = "";
  let connaughtPlaceAreaId = "";
  let saketAreaId = "";
  let agentOneUserId = "";

  for (let i = 0; i < majorCities.length; i++) {
    const cityData = majorCities[i];
    
    // Create/get State
    const stateObj = await prisma.state.upsert({
      where: { countryId_isoCode: { countryId: india.id, isoCode: cityData.stateIso } },
      update: { name: cityData.state },
      create: { name: cityData.state, isoCode: cityData.stateIso, countryId: india.id },
    });

    // Create/get City
    const cityObj = await prisma.city.upsert({
      where: { countryId_name: { countryId: india.id, name: cityData.name } },
      update: { stateId: stateObj.id },
      create: { name: cityData.name, countryId: india.id, stateId: stateObj.id },
    });

    // Create/get Central Zone
    const zoneCode = `${cityData.name.toUpperCase().replace(/[^A-Z]/g, "")}-CENTRAL`;
    const zoneObj = await prisma.zone.upsert({
      where: { code: zoneCode },
      update: { name: `${cityData.name} Central`, cityId: cityObj.id },
      create: { name: `${cityData.name} Central`, code: zoneCode, cityId: cityObj.id },
    });

    // Store Delhi zones for demo order
    if (cityData.name === "Delhi") {
      delhiCentralId = zoneObj.id;
      // also create DEL-SOUTH
      const southZone = await prisma.zone.upsert({
        where: { code: "DEL-SOUTH" },
        update: { name: "Delhi South", cityId: cityObj.id },
        create: { name: "Delhi South", code: "DEL-SOUTH", cityId: cityObj.id },
      });
      delhiSouthId = southZone.id;
    }

    // Create central Area (Delivery point) for each city
    const areaObj = await prisma.area.upsert({
      where: { cityId_name: { cityId: cityObj.id, name: `${cityData.name} Central` } },
      update: { zoneId: zoneObj.id, latitude: cityData.lat, longitude: cityData.lng },
      create: {
        name: `${cityData.name} Central`,
        latitude: cityData.lat,
        longitude: cityData.lng,
        cityId: cityObj.id,
        zoneId: zoneObj.id,
      },
    });

    // Add specific sub-areas for Delhi/Mumbai demo orders
    if (cityData.name === "Delhi") {
      const cp = await prisma.area.upsert({
        where: { cityId_name: { cityId: cityObj.id, name: "Connaught Place" } },
        update: { zoneId: delhiCentralId },
        create: {
          name: "Connaught Place",
          pincode: "110001",
          latitude: 28.6315,
          longitude: 77.2167,
          cityId: cityObj.id,
          zoneId: delhiCentralId,
        },
      });
      connaughtPlaceAreaId = cp.id;

      const sk = await prisma.area.upsert({
        where: { cityId_name: { cityId: cityObj.id, name: "Saket" } },
        update: { zoneId: delhiSouthId },
        create: {
          name: "Saket",
          pincode: "110017",
          latitude: 28.5245,
          longitude: 77.2066,
          cityId: cityObj.id,
          zoneId: delhiSouthId,
        },
      });
      saketAreaId = sk.id;
    }

    if (cityData.name === "Mumbai") {
      await prisma.area.upsert({
        where: { cityId_name: { cityId: cityObj.id, name: "Andheri West" } },
        update: { zoneId: zoneObj.id },
        create: {
          name: "Andheri West",
          pincode: "400053",
          latitude: 19.1363,
          longitude: 72.8277,
          cityId: cityObj.id,
          zoneId: zoneObj.id,
        },
      });
    }

    // Create Agent User Account
    const formattedEmail = cityData.agentEmail || `agent.${cityData.name.toLowerCase().replace(/[^a-z0-9]/g, "")}@lastmile.test`;
    const finalAgentName = cityData.agentName || `${cityData.name} Agent`;
    const agentUser = await upsertUser({
      name: finalAgentName,
      email: formattedEmail,
      phone: `+919999100${String(i).padStart(3, "0")}`,
      role: "AGENT",
      password: "Agent@12345",
    });

    if (cityData.name === "Delhi") {
      agentOneUserId = agentUser.id;
    }

    // Create Agent Profile
    const empCode = `AG-${cityData.name.toUpperCase().replace(/[^A-Z]/g, "").substring(0, 3)}-001`;
    const profile = await prisma.agentProfile.upsert({
      where: { userId: agentUser.id },
      update: {
        availability: "AVAILABLE",
        currentLatitude: cityData.lat,
        currentLongitude: cityData.lng,
      },
      create: {
        userId: agentUser.id,
        employeeCode: empCode,
        availability: "AVAILABLE",
        currentLatitude: cityData.lat,
        currentLongitude: cityData.lng,
      },
    });

    // Link Agent to Zone
    await prisma.zoneAgent.upsert({
      where: {
        zoneId_agentProfileId: {
          zoneId: zoneObj.id,
          agentProfileId: profile.id,
        },
      },
      update: {},
      create: { zoneId: zoneObj.id, agentProfileId: profile.id },
    });
  }

  // 4. Rate Cards
  const rateCards = [
    ["B2C Intra-zone", "B2C", "INTRA_ZONE", 42, 80],
    ["B2C Inter-zone", "B2C", "INTER_ZONE", 68, 120],
    ["B2B Intra-zone", "B2B", "INTRA_ZONE", 35, 150],
    ["B2B Inter-zone", "B2B", "INTER_ZONE", 55, 180],
  ] as const;

  for (const [name, orderType, routeType, pricePerKg, minimumCharge] of rateCards) {
    await prisma.rateCard.upsert({
      where: { orderType_routeType_name: { orderType, routeType, name } },
      update: { pricePerKg, minimumCharge, isActive: true },
      create: { name, orderType, routeType, pricePerKg, minimumCharge },
    });
  }

  // 5. International Rates
  const internationalRates = [
    ["India to United States B2C", "IN", "US", "B2C", 900, 2500],
    ["India to United States B2B", "IN", "US", "B2B", 760, 5000],
    ["United States to India B2C", "US", "IN", "B2C", 1100, 3000],
    ["United States to India B2B", "US", "IN", "B2B", 920, 5500],
  ] as const;
  for (const [
    name,
    originCountryCode,
    destinationCountryCode,
    orderType,
    pricePerKg,
    minimumCharge,
  ] of internationalRates) {
    await prisma.internationalRateCard.upsert({
      where: {
        originCountryCode_destinationCountryCode_orderType: {
          originCountryCode,
          destinationCountryCode,
          orderType,
        },
      },
      update: { name, pricePerKg, minimumCharge, isActive: true },
      create: {
        name,
        originCountryCode,
        destinationCountryCode,
        orderType,
        pricePerKg,
        minimumCharge,
      },
    });
  }

  // 6. COD Surcharges
  await prisma.codSurcharge.upsert({
    where: { orderType: "B2C" },
    update: { amount: 35, isActive: true },
    create: { orderType: "B2C", amount: 35 },
  });
  await prisma.codSurcharge.upsert({
    where: { orderType: "B2B" },
    update: { amount: 65, isActive: true },
    create: { orderType: "B2B", amount: 65 },
  });

  // 7. Demo Order (Delhi Central to Delhi South, assigned to Luffy)
  const demoOrder = await prisma.order.findUnique({
    where: { orderNumber: "LM-DEMO-001" },
  });
  if (!demoOrder && connaughtPlaceAreaId && saketAreaId && agentOneUserId && delhiCentralId && delhiSouthId) {
    const pickupAddress = await prisma.address.create({
      data: {
        label: "Demo pickup",
        line1: "14 Barakhamba Road",
        contactName: "Zoro",
        contactPhone: customer.phone!,
        userId: customer.id,
        areaId: connaughtPlaceAreaId,
        latitude: 28.6315,
        longitude: 77.2167,
      },
    });
    const dropAddress = await prisma.address.create({
      data: {
        label: "Demo drop",
        line1: "Select Citywalk service entrance",
        contactName: "Sanji",
        contactPhone: "+919999000099",
        userId: customer.id,
        areaId: saketAreaId,
        latitude: 28.5245,
        longitude: 77.2066,
      },
    });
    const order = await prisma.order.create({
      data: {
        orderNumber: "LM-DEMO-001",
        customerId: customer.id,
        createdById: customer.id,
        assignedAgentId: agentOneUserId,
        pickupAddressId: pickupAddress.id,
        dropAddressId: dropAddress.id,
        pickupZoneId: delhiCentralId,
        dropZoneId: delhiSouthId,
        orderType: "B2C",
        paymentType: "COD",
        paymentStatus: "NOT_REQUIRED",
        status: "ASSIGNED",
        lengthCm: 30,
        breadthCm: 20,
        heightCm: 15,
        actualWeightKg: 2,
        volumetricWeightKg: 1.8,
        billableWeightKg: 2,
        routeType: "INTER_ZONE",
        baseCharge: 136,
        codSurcharge: 35,
        totalCharge: 171,
        rateCardSnapshot: { seed: true, rateName: "B2C Inter-zone" },
      },
    });
    await prisma.trackingEvent.createMany({
      data: [
        {
          orderId: order.id,
          status: "CONFIRMED",
          note: "Demo COD order confirmed",
          actorId: customer.id,
          actorRole: "CUSTOMER",
        },
        {
          orderId: order.id,
          status: "ASSIGNED",
          note: "Assigned to Delhi field agent",
          actorId: manager.id,
          actorRole: "MANAGER",
        },
      ],
    });
  }

  console.log("Seeding process completed!");
  console.log("Registered Accounts:");
  console.log("- Admin: admin@lastmile.test / Admin@12345");
  console.log("- Manager: manager@lastmile.test / Manager@12345");
  console.log("- Customer: customer@lastmile.test / Customer@12345");
  console.log("- 50 Agents seeded: agent.<city_name>@lastmile.test / Agent@12345");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
