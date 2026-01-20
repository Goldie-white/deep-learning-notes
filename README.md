# 深度学习学习心得网站

一个用于分享深度学习学习心得的个人网站。

## 功能特点

- 📱 响应式设计，支持移动端和桌面端
- 🎨 现代化的UI设计，美观易用
- 📚 文章分类和筛选功能
- 📊 学习统计展示
- 🎯 平滑滚动导航

## 文件结构

```
deep-learning-notes/
├── index.html      # 主页面
├── styles.css      # 样式文件
├── script.js       # JavaScript交互逻辑
└── README.md       # 说明文档
```

## 使用方法

1. 直接在浏览器中打开 `index.html` 文件即可查看网站
2. 或者使用本地服务器运行（推荐）：
   ```bash
   # 使用Python
   python -m http.server 8000
   
   # 使用Node.js
   npx http-server
   ```

## 自定义内容

### 添加新文章

在 `script.js` 文件的 `articles` 数组中添加新文章对象：

```javascript
{
    id: 7,
    title: "文章标题",
    excerpt: "文章摘要",
    category: "theory", // theory, practice, project, tips
    date: "2024-03-01",
    readTime: "10分钟"
}
```

### 修改分类标签

在 `script.js` 文件的 `categoryLabels` 对象中修改分类名称。

### 修改样式

编辑 `styles.css` 文件中的 CSS 变量来自定义颜色主题：

```css
:root {
    --primary-color: #6366f1;
    --secondary-color: #8b5cf6;
    /* ... */
}
```

## 浏览器支持

- Chrome (最新版本)
- Firefox (最新版本)
- Safari (最新版本)
- Edge (最新版本)

## 后续扩展建议

- 添加文章详情页面
- 集成Markdown编辑器
- 添加搜索功能
- 添加评论系统
- 集成后端API
- 添加暗色模式

## 许可证

MIT License

