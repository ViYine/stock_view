# CORS 问题解决方案

## 问题描述

在浏览器中直接访问第三方 API (`apphq.longhuvip.com`) 时出现 CORS 错误，因为目标服务器没有设置允许跨域访问。

## 解决方案

### 1. 使用 Next.js API Routes 代理请求

我创建了两个 API Routes 来代理请求：

- `/app/api/real-time/route.ts` - 处理实时数据请求
- `/app/api/range-data/route.ts` - 处理区间数据请求

### 2. 工作原理

```
浏览器 → Next.js API Route → 第三方 API
     ↑                      ↓
     └── 无 CORS 问题 ────┘
```

- **前端** 调用 `/api/real-time` 或 `/api/range-data`
- **Next.js 服务器** 代理请求到 `apphq.longhuvip.com`
- **服务器间通信** 没有 CORS 限制
- **数据返回** 通过 API Route 返回给前端

### 3. API 接口变化

#### 原始直接调用（已废弃）
```typescript
// 会产生 CORS 错误
const response = await fetch('https://apphq.longhuvip.com/w1/api/index.php?...')
```

#### 新的代理调用
```typescript
// 通过 Next.js API Route 代理
const response = await fetch(`/api/real-time?page=${page}`)
```

### 4. API 端点

#### 实时数据
- **URL**: `/api/real-time?page={page}`
- **参数**: `page` - 页码（从 0 开始）
- **示例**: `/api/real-time?page=0`

#### 区间数据
- **URL**: `/api/range-data?page={page}&startTime={start}&endTime={end}`
- **参数**:
  - `page` - 页码（从 0 开始）
  - `startTime` - 开始时间（如 "0925"）
  - `endTime` - 结束时间（如 "0930"）
- **示例**: `/api/range-data?page=0&startTime=0925&endTime=0930`

### 5. 错误处理

API Routes 包含完整的错误处理：

- **HTTP 错误**：返回相应的状态码和错误信息
- **API 错误**：检查 `errcode` 字段
- **网络错误**：返回 500 状态码
- **参数验证**：检查必需参数

### 6. 安全性

- **User-Agent**：在服务器端设置合适的 User-Agent
- **参数验证**：所有参数都经过验证
- **错误日志**：服务器端记录错误信息

## 文件变更

### 新增文件
- `app/api/real-time/route.ts` - 实时数据 API Route
- `app/api/range-data/route.ts` - 区间数据 API Route

### 修改文件
- `app/lib/api.ts` - 更新为使用新的 API Routes

## 验证方法

1. 启动开发服务器：`npm run dev`
2. 访问：`http://localhost:3000/api/real-time?page=0`
3. 应该看到 JSON 格式的股票数据
4. 访问主页面：`http://localhost:3000`
5. 数据应该正常显示，没有 CORS 错误

## 技术优势

1. **无 CORS 问题**：服务器端代理避免了浏览器 CORS 限制
2. **更好的错误处理**：统一的错误处理机制
3. **缓存支持**：可以在 API Routes 中实现缓存
4. **安全性**：隐藏了第三方 API 的细节
5. **可扩展性**：易于添加认证、限流等功能

## 注意事项

- 确保 Next.js 服务器可以访问外部网络
- 在生产环境中考虑添加请求限流
- 可以添加响应缓存来提高性能
- 监控 API 调用频率和错误率