'use client'

import React, { useState, useMemo, useRef, useEffect } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Box,
  Typography,
  Chip,
  Tooltip,
  IconButton,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Checkbox,
  FormControlLabel,
} from '@mui/material'
import {
  TrendingUp,
  TrendingDown,
  Search,
  FilterList,
  Download,
} from '@mui/icons-material'
import { StockData, ColumnConfig } from '@/app/types/stock'
import { formatCellValue, getValueColor } from '@/app/lib/formatters'

interface AdvancedStockTableProps {
  data: StockData[]
  columns: ColumnConfig[]
  loading: boolean
  isHydrated?: boolean
}

type Order = 'asc' | 'desc'

interface MultiSortConfig {
  key: keyof StockData
  direction: Order
  priority: number // 优先级，数字越小优先级越高
}

export function AdvancedStockTable({
  data,
  columns,
  loading,
  isHydrated: parentHydrated = false,
}: AdvancedStockTableProps) {
  // 从localStorage加载保存的排序配置
  const loadSortConfigFromStorage = (): MultiSortConfig[] => {
    // 在服务器端返回默认配置，避免水合错误
    if (typeof window === 'undefined') {
      return [{ key: 'changePercent', direction: 'desc', priority: 0 }]
    }
    
    try {
      const saved = localStorage.getItem('stock-table-sort-config')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed
        }
      }
    } catch (error) {
      console.warn('Failed to load sort config from localStorage:', error)
    }
    // 默认排序配置
    return [{ key: 'changePercent', direction: 'desc', priority: 0 }]
  }

  // 从localStorage加载ST过滤状态
  const loadFilterSTFromStorage = (): boolean => {
    // 在服务器端返回默认值，避免水合错误
    if (typeof window === 'undefined') {
      return false
    }
    
    try {
      const saved = localStorage.getItem('stock-table-filter-st')
      if (saved) {
        return JSON.parse(saved)
      }
    } catch (error) {
      console.warn('Failed to load ST filter state from localStorage:', error)
    }
    return false
  }

  // 始终从默认值开始，避免服务器和客户端不一致
  const [sortConfigs, setSortConfigs] = useState<MultiSortConfig[]>([{ key: 'changePercent', direction: 'desc', priority: 0 }])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterST, setFilterST] = useState(false)
  const [displayCount, setDisplayCount] = useState(100) // 固定显示100行
  const [exportDialogOpen, setExportDialogOpen] = useState(false)
  const [selectedExportColumns, setSelectedExportColumns] = useState<string[]>([])
  const [isHydrated, setIsHydrated] = useState(false)
  const tableContainerRef = useRef<HTMLDivElement>(null)

  // 标记水合完成并加载保存的状态
  useEffect(() => {
    setIsHydrated(true)
    
    // 在客户端加载保存的状态
    if (typeof window !== 'undefined') {
      const savedSortConfig = loadSortConfigFromStorage()
      const savedFilterST = loadFilterSTFromStorage()
      
      setSortConfigs(savedSortConfig)
      setFilterST(savedFilterST)
    }
  }, [])

  // 使用传入的列配置，不再重复计算
  const visibleColumns = columns

  // 过滤和排序数据
  const processedData = useMemo(() => {
    // 在 hydration 完成前，只进行基本的默认排序，避免服务器和客户端不一致
    if (!isHydrated) {
      return [...data].sort((a, b) => {
        // 默认按涨幅降序排序
        return (b.changePercent || 0) - (a.changePercent || 0)
      })
    }

    let filteredData = data

    // ST股票过滤
    if (filterST) {
      filteredData = data.filter(item => !item.name.includes('ST'))
    }

    // 搜索过滤
    if (searchTerm) {
      filteredData = filteredData.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.code.includes(searchTerm) ||
        item.sector.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.limitUpLabel && item.limitUpLabel.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.consecutiveBoard && item.consecutiveBoard.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // 多列排序
    filteredData.sort((a, b) => {
      // 按照优先级顺序进行排序
      for (const sortConfig of sortConfigs.sort((x, y) => x.priority - y.priority)) {
        const aValue = a[sortConfig.key]
        const bValue = b[sortConfig.key]
        
        if (aValue !== bValue) {
          if (sortConfig.direction === 'asc') {
            return aValue < bValue ? -1 : 1
          } else {
            return aValue > bValue ? -1 : 1
          }
        }
      }
      
      // 如果所有排序字段都相等，则保持原顺序
      return 0
    })

    return filteredData
  }, [data, searchTerm, sortConfigs, filterST, isHydrated])

  // 保存排序配置到localStorage（仅在hydration完成后）
  useEffect(() => {
    if (!isHydrated || typeof window === 'undefined') {
      return
    }
    
    try {
      localStorage.setItem('stock-table-sort-config', JSON.stringify(sortConfigs))
    } catch (error) {
      console.warn('Failed to save sort config to localStorage:', error)
    }
  }, [sortConfigs, isHydrated])

  // 保存ST过滤状态到localStorage（仅在hydration完成后）
  useEffect(() => {
    if (!isHydrated || typeof window === 'undefined') {
      return
    }
    
    try {
      localStorage.setItem('stock-table-filter-st', JSON.stringify(filterST))
    } catch (error) {
      console.warn('Failed to save ST filter state to localStorage:', error)
    }
  }, [filterST, isHydrated])

  // 处理多列排序（支持右键点击切换方向）
  const handleSort = (key: keyof StockData, event?: React.MouseEvent) => {
    const isRightClick = event?.type === 'contextmenu' || event?.button === 2
    
    setSortConfigs(prevConfigs => {
      const existingConfigIndex = prevConfigs.findIndex(config => config.key === key)
      
      if (existingConfigIndex >= 0) {
        // 如果已经存在该列的排序配置
        const existingConfig = prevConfigs[existingConfigIndex]
        
        if (isRightClick) {
          // 右键点击：直接切换方向
          const updatedConfigs = [...prevConfigs]
          updatedConfigs[existingConfigIndex] = {
            ...existingConfig,
            direction: existingConfig.direction === 'asc' ? 'desc' : 'asc'
          }
          return updatedConfigs
        } else {
          // 左键点击：升序 -> 降序 -> 移除
          if (existingConfig.direction === 'asc') {
            // 如果当前是升序，切换到降序
            const updatedConfigs = [...prevConfigs]
            updatedConfigs[existingConfigIndex] = {
              ...existingConfig,
              direction: 'desc'
            }
            return updatedConfigs
          } else {
            // 如果当前是降序，移除该列的排序配置
            return prevConfigs.filter((_, index) => index !== existingConfigIndex)
          }
        }
      } else {
        // 如果不存在该列的排序配置，添加新的排序配置
        const newConfig: MultiSortConfig = {
          key,
          direction: isRightClick ? 'asc' : 'desc', // 右键默认升序，左键默认降序
          priority: prevConfigs.length > 0 ? Math.max(...prevConfigs.map(c => c.priority)) + 1 : 0
        }
        return [...prevConfigs, newConfig]
      }
    })
  }

  // 获取列的排序图标
  const getSortIcon = (key: keyof StockData) => {
    const config = sortConfigs.find(c => c.key === key)
    if (!config) return null
    
    if (config.direction === 'asc') {
      return <TrendingUp fontSize="small" />
    } else {
      return <TrendingDown fontSize="small" />
    }
  }

  // 获取列的排序优先级显示
  const getSortPriority = (key: keyof StockData) => {
    const config = sortConfigs.find(c => c.key === key)
    if (!config) return null
    
    const priorityIndex = sortConfigs
      .sort((a, b) => a.priority - b.priority)
      .findIndex(c => c.key === key)
    
    return priorityIndex >= 0 ? priorityIndex + 1 : null
  }

  // 滚动加载逻辑
  useEffect(() => {
    const handleScroll = () => {
      if (tableContainerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = tableContainerRef.current
        // 当滚动到底部时，加载更多数据
        if (scrollTop + clientHeight >= scrollHeight - 50 && displayCount < processedData.length) {
          setDisplayCount(prev => Math.min(prev + 50, processedData.length))
        }
      }
    }

    const container = tableContainerRef.current
    if (container) {
      container.addEventListener('scroll', handleScroll)
      return () => container.removeEventListener('scroll', handleScroll)
    }
  }, [displayCount, processedData.length])

  const displayedRows = processedData.slice(0, displayCount)

  // 导出功能
  const handleExport = () => {
    // 如果没有选择列，默认导出所有可见列
    const columnsToExport = selectedExportColumns.length > 0 
      ? selectedExportColumns 
      : visibleColumns.map(col => col.key)
    
    // 生成CSV内容
    const headers = columnsToExport.map(key => {
      const column = columns.find(col => col.key === key)
      return column ? column.label : key
    }).join(',')
    
    const csvRows = processedData.map(row => {
      return columnsToExport.map(key => {
        const value = row[key as keyof StockData]
        // 处理特殊字符和逗号
        let cellValue = formatCellValue(key as keyof StockData, value)
        // 如果包含逗号或引号，用引号包裹
        if (typeof cellValue === 'string' && (cellValue.includes(',') || cellValue.includes('"'))) {
          cellValue = `"${cellValue.replace(/"/g, '""')}"`
        }
        return cellValue
      }).join(',')
    })
    
    const csvContent = [headers, ...csvRows].join('\n')
    
    // 创建下载链接
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `stock_data_${new Date().toISOString().slice(0, 10)}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    setExportDialogOpen(false)
  }

  const handleExportDialogOpen = () => {
    // 默认选择所有可见列
    setSelectedExportColumns(visibleColumns.map(col => col.key))
    setExportDialogOpen(true)
  }

  const handleExportColumnToggle = (columnKey: string) => {
    setSelectedExportColumns(prev => 
      prev.includes(columnKey)
        ? prev.filter(key => key !== columnKey)
        : [...prev, columnKey]
    )
  }



  if (loading && data.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Paper elevation={2} sx={{ width: '100%', overflow: 'hidden' }}>
      {/* 搜索栏 */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="搜索股票名称、代码、板块、涨停标签或连板说明..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search color="action" />
                </InputAdornment>
              ),
            }}
            size="small"
          />
          <Chip 
            label="ST股票过滤"
            clickable
            color={isHydrated && filterST ? "primary" : "default"}
            variant={isHydrated && filterST ? "filled" : "outlined"}
            onClick={() => setFilterST(!filterST)}
            sx={{ minWidth: 100 }}
          />
          <Tooltip title="导出数据">
            <IconButton 
              color="primary" 
              onClick={handleExportDialogOpen}
              sx={{ border: '1px solid', borderColor: 'primary.main' }}
            >
              <Download fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
        
        {isHydrated && (searchTerm || filterST) && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip 
              label={`搜索结果: ${processedData.length} 条`} 
              size="small" 
              color="primary" 
              variant="outlined"
            />
            {searchTerm && (
              <IconButton size="small" onClick={() => setSearchTerm('')}>
                <FilterList fontSize="small" />
              </IconButton>
            )}
            {filterST && (
              <Chip 
                label="已过滤ST股票" 
                size="small" 
                color="secondary" 
                variant="outlined"
              />
            )}
          </Box>
        )}
      </Box>

      <TableContainer 
        ref={tableContainerRef}
        sx={{ 
          maxHeight: 600,
          overflow: 'auto'
        }}
      >
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              {visibleColumns.map((col) => (
                <TableCell
                  key={col.key}
                  align="right"
                  sx={{
                    fontWeight: 'bold',
                    backgroundColor: 'primary.main',
                    color: 'primary.contrastText',
                    whiteSpace: 'nowrap',
                    borderRight: '1px solid',
                    borderColor: 'divider',
                    // 固定前3列（代码、名称、板块）
                    position: ['code', 'name', 'sector'].includes(col.key) ? 'sticky' : 'static',
                    left: ['code', 'name', 'sector'].includes(col.key) 
                      ? ['code', 'name', 'sector'].indexOf(col.key) * 70 + 'px' 
                      : 'auto',
                    zIndex: ['code', 'name', 'sector'].includes(col.key) ? 2 : 1,
                    minWidth: ['code', 'name', 'sector'].includes(col.key) ? 70 : 'auto',
                    '&:last-child': {
                      borderRight: 'none',
                    },
                  }}
                >
                  <Tooltip title={`点击排序（支持多列排序）`} placement="top">
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        cursor: 'pointer',
                        gap: 0.5,
                      }}
                      onClick={(e) => handleSort(col.key, e)}
                      onContextMenu={(e) => {
                        e.preventDefault()
                        handleSort(col.key, e)
                      }}
                    >
                      {col.label}
                      {(isHydrated && parentHydrated) ? (
                        <>
                          {getSortPriority(col.key) && (
                            <Box 
                              sx={{ 
                                fontSize: '0.75rem', 
                                fontWeight: 'bold',
                                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                borderRadius: '50%',
                                width: 16,
                                height: 16,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                lineHeight: 1
                              }}
                            >
                              {getSortPriority(col.key)}
                            </Box>
                          )}
                          {getSortIcon(col.key)}
                        </>
                      ) : null}
                    </Box>
                  </Tooltip>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {displayedRows.map((row, idx) => (
              <TableRow 
                key={`${row.code}-${idx}`} 
                hover
                sx={{
                  '&:nth-of-type(even)': {
                    backgroundColor: 'action.hover',
                  },
                }}
              >
                {visibleColumns.map(col => {
                  const value = row[col.key]
                  const formattedValue = formatCellValue(col.key, value)
                  const color = getValueColor(col.key, value)
                  
                  // 固定列的通用样式
                  const fixedColumnStyle = {
                    position: ['code', 'name', 'sector'].includes(col.key) ? 'sticky' : 'static' as const,
                    left: ['code', 'name', 'sector'].includes(col.key) 
                      ? ['code', 'name', 'sector'].indexOf(col.key) * 70 + 'px' 
                      : 'auto',
                    zIndex: ['code', 'name', 'sector'].includes(col.key) ? 2 : 1,
                    backgroundColor: ['code', 'name', 'sector'].includes(col.key) ? 'background.paper' : 'inherit',
                    minWidth: ['code', 'name', 'sector'].includes(col.key) ? 70 : 'auto',
                  }
                  
                  // 特殊处理板块字段：将顿号分隔的板块转换为换行显示
                  if (col.key === 'sector' && typeof value === 'string') {
                    const sectors = value.split('、').map(s => s.trim()).filter(s => s)
                    return (
                      <TableCell
                        key={`${row.code}-${col.key}`}
                        align="right"
                        sx={{
                          ...fixedColumnStyle,
                          color: '#1976d2', // 蓝色字体
                          fontWeight: 'normal',
                          fontSize: '0.625rem', // 缩小2号字体
                          whiteSpace: 'pre-line', // 允许换行
                          lineHeight: 1.2,
                          minWidth: '100px', // 调整为100px确保5个中文字符能完整显示
                          maxWidth: '150px', // 增加最大宽度限制
                          borderRight: '1px solid',
                          borderColor: 'divider',
                          '&:last-child': {
                            borderRight: 'none',
                          },
                        }}
                      >
                        {sectors.join('\n')}
                      </TableCell>
                    )
                  }
                  
                  // 特殊处理涨停标签字段：黄色字体
                  if (col.key === 'limitUpLabel' && typeof value === 'string' && value) {
                    return (
                      <TableCell
                        key={`${row.code}-${col.key}`}
                        align="right"
                        sx={{
                          ...fixedColumnStyle,
                          color: '#ed6c02', // 黄色字体
                          fontWeight: 'bold',
                          fontSize: '0.75rem',
                          whiteSpace: 'nowrap',
                          borderRight: '1px solid',
                          borderColor: 'divider',
                          '&:last-child': {
                            borderRight: 'none',
                          },
                        }}
                      >
                        {formattedValue}
                      </TableCell>
                    )
                  }
                  
                  // 特殊处理名称字段：添加点击跳转功能
                  if (col.key === 'name' && typeof value === 'string') {
                    // 根据股票代码生成跳转URL
                    const stockCode = row.code
                    const marketPrefix = stockCode.startsWith('6') ? 'sh' : 'sz'
                    const jumpUrl = `https://quote.eastmoney.com/${marketPrefix}${stockCode}.html#fullScreenChart`
                    
                    return (
                      <TableCell
                        key={`${row.code}-${col.key}`}
                        align="right"
                        sx={{
                          ...fixedColumnStyle,
                          color,
                          fontWeight: 'normal',
                          fontSize: '0.875rem',
                          whiteSpace: 'nowrap',
                          borderRight: '1px solid',
                          borderColor: 'divider',
                          '&:last-child': {
                            borderRight: 'none',
                          },
                          cursor: 'pointer',
                          textDecoration: 'underline',
                          '&:hover': {
                            color: '#1976d2',
                            backgroundColor: 'rgba(25, 118, 210, 0.04)',
                          },
                        }}
                        onClick={() => window.open(jumpUrl, '_blank')}
                      >
                        {formattedValue}
                      </TableCell>
                    )
                  }
                  
                  return (
                    <TableCell
                      key={`${row.code}-${col.key}`}
                      align="right"
                      sx={{
                        ...fixedColumnStyle,
                        color,
                        fontWeight: col.key === 'changePercent' || col.key === 'rangeChangePercent' ? 'bold' : 'normal',
                        fontSize: col.key === 'name' ? '0.875rem' : '0.75rem',
                        whiteSpace: 'nowrap',
                        borderRight: '1px solid',
                        borderColor: 'divider',
                        '&:last-child': {
                          borderRight: 'none',
                        },
                      }}
                    >
                      {formattedValue}
                    </TableCell>
                  )
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* 显示数据数量信息 */}
      <Box sx={{ 
        p: 1, 
        borderTop: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '0.875rem',
        color: 'text.secondary'
      }}>
        <Typography variant="body2">
          显示 {displayedRows.length} / {processedData.length} 条数据
        </Typography>
        {displayCount < processedData.length && (
          <Typography variant="body2">
            滚动到底部加载更多
          </Typography>
        )}
      </Box>

      {/* 导出对话框 */}
      <Dialog open={exportDialogOpen} onClose={() => setExportDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>导出数据</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            选择要导出的列（符合条件的数据共 {processedData.length} 条）
          </Typography>
          <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
            {visibleColumns.map(column => (
              <FormControlLabel
                key={column.key}
                control={
                  <Checkbox
                    checked={selectedExportColumns.includes(column.key)}
                    onChange={() => handleExportColumnToggle(column.key)}
                  />
                }
                label={column.label}
                sx={{ display: 'block', mb: 1 }}
              />
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExportDialogOpen(false)}>取消</Button>
          <Button 
            onClick={handleExport} 
            variant="contained"
            disabled={selectedExportColumns.length === 0}
          >
            导出CSV
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  )
}