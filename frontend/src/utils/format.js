export function stripMarkdown(md, maxLength = 150) {
  if (!md) return ""
  let text = md
    .replace(/```[\s\S]*?```/g, "")       // 代码块
    .replace(/`([^`]+)`/g, "$1")           // 行内代码
    .replace(/!\[.*?\]\(.*?\)/g, "")       // 图片
    .replace(/\[([^\]]*)\]\(.*?\)/g, "$1") // 链接，保留文本
    .replace(/^#{1,6}\s+/gm, "")           // 标题
    .replace(/(\*\*|__)(.*?)\1/g, "$2")    // 粗体
    .replace(/(\*|_)(.*?)\1/g, "$2")       // 斜体
    .replace(/^>\s+/gm, "")                // 引用
    .replace(/^(-{3,}|\*{3,})$/gm, "")     // 水平线
    .replace(/^[\s]*[-*+]\s+/gm, "")       // 无序列表
    .replace(/^\d+\.\s+/gm, "")            // 有序列表
    .replace(/\n{2,}/g, " ")               // 多个换行合并为空格
    .replace(/\n/g, " ")                   // 单个换行转空格
    .replace(/\s{2,}/g, " ")               // 多个空格合并
    .trim()

  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + "..."
}

export function formatDate(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export function formatDateTime(dateStr) {
  const d = new Date(dateStr)
  const date = d.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
  const time = d.toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
  })
  return `${date} ${time}`
}
