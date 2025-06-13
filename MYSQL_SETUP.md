# MySQL Database Setup for Niazi Tribe

## Overview
The backend has been updated to use MySQL as the relational database instead of PostgreSQL. MySQL is a free, open-source database that provides excellent performance and reliability.

## Changes Made

### 1. Dependencies Updated
- Removed: `pg` (PostgreSQL driver)
- Added: `mysql2` (MySQL driver with Promise support)

### 2. Configuration Updated
The following environment variables are now used for MySQL:
- `MYSQL_HOST` - MySQL server host (default: localhost)
- `MYSQL_PORT` - MySQL server port (default: 3306)
- `MYSQL_DATABASE` - Database name (default: niazi_tribe)
- `MYSQL_USER` - Database user (default: root)
- `MYSQL_PASSWORD` - Database password

### 3. Database Connection
- Updated `apps/api/src/database/connection.ts` to use MySQL connection pool
- Implemented connection pooling for better performance
- Added connection verification on startup

### 4. Database Schema
Created initial MySQL schema at `apps/api/src/database/migrations/init.sql` with tables for:
- `users` - User accounts and authentication
- `sessions` - User sessions and refresh tokens
- `media` - File uploads and media management
- `user_settings` - User preferences
- `activity_logs` - Audit trail
- `notifications` - User notifications
- `password_reset_tokens` - Password reset functionality
- `email_verifications` - Email verification

### 5. Docker Compose
Updated `docker-compose.yml` to use MySQL 8.0 instead of PostgreSQL:
```yaml
mysql:
  image: mysql:8.0
  container_name: niazi-mysql
  ports:
    - "3306:3306"
  environment:
    MYSQL_DATABASE: niazi_tribe
    MYSQL_ROOT_PASSWORD: root_password
    MYSQL_USER: niazi_user
    MYSQL_PASSWORD: niazi_password
```

## Setup Instructions

### Local Development

1. **Install MySQL locally** (if not using Docker):
   - Download MySQL Community Server from https://dev.mysql.com/downloads/
   - Install and start MySQL service

2. **Create database and user**:
   ```sql
   CREATE DATABASE niazi_tribe;
   CREATE USER 'niazi_user'@'localhost' IDENTIFIED BY 'your_password';
   GRANT ALL PRIVILEGES ON niazi_tribe.* TO 'niazi_user'@'localhost';
   FLUSH PRIVILEGES;
   ```

3. **Update `.env` file**:
   ```env
   MYSQL_HOST=localhost
   MYSQL_PORT=3306
   MYSQL_DATABASE=niazi_tribe
   MYSQL_USER=niazi_user
   MYSQL_PASSWORD=your_password
   ```

4. **Install dependencies**:
   ```bash
   npm install
   ```

5. **Start the application**:
   ```bash
   npm run dev
   ```

### Using Docker

1. **Start all services**:
   ```bash
   docker-compose up -d
   ```

2. The MySQL database will be automatically initialized with the schema.

## Example Usage

A `UserService` has been created at `apps/api/src/services/user.service.ts` that demonstrates how to use MySQL with the `mysql2` driver:

```typescript
import { getMySQLPool } from '../database/connection';

// Create a user
const user = await UserService.createUser({
  email: 'user@example.com',
  username: 'johndoe',
  password: 'securepassword',
  first_name: 'John',
  last_name: 'Doe'
});

// Find user by email
const foundUser = await UserService.findUserByEmail('user@example.com');

// Update user
await UserService.updateUser(userId, {
  bio: 'Updated bio'
});
```

## MySQL vs PostgreSQL Syntax Differences

When migrating queries, note these common differences:

1. **Auto-increment**: 
   - PostgreSQL: `SERIAL`
   - MySQL: `AUTO_INCREMENT`

2. **Boolean type**:
   - PostgreSQL: `BOOLEAN`
   - MySQL: `BOOLEAN` (stored as TINYINT)

3. **JSON operations**:
   - PostgreSQL: `jsonb`, `->>`, `@>`
   - MySQL: `JSON`, `->`, `JSON_CONTAINS()`

4. **String concatenation**:
   - PostgreSQL: `||`
   - MySQL: `CONCAT()`

## Benefits of MySQL

1. **Free and Open Source**: No licensing costs
2. **Wide Adoption**: Extensive community support and resources
3. **Performance**: Excellent performance for most web applications
4. **Compatibility**: Works well with many hosting providers
5. **Tools**: Rich ecosystem of management tools (phpMyAdmin, MySQL Workbench, etc.)

## Migration Notes

- The Neo4j graph database is still used for storing family tree relationships
- MySQL is used for user data, authentication, and application metadata
- Redis continues to be used for caching and session storage

## Troubleshooting

1. **Connection refused error**:
   - Ensure MySQL is running: `sudo service mysql status`
   - Check if port 3306 is not blocked by firewall

2. **Access denied error**:
   - Verify username and password in `.env`
   - Ensure user has proper privileges: `SHOW GRANTS FOR 'niazi_user'@'localhost';`

3. **Database not initialized**:
   - The application will automatically create tables on first run
   - To manually initialize: `mysql -u niazi_user -p niazi_tribe < apps/api/src/database/migrations/init.sql` 