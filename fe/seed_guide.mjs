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

  // 2. Fetch tags to attach to our sample Guide
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

  // 3. Create ONE true structure Guide document
  console.log('\n📖 Creating 1 true structure Guide document...');

  const stepsMarkdown = [
    "### Step 1: Configure AWS Target Groups",
    "To achieve zero-downtime deployments, you must create two distinct target groups in your AWS Application Load Balancer: **Blue (Production)** and **Green (Staging)**.\n",
    "```bash",
    "# Create Blue Target Group",
    "aws elbv2 create-target-group \\",
    "    --name app-blue-tg \\",
    "    --protocol HTTP --port 8080 \\",
    "    --vpc-id vpc-0123456789abcdef0 \\",
    "    --target-type ip",
    "",
    "# Create Green Target Group",
    "aws elbv2 create-target-group \\",
    "    --name app-green-tg \\",
    "    --protocol HTTP --port 8080 \\",
    "    --vpc-id vpc-0123456789abcdef0 \\",
    "    --target-type ip",
    "```\n",
    ":::info",
    "Ensure your health check path is configured to `/api/health` with a low interval (5 seconds) and fast timeout (2 seconds) to speed up container registration!",
    ":::\n",
    "### Step 2: Define the GitHub Actions Deployment Workflow",
    "Create a new YAML file under `.github/workflows/deploy.yml` in your project root to define the automated build and deployment steps.\n",
    "```yaml",
    "name: Zero-Downtime ECS Deploy",
    "",
    "on:",
    "  push:",
    "    branches: [ main ]",
    "",
    "jobs:",
    "  deploy:",
    "    runs-on: ubuntu-latest",
    "    steps:",
    "      - name: Checkout Code",
    "        uses: actions/checkout@v4",
    "",
    "      - name: Configure AWS Credentials",
    "        uses: aws-actions/configure-aws-credentials@v4",
    "        with:",
    "          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}",
    "          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}",
    "          aws-region: us-east-1",
    "",
    "      - name: Login to Amazon ECR",
    "        id: login-ecr",
    "        uses: aws-actions/amazon-ecr-login@v2",
    "```\n",
    "### Step 3: Trigger Traffic Shifting",
    "Once the updated containers pass health checks in the Green target group, the ALB will automatically reroute 100% of production HTTP requests without dropping open connections.\n",
    ":::warning",
    "Do not delete the old Blue task definition immediately! Keep it running for at least 15 minutes to allow instant rollback if anomalies are detected in production logs.",
    ":::"
  ].join("\n");

  const contentObj = {
    description: "A comprehensive step-by-step practical guide on setting up automated CI/CD pipelines for production containerized applications without dropping active user connections.",
    objective: "By the end of this guide, you will be able to configure an automated deployment workflow that builds Docker images, updates Amazon ECS task definitions, and gracefully switches AWS Application Load Balancer target groups with zero downtime.",
    prerequisites: [
      "AWS CLI v2 installed and configured with AdministratorAccess IAM role",
      "Active GitHub repository with GitHub Actions CI/CD secrets enabled",
      "Docker Desktop installed locally for testing container builds"
    ],
    steps: stepsMarkdown,
    expectedResult: "When a pull request is merged into the `main` branch, the GitHub Actions pipeline successfully triggers, spins up a Green target group on AWS ECS, passes health checks within 60 seconds, and shifts 100% of production HTTP traffic from Blue to Green without returning a single 502 Bad Gateway or 504 Gateway Timeout error."
  };

  const docBody = {
    title: "How to Configure Zero-Downtime Blue-Green Deployment with GitHub Actions and AWS ECS",
    kind: "Guide",
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
    console.log(`\n🎉 Successfully created Guide document!`);
    console.log(`📌 Title: ${docBody.title}`);
    console.log(`🔗 ID: ${createdDoc.id || 'Created'}`);
  } else {
    const errText = await createRes.text();
    console.error(`\n❌ Failed to create Guide: ${createRes.status} - ${errText}`);
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
