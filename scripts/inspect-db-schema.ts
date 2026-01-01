#!/usr/bin/env tsx
/**
 * Database Schema Inspection Script
 * 
 * Inspects database to identify schema ambiguity that causes Drizzle prompts.
 * 
 * Usage:
 *   npm run inspect:db-schema
 */

// Load environment variables
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import { Pool } from 'pg';

interface TableInfo {
  name: string;
  exists: boolean;
  rowCount: number;
}

async function inspectDatabase() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL is not set');
    process.exit(1);
  }
  
  console.log('🔍 Inspecting database schema for ambiguity...\n');
  console.log(`Database: ${databaseUrl.replace(/:[^:@]+@/, ':****@')}\n`);
  
  const pool = new Pool({
    connectionString: databaseUrl,
    max: 1,
    connectionTimeoutMillis: 5000,
  });
  
  try {
    const client = await pool.connect();
    
    // List all tables
    console.log('📋 All tables in database:');
    console.log('='.repeat(60));
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);
    
    const allTables = tablesResult.rows.map(row => row.table_name);
    allTables.forEach(table => {
      console.log(`  - ${table}`);
    });
    console.log(`\nTotal tables: ${allTables.length}\n`);
    
    // Check specific tables that Drizzle might want to rename
    const tablesToCheck = [
      'payload_kv',
      'medications_rels',
      '_medications_v_rels',
    ];
    
    console.log('🔍 Checking tables that Drizzle might want to rename:');
    console.log('='.repeat(60));
    
    const tableInfo: TableInfo[] = [];
    
    for (const tableName of tablesToCheck) {
      const existsResult = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        );
      `, [tableName]);
      
      const exists = existsResult.rows[0].exists;
      let rowCount = 0;
      
      if (exists) {
        try {
          const countResult = await client.query(`SELECT COUNT(*) FROM ${tableName};`);
          rowCount = parseInt(countResult.rows[0].count, 10);
        } catch (error) {
          console.error(`  ⚠️  Error counting rows in ${tableName}:`, error instanceof Error ? error.message : error);
        }
      }
      
      tableInfo.push({ name: tableName, exists, rowCount });
      
      console.log(`\n${tableName}:`);
      console.log(`  Exists: ${exists ? '✅ Yes' : '❌ No'}`);
      if (exists) {
        console.log(`  Row count: ${rowCount}`);
      }
    }
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 Summary:');
    console.log('='.repeat(60));
    
    const payloadKvExists = tableInfo.find(t => t.name === 'payload_kv')?.exists || false;
    const medicationsRelsExists = tableInfo.find(t => t.name === 'medications_rels')?.exists || false;
    const medicationsVRelsExists = tableInfo.find(t => t.name === '_medications_v_rels')?.exists || false;
    
    console.log(`\npayload_kv exists: ${payloadKvExists ? '✅ Yes' : '❌ No'}`);
    if (payloadKvExists) {
      const rowCount = tableInfo.find(t => t.name === 'payload_kv')?.rowCount || 0;
      console.log(`  Row count: ${rowCount}`);
    }
    
    console.log(`\nmedications_rels exists: ${medicationsRelsExists ? '✅ Yes' : '❌ No'}`);
    if (medicationsRelsExists) {
      const rowCount = tableInfo.find(t => t.name === 'medications_rels')?.rowCount || 0;
      console.log(`  Row count: ${rowCount}`);
    }
    
    console.log(`\n_medications_v_rels exists: ${medicationsVRelsExists ? '✅ Yes' : '❌ No'}`);
    if (medicationsVRelsExists) {
      const rowCount = tableInfo.find(t => t.name === '_medications_v_rels')?.rowCount || 0;
      console.log(`  Row count: ${rowCount}`);
    }
    
    // Determine ambiguity
    console.log('\n' + '='.repeat(60));
    console.log('🎯 Ambiguity Analysis:');
    console.log('='.repeat(60));
    
    if (!payloadKvExists && (medicationsRelsExists || medicationsVRelsExists)) {
      console.log('\n⚠️  AMBIGUITY DETECTED:');
      console.log('  - payload_kv does NOT exist');
      console.log('  - But potential source tables DO exist');
      console.log('  - Drizzle will prompt: "Is payload_kv created or renamed?"');
      console.log('\n💡 Resolution options:');
      console.log('  A) Fresh dev DB (preferred): Create new DB or drop/recreate');
      console.log('  B) Preserve DB: Create explicit migration to handle rename');
    } else if (payloadKvExists) {
      console.log('\n✅ No ambiguity: payload_kv already exists');
    } else {
      console.log('\n✅ No ambiguity: Clean slate, no conflicting tables');
    }
    
    client.release();
    await pool.end();
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error inspecting database:', error instanceof Error ? error.message : error);
    if (error instanceof Error && error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

inspectDatabase();

