# GitHub Pages 部署步骤

## ✅ 已完成
- ✅ Git仓库已初始化
- ✅ 所有文件已提交
- ✅ 远程仓库地址已配置

## 📝 接下来需要你完成的步骤

### 第1步：在GitHub上创建仓库

1. **登录GitHub**
   - 访问：https://github.com
   - 使用你的账号 `Goldie-white` 登录

2. **创建新仓库**
   - 点击右上角的 **"+"** 按钮
   - 选择 **"New repository"**

3. **填写仓库信息**
   - **Repository name**: `deep-learning-notes`（必须和这个名称完全一致）
   - **Description**: 深度学习学习心得网站（可选）
   - **Visibility**: 选择 **Public**（公开，这样才能使用GitHub Pages）
   - ⚠️ **不要**勾选 "Initialize this repository with a README"（我们已经有了）
   - 点击 **"Create repository"** 按钮

### 第2步：推送代码到GitHub

创建仓库后，在命令行运行：

```bash
cd C:\Users\admin\deep-learning-notes
git push -u origin main
```

如果提示输入用户名和密码：
- **用户名**: `Goldie-white`
- **密码**: 使用GitHub Personal Access Token（不是GitHub密码）

### 第3步：启用GitHub Pages

1. 在GitHub仓库页面，点击 **"Settings"**（设置）标签
2. 在左侧菜单中找到 **"Pages"**
3. 在 **"Source"** 部分：
   - 选择 **"Deploy from a branch"**
   - Branch选择 **"main"**
   - Folder选择 **"/ (root)"**
4. 点击 **"Save"** 按钮

### 第4步：访问你的网站

等待1-2分钟后，你的网站就可以访问了！

**网站地址**: `https://goldie-white.github.io/deep-learning-notes`

🎉 恭喜！你的网站已经上线了！

---

## 🔐 如果推送时遇到认证问题

如果 `git push` 时提示需要认证，有两种方法：

### 方法1：使用Personal Access Token（推荐）

1. 访问：https://github.com/settings/tokens
2. 点击 **"Generate new token"** → **"Generate new token (classic)"**
3. 填写：
   - Note: `deep-learning-notes-deploy`
   - Expiration: 选择过期时间（或No expiration）
   - 勾选 `repo` 权限
4. 点击 **"Generate token"**
5. **复制token**（只显示一次！）
6. 推送时：
   - 用户名：`Goldie-white`
   - 密码：粘贴刚才复制的token

### 方法2：使用SSH密钥（更安全）

如果你已经配置了SSH密钥，可以改用SSH地址：

```bash
git remote set-url origin git@github.com:Goldie-white/deep-learning-notes.git
git push -u origin main
```

---

## 📊 后续更新网站

以后修改网站内容后，只需要：

```bash
cd C:\Users\admin\deep-learning-notes
git add .
git commit -m "更新内容描述"
git push
```

GitHub Pages会自动更新，几分钟后就能看到新内容！

---

## 🔍 提交到搜索引擎

网站上线后，记得提交到搜索引擎：

1. **Google**: https://search.google.com/search-console
2. **百度**: https://ziyuan.baidu.com
3. **Bing**: https://www.bing.com/webmasters

提交你的网站URL：`https://goldie-white.github.io/deep-learning-notes`

