-- =========================================================
-- CloudTask Seed Data (MySQL)
-- =========================================================

USE `CloudTask`;

-- Insert Initial Projects
INSERT INTO `projects` (`id`, `name`, `description`, `color`, `icon`, `status`) VALUES
(1, 'Cloud Data Pipeline', 'ETL processing pipeline for daily real-time telemetry metrics', '#6366f1', 'database', 'active'),
(2, 'AI Microservice Cluster', 'Deploying neural network inference service with autoscaling', '#ec4899', 'cpu', 'active'),
(3, 'Web Platform Revamp', 'Migrating legacy frontend to Vite React with serverless API', '#06b6d4', 'layout', 'active'),
(4, 'Security Audit & Compliance', 'Vulnerability assessment, container scanning & secrets rotation', '#f59e0b', 'shield', 'active');

-- Insert Initial Categories
INSERT INTO `categories` (`id`, `name`, `color`) VALUES
(1, 'Infrastructure', '#8b5cf6'),
(2, 'Backend API', '#3b82f6'),
(3, 'Frontend UI', '#10b981'),
(4, 'DevOps & CI/CD', '#ef4444'),
(5, 'Data Science', '#f59e0b');

-- Insert Initial Tasks
INSERT INTO `tasks` (`id`, `project_id`, `category_id`, `title`, `description`, `status`, `priority`, `due_date`, `estimated_hours`, `actual_hours`, `cloud_runner`, `memory_limit`, `cpu_cores`, `execution_status`, `progress`) VALUES
(1, 1, 1, 'Deploy Kubernetes Ingress Controller', 'Configure NGINX ingress with TLS auto-renewal via Cert-Manager on US-East cluster.', 'in_progress', 'urgent', DATE_ADD(CURRENT_DATE, INTERVAL 2 DAY), 6.5, 3.0, 'US-East Node (Cluster A)', '1024MB', '2 vCPU', 'running', 65),
(2, 1, 5, 'Optimize Spark BigQuery Analytics Pipeline', 'Partition BigQuery tables by daily timestamp to reduce query scan costs by 40%.', 'todo', 'high', DATE_ADD(CURRENT_DATE, INTERVAL 4 DAY), 12.0, 0.0, 'EU-Central Node (Spark-01)', '2048MB', '4 vCPU', 'idle', 0),
(3, 2, 2, 'Implement JWT Authentication & Rate Limiter', 'Add Redis token bucket rate limiting to prevent DDOS attacks on `/api/v1/auth`.', 'review', 'high', DATE_ADD(CURRENT_DATE, INTERVAL 1 DAY), 8.0, 7.5, 'US-West Node (Lambda-02)', '512MB', '1 vCPU', 'success', 100),
(4, 3, 3, 'Design Interactive Dark Mode Dashboard UI', 'Craft vibrant UI design system with glassmorphism, responsive metrics, and real-time execution logs.', 'completed', 'medium', DATE_SUB(CURRENT_DATE, INTERVAL 1 DAY), 14.0, 14.0, 'US-East Node (Cluster A)', '512MB', '1 vCPU', 'success', 100),
(5, 2, 2, 'Build Batch Task Worker Queue', 'RabbitMQ worker queue consumer process for background email notifications and webhooks.', 'executing', 'urgent', DATE_ADD(CURRENT_DATE, INTERVAL 3 DAY), 10.0, 4.5, 'US-West Node (Queue Worker)', '1024MB', '2 vCPU', 'running', 45),
(6, 4, 4, 'Automate Docker Image Vulnerability Scanning', 'Integrate Trivy container scanner into GitHub Actions workflow prior to production release.', 'todo', 'medium', DATE_ADD(CURRENT_DATE, INTERVAL 6 DAY), 5.0, 0.0, 'CI/CD Runner (GitHub Cloud)', '512MB', '1 vCPU', 'idle', 0);

-- Insert Subtasks
INSERT INTO `subtasks` (`task_id`, `title`, `completed`) VALUES
(1, 'Provision Helm Chart for ingress-nginx', 1),
(1, 'Issue LetsEncrypt production certificates', 1),
(1, 'Configure DNS records for custom domain', 0),
(3, 'Implement Redis connection pool handler', 1),
(3, 'Add express-rate-limit middleware', 1),
(3, 'Write integration tests for token expiration', 1),
(5, 'Set up RabbitMQ exchanges and dead-letter queues', 1),
(5, 'Write idempotent retry handler for payload errors', 0),
(5, 'Benchmark payload throughput up to 10k ops/sec', 0);

-- Insert Task Execution Logs
INSERT INTO `task_logs` (`task_id`, `log_type`, `message`) VALUES
(1, 'info', 'Initializing US-East Node deployment agent v2.4.1...'),
(1, 'info', 'Applied Kubernetes namespace `ingress-system` successfully.'),
(1, 'warning', 'Ingress controller IP allocation pending external cloud provider handshake.'),
(1, 'info', 'TLS certificate renewed for domain cloudtask.internal.'),
(3, 'info', 'Starting integration test suite for JWT authentication...'),
(3, 'success', 'All 18 unit & integration tests passed cleanly (0ms latency regressions).'),
(5, 'info', 'Spinning up 4 parallel worker instances on node `queue-worker-01`...'),
(5, 'info', 'Connected to RabbitMQ cluster amqp://user:***@10.0.4.12:5672'),
(5, 'info', 'Processed 1,450 message payloads in batch #892.');
