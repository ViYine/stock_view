'use client'

import { useState, useEffect } from 'react'

/**
 * 检查是否为交易时间（工作日 9:25-11:30, 13:05-15:00）
 */
function checkTradingTime(): boolean {
  // 在服务器端返回默认值，避免水合错误
  if (typeof window === 'undefined') {
    return false
  }
  
  const now = new Date()
  const day = now.getDay()
  const hours = now.getHours()
  const minutes = now.getMinutes()
  const totalMinutes = hours * 60 + minutes

  // 检查是否为工作日（周一到周五）
  const isWeekday = day >= 1 && day <= 5

  // 检查是否在交易时间段内
  const isMorningTrading = totalMinutes >= 9 * 60 + 15 && totalMinutes <= 11 * 60 + 30
  const isAfternoonTrading = totalMinutes >= 13 * 60 + 5 && totalMinutes <= 15 * 60 + 0

  return isWeekday && (isMorningTrading || isAfternoonTrading)
}

export function useTradingTime() {
  const [isTradingTime, setIsTradingTime] = useState(false)

  useEffect(() => {
    // 初始检查
    setIsTradingTime(checkTradingTime())

    // 每分钟检查一次
    const interval = setInterval(() => {
      setIsTradingTime(checkTradingTime())
    }, 60000)

    return () => clearInterval(interval)
  }, [])

  return isTradingTime
}
