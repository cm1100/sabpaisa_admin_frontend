/**
 * Apply Ant Design compatibility patch for React 19
 * This must be imported before any Ant Design components
 */
import '@ant-design/v5-patch-for-react-19';

// Export to ensure the module is included
export const antdPatchApplied = true;