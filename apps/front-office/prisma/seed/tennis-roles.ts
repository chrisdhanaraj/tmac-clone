import { PrismaClient } from "../../app/generated/prisma";

const prisma = new PrismaClient();

interface TennisRoleData {
  name: string;
  description: string;
  isActive: boolean;
}

const tennisRoles: TennisRoleData[] = [
  {
    name: "host",
    description: "Responsible for hosting events and managing event logistics, ensuring participants have a great experience",
    isActive: true,
  },
  {
    name: "feeder",
    description: "Assists with on-court activities, helps with ball feeding during practice sessions and clinics",
    isActive: true,
  },
  {
    name: "marketing",
    description: "Manages marketing initiatives, social media presence, and promotional activities for the club",
    isActive: true,
  },
  {
    name: "membership and culture",
    description: "Focuses on member engagement, community building, and maintaining the club's culture and values",
    isActive: true,
  },
  {
    name: "social",
    description: "Organizes social events, networking opportunities, and community gatherings for members",
    isActive: true,
  },
  {
    name: "tmatch",
    description: "Coordinates tennis matches, tournaments, and competitive play opportunities for club members",
    isActive: true,
  },
  {
    name: "partnerships & sponsorships",
    description: "Develops and manages partnerships with local businesses and secures sponsorship opportunities",
    isActive: true,
  },
  {
    name: "courtiers",
    description: "Manages court reservations, maintenance coordination, and court-related logistics",
    isActive: true,
  },
  {
    name: "policy",
    description: "Develops and maintains club policies, rules, and governance procedures",
    isActive: true,
  },
];

async function seedTennisRoles() {
  console.log("Seeding tennis roles...");

  try {
    // Check if tennisRoles table exists by attempting to access it
    // @ts-ignore - tennisRoles table may not exist in current schema
    const testQuery = await prisma.tennisRoles?.findFirst();
  } catch (error: any) {
    if (error.code === 'P2021' || error.message?.includes('does not exist') || error.message?.includes('tennisRoles')) {
      console.log("⚠️  tennisRoles table not found. Please run migrations to create the tennisRoles table first.");
      console.log("   Expected table structure: id, name, description, isActive, createdAt, updatedAt");
      return;
    }
    // Re-throw if it's a different error
    throw error;
  }

  for (const roleData of tennisRoles) {
    try {
      // @ts-ignore - tennisRoles table may not exist in current schema
      const existingRole = await prisma.tennisRoles.findFirst({
        where: { name: roleData.name },
      });

      if (existingRole) {
        console.log(`Tennis role '${roleData.name}' already exists, skipping...`);
        continue;
      }

      // @ts-ignore - tennisRoles table may not exist in current schema
      await prisma.tennisRoles.create({
        data: roleData,
      });

      console.log(`✅ Created tennis role: ${roleData.name}`);
    } catch (error) {
      console.error(`❌ Error creating tennis role '${roleData.name}':`, error);
    }
  }

  console.log("Tennis roles seeding completed!");
}

async function main() {
  try {
    await seedTennisRoles();
  } catch (error) {
    console.error("Error seeding tennis roles:", error);
    process.exit(1);
  }
}

// Only run directly if this file is executed directly
if (typeof import.meta !== 'undefined' && import.meta.url === `file://${process.argv[1]}`) {
  main()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

export { seedTennisRoles };