'use client'

import { useState, useCallback, useEffect } from 'react'
import { ColumnConfig, StockData } from '@/app/types/stock'

const INITIAL_COLUMN_CONFIG: ColumnConfig[] = [
  { key: 'code', label: '代码', visible: true, order: 0 },
  { key: 'name', label: '名称', visible: true, order: 1 },
  { key: 'sector', label: '板块', visible: true, order: 2 },
  { key: 'currentPrice', label: '现价', visible: true, order: 3 },
  { key: 'changePercent', label: '涨幅(%)', visible: true, order: 4 },
  { key: 'turnover', label: '成交额', visible: true, order: 5 },
  { key: 'actualTurnoverRate', label: '实换手(%)', visible: true, order: 6 },
  { key: 'changeSpeed', label: '涨速', visible: true, order: 7 },
  { key: 'twoMinuteTurnover', label: '2分钟成交额', visible: true, order: 8 },
  { key: 'actualCirculation', label: '实流通', visible: true, order: 9 },
  { key: 'mainBuy', label: '主买', visible: true, order: 10 },
  { key: 'mainSell', label: '主卖', visible: true, order: 11 },
  { key: 'mainNetAmount', label: '净额', visible: true, order: 12 },
  { key: 'mainBuyRatio', label: '主买(%)', visible: true, order: 13 },
  { key: 'mainSellRatio', label: '主卖(%)', visible: true, order: 14 },
  { key: 'netTurnoverRatio', label: '净成(%)', visible: true, order: 15 },
  { key: 'buyFlowRatio', label: '买流(%)', visible: true, order: 16 },
  { key: 'sellFlowRatio', label: '卖流(%)', visible: true, order: 17 },
  { key: 'netFlowRatio', label: '净流(%)', visible: true, order: 18 },
  { key: 'rangeChangePercent', label: '区间涨幅(%)', visible: true, order: 19 },
  { key: 'volumeRatio', label: '量比', visible: true, order: 20 },
  { key: 'consecutiveBoard', label: '连板', visible: true, order: 21 },
  { key: 'amplitude', label: '振幅(%)', visible: true, order: 22 },
  { key: 'totalMarketValue', label: '总市值', visible: true, order: 23 },
  { key: 'circulatingMarketValue', label: '流通值', visible: true, order: 24 },
  { key: 'limitUpLabel', label: '涨停标签', visible: true, order: 25 },
  { key: 'institutionIncreaseAmount', label: '最近季度机构增仓', visible: true, order: 26 },
  { key: 'popularity', label: '人气值', visible: true, order: 27 },
]

// 从localStorage加载保存的列配置
const loadColumnConfigFromStorage = (): ColumnConfig[] => {
  // 在服务器端返回默认配置，避免水合错误
  if (typeof window === 'undefined') {
    return INITIAL_COLUMN_CONFIG
  }
  
  try {
    const saved = localStorage.getItem('stock-table-column-config')
    if (saved) {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed) && parsed.length > 0) {
        // 确保所有列都存在，避免新增列时的问题
        const mergedConfig = INITIAL_COLUMN_CONFIG.map(defaultCol => {
          const savedCol = parsed.find(col => col.key === defaultCol.key)
          return savedCol ? { ...defaultCol, ...savedCol } : defaultCol
        })
        
        // 添加可能缺失的新列
        parsed.forEach(savedCol => {
          if (!mergedConfig.some(col => col.key === savedCol.key)) {
            mergedConfig.push({ ...savedCol, order: mergedConfig.length })
          }
        })
        
        // 确保排序完全一致，避免水合错误
        return mergedConfig.sort((a, b) => {
          // 首先按order排序
          if (a.order !== b.order) {
            return a.order - b.order
          }
          // 如果order相同，按key排序确保一致性
          return a.key.localeCompare(b.key)
        })
      }
    }
  } catch (error) {
    console.warn('Failed to load column config from localStorage:', error)
  }
  return INITIAL_COLUMN_CONFIG
}

export function useColumnConfig() {
  // 始终从默认配置开始，避免服务器和客户端不一致
  const [columnConfig, setColumnConfig] = useState<ColumnConfig[]>(INITIAL_COLUMN_CONFIG)
  const [isHydrated, setIsHydrated] = useState(false)

  // 保存列配置到localStorage
  const saveColumnConfigToStorage = useCallback((config: ColumnConfig[]) => {
    // 在服务器端跳过保存，避免错误
    if (typeof window === 'undefined') {
      return
    }
    
    try {
      localStorage.setItem('stock-table-column-config', JSON.stringify(config))
    } catch (error) {
      console.warn('Failed to save column config to localStorage:', error)
    }
  }, [])

  // 在客户端加载保存的配置
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedConfig = loadColumnConfigFromStorage()
      setColumnConfig(savedConfig)
      setIsHydrated(true)
    }
  }, [])

  // 当列配置变化时自动保存（仅在hydration完成后）
  useEffect(() => {
    if (isHydrated) {
      saveColumnConfigToStorage(columnConfig)
    }
  }, [columnConfig, saveColumnConfigToStorage, isHydrated])

  const toggleColumnVisibility = useCallback((key: keyof StockData, visible: boolean) => {
    setColumnConfig(prev =>
      prev.map(col => (col.key === key ? { ...col, visible } : col))
    )
  }, [])

  const reorderColumns = useCallback((result: any) => {
    if (!result.destination) return

    const items = Array.from(columnConfig)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    const updatedItems = items.map((item, index) => ({
      ...item,
      order: index,
    }))

    setColumnConfig(updatedItems)
  }, [columnConfig])

  const resetColumns = useCallback(() => {
    setColumnConfig(INITIAL_COLUMN_CONFIG)
  }, [])

  const visibleColumns = columnConfig
    .filter(col => col.visible)
    .sort((a, b) => {
      // 首先按order排序
      if (a.order !== b.order) {
        return a.order - b.order
      }
      // 如果order相同，按key排序确保一致性
      return a.key.localeCompare(b.key)
    })

  return {
    columnConfig,
    visibleColumns,
    toggleColumnVisibility,
    reorderColumns,
    resetColumns,
    isHydrated,
  }
}
