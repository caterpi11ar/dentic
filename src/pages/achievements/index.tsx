import { Text, View } from '@tarojs/components'
import { useProgress } from '../../domain/storage'
import { dates, doubleDays } from '../../domain/progress'
import { Heading, LoadError, Picture, Shell } from '../../components/ui'
export default function Achievements(){
  const {progress,error}=useProgress(),count=dates(progress).length
  const awards=[{title:'第一次认真刷牙',desc:'完整完成一次刷牙',done:count>=1},...[3,7,14,30,60,100,365].map(n=>({title:`点亮 ${n} 天`,desc:`累计 ${n} 个不同业务日完成刷牙`,done:count>=n})),{title:'早晚守护者',desc:'至少 1 天早晚两次都完成',done:doubleDays(progress)>=1}]
  return <Shell active='achievements' progress={progress}><LoadError text={error}/><Heading title='护牙成长徽章' subtitle='每一个认真刷牙的日子，都值得记住。'/><View className='award-grid'>{awards.map(a=><View key={a.title} className={`award-card ${a.done?'':'award-locked'}`}><Picture name='finish'/><Text className='card-title'>{a.title}</Text><Text className='muted'>{a.desc}</Text><Text className={`award-status ${a.done?'green':''}`}>{a.done?'已获得':'待解锁'}</Text></View>)}</View></Shell>
}
