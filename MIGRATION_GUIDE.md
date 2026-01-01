# Slate to Lexical Migration Guide

## Overview

This guide explains how to run the Slate to Lexical migration script for Payload CMS 3.x.

## Prerequisites

1. **Database Backup**: Always create a full database backup before running the migration:
   ```bash
   pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql
   ```

2. **Environment Variables**: Ensure `.env` file contains:
   - `DATABASE_URL` - PostgreSQL connection string
   - `PAYLOAD_SECRET` - Payload secret key
   - `PAYLOAD_PUBLIC_SERVER_URL` - Server URL

## Migration Process

### Step 1: Test Against Database Backup (Recommended)

1. Restore your database backup to a test database
2. Update `DATABASE_URL` in `.env` to point to the test database
3. Run the migration script:
   ```bash
   npm run migrate:slate-to-lexical
   ```

### Step 2: Run Against Production Database

After successful testing:

1. **Create a production backup**:
   ```bash
   pg_dump $DATABASE_URL > production_backup_$(date +%Y%m%d_%H%M%S).sql
   ```

2. **Run the migration script**:
   ```bash
   npm run migrate:slate-to-lexical
   ```

3. **Handle interactive prompts**: The script may prompt you about database schema changes. For the `users_sessions` table, choose:
   - `+ users_sessions` (create table) - if the table doesn't exist
   - Or select the appropriate option based on your database state

## What Gets Migrated

The script migrates the following RichText fields from Slate to Lexical format:

- **Conditions collection**:
  - `bodyPublic`
  - `bodyStudent`
  - `bodyClinician`

- **Medications collection**:
  - `bodyPublic`
  - `bodyStudent`
  - `bodyClinician`

- **GovernancePages collection**:
  - `body`

## Migration Output

The script provides detailed output:
- ✅ Successfully migrated fields
- ❌ Failed migrations (with error messages)
- 📊 Summary of total migrated vs failed fields

## Troubleshooting

### Database Connection Issues

If you see connection errors:
1. Verify `DATABASE_URL` is correct in `.env`
2. Check database server is running
3. Verify network connectivity

### Schema Migration Prompts

If prompted about table creation/renaming:
- Review the options carefully
- Choose the option that matches your database state
- If unsure, consult your database administrator

### Migration Failures

If some fields fail to migrate:
1. Check the error messages in the output
2. Verify the collection and field names exist in your database
3. Ensure you have proper database permissions
4. Review Payload logs for additional details

## Post-Migration Verification

After migration completes:

1. **Verify admin UI**: Access `/admin` and check that RichText fields display correctly
2. **Test content editing**: Create/edit content to ensure Lexical editor works
3. **Check API responses**: Verify API endpoints return Lexical format data
4. **Review database**: Check that data is stored in Lexical format (JSON structure)

## Rollback

If you need to rollback:

1. Restore from your database backup:
   ```bash
   psql $DATABASE_URL < production_backup_YYYYMMDD_HHMMSS.sql
   ```

2. Revert Payload config to use Slate editor (if needed)

## Notes

- The migration is **irreversible** - always backup first
- Migration may take time depending on database size
- The script handles errors gracefully and continues with other fields
- On-the-fly conversion (SlateToLexicalFeature) works before migration, but permanent migration writes Lexical format to database

