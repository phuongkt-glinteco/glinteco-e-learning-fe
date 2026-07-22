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

  // 1. Delete ALL existing documents
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

  // 2. Fetch tags to attach to our sample Runbook
  console.log('\n🏷️ Fetching available tags...');
  let tagIds = [];
  try {
    const res = await fetch(`${API_URL}/tags`, { headers });
    if (res.ok) {
      const tags = await res.json();
      tagIds = tags.slice(0, 3).map(t => t.id);
    }
  } catch (e) {
    console.warn('Could not fetch tags:', e.message);
  }

  // 3. Create ONE true structure Runbook document
  console.log('\n📖 Creating 1 true structure Runbook document...');

  const contentObj = {
    description: "Standard emergency operating procedures for investigating and mitigating primary database CPU exhaustion and query spikes.",
    trigger: "Datadog monitoring alert triggered when PostgreSQL primary CPU usage exceeded 95% SLA threshold for over 5 consecutive minutes.",
    impact: "Users may experience degradation in API response times, temporary 504 timeouts on checkout endpoints, or delayed background webhook processing.",
    prerequisites: [
      "Must have AWS IAM RDS Read/Write administrative access permissions",
      "Must be connected to the Production VPN or Bastion Host securely",
      "Must have active PagerDuty SRE / DBA responder role assigned"
    ],
    procedure: `### Step 1: Identify Bottleneck Queries
Connect to the production database via bastion and run ` + '`pg_stat_activity`' + ` to identify long-running or blocked queries causing CPU exhaustion.

\`\`\`sql
SELECT pid, now() - query_start AS duration, state, query 
FROM pg_stat_activity 
WHERE state != 'idle' 
ORDER BY duration DESC 
LIMIT 10;
\`\`\`

:::warning
Do not terminate autovacuum or replication processes unless explicitly instructed by a Principal DBA!
:::

### Step 2: Terminate Stuck Queries
If a specific reporting or ad-hoc query is deadlocked or consuming > 80% CPU resources, terminate its process ID gracefully.

\`\`\`sql
-- Terminate a specific query by PID
SELECT pg_cancel_backend(PID_HERE);

-- If query does not terminate after 30 seconds, force kill
SELECT pg_terminate_backend(PID_HERE);
\`\`\`

### Step 3: Check Connection Pool Limits
Verify that PgBouncer connection pools are not saturated by checking active client connections.

\`\`\`bash
# Connect to PgBouncer admin console
psql -p 6432 -U admin pgbouncer -c "SHOW POOLS;"
\`\`\``,
    validation: "Verify that PostgreSQL CPU metric graphs in Datadog return to baseline (< 40%) and API latency p95 drops below 50ms for at least 15 consecutive minutes.",
    rollback: "If terminating queries or failing over replica causes connection pool exhaustion, immediately revert traffic routing to the secondary disaster recovery region via AWS Route53 DNS controls.",
    escalation: "If database CPU remains above 90% after 15 minutes of triage, immediately page the Principal Lead DBA via PagerDuty escalation policy #DBA-EMERGENCY."
  };

  const docBody = {
    title: "SEV-1: High CPU Usage on Production PostgreSQL Primary",
    kind: "Runbook",
    content: JSON.stringify(contentObj),
    tagIds: tagIds
  };

  const createRes = await fetch(`${API_URL}/documents`, {
    method: 'POST',
    headers,
    body: JSON.stringify(docBody),
  });

  if (createRes.ok) {
    const createdDoc = await createRes.json();
    console.log(`\n🎉 Successfully created Runbook document!`);
    console.log(`📌 Title: ${docBody.title}`);
    console.log(`🔗 ID: ${createdDoc.id || 'Created'}`);
  } else {
    const errText = await createRes.text();
    console.error(`\n❌ Failed to create Runbook: ${createRes.status} - ${errText}`);
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
