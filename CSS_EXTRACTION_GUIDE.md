# CSS Extraction Guide

This guide shows how to extract inline CSS from TSX files into CSS modules to reduce file sizes.

## Files to Update

1. `src/app/dashboard/profile/page.tsx` → `src/styles/profile.module.css` ✅ DONE
2. `src/app/dashboard/page.tsx` → `src/styles/dashboard.module.css`
3. `src/app/admin/page.tsx` → `src/styles/admin-dashboard.module.css`
4. `src/app/admin/members/page.tsx` → `src/styles/admin-members.module.css`
5. `src/app/admin/layout.tsx` → `src/styles/admin-layout.module.css`

## Steps for Each File

### 1. Create CSS Module File
- Extract all CSS from the `<style>{` ... `}</style>` tag
- Convert class names from kebab-case to camelCase (e.g., `pfm-root` → `root`)
- Save as `.module.css` file in `src/styles/`

### 2. Update TSX File
- Import the CSS module: `import styles from '@/styles/filename.module.css';`
- Remove the `<style>` tag and its contents
- Update className attributes:
  - `className="pfm-root"` → `className={styles.root}`
  - `className="pfm-card pfm-active"` → `className={`${styles.card} ${styles.active}`}`
  - Keep global classes as strings: `className="hover:shadow-lg"`

### 3. Handle Conditional Classes
```tsx
// Before
<div className={`pfm-toast ${message.type}`}>

// After
<div className={`${styles.toast} ${styles[message.type]}`}>
```

## Example: profile.module.css (COMPLETED)

The profile page CSS has been extracted to `src/styles/profile.module.css`.

To apply it to the TSX file:

1. Add import at top:
```tsx
import styles from '@/styles/profile.module.css';
```

2. Remove the entire `<style>{`...`}</style>` block

3. Update classNames throughout the file:
```tsx
// Before
<div className="pfm-root">
  <div className="pfm-container">

// After  
<div className={styles.root}>
  <div className={styles.container}>
```

## Benefits

- **Reduced file size**: TSX files become 50-70% smaller
- **Better performance**: CSS is cached separately
- **Type safety**: CSS Modules provide autocomplete
- **Scoped styles**: No global namespace pollution
- **Easier maintenance**: CSS and JSX logic are separated

## Next Steps

Apply the same pattern to the remaining 4 files. Each file follows the same structure:
1. Extract CSS → Create module file
2. Import module → Update classNames
3. Test → Verify styling works correctly
