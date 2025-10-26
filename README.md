# 股票龙虎榜数据展示

这是一个基于 Next.js + React + Material-UI 的股票龙虎榜数据展示应用。

## 功能特性

- 📊 **实时龙虎榜数据**：展示当前实时股票龙虎榜数据
- ⏰ **区间数据查询**：支持选择时间区间查看历史数据
- 📈 **分页浏览**：支持分页查看所有数据
- 🎨 **现代化UI**：基于 Material-UI 的现代化界面设计
- 📱 **响应式设计**：适配各种屏幕尺寸

## 技术栈

- **前端框架**：Next.js 14 + React 18
- **UI组件库**：Material-UI (MUI)
- **样式方案**：Emotion
- **开发语言**：TypeScript

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式运行

```bash
npm run dev
```

应用将在 http://localhost:3000 启动

### 生产构建

```bash
npm run build
npm start
```

## 项目结构

```
stock_view/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # 根布局组件
│   └── page.tsx           # 主页面组件
├── theme.ts               # Material-UI 主题配置
├── package.json           # 项目依赖配置
├── tsconfig.json          # TypeScript 配置
├── next.config.js         # Next.js 配置
└── README.md              # 项目说明
```

## 数据接口

应用使用龙虎榜实时数据接口：

- **实时数据接口**：`https://apphq.longhuvip.com/w1/api/index.php`
- **区间数据接口**：在实时接口基础上增加 `RStart` 和 `REnd` 参数

### 接口参数说明

- `index`：分页参数，第n页为 (n-1)*60
- `RStart`：区间开始时间（格式：HHMM）
- `REnd`：区间结束时间（格式：HHMM）

### 数据字段说明

根据接口文档，主要展示以下字段：

| 字段 | 说明 | 下标 |
|------|------|------|
| 代码 | 股票代码 | 0 |
| 名称 | 股票名称 | 1 |
| 板块 | 所属板块 | 4 |
| 现价 | 当前价格 | 5 |
| 涨幅 | 涨跌幅百分比 | 6 |
| 成交额 | 成交金额 | 7 |
| 主力净额 | 主力净买入金额 | 13 |
| 净流占比 | 净流入占比 | 19 |
| 连板说明 | 连板情况 | 23 |
| 人气值 | 股票人气值 | 58 |

## 开发规范

项目遵循以下开发规范：

- 使用 TypeScript 确保类型安全
- 遵循 React Hooks 最佳实践
- 使用 Material-UI 组件库
- 响应式设计适配移动端
- 错误处理和加载状态管理

## 注意事项

- 接口数据可能存在跨域问题，建议在支持 CORS 的环境下运行
- 数据更新频率取决于接口提供方
- 区间查询最小支持5分钟跨度