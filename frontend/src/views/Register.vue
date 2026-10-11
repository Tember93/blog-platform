<template>
  <div class="register-page">
    <el-card class="form-card">
      <h2>注册</h2>
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top" @submit.prevent="handleSubmit">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="2-20位字母、数字、下划线或中文" maxlength="20" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱" maxlength="100" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="form.password" type="password" placeholder="6-20位，不能含空格" show-password maxlength="20" />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="form.confirmPassword" type="password" placeholder="请再次输入密码" show-password maxlength="20" />
        </el-form-item>
        <el-form-item prop="agreement">
          <el-checkbox v-model="form.agreement">
            我已阅读并同意用户协议
          </el-checkbox>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="submit-btn" :loading="loading" @click="handleSubmit">
            注册
          </el-button>
        </el-form-item>
      </el-form>
      <p class="switch-link">
        已有账号？<router-link to="/login">去登录</router-link>
      </p>
    </el-card>
  </div>
</template>

<script setup>
import { reactive, ref } from "vue"
import { useRouter } from "vue-router"
import { ElMessage } from "element-plus"
import { useAuthStore } from "@/stores/auth.js"

const router = useRouter()
const authStore = useAuthStore()
const formRef = ref(null)
const loading = ref(false)

const form = reactive({
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
  agreement: false,
})

const validateConfirmPassword = (_rule, value) => {
  if (!value) return Promise.reject(new Error("请再次输入密码"))
  if (value !== form.password) return Promise.reject(new Error("两次输入的密码不一致"))
  return Promise.resolve()
}

const validateAgreement = (_rule, value) => {
  if (!value) return Promise.reject(new Error("请阅读并同意用户协议"))
  return Promise.resolve()
}

const rules = {
  username: [
    { required: true, message: "请输入用户名", trigger: "blur" },
    { min: 2, message: "用户名至少2个字符", trigger: "blur" },
    { max: 20, message: "用户名不能超过20个字符", trigger: "blur" },
    { pattern: /^[a-zA-Z0-9_一-龥]+$/, message: "用户名只能包含字母、数字、下划线或中文", trigger: "blur" },
  ],
  email: [
    { required: true, message: "请输入邮箱", trigger: "blur" },
    { type: "email", message: "邮箱格式不正确", trigger: "blur" },
  ],
  password: [
    { required: true, message: "请输入密码", trigger: "blur" },
    { min: 6, message: "密码长度不能少于6位", trigger: "blur" },
    { max: 20, message: "密码长度不能超过20位", trigger: "blur" },
    { pattern: /^[^\s]+$/, message: "密码不能包含空格", trigger: "blur" },
  ],
  confirmPassword: [{ validator: validateConfirmPassword, trigger: "blur" }],
  agreement: [{ validator: validateAgreement, trigger: "change" }],
}

async function handleSubmit() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  loading.value = true
  try {
    await authStore.register(form.username, form.email, form.password)
    ElMessage.success("注册成功")
    router.push("/")
  } catch {
    // 错误信息已在拦截器中展示
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-page {
  display: flex;
  justify-content: center;
  padding-top: 60px;
}

.form-card {
  width: 460px;
}

.form-card h2 {
  text-align: center;
  margin-bottom: 24px;
}

.submit-btn {
  width: 100%;
}

.switch-link {
  text-align: center;
  color: #999;
  font-size: 14px;
}
</style>
