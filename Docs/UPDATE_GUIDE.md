# 更新脚本使用指南

## 📝 简介

提供了两个更新脚本，用于快速提交和推送博客更改：

- `update.sh` - Linux/Mac/Git Bash 使用
- `update.ps1` - Windows PowerShell 使用

## 🚀 使用方法

### Windows (PowerShell)

1. 打开 PowerShell
2. 导航到项目目录：
   ```powershell
   cd E:\桌面\blog
   ```
3. 运行脚本：
   ```powershell
   .\update.ps1
   ```

### Linux/Mac/Git Bash

1. 首先给脚本添加执行权限：
   ```bash
   chmod +x update.sh
   ```
2. 运行脚本：
   ```bash
   ./update.sh
   ```

## 🔐 认证说明

### HTTPS 方式（推荐）

如果使用 HTTPS URL（如 `https://github.com/username/repo.git`）：

1. **首次推送**：脚本运行时会自动弹出浏览器窗口
2. **在浏览器中**：
   - GitHub: 登录并授权访问
   - GitLab: 登录并授权访问
3. **完成后**：浏览器会显示成功页面，关闭即可
4. **后续推送**：Git 会记住你的凭据（存储在 Windows Credential Manager 或 macOS Keychain）

### SSH 方式

如果使用 SSH URL（如 `git@github.com:username/repo.git`）：

1. **需要先配置 SSH Key**：
   ```bash
   # 生成 SSH key（如果还没有）
   ssh-keygen -t ed25519 -C "your_email@example.com"
   
   # 添加到 SSH agent
   eval "$(ssh-agent -s)"
   ssh-add ~/.ssh/id_ed25519
   
   # 复制公钥到剪贴板（Windows）
   clip < ~/.ssh/id_ed25519.pub
   
   # 或显示公钥（Mac/Linux）
   cat ~/.ssh/id_ed25519.pub
   ```

2. **添加到 GitHub/GitLab**：
   - GitHub: Settings → SSH and GPG keys → New SSH key
   - GitLab: Preferences → SSH Keys

## 📋 脚本功能

脚本会自动执行以下操作：

1. ✅ 检查是否为 Git 仓库
2. ✅ 检查是否有未提交的更改
3. ✅ 显示当前状态
4. ✅ 提示输入提交信息（或使用默认）
5. ✅ 添加所有更改 (`git add .`)
6. ✅ 提交更改 (`git commit`)
7. ✅ 推送到远程仓库 (`git push`)

## ⚙️ 自定义配置

### 修改默认提交信息格式

编辑脚本中的这一行：

**PowerShell:**
```powershell
$commitMessage = "Update blog content - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
```

**Bash:**
```bash
commit_message="Update blog content - $(date '+%Y-%m-%d %H:%M:%S')"
```

### 设置 Git 凭据存储（Windows）

```bash
# 永久存储凭据（推荐）
git config --global credential.helper wincred

# 或使用 manager-core（Git Credential Manager）
git config --global credential.helper manager-core
```

### 设置 Git 凭据存储（Mac）

```bash
git config --global credential.helper osxkeychain
```

### 设置 Git 凭据存储（Linux）

```bash
git config --global credential.helper store
```

## 🐛 常见问题

### 1. "Not a git repository" 错误

**解决方法：**
```bash
git init
git remote add origin <your-repo-url>
```

### 2. "No remote 'origin' found" 错误

**解决方法：**
```bash
git remote add origin https://github.com/your-username/your-repo.git
```

### 3. 推送时要求输入用户名密码

**解决方法：**
- 使用 Personal Access Token（GitHub）或 Access Token（GitLab）代替密码
- 或切换到 SSH 方式

### 4. PowerShell 执行策略限制

**解决方法：**
```powershell
# 临时允许执行（仅当前会话）
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process

# 或永久允许（需要管理员权限）
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## 💡 提示

- 脚本会自动检测当前分支并推送到对应分支
- 如果没有任何更改，脚本会直接退出
- 提交信息可以为空，会使用默认的时间戳格式
- 建议在推送前先 `git pull` 确保本地是最新的

## 📚 相关资源

- [Git 官方文档](https://git-scm.com/doc)
- [GitHub 认证文档](https://docs.github.com/en/authentication)
- [GitLab 认证文档](https://docs.gitlab.com/ee/user/ssh.html)

