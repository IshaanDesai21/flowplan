import { seedDemoUser } from './src/lib/server/demo.js';

async function main() {
  try {
    await seedDemoUser();
    console.log("Success");
  } catch (e) {
    console.error("Failed:", e);
  }
}

main();
