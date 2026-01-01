# Database Setup Guide - Psychpedia Payload CMS

This guide covers the setup and management of the isolated PostgreSQL database for the Psychpedia Payload CMS project.

## Overview

The Psychpedia project uses a **dedicated, isolated PostgreSQL 16 database** running in Docker. This database is completely separate from other projects (e.g., wecare-db) to ensure:

- **Isolation**: No cross-project database conflicts
- **Stability**: Predictable, reproducible database setup
- **Port Safety**: Uses unique port 5440 (not 5432/5433 used by other projects)
- **Clean Naming**: Container, network, and volume names are prefixed with `psychpedia-`

## Quick Start

### 1. Start the Database

```bash
npm run db:up
```

This command:
- Starts the PostgreSQL 16 container (`psychpedia-db`)
- Creates the database if it doesn't exist
- Exposes the database on port **5440** (host) → 5432 (container)

### 2. Verify Database is Running

```bash
npm run db:status
```

You should see the `psychpedia-db` container running.

### 3. Check Database Health

```bash
npm run db:health
```

This verifies connectivity and performs a simple query test.

### 4. Bootstrap Migration Table (First Time Only)

On a fresh database, you need to create the `payload_migrations` table first:

```bash
docker exec psychpedia-db psql -U psychpedia -d psychpedia -c "CREATE TABLE IF NOT EXISTS payload_migrations (id serial PRIMARY KEY, name varchar, batch numeric, updated_at timestamp(3) with time zone NOT NULL DEFAULT now(), created_at timestamp(3) with time zone NOT NULL DEFAULT now());"
docker exec psychpedia-db psql -U psychpedia -d psychpedia -c "CREATE INDEX IF NOT EXISTS payload_migrations_updated_at_idx ON payload_migrations(updated_at); CREATE INDEX IF NOT EXISTS payload_migrations_created_at_idx ON payload_migrations(created_at);"
```

**Note:** This is only needed for a completely fresh database. If you're resetting the database, the migration table will be recreated automatically.

### 5. Run Migrations

After starting the database, initialize the schema:

```bash
npm run payload:migrate
```

### 6. Start Development Server

```bash
npm run dev
```

The server will connect to the database on `localhost:5440`.

## Database Management Commands

All database commands are available via npm scripts:

| Command | Description |
|---------|-------------|
| `npm run db:up` | Start the database container |
| `npm run db:down` | Stop the database container |
| `npm run db:logs` | View database logs (follow mode) |
| `npm run db:psql` | Connect to database via psql |
| `npm run db:reset` | **WARNING**: Reset database (deletes all data) |
| `npm run db:status` | Check container status |
| `npm run db:health` | Verify database connectivity |

## Connection Details

### Connection String

The database connection string is configured in `.env.local`:

```
DATABASE_URL=postgresql://psychpedia:psychpedia@localhost:5440/psychpedia
```

### Connection Parameters

- **Host**: `localhost`
- **Port**: `5440` (unique port, not 5432/5433)
- **Database**: `psychpedia`
- **User**: `psychpedia`
- **Password**: `psychpedia` (change in production!)

### Direct psql Connection

Connect directly using the npm script:

```bash
npm run db:psql
```

Or manually:

```bash
docker exec -it psychpedia-db psql -U psychpedia -d psychpedia
```

Or from host (if psql is installed locally):

```bash
psql -h localhost -p 5440 -U psychpedia -d psychpedia
```

## Port Configuration

### Why Port 5440?

Port **5440** is used to avoid conflicts with other PostgreSQL instances:

- **Port 5432**: Standard PostgreSQL port (may be used by other projects)
- **Port 5433**: May be used by other projects (e.g., wecare-db)
- **Port 5440**: **Unique port for Psychpedia** (no conflicts)

### Changing the Port

If port 5440 is already in use, you can change it:

1. Update `docker/docker-compose.db.yml`:
   ```yaml
   ports:
     - "YOUR_PORT:5432"  # Change YOUR_PORT to desired port
   ```

2. Update `.env.local`:
   ```
   DATABASE_URL=postgresql://psychpedia:psychpedia@localhost:YOUR_PORT/psychpedia
   ```

3. Restart the database:
   ```bash
   npm run db:down
   npm run db:up
   ```

## Isolation Guarantees

The database setup ensures complete isolation from other projects:

1. **Container Name**: `psychpedia-db` (unique, no conflicts)
2. **Network**: `psychpedia_net` (isolated bridge network)
3. **Volume**: `psychpedia_db_data` (dedicated named volume)
4. **Port**: `5440` (unique host port)
5. **Compose File**: `docker/docker-compose.db.yml` (separate from other projects)

### ⚠️ Important: Never Use Other Project Databases

**DO NOT** reference or connect to databases from other projects:

- ❌ **Never** use `wecare-db` container
- ❌ **Never** use port `5433` (may be used by other projects)
- ❌ **Never** reference other project's compose files
- ✅ **Always** use `psychpedia-db` container
- ✅ **Always** use port `5440`
- ✅ **Always** use `docker/docker-compose.db.yml`

## Migration Workflow

### Default Behavior: Push Mode Disabled

By default, **push mode is disabled** to ensure deterministic migrations:

- Migrations run **only** when explicitly executed via `npm run payload:migrate`
- No interactive prompts during server startup
- Schema changes are tracked in `migrations/` directory

### Running Migrations

1. **Check migration status**:
   ```bash
   npm run payload:migrate:status
   ```

2. **Run pending migrations**:
   ```bash
   npm run payload:migrate
   ```

3. **Create a new migration** (after schema changes):
   ```bash
   npm run payload:migrate:create
   ```

### Enabling Push Mode (Development Only)

⚠️ **Warning**: Push mode automatically applies schema changes and may cause data loss.

To enable push mode temporarily:

1. Set environment variable:
   ```bash
   export PAYLOAD_DB_PUSH=true
   ```

2. Or add to `.env.local`:
   ```
   PAYLOAD_DB_PUSH=true
   ```

3. Restart the development server

**Important**: 
- Push mode is **disabled by default** for safety
- Push mode is **blocked in production** (will throw an error)
- Only enable push mode if you understand the implications

## Resetting the Database

⚠️ **WARNING**: This will **delete all data** in the database!

To completely reset the database:

```bash
npm run db:reset
```

This command:
1. Stops the container
2. **Deletes the volume** (all data is lost)
3. Starts a fresh container with empty database

After resetting, you'll need to:
1. Run migrations: `npm run payload:migrate`
2. Re-seed data if needed

## Troubleshooting

### Database Won't Start

1. **Check if port is in use**:
   ```bash
   lsof -i :5440
   ```

2. **Check Docker is running**:
   ```bash
   docker ps
   ```

3. **Check container logs**:
   ```bash
   npm run db:logs
   ```

### Connection Refused

1. **Verify database is running**:
   ```bash
   npm run db:status
   ```

2. **Check DATABASE_URL in .env.local**:
   ```bash
   cat .env.local | grep DATABASE_URL
   ```

3. **Test connection manually**:
   ```bash
   npm run db:health
   ```

### Migration Issues

1. **Check migration status**:
   ```bash
   npm run payload:migrate:status
   ```

2. **Verify database is accessible**:
   ```bash
   npm run db:health
   ```

3. **Check Payload configuration**:
   ```bash
   npm run db:validate-env
   ```

### Admin UI Hangs

If the admin UI (`http://localhost:3001/admin`) hangs:

1. **Check database connectivity**:
   ```bash
   npm run db:health
   ```

2. **Verify migrations are up to date**:
   ```bash
   npm run payload:migrate:status
   ```

3. **Check server logs** for database connection errors

4. **Ensure push mode is disabled** (unless intentionally enabled):
   ```bash
   # Should not be set, or should be false
   echo $PAYLOAD_DB_PUSH
   ```

## Production Considerations

For production deployment:

1. **Change default password**: Update `POSTGRES_PASSWORD` in `docker-compose.db.yml`
2. **Use environment variables**: Don't hardcode credentials
3. **Enable SSL**: Configure PostgreSQL SSL connections
4. **Backup strategy**: Set up regular database backups
5. **Disable push mode**: Ensure `PAYLOAD_DB_PUSH` is not set
6. **Run migrations**: Execute migrations as part of deployment process

## Docker Compose File Location

The database configuration is in:

```
psychpedia-landing-v2/docker/docker-compose.db.yml
```

This file is **dedicated to Psychpedia** and should never reference other projects.

## Additional Resources

- [Payload CMS Migrations Documentation](https://payloadcms.com/docs/database/migrations)
- [PostgreSQL Docker Image](https://hub.docker.com/_/postgres)
- [Docker Compose Documentation](https://docs.docker.com/compose/)

