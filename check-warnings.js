#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const YELLOW = '\x1b[33m';
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const RESET = '\x1b[0m';

console.log('\n🔍 Checking for common deployment warnings...\n');

// Check for duplicate dependencies
function checkDuplicateDependencies(packagePath, serviceName) {
  if (!fs.existsSync(packagePath)) return;
  
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  const allDeps = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies
  };
  
  const depCounts = {};
  const duplicates = [];
  
  Object.keys(allDeps).forEach(dep => {
    const normalizedDep = dep.toLowerCase();
    if (depCounts[normalizedDep]) {
      duplicates.push(dep);
    }
    depCounts[normalizedDep] = (depCounts[normalizedDep] || 0) + 1;
  });
  
  if (duplicates.length > 0) {
    console.log(`${YELLOW}⚠️  ${serviceName}: Found duplicate dependencies: ${duplicates.join(', ')}${RESET}`);
  }
}

// Check for missing TypeScript types
function checkMissingTypes(packagePath, serviceName) {
  if (!fs.existsSync(packagePath)) return;
  
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  const deps = packageJson.dependencies || {};
  const devDeps = packageJson.devDependencies || {};
  
  const missingTypes = [];
  
  Object.keys(deps).forEach(dep => {
    if (!dep.startsWith('@types/') && 
        !devDeps[`@types/${dep}`] && 
        !['express-rate-limit', 'helmet', 'joi', 'winston', 'moment', 'uuid', 'lodash', 'sharp', 'pdf-parse', 'compression', 'ioredis', 'pg', 'amqplib', 'node-cron', 'graphql', 'graphql-tools', 'apollo-server-express', 'cross-env', 'concurrently'].includes(dep)) {
      
      // Check if the package needs types
      const commonPackagesNeedingTypes = ['express', 'cors', 'morgan', 'bcryptjs', 'jsonwebtoken', 'multer', 'nodemailer', 'swagger-jsdoc', 'swagger-ui-express'];
      if (commonPackagesNeedingTypes.includes(dep)) {
        if (!devDeps[`@types/${dep}`]) {
          missingTypes.push(dep);
        }
      }
    }
  });
  
  if (missingTypes.length > 0) {
    console.log(`${YELLOW}⚠️  ${serviceName}: Potentially missing @types for: ${missingTypes.join(', ')}${RESET}`);
  }
}

// Check for deprecated packages
function checkDeprecatedPackages(packagePath, serviceName) {
  if (!fs.existsSync(packagePath)) return;
  
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  const allDeps = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies
  };
  
  const deprecatedPackages = {
    'request': 'Use axios or node-fetch instead',
    'node-sass': 'Use sass (Dart Sass) instead',
    'tslint': 'Use ESLint instead',
    '@angular/http': 'Use @angular/common/http instead',
    'gulp-util': 'Package is deprecated',
    'aws-sdk': 'Consider using @aws-sdk/client-* (v3) for better tree-shaking'
  };
  
  const found = [];
  Object.keys(allDeps).forEach(dep => {
    if (deprecatedPackages[dep]) {
      found.push(`${dep} (${deprecatedPackages[dep]})`);
    }
  });
  
  if (found.length > 0) {
    console.log(`${YELLOW}⚠️  ${serviceName}: Using deprecated packages:\n${found.map(f => `    - ${f}`).join('\n')}${RESET}`);
  }
}

// Check for build output directories
function checkBuildOutputs() {
  const buildDirs = [
    { path: 'apps/api/dist', service: 'API' },
    { path: 'apps/ui/.next', service: 'UI' },
    { path: 'services/gedcom/dist', service: 'GEDCOM' }
  ];
  
  buildDirs.forEach(({ path: dirPath, service }) => {
    if (!fs.existsSync(dirPath)) {
      console.log(`${YELLOW}⚠️  ${service}: Build output directory missing (${dirPath}). Run build before deployment.${RESET}`);
    }
  });
}

// Check for hardcoded values that should be env vars
function checkHardcodedValues() {
  const filesToCheck = [
    'apps/api/src/config/index.ts',
    'apps/ui/src/stores/authStore.ts',
    'services/gedcom/src/index.ts'
  ];
  
  const patterns = [
    { pattern: /localhost:\d+/g, message: 'localhost URLs' },
    { pattern: /127\.0\.0\.1/g, message: '127.0.0.1 references' },
    { pattern: /password\s*[:=]\s*['"`][^'"`]+['"`]/gi, message: 'hardcoded passwords' },
    { pattern: /secret\s*[:=]\s*['"`][^'"`]+['"`]/gi, message: 'hardcoded secrets' }
  ];
  
  filesToCheck.forEach(file => {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      patterns.forEach(({ pattern, message }) => {
        const matches = content.match(pattern);
        if (matches && matches.length > 0) {
          console.log(`${YELLOW}⚠️  ${file}: Found ${message}${RESET}`);
        }
      });
    }
  });
}

// Check for Railway-specific issues
function checkRailwayConfig() {
  // Check if services have different start commands
  const configs = [
    { file: 'railway.json', expected: 'api' },
    { file: 'railway-ui.json', expected: 'ui' },
    { file: 'railway-gedcom.json', expected: 'gedcom' }
  ];
  
  configs.forEach(({ file, expected }) => {
    if (fs.existsSync(file)) {
      const config = JSON.parse(fs.readFileSync(file, 'utf8'));
      const startCommand = config.deploy?.startCommand || '';
      if (!startCommand.includes(expected)) {
        console.log(`${YELLOW}⚠️  ${file}: Start command might be incorrect${RESET}`);
      }
    }
  });
}

// Main execution
console.log('Checking package.json files...\n');

checkDuplicateDependencies('package.json', 'Root');
checkDuplicateDependencies('apps/api/package.json', 'API');
checkDuplicateDependencies('apps/ui/package.json', 'UI');
checkDuplicateDependencies('services/gedcom/package.json', 'GEDCOM');

console.log('\nChecking for missing TypeScript types...\n');

checkMissingTypes('apps/api/package.json', 'API');
checkMissingTypes('apps/ui/package.json', 'UI');
checkMissingTypes('services/gedcom/package.json', 'GEDCOM');

console.log('\nChecking for deprecated packages...\n');

checkDeprecatedPackages('package.json', 'Root');
checkDeprecatedPackages('apps/api/package.json', 'API');
checkDeprecatedPackages('apps/ui/package.json', 'UI');
checkDeprecatedPackages('services/gedcom/package.json', 'GEDCOM');

console.log('\nChecking build outputs...\n');

checkBuildOutputs();

console.log('\nChecking for hardcoded values...\n');

checkHardcodedValues();

console.log('\nChecking Railway configuration...\n');

checkRailwayConfig();

console.log('\n✅ Warning check complete!\n');
console.log('Note: Some warnings may be false positives. Review each one based on your specific use case.\n'); 