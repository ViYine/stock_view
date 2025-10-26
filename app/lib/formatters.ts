// 数据格式化工具

/**
 * 格式化数字为亿/万单位（符合股票显示习惯）
 */
export function formatChineseCurrency(value: number): string {
  const absValue = Math.abs(value)
  
  if (absValue >= 100000000) {
    // 大于等于1亿，显示为亿单位
    return (value / 100000000).toFixed(2) + '亿'
  } else if (absValue >= 10000) {
    // 大于等于1万，显示为万单位
    return (value / 10000).toFixed(2) + '万'
  } else if (absValue >= 1000) {
    // 大于等于1千，显示为千单位
    return (value / 1000).toFixed(2) + '千'
  } else {
    // 小于1千，显示原始数字
    return value.toFixed(2)
  }
}

/**
 * 格式化百分比（带正负号）
 */
export function formatPercent(value: number): string {
  const sign = value > 0 ? '+' : ''
  return sign + value.toFixed(2) + '%'
}

/**
 * 格式化比率（不带正负号，带%符号）
 */
export function formatRatio(value: number): string {
  // 使用 Math.abs 确保不显示负号，负号由格式化逻辑处理
  return Math.abs(value).toFixed(2) + '%'
}

/**
 * 格式化比率（不带正负号，不带%符号）
 */
export function formatRatioNoPercent(value: number): string {
  return value.toFixed(2)
}

/**
 * 格式化价格
 */
export function formatPrice(value: number): string {
  return value.toFixed(2)
}

/**
 * 格式化数字（带千位分隔符）
 */
export function formatNumber(value: number): string {
  return value.toLocaleString('zh-CN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })
}

/**
 * 根据字段类型获取颜色（股票显示规则）
 */
export function getValueColor(key: string, value: any): string {
  if (value === null || value === undefined || value === '') {
    return 'text.secondary'
  }

  const numValue = Number(value)
  
  // 涨幅、涨跌相关字段
  if (
    key.includes('Percent') ||
    key.includes('Change') ||
    key === 'changeSpeed' ||
    key === 'mainNetAmount' ||
    key === 'netFlowRatio'
  ) {
    if (numValue > 0) return '#f56c6c' // 红色表示上涨
    if (numValue < 0) return '#67c23a' // 绿色表示下跌
    return 'text.primary' // 平盘
  }

  // 买入相关指标（正数显示红色）
  if (
    key.includes('Buy') ||
    key === 'mainBuy' ||
    key === 'buyFlowRatio' ||
    key === 'institutionIncreaseAmount' ||
    key === 'mainBuyRatio' ||
    key === 'buyFlowRatio'
  ) {
    if (numValue > 0) return '#f56c6c' // 买入正数显示红色
    if (numValue < 0) return '#67c23a' // 买入负数显示绿色
    return 'text.primary'
  }

  // 卖出相关指标（主卖占比和卖流占比固定显示为绿色）
  if (
    key === 'mainSellRatio' ||
    key === 'sellFlowRatio'
  ) {
    // 主卖占比和卖流占比固定显示为绿色
    return '#67c23a'
  }

  // 其他卖出相关指标
  if (
    key.includes('Sell') ||
    key === 'mainSell'
  ) {
    if (numValue < 0) return '#67c23a' // 卖出负数显示绿色
    if (numValue > 0) return '#f56c6c' // 卖出正数显示红色
    return 'text.primary'
  }

  // 净流占比（根据正负显示颜色）
  if (key === 'netFlowRatio') {
    if (numValue > 0) return '#f56c6c' // 正数显示红色
    if (numValue < 0) return '#67c23a' // 负数显示绿色
    return 'text.primary'
  }

  // 金额字段（正数显示正常，负数显示红色）
  if (
    key.includes('turnover') ||
    key.includes('Circulation') ||
    key.includes('MarketValue') ||
    key.includes('Amount') ||
    key.includes('Flow')
  ) {
    if (numValue < 0) return '#f56c6c' // 负数显示红色
    return 'text.primary' // 正数正常显示
  }

  // 比率字段（正常显示）
  if (key.includes('Ratio')) {
    return 'text.primary'
  }

  return 'text.primary'
}

/**
 * 根据字段类型格式化单元格值
 */
export function formatCellValue(key: string, value: any): string {
  if (value === null || value === undefined || value === '') {
    return '-'
  }

  const numValue = Number(value)

  // 涨幅、涨跌相关字段（带+号）
  if (
    key.includes('Percent') ||
    key.includes('Change')
  ) {
    return formatPercent(numValue)
  }

  // 主买占比、买流占比（不带+号，带%符号）
  if (
    key === 'mainBuyRatio' ||
    key === 'buyFlowRatio'
  ) {
    return formatRatio(numValue)
  }

  // 主卖占比、卖流占比（显示为负数，带%符号）
  if (
    key === 'mainSellRatio' ||
    key === 'sellFlowRatio'
  ) {
    // 显示为负数格式
    return '-' + Math.abs(numValue).toFixed(2) + '%'
  }

  // 净流占比（不带+号，带%符号）
  if (key === 'netFlowRatio') {
    return formatRatio(numValue)
  }

  // 量比（不带+号，不带%符号）
  if (key === 'volumeRatio') {
    return formatRatioNoPercent(numValue)
  }

  // 涨速（带+号，带%符号）
  if (key === 'changeSpeed') {
    return formatPercent(numValue)
  }

  // 振幅（不带+号，带%符号）
  if (key === 'amplitude') {
    return formatRatio(numValue)
  }

  // 价格字段
  if (key.includes('Price') || key === 'currentPrice') {
    return formatPrice(numValue)
  }

  // 金额字段（使用中文货币单位）
  if (
    key.includes('turnover') ||
    key.includes('Circulation') ||
    key.includes('MarketValue') ||
    key.includes('Amount') ||
    key.includes('Flow') ||
    key === 'mainBuy' ||
    key === 'mainSell' ||
    key === 'mainNetAmount' ||
    key === 'institutionIncreaseAmount' ||
    key === 'twoMinuteTurnover'
  ) {
    return formatChineseCurrency(numValue)
  }

  // 数字字段
  if (typeof value === 'number') {
    return formatNumber(value)
  }

  return String(value)
}
