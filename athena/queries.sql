-- CloudTask - Athena queries for CloudWatch Logs archived in Amazon S3
--
-- Architecture:
-- EC2 (Frontend + Backend)
--        ↓
-- CloudWatch Agent
--        ↓
-- CloudWatch Logs: ec2-all-logs
--        ↓
-- Daily-log Lambda
--        ↓
-- Amazon S3: cloudtaskmyproject
--        ↓
-- Amazon Athena

-- Create a dedicated database for log analysis
CREATE DATABASE IF NOT EXISTS cloudtask_logs;

-- After confirming the exported S3 object format,
-- create the external table using the matching SerDe/schema.
--
-- Example workflow:
-- 1. Inspect the exported objects in S3.
-- 2. Define the table according to the actual object format.
-- 3. Run analytical queries against the external table.

-- Example analysis queries once the external table is created:

-- SELECT *
-- FROM cloudtask_logs.ec2_logs
-- LIMIT 50;

-- SELECT COUNT(*)
-- FROM cloudtask_logs.ec2_logs;

-- SELECT *
-- FROM cloudtask_logs.ec2_logs
-- ORDER BY log_timestamp DESC
-- LIMIT 100;