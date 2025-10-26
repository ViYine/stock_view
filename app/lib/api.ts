// API 服务 - 处理所有数据请求
import { StockData, ApiResponse } from '@/app/types/stock'

/**
 * 将 API 返回的数组数据转换为 StockData 对象
 */
function parseStockData(item: any[]): StockData {
  return {
    code: item[0],
    name: item[1],
    sector: item[4],
    currentPrice: item[5],
    changePercent: item[6],
    turnover: item[7],
    actualTurnoverRate: item[8],
    changeSpeed: item[9],
    actualCirculation: item[10],
    mainBuy: item[11],
    mainSell: item[12],
    mainNetAmount: item[13],
    mainBuyRatio: item[14],
    mainSellRatio: item[15],
    netTurnoverRatio: item[16],
    buyFlowRatio: item[17],
    sellFlowRatio: item[18],
    netFlowRatio: item[19],
    rangeChangePercent: item[20],
    volumeRatio: item[21],
    consecutiveBoard: item[23],
    amplitude: item[33],
    totalMarketValue: item[37],
    circulatingMarketValue: item[38],
    limitUpLabel: item[39],
    institutionIncreaseAmount: item[42],
    twoMinuteTurnover: item[55],
    popularity: item[58],
  }
}

/**
 * 获取实时数据 - 一次性加载所有数据
 */
export async function fetchRealTimeData(): Promise<StockData[]> {
  try {
    let allData: StockData[] = []
    let page = 0
    let totalCount = 0
    
    // 循环获取所有数据页
    do {
      const response = await fetch(`/api/real-time?page=${page}`, {
        method: 'GET',
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data: ApiResponse = await response.json()
      
      if (data.errcode !== '0') {
        throw new Error(`API 错误: ${data.errcode}`)
      }
      
      if (!Array.isArray(data.list)) {
        throw new Error('API 返回数据格式错误: list 不是数组')
      }
      
      // 第一次请求时获取总数据量
      if (page === 0) {
        totalCount = data.Count || 0
      }
      
      // 将当前页数据添加到总数据中
      allData = [...allData, ...data.list.map(parseStockData)]
      
      // 计算是否还有更多数据需要获取
      page++
      const nextIndex = page * 60
      
      // 如果已经获取了所有数据或达到最大限制，停止循环
      if (nextIndex >= totalCount || data.list.length === 0) {
        break
      }
      
      // 添加延迟避免请求过快
      await new Promise(resolve => setTimeout(resolve, 100))
      
    } while (true)
    
    console.log(`成功获取 ${allData.length} 条数据，总数据量: ${totalCount}`)
    return allData
  } catch (err) {
    console.error('获取实时数据失败:', err)
    throw err
  }
}

/**
 * 获取区间数据
 */
export async function fetchRangeData(
  startTime: string,
  endTime: string
): Promise<StockData[]> {
  try {
    let allData: StockData[] = []
    let page = 0
    let totalCount = 0
    
    // 循环获取所有数据页
    do {
      const response = await fetch(`/api/range-data?page=${page}&startTime=${startTime}&endTime=${endTime}`, {
        method: 'GET',
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data: ApiResponse = await response.json()
      
      if (data.errcode !== '0') {
        throw new Error(`API 错误: ${data.errcode}`)
      }
      
      if (!Array.isArray(data.list)) {
        throw new Error('API 返回数据格式错误: list 不是数组')
      }
      
      // 第一次请求时获取总数据量
      if (page === 0) {
        totalCount = data.Count || 0
      }
      
      // 将当前页数据添加到总数据中
      allData = [...allData, ...data.list.map(parseStockData)]
      
      // 计算是否还有更多数据需要获取
      page++
      const nextIndex = page * 60
      
      // 如果已经获取了所有数据或达到最大限制，停止循环
      if (nextIndex >= totalCount || data.list.length === 0) {
        break
      }
      
      // 添加延迟避免请求过快
      await new Promise(resolve => setTimeout(resolve, 100))
      
    } while (true)
    
    console.log(`成功获取 ${allData.length} 条区间数据，总数据量: ${totalCount}`)
    return allData
  } catch (err) {
    console.error('获取区间数据失败:', err)
    throw err
  }
}
