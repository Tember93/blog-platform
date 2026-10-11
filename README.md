# Blog Platform

一个用于学习前后端协作流程的全栈个人练手项目。项目采用前后端分离结构，覆盖用户认证、文章管理、标签分类、草稿和评论等常见博客功能。

## 技术栈

- 前端：Vue 3、Pinia、Vue Router、Element Plus、Axios、Markdown-it、Vite
- 后端：Node.js、Express、Prisma ORM、MySQL、JWT、bcrypt

## 已实现功能

- 用户注册、登录和退出
- JWT 身份认证与作者权限校验
- 文章创建、编辑、删除、草稿和发布状态管理
- Markdown 内容解析与展示
- 标签多选、分类筛选与文章分页
- 登录用户发表评论
- 加载、空数据和分页状态展示
- 页面路由懒加载

## 项目结构

```text
blog-platform/
├── frontend/          # Vue 3 前端
├── backend/           # Express API 与 Prisma 数据模型
├── docs/images/       # 项目截图
├── .gitignore
└── README.md
```

## 当前状态

项目正在进行公开仓库整理。本地运行步骤、环境变量、数据库初始化、API 说明、数据模型和功能截图将在完成验证后补充。

