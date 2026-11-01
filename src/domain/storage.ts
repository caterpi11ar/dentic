import Taro, { useDidShow } from '@tarojs/taro'
import { useState } from 'react'
import { decodeRecords, emptyProgress, Progress, SETTINGS_KEY, STORAGE_KEY } from './progress'
export function readProgress(): Progress {
  const settings = Taro.getStorageSync(SETTINGS_KEY)
  const legacy = Taro.getStorageSync('user_settings')
  return { records: decodeRecords(Taro.getStorageSync(STORAGE_KEY)), sound: typeof settings?.sound === 'boolean' ? settings.sound : legacy?.soundEnabled !== false, voice: typeof settings?.voice === 'boolean' ? settings.voice : legacy?.voiceEnabled !== false }
}
export function saveProgress(p:Progress) { Taro.setStorageSync(STORAGE_KEY,p.records) }
export function saveSound(sound:boolean) { Taro.setStorageSync(SETTINGS_KEY,{...Taro.getStorageSync(SETTINGS_KEY),sound}) }
export function useProgress(){
  const [progress,setProgress]=useState(emptyProgress)
  const [error,setError]=useState('')
  function refresh(){try{setProgress(readProgress());setError('')}catch(e){setError(e instanceof Error?e.message:'无法读取本机刷牙记录。')}}
  useDidShow(refresh)
  return {progress,error,refresh}
}

export function saveVoice(voice:boolean) { Taro.setStorageSync(SETTINGS_KEY,{...Taro.getStorageSync(SETTINGS_KEY),voice}) }
