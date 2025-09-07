/**
 * Suppress specific console warnings
 * This is a temporary workaround for Ant Design v5 compatibility with React 19
 */
export function suppressAntdReact19Warning() {
  if (typeof window !== 'undefined' && typeof console !== 'undefined') {
    const originalWarn = console.warn;
    const originalError = console.error;
    
    // Suppress both warn and error messages about React 19
    console.warn = (...args) => {
      const message = args[0]?.toString() || '';
      
      // Suppress multiple variations of the Ant Design React 19 warning
      if (
        message.includes('antd v5 support React is 16 ~ 18') ||
        message.includes('compatible') ||
        message.includes('React 19') ||
        message.includes('React version') ||
        message.includes('[antd:')
      ) {
        return;
      }
      
      originalWarn.apply(console, args);
    };
    
    // Also suppress console.error for any related messages
    console.error = (...args) => {
      const message = args[0]?.toString() || '';
      
      if (
        message.includes('antd v5 support React is 16 ~ 18') ||
        message.includes('compatible') ||
        message.includes('[antd:')
      ) {
        return;
      }
      
      originalError.apply(console, args);
    };
  }
}

// Initialize immediately when module loads
suppressAntdReact19Warning();

// Re-apply on next tick to catch late warnings
if (typeof window !== 'undefined') {
  setTimeout(suppressAntdReact19Warning, 0);
  
  // Re-apply after DOM content loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', suppressAntdReact19Warning);
  }
  
  // Re-apply on window load
  window.addEventListener('load', suppressAntdReact19Warning);
}