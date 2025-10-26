'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Alert,
  Chip,
  Tooltip,
  IconButton,
} from '@mui/material'
import RefreshIcon from '@mui/icons-material/Refresh'
import SettingsIcon from '@mui/icons-material/Settings'

import { AdvancedStockTable } from '@/app/components/advanced-stock-table'
import { ColumnSettingsDialog } from '@/app/components/column-settings-dialog'
import { TimeRangeSelector } from '@/app/components/time-range-selector'

import { useStockData } from '@/app/hooks/useStockData'
import { useColumnConfig } from '@/app/hooks/useColumnConfig'
import { useTradingTime } from '@/app/hooks/useTradingTime'

import { TIME_OPTIONS, AUTO_REFRESH_INTERVAL } from '@/app/lib/constants'

export default function StockRankingPage() {
  // 数据管理
  const { realTimeData, rangeData, loading, error, loadRealTimeData, loadRangeData, isHydrated: dataHydrated } =
    useStockData()

  // 列配置管理
  const { columnConfig, visibleColumns, toggleColumnVisibility, reorderColumns, resetColumns, isHydrated: columnHydrated } =
    useColumnConfig()

  // 交易时间检查
  const isTradingTime = useTradingTime()

  // UI 状态
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [rangeStart, setRangeStart] = useState(0) // 0925
  const [rangeEnd, setRangeEnd] = useState(1) // 0930
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null)
  const [isHydrated, setIsHydrated] = useState(false)

  // 自动刷新定时器
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // 标记水合完成
  useEffect(() => {
    setIsHydrated(true)
  }, [])

  // 初始化数据
  useEffect(() => {
    const initData = async () => {
      try {
        await loadRealTimeData()
        await loadRangeData(TIME_OPTIONS[0], TIME_OPTIONS[1]) // 0925-0930
      } catch (err) {
        console.error('初始化数据失败:', err)
      }
    }

    initData()
  }, [loadRealTimeData, loadRangeData])

  // 设置自动刷新
  useEffect(() => {
    const setupAutoRefresh = () => {
      // 清除现有定时器
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current)
        refreshIntervalRef.current = null
      }

      // 如果在交易时间，设置自动刷新
      if (isTradingTime) {
        refreshIntervalRef.current = setInterval(async () => {
          try {
            await loadRealTimeData()
            setLastRefreshTime(new Date())
          } catch (err) {
            console.error('自动刷新失败:', err)
          }
        }, AUTO_REFRESH_INTERVAL)
      }
    }

    setupAutoRefresh()

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current)
      }
    }
  }, [isTradingTime, loadRealTimeData])



  // 处理时间范围变化
  const handleRangeChange = async (_event: Event, newValue: number | number[]) => {
    const [start, end] = newValue as number[]
    setRangeStart(start)
    setRangeEnd(end)

    try {
      const startTime = TIME_OPTIONS[start]
      const endTime = TIME_OPTIONS[end]
      await loadRangeData(startTime, endTime)
    } catch (err) {
      console.error('加载区间数据失败:', err)
    }
  }

  // 手动刷新
  const handleManualRefresh = async () => {
    try {
      await loadRealTimeData()
      setLastRefreshTime(new Date())
    } catch (err) {
      console.error('刷新失败:', err)
    }
  }

  // 处理列设置对话框关闭
  const handleColumnVisibilityChange = (key: string, visible: boolean) => {
    toggleColumnVisibility(key as any, visible)
  }

  const handleColumnReorder = (result: any) => {
    reorderColumns(result)
  }

  return (
    <Container maxWidth={false} sx={{ py: 4, px: 2 }}>
      {/* 页面标题 */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          股票龙虎榜数据
        </Typography>
        <Typography variant="body2" color="textSecondary">
          实时股票龙虎榜数据展示
        </Typography>
      </Box>

      {/* 错误提示 */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => {}}>
          {error}
        </Alert>
      )}

      {/* 实时数据部分 */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">实时数据</Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              {isHydrated && isTradingTime && (
                <Chip
                  label="交易中"
                  color="success"
                  size="small"
                  variant="outlined"
                />
              )}
              {isHydrated && lastRefreshTime && (
                <Typography variant="caption" color="textSecondary">
                  最后刷新: {lastRefreshTime.toLocaleTimeString('zh-CN')}
                </Typography>
              )}
              <Tooltip title="刷新">
                <IconButton
                  size="small"
                  onClick={handleManualRefresh}
                  disabled={loading}
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="列设置">
                <IconButton
                  size="small"
                  onClick={() => setSettingsOpen(true)}
                >
                  <SettingsIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          <AdvancedStockTable
            data={realTimeData}
            columns={visibleColumns}
            loading={loading}
            isHydrated={columnHydrated && dataHydrated}
          />
        </CardContent>
      </Card>

      {/* 区间数据部分 */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            区间数据
          </Typography>

          <TimeRangeSelector
            startIndex={rangeStart}
            endIndex={rangeEnd}
            onChange={handleRangeChange}
          />

          <AdvancedStockTable
            data={rangeData}
            columns={visibleColumns}
            loading={loading}
            isHydrated={columnHydrated && dataHydrated}
          />
        </CardContent>
      </Card>

      {/* 列设置对话框 */}
      <ColumnSettingsDialog
        open={settingsOpen}
        columns={columnConfig}
        onClose={() => setSettingsOpen(false)}
        onColumnVisibilityChange={handleColumnVisibilityChange}
        onColumnReorder={handleColumnReorder}
        onReset={resetColumns}
      />
    </Container>
  )
}
