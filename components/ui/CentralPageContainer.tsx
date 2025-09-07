/**
 * Centralized PageContainer wrapper
 * Applies layout defaults and tokenized background.
 */

'use client';

import React from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { theme } from 'antd';
import Surface from '@/components/theme/Surface';

type CentralPageContainerProps = React.ComponentProps<typeof PageContainer> & {
  withBackground?: boolean;
};

const CentralPageContainer: React.FC<CentralPageContainerProps> = ({ withBackground = true, token, style, ...props }) => {
  const { token: t } = theme.useToken();
  const resolvedTitle = typeof props.title === 'string'
    ? <span style={{ color: t.colorText }}>{props.title}</span>
    : props.title;
  const resolvedSubTitle = typeof (props as any).subTitle === 'string'
    ? <span style={{ color: t.colorTextSecondary }}>{(props as any).subTitle}</span>
    : (props as any).subTitle;

  const container = (
    <PageContainer
      token={{
        paddingInlinePageContainerContent: t.paddingLG,
        paddingBlockPageContainerContent: t.paddingLG,
        colorBgPageContainer: withBackground ? t.colorBgLayout : 'transparent',
        ...(token as any),
      } as any}
      style={{ minHeight: '60vh', color: t.colorText, ...(style || {}) }}
      {...props}
      title={resolvedTitle}
      subTitle={resolvedSubTitle}
    />
  );

  // Do not wrap with Surface to avoid cascading color/background changes
  return container;
};

export default CentralPageContainer;
