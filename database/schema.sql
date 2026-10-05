-- =========================================================
-- CloudTask Application Database Schema (MySQL)
-- Database Name: CloudTask
-- =========================================================

CREATE DATABASE IF NOT EXISTS `CloudTask` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `CloudTask`;

-- Drop tables in reverse dependency order if needed
DROP TABLE IF EXISTS `subtasks`;
DROP TABLE IF EXISTS `task_logs`;
DROP TABLE IF EXISTS `tasks`;
DROP TABLE IF EXISTS `categories`;
DROP TABLE IF EXISTS `projects`;

-- 1. Projects Table
CREATE TABLE `projects` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `description` TEXT,
  `color` VARCHAR(30) DEFAULT '#6366f1',
  `icon` VARCHAR(50) DEFAULT 'folder',
  `status` ENUM('active', 'archived', 'completed') DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Categories Table
CREATE TABLE `categories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(50) NOT NULL UNIQUE,
  `color` VARCHAR(30) DEFAULT '#8b5cf6',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Tasks Table
CREATE TABLE `tasks` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `project_id` INT NULL,
  `category_id` INT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `status` ENUM('todo', 'in_progress', 'review', 'executing', 'completed') DEFAULT 'todo',
  `priority` ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
  `due_date` DATE NULL,
  `estimated_hours` DECIMAL(5,2) DEFAULT 1.00,
  `actual_hours` DECIMAL(5,2) DEFAULT 0.00,
  `cloud_runner` VARCHAR(100) DEFAULT 'US-East Node (Cluster A)',
  `memory_limit` VARCHAR(20) DEFAULT '512MB',
  `cpu_cores` VARCHAR(20) DEFAULT '1 vCPU',
  `execution_status` ENUM('idle', 'queued', 'running', 'success', 'failed') DEFAULT 'idle',
  `progress` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_tasks_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_tasks_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Subtasks Table
CREATE TABLE `subtasks` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `task_id` INT NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `completed` TINYINT(1) DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_subtasks_task` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Task Logs Table (Cloud Execution Logs)
CREATE TABLE `task_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `task_id` INT NOT NULL,
  `log_type` ENUM('info', 'warning', 'error', 'success') DEFAULT 'info',
  `message` TEXT NOT NULL,
  `timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_logs_task` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Indexes for optimal query performance
CREATE INDEX `idx_tasks_status` ON `tasks`(`status`);
CREATE INDEX `idx_tasks_priority` ON `tasks`(`priority`);
CREATE INDEX `idx_tasks_project` ON `tasks`(`project_id`);
CREATE INDEX `idx_task_logs_task` ON `task_logs`(`task_id`);
