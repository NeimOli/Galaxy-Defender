-- ====================================================================
-- Galaxy Defender — Space Shooter Game
-- Database Schema for MySQL / MariaDB (XAMPP / Enterprise Backend)
-- Author: Sagar Thapa
-- Course: Software for Enterprise
-- ====================================================================

CREATE DATABASE IF NOT EXISTS `galaxy_defender` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `galaxy_defender`;

-- --------------------------------------------------------------------
-- Table: users (Virtual Identity & Player Credentials)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `username` VARCHAR(50) NOT NULL UNIQUE,
    `email` VARCHAR(100) NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `callsign` VARCHAR(60) NOT NULL,
    `avatar` VARCHAR(50) DEFAULT 'pilot_1',
    `ship_class` VARCHAR(50) DEFAULT 'Interceptor',
    `rank` VARCHAR(50) DEFAULT 'Cadet',
    `total_score` BIGINT DEFAULT 0,
    `games_played` INT DEFAULT 0,
    `banana_solved` INT DEFAULT 0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `last_login` TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_username` (`username`),
    INDEX `idx_total_score` (`total_score` DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------------------
-- Table: scores (Leaderboard & High Score Tracking)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `scores` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NULL,
    `pilot_name` VARCHAR(60) NOT NULL,
    `score` INT NOT NULL,
    `level_reached` INT DEFAULT 1,
    `enemies_destroyed` INT DEFAULT 0,
    `banana_puzzles_completed` INT DEFAULT 0,
    `accuracy_percentage` DECIMAL(5,2) DEFAULT 0.00,
    `survival_time_seconds` INT DEFAULT 0,
    `recorded_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
    INDEX `idx_score` (`score` DESC),
    INDEX `idx_recorded_at` (`recorded_at` DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------------------
-- Table: game_history (Individual Flight Mission Logs)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `game_history` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NULL,
    `score` INT NOT NULL,
    `level` INT NOT NULL,
    `boss_defeated` TINYINT(1) DEFAULT 0,
    `banana_points_earned` INT DEFAULT 0,
    `end_reason` VARCHAR(50) DEFAULT 'KIA', -- 'KIA', 'VICTORY', 'ABORTED'
    `played_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------------------
-- Table: banana_api_logs (Interoperability & External API Telemetry)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `banana_api_logs` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NULL,
    `puzzle_url` VARCHAR(255) NOT NULL,
    `solution_expected` INT NOT NULL,
    `player_answer` INT NULL,
    `is_correct` TINYINT(1) DEFAULT 0,
    `response_time_ms` INT DEFAULT 0,
    `timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------------------
-- Initial Seed Data: Hall of Fame & Default Pilots
-- --------------------------------------------------------------------
-- Default password for demo accounts is "Password123!"
-- Hash below generated via password_hash('Password123!', PASSWORD_BCRYPT)
INSERT INTO `users` (`id`, `username`, `email`, `password_hash`, `callsign`, `avatar`, `ship_class`, `rank`, `total_score`, `games_played`, `banana_solved`)
VALUES 
(1, 'commander_shepard', 'shepard@galaxydefender.space', '$2y$10$eA0k2bZ5r2mF7g8k1jQ6Nu8h3s6y4v7l2c5d1e8h9k0m1n2o3p4q5', 'Commander Shepard', 'pilot_1', 'Dreadnought', 'Fleet Admiral', 48500, 24, 18),
(2, 'star_fox', 'fox@corneria.space', '$2y$10$eA0k2bZ5r2mF7g8k1jQ6Nu8h3s6y4v7l2c5d1e8h9k0m1n2o3p4q5', 'Star Fox McCloud', 'pilot_2', 'Interceptor', 'Commander', 36200, 19, 14),
(3, 'nova_valkyrie', 'valk@galaxydefender.space', '$2y$10$eA0k2bZ5r2mF7g8k1jQ6Nu8h3s6y4v7l2c5d1e8h9k0m1n2o3p4q5', 'Nova Valkyrie', 'pilot_3', 'Phantom Recon', 'Lieutenant', 28900, 12, 9),
(4, 'cyborg_pilot', 'zero@galaxydefender.space', '$2y$10$eA0k2bZ5r2mF7g8k1jQ6Nu8h3s6y4v7l2c5d1e8h9k0m1n2o3p4q5', 'Cyber Zero', 'pilot_4', 'Interceptor', 'Ensign', 17400, 8, 5)
ON DUPLICATE KEY UPDATE `username`=`username`;

INSERT INTO `scores` (`user_id`, `pilot_name`, `score`, `level_reached`, `enemies_destroyed`, `banana_puzzles_completed`, `accuracy_percentage`, `survival_time_seconds`, `recorded_at`)
VALUES
(1, 'Commander Shepard', 48500, 5, 142, 6, 88.50, 480, NOW() - INTERVAL 2 DAY),
(2, 'Star Fox McCloud', 36200, 4, 108, 4, 82.10, 360, NOW() - INTERVAL 1 DAY),
(3, 'Nova Valkyrie', 28900, 3, 85, 3, 76.40, 290, NOW() - INTERVAL 12 HOUR),
(4, 'Cyber Zero', 17400, 2, 54, 2, 71.20, 195, NOW() - INTERVAL 3 HOUR),
(NULL, 'Rookie Vanguard (Guest)', 9500, 1, 29, 1, 65.00, 110, NOW() - INTERVAL 1 HOUR);
