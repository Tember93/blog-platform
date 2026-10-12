const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../prismaClient");

const router = express.Router();

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function exceedsCharacterLimit(value, maxLength) {
  return Array.from(value).length > maxLength;
}

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const username = normalizeText(req.body?.username);
    const email = normalizeText(req.body?.email);
    const password =
      typeof req.body?.password === "string" ? req.body.password : "";

    if (!username || !email || !password) {
      return res.status(400).json({ error: "请填写用户名、邮箱和密码" });
    }
    if (exceedsCharacterLimit(username, 50)) {
      return res.status(400).json({ error: "用户名不能超过 50 个字符" });
    }
    if (exceedsCharacterLimit(email, 100)) {
      return res.status(400).json({ error: "邮箱不能超过 100 个字符" });
    }

    // 邮箱格式校验
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "邮箱格式不正确" });
    }

    // 密码长度校验（bcrypt 最大 72 字节）
    if (Array.from(password).length < 6) {
      return res.status(400).json({ error: "密码长度不能少于6位" });
    }
    if (Buffer.byteLength(password, "utf8") > 72) {
      return res.status(400).json({ error: "密码不能超过 72 字节" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // 直接创建，利用数据库唯一约束保证原子性，避免 TOCTOU 竞态
    const user = await prisma.user.create({
      data: { username, email, passwordHash },
    });

    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.status(201).json({
      message: "注册成功",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    // Prisma 唯一约束冲突（P2002）→ 邮件或用户名重复
    // meta.target 在 Prisma 6 中是字符串（约束名），格式如 "user_email_key"
    if (error.code === "P2002") {
      const target = String(error.meta?.target ?? "");
      if (target.includes("email")) {
        return res.status(400).json({ error: "该邮箱已被注册" });
      }
      if (target.includes("username")) {
        return res.status(400).json({ error: "该用户名已被使用" });
      }
    }
    console.error("注册失败:", error);
    res.status(500).json({ error: "服务器内部错误" });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const email = normalizeText(req.body?.email);
    const password =
      typeof req.body?.password === "string" ? req.body.password : "";

    if (!email || !password) {
      return res.status(400).json({ error: "请提供邮箱和密码" });
    }
    if (exceedsCharacterLimit(email, 100)) {
      return res.status(400).json({ error: "邮箱不能超过 100 个字符" });
    }
    if (Buffer.byteLength(password, "utf8") > 72) {
      return res.status(400).json({ error: "密码不能超过 72 字节" });
    }

    // 查找用户
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "邮箱或密码错误" });
    }

    // 验证密码
    const passwordValid = await bcrypt.compare(password, user.passwordHash);
    if (!passwordValid) {
      return res.status(401).json({ error: "邮箱或密码错误" });
    }

    // 签发 JWT（有效期 7 天）
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.json({
      message: "登录成功",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("登录失败:", error);
    res.status(500).json({ error: "服务器内部错误" });
  }
});

module.exports = router;
