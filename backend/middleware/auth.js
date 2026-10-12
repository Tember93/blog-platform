const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
  // 从请求头中获取 token（格式: Bearer <token>）
  const authHeader = req.headers.authorization;
  const match =
    typeof authHeader === "string" ? authHeader.match(/^Bearer ([^\s]+)$/) : null;

  if (!match) {
    return res.status(401).json({ error: "未提供认证令牌" });
  }

  const token = match[1];

  try {
    // 验证 token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!Number.isSafeInteger(decoded.userId) || decoded.userId <= 0) {
      return res.status(401).json({ error: "令牌无效或已过期" });
    }
    // 将用户信息附加到 req 对象，方便后续路由使用
    req.user = {
      userId: decoded.userId,
      username: decoded.username,
    };
    next(); // 继续下一个中间件或路由处理
  } catch (error) {
    return res.status(401).json({ error: "令牌无效或已过期" });
  }
}

module.exports = authMiddleware;
