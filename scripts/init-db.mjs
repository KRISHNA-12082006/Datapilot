// Creates the DataPilot tables in the database at DATABASE_URL (idempotent).
// Usage: npm run db:init
import { readFileSync } from "node:fs";
import pg from "pg";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set. Copy .env.example to .env first.");
  process.exit(1);
}

const client = new pg.Client({ connectionString: url });
await client.connect();
try {
  const { rows } = await client.query(`SELECT to_regclass('public."Task"') AS t`);
  if (rows[0].t) {
    console.log("Schema already exists - nothing to do.");
  } else {
    await client.query(readFileSync(new URL("../prisma/init.sql", import.meta.url), "utf8"));
    console.log("Schema created and connector catalog seeded.");
  }
} finally {
  await client.end();
}
