# Database Migrations Guide

This document explains the database migration strategy for Payload CMS v3 with PostgreSQL.

## Migration Strategy: Migrations-Only (Push Mode Disabled by Default)

We use a **migrations-only strategy** to ensure zero interactive prompts and deterministic schema changes:

- **Default (all environments)**: Push-mode **DISABLED** - uses migrations only
- **Optional**: Push-mode can be enabled by setting `PAYLOAD_DB_PUSH=true` environment variable
- **Production**: Push-mode is **always disabled** (enforced fail-fast)

### Why Migrations-Only by Default?

- **Zero interactive prompts**: Prevents Drizzle from asking "Is table X created or renamed?" which blocks server startup
- **Deterministic**: All schema changes are version-controlled and reproducible
- **Production-ready**: Same workflow in dev and prod
- **Optional push mode**: Can still enable push mode for rapid iteration when needed via `PAYLOAD_DB_PUSH=true`

## Configuration

The migration strategy is configured in `payload.config.ts`:

```typescript
db: postgresAdapter({
  // ... pool settings ...
  migrationDir: path.resolve(__dirname, './migrations'),
  push: process.env.PAYLOAD_DB_PUSH === 'true', // Push-mode only if explicitly enabled
}),
```

**Important:** Push mode is **disabled by default** even in development. This prevents interactive Drizzle prompts that block server startup.

### Enabling Push Mode (Optional)

If you need push mode for rapid schema iteration:

```bash
# In .env.local
PAYLOAD_DB_PUSH=true
```

Then restart your dev server. Push mode will be enabled and logged:
```
[Config] Push mode: ENABLED (PAYLOAD_DB_PUSH=true)
```

**Warning:** Push mode can trigger interactive prompts. Use migrations for production.

## Development Workflow (Migrations-Only)

By default, all schema changes must be made through migrations:

1. **Make schema changes** in your collection files (e.g., add a new field)
2. **Create a migration**: `npm run payload:migrate:create`
3. **Review the migration file** in `migrations/`
4. **Apply the migration**: `npm run payload:migrate`
5. **Restart the dev server** if needed

### Optional: Push-Mode Workflow

If you've enabled push mode (`PAYLOAD_DB_PUSH=true`):

1. **Make schema changes** in your collection files
2. **Restart the dev server** (`npm run dev`)
3. **Payload automatically applies changes** to the database
4. **No migration files needed** - changes are applied directly

**Warning:** Push mode can trigger interactive Drizzle prompts that block server startup. Use migrations for stability.

### Push-Mode Limitations

- **Interactive prompts** - Drizzle may ask "Is table X created or renamed?" which blocks server startup
- **Not suitable for production** - changes are not version-controlled
- **Can cause data loss** - destructive changes (e.g., removing fields) may delete data
- **Not reproducible** - changes can't be reviewed or tested before applying

## Production Workflow (Migration-Mode)

In production, all schema changes must be made through explicit migrations:

1. **Create a migration** using `npm run payload:migrate:create`
2. **Review the migration file** in `migrations/`
3. **Test the migration** in a staging environment
4. **Apply the migration** using `npm run payload:migrate`
5. **Deploy** the code and migration together

### Creating Migrations

#### Automatic Migration Generation

```bash
npm run payload:migrate:create
```

This command:
- Compares your current schema with the database
- Generates a migration file with the necessary changes
- Saves it to `migrations/` with a timestamp

#### Manual Migration Creation

You can also create migration files manually:

1. Create a new file in `migrations/` with format: `YYYYMMDD_HHMMSS.ts`
2. Export `up` and `down` functions:

```typescript
import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    -- Your migration SQL here
    ALTER TABLE "users" ADD COLUMN "new_field" text;
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    -- Rollback SQL here
    ALTER TABLE "users" DROP COLUMN "new_field";
  `)
}
```

3. Update `migrations/index.ts` to include your migration:

```typescript
import * as migration_20251231_184919 from './20251231_184919';
import * as migration_20250101_120000 from './20250101_120000'; // Your new migration

export const migrations = [
  {
    up: migration_20251231_184919.up,
    down: migration_20251231_184919.down,
    name: '20251231_184919'
  },
  {
    up: migration_20250101_120000.up,
    down: migration_20250101_120000.down,
    name: '20250101_120000'
  },
];
```

### Running Migrations

#### Check Migration Status

```bash
npm run payload:migrate:status
```

This shows:
- Which migrations have been applied
- Which migrations are pending
- Current database schema version

#### Apply Migrations

```bash
npm run payload:migrate
```

This:
- Applies all pending migrations in order
- Updates the migration tracking table
- Logs each migration as it runs

#### Rollback Migrations

Payload doesn't have a built-in rollback command. To rollback:

1. Manually run the `down` function from the migration file
2. Or restore from a database backup

## Migration Best Practices

### 1. Always Test Migrations

- Test migrations in a staging environment first
- Use production-like data volumes
- Verify both `up` and `down` functions work

### 2. Keep Migrations Small

- One logical change per migration
- Easier to review, test, and rollback
- Reduces risk of conflicts

### 3. Use Transactions When Possible

- Wrap migrations in transactions for atomicity
- If a migration fails, the database state remains unchanged

### 4. Avoid Data Loss

- Never drop columns without first migrating data
- Use `ALTER TABLE ... ADD COLUMN` instead of recreating tables
- Back up data before destructive migrations

### 5. Document Complex Migrations

- Add comments explaining why the migration is needed
- Document any data transformations
- Include rollback instructions

### 6. Version Control

- Commit migration files to git
- Never edit applied migrations
- Create new migrations for fixes

## Common Migration Scenarios

### Adding a New Field

```typescript
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "users" 
    ADD COLUMN "new_field" text;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "users" 
    DROP COLUMN "new_field";
  `)
}
```

### Changing Field Type

```typescript
export async function up({ db }: MigrateUpArgs): Promise<void> {
  // First, add new column
  await db.execute(sql`
    ALTER TABLE "users" 
    ADD COLUMN "email_new" varchar;
  `)
  
  // Migrate data
  await db.execute(sql`
    UPDATE "users" 
    SET "email_new" = "email"::varchar;
  `)
  
  // Drop old column and rename new one
  await db.execute(sql`
    ALTER TABLE "users" 
    DROP COLUMN "email",
    RENAME COLUMN "email_new" TO "email";
  `)
}
```

### Adding an Index

```typescript
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "users_email_idx" 
    ON "users" USING btree ("email");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS "users_email_idx";
  `)
}
```

## Troubleshooting

### Migration Hangs

**Symptom**: `npm run payload:migrate` hangs indefinitely

**Causes**:
- Database connection timeout
- Locked tables
- Long-running queries

**Solutions**:
1. Check database connectivity: `npm run db:health`
2. Check for locked tables in PostgreSQL
3. Increase connection timeout in `payload.config.ts`
4. Run migrations during low-traffic periods

### Migration Conflicts

**Symptom**: Migration fails with "relation already exists" or similar errors

**Causes**:
- Migration was partially applied
- Manual schema changes outside of migrations
- Conflicting migrations

**Solutions**:
1. Check migration status: `npm run payload:migrate:status`
2. Review database schema manually
3. Create a new migration to fix inconsistencies
4. Consider restoring from backup

### Migration Fails in Production

**Symptom**: Migration works in dev but fails in production

**Causes**:
- Different database versions
- Production data constraints
- Missing permissions

**Solutions**:
1. Test migrations in staging with production-like data
2. Verify database permissions
3. Check PostgreSQL version compatibility
4. Review production database logs

### Push-Mode Not Working in Development

**Symptom**: Schema changes not applied automatically

**Causes**:
- `NODE_ENV` not set to `development`
- `push: false` in config
- Database connection issues

**Solutions**:
1. Verify `NODE_ENV=development`
2. Check `payload.config.ts` has `push: true` in dev
3. Check database connectivity: `npm run db:health`
4. Restart dev server

## Migration Commands Reference

| Command | Description |
|---------|-------------|
| `npm run payload:migrate:status` | Check which migrations have been applied |
| `npm run payload:migrate` | Apply all pending migrations |
| `npm run payload:migrate:create` | Generate a new migration from schema changes |
| `npm run db:health` | Check database connectivity |
| `npm run db:validate-env` | Validate environment variables |

## Migration File Structure

```
migrations/
├── index.ts                    # Migration registry
├── 20251231_184919.ts         # Example migration
└── 20250101_120000.ts         # Another migration
```

Each migration file exports:
- `up({ db, payload, req })`: Apply the migration
- `down({ db, payload, req })`: Rollback the migration

## Environment Variables

Required environment variables for migrations:

- `DATABASE_URL`: PostgreSQL connection string
- `PAYLOAD_SECRET`: Secret key for Payload
- `PAYLOAD_PUBLIC_SERVER_URL`: Public server URL

Validate with: `npm run db:validate-env`

## Production Deployment Checklist

Before deploying migrations to production:

- [ ] All migrations tested in staging
- [ ] Database backup created
- [ ] Migration files reviewed and approved
- [ ] Rollback plan documented
- [ ] Environment variables validated
- [ ] Database health check passed
- [ ] Deployment window scheduled (if needed)
- [ ] Monitoring in place

## Additional Resources

- [Payload CMS Migrations Documentation](https://payloadcms.com/docs/database/migrations)
- [PostgreSQL Migration Best Practices](https://www.postgresql.org/docs/current/ddl-alter.html)
- [Database Migration Patterns](https://martinfowler.com/articles/evodb.html)

