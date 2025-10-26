'use client'

import { useState, useCallback, useEffect } from 'react'
import { StockData } from '@/app/types/stock'
import { fetchRealTimeData, fetchRangeData } from '@/app/lib/api'

// 从localStorage加载保存的数据
const loadDataFromStorage = (key: string): StockData[] => {
  // 在服务器端返回空数组，避免水合错误
  if (typeof window === 'undefined') {
    return []
  }
  
  try {
    const saved = localStorage.getItem(key)
    if (saved) {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed
      }
    }
  } catch (error) {
    console.warn(`Failed to load data from localStorage for key ${key}:`, error)
  }
  return []
}

// 保存数据到localStorage
const saveDataToStorage = (key: string, data: StockData[]) => {
  // 在服务器端跳过保存，避免错误
  if (typeof window === 'undefined') {
    return
  }
  
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (error) {
    console.warn(`Failed to save data to localStorage for key ${key}:`, error)
  }
}

export function useStockData() {
  // 始终从空数组开始，避免服务器和客户端不一致
  const [realTimeData, setRealTimeData] = useState<StockData[]>([])
  const [rangeData, setRangeData] = useState<StockData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [isHydrated, setIsHydrated] = useState(false)

  // 在客户端加载保存的数据
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedRealTimeData = loadDataFromStorage('stock-table-real-time-data')
      const savedRangeData = loadDataFromStorage('stock-table-range-data')
      
      if (savedRealTimeData.length > 0) {
        setRealTimeData(savedRealTimeData)
      }
      if (savedRangeData.length > 0) {
        setRangeData(savedRangeData)
      }
      
      setIsHydrated(true)
    }
  }, [])

  // 保存实时数据到localStorage（仅在hydration完成后）
  useEffect(() => {
    if (isHydrated) {
      saveDataToStorage('stock-table-real-time-data', realTimeData)
    }
  }, [realTimeData, isHydrated])

  // 保存区间数据到localStorage（仅在hydration完成后）
  useEffect(() => {
    if (isHydrated) {
      saveDataToStorage('stock-table-range-data', rangeData)
    }
  }, [rangeData, isHydrated])

  const loadRealTimeData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      // 一次性加载所有数据
      const data = await fetchRealTimeData()
      setRealTimeData(data)
      return data
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '获取实时数据失败'
      setError(errorMsg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const loadRangeData = useCallback(
    async (startTime: string, endTime: string) => {
      setLoading(true)
      setError('')
      try {
        const data = await fetchRangeData(startTime, endTime)
        setRangeData(data)
        return data
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : '获取区间数据失败'
        setError(errorMsg)
        throw err
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return {
    realTimeData,
    rangeData,
    loading,
    error,
    loadRealTimeData,
    loadRangeData,
    isHydrated,
  }
}
