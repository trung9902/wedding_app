import assert from 'assert';

const PORT = process.env.PORT || 3007;
const BASE_URL = process.env.BASE_URL || `http://127.0.0.1:${PORT}`;

async function runTests() {
  console.log('=== STARTING AUTOMATED REGRESSION TESTS FOR WEDDING APP API ===\n');
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

  // 1. GET /api/wedding (Public Config - No adminPin)
  await test('GET /api/wedding returns public config without exposing adminPin', async () => {
    const res = await fetch(`${BASE_URL}/api/wedding`);
    assert.strictEqual(res.status, 200, `Expected 200, got ${res.status}`);
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert.ok(json.data, 'Data should exist');
    assert.ok(json.data.groom, 'Groom info should exist');
    assert.ok(json.data.bride, 'Bride info should exist');
    assert.ok(json.data.event, 'Event info should exist');
    assert.strictEqual(json.data.adminPin, undefined, 'adminPin must NOT be exposed in public API');
    assert.strictEqual(json.data.admin_pin, undefined, 'admin_pin must NOT be exposed in public API');
  });

  // 2. POST /api/admin/login
  await test('POST /api/admin/login fails with wrong PIN', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin: 'wrong_pin_123' })
    });
    assert.strictEqual(res.status, 401);
    const json = await res.json();
    assert.strictEqual(json.success, false);
    assert.strictEqual(json.error, 'Mã PIN không chính xác!');
  });

  await test('POST /api/admin/login succeeds with valid PIN', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin: 'admin123' })
    });
    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert.strictEqual(json.message, 'Đăng nhập thành công!');
  });

  // 3. PUT /api/wedding
  await test('PUT /api/wedding rejects without valid PIN', async () => {
    const res = await fetch(`${BASE_URL}/api/wedding`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin: 'bad_pin', data: { event: { title: 'Hacked Title' } } })
    });
    assert.strictEqual(res.status, 401);
    const json = await res.json();
    assert.strictEqual(json.success, false);
  });

  await test('PUT /api/wedding updates config with valid PIN', async () => {
    const updatePayload = {
      pin: 'admin123',
      data: {
        event: {
          title: 'LỄ THÀNH HÔN - TEST TITLE QA',
          weddingDate: '2026-12-12T11:30:00',
          lunarDate: '04 Tháng 11 Năm Bính Ngọ',
          ceremonyTime: '11:00',
          partyTime: '11:30',
          venueName: 'Trung tâm Hội nghị Trống Đồng',
          venueAddress: '72 Quán Sứ, Hoàn Kiếm, Hà Nội',
          mapUrl: 'https://maps.google.com',
          message: 'Trân trọng kính mời quý khách!'
        }
      }
    };
    const res = await fetch(`${BASE_URL}/api/wedding`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatePayload)
    });
    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.success, true);

    // Verify GET reflects the update
    const getRes = await fetch(`${BASE_URL}/api/wedding`);
    const getJson = await getRes.json();
    assert.strictEqual(getJson.data.event.title, 'LỄ THÀNH HÔN - TEST TITLE QA');
    assert.strictEqual(getJson.data.adminPin, undefined);

    // Restore original title
    await fetch(`${BASE_URL}/api/wedding`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pin: 'admin123',
        data: {
          event: {
            ...getJson.data.event,
            title: 'LỄ THÀNH HÔN'
          }
        }
      })
    });
  });

  // 4. RSVP API Tests
  await test('POST /api/rsvp validates required fields', async () => {
    const res = await fetch(`${BASE_URL}/api/rsvp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: '   ' })
    });
    assert.strictEqual(res.status, 400);
    const json = await res.json();
    assert.strictEqual(json.success, false);
    assert.strictEqual(json.error, 'Vui lòng nhập họ và tên!');
  });

  let createdRsvpId = null;
  await test('POST /api/rsvp creates a new RSVP successfully', async () => {
    const res = await fetch(`${BASE_URL}/api/rsvp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Tester QA Automated',
        phone: '0901234567',
        attending: 'yes',
        guestCount: 2,
        note: 'Chúc mừng hai bạn trăm năm hạnh phúc!'
      })
    });
    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert.ok(json.data.id, 'RSVP must have an ID');
    assert.strictEqual(json.data.name, 'Tester QA Automated');
    assert.strictEqual(json.data.guestCount, 2);
    createdRsvpId = json.data.id;
  });

  await test('GET /api/rsvp retrieves all RSVPs including created one', async () => {
    const res = await fetch(`${BASE_URL}/api/rsvp`);
    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert.ok(Array.isArray(json.data));
    const found = json.data.find(r => r.name === 'Tester QA Automated');
    assert.ok(found, 'Created RSVP should be in the list');
  });

  // 5. Guestbook (Wishes) API Tests
  await test('POST /api/guestbook validates required name and message', async () => {
    const res = await fetch(`${BASE_URL}/api/guestbook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Tester', message: '   ' })
    });
    assert.strictEqual(res.status, 400);
    const json = await res.json();
    assert.strictEqual(json.success, false);
    assert.strictEqual(json.error, 'Vui lòng nhập tên và lời chúc!');
  });

  let createdWishId = null;
  await test('POST /api/guestbook creates a new wish', async () => {
    const res = await fetch(`${BASE_URL}/api/guestbook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'QA Bot',
        message: 'Chúc tân lang tân nương bách niên giai lão!'
      })
    });
    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert.ok(json.data.id);
    assert.strictEqual(json.data.name, 'QA Bot');
    assert.strictEqual(json.data.message, 'Chúc tân lang tân nương bách niên giai lão!');
    createdWishId = json.data.id;
  });

  await test('GET /api/guestbook returns wishes list', async () => {
    const res = await fetch(`${BASE_URL}/api/guestbook`);
    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert.ok(Array.isArray(json.data));
    const found = json.data.find(w => w.id === createdWishId);
    assert.ok(found, 'Created wish should be in the list');
  });

  await test('DELETE /api/guestbook deletes wish by id', async () => {
    const res = await fetch(`${BASE_URL}/api/guestbook?id=${createdWishId}`, {
      method: 'DELETE'
    });
    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.success, true);

    // Verify it is gone
    const getRes = await fetch(`${BASE_URL}/api/guestbook`);
    const getJson = await getRes.json();
    const found = getJson.data.find(w => w.id === createdWishId);
    assert.strictEqual(found, undefined, 'Deleted wish should no longer exist');
  });

  await test('DELETE /api/guestbook returns 400 without id param', async () => {
    const res = await fetch(`${BASE_URL}/api/guestbook`, {
      method: 'DELETE'
    });
    assert.strictEqual(res.status, 400);
  });

  // 6. Admin Reset API Tests
  await test('POST /api/admin/reset rejects with invalid PIN', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin: 'wrongpin' })
    });
    assert.strictEqual(res.status, 401);
    const json = await res.json();
    assert.strictEqual(json.success, false);
  });

  await test('POST /api/admin/reset clears all data with valid PIN', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin: 'admin123' })
    });
    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.success, true);

    // Verify RSVPs and Wishes are now empty
    const rsvpRes = await fetch(`${BASE_URL}/api/rsvp`);
    const rsvpJson = await rsvpRes.json();
    assert.strictEqual(rsvpJson.data.length, 0, 'RSVPs should be empty after reset');

    const wishesRes = await fetch(`${BASE_URL}/api/guestbook`);
    const wishesJson = await wishesRes.json();
    assert.strictEqual(wishesJson.data.length, 0, 'Wishes should be empty after reset');
  });

  // 7. Security & Injection Tests
  await test('Security: SQL injection attempt in PIN login is rejected', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin: "' OR 1=1 --" })
    });
    assert.strictEqual(res.status, 401);
  });

  await test('Security: SQL injection attempt in RSVP is stored safely as literal string', async () => {
    const sqliName = "Robert'); DROP TABLE rsvps;--";
    const res = await fetch(`${BASE_URL}/api/rsvp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: sqliName,
        phone: "0123456789",
        attending: "yes",
        guestCount: 1,
        note: "Testing SQLi injection"
      })
    });
    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.data.name, sqliName);

    // Verify database is still intact
    const getRes = await fetch(`${BASE_URL}/api/rsvp`);
    const getJson = await getRes.json();
    assert.ok(getJson.data.length > 0);
  });

  await test('Security: Mass assignment attempt to overwrite adminPin via PUT /api/wedding is blocked', async () => {
    // Attempt to inject adminPin directly inside data object
    const res = await fetch(`${BASE_URL}/api/wedding`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pin: 'admin123',
        data: {
          adminPin: 'hackedPin123',
          admin_pin: 'hackedPin123',
          event: { title: 'LỄ THÀNH HÔN' }
        }
      })
    });
    assert.strictEqual(res.status, 200);

    // Verify public API does not reveal the attempted injected pin
    const getRes = await fetch(`${BASE_URL}/api/wedding`);
    const getJson = await getRes.json();
    assert.strictEqual(getJson.data.adminPin, undefined);
    assert.strictEqual(getJson.data.admin_pin, undefined);

    // Verify that old PIN still works (not overwritten by malicious field in data payload)
    const loginRes = await fetch(`${BASE_URL}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin: 'admin123' })
    });
    assert.strictEqual(loginRes.status, 200);
  });

  await test('Security: XSS payload in guestbook is stored as plain string and not evaluated', async () => {
    const xssMessage = '<img src=x onerror=alert("XSS")>';
    const res = await fetch(`${BASE_URL}/api/guestbook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: '<script>alert(1)</script>',
        message: xssMessage
      })
    });
    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.data.message, xssMessage);
  });

  // 8. Boundary and Edge Cases
  await test('Boundary: RSVP with invalid guestCount defaults to 1', async () => {
    const res = await fetch(`${BASE_URL}/api/rsvp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Guest Count Tester',
        guestCount: 'invalid_number'
      })
    });
    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.data.guestCount, 1);
  });

  await test('Boundary: Malformed JSON body returns 500 error gracefully', async () => {
    const res = await fetch(`${BASE_URL}/api/wedding`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: 'INVALID_JSON_PAYLOAD'
    });
    assert.strictEqual(res.status, 500);
    const json = await res.json();
    assert.strictEqual(json.success, false);
  });

  console.log(`\n=== REGRESSION TEST RESULTS: ${passed} PASSED, ${failed} FAILED ===`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
