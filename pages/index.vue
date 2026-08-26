<script setup lang="ts">
import { Download, FileKey2, LockKeyhole, ShieldCheck, Upload } from 'lucide-vue-next'

const forge = ref<any>(null)
const loading = ref(false)
const message = ref('')
const error = ref('')
const privateKeyFile = ref<File | null>(null)
const certificateFile = ref<File | null>(null)
const p12Password = ref('')
const commonName = ref('')
const email = ref('')

useHead({
  title: 'iOS 证书生成工具：在线生成 CSR 和 P12',
  meta: [
    { name: 'description', content: '无需 Mac，在浏览器本地生成 Apple iOS 证书申请 CSR，并使用 .cer 和私钥导出 .p12。文件和密码不会上传服务器。' },
    { name: 'keywords', content: 'iOS证书生成,p12生成,CSR生成,Apple Distribution,没有Mac' },
  ],
})

onMounted(async () => {
  forge.value = await import('node-forge')
})

function download(name: string, data: BlobPart, type = 'application/octet-stream') {
  const url = URL.createObjectURL(new Blob([data], { type }))
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = name
  anchor.click()
  URL.revokeObjectURL(url)
}

function clearState() {
  message.value = ''
  error.value = ''
}

async function generateCsr() {
  clearState()
  if (!forge.value) return
  loading.value = true
  try {
    const keys = await new Promise<any>((resolve, reject) => {
      forge.value.pki.rsa.generateKeyPair({ bits: 2048, workers: -1 }, (err: Error, pair: any) => err ? reject(err) : resolve(pair))
    })
    const csr = forge.value.pki.createCertificationRequest()
    csr.publicKey = keys.publicKey
    csr.setSubject([
      { name: 'commonName', value: commonName.value.trim() || 'iOS Distribution' },
      ...(email.value.trim() ? [{ name: 'emailAddress', value: email.value.trim() }] : []),
    ])
    csr.sign(keys.privateKey, forge.value.md.sha256.create())
    download('CertificateSigningRequest.certSigningRequest', forge.value.pki.certificationRequestToPem(csr), 'application/pkcs10')
    download('ios-distribution-private.key', forge.value.pki.privateKeyToPem(keys.privateKey), 'application/x-pem-file')
    message.value = 'CSR 和私钥已下载。请妥善保存私钥，Apple 不会提供私钥备份。'
  } catch {
    error.value = '生成失败，请重试或更换浏览器。'
  } finally {
    loading.value = false
  }
}

async function generateP12() {
  clearState()
  if (!forge.value || !privateKeyFile.value || !certificateFile.value || !p12Password.value) {
    error.value = '请选择私钥和 Apple .cer 文件，并设置 P12 密码。'
    return
  }
  loading.value = true
  try {
    const [keyPem, certBuffer] = await Promise.all([privateKeyFile.value.text(), certificateFile.value.arrayBuffer()])
    const privateKey = forge.value.pki.privateKeyFromPem(keyPem)
    const der = forge.value.util.createBuffer(certBuffer as ArrayBuffer).getBytes()
    const certificate = forge.value.pki.certificateFromAsn1(forge.value.asn1.fromDer(der))
    const p12Asn1 = forge.value.pkcs12.toPkcs12Asn1(privateKey, [certificate], p12Password.value, { algorithm: '3des' })
    const bytes = forge.value.asn1.toDer(p12Asn1).getBytes()
    download('ios-distribution.p12', bytes, 'application/x-pkcs12')
    message.value = 'P12 已生成并下载。导入 HBuilderX 时填写相同的 P12 密码。'
  } catch {
    error.value = '生成失败，请确认私钥与 .cer 属于同一张证书。'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="page-shell">
    <header class="site-header">
      <div class="brand"><span class="brand-mark"><ShieldCheck :size="20" /></span><span>iOS Cert Generator</span></div>
      <span class="privacy-note"><LockKeyhole :size="15" /> 全程浏览器本地处理</span>
    </header>

    <section class="hero">
      <p class="eyebrow">Apple 开发者工具</p>
      <h1>没有 Mac，也能生成 iOS 签名证书</h1>
      <p class="hero-copy">在浏览器中生成 CSR，并将 Apple 下载的 .cer 与私钥合成为 .p12。文件不会上传到服务器。</p>
    </section>

    <section class="workspace" aria-label="证书生成工具">
      <article class="tool-panel">
        <div class="panel-heading"><span class="step-number">01</span><div><h2>生成 CSR</h2><p>创建证书申请文件和配套私钥</p></div></div>
        <div class="field-grid"><label>名称（可选）<input v-model="commonName" placeholder="iOS Distribution" /></label><label>邮箱（可选）<input v-model="email" type="email" placeholder="name@example.com" /></label></div>
        <button class="primary-button" :disabled="loading || !forge" @click="generateCsr"><Download :size="18" />{{ loading ? '处理中…' : '生成并下载 CSR' }}</button>
        <p class="hint">下载后将 CSR 上传到 Apple Developer 的 Certificates 页面。私钥只保存在你的设备上。</p>
      </article>

      <article class="tool-panel">
        <div class="panel-heading"><span class="step-number">02</span><div><h2>合成 P12</h2><p>使用 Apple .cer 和之前保存的私钥</p></div></div>
        <label class="file-field"><span><FileKey2 :size="18" /> 私钥文件（.key / .pem）</span><input type="file" accept=".key,.pem,.txt" @change="privateKeyFile = ($event.target as HTMLInputElement).files?.[0] || null" /><em>{{ privateKeyFile?.name || '选择文件' }}</em></label>
        <label class="file-field"><span><Upload :size="18" /> Apple 证书（.cer）</span><input type="file" accept=".cer,.der" @change="certificateFile = ($event.target as HTMLInputElement).files?.[0] || null" /><em>{{ certificateFile?.name || '选择文件' }}</em></label>
        <label>设置 P12 密码<input v-model="p12Password" type="password" autocomplete="new-password" placeholder="至少 6 位字符" /></label>
        <button class="primary-button" :disabled="loading" @click="generateP12"><Download :size="18" />生成并下载 P12</button>
      </article>
    </section>

    <p v-if="message" class="status success">{{ message }}</p><p v-if="error" class="status failure">{{ error }}</p>
    <section class="seo-section"><h2>iOS P12 证书生成说明</h2><p>Apple Distribution 证书由 Apple Developer 签发。本工具仅在本地生成 CSR，并将证书与对应私钥导出为 P12，适用于 HBuilderX 云打包和其他 iOS 发布流程。</p><div class="security-row"><LockKeyhole :size="18" /><span>私钥、证书和密码不会上传、保存或发送到任何服务器。</span></div></section>
    <footer>iOS Cert Generator · 本地加密处理工具</footer>
  </main>
</template>
