# Development Rules & Guidelines - Lessons Learned

## Critical Mistakes Made (What NOT to Do)

### 1. **Using Direct Ant Design Components**
**Mistake:** Initially used `Row`, `Col`, `Button`, `Card`, etc. directly from Ant Design
```javascript
// ❌ WRONG
import { Row, Col, Button, Card } from 'antd';
```
**Why it's wrong:** Breaks centralization principle, no responsive control, inconsistent styling

### 2. **Creating Duplicate Centralized Components**
**Mistake:** Started creating new centralized components without checking existing ones
- Created StyledCard when one might have existed
- Didn't check components/ui folder first
**Why it's wrong:** Leads to confusion, maintenance nightmare, inconsistent behavior

### 3. **Using Inline Styles and Custom CSS**
**Mistake:** Added inline styles for spacing, margins, padding
```javascript
// ❌ WRONG
<div style={{ marginBottom: 16, padding: 24 }}>
<Card style={{ border: '1px solid #ccc' }}>
```
**Why it's wrong:** Not responsive, breaks theme consistency, hard to maintain

### 4. **Hardcoding Responsive Values**
**Mistake:** Used hardcoded column spans instead of LAYOUT_CONFIG
```javascript
// ❌ WRONG
<ResponsiveCol mobile={24} tablet={12} desktop={6}>
```
**Why it's wrong:** No single source of truth, inconsistent layouts, hard to update

### 5. **Not Checking Component Responsiveness**
**Mistake:** Created components without considering mobile/tablet views
- Buttons with text that overflow on mobile
- Tables without horizontal scroll
- Text without ellipsis handling

### 6. **Importing Without Understanding Project Structure**
**Mistake:** Assumed project structure without checking
- Tried to import Row/Col when ResponsiveRow/ResponsiveCol existed
- Didn't check existing centralized components first

## Development Rules (MUST FOLLOW)

### Rule 1: Centralized Components Only
**ALWAYS use centralized components from @/components/ui**
```javascript
// ✅ CORRECT
import { 
  StyledCard, 
  CentralButton, 
  CentralTable,
  CentralText,
  CentralTitle 
} from '@/components/ui';
```

**NEVER import directly from Ant Design for UI components**
```javascript
// ❌ NEVER DO THIS
import { Button, Card, Table } from 'antd';
```

### Rule 2: No Duplicate Components
**Before creating ANY new component:**
1. Check `/components/ui/index.ts` for exports
2. Check if similar component exists
3. Extend existing component rather than create new
4. If must create new, ensure it's truly unique

### Rule 3: Responsive-First Design
**Every component MUST be responsive:**
```javascript
// ✅ CORRECT - Responsive component
export const CentralButton = ({ children, icon, ...props }) => {
  const { isMobile } = useResponsive();
  return (
    <Button size={isMobile ? 'small' : 'middle'}>
      {icon}
      {!isMobile && children} // Hide text on mobile if icon exists
    </Button>
  );
};
```

### Rule 4: No Custom CSS or Inline Styles
**ALWAYS use Ant Design theme tokens:**
```javascript
// ✅ CORRECT
const { token } = theme.useToken();
style={{ 
  padding: token.padding,
  marginBottom: token.marginMD 
}}

// ❌ WRONG
style={{ 
  padding: 16,
  marginBottom: 24 
}}
```

### Rule 5: Use LAYOUT_CONFIG for All Grid Layouts
**NEVER hardcode responsive column values:**
```javascript
// ✅ CORRECT
<ResponsiveCol {...LAYOUT_CONFIG.dashboard.metricCard}>

// ❌ WRONG
<ResponsiveCol mobile={12} tablet={12} desktop={6}>
```

### Rule 6: Component Hierarchy
```
ResponsiveGrid (Container)
  └── ResponsiveRow
      └── ResponsiveCol
          └── StyledCard/CentralComponents
              └── StyledSpace
                  └── CentralButton/CentralText/etc
```

### Rule 7: Always Handle Text Overflow
**Every text component must handle overflow:**
```javascript
// ✅ CORRECT
<CentralText ellipsis={{ rows: 2 }}>
  Long text content...
</CentralText>
```

### Rule 8: Check Before Import
**Before importing ANYTHING:**
1. Check if centralized version exists
2. Use centralized version if available
3. Only import from Ant Design if explicitly listed in components/ui/index.ts as re-export

### Rule 9: Responsive Breakpoints
**Use consistent breakpoints via useResponsive hook:**
- Mobile: < 768px
- Tablet: 768px - 1024px  
- Desktop: 1024px - 1440px
- Wide: 1440px - 1920px
- UltraWide: > 1920px

### Rule 10: Test All Screen Sizes
**Before considering any UI task complete:**
1. Test on mobile (360px, 414px)
2. Test on tablet (768px, 1024px)
3. Test on desktop (1440px)
4. Test on wide screen (1920px+)

## Component Checklist

### When Creating/Modifying Components:
- [ ] Is there already a centralized version?
- [ ] Does it use useResponsive() hook?
- [ ] Does it use theme tokens for styling?
- [ ] Does it handle text overflow?
- [ ] Does it work on all screen sizes?
- [ ] Is it exported from components/ui/index.ts?
- [ ] Does it follow the naming convention (Central*/Styled*)?

### When Using Components:
- [ ] Am I importing from @/components/ui?
- [ ] Am I using LAYOUT_CONFIG for grid layouts?
- [ ] Am I using StyledSpace instead of raw margins?
- [ ] Am I using theme tokens instead of hardcoded values?
- [ ] Have I tested on mobile?

## File Structure Rules

```
/components/ui/
  ├── index.ts           # Central export point (CHECK FIRST!)
  ├── StyledCard.tsx     # Card wrapper
  ├── StyledSpace.tsx    # Space wrapper
  ├── StyledStatistic.tsx # Statistic wrapper
  ├── CentralButton.tsx  # Button wrapper
  ├── CentralTable.tsx   # Table wrapper
  ├── CentralTypography.tsx # Text/Title/Paragraph
  └── Central*.tsx       # Other centralized components

/config/
  ├── layoutConfig.ts    # ALL grid layouts defined here
  └── antdTheme.ts      # Theme configuration

/hooks/
  └── useResponsive.ts  # Responsive detection hook
```

## Common Patterns

### Pattern 1: Responsive Content
```javascript
// Show different content based on screen size
{isMobile ? <MobileView /> : <DesktopView />}

// Hide on mobile
{!isMobile && <DesktopOnlyContent />}

// Responsive text
{isMobile ? 'Short' : 'Long Description Text'}
```

### Pattern 2: Responsive Props
```javascript
size={isMobile ? 'small' : 'middle'}
direction={isMobile ? 'vertical' : 'horizontal'}
columns={isMobile ? 1 : 3}
```

### Pattern 3: Theme Integration
```javascript
const { token } = theme.useToken();

// Use token values
backgroundColor: token.colorBgContainer
borderRadius: token.borderRadius
padding: token.padding
color: token.colorPrimary
```

## Remember: Think Centralized, Think Responsive, Think Ant Design

**The Three Pillars:**
1. **Centralization** - One source of truth for each component
2. **Responsiveness** - Works perfectly on all devices
3. **Ant Design** - Use the design system, don't fight it

**Before writing ANY code, ask:**
- Is there a centralized component for this?
- Will this work on mobile?
- Am I using Ant Design's theme system?

If any answer is "no" or "I don't know" - STOP and check first!