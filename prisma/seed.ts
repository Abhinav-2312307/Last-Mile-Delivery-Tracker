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

async function main() {
  const admin = await upsertUser({
    name: "Aarav Admin",
    email: "admin@lastmile.test",
    phone: "+919999000001",
    role: "ADMIN",
    password: "Admin@12345",
  });
  const manager = await upsertUser({
    name: "Meera Manager",
    email: "manager@lastmile.test",
    phone: "+919999000002",
    role: "MANAGER",
    password: "Manager@12345",
  });
  const agentOne = await upsertUser({
    name: "Kabir Agent",
    email: "agent.delhi@lastmile.test",
    phone: "+919999000003",
    role: "AGENT",
    password: "Agent@12345",
  });
  const agentTwo = await upsertUser({
    name: "Sara Agent",
    email: "agent.mumbai@lastmile.test",
    phone: "+919999000004",
    role: "AGENT",
    password: "Agent@12345",
  });
  const customer = await upsertUser({
    name: "Riya Customer",
    email: "customer@lastmile.test",
    phone: "+919999000005",
    role: "CUSTOMER",
    password: "Customer@12345",
  });
  await upsertUser({
    name: "Arjun Customer",
    email: "customer.two@lastmile.test",
    phone: "+919999000006",
    role: "CUSTOMER",
    password: "Customer@12345",
  });

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

  const delhiState = await prisma.state.upsert({
    where: { countryId_isoCode: { countryId: india.id, isoCode: "DL" } },
    update: { name: "Delhi" },
    create: { name: "Delhi", isoCode: "DL", countryId: india.id },
  });
  const maharashtra = await prisma.state.upsert({
    where: { countryId_isoCode: { countryId: india.id, isoCode: "MH" } },
    update: { name: "Maharashtra" },
    create: { name: "Maharashtra", isoCode: "MH", countryId: india.id },
  });
  const newYorkState = await prisma.state.upsert({
    where: { countryId_isoCode: { countryId: usa.id, isoCode: "NY" } },
    update: { name: "New York" },
    create: { name: "New York", isoCode: "NY", countryId: usa.id },
  });

  const delhi = await prisma.city.upsert({
    where: { countryId_name: { countryId: india.id, name: "Delhi" } },
    update: { stateId: delhiState.id },
    create: { name: "Delhi", countryId: india.id, stateId: delhiState.id },
  });
  const mumbai = await prisma.city.upsert({
    where: { countryId_name: { countryId: india.id, name: "Mumbai" } },
    update: { stateId: maharashtra.id },
    create: { name: "Mumbai", countryId: india.id, stateId: maharashtra.id },
  });
  const newYork = await prisma.city.upsert({
    where: { countryId_name: { countryId: usa.id, name: "New York" } },
    update: { stateId: newYorkState.id },
    create: { name: "New York", countryId: usa.id, stateId: newYorkState.id },
  });

  const delhiCentral = await prisma.zone.upsert({
    where: { code: "DEL-CENTRAL" },
    update: { name: "Delhi Central", cityId: delhi.id },
    create: { name: "Delhi Central", code: "DEL-CENTRAL", cityId: delhi.id },
  });
  const delhiSouth = await prisma.zone.upsert({
    where: { code: "DEL-SOUTH" },
    update: { name: "Delhi South", cityId: delhi.id },
    create: { name: "Delhi South", code: "DEL-SOUTH", cityId: delhi.id },
  });
  const mumbaiWest = await prisma.zone.upsert({
    where: { code: "MUM-WEST" },
    update: { name: "Mumbai West", cityId: mumbai.id },
    create: { name: "Mumbai West", code: "MUM-WEST", cityId: mumbai.id },
  });
  const newYorkCentral = await prisma.zone.upsert({
    where: { code: "NYC-CENTRAL" },
    update: { name: "New York Central", cityId: newYork.id },
    create: { name: "New York Central", code: "NYC-CENTRAL", cityId: newYork.id },
  });

  const connaughtPlace = await prisma.area.upsert({
    where: { cityId_name: { cityId: delhi.id, name: "Connaught Place" } },
    update: { zoneId: delhiCentral.id },
    create: {
      name: "Connaught Place",
      pincode: "110001",
      latitude: 28.6315,
      longitude: 77.2167,
      cityId: delhi.id,
      zoneId: delhiCentral.id,
    },
  });
  const saket = await prisma.area.upsert({
    where: { cityId_name: { cityId: delhi.id, name: "Saket" } },
    update: { zoneId: delhiSouth.id },
    create: {
      name: "Saket",
      pincode: "110017",
      latitude: 28.5245,
      longitude: 77.2066,
      cityId: delhi.id,
      zoneId: delhiSouth.id,
    },
  });
  await prisma.area.upsert({
    where: { cityId_name: { cityId: mumbai.id, name: "Andheri West" } },
    update: { zoneId: mumbaiWest.id },
    create: {
      name: "Andheri West",
      pincode: "400053",
      latitude: 19.1363,
      longitude: 72.8277,
      cityId: mumbai.id,
      zoneId: mumbaiWest.id,
    },
  });
  await prisma.area.upsert({
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

  const agentOneProfile = await prisma.agentProfile.upsert({
    where: { userId: agentOne.id },
    update: {
      availability: "AVAILABLE",
      currentLatitude: 28.6315,
      currentLongitude: 77.2167,
    },
    create: {
      userId: agentOne.id,
      employeeCode: "AG-DEL-001",
      availability: "AVAILABLE",
      currentLatitude: 28.6315,
      currentLongitude: 77.2167,
    },
  });
  const agentTwoProfile = await prisma.agentProfile.upsert({
    where: { userId: agentTwo.id },
    update: {
      availability: "AVAILABLE",
      currentLatitude: 19.1363,
      currentLongitude: 72.8277,
    },
    create: {
      userId: agentTwo.id,
      employeeCode: "AG-MUM-001",
      availability: "AVAILABLE",
      currentLatitude: 19.1363,
      currentLongitude: 72.8277,
    },
  });

  await prisma.zoneAgent.upsert({
    where: {
      zoneId_agentProfileId: {
        zoneId: delhiCentral.id,
        agentProfileId: agentOneProfile.id,
      },
    },
    update: {},
    create: { zoneId: delhiCentral.id, agentProfileId: agentOneProfile.id },
  });
  await prisma.zoneAgent.upsert({
    where: {
      zoneId_agentProfileId: {
        zoneId: mumbaiWest.id,
        agentProfileId: agentTwoProfile.id,
      },
    },
    update: {},
    create: { zoneId: mumbaiWest.id, agentProfileId: agentTwoProfile.id },
  });

  const demoOrder = await prisma.order.findUnique({
    where: { orderNumber: "LM-DEMO-001" },
  });
  if (!demoOrder) {
    const pickupAddress = await prisma.address.create({
      data: {
        label: "Demo pickup",
        line1: "14 Barakhamba Road",
        contactName: "Riya Customer",
        contactPhone: customer.phone!,
        userId: customer.id,
        areaId: connaughtPlace.id,
        latitude: connaughtPlace.latitude,
        longitude: connaughtPlace.longitude,
      },
    });
    const dropAddress = await prisma.address.create({
      data: {
        label: "Demo drop",
        line1: "Select Citywalk service entrance",
        contactName: "Arjun Receiver",
        contactPhone: "+919999000099",
        userId: customer.id,
        areaId: saket.id,
        latitude: saket.latitude,
        longitude: saket.longitude,
      },
    });
    const order = await prisma.order.create({
      data: {
        orderNumber: "LM-DEMO-001",
        customerId: customer.id,
        createdById: customer.id,
        assignedAgentId: agentOne.id,
        pickupAddressId: pickupAddress.id,
        dropAddressId: dropAddress.id,
        pickupZoneId: delhiCentral.id,
        dropZoneId: delhiSouth.id,
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

  console.log("Seed complete", {
    admin: admin.email,
    manager: manager.email,
    agents: [agentOne.email, agentTwo.email],
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
