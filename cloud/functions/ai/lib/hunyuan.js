// 腾讯混元调用封装（通过微信云开发 AI 能力，无需 API Key）
const cloud = require('wx-server-sdk')

const MODEL = 'hunyuan-turbos-latest'
const MAX_RETRIES = 1

/**
 * 调用混元大模型（通过微信云开发 AI SDK）
 * @param {Array<{role: string, content: string}>} messages
 * @param {object} options
 * @returns {Promise<string>} AI 回复文本
 */
async function chatCompletion(messages, options = {}) {
  const ai = cloud.ai()
  const model = ai.createModel(options.model || MODEL)

  let lastError
  for (let i = 0; i <= MAX_RETRIES; i++) {
    try {
      const result = await model.generateText({
        model: options.model || MODEL,
        messages,
      })
      return result.text
    } catch (err) {
      lastError = err
    }
  }

  throw { code: 5000, message: `AI 调用失败: ${lastError.message}`, data: null }
}

module.exports = { chatCompletion }
