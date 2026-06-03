import { createClient } from '@libsql/client';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

async function main() {
    const url = process.env.TURSO_DATABASE_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;

    if (!url || !authToken) {
        console.error('Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN in .env');
        process.exit(1);
    }

    const client = createClient({ url, authToken });
    const sql = fs.readFileSync('migration.sql', 'utf8');

    // Split SQL into individual statements
    const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0);

    console.log(`Executing ${statements.length} statements against Turso...`);

    for (const stmt of statements) {
        try {
            await client.execute(stmt);
        } catch (e) {
            console.error('Failed to execute statement:', stmt);
            console.error(e);
            process.exit(1);
        }
    }

    console.log('Successfully pushed schema to Turso database!');
    process.exit(0);
}

main();
