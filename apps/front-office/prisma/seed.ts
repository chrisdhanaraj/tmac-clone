import { PrismaClient } from "../app/generated/prisma/client";
import { seedTennisRoles } from "./seed/tennis-roles";
import { seedCourts } from "./seed/courts";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  try {
    // Seed courts first
    await seedCourts();

    // Seed tennis roles
    await seedTennisRoles();

    console.log("🎉 All seeding completed successfully!");
  } catch (error) {
    console.error("💥 Seeding failed:", error);
    process.exit(1);
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
