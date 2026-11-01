import { BrushingPet } from '../../components/pets'
import { useEffect, useRef, useState } from 'react'
import { Button, Text, View } from '@tarojs/components'
import Taro, { useDidHide, useLoad, useUnload } from '@tarojs/taro'
import { BrushState, completeBrush, dates, emptyProgress, pause, Progress, resume, startBrush, streak, tick, todayStatus } from '../../domain/progress'
import { Action, Meter, Picture } from '../../components/ui'
import { readProgress, saveProgress } from '../../domain/storage'
import { ToothScene } from '../../components/original-guide'
import { GUIDE_STEPS } from '../../components/original-guide/steps'
import { destroyGuideAudio, playGuideComplete, playGuideStart, playGuideStep, playGuideVoice, stopGuideAudio } from '../../components/original-guide/audio'
import '../../components/original-guide/style.css'

export default function Brushing(){
  const [state,setState]=useState<BrushState>({...startBrush(),phase:'idle'})
  const ref=useRef(state)
  const [progress,setProgress]=useState<Progress>(emptyProgress)
  const [error,setError]=useState('')
  const [saved,setSaved]=useState(false)
  const savedRef=useRef(false)
  const completedAt=useRef<Date>()
  const timer=useRef<ReturnType<typeof setInterval>>()
  function update(s:BrushState){ref.current=s;setState(s)}
  function clear(){if(timer.current)clearInterval(timer.current);timer.current=undefined}
  function screen(on:boolean){try{void Taro.setKeepScreenOn({keepScreenOn:on}).catch(()=>{})}catch{}}
  function suspend(){clear();update(pause(ref.current));stopGuideAudio();screen(false)}
  useDidHide(suspend)
  useUnload(()=>{clear();destroyGuideAudio();screen(false)})
  useEffect(()=>()=>{clear();destroyGuideAudio();screen(false)},[])
  useLoad(()=>{try{const loaded=readProgress();setProgress(loaded);playGuideStart(loaded);update(startBrush())}catch{setError('无法读取刷牙记录，请返回“我的”重试。')}})
  function persist(){
    if(savedRef.current||!completedAt.current)return
    try{const next=completeBrush(readProgress(),ref.current,completedAt.current);saveProgress(next);savedRef.current=true;setSaved(true);setProgress(next);setError('');playGuideComplete(next)}catch{setError('刷牙已完成，但保存失败。请重试保存，不要退出页面。')}
  }
  useEffect(()=>{
    clear()
    if(state.phase!=='countdown'&&state.phase!=='brushing'){screen(false);return}
    screen(true)
    // Entering or resuming a region replays that region's original instruction.
    if(state.phase==='brushing')playGuideStep(Math.min(14,Math.floor(ref.current.elapsed/10)),progress)
    timer.current=setInterval(()=>{
      const previous=ref.current,next=tick(previous);update(next)
      if(next.phase==='completed'){clear();completedAt.current=new Date();persist();screen(false)}
      else if(previous.phase==='brushing'&&Math.floor(next.elapsed/10)!==Math.floor(previous.elapsed/10)){
        playGuideStep(Math.floor(next.elapsed/10),progress)
        try{void Taro.vibrateShort({type:'light'}).catch(()=>{})}catch{}
      }
    },1000)
    return clear
  },[state.phase])
  function toggle(){if(ref.current.phase==='paused'){if(ref.current.resume==='countdown')playGuideVoice('start.mp3',progress.voice);update(resume(ref.current))}else suspend()}
  function home(){clear();destroyGuideAudio();screen(false);void Taro.reLaunch({url:'/pages/index/index'})}
  async function exit(){
    if(state.phase==='idle'||saved){home();return}
    suspend()
    const result=await Taro.showModal({title:'离开刷牙？',content:state.phase==='completed'?'记录尚未保存，离开会丢失本次完成。':'未完成的刷牙不会记入打卡。',confirmText:'离开',cancelText:'继续刷牙'})
    if(result.confirm)home()
  }
  const preparing=state.phase==='countdown'||(state.phase==='paused'&&state.resume==='countdown')
  const index=Math.min(14,Math.floor(state.elapsed/10))
  const status=todayStatus(progress,completedAt.current)
  const paused=state.phase==='paused'
  if(state.phase==='completed')return <View className='lesson-page completion'><Picture name='finish' className='finish-art'/><Text className='completion-title'>刷牙完成！</Text><Text className='muted'>认真完成每一步，给自己一个小小的掌声。</Text><View className='result-grid'><View className='result-card result-green'><Text>刷牙用时</Text><View><Text>150 秒</Text></View></View><View className='result-card result-yellow'><Text>完成区域</Text><View><Text>15 / 15</Text></View></View></View><Text className='card-title'>{saved?`累计 ${dates(progress).length} 天 · 连续 ${streak(progress)} 天`:'等待保存记录'}</Text><Text className='muted'>{saved?(status.morning&&status.evening?'今天早晚都完成啦！':status.morning?'早间完成，晚上记得再来。':'晚间完成，明天见！'):'仅成功保存后才会计入刷牙天数。'}</Text>{saved&&[3,7,14,30,60,100,365].includes(dates(progress).length)&&<Text className='green'>累计 {dates(progress).length} 天的小里程碑，继续保持！</Text>}{error&&<Text className='error-box'>{error}</Text>}<Action onClick={saved?home:persist}>{saved?'返回刷牙旅程':'重试保存'}</Action></View>

  if(state.phase==='idle')return <View className='lesson-page'><Text className={error?'error-box':'muted'}>{error||'正在载入刷牙引导…'}</Text>{error&&<Action onClick={home}>返回首页</Action>}</View>
  return <View className='lesson-page brushing-integrated'>
    <View className='exercise-top'><Button className='close-button' aria-label='退出刷牙' onClick={exit}>×</Button><Meter value={state.elapsed/150}/><Text className='muted'>{state.elapsed}/150 秒</Text></View>
    <View className='brush-stage'>
      <View className='row-between'><View><Text className='eyebrow'>{preparing?'准备开始':`第 ${index+1} / 15 个区域`}</Text><Text className='page-title'>{preparing?'准备好了吗？':GUIDE_STEPS[index].name}</Text></View><View className='brush-time-badge'><Text className='brush-time-number'>{preparing?state.countdown:10-state.elapsed%10}</Text><Text className='brush-time-label'>{paused?'已暂停':'秒'}</Text></View></View>
      <View className={`brush-teeth-card ${paused?'brush-teeth-paused':''}`}><ToothScene index={index} active={!preparing}/></View>
      <View className='brush-tip-card'><View className='brush-tip-copy'><Text className='card-title'>{preparing?'跟着提示，慢慢来':GUIDE_STEPS[index].prompt}</Text><Text className='muted'>{preparing?'倒计时后开始刷牙':index===14?'最后一个区域，加油！':`下一步：${GUIDE_STEPS[index+1].name}`}</Text></View></View>
      <View className='brush-region-progress'>{GUIDE_STEPS.map((step,i)=><View key={step.name} className={`brush-region-dot ${!preparing&&i<=index?'brush-region-done':''}`}/>)}</View>
      <View className='brush-pet-area'><BrushingPet paused={paused}/></View>
    </View>
    <View className='exercise-footer'><View className='feedback-content'><Text className='muted'>{paused?'休息一下，准备好再继续':'认真刷好每一个区域'}</Text><Action onClick={toggle}>{paused?'继续刷牙':'暂停一下'}</Action></View></View>
  </View>
}
