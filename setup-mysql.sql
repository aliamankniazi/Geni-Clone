-- MySQL Setup Script for Niazi Tribe
-- Run this script after installing MySQL

-- Create database
CREATE DATABASE IF NOT EXISTS niazi_tribe CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user (if using root, skip this part)
CREATE USER IF NOT EXISTS 'niazi_user'@'localhost' IDENTIFIED BY 'niazi_password';
GRANT ALL PRIVILEGES ON niazi_tribe.* TO 'niazi_user'@'localhost';
FLUSH PRIVILEGES;

-- Use the database
USE niazi_tribe;

-- Display confirmation
SELECT 'Database niazi_tribe created successfully!' AS Status;
SELECT User, Host FROM mysql.user WHERE User = 'niazi_user'; 