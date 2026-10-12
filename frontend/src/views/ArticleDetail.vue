<template>
  <div class="article-page">
    <div v-if="loading" class="loading">
      <el-skeleton :rows="8" animated />
    </div>
    <template v-else-if="article">
      <article class="article-content">
        <h1 class="article-title">{{ article.title }}</h1>
        <div class="article-meta">
          <el-avatar :size="32">{{ article.author?.username?.[0] }}</el-avatar>
          <span class="author-name">{{ article.author?.username }}</span>
          <span class="dot">·</span>
          <span>{{ formatDateTime(article.createdAt) }}</span>
          <template v-if="isAuthor">
            <span class="dot">·</span>
            <el-button size="small" @click="$router.push(`/editor/${article.id}`)">
              编辑
            </el-button>
            <el-button size="small" type="danger" @click="handleDelete">
              删除
            </el-button>
          </template>
        </div>
        <div class="article-tags">
          <el-tag v-for="tag in article.tags" :key="tag.id" size="small" @click="$router.push(`/?tagId=${tag.id}`)">
            {{ tag.name }}
          </el-tag>
        </div>
        <div class="markdown-body" v-html="renderedContent" />
      </article>

      <section class="comments-section">
        <h3>评论（{{ comments.length }}）</h3>

        <div v-if="authStore.isLoggedIn" class="comment-form">
          <el-input v-model="commentContent" type="textarea" :rows="3" placeholder="写下你的评论..." />
          <el-button type="primary" :loading="submitting" class="submit-comment" @click="handleComment">
            发表评论
          </el-button>
        </div>
        <div v-else class="login-hint">
          请先<router-link to="/login">登录</router-link>后发表评论
        </div>

        <div v-if="comments.length > 0" class="comment-list">
          <div v-for="comment in comments" :key="comment.id" class="comment-item">
            <el-avatar :size="36">{{ comment.user?.username?.[0] }}</el-avatar>
            <div class="comment-body">
              <div class="comment-header">
                <span class="comment-username">{{ comment.user?.username }}</span>
                <span class="comment-time">{{ formatDate(comment.createdAt) }}</span>
              </div>
              <p class="comment-text">{{ comment.content }}</p>
            </div>
          </div>
        </div>
      </section>
    </template>
    <el-empty v-else description="文章不存在" />
  </div>
</template>

<script setup>
import { ref, watch, computed } from "vue"
import { useRoute, useRouter } from "vue-router"
import MarkdownIt from "markdown-it"
import { getDetail, createComment, remove } from "@/apis/article.js"
import { useAuthStore } from "@/stores/auth.js"
import { formatDate, formatDateTime } from "@/utils/format.js"
import { ElMessage, ElMessageBox } from "element-plus"

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const md = new MarkdownIt({ breaks: true })

const article = ref(null)
const comments = ref([])
const loading = ref(true)
const commentContent = ref("")
const submitting = ref(false)

const isAuthor = computed(() => {
  return authStore.user?.id && authStore.user.id === article.value?.authorId
})

const renderedContent = computed(() => {
  if (!article.value?.content) return ""
  return md.render(article.value.content)
})

watch(
  () => route.params.id,
  () => fetchArticle(),
  { immediate: true },
)

async function fetchArticle() {
  loading.value = true
  try {
    const res = await getDetail(route.params.id)
    article.value = res
    comments.value = res.comments || []
  } catch {
    article.value = null
  } finally {
    loading.value = false
  }
}

async function handleComment() {
  const content = commentContent.value.trim()
  if (!content) {
    ElMessage.warning("请输入评论内容")
    return
  }
  submitting.value = true
  try {
    const res = await createComment(article.value.id, content)
    comments.value.push(res)
    commentContent.value = ""
    ElMessage.success("评论成功")
  } catch {
    // 错误信息已在拦截器中展示
  } finally {
    submitting.value = false
  }
}

async function handleDelete() {
  try {
    await ElMessageBox.confirm(
      "删除后无法恢复，确定要删除这篇文章吗？",
      "确认删除",
      { confirmButtonText: "删除", cancelButtonText: "取消", type: "warning" },
    )
  } catch {
    return
  }
  try {
    await remove(article.value.id)
    ElMessage.success("文章已删除")
    router.push("/")
  } catch {
    // 错误信息已在拦截器中展示
  }
}
</script>

<style scoped>
.article-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px 20px;
}

.loading {
  padding: 20px 0;
}

.article-title {
  font-size: 32px;
  margin: 0 0 16px;
  color: #333;
}

.article-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  color: #999;
  font-size: 14px;
  margin-bottom: 16px;
}

.article-meta .dot {
  margin: 0 4px;
}

.author-name {
  color: #555;
  font-weight: 500;
}

.article-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 24px;
}

.markdown-body {
  font-size: 16px;
  line-height: 1.9;
  color: #333;
  overflow-wrap: anywhere;
}

.markdown-body :deep(h1),
.markdown-body :deep(h2),
.markdown-body :deep(h3) {
  margin-top: 28px;
  margin-bottom: 14px;
}

.markdown-body :deep(p) {
  margin-bottom: 16px;
}

.markdown-body :deep(code) {
  background: #f5f5f5;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 14px;
}

.markdown-body :deep(pre) {
  background: #f5f5f5;
  padding: 16px;
  border-radius: 8px;
  overflow-x: auto;
}

.markdown-body :deep(pre code) {
  background: none;
  padding: 0;
}

.markdown-body :deep(blockquote) {
  border-left: 4px solid #ddd;
  padding-left: 16px;
  color: #666;
  margin: 16px 0;
}

.markdown-body :deep(img) {
  max-width: 100%;
  border-radius: 6px;
}

.markdown-body :deep(table) {
  display: block;
  max-width: 100%;
  overflow-x: auto;
}

.comments-section {
  margin-top: 48px;
  padding-top: 24px;
  border-top: 1px solid #eee;
}

.comments-section h3 {
  margin-bottom: 20px;
}

.comment-form {
  margin-bottom: 24px;
}

.submit-comment {
  margin-top: 10px;
}

.login-hint {
  padding: 16px;
  background: #fafafa;
  border-radius: 6px;
  text-align: center;
  color: #999;
  font-size: 14px;
  margin-bottom: 24px;
}

.comment-item {
  display: flex;
  gap: 12px;
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;
}

.comment-body {
  flex: 1;
  min-width: 0;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.comment-username {
  font-weight: 500;
  color: #333;
  font-size: 14px;
}

.comment-time {
  color: #bbb;
  font-size: 12px;
}

.comment-text {
  color: #555;
  font-size: 14px;
  line-height: 1.6;
  margin: 0;
  overflow-wrap: anywhere;
}

@media (max-width: 768px) {
  .article-page {
    padding: 20px 14px;
  }

  .article-title {
    font-size: 26px;
    line-height: 1.35;
  }

  .article-meta {
    gap: 6px;
  }

  .article-meta :deep(.el-button + .el-button) {
    margin-left: 0;
  }

  .comments-section {
    margin-top: 36px;
  }
}

@media (max-width: 480px) {
  .article-title {
    font-size: 23px;
  }

  .comment-item {
    gap: 10px;
  }
}
</style>
