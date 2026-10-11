<template>
  <div class="editor-page">
    <h2 class="page-title">{{ isEdit ? "编辑文章" : "写文章" }}</h2>
    <el-form ref="formRef" :model="form" :rules="rules" label-position="top" class="editor-form">
      <el-form-item label="标题" prop="title">
        <el-input v-model="form.title" placeholder="请输入文章标题" maxlength="200" />
      </el-form-item>
      <el-form-item label="内容" prop="content">
        <el-input v-model="form.content" type="textarea" :rows="18" placeholder="支持 Markdown 语法" />
      </el-form-item>
      <el-form-item label="标签">
        <el-select v-model="form.tagIds" multiple placeholder="选择标签（可多选）" style="width: 100%">
          <el-option v-for="tag in tags" :key="tag.id" :label="tag.name" :value="tag.id" />
        </el-select>
      </el-form-item>
      <el-form-item v-if="!isPublished" label="状态">
        <el-radio-group v-model="form.status">
          <el-radio value="PUBLISHED">发布</el-radio>
          <el-radio value="DRAFT">草稿</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">
          {{ form.status === "DRAFT" ? "保存草稿" : isPublished ? "更新文章" : "发布文章" }}
        </el-button>
        <el-button @click="$router.back()">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted, computed } from "vue"
import { useRoute, useRouter } from "vue-router"
import { ElMessage } from "element-plus"
import { create, update, getDetail } from "@/apis/article.js"
import { getTags } from "@/apis/tag.js"

const route = useRoute()
const router = useRouter()
const formRef = ref(null)
const submitting = ref(false)
const tags = ref([])
const loading = ref(false)

const isEdit = computed(() => !!route.params.id)

// 已发布文章不允许改回草稿
const isPublished = ref(false)

const form = reactive({
  title: "",
  content: "",
  tagIds: [],
  status: "PUBLISHED",
})

const rules = {
  title: [{ required: true, message: "请输入文章标题", trigger: "blur" }],
  content: [{ required: true, message: "请输入文章内容", trigger: "blur" }],
}

onMounted(async () => {
  await fetchTags()
  if (isEdit.value) {
    await fetchArticle()
  }
})

async function fetchTags() {
  try {
    const res = await getTags()
    tags.value = Array.isArray(res) ? res : res.tags || []
  } catch {
    // ignore
  }
}

async function fetchArticle() {
  loading.value = true
  try {
    const article = await getDetail(route.params.id)
    form.title = article.title
    form.content = article.content
    form.tagIds = article.tags.map((t) => t.id)
    form.status = article.status
    isPublished.value = article.status === "PUBLISHED"
  } catch {
    ElMessage.error("文章加载失败")
    router.push("/")
  } finally {
    loading.value = false
  }
}

async function handleSubmit() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  submitting.value = true
  try {
    let article
    if (isEdit.value) {
      article = await update(route.params.id, {
        title: form.title,
        content: form.content,
        tagIds: form.tagIds,
        status: form.status,
      })
    } else {
      article = await create({
        title: form.title,
        content: form.content,
        tagIds: form.tagIds,
        status: form.status,
      })
    }
    const msg = form.status === "DRAFT"
      ? (isEdit.value ? "草稿已更新" : "草稿已保存")
      : isPublished.value ? "文章已更新" : "文章已发布"
    ElMessage.success(msg)
    if (form.status === "PUBLISHED") {
      router.push(`/article/${article.id}`)
    } else {
      router.push("/")
    }
  } catch {
    // 错误信息已在拦截器中展示
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.editor-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px 20px;
}

.page-title {
  margin-bottom: 24px;
}
</style>
