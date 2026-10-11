const express = require("express");
const jwt = require("jsonwebtoken");
const prisma = require("../prismaClient");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// POST /api/articles —— 创建文章（需登录，标签可选）
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, content, tagIds } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: "标题和内容不能为空" });
    }

    // 允许设定 status，默认 PUBLISHED
    const status = req.body.status === "DRAFT" ? "DRAFT" : "PUBLISHED";

    const article = await prisma.article.create({
      data: {
        title,
        content,
        status,
        authorId: req.user.userId, // 从 JWT 解析，不信任前端
        tags:
          tagIds && tagIds.length > 0
            ? {
                create: tagIds.map((tagId) => ({ tagId })),
              }
            : undefined,
      },
      include: {
        author: { select: { id: true, username: true } },
        tags: { include: { tag: true } },
      },
    });

    // 展平 tags 便于前端消费
    res.status(201).json({
      ...article,
      tags: article.tags.map((t) => ({ id: t.tag.id, name: t.tag.name })),
    });
  } catch (error) {
    console.error("创建文章失败:", error);
    res.status(500).json({ error: "服务器内部错误" });
  }
});

// GET /api/articles —— 已发布文章列表（公开，支持分页、标签筛选）
router.get("/", async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;
    const tagId = parseInt(req.query.tagId);

    const where = { status: "PUBLISHED" };
    if (!isNaN(tagId)) {
      where.tags = { some: { tagId } };
    }

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          author: { select: { id: true, username: true } },
          tags: { include: { tag: true } },
          _count: { select: { comments: true } },
        },
      }),
      prisma.article.count({ where }),
    ]);

    // 展平 tags
    const result = articles.map((article) => ({
      ...article,
      tags: article.tags.map((t) => ({ id: t.tag.id, name: t.tag.name })),
    }));

    res.json({
      articles: result,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("获取文章列表失败:", error);
    res.status(500).json({ error: "服务器内部错误" });
  }
});

// GET /api/user/drafts —— 当前用户的草稿列表（需登录，放在 /:id 之前避免路由冲突）
router.get("/user/drafts", authMiddleware, async (req, res) => {
  try {
    const drafts = await prisma.article.findMany({
      where: { authorId: req.user.userId, status: "DRAFT" },
      orderBy: { updatedAt: "desc" },
      include: {
        tags: { include: { tag: true } },
      },
    });

    res.json(
      drafts.map((article) => ({
        ...article,
        tags: article.tags.map((t) => ({ id: t.tag.id, name: t.tag.name })),
      })),
    );
  } catch (error) {
    console.error("获取草稿列表失败:", error);
    res.status(500).json({ error: "服务器内部错误" });
  }
});

// POST /api/articles/:id/comments —— 发表评论（需登录）
router.post("/:id/comments", authMiddleware, async (req, res) => {
  try {
    const articleId = parseInt(req.params.id);
    const { content } = req.body;

    if (isNaN(articleId)) {
      return res.status(400).json({ error: "文章 ID 格式错误" });
    }
    if (!content) {
      return res.status(400).json({ error: "评论内容不能为空" });
    }

    const article = await prisma.article.findFirst({
      where: { id: articleId, status: "PUBLISHED" },
    });
    if (!article) {
      return res.status(404).json({ error: "文章不存在" });
    }

    const comment = await prisma.comment.create({
      data: { content, articleId, userId: req.user.userId },
      include: { user: { select: { id: true, username: true } } },
    });

    res.status(201).json(comment);
  } catch (error) {
    console.error("发表评论失败:", error);
    res.status(500).json({ error: "服务器内部错误" });
  }
});

// GET /api/articles/:id/comments —— 评论列表（公开）
router.get("/:id/comments", async (req, res) => {
  try {
    const articleId = parseInt(req.params.id);
    if (isNaN(articleId)) {
      return res.status(400).json({ error: "文章 ID 格式错误" });
    }

    const comments = await prisma.comment.findMany({
      where: { articleId },
      orderBy: { createdAt: "asc" },
      include: { user: { select: { id: true, username: true } } },
    });

    res.json(comments);
  } catch (error) {
    console.error("获取评论列表失败:", error);
    res.status(500).json({ error: "服务器内部错误" });
  }
});

// PUT /api/articles/:id —— 编辑文章（需登录，仅作者本人）
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "文章 ID 格式错误" });
    }

    // 查找文章（不限制状态，允许编辑草稿）
    const existing = await prisma.article.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "文章不存在" });
    }
    if (existing.authorId !== req.user.userId) {
      return res.status(403).json({ error: "只能编辑自己的文章" });
    }

    const { title, content, tagIds } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: "标题和内容不能为空" });
    }

    const status = req.body.status === "DRAFT" ? "DRAFT" : "PUBLISHED";

    // 标签替换：先删旧关联，再建新的
    if (tagIds !== undefined) {
      await prisma.articleTag.deleteMany({ where: { articleId: id } });
    }

    // 草稿变为发布时，发布时间重置为当前
    const publishNow = status === "PUBLISHED" && existing.status === "DRAFT";

    const article = await prisma.article.update({
      where: { id },
      data: {
        title,
        content,
        status,
        ...(publishNow ? { createdAt: new Date() } : {}),
        tags:
          tagIds !== undefined && tagIds.length > 0
            ? { create: tagIds.map((tagId) => ({ tagId })) }
            : undefined,
      },
      include: {
        author: { select: { id: true, username: true } },
        tags: { include: { tag: true } },
      },
    });

    res.json({
      ...article,
      tags: article.tags.map((t) => ({ id: t.tag.id, name: t.tag.name })),
    });
  } catch (error) {
    console.error("编辑文章失败:", error);
    res.status(500).json({ error: "服务器内部错误" });
  }
});

// DELETE /api/articles/:id —— 删除文章（需登录，仅作者本人）
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "文章 ID 格式错误" });
    }

    const existing = await prisma.article.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "文章不存在" });
    }
    if (existing.authorId !== req.user.userId) {
      return res.status(403).json({ error: "只能删除自己的文章" });
    }

    // 级联删除：Prisma schema 中 ArticleTag 和 Comment 已设 onDelete: Cascade
    await prisma.article.delete({ where: { id } });

    res.json({ message: "文章已删除" });
  } catch (error) {
    console.error("删除文章失败:", error);
    res.status(500).json({ error: "服务器内部错误" });
  }
});

// GET /api/articles/:id —— 文章详情（公开，已发布；作者本人可看草稿）
router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "文章 ID 格式错误" });
    }

    // 尝试从 token 获取当前用户（可选认证，不强制）
    let currentUserId = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        currentUserId = decoded.userId;
      } catch {
        // token 无效，当游客处理
      }
    }

    const article = await prisma.article.findFirst({
      where: {
        id,
        OR: [
          { status: "PUBLISHED" },
          ...(currentUserId ? [{ authorId: currentUserId }] : []),
        ],
      },
      include: {
        author: { select: { id: true, username: true } },
        tags: { include: { tag: true } },
        comments: {
          orderBy: { createdAt: "asc" },
          include: {
            user: { select: { id: true, username: true } },
          },
        },
      },
    });

    if (!article) {
      return res.status(404).json({ error: "文章不存在" });
    }

    res.json({
      ...article,
      tags: article.tags.map((t) => ({ id: t.tag.id, name: t.tag.name })),
    });
  } catch (error) {
    console.error("获取文章详情失败:", error);
    res.status(500).json({ error: "服务器内部错误" });
  }
});

module.exports = router;
