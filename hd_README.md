# OpenCut Windows 部署指南

## 系统要求

- Windows 10/11（64位）
- 至少 8GB RAM（推荐 16GB）
- 至少 10GB 可用磁盘空间
- 管理员权限（用于安装软件）

## 必需软件安装

### 1. Node.js

**版本要求：** v18 或更高版本

**下载链接：**
- 官网下载：https://nodejs.org/
- 推荐下载 LTS（长期支持）版本

**安装步骤：**
1. 访问 Node.js 官网下载 Windows 安装包（.msi）
2. 运行安装程序，按照向导完成安装
3. 安装时确保勾选 "Add to PATH" 选项

**检查是否已安装：**
```powershell
# PowerShell 或 CMD
node --version
# 或
node -v
```

**验证 npm（Node.js 包管理器）：**
```powershell
npm --version
# 或
npm -v
```

**如果未安装或版本过低：**
- 卸载旧版本后重新安装
- 或使用 [nvm-windows](https://github.com/coreybutler/nvm-windows) 管理多个 Node.js 版本

---

### 2. Bun

Bun 是一个快速的 JavaScript 运行时和包管理器，本项目使用 Bun 作为包管理器。

**安装方法（PowerShell）：**
```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
```

**安装方法（CMD）：**
```cmd
powershell -c "irm bun.sh/install.ps1 | iex"
```

**安装方法（使用 npm，如果已安装 Node.js）：**
```powershell
npm install -g bun
```

**检查是否已安装：**
```powershell
# PowerShell
bun --version
Get-Command bun
```

```cmd
# CMD
bun --version
where bun
```

**如果命令未找到：**
- 检查 PATH 环境变量是否包含 Bun 的安装目录
- 通常安装在：`C:\Users\<用户名>\.bun\bin`
- 重启终端或重新登录以刷新环境变量

---

### 3. Docker Desktop（可选）

**注意：** Docker Desktop 是可选的。如果你不想使用 Docker，可以手动安装 PostgreSQL 和 Redis（见下方说明）。

Docker Desktop 用于快速运行 PostgreSQL 数据库和 Redis 服务，这是最简单的方式。

**下载链接：**
- 官网下载：https://www.docker.com/products/docker-desktop/
- 下载 Docker Desktop for Windows

**安装步骤：**
1. 下载 Docker Desktop 安装程序
2. 运行安装程序，按照向导完成安装
3. 安装完成后重启计算机

**WSL2 配置要求：**
Docker Desktop for Windows 需要 WSL2（Windows Subsystem for Linux 2）支持。

**检查 WSL2 是否已安装：**
```powershell
wsl --version
```

**如果未安装 WSL2，按以下步骤安装：**

1. **启用 WSL 功能：**
   ```powershell
   # 以管理员身份运行 PowerShell
   dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
   ```

2. **启用虚拟机平台：**
   ```powershell
   dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart
   ```

3. **重启计算机**

4. **下载并安装 WSL2 内核更新包：**
   - 访问：https://aka.ms/wsl2kernel
   - 下载并安装 WSL2 Linux 内核更新包

5. **设置 WSL2 为默认版本：**
   ```powershell
   wsl --set-default-version 2
   ```

6. **安装 Linux 发行版（可选，Docker Desktop 会自动处理）：**
   ```powershell
   wsl --install -d Ubuntu
   ```

**检查 Docker 是否已安装：**
```powershell
docker --version
# 或
docker version
```

**检查 Docker Compose：**
```powershell
docker compose version
```

**检查 Docker 服务状态：**
```powershell
docker info
```

**如果 Docker 未运行：**
- 启动 Docker Desktop 应用程序
- 等待 Docker 引擎完全启动（系统托盘图标变为绿色）
- 确保在 Docker Desktop 设置中启用了 WSL2 后端

---

### 3.1. 不使用 Docker 的替代方案

如果你不想安装 Docker，需要手动安装以下软件：

#### 3.1.1. PostgreSQL

**版本要求：** PostgreSQL 12 或更高版本（推荐 15+）

**下载链接：**
- 官网下载：https://www.postgresql.org/download/windows/
- 推荐使用 PostgreSQL 官方安装程序或使用 Chocolatey 安装

**使用 Chocolatey 安装（推荐）：**
```powershell
# 需要先安装 Chocolatey（如果未安装）
# 访问：https://chocolatey.org/install

# 安装 PostgreSQL
choco install postgresql --version=17.0.0
```

**使用官方安装程序：**
1. 访问 PostgreSQL 官网下载 Windows 安装程序
2. 运行安装程序，按照向导完成安装
3. 安装时记住设置的 postgres 用户密码
4. 安装完成后，确保 PostgreSQL 服务已启动

**检查是否已安装：**
```powershell
psql --version
```

**检查服务状态：**
```powershell
# 检查 PostgreSQL 服务是否运行
Get-Service -Name postgresql*
```

**配置数据库：**
安装完成后，需要创建项目所需的数据库：

```powershell
# 使用 psql 连接到 PostgreSQL（使用安装时设置的管理员密码）
psql -U postgres

# 在 psql 中执行以下命令创建数据库和用户
CREATE USER opencut WITH PASSWORD 'opencutthegoat';
CREATE DATABASE opencut OWNER opencut;
GRANT ALL PRIVILEGES ON DATABASE opencut TO opencut;
\q
```

**验证连接：**
```powershell
# 使用创建的用户连接数据库
psql -U opencut -d opencut -h localhost
```

#### 3.1.2. Redis

**版本要求：** Redis 6 或更高版本（推荐 7+）

**Windows 安装选项：**

**选项 1：使用 WSL2 安装 Redis（推荐）**
```powershell
# 在 WSL2 中安装 Redis
wsl
sudo apt update
sudo apt install redis-server
sudo service redis-server start
exit
```

**选项 2：使用 Memurai（Windows 原生 Redis）**
- 下载链接：https://www.memurai.com/get-memurai
- Memurai 是 Windows 上 Redis 的官方替代品
- 下载并安装 Memurai 开发版（免费）

**选项 3：使用 Docker 运行 Redis（如果已安装 Docker）**
```powershell
docker run -d -p 6379:6379 --name redis redis:7-alpine
```

**检查 Redis 是否运行：**
```powershell
# 如果使用 WSL2
wsl redis-cli ping
# 应该返回 PONG

# 如果使用 Memurai
redis-cli ping
# 应该返回 PONG
```

#### 3.1.3. Serverless Redis HTTP（用于 Redis REST API）

如果你的 Redis 不是通过 Docker 的 serverless-redis-http 运行，需要安装此服务来提供 REST API。

**使用 Docker 运行（如果已安装 Docker）：**
```powershell
docker run -d -p 8079:80 `
  -e SRH_MODE=env `
  -e SRH_TOKEN=example_token `
  -e SRH_CONNECTION_STRING="redis://localhost:6379" `
  --name serverless-redis-http `
  hiett/serverless-redis-http:latest
```

**或者使用 Node.js 运行（需要 Node.js）：**
```powershell
# 全局安装 serverless-redis-http
npm install -g serverless-redis-http

# 启动服务
serverless-redis-http --port 8079 --token example_token --connection-string "redis://localhost:6379"
```

**验证服务：**
```powershell
# 测试 REST API
curl http://localhost:8079/health
```

---

### 4. Git

Git 用于克隆项目仓库和版本控制。

**下载链接：**
- 官网下载：https://git-scm.com/download/win
- 下载 Windows 版本安装程序

**安装步骤：**
1. 下载 Git for Windows 安装程序
2. 运行安装程序，按照向导完成安装
3. 推荐使用默认选项，但确保选择 "Git from the command line and also from 3rd-party software"

**检查是否已安装：**
```powershell
# PowerShell 或 CMD
git --version
# 或
git -v
```

**首次使用 Git 配置（可选但推荐）：**
```powershell
# 配置用户名
git config --global user.name "你的用户名"

# 配置邮箱
git config --global user.email "你的邮箱@example.com"

# 查看配置
git config --list
```

---

## 项目部署步骤

### 步骤 1：克隆项目

```powershell
# 在 PowerShell 或 CMD 中执行
git clone https://github.com/OpenCut-app/OpenCut.git
cd OpenCut
```

### 步骤 2：启动数据库和 Redis 服务

#### 方式 1：使用 Docker（推荐）

如果你使用 Docker，在项目根目录下启动服务：

```powershell
# 确保 Docker Desktop 正在运行
docker-compose up -d
```

**验证服务是否启动：**
```powershell
# 检查容器状态
docker ps

# 应该看到以下服务运行：
# - postgres (端口 5432)
# - redis (端口 6379)
# - serverless-redis-http (端口 8079)
```

**如果服务启动失败：**
- 检查 Docker Desktop 是否正在运行
- 检查端口是否被占用（5432, 6379, 8079）
- 查看日志：`docker-compose logs`

#### 方式 2：使用本地安装的服务

如果你不使用 Docker，确保以下服务已启动：

**1. 检查 PostgreSQL 服务：**
```powershell
# 检查服务状态
Get-Service -Name postgresql*

# 如果服务未运行，启动服务
Start-Service postgresql-x64-17  # 根据你的 PostgreSQL 版本调整服务名
```

**2. 检查 Redis 服务：**

如果使用 WSL2：
```powershell
wsl sudo service redis-server status
# 如果未运行，启动服务
wsl sudo service redis-server start
```

如果使用 Memurai：
```powershell
# Memurai 通常会自动启动，检查服务状态
Get-Service -Name Memurai*
```

**3. 启动 Serverless Redis HTTP（如果未通过 Docker 运行）：**
```powershell
# 如果使用 Docker 运行（即使不使用 docker-compose）
docker run -d -p 8079:80 `
  -e SRH_MODE=env `
  -e SRH_TOKEN=example_token `
  -e SRH_CONNECTION_STRING="redis://localhost:6379" `
  --name serverless-redis-http `
  hiett/serverless-redis-http:latest

# 或使用 Node.js（如果已全局安装）
serverless-redis-http --port 8079 --token example_token --connection-string "redis://localhost:6379"
```

**验证服务：**
```powershell
# 验证 PostgreSQL
psql -U opencut -d opencut -h localhost -c "SELECT version();"

# 验证 Redis
# 如果使用 WSL2
wsl redis-cli ping
# 如果使用 Memurai
redis-cli ping

# 验证 Serverless Redis HTTP
curl http://localhost:8079/health
```

### 步骤 3：配置环境变量

1. **进入 web 应用目录：**
   ```powershell
   cd apps\web
   ```

2. **复制环境变量模板文件：**
   ```powershell
   # PowerShell
   Copy-Item .env.example .env.local
   
   # CMD
   copy .env.example .env.local
   ```

3. **编辑 `.env.local` 文件，配置必需的环境变量：**

   **必需变量（必须配置）：**

   ```env
   # 数据库连接
   # 如果使用 Docker：postgresql://opencut:opencutthegoat@localhost:5432/opencut
   # 如果使用本地 PostgreSQL：根据你的配置调整（用户名、密码、数据库名）
   DATABASE_URL="postgresql://opencut:opencutthegoat@localhost:5432/opencut"
   
   # Better Auth 认证密钥（需要生成）
   BETTER_AUTH_SECRET="your-generated-secret-here"
   NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
   
   # Redis 配置
   # 如果使用 Docker 的 serverless-redis-http：http://localhost:8079
   # 如果使用本地安装的 serverless-redis-http：http://localhost:8079
   # 如果使用 Upstash 云服务：填写 Upstash 提供的 URL
   UPSTASH_REDIS_REST_URL=http://localhost:8079
   UPSTASH_REDIS_REST_TOKEN=example_token
   
   # 开发环境
   NODE_ENV=development
   ```

   **生成 BETTER_AUTH_SECRET（Windows PowerShell）：**
   ```powershell
   # 方法 1：使用 PowerShell
   [System.Web.Security.Membership]::GeneratePassword(32, 0)
   
   # 方法 2：使用 Node.js（如果已安装）
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   
   # 方法 3：在线生成（推荐）
   # 访问：https://generate-secret.vercel.app/32
   ```

   **可选变量（如果不需要相关功能可以留空或使用示例值）：**

   ```env
   # Marble Blog（博客功能）
   MARBLE_WORKSPACE_KEY=cm6ytuq9x0000i803v0isidst
   NEXT_PUBLIC_MARBLE_API_URL=https://api.marblecms.com
   
   # Freesound（音频搜索功能）
   # 注册地址：https://freesound.org/apiv2/apply/
   FREESOUND_CLIENT_ID=...
   FREESOUND_API_KEY=...
   
   # Cloudflare R2（自动字幕/转录存储）
   # 从 Cloudflare Dashboard > R2 > Manage R2 API tokens 获取
   CLOUDFLARE_ACCOUNT_ID=your-account-id
   R2_ACCESS_KEY_ID=your-access-key-id
   R2_SECRET_ACCESS_KEY=your-secret-access-key
   R2_BUCKET_NAME=opencut-transcription
   
   # Modal 转录服务端点（可选）
   # 从 modal deploy transcription.py 获取
   MODAL_TRANSCRIPTION_URL=https://your-username--opencut-transcription-transcribe-audio.modal.run
   ```

### 步骤 4：安装项目依赖

在项目根目录执行：

```powershell
# 返回项目根目录（如果当前在 apps\web）
cd ..\..
bun install
```

**如果遇到安装问题：**
- 确保 Bun 已正确安装并可用
- 检查网络连接
- 如果使用代理，配置 Bun 的代理设置

### 步骤 5：运行数据库迁移

在 `apps\web` 目录下执行：

```powershell
cd apps\web
bun run db:migrate
```

**验证数据库迁移：**
- 检查是否有错误信息
- 如果迁移失败，检查 Docker 中的 PostgreSQL 容器是否正常运行
- 检查 `DATABASE_URL` 环境变量是否正确

### 步骤 6：启动开发服务器

在 `apps\web` 目录下执行：

```powershell
bun run dev
```

**成功启动后，你应该看到：**
- 类似 `Ready in Xms` 的消息
- `Local: http://localhost:3000` 的提示

### 步骤 7：访问应用

在浏览器中打开：
```
http://localhost:3000
```

---

## 验证部署

### 检查服务状态

1. **检查 Docker 容器：**
   ```powershell
   docker ps
   ```
   应该看到 3 个容器运行：postgres、redis、serverless-redis-http

2. **检查数据库连接：**
   ```powershell
   docker exec -it opencut-db-1 psql -U opencut -d opencut -c "\dt"
   ```
   应该能看到数据库表列表

3. **检查 Redis：**
   ```powershell
   docker exec -it opencut-redis-1 redis-cli ping
   ```
   应该返回 `PONG`

4. **检查应用健康状态：**
   - 访问 http://localhost:3000
   - 如果页面正常加载，说明部署成功

---

## 常见问题排查

### 问题 1：端口被占用

**错误信息：** `Error: listen EADDRINUSE: address already in use :::3000`

**解决方法：**
```powershell
# 查找占用端口的进程
netstat -ano | findstr :3000

# 结束进程（替换 PID 为实际进程ID）
taskkill /PID <PID> /F
```

### 问题 2：Docker 服务无法启动

**可能原因：**
- WSL2 未正确配置
- Docker Desktop 未运行
- 端口冲突

**解决方法：**
1. 确保 Docker Desktop 正在运行
2. 检查 WSL2 是否正确安装：`wsl --version`
3. 重启 Docker Desktop
4. 检查端口占用情况

### 问题 3：数据库连接失败

**错误信息：** `Error: connect ECONNREFUSED 127.0.0.1:5432`

**解决方法：**
1. 检查 Docker 容器是否运行：`docker ps`
2. 检查 PostgreSQL 容器日志：`docker logs opencut-db-1`
3. 验证 `DATABASE_URL` 环境变量是否正确
4. 重启数据库容器：`docker-compose restart db`

### 问题 4：Bun 命令未找到

**解决方法：**
1. 检查 Bun 是否安装：`bun --version`
2. 检查 PATH 环境变量
3. 重新安装 Bun
4. 重启终端或重新登录

### 问题 5：环境变量未生效

**解决方法：**
1. 确保 `.env.local` 文件在 `apps\web` 目录下
2. 检查文件格式是否正确（无 BOM，使用 UTF-8 编码）
3. 重启开发服务器
4. 确保变量名没有拼写错误

### 问题 6：数据库迁移失败

**解决方法：**
1. 检查数据库连接是否正常
2. 检查 `DATABASE_URL` 是否正确
3. 查看迁移日志：`bun run db:migrate` 的输出
4. 如果数据库已存在数据，可能需要重置数据库

---

## 停止服务

### 停止开发服务器
在运行 `bun run dev` 的终端中按 `Ctrl + C`

### 停止 Docker 服务
在项目根目录执行：
```powershell
docker-compose down
```

### 停止并删除数据（注意：会删除数据库数据）
```powershell
docker-compose down -v
```

---

## 生产环境部署

本指南主要针对本地开发环境。生产环境部署需要考虑：

1. **环境变量：** 使用安全的密钥管理服务
2. **数据库：** 使用生产级 PostgreSQL 数据库
3. **Redis：** 使用生产级 Redis 服务（如 Upstash）
4. **反向代理：** 配置 Nginx 或类似工具
5. **HTTPS：** 配置 SSL 证书
6. **监控：** 设置日志和监控系统

---

## 技术支持

如果遇到问题：
1. 查看项目 GitHub Issues：https://github.com/OpenCut-app/OpenCut/issues
2. 查看项目文档：https://github.com/OpenCut-app/OpenCut
3. 检查 Docker 和数据库日志

---

## 附录：快速命令参考

```powershell
# 检查所有软件版本
node --version
npm --version
bun --version
docker --version
git --version

# Docker 常用命令
docker-compose up -d          # 启动服务
docker-compose down            # 停止服务
docker-compose logs            # 查看日志
docker ps                      # 查看运行中的容器

# 项目常用命令
bun install                   # 安装依赖
bun run db:migrate            # 运行数据库迁移
bun run dev                   # 启动开发服务器
bun run build                 # 构建生产版本
```

