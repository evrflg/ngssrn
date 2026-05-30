# 主题颜色系统

## 概述

本项目使用同步的颜色系统，其中：

1. `src/constants/Colors.ts` 是所有主题颜色的**唯一真实来源**
2. `tailwind.config.js` 从 `Colors.ts` 导入颜色并将其映射到 Tailwind CSS 格式
3. 组件使用基于活动主题动态变化的 Tailwind 类

## 工作原理

### 1. 颜色定义

所有主题颜色在 `src/constants/Colors.ts` 中定义为主题对象：

```typescript
export const Colors: any = {
  greenBlack: {
    primary: '#75eb92',       // 主要主题色
    text: '#fff',             // 一般文字
    lightText: 'rgba(...)',   // 浅色文字
    // 更多颜色值...
  },
  blueWhite: {
    // 另一个主题...
  },
  // 更多主题...
}
```

### 2. Tailwind 集成

`tailwind.config.js` 文件自动从 `Colors.ts` 导入颜色并将其映射到 Tailwind 格式：

```javascript
// tailwind.config.js 中的颜色映射
{
  // 数字映射（旧版支持）
  50: themeObj.primary,        // 主要主题色
  100: themeObj.text,          // 一般文字
  // 等等...
  
  // 语义属性映射（推荐）
  primary: themeObj.primary,
  text: themeObj.text,
  // 等等...
}
```

### 3. 组件中的使用

在组件中，您可以直接使用语义属性名称：

```jsx
// 推荐的语义属性用法
<View className={`bg-${theme}-background`}>
  <Text className={`text-${theme}-text`}>
    Hello
  </Text>
</View>

// 旧版数字用法（仍受支持）
<View className={`bg-${theme}-500`}>
  <Text className={`text-${theme}-100`}>
    Hello
  </Text>
</View>
```

## 颜色映射参考

您可以使用语义属性名称或其数字等效项：

| 语义名称          | 数字   | 描述              |
|------------------|:-------:|-------------------|
| primary          | 50      | 主要主题色         |
| text             | 100     | 一般文字颜色       |
| lightText        | 200     | 浅色文字颜色       |
| btnText          | 300     | 按钮文字颜色       |
| gradient         | 400     | 渐变颜色           |
| background       | 500     | 页面背景           |
| blockBg          | 600     | 区块背景           |
| cardBg1          | 700     | 卡片背景           |
| tint             | 800     | 色调颜色           |
| icon             | 900     | 图标颜色           |
| tabIconDefault   | 910     | 默认标签图标       |
| tabIconSelected  | 920     | 选中标签图标       |
| gradientStart    | 930     | 渐变开始颜色       |
| gradientEnd      | 940     | 渐变结束颜色       |
| activeColor      | 950     | 激活状态颜色       |
| titleBg          | 960     | 标题背景           |

## 修改颜色

**重要**：要修改或添加新颜色：

1. 只编辑 `src/constants/Colors.ts` 文件
2. 永远不要直接修改 `tailwind.config.js` 中的颜色
3. 如果添加新的颜色属性，它们将自动同时以语义名称和数字值的形式可用

## 优势

- 所有主题颜色的唯一真实来源
- 应用于颜色管理的 DRY（不要重复自己）原则
- 使用语义属性名称的更易读代码
- 使用动态 Tailwind 类的更简单主题切换
- 整个应用程序中标准化的颜色命名 