import { auth } from "../app/features/auth/api/auth.server";
import prisma from "../app/lib/prisma";

async function initializeTennisClub() {
  try {
    console.log("🎾 Initializing The Mission Athletic Club organization...");

    // Create single tennis club organization (hidden from users)
    console.log("Creating organization...");
    const org = await auth.api.createOrganization({
      body: {
        name: "The Mission Athletic Club",
        slug: "tmac",
        metadata: { isDefault: true },
      },
    });

    console.log(`✅ Organization created: ${org.name} (ID: ${org.id})`);

    // Get all existing users and grant admin privileges (migration strategy)
    console.log("Fetching existing users...");
    const existingUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
      },
    });

    console.log(`Found ${existingUsers.length} existing users`);

    // Add all existing users as admin members
    let successCount = 0;
    let errorCount = 0;

    for (const user of existingUsers) {
      try {
        await auth.api.addMember({
          body: {
            userId: user.id,
            organizationId: org.id,
            role: "admin", // Give all existing users admin privileges
          },
        });
        console.log(`✅ Added ${user.firstName} ${user.lastName} (${user.email}) as admin`);
        successCount++;
      } catch (error) {
        console.error(`❌ Failed to add user ${user.email}:`, error);
        errorCount++;
      }
    }

    console.log(`\n📊 User membership summary:`);
    console.log(`   ✅ Successfully added: ${successCount} users`);
    console.log(`   ❌ Failed to add: ${errorCount} users`);

    // Set all user sessions to use this organization by default
    console.log("\nUpdating existing sessions...");
    const sessionUpdateResult = await prisma.session.updateMany({
      data: {
        activeOrganizationId: org.id,
      },
    });

    console.log(`✅ Updated ${sessionUpdateResult.count} existing sessions with active organization`);

    console.log("\n🎉 The Mission Athletic Club organization initialization complete!");
    console.log(`   📍 Organization: ${org.name} (${org.slug})`);
    console.log(`   👥 Admin members: ${successCount}`);
    console.log(`   🔗 Active sessions updated: ${sessionUpdateResult.count}`);

  } catch (error) {
    console.error("❌ Failed to initialize organization:", error);
    
    // Provide helpful error messages
    if (error instanceof Error) {
      console.error("Error details:", error.message);
      
      if (error.message.includes("already exists")) {
        console.log("\n💡 It looks like the organization might already exist.");
        console.log("   You can check existing organizations in your database.");
      } else if (error.message.includes("database")) {
        console.log("\n💡 Database connection issue detected.");
        console.log("   Please ensure your DATABASE_URL is correctly set and the database is running.");
      }
    }
    
    process.exit(1);
  }
}

// Graceful shutdown handling
process.on('SIGINT', async () => {
  console.log('\n🛑 Received interrupt signal, cleaning up...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Received termination signal, cleaning up...');
  await prisma.$disconnect();
  process.exit(0);
});

// Run the initialization
console.log("🚀 Starting TMAC organization initialization script");
console.log("   Run with: node --import tsx scripts/init-organization.ts\n");

initializeTennisClub()
  .catch((error) => {
    console.error("💥 Unhandled error during organization initialization:", error);
    process.exit(1);
  })
  .finally(async () => {
    console.log("\n🔌 Disconnecting from database...");
    await prisma.$disconnect();
    console.log("✅ Database connection closed");
  });