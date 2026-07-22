// Using global fetch in Node.js

const API_URL = 'https://be-teal-tau.vercel.app/api/v1';
const EMAIL = 'admin@glinteco.com';
const PASSWORD = 'rampup123';

async function main() {
  console.log('🔐 Logging in as admin...');
  const loginRes = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });

  if (!loginRes.ok) {
    const err = await loginRes.text();
    console.error('❌ Login failed:', loginRes.status, err);
    process.exit(1);
  }

  const { accessToken } = await loginRes.json();
  console.log('✅ Logged in successfully!');

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`,
  };

  console.log('\n🧹 Deleting ALL existing documents...');
  try {
    let hasMore = true;
    let cursor = null;
    let deletedCount = 0;

    while (hasMore) {
      const url = `${API_URL}/documents?limit=100` + (cursor ? `&cursor=${cursor}` : '');
      const res = await fetch(url, { headers });
      if (!res.ok) break;
      const json = await res.json();
      const docs = json.data || [];
      if (docs.length === 0) break;

      for (const d of docs) {
        await fetch(`${API_URL}/documents/${d.id}`, { method: 'DELETE', headers });
        deletedCount++;
        process.stdout.write('x');
      }

      hasMore = json.hasMore;
      cursor = json.nextCursor;
    }
    console.log(`\n✅ Deleted ${deletedCount} documents.`);
  } catch (e) {
    console.warn('\n⚠️ Error during deletion:', e.message);
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
