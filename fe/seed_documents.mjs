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

  const loginData = await loginRes.json();
  const token = loginData.accessToken;
  console.log('✅ Logged in successfully! Token received.');

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };

  // Clean up existing documents first
  console.log('\n🧹 Cleaning up existing demo documents...');
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
    console.log(`\n✅ Deleted ${deletedCount} existing documents.`);
  } catch (e) {
    console.warn('\n⚠️ Error during cleanup:', e.message);
  }

  // 1. Create Tags using /api/v1/tags
  console.log('\n🏷️ Creating demo tags...');
  const tagNames = [
    'React', 'Next.js', 'TypeScript', 'Node.js', 'Database',
    'Security', 'DevOps', 'Kubernetes', 'Docker', 'Architecture',
    'Performance', 'Frontend', 'Backend', 'API', 'Testing',
    'Cloud', 'AWS', 'Microservices', 'GraphQL', 'UI/UX'
  ];

  const tagMap = new Map(); // name -> id

  // Fetch existing tags
  try {
    const res = await fetch(`${API_URL}/tags`, { headers });
    if (res.ok) {
      const existingTags = await res.json();
      for (const tag of existingTags) {
        tagMap.set(tag.name, tag.id);
      }
    }
  } catch (e) {
    console.warn('Could not fetch existing tags:', e);
  }

  // Create missing tags
  for (const name of tagNames) {
    if (!tagMap.has(name)) {
      try {
        const res = await fetch(`${API_URL}/tags`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ name }),
        });
        if (res.ok) {
          const tag = await res.json();
          tagMap.set(tag.name || name, tag.id);
          console.log(`  + Created tag: ${name}`);
        } else {
          const existing = await res.json().catch(() => ({}));
          if (existing?.id) tagMap.set(name, existing.id);
        }
      } catch (e) {
        console.warn(`  - Failed to create tag ${name}`);
      }
    }
  }

  const allTagIds = Array.from(tagMap.values()).filter(Boolean);
  console.log(`✅ Total available tags: ${allTagIds.length}`);

  function getRandomTags(count = 3) {
    const shuffled = [...allTagIds].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  // Helper to generate docs
  const documents = [];

  // ==========================================
  // 1. GENERATE 20 GUIDES
  // ==========================================
  const guideTopics = [
    { title: 'How to Implement JWT Authentication in Next.js 15', tech: 'Next.js', desc: 'A comprehensive guide on implementing secure stateless JWT authentication and refresh tokens in Next.js App Router.' },
    { title: 'Setting up a High-Availability Redis Cluster on AWS', tech: 'Redis & AWS', desc: 'Step-by-step walkthrough for deploying a multi-node Redis cluster with automatic failover on Amazon ElastiCache.' },
    { title: 'Configuring ESLint, Prettier, and Husky for Team Workflows', tech: 'TypeScript', desc: 'Standardize code formatting, static analysis, and automated pre-commit lint checks across large engineering teams.' },
    { title: 'Deploying Microservices with Kubernetes and Helm Charts', tech: 'Kubernetes', desc: 'Learn how to package, deploy, and version control production microservices on Kubernetes using Helm Helmcharts.' },
    { title: 'Implementing Rate Limiting with Redis in Node.js APIs', tech: 'Node.js', desc: 'Protect your public API endpoints from brute-force and DDoS attacks using sliding window rate limiting in Redis.' },
    { title: 'Optimizing PostgreSQL Database Queries for Million-Row Tables', tech: 'Database', desc: 'Practical indexing strategies, query plan analysis, and partition techniques for high-load relational databases.' },
    { title: 'Building CI/CD Pipelines with GitHub Actions and Docker', tech: 'DevOps', desc: 'Automate build, test, containerization, and production staging deployments using custom GitHub Action workflows.' },
    { title: 'Setting up OpenTelemetry Tracing in NestJS Applications', tech: 'Backend', desc: 'Instrument backend microservices with OpenTelemetry to collect distributed traces and metrics for Jaeger/Datadog.' },
    { title: 'Implementing Role-Based Access Control (RBAC) in React', tech: 'React', desc: 'Manage granular user permissions, protected routes, and dynamic UI component rendering based on user roles.' },
    { title: 'Configuring Nginx as a Reverse Proxy with SSL Termination', tech: 'DevOps', desc: 'Set up high-performance Nginx reverse proxy routing, Let’s Encrypt automated SSL certificates, and HTTP/2.' },
    { title: 'Writing End-to-End Tests with Playwright in TypeScript', tech: 'Testing', desc: 'Create resilient, cross-browser automated E2E test suites with visual regression testing and CI integration.' },
    { title: 'Setting up GraphQL Federation with Apollo Supergraph', tech: 'GraphQL', desc: 'Combine multiple independent GraphQL subgraphs into a unified enterprise supergraph schema with Apollo Gateway.' },
    { title: 'Implementing WebSockets for Real-Time Notification Feeds', tech: 'API', desc: 'Build scalable real-time bidirectional communication channels using Socket.io and Redis Pub/Sub backplanes.' },
    { title: 'Securing AWS S3 Buckets against Public Data Leaks', tech: 'Security & AWS', desc: 'Essential IAM policies, bucket access controls, and encryption configuration to lock down cloud storage assets.' },
    { title: 'Building Custom Design System Tokens with Tailwind CSS', tech: 'Frontend', desc: 'Configure semantic color palettes, typography scales, and custom utility classes in Tailwind CSS for enterprise UIs.' },
    { title: 'Setting up Prometheus and Grafana for Cluster Monitoring', tech: 'DevOps', desc: 'Deploy automated metrics scraping and real-time visualization dashboards for Kubernetes cluster node health.' },
    { title: 'Implementing OAuth2 Social Login with Google and GitHub', tech: 'Security', desc: 'Integrate third-party OAuth2 authentication flows seamlessly using NextAuth.js and secure session cookies.' },
    { title: 'Configuring Webpack 5 Module Federation for Micro-Frontends', tech: 'Architecture', desc: 'Decouple frontend monolithic apps into independently deployable micro-frontends sharing runtime dependencies.' },
    { title: 'Implementing Content Security Policy (CSP) Headers in Next.js', tech: 'Security', desc: 'Prevent Cross-Site Scripting (XSS) attacks by configuring strict Content Security Policy nonce and directive headers.' },
    { title: 'Setting up Automated Database Backups to Amazon S3 Glacier', tech: 'Cloud', desc: 'Automate nightly PostgreSQL database dumps, compression, encryption, and lifecycle archiving to AWS S3 Glacier.' }
  ];

  for (let i = 0; i < guideTopics.length; i++) {
    const topic = guideTopics[i];
    const contentObj = {
      description: topic.desc,
      objective: `This guide explains how to configure, optimize, and deploy ${topic.tech} following industry best practices and internal security standards.`,
      prerequisites: [
        'AWS CLI v2 or Docker Desktop installed locally',
        'AdministratorAccess IAM role or cluster sudo permissions',
        'Node.js 18+ and Git version control initialized'
      ],
      steps: `### 1. Prerequisites & Environment Setup\nBefore beginning, ensure that your CLI tools and environment variables are properly initialized.\n\n\`\`\`bash\n# Install required system packages\nnpm install -g @glinteco/cli-tools\ncp .env.example .env.local\n\`\`\`\n\n:::info\nMake sure your Docker daemon is running if you are executing local integration tests.\n:::\n\n### 2. Configuration Steps\nModify your system configuration files to support high throughput and fault tolerance.\n\n\`\`\`typescript\n// src/config/production.ts\nexport const config = {\n  timeoutMs: 5000,\n  retries: 3,\n  enableMetrics: true,\n};\n\`\`\`\n\n### 3. Verification & Testing\nRun the automated verification script to validate that endpoints respond within expected latency SLA.\n\n:::objective\n- Target latency: < 50ms at p95\n- Zero error rate under normal load\n:::`,
      expectedResult: `The ${topic.tech} service should be running stably without memory leaks, passing all health checks on port 8080.`
    };

    documents.push({
      title: topic.title,
      kind: 'Guide',
      content: JSON.stringify(contentObj),
      tagIds: getRandomTags(3),
    });
  }

  // ==========================================
  // 2. GENERATE 20 TUTORIALS
  // ==========================================
  const tutorialTopics = [
    { title: 'Build a Fullstack Todo App with Next.js App Router and Prisma', desc: 'A hands-on introductory tutorial to building fullstack web applications with modern Next.js 15, Server Actions, and Prisma ORM.', diff: 'Beginner', dur: 45 },
    { title: 'Mastering React Server Components and Server Actions', desc: 'Deep dive into the React 19 server architecture, understanding data fetching boundaries, hydration, and streaming UI.', diff: 'Intermediate', dur: 60 },
    { title: 'Introduction to Rust Programming for JavaScript Developers', desc: 'Learn memory safety, ownership rules, borrowing, and concurrency in Rust by comparing concepts directly with TypeScript.', diff: 'Beginner', dur: 90 },
    { title: 'Building a High-Performance REST API with Go and Gin', desc: 'Construct ultra-fast microservice endpoints in Golang using Gin framework, custom middleware, and GORM database integration.', diff: 'Intermediate', dur: 60 },
    { title: 'Advanced State Management Patterns with Redux Toolkit and RTK Query', desc: 'Master client-side state caching, optimistic UI updates, and normalized entity adapters in enterprise React apps.', diff: 'Advanced', dur: 75 },
    { title: 'Building Mobile Applications with React Native and Expo Router', desc: 'Create cross-platform iOS and Android mobile apps with native file-based routing, animations, and offline storage.', diff: 'Intermediate', dur: 90 },
    { title: 'Understanding Asynchronous JavaScript: Promises, Async/Await, and Event Loop', desc: 'Master the JavaScript runtime mechanics, microtask queue, macrotask execution, and error handling in async workflows.', diff: 'Beginner', dur: 45 },
    { title: 'Implementing Event-Driven Microservices with Kafka and NestJS', desc: 'Build distributed asynchronous event streaming architectures with Apache Kafka topics, consumer groups, and NestJS.', diff: 'Advanced', dur: 120 },
    { title: 'Mastering CSS Grid, Flexbox, and Responsive Container Queries', desc: 'Modern responsive web layout techniques without relying on external CSS frameworks or hardcoded media breakpoints.', diff: 'Beginner', dur: 45 },
    { title: 'Building a Real-Time Collaborative Whiteboard with WebRTC', desc: 'Construct peer-to-peer data channels, canvas drawing synchronization, and signaling servers for live team collaboration.', diff: 'Advanced', dur: 120 },
    { title: 'Introduction to Docker Containers and Multi-Stage Builds', desc: 'Learn containerization fundamentals, Dockerfile optimization, reducing image sizes, and local docker-compose environments.', diff: 'Beginner', dur: 45 },
    { title: 'Advanced TypeScript: Generics, Conditional Types, and Template Literals', desc: 'Elevate your type safety with complex utility types, mapped types, inference rules, and type narrowing patterns.', diff: 'Advanced', dur: 90 },
    { title: 'Building Edge-Rendered Applications with Cloudflare Workers', desc: 'Deploy serverless edge functions with sub-millisecond cold starts, KV storage, and distributed Durable Objects.', diff: 'Intermediate', dur: 60 },
    { title: 'Testing React Components Effectively with React Testing Library', desc: 'Write maintainable user-centric unit and integration tests that focus on accessibility and user behavior over implementation details.', diff: 'Intermediate', dur: 60 },
    { title: 'Building Custom CLI Utilities with Node.js and Commander', desc: 'Create interactive terminal applications with argument parsing, colorized output, interactive prompts, and progress bars.', diff: 'Beginner', dur: 45 },
    { title: 'Understanding WebAssembly (Wasm) by Building an Image Processing Plugin', desc: 'Compile C++/Rust code to WebAssembly modules and integrate high-speed image manipulation directly into browser canvases.', diff: 'Advanced', dur: 120 },
    { title: 'Implementing Clean Architecture in TypeScript Backend Projects', desc: 'Separate domain logic, use cases, repositories, and presentation controllers to build maintainable enterprise backends.', diff: 'Intermediate', dur: 75 },
    { title: 'Mastering Advanced Git Workflows: Interactive Rebase, Bisect, and Worktrees', desc: 'Resolve complex merge conflicts, clean up commit histories, debug regressions with git bisect, and manage parallel branches.', diff: 'Intermediate', dur: 45 },
    { title: 'Building GraphQL Subscriptions for Live Dashboard Updates', desc: 'Implement real-time WebSocket subscriptions in GraphQL schemas to push live telemetry data to frontend analytics dashboards.', diff: 'Intermediate', dur: 60 },
    { title: 'Introduction to Kubernetes Operators using Custom Resource Definitions', desc: 'Automate complex stateful application management in Kubernetes by developing custom controllers and CRDs.', diff: 'Advanced', dur: 120 }
  ];

  for (let i = 0; i < tutorialTopics.length; i++) {
    const topic = tutorialTopics[i];
    const contentObj = {
      description: topic.desc,
      learningObjectives: [
        `Understand the core architectural patterns of ${topic.title.split(' ')[0]}`,
        'Build and configure a working development environment from scratch',
        'Implement robust error handling and production logging',
        'Deploy the finished application to a cloud staging environment'
      ],
      prerequisites: [
        'Basic understanding of JavaScript and ES6+ syntax',
        'Terminal access with git and npm installed',
        'Code editor (VS Code recommended)'
      ],
      duration: topic.dur,
      difficulty: topic.diff,
      steps: `### Section 1: Introduction and Core Concepts\nIn this section, we will explore why this technology stack is preferred for modern enterprise scalable applications.\n\n:::challenge\nBefore writing code, try to diagram the data flow between the client and server components.\n:::\n\n### Section 2: Step-by-Step Implementation\nLet's write our core business logic. Notice how types ensure compile-time safety across boundaries.\n\n\`\`\`typescript\ninterface TaskPayload {\n  id: string;\n  title: string;\n  completed: boolean;\n  createdAt: Date;\n}\n\nasync function processTask(payload: TaskPayload): Promise<void> {\n  console.log('Processing task:', payload.id);\n}\n\`\`\`\n\n### Section 3: Testing and Validation\nAlways verify your logic with automated unit and integration tests before submitting a pull request.`,
      exercises: [
        'Modify the core data model to include a priority enum (LOW, MEDIUM, HIGH)',
        'Add a custom middleware that logs request execution time in milliseconds',
        'Write an integration test verifying that invalid payloads return HTTP 400 Bad Request'
      ],
      summary: `Congratulations! You have completed the tutorial on "${topic.title}". You are now ready to apply these concepts in production services.`
    };

    documents.push({
      title: topic.title,
      kind: 'Tutorial',
      content: JSON.stringify(contentObj),
      tagIds: getRandomTags(3),
    });
  }

  // ==========================================
  // 3. GENERATE 20 RUNBOOKS
  // ==========================================
  const runbookTopics = [
    { title: 'SEV-1: High CPU Usage on Production PostgreSQL Primary', desc: 'Standard emergency operating procedures for investigating and mitigating primary database CPU exhaustion and query spikes.', sev: 'SEV-1', time: '15 mins' },
    { title: 'SEV-1: Payment Gateway Webhook Timeout Alarm', desc: 'Incident response protocol for failed payment processing webhooks and transaction state reconciliation failures.', sev: 'SEV-1', time: '10 mins' },
    { title: 'SEV-2: Out of Memory (OOM) Killed Pods in Analytics Cluster', desc: 'Diagnosis and memory heap profiling procedures for background worker pods experiencing OOM crash loops.', sev: 'SEV-2', time: '20 mins' },
    { title: 'SEV-2: Redis Cache Failover and Replica Split-Brain', desc: 'SRE instructions for handling Redis primary-replica replication failures and restoring cache consistency.', sev: 'SEV-2', time: '30 mins' },
    { title: 'SEV-1: Wildcard SSL Certificate Expiry Warning (< 24 Hours)', desc: 'Emergency manual SSL certificate renewal and load balancer rotation protocol for production domain names.', sev: 'SEV-1', time: '15 mins' },
    { title: 'SEV-3: Slow Query Performance on Admin Reports Dashboard', desc: 'Investigation guide for optimizing slow read queries and materializing reporting data views.', sev: 'SEV-3', time: '45 mins' },
    { title: 'SEV-1: Distributed Denial of Service (DDoS) Attack Mitigation', desc: 'Step-by-step instructions for activating Cloudflare Under Attack mode and blocking malicious IP ranges.', sev: 'SEV-1', time: '10 mins' },
    { title: 'SEV-2: Disk Space Exhaustion on ElasticSearch Logging Nodes', desc: 'Procedures for purging stale log indices and expanding EBS volume sizes on logging cluster instances.', sev: 'SEV-2', time: '25 mins' },
    { title: 'SEV-1: Internal DNS Resolution Failure in AWS VPC', desc: 'Troubleshooting AWS Route53 private hosted zones and CoreDNS pod crashes inside Kubernetes clusters.', sev: 'SEV-1', time: '15 mins' },
    { title: 'SEV-2: Kafka Consumer Group Lag Exceeding 100k Messages', desc: 'How to scale Kafka consumer worker pods and partition allocations during high traffic spikes.', sev: 'SEV-2', time: '30 mins' },
    { title: 'SEV-1: Unresponsive API Gateway 504 Gateway Timeout Spikes', desc: 'Mitigation protocol for debugging upstream gateway timeouts, connection pool exhaustion, and circuit breakers.', sev: 'SEV-1', time: '10 mins' },
    { title: 'SEV-2: Elasticsearch Cluster Health Status Yellow/Red', desc: 'Instructions for recovering unassigned shards and rebalancing Elasticsearch node storage.', sev: 'SEV-2', time: '30 mins' },
    { title: 'SEV-3: High Latency in Async Image Processing Background Queue', desc: 'Scaling BullMQ background worker concurrency and inspecting failed image optimization jobs.', sev: 'SEV-3', time: '60 mins' },
    { title: 'SEV-1: Database Transaction Deadlock Spike Alert', desc: 'How to identify conflicting database transactions, kill stuck locks, and optimize query locking order.', sev: 'SEV-1', time: '15 mins' },
    { title: 'SEV-2: Nightly Database Backup Cron Job Failure', desc: 'Manual execution steps for S3 database snapshot backups and verifying backup integrity.', sev: 'SEV-2', time: '30 mins' },
    { title: 'SEV-1: Unauthorized Brute-Force Admin Login Attempts Detected', desc: 'Security incident response for IP rate limiting, locking compromised accounts, and auditing auth logs.', sev: 'SEV-1', time: '10 mins' },
    { title: 'SEV-2: Transactional Email Delivery Blacklisted by Major Providers', desc: 'Troubleshooting SES/SendGrid IP reputation, DKIM/SPF verification, and rerouting email traffic.', sev: 'SEV-2', time: '45 mins' },
    { title: 'SEV-3: Stale CDN Cache Invalidation Webhook Failures', desc: 'Manual cache purging instructions for Cloudflare/Cloudfront endpoints during content release deployments.', sev: 'SEV-3', time: '30 mins' },
    { title: 'SEV-1: Kubernetes Node Pool System Crash and Eviction Loop', desc: 'Emergency procedures for draining unhealthy nodes, scaling cluster autoscalers, and debugging kubelet logs.', sev: 'SEV-1', time: '15 mins' },
    { title: 'SEV-2: Third-Party SMS Notification Provider Rate Limit Exceeded', desc: 'Protocol for switching SMS delivery fallbacks from Twilio to AWS SNS during outage events.', sev: 'SEV-2', time: '20 mins' }
  ];

  for (let i = 0; i < runbookTopics.length; i++) {
    const topic = runbookTopics[i];
    const contentObj = {
      description: topic.desc,
      incidentId: `INC-2026-${String(i + 101).padStart(3, '0')}`,
      severity: topic.sev,
      status: i % 4 === 0 ? 'Active' : 'Resolved',
      estimatedTime: topic.time,
      trigger: `Datadog monitoring alert triggered when metric threshold exceeded p99 SLA limits for over 5 consecutive minutes.`,
      impact: `Users may experience degradation in response times, temporary timeouts, or delayed asynchronous job processing.`,
      symptoms: [
        'API error rates spiking above 2.5% on upstream gateways',
        'Latency p95 increasing from 45ms to over 800ms',
        'Automated pager alerts firing for on-call SRE team'
      ],
      prerequisites: [
        'Kubernetes cluster access via kubectl with admin role',
        'Datadog dashboards read/write permissions',
        'Active PagerDuty incident acknowledgment'
      ],
      procedure: `### Step 1: Triage and Diagnostics\nImmediately check cluster health dashboards and container logs to identify the bottleneck.\n\n\`\`\`bash\n# Check pod resource utilization\nkubectl top pods -n production --sort-by=cpu\n# Tail recent error logs\nkubectl logs -n production -l app=core-api --tail=100 | grep ERROR\n\`\`\`\n\n### Step 2: Mitigation Actions\nIf resource limits are exhausted, temporarily scale the replica set or restart degraded worker pods.\n\n\`\`\`bash\nkubectl scale deployment core-api -n production --replicas=10\n\`\`\`\n\n:::warning\nDo not restart primary database instances without notifying the Lead DBA on call!\n:::`,
      validation: `Verify that metric graphs in Datadog return to baseline green levels and error rates drop below 0.01% for at least 15 minutes.`,
      rollback: `If scaling causes cascading failures, revert traffic to the standby disaster recovery region using Cloudflare load balancer controls.`,
      escalation: `Escalate immediately to the Principal SRE on call via PagerDuty if MTTR exceeds 25 minutes.`
    };

    documents.push({
      title: topic.title,
      kind: 'Runbook',
      content: JSON.stringify(contentObj),
      tagIds: getRandomTags(3),
    });
  }

  // ==========================================
  // 4. GENERATE 20 REFERENCES
  // ==========================================
  const referenceTopics = [
    { title: 'Core User Authentication & JWT API Reference', desc: 'Complete REST API endpoint specifications, request payloads, and response schemas for user authentication and session management.', cat: 'API Reference', ver: 'v2.4.0' },
    { title: 'Production Environment Variables Specification', desc: 'Comprehensive list of required and optional environment variables across all production backend and frontend services.', cat: 'Configuration', ver: 'v1.0.0' },
    { title: 'Standardized Error Codes and HTTP Status Guide', desc: 'Enterprise catalog of system error codes, HTTP status mapping, and localized error messaging guidelines.', cat: 'Specification', ver: 'v3.1.0' },
    { title: 'Payment Gateway Webhook Event Schema Specification', desc: 'Detailed JSON schema definitions and HMAC signature verification rules for incoming payment webhook payloads.', cat: 'API Reference', ver: 'v2.0.0' },
    { title: 'GraphQL Supergraph Schema & Query Reference', desc: 'Reference documentation for all available GraphQL queries, mutations, subscriptions, and custom scalar types.', cat: 'API Reference', ver: 'v1.5.0' },
    { title: 'Relational Database Naming & Indexing Conventions', desc: 'Engineering standards for database table naming, foreign key constraints, index creation, and schema migrations.', cat: 'Architecture', ver: 'v1.2.0' },
    { title: 'Design System Typography & Color Token Reference', desc: 'Complete specification of CSS custom properties, HSL color tokens, and font scale variables used in our design system.', cat: 'Design System', ver: 'v4.0.0' },
    { title: 'Shadcn UI Component Library Extension Specification', desc: 'Internal documentation for customized Shadcn UI component variants, accessible ARIA attributes, and props.', cat: 'Design System', ver: 'v1.1.0' },
    { title: 'AWS Cloud Infrastructure Naming & Tagging Policy', desc: 'Required tagging conventions and resource naming rules for AWS EC2, RDS, S3, and VPC infrastructure resources.', cat: 'Architecture', ver: 'v2.0.0' },
    { title: 'Microservice gRPC Inter-Service Communication Protocol', desc: 'Protocol Buffer (.proto) definitions and RPC service contracts for internal microservice communication.', cat: 'Specification', ver: 'v1.0.0' },
    { title: 'Kafka Event Topic and Avro Schema Serialization Spec', desc: 'Reference guide for Apache Kafka topic naming structures, partitioning strategies, and Avro schema registries.', cat: 'Architecture', ver: 'v1.8.0' },
    { title: 'Docker Compose Local Development Service Definitions', desc: 'Documentation for local development container network ports, volume mounts, and environment configuration.', cat: 'Configuration', ver: 'v2.2.0' },
    { title: 'GitHub Actions CI/CD Pipeline Stage & Environment Spec', desc: 'Specification of reusable GitHub workflow triggers, required build secrets, and deployment matrix rules.', cat: 'DevOps', ver: 'v3.0.0' },
    { title: 'Structured JSON Logging and OpenTelemetry Trace Spec', desc: 'Standardized JSON log formatting guidelines, severity levels, and OpenTelemetry span attribute standards.', cat: 'Architecture', ver: 'v1.3.0' },
    { title: 'API Gateway Rate Limiting & Throttling Policy Reference', desc: 'Specification of tier-based API rate limits, sliding window counters, and response headers.', cat: 'Specification', ver: 'v2.1.0' },
    { title: 'LaunchDarkly Feature Flag Naming & Lifecycle Guide', desc: 'Rules for creating, naming, evaluating, and retiring feature flags across frontend and backend applications.', cat: 'Configuration', ver: 'v1.0.0' },
    { title: 'GDPR & Data Privacy PII Anonymization Specification', desc: 'Technical specifications for encrypting, hashing, and purging Personally Identifiable Information (PII) to ensure compliance.', cat: 'Security', ver: 'v2.0.0' },
    { title: 'REST API Pagination, Sorting, and Filtering Protocol', desc: 'Standard query parameter rules for cursor-based and offset-based pagination across all REST endpoints.', cat: 'API Reference', ver: 'v1.4.0' },
    { title: 'Mobile App Offline Data Synchronization & Conflict Spec', desc: 'Technical protocol for SQLite offline data persistence, delta sync payloads, and server-side conflict resolution.', cat: 'Architecture', ver: 'v1.1.0' },
    { title: 'WebSocket Real-Time Event Types and Payload Reference', desc: 'Complete catalog of WebSocket event names, broadcast channels, and message payload structures.', cat: 'API Reference', ver: 'v2.0.0' }
  ];

  for (let i = 0; i < referenceTopics.length; i++) {
    const topic = referenceTopics[i];
    const contentObj = {
      description: topic.desc,
      category: topic.cat,
      version: topic.ver,
      properties: [
        { name: 'authorization', type: 'string (header)', required: true, defaultValue: 'None', description: 'Bearer JWT token required for authenticating incoming API requests.' },
        { name: 'x-request-id', type: 'string (UUIDv4)', required: true, defaultValue: 'Auto-generated', description: 'Unique distributed tracing identifier propagated across microservice boundaries.' },
        { name: 'limit', type: 'integer', required: false, defaultValue: '20', description: 'Maximum number of records to return per paginated query response (max: 100).' },
        { name: 'cursor', type: 'string (base64)', required: false, defaultValue: 'null', description: 'Opaque pagination cursor token returned from the previous page request.' }
      ],
      examples: `### Example Request\nBelow is a standard cURL command demonstrating how to invoke this endpoint with required headers:\n\n\`\`\`bash\ncurl -X POST https://api.glinteco.com/v2/resource \\\n  -H "Authorization: Bearer eyJhbGciOi..." \\\n  -H "X-Request-Id: 8b1a9953-12e3-4f51-87a3" \\\n  -H "Content-Type: application/json" \\\n  -d '{"limit": 50}'\n\`\`\`\n\n### Example Response\n\`\`\`json\n{\n  "data": [],\n  "meta": {\n    "totalCount": 142,\n    "hasNextPage": true,\n    "nextCursor": "ZXlKaGJHY2lPaUpTVXpVeGVIbDA="
  }\n}\n\`\`\``,
      notes: `:::info\nThis API endpoint is rate-limited to 1,000 requests per minute per authenticated IP address. Exceeding this limit will result in an HTTP 429 Too Many Requests response.\n:::`
    };

    documents.push({
      title: topic.title,
      kind: 'Reference',
      content: JSON.stringify(contentObj),
      tagIds: getRandomTags(3),
    });
  }

  // ==========================================
  // 5. GENERATE 20 LINKS
  // ==========================================
  const linkTopics = [
    { title: 'Next.js Official App Router Documentation & Guides', url: 'https://nextjs.org/docs', prov: 'Vercel', type: 'Official Documentation' },
    { title: 'React Server Components Deep Dive and Architecture', url: 'https://react.dev/reference/rsc/server-components', prov: 'Meta / React Devs', type: 'Technical Article' },
    { title: 'Google Cloud Architecture Framework & Best Practices', url: 'https://cloud.google.com/architecture/framework', prov: 'Google Cloud', type: 'Official Documentation' },
    { title: 'OWASP Top 10 Web Application Security Risks & Defenses', url: 'https://owasp.org/www-project-top-ten/', prov: 'OWASP Foundation', type: 'Specification' },
    { title: 'PostgreSQL High Performance Tuning & Indexing Guide', url: 'https://www.postgresql.org/docs/current/performance-tips.html', prov: 'PostgreSQL Global Dev Group', type: 'Official Documentation' },
    { title: 'Node.js Best Practices for Production Container Deployments', url: 'https://github.com/goldbergyoni/nodebestpractices', prov: 'Open Source Community', type: 'Book / Guide' },
    { title: 'Kubernetes Official Concepts and Cluster Administration Docs', url: 'https://kubernetes.io/docs/concepts/', prov: 'Cloud Native Computing Foundation', type: 'Official Documentation' },
    { title: 'Tailwind CSS v3.4 Official Component Styling Reference', url: 'https://tailwindcss.com/docs', prov: 'Tailwind Labs', type: 'Official Documentation' },
    { title: 'Refactoring Guru: Software Design Patterns & Refactoring Catalog', url: 'https://refactoring.guru/design-patterns', prov: 'Refactoring Guru', type: 'Book / Guide' },
    { title: 'Stripe Official Webhooks & Payment Integration Reference', url: 'https://docs.stripe.com/webhooks', prov: 'Stripe Inc.', type: 'Official Documentation' },
    { title: 'Vercel Serverless & Edge Functions Production Guide', url: 'https://vercel.com/docs/functions', prov: 'Vercel', type: 'Official Documentation' },
    { title: 'OpenAI API Reference for Embeddings & Chat Completions', url: 'https://platform.openai.com/docs/api-reference', prov: 'OpenAI', type: 'Official Documentation' },
    { title: 'Playwright End-to-End Automation & Browser Testing Docs', url: 'https://playwright.dev/docs/intro', prov: 'Microsoft', type: 'Official Documentation' },
    { title: 'W3C Web Content Accessibility Guidelines (WCAG) 2.1 Spec', url: 'https://www.w3.org/WAI/standards-guidelines/wcag/', prov: 'W3C Web Accessibility Initiative', type: 'Specification' },
    { title: 'Martin Fowler on Microservices Architecture & Principles', url: 'https://martinfowler.com/articles/microservices.html', prov: 'ThoughtWorks / Martin Fowler', type: 'Technical Article' },
    { title: 'MDN Web Docs: Asynchronous JavaScript and Event Loop Guide', url: 'https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous', prov: 'Mozilla Developer Network', type: 'Official Documentation' },
    { title: 'Atlassian Git Branching Strategies & Workflows Comparison', url: 'https://www.atlassian.com/git/tutorials/comparing-workflows', prov: 'Atlassian', type: 'Technical Article' },
    { title: 'AWS Well-Architected Framework: Reliability & Security Pillars', url: 'https://aws.amazon.com/architecture/well-architected/', prov: 'Amazon Web Services', type: 'Official Documentation' },
    { title: 'Pragmatic Engineer: Scaling Software Engineering Teams & Systems', url: 'https://blog.pragmaticengineer.com/', prov: 'Gergely Orosz', type: 'Technical Article' },
    { title: 'Shadcn UI Component Design Principles & Installation Guide', url: 'https://ui.shadcn.com/docs', prov: 'shadcn', type: 'Official Documentation' }
  ];

  for (let i = 0; i < linkTopics.length; i++) {
    const topic = linkTopics[i];
    const contentObj = {
      url: topic.url,
      provider: topic.prov,
      type: topic.type,
      openInNewTab: true,
      description: `Essential reading for all software engineers working on ${topic.prov} technologies. This resource covers foundational architectural patterns, API specifications, and recommended production deployment setups to ensure system reliability and security.`,
      overview: `### Why This Resource Matters\nThis reference document is maintained by **${topic.prov}** and serves as the authoritative guide for implementing ${topic.type.toLowerCase()} standards.\n\n- **Key Takeaways**: Foundational architectural patterns, API specifications, and recommended production deployment setups.\n- **Who Should Read**: Backend engineers, frontend developers, SREs, and technical leads.\n- **Trust & Credibility**: Verified official resource with high community adoption.`
    };

    documents.push({
      title: topic.title,
      kind: 'Link',
      url: topic.url,
      content: JSON.stringify(contentObj),
      tagIds: getRandomTags(3),
    });
  }

  console.log(`\n📚 Generated ${documents.length} rich demo documents across 5 kinds!`);
  console.log('🚀 Sending requests to backend...');

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < documents.length; i++) {
    const doc = documents[i];
    try {
      const res = await fetch(`${API_URL}/documents`, {
        method: 'POST',
        headers,
        body: JSON.stringify(doc),
      });

      if (res.ok) {
        successCount++;
        process.stdout.write('✓');
      } else {
        failCount++;
        const errText = await res.text();
        console.error(`\n❌ Failed to create doc [${doc.title}]: ${res.status} - ${errText}`);
      }
    } catch (err) {
      failCount++;
      console.error(`\n❌ Network error on doc [${doc.title}]:`, err.message);
    }

    await new Promise(r => setTimeout(r, 80));
  }

  console.log(`\n\n🎉 Done! Created: ${successCount} successfully | Failed: ${failCount}`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
