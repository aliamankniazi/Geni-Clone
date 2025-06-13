# Database Migrations

## About init.sql

The `init.sql` file contains the initial MySQL database schema for the Niazi Tribe application. 

### Important Notes

1. **Linter Warnings**: You may see SQL linter warnings in your IDE. These are **false positives** because most IDEs default to SQL Server or generic SQL syntax checking. The file uses **MySQL-specific syntax** which is correct.

2. **MySQL Version**: This schema is designed for MySQL 8.0+ and uses:
   - `utf8mb4` character set for full Unicode support (including emojis)
   - InnoDB storage engine for foreign key support
   - JSON data type for flexible metadata storage

3. **Testing the Schema**: To test if the SQL works correctly:
   ```bash
   cd apps/api
   npm run test:db
   ```

   Or manually:
   ```bash
   mysql -u your_user -p your_database < src/database/migrations/init.sql
   ```

### Schema Overview

The database includes the following tables:

- **users**: User accounts and authentication
- **sessions**: User sessions and refresh tokens  
- **media**: File uploads and media management
- **user_settings**: User preferences and settings
- **activity_logs**: Audit trail of user actions
- **notifications**: User notifications
- **password_reset_tokens**: Password reset functionality
- **email_verifications**: Email verification tokens

### Default Admin User

The schema creates a default admin user:
- Email: `admin@geniclone.com`
- Username: `admin`
- Password: `admin123`

⚠️ **Security Warning**: Change this password immediately after installation!

### Troubleshooting

If you encounter issues:

1. **"Table already exists"**: This is normal if running the script multiple times. The script uses `CREATE TABLE IF NOT EXISTS` to be idempotent.

2. **Foreign key errors**: The initialization code temporarily disables foreign key checks to avoid ordering issues.

3. **Character set errors**: Ensure your MySQL server supports `utf8mb4`. For older MySQL versions, you can replace `utf8mb4` with `utf8`.

4. **Connection errors**: Check your MySQL credentials in the `.env` file:
   ```env
   MYSQL_HOST=localhost
   MYSQL_PORT=3306
   MYSQL_DATABASE=niazi_tribe
   MYSQL_USER=your_user
   MYSQL_PASSWORD=your_password
   ```

### Manual Database Setup

If you prefer to set up the database manually:

 ```sql
 -- Create database
 CREATE DATABASE niazi_tribe CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
 
 -- Create user (optional)
 CREATE USER 'niazi_user'@'localhost' IDENTIFIED BY 'secure_password';
 GRANT ALL PRIVILEGES ON niazi_tribe.* TO 'niazi_user'@'localhost';
 FLUSH PRIVILEGES;
 
 -- Run the schema
 USE niazi_tribe;
 SOURCE /path/to/init.sql;
 ``` 