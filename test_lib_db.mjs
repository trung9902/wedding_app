import assert from 'assert';
import {
  isSupabaseConfigured,
  getWeddingConfig,
  getPublicWeddingConfig,
  updateWeddingConfig,
  getRsvps,
  addRsvp,
  getWishes,
  addWish,
  deleteWish,
  verifyAdminPin,
  resetAllData,
} from './lib/db.js';

async function runUnitTests() {
  console.log('=== STARTING UNIT TESTS FOR lib/db.js HYBRID ADAPTER ===\n');
  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`✅ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`❌ FAIL: ${name}`);
      console.error(`   Error: ${err.message}`);
      failed++;
    }
  }

  // 1. Check isSupabaseConfigured without env vars
  await test('isSupabaseConfigured returns false when env variables are unset', async () => {
    assert.strictEqual(isSupabaseConfigured(), false);
  });

  // 2. Test getWeddingConfig and getPublicWeddingConfig
  await test('getPublicWeddingConfig strips adminPin and admin_pin', async () => {
    const full = await getWeddingConfig();
    assert.ok(full.adminPin, 'Full config must have adminPin for server verification');
    
    const pub = await getPublicWeddingConfig();
    assert.strictEqual(pub.adminPin, undefined, 'Public config must not have adminPin');
    assert.strictEqual(pub.admin_pin, undefined, 'Public config must not have admin_pin');
    assert.ok(pub.groom, 'Public config retains groom');
    assert.ok(pub.bride, 'Public config retains bride');
  });

  // 3. Test verifyAdminPin
  await test('verifyAdminPin accurately validates pins', async () => {
    const isCorrect = await verifyAdminPin('admin123');
    const isWrong = await verifyAdminPin('wrong');
    const isBlank = await verifyAdminPin('');
    const isNull = await verifyAdminPin(null);

    assert.strictEqual(isCorrect, true);
    assert.strictEqual(isWrong, false);
    assert.strictEqual(isBlank, false);
    assert.strictEqual(isNull, false);
  });

  // 4. Test updateWeddingConfig
  await test('updateWeddingConfig sanitizes injected adminPin fields', async () => {
    const updated = await updateWeddingConfig({
      adminPin: 'should_be_ignored',
      admin_pin: 'should_be_ignored',
      event: { title: 'Tiệc Cưới Hạnh Phúc' }
    });
    
    assert.strictEqual(updated.adminPin, 'admin123');
    assert.strictEqual(updated.admin_pin, undefined);
    assert.strictEqual(updated.event.title, 'Tiệc Cưới Hạnh Phúc');
  });

  // 5. Test addRsvp boundary clamping
  await test('addRsvp clamps guestCount within [1, 50]', async () => {
    const r1 = await addRsvp({ name: 'Guest 1', guestCount: -5 });
    assert.strictEqual(r1.guestCount, 1);

    const r2 = await addRsvp({ name: 'Guest 2', guestCount: 999 });
    assert.strictEqual(r2.guestCount, 50);

    const r3 = await addRsvp({ name: 'Guest 3', guestCount: '3' });
    assert.strictEqual(r3.guestCount, 3);
  });

  // 6. Test addWish & deleteWish
  await test('addWish and deleteWish works properly', async () => {
    const wish = await addWish({ name: '   Tester   ', message: '   Best wishes!   ' });
    assert.strictEqual(wish.name, 'Tester');
    assert.strictEqual(wish.message, 'Best wishes!');

    const wishes = await getWishes();
    const found = wishes.find(w => w.id === wish.id);
    assert.ok(found);

    await deleteWish(wish.id);
    const afterWishes = await getWishes();
    const afterFound = afterWishes.find(w => w.id === wish.id);
    assert.strictEqual(afterFound, undefined);
  });

  // 7. Test resetAllData
  await test('resetAllData clears all data with valid pin', async () => {
    await addRsvp({ name: 'Temp' });
    await addWish({ name: 'Temp', message: 'Temp msg' });

    await resetAllData('admin123');
    const rsvps = await getRsvps();
    const wishes = await getWishes();

    assert.strictEqual(rsvps.length, 0);
    assert.strictEqual(wishes.length, 0);
  });

  console.log(`\n=== UNIT TEST RESULTS: ${passed} PASSED, ${failed} FAILED ===`);
  if (failed > 0) {
    process.exit(1);
  }
}

runUnitTests();
