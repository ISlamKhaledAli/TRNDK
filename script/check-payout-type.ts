
import { db } from '../server/config/db';

async function check() {
  if (db.payout) {
    console.log('✅ db.payout exists');
  } else {
    console.error('❌ db.payout DOES NOT exist');
  }
}

check().catch(console.error);
