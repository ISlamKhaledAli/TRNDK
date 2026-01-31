import { db } from "../server/config/db";

async function migrate() {
  console.log("Starting category migration...");

  const mappings = [
    { old: "Instagram", newCat: "Growth Services", platform: "Instagram" },
    { old: "Facebook", newCat: "Growth Services", platform: "Facebook" },
    { old: "TikTok", newCat: "Growth Services", platform: "TikTok" },
    { old: "YouTube", newCat: "Growth Services", platform: "YouTube" },
    { old: "Other Services", newCat: "Growth Services", platform: "None" },
  ];

  for (const mapping of mappings) {
    const result = await (db.service as any).updateMany({
      where: { category: mapping.old },
      data: {
        category: mapping.newCat,
        platform: mapping.platform,
      },
    });
    console.log(`Migrated ${result.count} services from "${mapping.old}" to "${mapping.newCat}" (Platform: ${mapping.platform})`);
  }

  // Handle any other services that might not match (safety check)
  const remaining = await (db.service as any).count({
    where: {
      category: {
        notIn: [
          "Business Solutions",
          "Best Sellers",
          "Creative Design",
          "Video Production",
          "Web Design",
          "Growth Services",
          "Digital Library"
        ]
      }
    }
  });

  if (remaining > 0) {
    console.warn(`Warning: Found ${remaining} services with unmapped categories.`);
  }

  console.log("Migration completed.");
}

migrate()
  .catch((e) => {
    console.error("Migration failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    // We don't want to close the DB if it's shared, but usually in scripts we should.
    // However, server/config/db.ts might not export the client in a way that needs explicit closing here
    // or it might close itself on process exit.
  });
