# Blog Platform

一个前后端分离的个人博客练手项目，用于完整实践从页面交互、接口设计、身份认证到关系型数据建模的协作流程。项目覆盖用户注册登录、文章与草稿管理、标签分类、分页、评论和 Markdown 展示，可在本地完整运行。

> 本仓库定位为个人学习与面试展示项目，目前没有公网演示地址。

## 功能概览

- 用户注册、登录、退出及 JWT 身份认证
- 文章创建、编辑、删除和作者权限校验
- 草稿与已发布状态管理
- Markdown 内容编辑与渲染
- 多标签关联、分类筛选和分页查询
- 登录用户发表评论
- 灵感模式随机浏览一篇已发布文章
- 骨架屏、空状态、分页和移动端响应式布局
- Vue Router 路由懒加载

## 技术栈

| 层级 | 技术 |
| --- | --- |
| 前端 | Vue 3、Pinia、Vue Router、Element Plus、Axios、Markdown-it、Vite |
| 后端 | Node.js、Express、JWT、bcrypt |
| 数据 | Prisma ORM、MySQL |

## 请求链路

```mermaid
flowchart LR
  Browser[浏览器] --> Vue[Vue 3 页面与 Pinia]
  Vue -->|Axios /api| Express[Express 路由]
  Express --> Auth[JWT 认证与作者鉴权]
  Express --> Prisma[Prisma ORM]
  Prisma --> MySQL[(MySQL)]
```

开发环境中，Vite 将 `/api` 请求代理到 `http://localhost:3000`。Axios 请求拦截器负责附加 Token，响应拦截器统一处理接口错误和登录失效。

## 项目结构

```text
blog-platform/
├── frontend/                     # Vue 3 前端
│   └── src/
│       ├── apis/                 # API 请求封装
│       ├── components/           # 通用组件
│       ├── router/               # 路由与访问控制
│       ├── stores/               # Pinia 登录状态
│       ├── utils/                # Axios 与格式化工具
│       └── views/                # 页面组件
├── backend/                      # Express 后端
│   ├── middleware/               # JWT 认证中间件
│   ├── prisma/
│   │   ├── migrations/           # 数据库初始化迁移
│   │   └── schema.prisma         # 数据模型
│   ├── routes/                   # 认证、文章和标签接口
│   ├── .env.example              # 环境变量示例
│   └── seed.js                   # 本地演示数据
├── docs/images/                  # 项目截图
└── README.md
```

## 本地运行

### 环境要求

- Node.js `20.19.0` 及以上，或 `22.12.0` 及以上
- MySQL 8（推荐）
- npm

### 1. 创建数据库

登录 MySQL 后创建本地数据库：

```sql
CREATE DATABASE blog CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. 启动后端

```powershell
cd backend
npm install
Copy-Item .env.example .env
```

macOS 或 Linux 可使用 `cp .env.example .env`。然后修改 `.env`：

```dotenv
DATABASE_URL="mysql://数据库用户名:数据库密码@localhost:3306/blog"
JWT_SECRET="请替换为长度足够且不可预测的随机字符串"
PORT=3000
ALLOW_DATABASE_RESET=false
```

生成 Prisma Client 并执行迁移：

```powershell
npm run prisma:generate
npm run db:migrate
```

启动后端：

```powershell
npm run dev
```

后端默认运行在 `http://localhost:3000`。

### 3. 可选：写入演示数据

`db:seed` 会先清空 `comment`、`article_tag`、`article`、`tag`、`user` 五张表，然后写入 3 个用户、7 个标签、12 篇已发布文章、2 篇草稿和演示评论。

请只对允许清空的本地演示数据库执行：

1. 将 `.env` 中的 `ALLOW_DATABASE_RESET` 临时改为 `true`。
2. 运行 `npm run db:seed`。
3. 完成后立即将 `ALLOW_DATABASE_RESET` 恢复为 `false`。

演示账户密码均为 `123456`：

| 邮箱 | 用户名 |
| --- | --- |
| `sunny@blog.com` | sunny |
| `zhiyin@blog.com` | 知隐 |
| `liuyue@blog.com` | 六月 |

### 4. 启动前端

新开一个终端：

```powershell
cd frontend
npm install
npm run dev
```

前端默认运行在 `http://localhost:5174`。

## 核心 API

| 方法 | 路径 | 登录要求 | 说明 |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | 否 | 注册并签发 JWT |
| POST | `/api/auth/login` | 否 | 登录并签发 JWT |
| GET | `/api/articles` | 否 | 已发布文章分页与标签筛选 |
| GET | `/api/articles/:id` | 可选 | 文章详情；作者可查看自己的草稿 |
| POST | `/api/articles` | 是 | 创建文章或草稿 |
| PUT | `/api/articles/:id` | 是，仅作者 | 更新文章并原子替换标签 |
| DELETE | `/api/articles/:id` | 是，仅作者 | 删除文章及其标签关联和评论 |
| POST | `/api/articles/:id/comments` | 是 | 发表评论 |
| GET | `/api/articles/user/drafts` | 是 | 获取当前用户草稿 |
| GET | `/api/tags` | 否 | 获取标签及文章数量 |

`backend/api-test.http` 提供了可在支持 HTTP Client 的编辑器中执行的请求示例。

## 数据模型

- `User`：用户信息，与文章、评论建立一对多关系。
- `Article`：文章正文、作者和 `DRAFT / PUBLISHED` 状态。
- `Tag`：标签信息。
- `ArticleTag`：文章与标签的显式多对多关联表，使用联合主键防止重复关联。
- `Comment`：关联文章和评论用户。

删除文章时，数据库通过外键级联删除对应的 `ArticleTag` 和 `Comment`；删除用户受到其文章引用限制。

## 关键实现位置

| 技术点 | 代码位置 |
| --- | --- |
| JWT 签发、bcrypt 密码哈希 | `backend/routes/auth.js` |
| Token 校验与受保护路由 | `backend/middleware/auth.js`、`frontend/src/router/index.js` |
| 作者权限、草稿状态、分页与标签筛选 | `backend/routes/article.js` |
| 关系模型、联合主键与级联规则 | `backend/prisma/schema.prisma` |
| Axios Token 注入与统一错误处理 | `frontend/src/utils/http.js` |
| Pinia 登录状态持久化 | `frontend/src/stores/auth.js` |
| 骨架屏、空状态、分页与随机浏览 | `frontend/src/views/Home.vue` |
| 路由懒加载 | `frontend/src/router/index.js` |

## 安全边界

- 密码使用 bcrypt 哈希，服务端不保存明文密码。
- 文章更新和删除均以 JWT 中的用户 ID 做作者校验，不信任前端传入的作者字段。
- 注册与文章接口校验字段类型、长度和合法状态。
- 登录失败统一返回“邮箱或密码错误”，避免暴露邮箱是否已注册。
- 种子脚本默认禁止清空数据库，必须显式设置 `ALLOW_DATABASE_RESET=true`。
- 当前练手项目将 JWT 保存在 `localStorage`。生产项目更适合结合 HTTPS、HttpOnly Cookie、CSRF 防护和更完整的令牌续期策略。

## 项目截图

本地全链路复验后，将在 `docs/images/` 中补充首页、文章详情、编辑器和移动端界面截图。

