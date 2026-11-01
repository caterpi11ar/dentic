import { useEffect, useState } from 'react'
import { Button, Image, Text, View } from '@tarojs/components'
import Taro, { useDidHide, useDidShow } from '@tarojs/taro'
import { dates, Progress, todayStatus } from '../../domain/progress'
import { ActionName, Direction, PETS, PET_KEY, Pet, spriteImage } from './catalog'
import './style.css'

function Sprite({pet,action='Idle',direction='South',active=false,small=false}:{pet:Pet;action?:ActionName;direction?:Direction;active?:boolean;small?:boolean}) {
 const clip=pet.clips[`${action}_${direction}`];const [index,setIndex]=useState(0)
 useEffect(()=>{setIndex(0);if(!active)return;let disposed=false,timer:ReturnType<typeof setTimeout>,i=0;function schedule(){timer=setTimeout(()=>{if(disposed)return;i=(i+1)%clip.length;setIndex(i);schedule()},clip[i].ms)}schedule();return()=>{disposed=true;clearTimeout(timer)}},[pet.id,action,direction,active])
 const frame=clip[index%clip.length]
 return <View className={`sprite-window ${small?'sprite-small':''}`}><Image className='sprite-sheet' src={spriteImage(pet.id)} mode='scaleToFill' style={{width:'1200%',height:'1600%',left:`-${frame.x*100}%`,top:`-${frame.y*100}%`}}/></View>
}
function useAutoPet(paused=false) {
 const [id,setId]=useState('bunny-white'),[visible,setVisible]=useState(true),[action,setAction]=useState<ActionName>('Walk'),[direction,setDirection]=useState<Direction>('South'),[interaction,setInteraction]=useState(0),[error,setError]=useState('')
 const active=visible&&!paused
 const pet=PETS.find(p=>p.id===id)||PETS[0]
 function load(){setVisible(true);try{const saved=Taro.getStorageSync(PET_KEY);setId(PETS.some(p=>p.id===saved)?saved:'bunny-white');setError('')}catch{setError('宠物选择读取失败，请重试。')}}
 useEffect(load,[])
 useDidShow(load);useDidHide(()=>setVisible(false))
 useEffect(()=>{
  if(!active)return
  let timer:ReturnType<typeof setTimeout>,disposed=false
  function wander(){if(disposed)return;const next=Math.random()<.5?'Walk':'Sleep';setAction(next);setDirection(next==='Sleep'?'South':Math.random()<.5?'East':'West');timer=setTimeout(wander,8000+Math.floor(Math.random()*6000))}
  if(interaction){setAction('Happy');setDirection('South');timer=setTimeout(wander,2400)}else wander()
  return()=>{disposed=true;clearTimeout(timer)}
 },[active,id,interaction])
 function choose(next:string){try{Taro.setStorageSync(PET_KEY,next);setId(next);setInteraction(0);setError('');return true}catch{setError('宠物选择保存失败，请重试。');return false}}
 return {pet,active,action,direction,error,load,choose,touch:()=>{if(active)setInteraction(n=>n+1)}}
}
export function BrushingPet({paused=false}:{paused?:boolean}) {
 const {pet,active,action,direction,touch}=useAutoPet(paused)
 return <Button className='brush-pet' hoverClass='none' aria-label={`${pet.name}陪你刷牙，点击逗一逗`} onClick={touch}><Sprite pet={pet} action={action} direction={direction} active={active} small/></Button>
}
export function PetCompanion({progress}:{progress:Progress}) {
 const {pet,active,action,direction,error,load,choose,touch}=useAutoPet()
 const [open,setOpen]=useState(false)
 const today=todayStatus(progress),completed=Number(today.morning)+Number(today.evening)
 return <View className='pet-card'>
  <View className='row-between'><Text className='card-title'>我的陪伴宠物</Text><Button className='pet-change' hoverClass='nav-pressed' onClick={()=>setOpen(!open)}>{open?'收起图鉴':'更换宠物'}</Button></View>
  <View className='pet-stage'><Button className='pet-touch' hoverClass='none' aria-label={`摸摸${pet.name}`} onClick={touch}><Sprite pet={pet} action={action} direction={direction} active={active}/></Button><Text className='pet-name'>{pet.name}</Text></View>
  <View className='pet-progress'><Text>今日刷牙 {completed} / 2</Text><Text>累计刷牙 {dates(progress).length} 天</Text></View>
  {error&&<View className='error-box'>{error}<Button onClick={load}>重新读取</Button></View>}
  {open&&<View className='pet-collection'><Text className='card-title'>护牙伙伴 · 10 只动态宠物</Text><View className='pet-grid'>{PETS.map(p=><Button key={p.id} className={`pet-option ${pet.id===p.id?'pet-selected':''}`} hoverClass='nav-pressed' onClick={()=>{if(choose(p.id))setOpen(false)}}><Sprite pet={p} small/><Text>{p.name}</Text><Text className='pet-picked'>{pet.id===p.id?'陪伴中':'选择'}</Text></Button>)}</View></View>}
 </View>
}
