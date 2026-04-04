// 用户云函数入口
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

const handlers = {
  getProfile: require('./getProfile'),
  updateProfile: require('./updateProfile'),
}

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  const { action, ...params } = event

  if (!handlers[action]) {
    return { code: 4001, message: '未知操作', data: null }
  }

  try {
    const data = await handlers[action]({ ...params, openid: OPENID }, db)
    return { code: 0, message: 'ok', data }
  } catch (err) {
    if (err.code) return err
    console.error(err)
    return { code: 5000, message: '系统错误', data: null }
  }
}
