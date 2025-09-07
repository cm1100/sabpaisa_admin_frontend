#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "======================================"
echo "🔍 IMPLEMENTATION VALIDATION SCRIPT"
echo "======================================"
echo ""

# Check 1: Direct Ant Design Imports
echo "1️⃣  Checking for Direct Ant Design Imports..."
DIRECT_IMPORTS=$(grep -r "from 'antd'" --include="*.tsx" --include="*.ts" --exclude-dir=node_modules --exclude-dir=.next | grep -v "components/ui" | wc -l | tr -d ' ')
if [ "$DIRECT_IMPORTS" -gt 0 ]; then
    echo -e "${RED}❌ FAIL: Found $DIRECT_IMPORTS direct Ant Design imports!${NC}"
    echo "Files with violations:"
    grep -r "from 'antd'" --include="*.tsx" --include="*.ts" --exclude-dir=node_modules --exclude-dir=.next | grep -v "components/ui" | cut -d: -f1 | sort | uniq
    FAILED=true
else
    echo -e "${GREEN}✅ PASS: No direct Ant Design imports found${NC}"
fi

echo ""

# Check 2: Hardcoded Responsive Values
echo "2️⃣  Checking for Hardcoded Responsive Values..."
HARDCODED=$(grep -r "mobile={[0-9]\|tablet={[0-9]\|desktop={[0-9]" --include="*.tsx" --exclude-dir=node_modules --exclude-dir=.next --exclude="layoutConfig.ts" | wc -l | tr -d ' ')
if [ "$HARDCODED" -gt 0 ]; then
    echo -e "${RED}❌ FAIL: Found $HARDCODED hardcoded responsive values!${NC}"
    echo "Files with violations:"
    grep -r "mobile={[0-9]\|tablet={[0-9]\|desktop={[0-9]" --include="*.tsx" --exclude-dir=node_modules --exclude-dir=.next --exclude="layoutConfig.ts" | cut -d: -f1 | sort | uniq
    FAILED=true
else
    echo -e "${GREEN}✅ PASS: No hardcoded responsive values${NC}"
fi

echo ""

# Check 3: Custom CSS Classes
echo "3️⃣  Checking for Custom CSS Classes..."
CUSTOM_CSS=$(find . -name "*.css" -o -name "*.scss" -o -name "*.sass" | grep -v node_modules | grep -v .next | wc -l | tr -d ' ')
if [ "$CUSTOM_CSS" -gt 0 ]; then
    echo -e "${YELLOW}⚠️  WARNING: Found $CUSTOM_CSS custom CSS files${NC}"
    find . -name "*.css" -o -name "*.scss" -o -name "*.sass" | grep -v node_modules | grep -v .next
else
    echo -e "${GREEN}✅ PASS: No custom CSS files${NC}"
fi

echo ""

# Check 4: Inline Styles with Pixels
echo "4️⃣  Checking for Hardcoded Pixel Values..."
PIXELS=$(grep -r "style={{" --include="*.tsx" --exclude-dir=node_modules --exclude-dir=.next | grep -E "[0-9]+px" | wc -l | tr -d ' ')
if [ "$PIXELS" -gt 0 ]; then
    echo -e "${YELLOW}⚠️  WARNING: Found $PIXELS inline styles with pixel values${NC}"
    echo "Review these manually - some may be acceptable"
else
    echo -e "${GREEN}✅ PASS: No hardcoded pixel values${NC}"
fi

echo ""

# Check 5: Row/Col Direct Usage (word-boundary match to avoid ResponsiveRow/ResponsiveCol)
echo "5️⃣  Checking for Direct Row/Col Usage..."
ROW_COL=$(grep -Er "import[^;]*\{[^}]*\b(Row|Col)\b" --include="*.tsx" --include="*.ts" --exclude-dir=node_modules --exclude-dir=.next | grep -v "components/layouts" | wc -l | tr -d ' ')
if [ "$ROW_COL" -gt 0 ]; then
    echo -e "${RED}❌ FAIL: Found direct Row/Col imports!${NC}"
    grep -Er "import[^;]*\{[^}]*\b(Row|Col)\b" --include="*.tsx" --include="*.ts" --exclude-dir=node_modules --exclude-dir=.next | grep -v "components/layouts" | cut -d: -f1 | sort | uniq
    FAILED=true
else
    echo -e "${GREEN}✅ PASS: No direct Row/Col usage${NC}"
fi

echo ""

# Check 6: Component Inventory
echo "6️⃣  Centralized Components Inventory:"
echo "------------------------------------"
if [ -d "components/ui" ]; then
    COMPONENT_COUNT=$(ls components/ui/*.tsx 2>/dev/null | wc -l | tr -d ' ')
    echo -e "${GREEN}Found $COMPONENT_COUNT centralized components:${NC}"
    ls components/ui/*.tsx 2>/dev/null | xargs -n 1 basename | sed 's/\.tsx$//' | sed 's/^/  - /'
else
    echo -e "${RED}❌ No components/ui directory found!${NC}"
    FAILED=true
fi

echo ""

# Check 7: LAYOUT_CONFIG Usage
echo "7️⃣  Checking LAYOUT_CONFIG Usage..."
CONFIG_USAGE=$(grep -r "LAYOUT_CONFIG" --include="*.tsx" --exclude-dir=node_modules --exclude-dir=.next | wc -l | tr -d ' ')
if [ "$CONFIG_USAGE" -gt 0 ]; then
    echo -e "${GREEN}✅ LAYOUT_CONFIG is used in $CONFIG_USAGE places${NC}"
else
    echo -e "${YELLOW}⚠️  WARNING: LAYOUT_CONFIG not being used${NC}"
fi

echo ""

# Check 8: useResponsive Hook Usage
echo "8️⃣  Checking useResponsive Hook Usage..."
RESPONSIVE_USAGE=$(grep -r "useResponsive()" --include="*.tsx" --exclude-dir=node_modules --exclude-dir=.next | wc -l | tr -d ' ')
if [ "$RESPONSIVE_USAGE" -gt 0 ]; then
    echo -e "${GREEN}✅ useResponsive hook used in $RESPONSIVE_USAGE files${NC}"
else
    echo -e "${YELLOW}⚠️  WARNING: useResponsive hook not being used${NC}"
fi

echo ""
echo "======================================"
echo "📊 VALIDATION SUMMARY"
echo "======================================"

if [ "$FAILED" = true ]; then
    echo -e "${RED}❌ VALIDATION FAILED${NC}"
    echo "Please fix the issues above before proceeding"
    exit 1
else
    echo -e "${GREEN}✅ ALL CHECKS PASSED${NC}"
    echo "Your implementation follows the centralization rules!"
fi

echo ""
echo "💡 Next Steps:"
echo "1. Test on all screen sizes (360px, 768px, 1440px, 1920px)"
echo "2. Run 'npm run build' to check for build errors"
echo "3. Check browser console for runtime errors"
echo "4. Review IMPLEMENTATION_CHECKLIST.md for manual checks"
