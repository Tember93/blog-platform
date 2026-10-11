const express = require("express");
const prisma = require("../prismaClient");

const router = express.Router();

// GET /api/tags —— 标签列表（含已发布文章数，用于热门标签）
router.get("/", async (req, res) => {
  try {
    const [tags, articleCounts] = await Promise.all([
      prisma.tag.findMany({ orderBy: { id: "asc" } }),
      prisma.articleTag.groupBy({
        by: ["tagId"],
        where: { article: { status: "PUBLISHED" } },
        _count: { tagId: true },
      }),
    ]);

    const countMap = {};
    for (const item of articleCounts) {
      countMap[item.tagId] = item._count.tagId;
    }

    const result = tags.map((tag) => ({
      id: tag.id,
      name: tag.name,
      articleCount: countMap[tag.id] || 0,
    }));

    res.json(result);
  } catch (error) {
    console.error("获取标签列表失败:", error);
    res.status(500).json({ error: "服务器内部错误" });
  }
});

module.exports = router;
