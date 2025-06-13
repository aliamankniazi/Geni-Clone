# MySQL Installation Guide

MySQL is not currently installed on your system. Here are several options to get MySQL running:

## Option 1: Use Docker (Recommended for Development)

This is the easiest way to get MySQL running quickly:

```bash
# Run MySQL in Docker
docker run -d --name mysql-niazi -p 3306:3306 -e MYSQL_ROOT_PASSWORD=rootpassword -e MYSQL_DATABASE=niazi_tribe mysql:8.0

# Check if it's running
docker ps

# To stop MySQL
docker stop mysql-niazi

# To start it again
docker start mysql-niazi
```

After starting MySQL in Docker, create a `.env` file in the project root:
```env
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DATABASE=niazi_tribe
MYSQL_USER=root
MYSQL_PASSWORD=rootpassword
```

## Option 2: Install MySQL on Windows

### Download and Install
1. Go to https://dev.mysql.com/downloads/installer/
2. Download "MySQL Installer for Windows"
3. Run the installer and choose "Developer Default"
4. During installation:
   - Set a root password (remember it!)
   - Keep port 3306
   - Install as Windows Service

### After Installation
1. MySQL should start automatically as a Windows service
2. To check if it's running:
   ```powershell
   Get-Service MySQL80
   ```
3. To start MySQL if it's not running:
   ```powershell
   # Run PowerShell as Administrator
   Start-Service MySQL80
   ```

## Option 3: Use Docker Compose (Already Configured)

The project already has MySQL configured in `docker-compose.yml`:

```bash
# Go to project root
cd ../..

# Start all services including MySQL
docker-compose up -d mysql

# Or start all services
docker-compose up -d
```

This will start MySQL with:
- Database: `niazi_tribe`
- User: `niazi_user`
- Password: `niazi_password`
- Root Password: `root_password`

## Testing the Connection

After MySQL is running, test the connection:

```bash
# Go to api directory
cd apps/api

# Run the simple test
node src/database/test-db-simple.js

# Or run the full initialization test
npm run test:db
```

## Quick Start for Development

The fastest way to get started:

```bash
# From project root
docker-compose up -d mysql redis neo4j

# Wait 30 seconds for services to start
timeout 30

# Test the database
cd apps/api
npm run test:db

# Start the development server
cd ../..
npm run dev
```

## Troubleshooting

### Connection Refused
- Make sure MySQL is running (check Docker or Windows service)
- Check if port 3306 is not blocked by firewall
- Verify no other application is using port 3306

### Access Denied
- Check username and password in `.env` file
- For Docker: use the password you set with `-e MYSQL_ROOT_PASSWORD`
- For Windows: use the password you set during installation

### Database Does Not Exist
- The init script will create the database automatically
- Or create manually: `CREATE DATABASE niazi_tribe;`

## Using Without MySQL Installation

If you want to run the application without installing MySQL locally:

1. **Use Cloud MySQL**: Services like PlanetScale, AWS RDS, or Google Cloud SQL
2. **Use SQLite for Development**: Modify the backend to use SQLite (requires code changes)
3. **Use Docker**: The easiest option as shown above

## Environment Variables

Make sure to set these in your `.env` file:

```env
# For local MySQL
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DATABASE=niazi_tribe
MYSQL_USER=root
MYSQL_PASSWORD=your_password

# For Docker Compose MySQL
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DATABASE=niazi_tribe
MYSQL_USER=niazi_user
MYSQL_PASSWORD=niazi_password
``` 