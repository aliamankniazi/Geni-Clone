// Test MySQL Connection for Niazi Tribe
// Run this after installing MySQL: node test-mysql-connection.js

const mysql = require('mysql2/promise');

async function testConnection() {
  console.log('🔍 Testing MySQL connection for Niazi Tribe...\n');
  
  // Read from environment variables or use defaults
  const config = {
    host: process.env.MYSQL_HOST || 'localhost',
    port: process.env.MYSQL_PORT || 3306,
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '', // You'll need to provide this
    database: process.env.MYSQL_DATABASE || 'niazi_tribe'
  };
  
  // Prompt for password if not provided
  if (!config.password && !process.env.MYSQL_PASSWORD) {
    console.log('⚠️  No MySQL password found in environment variables.');
    console.log('Please set MYSQL_PASSWORD environment variable or edit this file.\n');
    console.log('Example:');
    console.log('  SET MYSQL_PASSWORD=your_password && node test-mysql-connection.js');
    console.log('  or');
    console.log('  $env:MYSQL_PASSWORD="your_password"; node test-mysql-connection.js\n');
    process.exit(1);
  }
  
  try {
    // Test 1: Connect to MySQL server
    console.log('1. Connecting to MySQL server...');
    const connection = await mysql.createConnection({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password
    });
    console.log('✅ Connected to MySQL server successfully!\n');
    
    // Test 2: Create database if it doesn't exist
    console.log('2. Creating database if not exists...');
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS ${config.database} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
    console.log(`✅ Database '${config.database}' is ready!\n`);
    
    // Test 3: Use the database
    await connection.query(`USE ${config.database}`);
    
    // Test 4: Check if tables exist
    console.log('3. Checking for existing tables...');
    const [tables] = await connection.query('SHOW TABLES');
    
    if (tables.length === 0) {
      console.log('📝 No tables found. Run the initialization script to create tables.\n');
      console.log('To initialize the database:');
      console.log('  cd apps/api');
      console.log('  npm run test:db\n');
    } else {
      console.log(`✅ Found ${tables.length} tables in the database.\n`);
    }
    
    // Test 5: Display connection info
    console.log('📊 Connection Summary:');
    console.log('─'.repeat(40));
    console.log(`Host:     ${config.host}`);
    console.log(`Port:     ${config.port}`);
    console.log(`User:     ${config.user}`);
    console.log(`Database: ${config.database}`);
    console.log('─'.repeat(40));
    
    await connection.end();
    console.log('\n✨ MySQL is properly configured for Niazi Tribe!');
    console.log('\nNext steps:');
    console.log('1. Copy env.local.example to .env');
    console.log('2. Update the MySQL password in .env');
    console.log('3. Run: npm install');
    console.log('4. Run: npm run dev');
    
  } catch (error) {
    console.error('\n❌ Connection failed!');
    console.error('Error:', error.message);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n💡 Access denied. Check your username and password.');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Connection refused. Make sure MySQL is running.');
      console.error('   - Check Windows Services for MySQL80');
      console.error('   - Or run: net start MySQL80 (as administrator)');
    }
    
    process.exit(1);
  }
}

// Check if mysql2 is installed
try {
  require.resolve('mysql2');
  testConnection();
} catch (e) {
  console.log('⚠️  mysql2 package not found.');
  console.log('\nPlease run: npm install\n');
  process.exit(1);
} 