/**
 * Centralized Typography Components
 * Fully responsive with theme integration and text overflow handling
 */

'use client';

import React from 'react';
import { Typography, theme } from 'antd';
import { TitleProps } from 'antd/es/typography/Title';
import { TextProps } from 'antd/es/typography/Text';
import { ParagraphProps } from 'antd/es/typography/Paragraph';
import { useResponsive } from '@/hooks/useResponsive';

const { Title: AntTitle, Text: AntText, Paragraph: AntParagraph } = Typography;

interface CentralTitleProps extends TitleProps {
  responsive?: boolean;
  noWrap?: boolean;
  tone?: 'default' | 'inverse' | 'muted';
}

interface CentralTextProps extends TextProps {
  responsive?: boolean;
  noWrap?: boolean;
  tone?: 'default' | 'inverse' | 'muted';
}

interface CentralParagraphProps extends ParagraphProps {
  responsive?: boolean;
}

export const CentralTitle: React.FC<CentralTitleProps> = ({
  level = 1,
  responsive = true,
  noWrap = false,
  tone = 'default',
  ellipsis,
  ...props
}) => {
  const { isMobile, isTablet } = useResponsive();
  const { token } = theme.useToken();
  
  // Responsive level adjustment
  const getLevel = () => {
    if (!responsive) return level;
    if (isMobile) return Math.min(5, level + 1) as 1 | 2 | 3 | 4 | 5;
    if (isTablet) return Math.min(5, level) as 1 | 2 | 3 | 4 | 5;
    return level;
  };

  // Handle text overflow: AntD Title only supports boolean ellipsis
  const getEllipsis = () => {
    if (ellipsis !== undefined) return ellipsis;
    if (noWrap) return true;
    if (responsive && isMobile) return true;
    return false;
  };

  // Tone color mapping
  const color = tone === 'inverse' ? 'var(--color-text-inverse)'
    : tone === 'muted' ? token.colorTextTertiary
    : undefined;

  return (
    <AntTitle
      {...props}
      level={getLevel()}
      ellipsis={getEllipsis()}
      style={{
        ...(props.style as React.CSSProperties),
        // Apply tone color last so it cannot be overridden accidentally
        ...(color ? { color } : {}),
      }}
    />
  );
};

export const CentralText: React.FC<CentralTextProps> = ({
  responsive = true,
  noWrap = false,
  tone = 'default',
  ellipsis,
  ...props
}) => {
  const { isMobile, isTablet } = useResponsive();
  const { token } = theme.useToken();
  
  // Responsive font size
  const getFontSize = () => {
    if (!responsive) return undefined;
    if (isMobile) return token.fontSizeSM;
    if (isTablet) return token.fontSize;
    return undefined;
  };

  // Handle text overflow
  const getEllipsis = () => {
    if (ellipsis !== undefined) return ellipsis;
    if (noWrap) return true;
    return false;
  };

  // Tone color mapping
  const color = tone === 'inverse' ? 'var(--color-text-inverse)'
    : tone === 'muted' ? token.colorTextTertiary
    : undefined;

  return (
    <AntText
      {...props}
      ellipsis={getEllipsis()}
      style={{
        ...(props.style as React.CSSProperties),
        fontSize: getFontSize(),
        wordBreak: responsive && isMobile ? 'break-word' : undefined,
        // Apply tone color last so it cannot be overridden accidentally
        ...(color ? { color } : {}),
      }}
    />
  );
};

export const CentralParagraph: React.FC<CentralParagraphProps> = ({
  responsive = true,
  ellipsis,
  ...props
}) => {
  const { isMobile } = useResponsive();
  const { token } = theme.useToken();
  
  // Responsive ellipsis
  const getEllipsis = () => {
    if (ellipsis !== undefined) return ellipsis;
    if (responsive && isMobile) return { rows: 3, expandable: true };
    return false;
  };

  return (
    <AntParagraph
      {...props}
      ellipsis={getEllipsis()}
      style={{
        fontSize: responsive && isMobile ? token.fontSizeSM : token.fontSize,
        marginBottom: responsive && isMobile ? token.marginSM : token.marginMD,
      }}
    />
  );
};

export default {
  Title: CentralTitle,
  Text: CentralText,
  Paragraph: CentralParagraph,
};
