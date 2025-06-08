#!/usr/bin/env node

/**
 * Pre-deployment check script for Railway
 * Validates that the project is properly configured for deployment
 */

const fs = require('fs');
const path = require('path');

const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';

let errors = 0;
let warnings = 0;

function log(message, color = RESET) {
  console.log(`${color}${message}${RESET}`);
}

function checkFile(filePath, description) {
  if (fs.existsSync(filePath)) {
    log(`✓ ${description}`, GREEN);
    return true;
  } else {
    log(`✗ ${description} - Missing: ${filePath}`, RED);
    errors++;
    return false;
  }
}

function checkPackageJson(filePath, requiredScripts = []) {
  if (!fs.existsSync(filePath)) {
    log(`✗ Missing package.json: ${filePath}`, RED);
    errors++;
    return false;
  }

  const packageJson = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  let hasAllScripts = true;

  requiredScripts.forEach(script => {
    if (!packageJson.scripts || !packageJson.scripts[script]) {
      log(`✗ Missing script "${script}" in ${filePath}`, RED);
      errors++;
      hasAllScripts = false;
    }
  });

  if (hasAllScripts && requiredScripts.length > 0) {
    log(`✓ All required scripts found in ${filePath}`, GREEN);
  }

  return hasAllScripts;
}

function checkEnvironmentExample() {
  if (!fs.existsSync('env.example')) {
    log('⚠ Missing env.example file', YELLOW);
    warnings++;
    return false;
  }

  const envExample = fs.readFileSync('env.example', 'utf8');
  const requiredVars = [
    'NODE_ENV',
    'PORT',
    'JWT_SECRET',
    'DATABASE_URL',
    'NEO4J_URI',
    'REDIS_URL'
  ];

  const missingVars = requiredVars.filter(varName => 
    !envExample.includes(`${varName}=`)
  );

  if (missingVars.length > 0) {
    log(`⚠ Missing environment variables in env.example: ${missingVars.join(', ')}`, YELLOW);
    warnings++;
  } else {
    log('✓ All required environment variables documented', GREEN);
  }
}

function checkTypeScriptConfig(servicePath, serviceName) {
  const tsconfigPath = path.join(servicePath, 'tsconfig.json');
  if (!fs.existsSync(tsconfigPath)) {
    log(`✗ Missing tsconfig.json for ${serviceName}`, RED);
    errors++;
    return false;
  }
  log(`✓ TypeScript config found for ${serviceName}`, GREEN);
  return true;
}

function main() {
  log('\n🔍 Railway Pre-Deployment Check\n', BLUE);

  // Check root configuration
  log('Checking root configuration...', BLUE);
  checkFile('package.json', 'Root package.json');
  checkPackageJson('package.json', ['start', 'build', 'start:api', 'start:ui', 'start:gedcom']);
  checkFile('railway.json', 'Railway configuration (API)');
  checkFile('railway-ui.json', 'Railway UI configuration');
  checkFile('railway-gedcom.json', 'Railway GEDCOM configuration');
  checkFile('.gitignore', 'Git ignore file');
  checkEnvironmentExample();

  // Check API service
  log('\nChecking API service...', BLUE);
  checkFile('apps/api/package.json', 'API package.json');
  checkPackageJson('apps/api/package.json', ['start', 'build', 'dev']);
  checkTypeScriptConfig('apps/api', 'API');
  checkFile('apps/api/Dockerfile', 'API Dockerfile');
  checkFile('apps/api/src/health-check.js', 'API health check');

  // Check UI service
  log('\nChecking UI service...', BLUE);
  checkFile('apps/ui/package.json', 'UI package.json');
  checkPackageJson('apps/ui/package.json', ['start', 'build', 'dev']);
  checkTypeScriptConfig('apps/ui', 'UI');
  checkFile('apps/ui/Dockerfile', 'UI Dockerfile');
  checkFile('apps/ui/src/app/api/health/route.ts', 'UI health endpoint');

  // Check GEDCOM service
  log('\nChecking GEDCOM service...', BLUE);
  checkFile('services/gedcom/package.json', 'GEDCOM package.json');
  checkPackageJson('services/gedcom/package.json', ['start', 'build', 'dev']);
  checkTypeScriptConfig('services/gedcom', 'GEDCOM');
  checkFile('services/gedcom/Dockerfile', 'GEDCOM Dockerfile');
  checkFile('services/gedcom/src/health-check.js', 'GEDCOM health check');

  // Check for problematic files
  log('\nChecking for problematic files...', BLUE);
  const problematicFiles = [
    'apps/api/railway.json',
    'apps/ui/railway.json',
    'services/gedcom/railway.json'
  ];

  problematicFiles.forEach(file => {
    if (fs.existsSync(file)) {
      log(`⚠ Found conflicting railway.json in subdirectory: ${file}`, YELLOW);
      warnings++;
    }
  });

  // Check node version
  log('\nChecking Node.js version...', BLUE);
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.split('.')[0].substring(1));
  if (majorVersion >= 18) {
    log(`✓ Node.js version ${nodeVersion} (18+ required)`, GREEN);
  } else {
    log(`✗ Node.js version ${nodeVersion} is too old (18+ required)`, RED);
    errors++;
  }

  // Summary
  log('\n📊 Summary\n', BLUE);
  
  if (errors === 0 && warnings === 0) {
    log('✅ All checks passed! Ready for Railway deployment.', GREEN);
  } else {
    if (errors > 0) {
      log(`❌ Found ${errors} error(s) that must be fixed before deployment.`, RED);
    }
    if (warnings > 0) {
      log(`⚠️  Found ${warnings} warning(s) that should be reviewed.`, YELLOW);
    }
  }

  log('\n📚 Next Steps:', BLUE);
  if (errors === 0) {
    log('1. Set up environment variables in Railway dashboard');
    log('2. Deploy each service separately (API, UI, GEDCOM)');
    log('3. Configure custom domains if needed');
    log('4. Set up database services (PostgreSQL, Redis, Neo4j)');
  } else {
    log('1. Fix the errors listed above');
    log('2. Run this check again: node pre-deployment-check.js');
  }

  process.exit(errors > 0 ? 1 : 0);
}

main(); 