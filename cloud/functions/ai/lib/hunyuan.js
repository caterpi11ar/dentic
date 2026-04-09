// 腾讯混元 API 调用封装（OpenAI 兼容接口）
const https = require('https')

const API_URL = 'https://api.hunyuan.cloud.tencent.com/v1/chat/completions'
const MODEL = 'hunyuan-standard'
const MAX_RETRIES = 1
const TIMEOUT_MS = 15000

function request(body, apiKey) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body)
    const url = new URL(API_URL)

    const req = https.request(
      {
        hostname: url.hostname,
        path: url.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'Content-Length': Buffer.byteLength(data),
        },
        timeout: TIMEOUT_MS,
      },
      (res) => {
        let chunks = ''
        res.on('data', (chunk) => { chunks += chunk })
        res.on('end', () => {
          try {
            const json = JSON.parse(chunks)
            if (json.error) {
              reject(new Error(json.error.message || '混元 API 错误'))
            } else {
              resolve(json)
            }
          } catch (e) {
            reject(new Error('混元 API 响应解析失败'))
          }
        })
      },
    )

    req.on('error', reject)
    req.on('timeout', () => { req.destroy(); reject(new Error('混元 API 超时')) })
    req.write(data)
    req.end()
  })
}

/**
 * 调用混元大模型
 * @param {Array<{role: string, content: string}>} messages
 * @param {object} options
 * @returns {Promise<string>} AI 回复文本
 */
async function chatCompletion(messages, options = {}) {
  const apiKey = process.env.HUNYUAN_API_KEY
  if (!apiKey) {
    throw { code: 5000, message: 'AI 服务未配置', data: null }
  }

  const body = {
    model: options.model || MODEL,
    messages,
    max_tokens: options.maxTokens || 300,
    temperature: options.temperature || 0.7,
  }

  let lastError
  for (let i = 0; i <= MAX_RETRIES; i++) {
    try {
      const result = await request(body, apiKey)
      return result.choices[0].message.content
    } catch (err) {
      lastError = err
    }
  }

  throw { code: 5000, message: `AI 调用失败: ${lastError.message}`, data: null }
}

module.exports = { chatCompletion }
