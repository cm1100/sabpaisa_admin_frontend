/**
 * Advanced Search and Filtering System
 * Implements SOLID principles with comprehensive search capabilities
 */
'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { 
  Input,
  Select,
  DatePicker,
  Drawer,
  Collapse,
  Tag,
  Badge,
  Tooltip,
  Divider,
  Switch,
  Slider,
} from '@/components/ui';
import { StyledSpace as Space, CentralButton as Button } from '@/components/ui';
import { CentralText as Text } from '@/components/ui';
import { ResponsiveRow, ResponsiveCol } from '@/components/layouts/ResponsiveGrid';
import { LAYOUT_CONFIG } from '@/config/layoutConfig';
import {
  SearchOutlined,
  FilterOutlined,
  ClearOutlined,
  SaveOutlined,
  HistoryOutlined,
  SettingOutlined,
  StarOutlined,
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { PremiumCard } from '../ui/PremiumCard';
import { gradients, glassEffects } from '@/styles/theme';

const { RangePicker } = DatePicker;
const { Panel } = Collapse;

interface FilterOption {
  key: string;
  label: string;
  type: 'select' | 'multiSelect' | 'dateRange' | 'numberRange' | 'toggle' | 'text';
  options?: { label: string; value: any; color?: string }[];
  placeholder?: string;
  min?: number;
  max?: number;
}

interface SearchFilter {
  [key: string]: any;
}

interface SavedFilter {
  id: string;
  name: string;
  filters: SearchFilter;
  isDefault: boolean;
  createdAt: Date;
}

interface AdvancedSearchProps {
  onSearch: (query: string, filters: SearchFilter) => void;
  filterOptions: FilterOption[];
  placeholder?: string;
  savedFilters?: SavedFilter[];
  onSaveFilter?: (filter: SavedFilter) => void;
  defaultFilters?: SearchFilter;
  showFilterDrawer?: boolean;
  className?: string;
}

export const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  onSearch,
  filterOptions,
  placeholder = '🔍 Search everything...',
  savedFilters = [],
  onSaveFilter,
  defaultFilters = {},
  showFilterDrawer = true,
  className = '',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilter>(defaultFilters);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [saveFilterName, setSaveFilterName] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Active filter count for badge
  const activeFilterCount = useMemo(() => {
    return Object.values(filters).filter(value => 
      value !== undefined && 
      value !== null && 
      value !== '' && 
      (Array.isArray(value) ? value.length > 0 : true)
    ).length;
  }, [filters]);

  // Handle search with debouncing
  const handleSearch = useCallback((query: string, currentFilters: SearchFilter = filters) => {
    onSearch(query, currentFilters);
    
    // Add to recent searches
    if (query && !recentSearches.includes(query)) {
      setRecentSearches(prev => [query, ...prev.slice(0, 4)]);
    }
  }, [onSearch, filters, recentSearches]);

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    handleSearch(searchQuery, newFilters);
  };

  const clearAllFilters = () => {
    setFilters({});
    setSearchQuery('');
    handleSearch('', {});
  };

  const saveCurrentFilter = () => {
    if (!saveFilterName || !onSaveFilter) return;
    
    const newFilter: SavedFilter = {
      id: Date.now().toString(),
      name: saveFilterName,
      filters: { ...filters },
      isDefault: false,
      createdAt: new Date(),
    };
    
    onSaveFilter(newFilter);
    setSaveFilterName('');
  };

  const renderFilterControl = (option: FilterOption) => {
    const value = filters[option.key];

    switch (option.type) {
      case 'select':
        return (
          <Select
            placeholder={option.placeholder}
            value={value}
            onChange={(val) => handleFilterChange(option.key, val)}
            style={{ width: '100%' }}
            allowClear
            size="large"
          >
            {option.options?.map(opt => (
              <Select.Option key={opt.value} value={opt.value}>
                <Space align="center">
                  {opt.color && (
                    <span
                      style={{
                        display: 'inline-block',
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        background: opt.color,
                      }}
                    />
                  )}
                  {opt.label}
                </Space>
              </Select.Option>
            ))}
          </Select>
        );

      case 'multiSelect':
        return (
          <Select
            mode="multiple"
            placeholder={option.placeholder}
            value={value || []}
            onChange={(val) => handleFilterChange(option.key, val)}
            style={{ width: '100%' }}
            allowClear
            size="large"
            maxTagCount="responsive"
          >
            {option.options?.map(opt => (
              <Select.Option key={opt.value} value={opt.value}>
                <Space align="center">
                  {opt.color && (
                    <span
                      style={{
                        display: 'inline-block',
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        background: opt.color,
                      }}
                    />
                  )}
                  {opt.label}
                </Space>
              </Select.Option>
            ))}
          </Select>
        );

      case 'dateRange':
        return (
          <RangePicker
            value={value}
            onChange={(dates) => handleFilterChange(option.key, dates)}
            style={{ width: '100%' }}
            size="large"
          />
        );

      case 'numberRange':
        return (
          <Slider
            range
            min={option.min || 0}
            max={option.max || 100}
            value={value || [option.min || 0, option.max || 100]}
            onChange={(val) => handleFilterChange(option.key, val)}
            marks={{
              [option.min || 0]: `${option.min || 0}`,
              [option.max || 100]: `${option.max || 100}`,
            }}
          />
        );

      case 'toggle':
        return (
          <Switch
            checked={value || false}
            onChange={(checked) => handleFilterChange(option.key, checked)}
            checkedChildren="Yes"
            unCheckedChildren="No"
          />
        );

      case 'text':
        return (
          <Input
            placeholder={option.placeholder}
            value={value || ''}
            onChange={(e) => handleFilterChange(option.key, e.target.value)}
            allowClear
            size="large"
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className={`advanced-search ${className}`}>
      {/* Main Search Bar */}
      <div style={{
        ...glassEffects.primary,
        borderRadius: '16px',
        padding: '8px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '16px',
      }}>
        <Input
          prefix={<SearchOutlined style={{ color: 'var(--color-primary)', fontSize: 18 }} />}
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            handleSearch(e.target.value);
          }}
          style={{
            flex: 1,
            border: 'none',
            background: 'transparent',
            fontSize: '16px',
            fontWeight: 500,
          }}
          size="large"
          allowClear
        />
        
        <Space>
          {showFilterDrawer && (
            <Tooltip title="Advanced Filters">
              <Badge count={activeFilterCount} offset={[-8, 8]}>
                  <Button
                    icon={<FilterOutlined />}
                    onClick={() => setDrawerVisible(true)}
                    style={{
                    background: activeFilterCount > 0 ? 'var(--color-gradient-primary)' : 'transparent',
                    color: activeFilterCount > 0 ? 'var(--color-white)' : 'var(--color-primary)',
                    border: activeFilterCount > 0 ? 'none' : `1px solid var(--color-primary-alpha-20)`,
                    borderRadius: '12px',
                    fontWeight: 600,
                  }}
                    size="large"
                  >
                    Filters
                  </Button>
              </Badge>
            </Tooltip>
          )}
          
          {activeFilterCount > 0 && (
            <Tooltip title="Clear All Filters">
              <Button
                icon={<ClearOutlined />}
                onClick={clearAllFilters}
                style={{
                  background: 'var(--color-error-alpha-10)',
                  color: 'var(--color-error)',
                  border: '1px solid var(--color-error-alpha-20)',
                  borderRadius: '12px',
                }}
                size="large"
              />
            </Tooltip>
          )}
        </Space>
      </div>

      {/* Active Filters Tags */}
      <AnimatePresence>
        {activeFilterCount > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ marginBottom: 'var(--spacing-lg)' }}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-sm)' }}>
              <Text style={{ fontSize: 'var(--font-size-12)', color: 'var(--color-text-tertiary)', fontWeight: 600 }}>
                ACTIVE FILTERS:
              </Text>
              {Object.entries(filters).map(([key, value]) => {
                if (!value || (Array.isArray(value) && value.length === 0)) return null;
                
                const option = filterOptions.find(opt => opt.key === key);
                const displayValue = Array.isArray(value) ? `${value.length} selected` : String(value);
                
                return (
                  <Tag
                    key={key}
                    closable
                    onClose={() => handleFilterChange(key, undefined)}
                    className={activeFilterCount > 0 ? 'on-primary' : undefined}
                    style={{
                      background: gradients.primary,
                      border: 'none',
                      borderRadius: 12,
                      paddingTop: 'var(--spacing-xs)',
                      paddingBottom: 'var(--spacing-xs)',
                      paddingLeft: 'var(--spacing-md)',
                      paddingRight: 'var(--spacing-md)',
                      fontWeight: 500,
                    }}
                  >
                    {option?.label}: {displayValue}
                  </Tag>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Advanced Filters Drawer */}
      <Drawer
        title={
          <Space align="center">
            <FilterOutlined style={{ color: 'var(--color-primary)' }} />
            <Text strong>Advanced Filters</Text>
          </Space>
        }
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={400}
        extra={
          <Space>
            <Button onClick={clearAllFilters} icon={<ClearOutlined />}>
              Clear All
            </Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={saveCurrentFilter}
              disabled={!saveFilterName}
              style={{
                background: gradients.primary,
                border: 'none',
                borderRadius: '8px',
              }}
            >
              Save
            </Button>
          </Space>
        }
      >
        <div>
          {/* Save Filter Section */}
          {onSaveFilter && (
            <>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Text strong>Save Current Filter</Text>
                <Input
                  placeholder="Enter filter name..."
                  value={saveFilterName}
                  onChange={(e) => setSaveFilterName(e.target.value)}
                  suffix={
                    <Button
                      type="link"
                      icon={<SaveOutlined />}
                      onClick={saveCurrentFilter}
                      disabled={!saveFilterName}
                    />
                  }
                />
              </Space>
              <Divider />
            </>
          )}

          {/* Filter Options */}
          <Collapse
            defaultActiveKey={['filters']}
            ghost
            expandIconPosition="end"
          >
            <Panel
              header={
                <Space>
                  <SettingOutlined />
                  <Text strong>Filter Options</Text>
                </Space>
              }
              key="filters"
            >
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                {filterOptions.map(option => (
                  <Space key={option.key} direction="vertical" style={{ width: '100%' }}>
                    <Text strong>{option.label}</Text>
                    {renderFilterControl(option)}
                  </Space>
                ))}
              </Space>
            </Panel>
          </Collapse>

          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <>
              <Divider />
              <Space direction="vertical" style={{ width: '100%' }}>
                <Space>
                  <HistoryOutlined />
                  <Text strong>Recent Searches</Text>
                </Space>
                <Space wrap>
                  {recentSearches.map(search => (
                    <Tag
                      key={search}
                      style={{ cursor: 'pointer', borderRadius: 12 }}
                      onClick={() => {
                        setSearchQuery(search);
                        handleSearch(search);
                      }}
                    >
                      {search}
                    </Tag>
                  ))}
                </Space>
              </Space>
            </>
          )}
        </div>
      </Drawer>
    </div>
  );
};

export default AdvancedSearch;
