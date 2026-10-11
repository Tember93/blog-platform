<template>
  <div class="drafts-page">
    <h2>草稿箱</h2>
    <div v-if="loading" class="loading">
      <el-skeleton :rows="3" animated />
    </div>
    <template v-else>
      <div
        v-for="draft in drafts"
        :key="draft.id"
        class="draft-card"
        @click="$router.push(`/editor/${draft.id}`)"
      >
        <h3 class="draft-title">{{ draft.title }}</h3>
        <div class="draft-meta">
          <span>{{ formatDateTime(draft.updatedAt) }}</span>
        </div>
        <div class="draft-tags">
          <el-tag
            v-for="tag in draft.tags"
            :key="tag.id"
            size="small"
          >
            {{ tag.name }}
          </el-tag>
        </div>
        <p class="draft-summary">{{ stripMarkdown(draft.content, 120) }}</p>
      </div>
      <el-empty v-if="drafts.length === 0" description="暂无草稿" />
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue"
import { getDrafts } from "@/apis/article.js"
import { stripMarkdown, formatDateTime } from "@/utils/format.js"

const drafts = ref([])
const loading = ref(true)

onMounted(async () => {
  loading.value = true
  try {
    const res = await getDrafts()
    drafts.value = Array.isArray(res) ? res : []
  } catch {
    // ignore
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.drafts-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px 20px;
}

.drafts-page h2 {
  margin-bottom: 24px;
}

.draft-card {
  padding: 16px 20px;
  background: #fff;
  border: 1px solid #eee;
  border-radius: 8px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: box-shadow 0.2s;
}

.draft-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.draft-title {
  margin: 0 0 6px;
  font-size: 18px;
  color: #333;
}

.draft-meta {
  color: #999;
  font-size: 13px;
  margin-bottom: 8px;
}

.draft-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 10px;
}

.draft-summary {
  color: #999;
  font-size: 14px;
  line-height: 1.6;
  margin: 0;
}
</style>
