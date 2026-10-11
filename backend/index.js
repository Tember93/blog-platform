require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const articleRoutes = require("./routes/article");
const tagRoutes = require("./routes/tag");
const authMiddleware = require("./middleware/auth");

const app = express();
app.use(cors());
app.use(express.json());

// 公开路由：注册/登录
app.use("/api/auth", authRoutes);

// 文章路由（内部区分公开/受保护）
app.use("/api/articles", articleRoutes);

// 标签路由
app.use("/api/tags", tagRoutes);

// 受保护的测试路由：获取当前用户信息
app.get("/api/user/profile", authMiddleware, async (req, res) => {
  // req.user 由中间件注入，包含 userId 和 username
  res.json({
    message: "这是一个受保护的接口",
    user: req.user,
  });
});

// 根路径
app.get("/", (req, res) => {
  res.json({ message: "Blog API is running" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
