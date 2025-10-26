# 代码结构说明

本项目已按照 React 和 Next.js 最佳实践进行重构，遵循 `react.mdc` 和 `nextjs.mdc` 规范。

## 目录结构

```
app/
├── components/              # 可复用的 UI 组件
│   ├── stock-table.tsx     # 股票表格组件
│   ├── column-settings-dialog.tsx  # 列设置对话框
│   └── time-range-selector.tsx     # 时间范围选择器
├── hooks/                  # 自定义 React Hooks
│   ├── useStockData.ts     # 股票数据管理 hook
│   ├── useColumnConfig.ts  # 列配置管理 hook
│   └── useTradingTime.ts   # 交易时间检查 hook
├── lib/                    # 工具函数和常量
│   ├── api.ts              # API 请求服务
│   ├── constants.ts        # 常量定义
│   └── formatters.ts       # 数据格式化工具
├── types/                  # TypeScript 类型定义
│   └── stock.ts            # 股票数据类型
├── layout.tsx              # 根布局（服务器组件）
├── page.tsx                # 主页面（客户端组件）
└── theme.ts                # MUI 主题配置
```

## 关键改进

### 1. 代码分离与模块化
- **API 服务** (`app/lib/api.ts`): 集中管理所有数据请求
- **自定义 Hooks** (`app/hooks/`): 提取可复用的逻辑
- **UI 组件** (`app/components/`): 小型、专注的组件
- **类型定义** (`app/types/`): 集中的 TypeScript 类型

### 2. 符合 Next.js 14 规范
- 使用 `'use client'` 指令标记客户端组件
- 保持服务器组件为默认（`layout.tsx`）
- 正确的组件边界划分

### 3. 符合 React 最佳实践
- 使用函数组件和 Hooks
- 自定义 Hooks 提取可复用逻辑
- 适当的依赖数组管理
- 正确的清理函数处理

### 4. 数据请求改进
- 统一的 API 请求处理
- 完整的错误处理
- User-Agent 头部设置（避免被拦截）
- 参数验证和格式化

## API 请求参数说明

### 实时数据请求
```
GET /w1/api/index.php?Order=1&a=RealRankingInfo_W8&st=60&c=NewStockRanking&...&index=0
```

**关键参数：**
- `index`: 分页参数，每页 60 条数据（第 n 页 = (n-1)*60）
- `st`: 每页数据条数（固定为 60）
- `Type`: 数据类型（固定为 1）

### 区间数据请求
```
GET /w1/api/index.php?...&RStart=0925&REnd=1500
```

**关键参数：**
- `RStart`: 区间开始时间（格式：HHMM）
- `REnd`: 区间结束时间（格式：HHMM）
- 最小支持 5 分钟跨度
- 时间范围：0925-1500（1130 后为 1305）

## 使用 Hooks

### useStockData
```typescript
const { realTimeData, rangeData, loading, error, loadRealTimeData, loadRangeData } = useStockData()

// 加载实时数据
await loadRealTimeData(0)

// 加载区间数据
await loadRangeData('0925', '1500', 0)
```

### useColumnConfig
```typescript
const { columnConfig, visibleColumns, toggleColumnVisibility, reorderColumns, resetColumns } = useColumnConfig()

// 切换列可见性
toggleColumnVisibility('code', false)

// 重新排序列
reorderColumns(dragResult)

// 重置为默认配置
resetColumns()
```

### useTradingTime
```typescript
const isTradingTime = useTradingTime()
// 返回布尔值，表示当前是否为交易时间
```

## 数据格式化

`formatters.ts` 提供了多种格式化函数：

- `formatMillion()`: 格式化为百万单位（M/K）
- `formatPercent()`: 格式化为百分比
- `formatPrice()`: 格式化为价格
- `formatNumber()`: 格式化为带千位分隔符的数字
- `formatCellValue()`: 根据字段类型自动格式化

## 常量定义

`constants.ts` 包含：
- `TIME_OPTIONS`: 交易时间选项数组
- `AUTO_REFRESH_INTERVAL`: 自动刷新间隔（6000ms）
- `ROWS_PER_PAGE_OPTIONS`: 分页选项

## 错误处理

所有 API 请求都包含完整的错误处理：
1. HTTP 状态检查
2. API 错误码检查
3. 数据格式验证
4. 用户友好的错误消息

## 性能优化

- 使用 `useCallback` 避免不必要的函数重新创建
- 使用 `useMemo` 缓存计算结果
- 自动刷新仅在交易时间启用
- 定时器正确清理防止内存泄漏

## 交易时间检查

- 工作日（周一至周五）
- 上午：9:25 - 11:30
- 下午：13:05 - 15:00
- 每分钟检查一次状态变化
