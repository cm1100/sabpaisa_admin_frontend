/**
 * ResponsiveForm
 * Wraps AntD Form to provide single-column layout on mobile and a sticky footer for actions.
 */
'use client';

import React from 'react';
import { Form, FormProps } from 'antd';

interface ResponsiveFormProps extends FormProps {
  children: React.ReactNode;
  footer?: React.ReactNode; // typically action buttons
}

const ResponsiveForm: React.FC<ResponsiveFormProps> = ({ children, footer, layout = 'vertical', ...rest }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Form layout={layout} {...rest}>
        {children}
      </Form>
      {footer && (
        <div
          style={{
            position: 'sticky',
            bottom: 0,
            background: 'var(--app-colorBgElevated, #fff)',
            borderTop: '1px solid var(--app-colorSplit, rgba(5,5,5,0.06))',
            padding: 12,
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 8,
            zIndex: 5,
          }}
        >
          {footer}
        </div>
      )}
    </div>
  );
};

export default ResponsiveForm;

