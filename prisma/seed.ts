import bcrypt from "bcryptjs";

import { prisma } from "../lib/prisma";

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

  console.log("Main admin created");
  console.log("Username: admin");
  console.log("Password: admin123");
  console.log("Default dropdown options created");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());