# 📝 如何编辑博客文章（简单方法）

## 🎯 最简单的方法：直接编辑 script.js 文件

### 修改文章内容

1. **打开文件**：`script.js`

2. **找到文章内容**：
   - 搜索文章标题，比如搜索 "ResNet"
   - 找到 `content: ` 后面的内容（在反引号 ` 之间）

3. **直接修改文本**：
   - 可以修改任何文字、段落、标题
   - 支持 Markdown 语法：
     - `# 标题` = 一级标题
     - `## 标题` = 二级标题  
     - `**文字**` = 加粗
     - `$公式$` = 行内公式
     - `$$公式$$` = 块级公式

4. **保存并推送**：
   ```bash
   git add script.js
   git commit -m "Update article"
   git push origin main
   ```

### 修改文章信息（标题、日期等）

在 `script.js` 文件中找到文章对象，修改这些字段：

```javascript
{
    id: 1,
    title: "ResNet",                    // ← 修改标题
    excerpt: "文章摘要...",              // ← 修改摘要
    category: "architecture",          // ← 分类：architecture 或 paper
    date: "2024-01-20",                // ← 修改日期
    readTime: "15分钟",                 // ← 修改阅读时间
    content: `文章内容...`               // ← 修改内容
}
```

### 添加新文章

1. **在 `script.js` 的 `articles` 数组中添加新对象**：

```javascript
const articles = [
    {
        id: 1,
        title: "ResNet",
        // ... 现有文章
    },
    {
        id: 2,                          // ← 新文章ID（递增）
        title: "新文章标题",             // ← 你的标题
        excerpt: "文章摘要",             // ← 简短摘要
        category: "architecture",       // ← architecture 或 paper
        date: "2024-01-25",             // ← 日期 YYYY-MM-DD
        readTime: "20分钟",             // ← 预计阅读时间
        content: `# 新文章标题

这里是文章内容...

可以使用 Markdown 格式：
- 列表项1
- 列表项2

**加粗文字**

公式：$E = mc^2$

块级公式：
$$
\\int_0^\\infty e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}
$$
`
    }
];
```

2. **保存并推送**

## 📋 分类说明

- `"architecture"` → 显示为 "Model Architecture"
- `"paper"` → 显示为 "Paper Reading"

## ⚠️ 注意事项

1. **不要删除引号、逗号、大括号** - 这些是代码格式，必须保留
2. **引号内的内容** - 如果内容中有引号，使用 `\"` 转义
3. **反引号内的内容** - content 字段在反引号 `` ` `` 之间，可以自由换行
4. **公式中的反斜杠** - 公式中的 `\` 需要写成 `\\`

## 💡 示例：修改 ResNet 文章

找到这段代码：
```javascript
content: `# ResNet

残差网络（Residual Network，简称 ResNet）...
```

直接修改反引号之间的内容即可，比如：
```javascript
content: `# ResNet

这是我修改后的内容...

新增的段落。
`
```

## 🚀 快速操作步骤

1. 用文本编辑器打开 `script.js`
2. 搜索要修改的文章标题
3. 找到 `content: ` 后面的内容
4. 修改文本（保持反引号不变）
5. 保存文件
6. 运行：
   ```bash
   git add script.js
   git commit -m "Update article"
   git push origin main
   ```
7. 等待 1-2 分钟，刷新网站即可看到更新！

## 📖 需要帮助？

如果遇到问题：
- 检查是否有语法错误（引号、逗号是否匹配）
- 查看浏览器 Console（F12）是否有错误信息
- 确保修改后保存了文件

