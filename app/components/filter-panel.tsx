'use client'

import React, { useState, useMemo } from 'react'
import {
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  TextField,
  FormControlLabel,
  Checkbox,
  Chip,
  Button,
  IconButton,
  Tooltip,
  Slider,
  Divider,
} from '@mui/material'
import {
  ExpandMore,
  FilterList,
  Clear,
  Add,
  Remove,
} from '@mui/icons-material'
import { StockData } from '@/app/types/stock'
import { TableFilters, RangeFilterConfig, MultiSelectFilterConfig } from '@/app/hooks/useTableFilters'

interface FilterPanelProps {
  data: StockData[]
  filters: TableFilters
  onRangeFilterChange: (key: keyof TableFilters, config: RangeFilterConfig) => void
  onMultiSelectFilterChange: (key: keyof TableFilters, config: MultiSelectFilterConfig) => void
  onResetFilters: () => void
  getAvailableOptions: (data: StockData[], key: keyof StockData) => string[]
  isHydrated: boolean
}

export function FilterPanel({
  data,
  filters,
  onRangeFilterChange,
  onMultiSelectFilterChange,
  onResetFilters,
  getAvailableOptions,
  isHydrated,
}: FilterPanelProps) {
  const [expanded, setExpanded] = useState<string | false>(false)

  // 获取数据范围用于滑块
  const getDataRange = useMemo(() => {
    return (key: keyof StockData) => {
      const values = data.map(item => item[key] as number).filter(val => val != null)
      if (values.length === 0) return { min: 0, max: 100 }
      
      const min = Math.min(...values)
      const max = Math.max(...values)
      return { min, max }
    }
  }, [data])

  // 处理数字范围过滤变化
  const handleRangeFilterChange = (key: keyof TableFilters, value: number | number[]) => {
    const [min, max] = Array.isArray(value) ? value : [0, value]
    const currentFilter = filters[key] as RangeFilterConfig
    
    onRangeFilterChange(key, {
      ...currentFilter,
      min: min as number,
      max: max as number,
      enabled: true,
    })
  }

  // 处理多选过滤变化
  const handleMultiSelectChange = (key: keyof TableFilters, value: string, checked: boolean) => {
    const currentFilter = filters[key] as MultiSelectFilterConfig
    const selected = checked
      ? [...currentFilter.selected, value]
      : currentFilter.selected.filter(item => item !== value)
    
    onMultiSelectFilterChange(key, {
      ...currentFilter,
      selected,
      enabled: selected.length > 0,
    })
  }

  // 切换过滤启用状态
  const toggleFilterEnabled = (key: keyof TableFilters, type: 'range' | 'multi') => {
    if (type === 'range') {
      const currentFilter = filters[key] as RangeFilterConfig
      onRangeFilterChange(key, {
        ...currentFilter,
        enabled: !currentFilter.enabled,
      })
    } else {
      const currentFilter = filters[key] as MultiSelectFilterConfig
      onMultiSelectFilterChange(key, {
        ...currentFilter,
        enabled: !currentFilter.enabled,
      })
    }
  }

  // 清除特定过滤
  const clearFilter = (key: keyof TableFilters, type: 'range' | 'multi') => {
    if (type === 'range') {
      onRangeFilterChange(key, { enabled: false })
    } else {
      onMultiSelectFilterChange(key, { selected: [], enabled: false })
    }
  }

  // 计算活跃过滤数量
  const activeFilterCount = Object.values(filters).filter(filter => 
    filter.enabled
  ).length

  if (!isHydrated) {
    return null
  }

  return (
    <Box sx={{ mb: 2 }}>
      <Accordion 
        expanded={expanded !== false}
        onChange={(_, isExpanded) => setExpanded(isExpanded ? 'filters' : false)}
      >
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterList />
            <Typography>数据过滤</Typography>
            {activeFilterCount > 0 && (
              <Chip 
                label={activeFilterCount} 
                size="small" 
                color="primary" 
                variant="filled"
              />
            )}
          </Box>
        </AccordionSummary>
        
        <AccordionDetails>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            
            {/* 数字范围过滤 */}
            <Box>
              <Typography variant="h6" gutterBottom>
                数字范围过滤
              </Typography>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 2 }}>
                {/* 涨幅过滤 */}
                <RangeFilterSection
                  label="涨幅(%)"
                  filterKey="changePercent"
                  filter={filters.changePercent}
                  dataRange={getDataRange('changePercent')}
                  onToggle={() => toggleFilterEnabled('changePercent', 'range')}
                  onClear={() => clearFilter('changePercent', 'range')}
                  onChange={(value) => handleRangeFilterChange('changePercent', value)}
                />
                
                {/* 成交额过滤 */}
                <RangeFilterSection
                  label="成交额"
                  filterKey="turnover"
                  filter={filters.turnover}
                  dataRange={getDataRange('turnover')}
                  onToggle={() => toggleFilterEnabled('turnover', 'range')}
                  onClear={() => clearFilter('turnover', 'range')}
                  onChange={(value) => handleRangeFilterChange('turnover', value)}
                  formatValue={(value) => `${(value / 100000000).toFixed(2)}亿`}
                />
                
                {/* 2分钟成交额过滤 */}
                <RangeFilterSection
                  label="2分钟成交额"
                  filterKey="twoMinuteTurnover"
                  filter={filters.twoMinuteTurnover}
                  dataRange={getDataRange('twoMinuteTurnover')}
                  onToggle={() => toggleFilterEnabled('twoMinuteTurnover', 'range')}
                  onClear={() => clearFilter('twoMinuteTurnover', 'range')}
                  onChange={(value) => handleRangeFilterChange('twoMinuteTurnover', value)}
                  formatValue={(value) => `${(value / 1000000).toFixed(2)}百万`}
                />
                
                {/* 实际流通过滤 */}
                <RangeFilterSection
                  label="实际流通"
                  filterKey="actualCirculation"
                  filter={filters.actualCirculation}
                  dataRange={getDataRange('actualCirculation')}
                  onToggle={() => toggleFilterEnabled('actualCirculation', 'range')}
                  onClear={() => clearFilter('actualCirculation', 'range')}
                  onChange={(value) => handleRangeFilterChange('actualCirculation', value)}
                  formatValue={(value) => `${(value / 100000000).toFixed(2)}亿`}
                />
                
                {/* 净额过滤 */}
                <RangeFilterSection
                  label="净额"
                  filterKey="mainNetAmount"
                  filter={filters.mainNetAmount}
                  dataRange={getDataRange('mainNetAmount')}
                  onToggle={() => toggleFilterEnabled('mainNetAmount', 'range')}
                  onClear={() => clearFilter('mainNetAmount', 'range')}
                  onChange={(value) => handleRangeFilterChange('mainNetAmount', value)}
                  formatValue={(value) => `${(value / 1000000).toFixed(2)}百万`}
                />
              </Box>
            </Box>
            
            <Divider />
            
            {/* 多选过滤 */}
            <Box>
              <Typography variant="h6" gutterBottom>
                多选过滤
              </Typography>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 2 }}>
                {/* 连板过滤 */}
                <MultiSelectFilterSection
                  label="连板"
                  filterKey="consecutiveBoard"
                  filter={filters.consecutiveBoard}
                  options={getAvailableOptions(data, 'consecutiveBoard')}
                  onToggle={() => toggleFilterEnabled('consecutiveBoard', 'multi')}
                  onClear={() => clearFilter('consecutiveBoard', 'multi')}
                  onChange={(value, checked) => handleMultiSelectChange('consecutiveBoard', value, checked)}
                />
                
                {/* 涨停标签过滤 */}
                <MultiSelectFilterSection
                  label="涨停标签"
                  filterKey="limitUpLabel"
                  filter={filters.limitUpLabel}
                  options={getAvailableOptions(data, 'limitUpLabel')}
                  onToggle={() => toggleFilterEnabled('limitUpLabel', 'multi')}
                  onClear={() => clearFilter('limitUpLabel', 'multi')}
                  onChange={(value, checked) => handleMultiSelectChange('limitUpLabel', value, checked)}
                />
                
                {/* 板块过滤 */}
                <MultiSelectFilterSection
                  label="板块"
                  filterKey="sector"
                  filter={filters.sector}
                  options={getAvailableOptions(data, 'sector')}
                  onToggle={() => toggleFilterEnabled('sector', 'multi')}
                  onClear={() => clearFilter('sector', 'multi')}
                  onChange={(value, checked) => handleMultiSelectChange('sector', value, checked)}
                />
              </Box>
            </Box>
            
            {/* 操作按钮 */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button 
                startIcon={<Clear />}
                onClick={onResetFilters}
                disabled={activeFilterCount === 0}
              >
                重置所有过滤
              </Button>
            </Box>
          </Box>
        </AccordionDetails>
      </Accordion>
    </Box>
  )
}

// 数字范围过滤组件
interface RangeFilterSectionProps {
  label: string
  filterKey: string
  filter: RangeFilterConfig
  dataRange: { min: number; max: number }
  onToggle: () => void
  onClear: () => void
  onChange: (value: number | number[]) => void
  formatValue?: (value: number) => string
}

function RangeFilterSection({
  label,
  filter,
  dataRange,
  onToggle,
  onClear,
  onChange,
  formatValue = (value) => value.toFixed(2)
}: RangeFilterSectionProps) {
  const minValue = filter.min ?? dataRange.min
  const maxValue = filter.max ?? dataRange.max
  
  return (
    <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={filter.enabled}
              onChange={onToggle}
            />
          }
          label={label}
        />
        <Tooltip title="清除过滤">
          <IconButton size="small" onClick={onClear}>
            <Clear />
          </IconButton>
        </Tooltip>
      </Box>
      
      {filter.enabled && (
        <Box sx={{ pl: 3 }}>
          <Slider
            value={[minValue, maxValue]}
            onChange={(_, value) => onChange(value)}
            min={dataRange.min}
            max={dataRange.max}
            valueLabelDisplay="auto"
            valueLabelFormat={formatValue}
            step={(dataRange.max - dataRange.min) / 100}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
            <Typography variant="caption">
              最小值: {formatValue(minValue)}
            </Typography>
            <Typography variant="caption">
              最大值: {formatValue(maxValue)}
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  )
}

// 多选过滤组件
interface MultiSelectFilterSectionProps {
  label: string
  filterKey: string
  filter: MultiSelectFilterConfig
  options: string[]
  onToggle: () => void
  onClear: () => void
  onChange: (value: string, checked: boolean) => void
}

function MultiSelectFilterSection({
  label,
  filter,
  options,
  onToggle,
  onClear,
  onChange,
}: MultiSelectFilterSectionProps) {
  const [showAll, setShowAll] = useState(false)
  const displayedOptions = showAll ? options : options.slice(0, 5)
  
  return (
    <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={filter.enabled}
              onChange={onToggle}
            />
          }
          label={label}
        />
        <Tooltip title="清除过滤">
          <IconButton size="small" onClick={onClear}>
            <Clear />
          </IconButton>
        </Tooltip>
      </Box>
      
      {filter.enabled && (
        <Box sx={{ pl: 3, maxHeight: 200, overflow: 'auto' }}>
          {displayedOptions.map(option => (
            <FormControlLabel
              key={option}
              control={
                <Checkbox
                  checked={filter.selected.includes(option)}
                  onChange={(e) => onChange(option, e.target.checked)}
                />
              }
              label={option}
              sx={{ display: 'block', mb: 0.5 }}
            />
          ))}
          
          {options.length > 5 && (
            <Button 
              size="small" 
              startIcon={showAll ? <Remove /> : <Add />}
              onClick={() => setShowAll(!showAll)}
              sx={{ mt: 1 }}
            >
              {showAll ? '收起' : `显示全部 (${options.length})`}
            </Button>
          )}
        </Box>
      )}
    </Box>
  )
}