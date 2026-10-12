<template>
  <div class="home-page">
    <aside class="sidebar">
      <ul class="menu-list">
        <li :class="{ active: currentView === 'all' }" @click="switchView('all')">
          全部
        </li>
        <li :class="{ active: currentView === 'category' || selectedTagId }" @click="toggleCategory">
          分类
        </li>
        <li v-show="categoryExpanded" v-for="tag in tags" :key="tag.id" class="sub-tag"
          :class="{ active: selectedTagId === tag.id }" @click="selectTag(tag.id)">
          {{ tag.name }}
          <span class="count">{{ tag.articleCount }}</span>
        </li>
        <li :class="{ active: currentView === 'inspiration' }" @click="switchView('inspiration')">
          灵感
        </li>
        <li :class="{ active: currentView === 'mine' }" @click="switchView('mine')">
          我的
        </li>
      </ul>
    </aside>

    <main class="main">
      <!-- 灵感介绍 -->
      <div v-if="currentView === 'inspiration'" class="inspo-banner">
        <div>
          <h2>灵感</h2>
          <p>从全部已发布文章中随机发现一篇。</p>
        </div>
        <el-button :loading="loading" @click="refreshInspiration">
          换一篇
        </el-button>
      </div>

      <!-- 我的 -->
      <div v-if="currentView === 'mine'" class="profile-card">
        <template v-if="authStore.isLoggedIn">
          <el-avatar :size="56" class="profile-avatar">
            {{ authStore.user?.username?.[0] }}
          </el-avatar>
          <div class="profile-info">
            <h3>{{ authStore.user?.username }}</h3>
            <p>{{ authStore.user?.email }}</p>
          </div>
        </template>
        <template v-else>
          <p>请先<router-link to="/login">登录</router-link></p>
        </template>
      </div>

      <!-- 文章列表 -->
      <div v-if="currentView !== 'mine'">
        <div v-if="loading && !hasFetched" class="loading">
          <el-skeleton :rows="4" animated />
        </div>
        <template v-else>
          <div v-for="article in articles" :key="article.id" class="article-card"
            @click="$router.push(`/article/${article.id}`)">
            <h2 class="card-title">{{ article.title }}</h2>
            <div class="card-meta">
              <span>{{ article.author.username }}</span>
              <span class="dot">·</span>
              <span>{{ formatDateTime(article.createdAt) }}</span>
            </div>
            <div class="card-tags">
              <el-tag v-for="tag in article.tags" :key="tag.id" size="small" @click.stop="selectTag(tag.id)">
                {{ tag.name }}
              </el-tag>
            </div>
            <p class="card-summary">{{ stripMarkdown(article.content) }}</p>
          </div>

          <!-- 分页：全部 / 分类 -->
          <div v-if="articles.length > 0 && currentView !== 'inspiration'" class="pagination">
            <el-pagination :current-page="page" :page-size="pagination.limit" :total="pagination.total"
              layout="prev, pager, next" @current-change="handlePageChange" />
          </div>

          <el-empty v-if="!loading && articles.length === 0" description="暂无文章" />
        </template>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue"
import { useRoute, useRouter } from "vue-router"
import { getList } from "@/apis/article.js"
import { getTags } from "@/apis/tag.js"
import { useAuthStore } from "@/stores/auth.js"
import { stripMarkdown, formatDateTime } from "@/utils/format.js"

const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()

const currentView = ref("all")
const categoryExpanded = ref(false)
const tags = ref([])
const articles = ref([])
const pagination = ref({ page: 1, limit: 10, total: 0, totalPages: 0 })
const page = ref(1)
const selectedTagId = ref(null)
const loading = ref(true)
const hasFetched = ref(false)
let latestRequestId = 0

onMounted(() => {
  fetchTags()
})

watch(
  () => [route.query.view, route.query.tagId],
  () => {
    syncViewFromRoute()
    page.value = 1
    fetchArticles()
  },
  { immediate: true },
)

async function fetchTags() {
  try {
    const res = await getTags()
    tags.value = Array.isArray(res) ? res : res.tags || []
  } catch {
    // ignore
  }
}

async function fetchArticles() {
  const requestId = ++latestRequestId
  loading.value = true

  if (currentView.value === "mine") {
    articles.value = []
    loading.value = false
    hasFetched.value = true
    return
  }

  try {
    if (currentView.value === "inspiration") {
      const firstPage = await getList({ page: 1, limit: 1 })
      const total = Number(firstPage.pagination?.total) || 0

      if (requestId !== latestRequestId) return
      if (total === 0) {
        articles.value = []
        return
      }

      const randomPage = Math.floor(Math.random() * total) + 1
      const res =
        randomPage === 1
          ? firstPage
          : await getList({ page: randomPage, limit: 1 })

      if (requestId !== latestRequestId) return
      articles.value = (res.articles || []).slice(0, 1)
    } else {
      const params = { page: page.value, limit: 10 }
      if (selectedTagId.value) params.tagId = selectedTagId.value
      const res = await getList(params)

      if (requestId !== latestRequestId) return
      articles.value = res.articles || []
      pagination.value = res.pagination || { page: 1, limit: 10, total: 0, totalPages: 0 }
    }
  } catch {
    if (requestId === latestRequestId) {
      articles.value = []
    }
  } finally {
    if (requestId === latestRequestId) {
      loading.value = false
      hasFetched.value = true
    }
  }
}

function syncViewFromRoute() {
  const tagId = Number(route.query.tagId)
  if (Number.isSafeInteger(tagId) && tagId > 0) {
    currentView.value = "category"
    categoryExpanded.value = true
    selectedTagId.value = tagId
    return
  }

  selectedTagId.value = null
  const view = route.query.view
  currentView.value = ["category", "inspiration", "mine"].includes(view)
    ? view
    : "all"
  categoryExpanded.value = currentView.value === "category"
}

function switchView(view) {
  if (currentView.value === view) return
  router.push({ name: "home", query: view === "all" ? {} : { view } })
}

function toggleCategory() {
  if (currentView.value === "category") {
    categoryExpanded.value = !categoryExpanded.value
    return
  }

  router.push({ name: "home", query: { view: "category" } })
}

function selectTag(tagId) {
  const nextTagId = selectedTagId.value === tagId ? null : tagId
  router.push({
    name: "home",
    query: nextTagId ? { tagId: String(nextTagId) } : { view: "category" },
  })
}

function handlePageChange(p) {
  page.value = p
  fetchArticles()
}

function refreshInspiration() {
  fetchArticles()
}
</script>

<style scoped>
.home-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 20px;
  display: flex;
  gap: 24px;
}

.sidebar {
  width: 160px;
  flex-shrink: 0;
}

.menu-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.menu-list li {
  padding: 10px 12px;
  cursor: pointer;
  border-radius: 6px;
  font-size: 15px;
  color: #555;
  transition: background 0.2s;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.menu-list li:hover {
  background: #f5f5f5;
}

.menu-list li.active {
  background: #ecf5ff;
  color: #409eff;
  font-weight: 500;
}

.menu-list .sub-tag {
  padding-left: 24px;
  font-size: 13px;
}

.menu-list .count {
  font-size: 12px;
  color: #999;
  background: #f0f0f0;
  padding: 0 6px;
  border-radius: 10px;
}

.main {
  flex: 1;
  min-width: 0;
}

.inspo-banner {
  padding: 20px 24px;
  background: linear-gradient(135deg, #f5f7fa 0%, #ecf5ff 100%);
  border-radius: 8px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.inspo-banner h2 {
  margin: 0 0 6px;
  font-size: 20px;
}

.inspo-banner p {
  margin: 0;
  color: #888;
  font-size: 14px;
}

.profile-card {
  padding: 40px 24px;
  background: #fff;
  border: 1px solid #eee;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;
}

.profile-avatar {
  background: #409eff;
  color: #fff;
  font-size: 28px;
}

.profile-info h3 {
  margin: 0 0 4px;
  font-size: 20px;
  color: #333;
}

.profile-info p {
  margin: 0;
  color: #999;
  font-size: 14px;
}

.article-card {
  padding: 20px 24px;
  background: #fff;
  border: 1px solid #eee;
  border-radius: 8px;
  margin-bottom: 16px;
  cursor: pointer;
  transition: box-shadow 0.2s;
}

.article-card:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.card-title {
  margin: 0 0 8px;
  font-size: 20px;
  color: #333;
}

.card-meta {
  color: #999;
  font-size: 13px;
  margin-bottom: 10px;
}

.card-meta .dot {
  margin: 0 6px;
}

.card-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.card-summary {
  color: #666;
  font-size: 14px;
  line-height: 1.8;
  margin: 0;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}

.loading {
  padding: 20px 0;
}

@media (max-width: 768px) {
  .home-page {
    padding: 16px 12px;
    flex-direction: column;
    gap: 16px;
  }

  .sidebar {
    width: 100%;
    overflow-x: auto;
    scrollbar-width: none;
  }

  .sidebar::-webkit-scrollbar {
    display: none;
  }

  .menu-list {
    display: flex;
    gap: 8px;
    min-width: max-content;
  }

  .menu-list li,
  .menu-list .sub-tag {
    padding: 8px 12px;
    white-space: nowrap;
  }

  .article-card {
    padding: 16px;
  }

  .card-title {
    font-size: 18px;
  }

  .pagination {
    justify-content: flex-start;
    overflow-x: auto;
    padding-bottom: 4px;
  }
}

@media (max-width: 480px) {
  .inspo-banner {
    padding: 16px;
    align-items: flex-start;
    flex-direction: column;
  }

  .inspo-banner .el-button {
    align-self: stretch;
  }
}
</style>
