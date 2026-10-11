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
        <h2>灵感</h2>
        <p>随机发现一篇好文章。</p>
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

          <el-empty v-if="!loading && articles.length === 0"
            :description="currentView === 'inspiration' ? '暂无文章' : '暂无文章'" />
        </template>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue"
import { getList } from "@/apis/article.js"
import { getTags } from "@/apis/tag.js"
import { useAuthStore } from "@/stores/auth.js"
import { stripMarkdown, formatDateTime } from "@/utils/format.js"

const authStore = useAuthStore()

const currentView = ref("all")
const categoryExpanded = ref(false)
const tags = ref([])
const articles = ref([])
const pagination = ref({ page: 1, limit: 10, total: 0, totalPages: 0 })
const page = ref(1)
const selectedTagId = ref(null)
const loading = ref(true)
const hasFetched = ref(false)

onMounted(() => {
  fetchTags()
  fetchArticles()
})

async function fetchTags() {
  try {
    const res = await getTags()
    tags.value = Array.isArray(res) ? res : res.tags || []
  } catch {
    // ignore
  }
}

async function fetchArticles() {
  loading.value = true
  try {
    if (currentView.value === "inspiration") {
      const res = await getList({ page: 1, limit: 50 })
      const list = res.articles || []
      // 随机打乱
      for (let i = list.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
          ;[list[i], list[j]] = [list[j], list[i]]
      }
      articles.value = list
    } else {
      const params = { page: page.value, limit: 10 }
      if (selectedTagId.value) params.tagId = selectedTagId.value
      const res = await getList(params)
      articles.value = res.articles || []
      pagination.value = res.pagination || { page: 1, limit: 10, total: 0, totalPages: 0 }
    }
  } catch {
    // ignore
  } finally {
    loading.value = false
    hasFetched.value = true
  }
}

function switchView(view) {
  if (currentView.value === view) return
  currentView.value = view
  selectedTagId.value = null
  if (view !== "category") {
    categoryExpanded.value = false
  }
  page.value = 1
  fetchArticles()
}

function toggleCategory() {
  categoryExpanded.value = !categoryExpanded.value
  if (categoryExpanded.value && currentView.value !== "category") {
    currentView.value = "category"
    selectedTagId.value = null
    page.value = 1
    fetchArticles()
  }
}

function selectTag(tagId) {
  currentView.value = "category"
  categoryExpanded.value = true
  selectedTagId.value = selectedTagId.value === tagId ? null : tagId
  page.value = 1
  fetchArticles()
}

function handlePageChange(p) {
  page.value = p
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
</style>
