# 表格UI优化改进说明

## 🎯 改进概述

已成功将基础的表格组件升级为符合 Material-UI 设计规范的高级表格组件，具备完整的排序、过滤、搜索功能和股票显示规则。

## ✨ 新增功能

### 1. **Material-UI 设计规范**
- 使用 Material-UI 的 Paper 组件作为容器
- 表头使用主题色（primary.main）
- 斑马纹行样式（隔行变色）
- 悬停效果和边框分隔
- 紧凑的表格尺寸（size="small"）

### 2. **智能排序功能**
- 点击表头可进行升序/降序排序
- 排序图标显示当前排序状态
- 默认按涨幅降序排列（最热门的股票在前）
- Tooltip 提示排序功能

### 3. **实时搜索过滤**
- 顶部搜索栏支持实时搜索
- 可搜索股票名称、代码、板块
- 搜索结果统计显示
- 一键清除搜索条件

### 4. **股票数字格式化**
- **金额格式化**：自动转换为亿/万/千单位
  - ≥1亿：显示为 "X.XX亿"
  - ≥1万：显示为 "X.XX万"  
  - ≥1千：显示为 "X.XX千"
  - <1千：显示原始数字
- **百分比格式化**：带正负号（如 "+5.25%"）
- **价格格式化**：保留两位小数

### 5. **股票颜色规则**
- **上涨相关字段**（涨幅、涨速、净额等）：
  - 正数：红色 `#f56c6c`（上涨）
  - 负数：绿色 `#67c23a`（下跌）
  - 零：正常颜色
- **金额字段**：
  - 正数：正常颜色
  - 负数：红色（表示亏损）
- **比率字段**：正常颜色

## 📁 文件变更

### 新增文件
- `app/components/advanced-stock-table.tsx` - 高级表格组件（257行）

### 修改文件
- `app/lib/formatters.ts` - 新增数字格式化和颜色规则
- `app/page.tsx` - 替换为新的高级表格组件

## 🎨 设计特色

### 表头设计
```typescript
backgroundColor: 'primary.main',
color: 'primary.contrastText',
fontWeight: 'bold',
borderRight: '1px solid divider'
```

### 行样式
```typescript
'&:nth-of-type(even)': {
  backgroundColor: 'action.hover',
}
```

### 单元格样式
```typescript
color: getValueColor(col.key, value),
fontWeight: col.key === 'changePercent' ? 'bold' : 'normal',
fontSize: col.key === 'name' ? '0.875rem' : '0.75rem'
```

## 🔧 技术实现

### 排序算法
```typescript
const processedData = useMemo(() => {
  let filteredData = data
  
  // 搜索过滤
  if (searchTerm) {
    filteredData = data.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.code.includes(searchTerm) ||
      item.sector.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }
  
  // 排序
  filteredData.sort((a, b) => {
    const aValue = a[sortConfig.key]
    const bValue = b[sortConfig.key]
    
    if (sortConfig.direction === 'asc') {
      return aValue < bValue ? -1 : 1
    } else {
      return aValue > bValue ? -1 : 1
    }
  })
  
  return filteredData
}, [data, searchTerm, sortConfig])
```

### 数字格式化
```typescript
export function formatChineseCurrency(value: number): string {
  const absValue = Math.abs(value)
  
  if (absValue >= 100000000) {
    return (value / 100000000).toFixed(2) + '亿'
  } else if (absValue >= 10000) {
    return (value / 10000).toFixed(2) + '万'
  } else if (absValue >= 1000) {
    return (value / 1000).toFixed(2) + '千'
  } else {
    return value.toFixed(2)
  }
}
```

## 🚀 用户体验提升

1. **视觉层次清晰**：表头突出，数据层次分明
2. **交互友好**：悬停效果、点击反馈、Tooltip 提示
3. **信息密度优化**：紧凑布局显示更多数据
4. **搜索便捷**：实时搜索，快速定位目标股票
5. **排序直观**：图标显示当前排序状态
6. **数据可读性**：智能单位转换，颜色区分涨跌

## 📊 性能优化

- 使用 `useMemo` 缓存处理后的数据
- 虚拟滚动支持（maxHeight: 600）
- 分页加载，避免一次性渲染大量数据
- 搜索过滤在内存中进行，响应迅速

## 🎯 符合股票行业标准

- **红色表示上涨**：符合中国股市显示习惯
- **绿色表示下跌**：国际通用标准
- **亿/万单位**：符合中文用户阅读习惯
- **紧凑布局**：专业股票软件的显示风格

## 🔍 使用说明

1. **搜索股票**：在顶部搜索栏输入名称、代码或板块
2. **排序数据**：点击表头进行升序/降序排序
3. **查看详情**：鼠标悬停查看完整信息
4. **翻页浏览**：使用底部分页控件浏览更多数据
5. **重置搜索**：点击过滤图标清除搜索条件

现在表格具备了专业股票软件的视觉效果和功能体验！