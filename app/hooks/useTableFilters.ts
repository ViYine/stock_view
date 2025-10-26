'use client'

import { useState, useCallback, useEffect } from 'react'
import { StockData } from '@/app/types/stock'

// 过滤配置类型定义
export interface RangeFilterConfig {
  min?: number
  max?: number
  enabled: boolean
}

export interface MultiSelectFilterConfig {
  selected: string[]
  enabled: boolean
}

export interface TableFilters {
  // 数字范围过滤
  changePercent: RangeFilterConfig
  turnover: RangeFilterConfig
  twoMinuteTurnover: RangeFilterConfig
  actualCirculation: RangeFilterConfig
  mainNetAmount: RangeFilterConfig
  
  // 多选过滤
  consecutiveBoard: MultiSelectFilterConfig
  limitUpLabel: MultiSelectFilterConfig
  sector: MultiSelectFilterConfig
}

// 默认过滤配置
const DEFAULT_FILTERS: TableFilters = {
  changePercent: { enabled: false },
  turnover: { enabled: false },
  twoMinuteTurnover: { enabled: false },
  actualCirculation: { enabled: false },
  mainNetAmount: { enabled: false },
  consecutiveBoard: { selected: [], enabled: false },
  limitUpLabel: { selected: [], enabled: false },
  sector: { selected: [], enabled: false },
}

// 从localStorage加载保存的过滤配置
const loadFiltersFromStorage = (): TableFilters => {
  // 在服务器端返回默认配置，避免水合错误
  if (typeof window === 'undefined') {
    return DEFAULT_FILTERS
  }
  
  try {
    const saved = localStorage.getItem('stock-table-filters')
    if (saved) {
      const parsed = JSON.parse(saved)
      // 合并保存的配置和默认配置，确保新增字段有默认值
      return { ...DEFAULT_FILTERS, ...parsed }
    }
  } catch (error) {
    console.warn('Failed to load filters from localStorage:', error)
  }
  return DEFAULT_FILTERS
}

// 保存过滤配置到localStorage
const saveFiltersToStorage = (filters: TableFilters) => {
  // 在服务器端跳过保存，避免错误
  if (typeof window === 'undefined') {
    return
  }
  
  try {
    localStorage.setItem('stock-table-filters', JSON.stringify(filters))
  } catch (error) {
    console.warn('Failed to save filters to localStorage:', error)
  }
}

export function useTableFilters() {
  // 始终从默认配置开始，避免服务器和客户端不一致
  const [filters, setFilters] = useState<TableFilters>(DEFAULT_FILTERS)
  const [isHydrated, setIsHydrated] = useState(false)

  // 在客户端加载保存的配置
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedFilters = loadFiltersFromStorage()
      setFilters(savedFilters)
      setIsHydrated(true)
    }
  }, [])

  // 当过滤配置变化时自动保存（仅在hydration完成后）
  useEffect(() => {
    if (isHydrated) {
      saveFiltersToStorage(filters)
    }
  }, [filters, isHydrated])

  // 设置数字范围过滤
  const setRangeFilter = useCallback((key: keyof TableFilters, config: RangeFilterConfig) => {
    setFilters(prev => ({
      ...prev,
      [key]: config
    }))
  }, [])

  // 设置多选过滤
  const setMultiSelectFilter = useCallback((key: keyof TableFilters, config: MultiSelectFilterConfig) => {
    setFilters(prev => ({
      ...prev,
      [key]: config
    }))
  }, [])

  // 重置所有过滤
  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS)
  }, [])

  // 应用过滤到数据
  const applyFilters = useCallback((data: StockData[]): StockData[] => {
    if (!isHydrated) {
      return data
    }

    return data.filter(item => {
      // 检查数字范围过滤
      const rangeFilterKeys: (keyof TableFilters)[] = [
        'changePercent', 'turnover', 'twoMinuteTurnover', 'actualCirculation', 'mainNetAmount'
      ]
      
      for (const key of rangeFilterKeys) {
        const filter = filters[key] as RangeFilterConfig
        if (filter.enabled) {
          const value = item[key as keyof StockData] as number
          if (filter.min !== undefined && value < filter.min) {
            return false
          }
          if (filter.max !== undefined && value > filter.max) {
            return false
          }
        }
      }

      // 检查多选过滤
      const multiSelectKeys: (keyof TableFilters)[] = [
        'consecutiveBoard', 'limitUpLabel', 'sector'
      ]
      
      for (const key of multiSelectKeys) {
        const filter = filters[key] as MultiSelectFilterConfig
        if (filter.enabled && filter.selected.length > 0) {
          const value = item[key as keyof StockData] as string
          
          if (key === 'sector') {
            // 板块需要特殊处理，因为可能包含多个板块用顿号分隔
            const itemSectors = value.split('、').map(s => s.trim())
            const hasMatch = filter.selected.some(selected => 
              itemSectors.some(sector => sector.includes(selected))
            )
            if (!hasMatch) {
              return false
            }
          } else {
            // 连板和涨停标签直接匹配
            if (!filter.selected.includes(value)) {
              return false
            }
          }
        }
      }

      return true
    })
  }, [filters, isHydrated])

  // 获取可用的选项（用于多选过滤）
  const getAvailableOptions = useCallback((data: StockData[], key: keyof StockData): string[] => {
    const values = data.map(item => item[key])
    
    if (key === 'sector') {
      // 板块需要特殊处理，拆分顿号分隔的多个板块
      const allSectors = values.flatMap(value => 
        typeof value === 'string' ? value.split('、').map(s => s.trim()) : []
      )
      return Array.from(new Set(allSectors)).filter(Boolean)
    }
    
    return Array.from(new Set(values.filter(value => value !== '' && value != null))).map(String)
  }, [])

  return {
    filters,
    setRangeFilter,
    setMultiSelectFilter,
    resetFilters,
    applyFilters,
    getAvailableOptions,
    isHydrated,
  }
}