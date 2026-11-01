import { Text, View } from '@tarojs/components'
import { GUIDE_STEPS } from './steps'

// Geometry and zone mapping from caterpi11ar/dentic ToothScene (370f649).
const ZONES = [[0,1,2,3],[4,5,6,7,8,9],[10,11,12,13],[0,1,2,3],[4,5,6,7,8,9],[10,11,12,13],Array.from({length:14},(_,i)=>i),[14,15,16,17],[18,19,20,21,22,23],[24,25,26,27],[14,15,16,17],[18,19,20,21,22,23],[24,25,26,27],Array.from({length:14},(_,i)=>14+i),Array.from({length:14},(_,i)=>14+i)]
const TEETH=Array.from({length:28},(_,index)=>{
  const upper=index<14,i=index%14,angle=upper?Math.PI-i/13*Math.PI:i/13*Math.PI
  const size=i>=4&&i<=9?30:34
  return {index,size,x:140+Math.cos(angle)*(upper?112:107),y:(upper?100:192)+(upper?-1:1)*Math.sin(angle)*(upper?82:78),z:Math.round(7-Math.abs(i-6.5))}
})
export function ToothScene({index,active=true}:{index:number;active?:boolean}){
  const highlights=new Set(active?ZONES[index]:[])
  return <View className='old-scene' aria-label={active?`当前刷牙区域：${GUIDE_STEPS[index].name}`:'牙齿区域示意图'}>{TEETH.map(t=><View key={t.index} className={`old-tooth ${highlights.has(t.index)?'old-tooth-lit':''}`} style={{left:`${(t.x-t.size/2)/280*100}%`,top:`${(t.y-t.size/2)/300*100}%`,width:`${t.size/280*100}%`,height:`${t.size/300*100}%`,zIndex:t.z}}/>)}</View>
}
