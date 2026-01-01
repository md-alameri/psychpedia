# Admin UI Verification Guide (Post-Migration)

## Overview

This guide helps verify that the Payload CMS admin UI works correctly after migrating RichText fields from Slate to Lexical format.

## Pre-Migration State (Phase 1)

Before running the migration script:
- ✅ Admin UI accessible at `/admin`
- ✅ Lexical editor displays and works
- ✅ `SlateToLexicalFeature` provides on-the-fly conversion
- ✅ Content reads from database in Slate format, converts to Lexical for display
- ✅ New content saves in Slate format (with on-the-fly conversion)

## Post-Migration State (Phase 2)

After running `npm run migrate:slate-to-lexical`:
- ✅ Admin UI accessible at `/admin`
- ✅ Lexical editor displays and works
- ✅ Content reads from database in Lexical format (no conversion needed)
- ✅ New content saves directly in Lexical format
- ✅ No `SlateToLexicalFeature` conversion overhead

## Verification Checklist

### 1. Admin UI Accessibility

- [ ] Navigate to `http://localhost:3001/admin`
- [ ] Verify login page or admin dashboard loads
- [ ] Check for any console errors in browser DevTools
- [ ] Verify no 500 errors in server logs

**Expected Result**: Admin UI loads without errors

### 2. RichText Editor Functionality

For each collection with RichText fields:

#### Conditions Collection
- [ ] Navigate to Conditions collection
- [ ] Open an existing condition document
- [ ] Verify `bodyPublic` field displays correctly in Lexical editor
- [ ] Verify `bodyStudent` field displays correctly in Lexical editor
- [ ] Verify `bodyClinician` field displays correctly in Lexical editor
- [ ] Test editing content in each field
- [ ] Test saving changes
- [ ] Verify formatting (bold, italic, headings, lists) works

#### Medications Collection
- [ ] Navigate to Medications collection
- [ ] Open an existing medication document
- [ ] Verify `bodyPublic` field displays correctly
- [ ] Verify `bodyStudent` field displays correctly
- [ ] Verify `bodyClinician` field displays correctly
- [ ] Test editing and saving

#### GovernancePages Collection
- [ ] Navigate to GovernancePages collection
- [ ] Open an existing governance page
- [ ] Verify `body` field displays correctly
- [ ] Test editing and saving

**Expected Result**: All RichText fields display and edit correctly with Lexical editor

### 3. Content Creation

- [ ] Create a new condition document
- [ ] Add content to `bodyPublic` field using Lexical editor
- [ ] Add formatting (headings, lists, bold, italic)
- [ ] Save the document
- [ ] Reload the document
- [ ] Verify content persists correctly

**Expected Result**: New content saves and loads correctly in Lexical format

### 4. API Verification

Verify API endpoints return Lexical format:

```bash
# Test Conditions API
curl http://localhost:3001/api/conditions

# Test Medications API
curl http://localhost:3001/api/medications

# Test GovernancePages API
curl http://localhost:3001/api/governance-pages
```

**Expected Result**: API responses contain Lexical format JSON (not Slate format)

### 5. Database Format Verification

Check that data is stored in Lexical format in the database:

```sql
-- Check Conditions bodyPublic field
SELECT id, "bodyPublic" FROM conditions LIMIT 1;

-- Check Medications bodyPublic field
SELECT id, "bodyPublic" FROM medications LIMIT 1;

-- Check GovernancePages body field
SELECT id, body FROM "governance-pages" LIMIT 1;
```

**Expected Result**: 
- Lexical format: JSON structure with `root` object containing `children` array
- Slate format: Array of objects with `type`, `children`, etc.

**Lexical Format Example**:
```json
{
  "root": {
    "children": [
      {
        "children": [
          {
            "detail": 0,
            "format": 0,
            "mode": "normal",
            "style": "",
            "text": "Content here",
            "type": "text",
            "version": 1
          }
        ],
        "direction": "ltr",
        "format": "",
        "indent": 0,
        "type": "paragraph",
        "version": 1
      }
    ],
    "direction": "ltr",
    "format": "",
    "indent": 0,
    "type": "root",
    "version": 1
  }
}
```

**Slate Format Example** (old format):
```json
[
  {
    "type": "p",
    "children": [
      {
        "text": "Content here"
      }
    ]
  }
]
```

### 6. Performance Check

- [ ] Verify page load times are acceptable
- [ ] Check that RichText fields load quickly
- [ ] Verify no excessive conversion overhead

**Expected Result**: Fast load times (no conversion overhead after migration)

### 7. Error Checking

- [ ] Check browser console for errors
- [ ] Check server logs for errors
- [ ] Verify no TypeScript errors
- [ ] Check for any migration-related warnings

**Expected Result**: No errors or warnings

## Troubleshooting

### Issue: RichText fields not displaying

**Possible Causes**:
1. Migration didn't complete successfully
2. Data still in Slate format
3. Editor configuration issue

**Solutions**:
1. Check migration script output for errors
2. Verify database contains Lexical format data
3. Check `SlateToLexicalFeature` is still enabled (should work as fallback)

### Issue: Content not saving

**Possible Causes**:
1. Database connection issue
2. Permission issues
3. Validation errors

**Solutions**:
1. Check database connection
2. Verify user permissions
3. Check Payload logs for validation errors

### Issue: Formatting lost

**Possible Causes**:
1. Migration didn't preserve all formatting
2. Custom Slate nodes not converted

**Solutions**:
1. Review migration script output
2. Check if custom converters needed
3. Verify Lexical features are enabled

## Post-Verification Steps

After successful verification:

1. ✅ Mark `test-admin-ui-phase2` as completed
2. ✅ Proceed with `cleanup-old-cms` task
3. ✅ Document any issues encountered
4. ✅ Update team on migration completion

## Notes

- The `SlateToLexicalFeature` can remain enabled as a safety net for any unmigrated content
- After confirming all content is migrated, you can optionally remove `SlateToLexicalFeature` from field configurations
- Keep database backups until you're confident the migration is successful

