import { PrismaClient, bookingStyle } from "../../app/generated/prisma";
import { parse } from "csv-parse/sync";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const prisma = new PrismaClient();

const locationNameMap: Record<string, string> = {
  StMarys: "St. Mary's",
  parkside: "Parkside",
  CrockerAmazon: "Crocker Amazon",
  PotreroHill: "Potrero Hill",
  MinnieLovie: "Minnie Lovie",
};

function humanizeLocationName(raw: string): string {
  if (locationNameMap[raw]) return locationNameMap[raw];
  // Insert spaces before capital letters, capitalize first letter
  return raw
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^./, (s) => s.toUpperCase());
}

interface CourtRecord {
  ID: string;
  GooglePlaceID: string;
  BookingURL: string;
  Court_1_ID: string;
  Court_1_BookingStyle: string;
  Court_1_BookingDuration: string;
  Court_2_ID?: string;
  Court_2_BookingStyle?: string;
  Court_2_BookingDuration?: string;
  Court_3_ID?: string;
  Court_3_BookingStyle?: string;
  Court_3_BookingDuration?: string;
  Court_4_ID?: string;
  Court_4_BookingStyle?: string;
  Court_4_BookingDuration?: string;
}

async function seedCourts() {
  console.log("Seeding courts and locations...");
  
  // Read and parse the CSV file
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const csvFilePath = join(__dirname, "courts.csv");
  const fileContent = readFileSync(csvFilePath, "utf-8");
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
  }) as CourtRecord[];

  // Process each location and its courts
  for (const record of records) {
    // Use humanized name
    const locationName = humanizeLocationName(record.ID);
    
    // Check if location already exists
    const existingLocation = await prisma.courtLocation.findFirst({
      where: { name: locationName },
    });

    if (existingLocation) {
      console.log(`Court location '${locationName}' already exists, skipping...`);
      continue;
    }

    // Create the court location
    const location = await prisma.courtLocation.create({
      data: {
        name: locationName,
        googlePlaceId: record.GooglePlaceID || null,
        bookingUrl: record.BookingURL,
      },
    });

    console.log(`✅ Created court location: ${locationName}`);

    // Helper function to create a court if it exists in the record
    const createCourt = async (courtNumber: number) => {
      const courtId = record[`Court_${courtNumber}_ID` as keyof CourtRecord];
      const bookingStyleStr =
        record[`Court_${courtNumber}_BookingStyle` as keyof CourtRecord];
      const bookingDuration =
        record[`Court_${courtNumber}_BookingDuration` as keyof CourtRecord];

      if (courtId && bookingStyleStr && bookingDuration) {
        const style =
          bookingStyleStr === "SevenDaysBefore8AM"
            ? bookingStyle.seven_days_before_8am
            : bookingStyle.two_days_before_noon;

        await prisma.court.create({
          data: {
            name: `Court ${courtNumber}`,
            bookingStyle: style,
            bookingDuration: parseInt(bookingDuration),
            locationId: location.id,
          },
        });

        console.log(`✅ Created court: ${locationName} - Court ${courtNumber}`);
      }
    };

    // Create courts 1-4 if they exist
    await Promise.all([
      createCourt(1),
      createCourt(2),
      createCourt(3),
      createCourt(4),
    ]);
  }

  console.log("Court seeding completed!");
}

async function main() {
  await seedCourts();
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

export { seedCourts };
