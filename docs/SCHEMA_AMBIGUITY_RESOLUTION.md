# Schema Ambiguity Resolution Guide

## Issue

Drizzle detects schema ambiguity when:
- Target table (`payload_kv`) does NOT exist
- Source tables (`medications_rels`, `_medications_v_rels`) DO exist
- Drizzle prompts: "Is payload_kv created or renamed?" which blocks server startup

## Resolution Steps

### Step 1: Create Database (If Needed)

The database was dropped during resolution. You need to recreate it:

**Option A: Using createdb command (requires CREATEDB privilege)**
```bash
createdb payload
```

**Option B: Using PostgreSQL client**
```bash
psql postgres
CREATE DATABASE payload;
\q
```

**Option C: Using the script (may require privileges)**
```bash
npm run create:dev-db
```

### Step 2: Drop Conflicting Tables (If Database Exists)

If the database exists but has conflicting tables:

```bash
npm run drop:conflicting-tables
```

This will drop:
- `medications_rels` (if exists, 0 rows)
- `_medications_v_rels` (if exists, 0 rows)

### Step 3: Run Migrations

Once the database is clean:

```bash
npm run payload:migrate
```

This will create all tables including `payload_kv` without ambiguity.

### Step 4: Verify

```bash
# Check schema is clean
npm run inspect:db-schema

# Should show no ambiguity
```

## Current Status

- ✅ Push mode disabled by default
- ✅ Migration directory configured
- ✅ Database inspection script created
- ⏳ Database needs to be created manually (permission issue)
- ⏳ Migrations need to be run after DB creation

## Next Steps

1. Create database: `createdb payload` (or use psql)
2. Run migrations: `npm run payload:migrate`
3. Start dev server: `npm run dev`
4. Test endpoints: `curl http://localhost:3001/api/users/me`

