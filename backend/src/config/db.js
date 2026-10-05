import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from '@aws-sdk/client-secrets-manager';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'cloudtask_db',
  multipleStatements: true
};

let pool = null;
let isFallbackMode = false;

// Helper to fetch database secret from AWS Secrets Manager
async function fetchAWSSecret() {
  const secretName = process.env.AWS_SECRET_NAME || 'rds!db-63b3232a-3a0d-4c46-afff-08bd52347ffc';
  const region = process.env.AWS_REGION || 'eu-north-1';

  try {
    console.log(`[AWS Secrets Manager] Fetching secret "${secretName}" from region "${region}"...`);
    const client = new SecretsManagerClient({ region });
    const response = await client.send(
      new GetSecretValueCommand({
        SecretId: secretName,
        VersionStage: 'AWSCURRENT',
      })
    );

    if (response.SecretString) {
      try {
        const parsed = JSON.parse(response.SecretString);
        console.log('[AWS Secrets Manager] Secret retrieved and JSON credentials parsed successfully.');
        if (parsed.password) dbConfig.password = parsed.password;
        if (parsed.username) dbConfig.user = parsed.username;
        if (parsed.host) dbConfig.host = parsed.host;
        if (parsed.port) dbConfig.port = parseInt(parsed.port);
        if (parsed.dbname) dbConfig.database = parsed.dbname;
      } catch (jsonErr) {
        console.log('[AWS Secrets Manager] Plaintext secret retrieved successfully.');
        dbConfig.password = response.SecretString;
      }
    }
  } catch (error) {
    console.warn(`[AWS Secrets Manager Warning] Failed to fetch secret "${secretName}":`, error.message);
    console.warn(`[AWS Secrets Manager Info] Falling back to default .env database credentials.`);
  }
}

// Fallback In-Memory Storage for environments where MySQL service is not running locally
const memoryStore = {
  projects: [
    { id: 1, name: 'Cloud Data Pipeline', description: 'ETL processing pipeline for daily real-time telemetry metrics', color: '#6366f1', icon: 'database', status: 'active', created_at: new Date().toISOString() },
    { id: 2, name: 'AI Microservice Cluster', description: 'Deploying neural network inference service with autoscaling', color: '#ec4899', icon: 'cpu', status: 'active', created_at: new Date().toISOString() },
    { id: 3, name: 'Web Platform Revamp', description: 'Migrating legacy frontend to Vite React with serverless API', color: '#06b6d4', icon: 'layout', status: 'active', created_at: new Date().toISOString() },
    { id: 4, name: 'Security Audit & Compliance', description: 'Vulnerability assessment, container scanning & secrets rotation', color: '#f59e0b', icon: 'shield', status: 'active', created_at: new Date().toISOString() }
  ],
  categories: [
    { id: 1, name: 'Infrastructure', color: '#8b5cf6' },
    { id: 2, name: 'Backend API', color: '#3b82f6' },
    { id: 3, name: 'Frontend UI', color: '#10b981' },
    { id: 4, name: 'DevOps & CI/CD', color: '#ef4444' },
    { id: 5, name: 'Data Science', color: '#f59e0b' }
  ],
  tasks: [
    { id: 1, project_id: 1, category_id: 1, title: 'Deploy Kubernetes Ingress Controller', description: 'Configure NGINX ingress with TLS auto-renewal via Cert-Manager on US-East cluster.', status: 'in_progress', priority: 'urgent', due_date: '2026-10-05', estimated_hours: 6.5, actual_hours: 3.0, cloud_runner: 'US-East Node (Cluster A)', memory_limit: '1024MB', cpu_cores: '2 vCPU', execution_status: 'running', progress: 65, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 2, project_id: 1, category_id: 5, title: 'Optimize Spark BigQuery Analytics Pipeline', description: 'Partition BigQuery tables by daily timestamp to reduce query scan costs by 40%.', status: 'todo', priority: 'high', due_date: '2026-10-07', estimated_hours: 12.0, actual_hours: 0.0, cloud_runner: 'EU-Central Node (Spark-01)', memory_limit: '2048MB', cpu_cores: '4 vCPU', execution_status: 'idle', progress: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 3, project_id: 2, category_id: 2, title: 'Implement JWT Authentication & Rate Limiter', description: 'Add Redis token bucket rate limiting to prevent DDOS attacks on `/api/v1/auth`.', status: 'review', priority: 'high', due_date: '2026-10-04', estimated_hours: 8.0, actual_hours: 7.5, cloud_runner: 'US-West Node (Lambda-02)', memory_limit: '512MB', cpu_cores: '1 vCPU', execution_status: 'success', progress: 100, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 4, project_id: 3, category_id: 3, title: 'Design Interactive Dark Mode Dashboard UI', description: 'Craft vibrant UI design system with glassmorphism, responsive metrics, and real-time execution logs.', status: 'completed', priority: 'medium', due_date: '2026-10-01', estimated_hours: 14.0, actual_hours: 14.0, cloud_runner: 'US-East Node (Cluster A)', memory_limit: '512MB', cpu_cores: '1 vCPU', execution_status: 'success', progress: 100, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 5, project_id: 2, category_id: 2, title: 'Build Batch Task Worker Queue', description: 'RabbitMQ worker queue consumer process for background email notifications and webhooks.', status: 'executing', priority: 'urgent', due_date: '2026-10-06', estimated_hours: 10.0, actual_hours: 4.5, cloud_runner: 'US-West Node (Queue Worker)', memory_limit: '1024MB', cpu_cores: '2 vCPU', execution_status: 'running', progress: 45, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 6, project_id: 4, category_id: 4, title: 'Automate Docker Image Vulnerability Scanning', description: 'Integrate Trivy container scanner into GitHub Actions workflow prior to production release.', status: 'todo', priority: 'medium', due_date: '2026-10-09', estimated_hours: 5.0, actual_hours: 0.0, cloud_runner: 'CI/CD Runner (GitHub Cloud)', memory_limit: '512MB', cpu_cores: '1 vCPU', execution_status: 'idle', progress: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
  ],
  subtasks: [
    { id: 1, task_id: 1, title: 'Provision Helm Chart for ingress-nginx', completed: 1 },
    { id: 2, task_id: 1, title: 'Issue LetsEncrypt production certificates', completed: 1 },
    { id: 3, task_id: 1, title: 'Configure DNS records for custom domain', completed: 0 },
    { id: 4, task_id: 3, title: 'Implement Redis connection pool handler', completed: 1 },
    { id: 5, task_id: 3, title: 'Add express-rate-limit middleware', completed: 1 },
    { id: 6, task_id: 3, title: 'Write integration tests for token expiration', completed: 1 },
    { id: 7, task_id: 5, title: 'Set up RabbitMQ exchanges and dead-letter queues', completed: 1 },
    { id: 8, task_id: 5, title: 'Write idempotent retry handler for payload errors', completed: 0 },
    { id: 9, task_id: 5, title: 'Benchmark payload throughput up to 10k ops/sec', completed: 0 }
  ],
  task_logs: [
    { id: 1, task_id: 1, log_type: 'info', message: 'Initializing US-East Node deployment agent v2.4.1...', timestamp: new Date().toISOString() },
    { id: 2, task_id: 1, log_type: 'info', message: 'Applied Kubernetes namespace `ingress-system` successfully.', timestamp: new Date().toISOString() },
    { id: 3, task_id: 1, log_type: 'warning', message: 'Ingress controller IP allocation pending external cloud provider handshake.', timestamp: new Date().toISOString() },
    { id: 4, task_id: 1, log_type: 'info', message: 'TLS certificate renewed for domain cloudtask.internal.', timestamp: new Date().toISOString() },
    { id: 5, task_id: 3, log_type: 'info', message: 'Starting integration test suite for JWT authentication...', timestamp: new Date().toISOString() },
    { id: 6, task_id: 3, log_type: 'success', message: 'All 18 unit & integration tests passed cleanly (0ms latency regressions).', timestamp: new Date().toISOString() },
    { id: 7, task_id: 5, log_type: 'info', message: 'Spinning up 4 parallel worker instances on node `queue-worker-01`...', timestamp: new Date().toISOString() },
    { id: 8, task_id: 5, log_type: 'info', message: 'Connected to RabbitMQ cluster amqp://user:***@10.0.4.12:5672', timestamp: new Date().toISOString() },
    { id: 9, task_id: 5, log_type: 'info', message: 'Processed 1,450 message payloads in batch #892.', timestamp: new Date().toISOString() }
  ]
};

let nextIds = {
  projects: 5,
  categories: 6,
  tasks: 7,
  subtasks: 10,
  task_logs: 10
};

export async function initDB() {
  // If AWS Secrets Manager is enabled or secret name is configured, fetch password/credentials first
  if (process.env.USE_AWS_SECRET_MANAGER === 'true' || process.env.AWS_SECRET_NAME) {
    await fetchAWSSecret();
  }

  try {
    // Attempt connecting to MySQL server
    const rootConn = await mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password
    });

    console.log('[MySQL] Connected to MySQL Server at ' + dbConfig.host + ':' + dbConfig.port);

    // Create DB if not exists
    await rootConn.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await rootConn.end();

    // Create connection pool to the database
    pool = mysql.createPool(dbConfig);

    // Check if tables exist
    const [rows] = await pool.query(`SHOW TABLES LIKE 'tasks'`);
    if (rows.length === 0) {
      console.log('[MySQL] Database tables not found. Executing schema.sql and seed.sql...');
      const schemaPath = path.join(__dirname, '../../../database/schema.sql');
      const seedPath = path.join(__dirname, '../../../database/seed.sql');

      if (fs.existsSync(schemaPath)) {
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        await pool.query(schemaSql);
        console.log('[MySQL] Schema initialized.');
      }
      if (fs.existsSync(seedPath)) {
        const seedSql = fs.readFileSync(seedPath, 'utf8');
        await pool.query(seedSql);
        console.log('[MySQL] Seed data loaded successfully.');
      }
    } else {
      console.log('[MySQL] CloudTask MySQL Database initialized and ready.');
    }
    return pool;
  } catch (err) {
    console.warn('[MySQL Warning] MySQL database connection failed:', err.message);
    console.warn('[MySQL Info] Using resilient memory database store for dev execution. To use native MySQL, ensure MySQL server is running on port ' + dbConfig.port);
    isFallbackMode = true;
    return null;
  }
}

export async function query(sql, params = []) {
  if (pool && !isFallbackMode) {
    try {
      const [rows, fields] = await pool.query(sql, params);
      return [rows, fields];
    } catch (err) {
      console.error('[MySQL Error]', err);
      throw err;
    }
  }

  // Fallback memory DB handler
  return executeMemoryQuery(sql, params);
}

function executeMemoryQuery(sql, params = []) {
  const normalized = sql.trim().toLowerCase();

  // Helper for tasks join query
  if (normalized.includes('from tasks t') || (normalized.startsWith('select') && normalized.includes('from tasks'))) {
    let result = memoryStore.tasks.map(t => {
      const project = memoryStore.projects.find(p => p.id === t.project_id);
      const category = memoryStore.categories.find(c => c.id === t.category_id);
      return {
        ...t,
        project_name: project ? project.name : null,
        project_color: project ? project.color : '#6366f1',
        category_name: category ? category.name : null,
        category_color: category ? category.color : '#8b5cf6'
      };
    });

    // Check WHERE condition by ID
    const idMatch = sql.match(/where\s+t\.id\s*=\s*\?/i) || sql.match(/where\s+id\s*=\s*\?/i);
    if (idMatch && params.length > 0) {
      result = result.filter(t => t.id === parseInt(params[0]));
    }

    // Check status filter
    const statusMatch = sql.match(/t\.status\s*=\s*\?/i) || sql.match(/status\s*=\s*\?/i);
    if (statusMatch && params.length > 0 && !idMatch) {
      const targetStatus = params[0];
      if (targetStatus && targetStatus !== 'all') {
        result = result.filter(t => t.status === targetStatus);
      }
    }

    return [result];
  }

  // Projects list
  if (normalized.includes('from projects')) {
    if (normalized.includes('where id = ?')) {
      const proj = memoryStore.projects.filter(p => p.id === parseInt(params[0]));
      return [proj];
    }
    return [memoryStore.projects];
  }

  // Categories list
  if (normalized.includes('from categories')) {
    return [memoryStore.categories];
  }

  // Subtasks list
  if (normalized.includes('from subtasks')) {
    if (normalized.includes('where task_id = ?')) {
      const sub = memoryStore.subtasks.filter(s => s.task_id === parseInt(params[0]));
      return [sub];
    }
    return [memoryStore.subtasks];
  }

  // Task logs list
  if (normalized.includes('from task_logs')) {
    if (normalized.includes('where task_id = ?')) {
      const logs = memoryStore.task_logs.filter(l => l.task_id === parseInt(params[0])).sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp));
      return [logs];
    }
    return [memoryStore.task_logs];
  }

  // INSERT INTO tasks
  if (normalized.startsWith('insert into tasks')) {
    const newTask = {
      id: nextIds.tasks++,
      project_id: params[0] ? parseInt(params[0]) : null,
      category_id: params[1] ? parseInt(params[1]) : null,
      title: params[2] || 'Untitled Task',
      description: params[3] || '',
      status: params[4] || 'todo',
      priority: params[5] || 'medium',
      due_date: params[6] || null,
      estimated_hours: parseFloat(params[7] || 1.0),
      actual_hours: 0.0,
      cloud_runner: params[8] || 'US-East Node (Cluster A)',
      memory_limit: params[9] || '512MB',
      cpu_cores: params[10] || '1 vCPU',
      execution_status: 'idle',
      progress: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    memoryStore.tasks.push(newTask);
    return [{ insertId: newTask.id, affectedRows: 1 }];
  }

  // UPDATE tasks
  if (normalized.startsWith('update tasks')) {
    const taskId = params[params.length - 1];
    const taskIndex = memoryStore.tasks.findIndex(t => t.id === parseInt(taskId));
    if (taskIndex !== -1) {
      if (normalized.includes('status = ?, priority = ?')) {
        memoryStore.tasks[taskIndex] = {
          ...memoryStore.tasks[taskIndex],
          project_id: params[0] ? parseInt(params[0]) : null,
          category_id: params[1] ? parseInt(params[1]) : null,
          title: params[2],
          description: params[3],
          status: params[4],
          priority: params[5],
          due_date: params[6],
          estimated_hours: parseFloat(params[7]),
          cloud_runner: params[8],
          memory_limit: params[9],
          cpu_cores: params[10],
          updated_at: new Date().toISOString()
        };
      } else if (normalized.includes('status = ?') && !normalized.includes('execution_status')) {
        memoryStore.tasks[taskIndex].status = params[0];
        memoryStore.tasks[taskIndex].updated_at = new Date().toISOString();
      } else if (normalized.includes('execution_status = ?')) {
        memoryStore.tasks[taskIndex].execution_status = params[0];
        if (params.length > 2) {
          memoryStore.tasks[taskIndex].progress = params[1];
        }
        memoryStore.tasks[taskIndex].updated_at = new Date().toISOString();
      }
      return [{ affectedRows: 1 }];
    }
    return [{ affectedRows: 0 }];
  }

  // DELETE FROM tasks
  if (normalized.startsWith('delete from tasks')) {
    const taskId = parseInt(params[0]);
    memoryStore.tasks = memoryStore.tasks.filter(t => t.id !== taskId);
    memoryStore.subtasks = memoryStore.subtasks.filter(s => s.task_id !== taskId);
    memoryStore.task_logs = memoryStore.task_logs.filter(l => l.task_id !== taskId);
    return [{ affectedRows: 1 }];
  }

  // INSERT INTO subtasks
  if (normalized.startsWith('insert into subtasks')) {
    const newSub = {
      id: nextIds.subtasks++,
      task_id: parseInt(params[0]),
      title: params[1],
      completed: 0
    };
    memoryStore.subtasks.push(newSub);
    return [{ insertId: newSub.id, affectedRows: 1 }];
  }

  // UPDATE subtasks
  if (normalized.startsWith('update subtasks')) {
    const subId = parseInt(params[params.length - 1]);
    const sub = memoryStore.subtasks.find(s => s.id === subId);
    if (sub) {
      sub.completed = params[0] ? 1 : 0;
      return [{ affectedRows: 1 }];
    }
  }

  // DELETE FROM subtasks
  if (normalized.startsWith('delete from subtasks')) {
    const subId = parseInt(params[0]);
    memoryStore.subtasks = memoryStore.subtasks.filter(s => s.id !== subId);
    return [{ affectedRows: 1 }];
  }

  // INSERT INTO task_logs
  if (normalized.startsWith('insert into task_logs')) {
    const newLog = {
      id: nextIds.task_logs++,
      task_id: parseInt(params[0]),
      log_type: params[1],
      message: params[2],
      timestamp: new Date().toISOString()
    };
    memoryStore.task_logs.push(newLog);
    return [{ insertId: newLog.id, affectedRows: 1 }];
  }

  // INSERT INTO projects
  if (normalized.startsWith('insert into projects')) {
    const newProj = {
      id: nextIds.projects++,
      name: params[0],
      description: params[1] || '',
      color: params[2] || '#6366f1',
      icon: params[3] || 'folder',
      status: 'active',
      created_at: new Date().toISOString()
    };
    memoryStore.projects.push(newProj);
    return [{ insertId: newProj.id, affectedRows: 1 }];
  }

  // INSERT INTO categories
  if (normalized.startsWith('insert into categories')) {
    const newCat = {
      id: nextIds.categories++,
      name: params[0],
      color: params[1] || '#8b5cf6'
    };
    memoryStore.categories.push(newCat);
    return [{ insertId: newCat.id, affectedRows: 1 }];
  }

  return [[]];
}
