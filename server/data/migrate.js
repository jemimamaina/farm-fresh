#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { queryDatabase } = require('../db');

/**
 * Migration script to execute all queries in sql_script.sql
 * This script will:
 * 1. Read the SQL file
 * 2. Split it into individual statements
 * 3. Execute each statement sequentially
 * 4. Report progress and any errors
 */

async function runMigration() {
  console.log('🚀 Starting Farm Fresh Database Migration...\n');

  try {
    // Read the SQL file
    const sqlFilePath = path.join(__dirname, 'sql_script.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

    // Split SQL content into individual statements
    // Handle multi-line statements and comments
    const statements = parseSqlStatements(sqlContent);

    console.log(`📋 Found ${statements.length} SQL statements to execute\n`);

    let successCount = 0;
    let errorCount = 0;

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim();

      if (!statement) continue; // Skip empty statements

      try {
        console.log(`⚡ Executing statement ${i + 1}/${statements.length}...`);
        console.log(`   ${statement.substring(0, 100)}${statement.length > 100 ? '...' : ''}`);

        await queryDatabase(statement);

        console.log('   ✅ Success\n');
        successCount++;
      } catch (error) {
        console.error(`   ❌ Error: ${error.message}\n`);
        errorCount++;

        // For critical errors (like table creation failures), we might want to stop
        // But for now, continue with other statements
      }
    }

    // Summary
    console.log('📊 Migration Summary:');
    console.log(`   ✅ Successful: ${successCount}`);
    console.log(`   ❌ Failed: ${errorCount}`);
    console.log(`   📈 Total: ${statements.length}`);

    if (errorCount === 0) {
      console.log('\n🎉 Migration completed successfully!');
    } else {
      console.log(`\n⚠️  Migration completed with ${errorCount} errors.`);
      console.log('   Check the output above for details.');
    }

  } catch (error) {
    console.error('💥 Migration failed:', error.message);
    process.exit(1);
  }
}

/**
 * Parse SQL content into individual statements
 * Handles multi-line statements and removes comments
 */
function parseSqlStatements(sqlContent) {
  const statements = [];
  let currentStatement = '';
  let inMultiLineComment = false;

  const lines = sqlContent.split('\n');

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();

    // Handle multi-line comments /* ... */
    if (line.includes('/*')) {
      inMultiLineComment = true;
    }

    if (inMultiLineComment) {
      if (line.includes('*/')) {
        inMultiLineComment = false;
      }
      continue; // Skip comment lines
    }

    // Skip single-line comments
    if (line.startsWith('--')) {
      continue;
    }

    // Add line to current statement
    currentStatement += line + ' ';

    // Check if statement ends with semicolon
    if (line.endsWith(';')) {
      // Remove the semicolon and add to statements
      statements.push(currentStatement.slice(0, -2).trim());
      currentStatement = '';
    }
  }

  // Handle any remaining statement without semicolon (though unlikely)
  if (currentStatement.trim()) {
    statements.push(currentStatement.trim());
  }

  return statements;
}

// Run the migration if this script is executed directly
if (require.main === module) {
  runMigration()
    .then(() => {
      console.log('\n✨ Migration script finished.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Migration script failed:', error);
      process.exit(1);
    });
}

module.exports = { runMigration, parseSqlStatements };