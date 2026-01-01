# Migration Completion Guide

## Current Status

✅ **Hydration Error Fixed**
- Removed `getCurrentUserRole()` calls from server components
- Added `suppressHydrationWarning` to root elements
- Public pages now use constant `hideDosing=true`

✅ **Migration Script Ready**
- Script is tested and working
- Located at: `scripts/migrate-slate-to-lexical.ts`
- Command: `npm run migrate:slate-to-lexical`

## Step 1: Complete the Migration

### Run the Migration Script

```bash
cd psychpedia-landing-v2
npm run migrate:slate-to-lexical
```

### Respond to Interactive Prompts

The migration script will prompt you about database schema changes. When you see:

```
Is users_sessions table created or renamed from another table?
❯ + users_sessions                       create table
  ~ medications_rels › users_sessions    rename table
  ~ _medications_v_rels › users_sessions rename table
```

**Choose the appropriate option:**
- If `users_sessions` doesn't exist: Select `+ users_sessions` (create table)
- If you're unsure: Select `+ users_sessions` (create table) - this is the safest option

### Wait for Completion

The script will migrate:
- **Conditions**: `bodyPublic`, `bodyStudent`, `bodyClinician`
- **Medications**: `bodyPublic`, `bodyStudent`, `bodyClinician`
- **GovernancePages**: `body`

You'll see output like:
```
✅ Successfully migrated conditions.bodyPublic
✅ Successfully migrated conditions.bodyStudent
...
📊 Migration Summary:
   ✅ Successfully migrated: 7 fields
   ❌ Failed: 0 fields
```

## Step 2: Verify Migration

Follow the checklist in `ADMIN_UI_VERIFICATION.md`:

### Quick Verification

1. **Admin UI**: Access `http://localhost:3001/admin`
   - Should load without errors
   - RichText fields should display correctly

2. **Test Content Editing**:
   - Open a condition or medication document
   - Edit a RichText field
   - Save and verify content persists

3. **Check Database Format** (Optional):
   ```sql
   SELECT "bodyPublic" FROM conditions LIMIT 1;
   ```
   Should return Lexical format (JSON with `root` object), not Slate format (array)

4. **API Verification**:
   ```bash
   curl http://localhost:3001/api/conditions
   ```
   Should return Lexical format in JSON responses

## Step 3: Optional - Remove SlateToLexicalFeature

After confirming all data is migrated to Lexical format, you can optionally remove `SlateToLexicalFeature` from field configurations:

### Files to Update

1. `src/collections/Conditions.ts`
2. `src/collections/Medications.ts`
3. `src/collections/GovernancePages.ts`

### Change Required

**Before:**
```typescript
editor: lexicalEditor({
  features: ({ defaultFeatures }) => [
    ...defaultFeatures,
    SlateToLexicalFeature({}), // Remove this line
  ],
}),
```

**After:**
```typescript
editor: lexicalEditor({}),
```

**Also remove the import:**
```typescript
// Remove this import
import { SlateToLexicalFeature } from '@payloadcms/richtext-lexical/migrate';
```

### Why Remove It?

- Reduces conversion overhead
- Data is already in Lexical format
- Cleaner configuration
- Better performance

**Note**: Keep `SlateToLexicalFeature` if you have any unmigrated content or want a safety net.

## Troubleshooting

### Migration Fails

If migration fails:
1. Check error messages in the output
2. Verify database connection (`DATABASE_URL` in `.env`)
3. Ensure you have proper database permissions
4. Review Payload logs for details

### Admin UI Not Working After Migration

1. Check server logs for errors
2. Verify route handlers are correct
3. Check that Payload config loads correctly
4. Verify environment variables are set

### Content Not Displaying

1. Check if data was actually migrated (query database)
2. Verify RichText fields use Lexical editor
3. Check browser console for errors
4. Verify `SlateToLexicalFeature` is still enabled (if needed)

## Success Criteria

✅ Migration script completes without errors
✅ All 7 RichText fields migrated successfully
✅ Admin UI loads and works correctly
✅ Content can be edited and saved
✅ API returns Lexical format
✅ Database contains Lexical format data

## Next Steps After Migration

1. ✅ Verify admin UI (follow `ADMIN_UI_VERIFICATION.md`)
2. ✅ Test content creation and editing
3. ✅ Verify API responses
4. ⚠️ Optional: Remove `SlateToLexicalFeature` from configs
5. ✅ Deploy to production (when ready)

---

**Ready to migrate?** Run `npm run migrate:slate-to-lexical` and follow the prompts!

