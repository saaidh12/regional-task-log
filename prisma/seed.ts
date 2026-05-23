import bcrypt from "bcryptjs";

import { prisma } from "../lib/prisma";

const REGIONS = ["SPR", "SCPR", "NCPR", "NPR", "UNPR"] as const;

async function main() {
  const passwordHash = await bcrypt.hash("admin123", 10);

  await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      fullName: "Main Admin",
      serviceNumber: "ADMIN001",
      mobileNumber: "+9600000000",
      username: "admin",
      passwordHash,
      rank: "Admin",
      region: null,
      role: "MAIN_ADMIN",
      isActive: true,
      mustChangePassword: false,
    },
  });

  const sharedToOptions = ["Investigation", "Frontline"];

  for (const name of sharedToOptions) {
    await prisma.sharedToOption.upsert({
      where: { name },
      update: { isActive: true },
      create: {
        name,
        isActive: true,
      },
    });
  }

  const requestTypeOptions = [
    "Theft",
    "Mobile Details",
    "Phone Number",
    "Location",
  ];

  for (const name of requestTypeOptions) {
    await prisma.requestTypeOption.upsert({
      where: { name },
      update: { isActive: true },
      create: {
        name,
        isActive: true,
      },
    });
  }

  const defaultCrimeCategories = [
    "Theft",
    "Drug",
    "Assault",
    "Fraud",
    "Robbery",
    "Burglary",
    "Domestic Violence",
    "Mobile Theft",
    "Cyber Crime",
    "Wanted Person",
    "Gang Related",
    "Other",
  ];

  for (const region of REGIONS) {
    for (const name of defaultCrimeCategories) {
      await prisma.crimeCategory.upsert({
        where: {
          name_region: {
            name,
            region,
          },
        },
        update: {
          isActive: true,
        },
        create: {
          name,
          region,
          isActive: true,
        },
      });
    }
  }

  const defaultInfoShareAreas = ["SPR", "SCPR", "NPR", "NCPR", "UNPR"];

  for (const name of defaultInfoShareAreas) {
    await prisma.infoShareArea.upsert({
      where: { name },
      update: { isActive: true },
      create: {
        name,
        isActive: true,
      },
    });
  }

  console.log("Main admin created");
  console.log("Username: admin");
  console.log("Password: admin123");
  console.log("Default task dropdown options created");
  console.log("Default region-wise crime categories created");
  console.log("Default information shared areas created");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());