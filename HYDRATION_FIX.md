# Hydration 错误修复总结

## 问题描述
页面刷新时出现 Next.js hydration 错误：
```
Error: Hydration failed because the initial UI does not match what was rendered on the server.
```

## 根本原因
Next.js 在服务器端和客户端渲染时，如果初始状态不一致就会导致 hydration 错误。主要问题来自于：
1. 在服务器端无法访问 `localStorage`、`window` 和 `document` 对象
2. 直接调用返回不同值的函数作为 `useState` 的初始值（而不是使用初始化函数）
3. 条件渲染依赖于在服务器端和客户端可能不同的状态

## 修复方案

### 第一阶段：服务器端检查

#### 1. `app/hooks/useStockData.ts`
- 在 `loadDataFromStorage()` 函数中添加 `typeof window === 'undefined'` 检查
- 在 `saveDataToStorage()` 函数中添加服务器端检查

#### 2. `app/hooks/useColumnConfig.ts`
- 在 `loadColumnConfigFromStorage()` 函数中添加 `typeof window === 'undefined'` 检查
- 在 `saveColumnConfigToStorage()` 回调函数中添加服务器端检查

#### 3. `app/components/advanced-stock-table.tsx`
- 在 `loadFilterSTFromStorage()` 函数中添加 `typeof window === 'undefined'` 检查
- 在排序配置和 ST 过滤状态保存的 useEffect 中添加服务器端检查

### 第二阶段：正确使用 useState 初始化函数

#### 关键修复：使用函数形式初始化 useState
```typescript
// ❌ 错误：直接调用函数
const [state, setState] = useState(loadFromStorage())

// ✅ 正确：使用初始化函数
const [state, setState] = useState(() => loadFromStorage())
```

修复的文件：
- `app/hooks/useColumnConfig.ts` - `useState<ColumnConfig[]>(() => loadColumnConfigFromStorage())`
- `app/components/advanced-stock-table.tsx` - `useState<MultiSortConfig[]>(() => loadSortConfigFromStorage())`
- `app/components/advanced-stock-table.tsx` - `useState(() => loadFilterSTFromStorage())`

### 第三阶段：处理条件渲染的状态不一致

#### 添加 Hydration 标记
在需要条件渲染的组件中添加 `isHydrated` 状态：

```typescript
const [isHydrated, setIsHydrated] = useState(false)

useEffect(() => {
  setIsHydrated(true)
}, [])
```

#### 修复的文件和位置：

**`app/page.tsx`**
- 添加 `isHydrated` 状态
- 修改 `isTradingTime` 条件渲染：`{isHydrated && isTradingTime && ...}`
- 修改 `lastRefreshTime` 条件渲染：`{isHydrated && lastRefreshTime && ...}`

**`app/components/advanced-stock-table.tsx`**
- 添加 `isHydrated` 状态
- 修改 ST 过滤 Chip 的条件属性：`color={isHydrated && filterST ? "primary" : "default"}`
- 修改搜索结果显示条件：`{isHydrated && (searchTerm || filterST) && ...}`

## 修复原理

### 1. 服务器端检查模式
```typescript
if (typeof window === 'undefined') {
  // 服务器端：返回默认值
  return defaultValue
}
// 客户端：执行浏览器特定的操作
```

### 2. useState 初始化函数
React 只在组件首次挂载时调用初始化函数，这确保了服务器端和客户端使用相同的初始值。

### 3. Hydration 标记
通过 `isHydrated` 标记，确保在水合完成前不渲染可能不同的内容，水合完成后再显示实际状态。

## 验证步骤

1. **清除浏览器缓存和 localStorage**
   ```bash
   # 在浏览器开发者工具中清除 Application > Local Storage
   ```

2. **重新启动开发服务器**
   ```bash
   npm run dev
   ```

3. **刷新页面**
   - 应该不再出现 hydration 错误
   - 页面应该正常加载

4. **验证功能**
   - 数据应该正常显示
   - 排序、过滤等功能应该正常工作
   - 刷新页面后，之前的配置应该被保留
   - 交易时间标记应该在水合完成后显示

## 相关文件修改

- `app/page.tsx` - 添加 hydration 标记，修复条件渲染
- `app/hooks/useStockData.ts` - 数据持久化和服务器端检查
- `app/hooks/useColumnConfig.ts` - 列配置持久化、服务器端检查和 useState 初始化函数
- `app/components/advanced-stock-table.tsx` - 排序和过滤状态持久化、服务器端检查、useState 初始化函数和 hydration 标记
- `app/hooks/useTradingTime.ts` - 交易时间检查

## 测试清单

- [x] 页面刷新不出现 hydration 错误
- [x] 数据正常加载和显示
- [x] localStorage 数据正常保存和恢复
- [x] 排序功能正常工作
- [x] 过滤功能正常工作
- [x] 列配置正常保存和恢复
- [x] 交易时间标记正常显示
- [x] 无 lint 错误
