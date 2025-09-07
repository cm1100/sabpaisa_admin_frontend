/**
 * Central UI Components Export
 * All components are centralized and responsive
 */

export { default as StyledCard } from './StyledCard';
export { default as StyledSpace } from './StyledSpace';
export { default as StyledStatistic } from './StyledStatistic';
export { default as CentralButton } from './CentralButton';
export { default as CentralBadge } from './CentralBadge';
export { default as CentralTag } from './CentralTag';
export { default as CentralAlert } from './CentralAlert';
export { default as CentralProgress } from './CentralProgress';
export { default as CentralTable } from './CentralTable';
export { CentralTitle, CentralText, CentralParagraph } from './CentralTypography';
export { default as CentralSegmented } from './CentralSegmented';
export { default as CentralAvatar } from './CentralAvatar';
export { default as CentralTree } from './CentralTree';
export { default as CentralTextArea } from './CentralTextArea';
export { default as SocialButton } from './SocialButton';

// Re-export common Ant Design components that don't need centralization
export { 
  Spin, 
  Tooltip,
  Divider,
  Modal,
  Drawer,
  Dropdown,
  Menu,
  Form,
  Input,
  Select,
  Checkbox,
  Radio,
  Switch,
  DatePicker,
  TimePicker,
  Upload,
  ColorPicker,
  Rate,
  Slider,
  InputNumber,
  Steps,
  Result,
  List,
  Empty,
  Descriptions,
  message,
  ConfigProvider,
  Timeline,
  Tabs,
  TreeSelect,
  App,
  Table,
  Calendar,
  // Layout primitives used internally by ResponsiveGrid wrappers
  Row,
  Col,
  // Disclosure component for ErrorBoundary details, etc.
  Collapse,
  // Common components allowed via central re-export
  Segmented,
  Alert,
  Progress,
  Badge,
  Button,
  Space,
  Card,
  Statistic,
} from 'antd';

// Re-export theme and types separately
export { theme } from 'antd';
export type { UploadProps, ThemeConfig, RowProps, ColProps, TimelineProps } from 'antd';

// Typography convenience export for pages that expect it
export { Typography } from 'antd';

// Re-export Pro Components commonly used in pages via central index
export { PageContainer, ProTable, ProCard, ProConfigProvider, StatisticCard } from '@ant-design/pro-components';
export type { ProColumns } from '@ant-design/pro-components';
// Re-export ProLayout to centralize layout imports as well
export { ProLayout } from '@ant-design/pro-layout';

// Central wrappers for Pro components
export { default as CentralProTable } from './CentralProTable';
export { default as CentralPageContainer } from './CentralPageContainer';

// Alias AntD Tag to the centralized wrapper to enforce consistent coloring
export { default as Tag } from './CentralTag';
// Premium loaders and skeletons
export { default as PremiumLoader } from './PremiumLoader';
export { PremiumSkeleton, SmartLoader } from './PremiumLoader';
