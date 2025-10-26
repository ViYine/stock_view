# 数据请求调试指南

## 问题诊断

如果页面无法正确显示数据，请按以下步骤进行调试：

### 1. 检查浏览器控制台

打开浏览器开发者工具（F12），查看 Console 标签：

```javascript
// 查看是否有错误信息
// 常见错误：
// - "HTTP 403: Forbidden" - 请求被拦截
// - "API 错误: 1" - 接口返回错误
// - "API 返回数据格式错误" - 数据格式不符合预期
```

### 2. 检查网络请求

在 Network 标签中查看 API 请求：

**请求 URL 应该类似于：**
```
https://apphq.longhuvip.com/w1/api/index.php?Order=1&a=RealRankingInfo_W8&st=60&c=NewStockRanking&PhoneOSNew=1&DeviceID=20ad85ca-becb-3bed-b3d4-30032a0f5923&VerSion=5.8.0.2&index=0&apiv=w29&Type=1&FilterMotherboard=0&Filter=0&Ratio=6&FilterTIB=0&FilterGem=0&
```

**检查项：**
- ✅ 状态码应为 200
- ✅ Response 应包含 `errcode: "0"`
- ✅ Response 应包含 `list` 数组

### 3. 常见问题及解决方案

#### 问题 A: 403 Forbidden 错误

**原因：** 服务器拒绝请求，可能是因为：
- 缺少 User-Agent 头
- 请求来自浏览器而非移动设备
- IP 被限制

**解决方案：**
```typescript
// 已在 app/lib/api.ts 中添加 User-Agent
headers: {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
}
```

#### 问题 B: 数据格式错误

**原因：** API 返回的数据结构与预期不符

**调试步骤：**
1. 在浏览器控制台输入：
```javascript
// 查看实际返回的数据结构
fetch('https://apphq.longhuvip.com/w1/api/index.php?Order=1&a=RealRankingInfo_W8&st=60&c=NewStockRanking&PhoneOSNew=1&DeviceID=20ad85ca-becb-3bed-b3d4-30032a0f5923&VerSion=5.8.0.2&index=0&apiv=w29&Type=1&FilterMotherboard=0&Filter=0&Ratio=6&FilterTIB=0&FilterGem=0&')
  .then(r => r.json())
  .then(d => console.log(JSON.stringify(d, null, 2)))
```

2. 检查返回的数据结构是否与 `app/types/stock.ts` 中定义的类型匹配

#### 问题 C: 参数错误

**常见参数错误：**

| 参数 | 正确值 | 错误值 | 影响 |
|------|--------|--------|------|
| `st` | 60 | 其他值 | 每页数据条数不对 |
| `Type` | 1 | 0 或其他 | 数据类型错误 |
| `index` | (n-1)*60 | 任意值 | 分页错误 |
| `RStart` | HHMM 格式 | 其他格式 | 区间查询失败 |
| `REnd` | HHMM 格式 | 其他格式 | 区间查询失败 |

**验证参数：**
```typescript
// 在 app/lib/api.ts 中检查参数构建
function buildUrl(params: Record<string, string | number>): string {
  const searchParams = new URLSearchParams()
  Object.entries({ ...DEFAULT_PARAMS, ...params }).forEach(([key, value]) => {
    searchParams.append(key, String(value))
  })
  return `${API_BASE_URL}?${searchParams.toString()}`
}
```

### 4. 启用详细日志

在 `app/lib/api.ts` 中添加日志：

```typescript
export async function fetchRealTimeData(page: number = 0): Promise<StockData[]> {
  try {
    const index = page * 60
    const url = buildUrl({ index })
    
    // 添加日志
    console.log('请求 URL:', url)
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    })
    
    console.log('响应状态:', response.status)
    
    const data: ApiResponse = await response.json()
    console.log('响应数据:', data)
    
    // ... 其余代码
  }
}
```

### 5. 测试 API 端点

使用 curl 或 Postman 测试 API：

```bash
# 实时数据
curl -H "User-Agent: Mozilla/5.0" \
  "https://apphq.longhuvip.com/w1/api/index.php?Order=1&a=RealRankingInfo_W8&st=60&c=NewStockRanking&PhoneOSNew=1&DeviceID=20ad85ca-becb-3bed-b3d4-30032a0f5923&VerSion=5.8.0.2&index=0&apiv=w29&Type=1&FilterMotherboard=0&Filter=0&Ratio=6&FilterTIB=0&FilterGem=0&"

# 区间数据
curl -H "User-Agent: Mozilla/5.0" \
  "https://apphq.longhuvip.com/w1/api/index.php?Order=1&a=RealRankingInfo_W8&st=60&c=NewStockRanking&PhoneOSNew=1&DeviceID=20ad85ca-becb-3bed-b3d4-30032a0f5923&VerSion=5.8.0.2&index=0&apiv=w29&Type=1&FilterMotherboard=0&Filter=0&Ratio=6&FilterTIB=0&FilterGem=0&RStart=0925&REnd=1500"
```

## 数据验证

### 检查数据映射

确保数据数组索引与类型定义匹配：

```typescript
// app/types/stock.ts 中的映射
interface StockData {
  code: string        // item[0]
  name: string        // item[1]
  sector: string      // item[4]
  currentPrice: number // item[5]
  // ... 其他字段
}
```

### 验证数据完整性

```javascript
// 在浏览器控制台检查
const data = await fetch('...').then(r => r.json())
console.log('数据条数:', data.list.length)
console.log('第一条数据:', data.list[0])
console.log('错误码:', data.errcode)
console.log('时间戳:', new Date(data.Time * 1000))
```

## 性能监控

### 检查自动刷新

```javascript
// 在浏览器控制台查看
// 应该每 6 秒刷新一次（交易时间内）
console.log('最后刷新时间:', new Date().toLocaleTimeString())
```

### 检查内存泄漏

- 打开 DevTools 的 Memory 标签
- 记录初始堆大小
- 进行多次分页操作
- 检查堆大小是否持续增长

## 常见错误代码

| 错误码 | 含义 | 解决方案 |
|--------|------|---------|
| 0 | 成功 | 无需处理 |
| 1 | 参数错误 | 检查请求参数 |
| 2 | 服务器错误 | 稍后重试 |
| 403 | 禁止访问 | 检查 User-Agent 和 IP |

## 联系支持

如果问题仍未解决，请提供：
1. 浏览器控制台的完整错误信息
2. Network 标签中的请求和响应
3. 当前时间和日期
4. 使用的浏览器和操作系统版本
