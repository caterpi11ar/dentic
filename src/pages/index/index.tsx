import { Button, Text, View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { businessDate, dates, journeyDay, todayStatus } from '../../domain/progress'
import { useProgress } from '../../domain/storage'
import { Action, Heading, LoadError, Picture, Shell } from '../../components/ui'
export default function Home(){
  const {progress,error}=useProgress()
  const done=dates(progress), today=todayStatus(progress), current=journeyDay(progress)
  const start=()=>{if(!error)void Taro.navigateTo({url:'/pages/lesson/index'})}
  const first=Math.floor((current-1)/7)*7+1
  return <Shell active='index' progress={progress}><LoadError text={error}/><Heading title='今天也要好好刷牙' subtitle='每天早晚，让小习惯慢慢长大。'/>
    <View className='brush-today'><View className='row-between'><Text className='card-title'>今日刷牙 · {businessDate()}</Text><Text className='green'>{today.morning&&today.evening?'早晚都完成啦':'早晚各一次'}</Text></View><View className='brush-periods'><Text>早间 {today.morning?'✓ 已完成':'待完成'}</Text><Text>晚间 {today.evening?'✓ 已完成':'待完成'}</Text></View><Action disabled={!!error} onClick={start}>{today.morning&&today.evening?'再刷一次':'开始刷牙'}</Action></View>
    <View className='unit-banner unit-green'><View><Text className='unit-title'>我的刷牙旅程</Text><Text className='unit-desc'>累计完成 {done.length} 天 · 第 {first}—{first+6} 天</Text></View><Text className='unit-symbol'>✦</Text></View>
    <View className='lesson-path'>{Array.from({length:7},(_,i)=>first+i).map((day,i)=>{const complete=day<=done.length;const active=day===current;return <View key={day} className={`path-stop path-${i%3}`}>
      {active&&<View className='start-bubble'>{complete?'今天继续保持':'从今天开始'}</View>}
      <View className={active?'node-ring':'node-wrap'}><Button className={`lesson-node ${day<=current?'node-open':'node-locked'}`} hoverClass='nav-pressed' aria-label={`第 ${day} 天${active?'，开始刷牙':complete?'，已完成':'，待解锁'}`} onClick={()=>active?start():void Taro.showToast({title:complete?'这一天已完成，继续今天的刷牙吧':'在新的日期完成刷牙后解锁',icon:'none'})}><Text>{complete?'✓':day}</Text></Button></View>
      <Text className='lesson-label'>第 {day} 天</Text><Text className='lesson-caption'>{complete?'已完成刷牙':active?'早晚刷牙，从这一步开始':'等待你来点亮'}</Text>
    </View>})}</View><View className='journey-end'><Picture name='mascot'/><Text className='card-title'>每一天，都算数。</Text><Text className='muted'>同一天早晚刷牙算 1 天；漏一天不会清零。每天 04:00 开始新的一天。</Text></View>
  </Shell>
}
