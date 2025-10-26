// 股票数据类型定义

export interface StockData {
  code: string // 0 代码
  name: string // 1 名称
  sector: string // 4 板块
  currentPrice: number // 5 现价
  changePercent: number // 6 涨幅
  turnover: number // 7 成交额
  actualTurnoverRate: number // 8 实际换手
  changeSpeed: number // 9 涨速
  actualCirculation: number // 10 实际流通
  mainBuy: number // 11 主力买
  mainSell: number // 12 主力卖
  mainNetAmount: number // 13 主力净额
  mainBuyRatio: number // 14 主买占比
  mainSellRatio: number // 15 主卖占比
  netTurnoverRatio: number // 16 净成占比
  buyFlowRatio: number // 17 买流占比
  sellFlowRatio: number // 18 卖流占比
  netFlowRatio: number // 19 净流占比
  rangeChangePercent: number // 20 区间涨幅
  volumeRatio: number // 21 量比
  consecutiveBoard: string // 23 连板说明
  amplitude: number // 33 振幅
  totalMarketValue: number // 37 总市值
  circulatingMarketValue: number // 38 流通值
  limitUpLabel: string // 39 涨停标签
  institutionIncreaseAmount: number // 42 机构增仓金额
  twoMinuteTurnover: number // 55 2分钟成交额
  popularity: number // 58 人气值
}

export interface ColumnConfig {
  key: keyof StockData
  label: string
  visible: boolean
  order: number
}

export interface ApiResponse {
  list: any[][]
  Time: number
  Count: number
  Day: string[]
  Min: string
  Max: string
  ZB: string[]
  ttag: number
  errcode: string
}
