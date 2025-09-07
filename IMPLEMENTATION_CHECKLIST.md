# Implementation Checklist - Post-Development Verification

## 🔍 After Every Feature/Component Implementation

### ✅ Step 1: Component Import Check
Run these commands to verify no direct Ant Design imports:

```bash
# Check for direct Ant Design imports (these should NOT exist)
grep -r "from 'antd'" --include="*.tsx" --include="*.ts" --exclude-dir=node_modules --exclude-dir=.next | grep -v "components/ui"

# If any results show up (except in components/ui/), FIX THEM!
```

**Verification Points:**
- [ ] No `import { Button } from 'antd'` 
- [ ] No `import { Card } from 'antd'`
- [ ] No `import { Row, Col } from 'antd'`
- [ ] Only `import { ... } from '@/components/ui'`

### ✅ Step 2: Duplicate Component Check
```bash
# List all component exports
grep "export" components/ui/*.tsx | grep -v "export default"

# Check if your new component already exists
ls components/ui/ | grep -i "central\|styled"
```

**Before Creating New Component:**
- [ ] Checked `/components/ui/index.ts` exports
- [ ] Searched for similar component names
- [ ] Confirmed no existing component serves this purpose
- [ ] Component name follows pattern: `Central*` or `Styled*`

### ✅ Step 3: Responsive Testing Checklist

**Manual Testing (REQUIRED):**
```bash
# Start dev server
npm run dev

# Test these viewport sizes in browser DevTools
```

- [ ] **Mobile Small** (360px) - Samsung Galaxy S8
  - Text readable without horizontal scroll
  - Buttons fit within screen
  - Tables have horizontal scroll if needed
  
- [ ] **Mobile Medium** (414px) - iPhone 12 Pro
  - All interactive elements accessible
  - No content overflow
  
- [ ] **Tablet** (768px) - iPad
  - Layout adjusts from mobile to tablet
  - Multi-column layouts working
  
- [ ] **Desktop** (1440px) - Standard laptop
  - Full layout visible
  - All features accessible
  
- [ ] **Wide** (1920px) - Full HD
  - Content doesn't stretch too wide
  - Proper max-width constraints

**Code Review Points:**
- [ ] Component uses `useResponsive()` hook
- [ ] Different sizes/layouts for different breakpoints
- [ ] Text has ellipsis for overflow
- [ ] Images/media are responsive

### ✅ Step 4: Custom CSS Detection
```bash
# Search for inline styles (should be minimal)
grep -r "style={{" --include="*.tsx" --exclude-dir=node_modules --exclude-dir=.next

# Search for hardcoded pixel values
grep -r "padding:\|margin:\|width:\|height:" --include="*.tsx" --exclude-dir=node_modules --exclude-dir=.next | grep -E "[0-9]+px"

# Search for custom CSS classes
grep -r "className=" --include="*.tsx" --exclude-dir=node_modules --exclude-dir=.next | grep -v "responsive\|fade\|touch"
```

**Style Verification:**
- [ ] No hardcoded pixel values (use theme tokens)
- [ ] No inline margin/padding (use StyledSpace)
- [ ] No custom border styles (use theme tokens)
- [ ] All colors from theme tokens
- [ ] Using `token.padding`, `token.margin`, etc.

### ✅ Step 5: LAYOUT_CONFIG Usage Check
```bash
# Search for hardcoded responsive values
grep -r "mobile={[0-9]" --include="*.tsx" --exclude-dir=node_modules --exclude-dir=.next
grep -r "tablet={[0-9]" --include="*.tsx" --exclude-dir=node_modules --exclude-dir=.next
grep -r "desktop={[0-9]" --include="*.tsx" --exclude-dir=node_modules --exclude-dir=.next

# These should return NO results (except in layoutConfig.ts)
```

**Grid Layout Verification:**
- [ ] All ResponsiveCol use `{...LAYOUT_CONFIG.pattern}`
- [ ] No hardcoded column spans
- [ ] Check pattern exists in LAYOUT_CONFIG
- [ ] If new pattern needed, added to LAYOUT_CONFIG

## 🚀 Quick Validation Script

Create this as `validate-implementation.sh`:

```bash
#!/bin/bash

echo "🔍 Checking for Direct Ant Design Imports..."
DIRECT_IMPORTS=$(grep -r "from 'antd'" --include="*.tsx" --include="*.ts" --exclude-dir=node_modules --exclude-dir=.next | grep -v "components/ui" | wc -l)
if [ $DIRECT_IMPORTS -gt 0 ]; then
    echo "❌ Found $DIRECT_IMPORTS direct Ant Design imports!"
    grep -r "from 'antd'" --include="*.tsx" --include="*.ts" --exclude-dir=node_modules --exclude-dir=.next | grep -v "components/ui"
else
    echo "✅ No direct Ant Design imports found"
fi

echo ""
echo "🔍 Checking for Hardcoded Responsive Values..."
HARDCODED=$(grep -r "mobile={[0-9]\|tablet={[0-9]\|desktop={[0-9]" --include="*.tsx" --exclude-dir=node_modules --exclude-dir=.next --exclude="layoutConfig.ts" | wc -l)
if [ $HARDCODED -gt 0 ]; then
    echo "❌ Found $HARDCODED hardcoded responsive values!"
else
    echo "✅ No hardcoded responsive values"
fi

echo ""
echo "🔍 Checking for Inline Styles..."
INLINE_STYLES=$(grep -r "style={{" --include="*.tsx" --exclude-dir=node_modules --exclude-dir=.next | wc -l)
echo "⚠️  Found $INLINE_STYLES inline styles (review manually)"

echo ""
echo "📋 Component List:"
ls components/ui/*.tsx 2>/dev/null | xargs -n 1 basename | sed 's/\.tsx$//'
```

## 📊 Performance Checklist

After implementation, check:

- [ ] Build succeeds: `npm run build`
- [ ] No TypeScript errors
- [ ] No console errors in browser
- [ ] Page loads within 3 seconds
- [ ] Responsive transitions are smooth

## 🎯 Common Issues to Check

### Issue 1: Text Overflow
```javascript
// ❌ Problem
<Text>{longTextContent}</Text>

// ✅ Solution
<CentralText ellipsis={{ rows: 2 }}>
  {longTextContent}
</CentralText>
```

### Issue 2: Button Overflow on Mobile
```javascript
// ❌ Problem
<CentralButton icon={<Icon />}>
  Long Button Text
</CentralButton>

// ✅ Solution
<CentralButton icon={<Icon />}>
  {!isMobile && 'Long Button Text'}
</CentralButton>
```

### Issue 3: Table Not Scrollable
```javascript
// ❌ Problem
<Table columns={columns} dataSource={data} />

// ✅ Solution
<CentralTable 
  columns={columns} 
  dataSource={data}
  scroll={{ x: 'max-content' }}
/>
```

### Issue 4: Hardcoded Spacing
```javascript
// ❌ Problem
<div style={{ marginBottom: 24 }}>

// ✅ Solution
<StyledSpace direction="vertical" size="normal">
```

## 🏁 Final Sign-Off Checklist

Before marking task as complete:

- [ ] All imports from `@/components/ui`
- [ ] No duplicate components created
- [ ] Tested on all screen sizes
- [ ] No custom CSS or hardcoded values
- [ ] All grids use LAYOUT_CONFIG
- [ ] Build succeeds without warnings
- [ ] No console errors
- [ ] Text overflow handled
- [ ] Buttons responsive
- [ ] Tables scrollable on mobile

## 🚨 If Checklist Fails

1. **Direct Ant imports found** → Replace with centralized components
2. **Duplicate component exists** → Remove new one, use existing
3. **Not responsive** → Add useResponsive() and breakpoint logic
4. **Custom CSS found** → Replace with theme tokens
5. **Hardcoded values** → Move to LAYOUT_CONFIG

## 📝 Documentation Update

After implementation:
- [ ] Updated component in `/components/ui/index.ts` if new
- [ ] Added to LAYOUT_CONFIG if new pattern
- [ ] Documented any new patterns in DEVELOPMENT_RULES.md

---

**Remember:** This checklist is not optional. Run through it EVERY TIME you implement or modify UI components. It takes 5 minutes and saves hours of debugging.