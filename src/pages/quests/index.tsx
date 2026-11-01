import { Text, View } from '@tarojs/components'
import { useProgress } from '../../domain/storage'
import { dates, doubleDays, todayStatus } from '../../domain/progress'
import { Heading, LoadError, Meter, Picture, Shell } from '../../components/ui'
export default function Quests(){
  const {progress,error}=useProgress(),today=todayStatus(progress)
  const quests=[{title:'早间刷牙',detail:'04:00–11:59 完成完整刷牙',count:Number(today.morning),goal:1},{title:'晚间刷牙',detail:'12:00–次日 03:59 完成完整刷牙',count:Number(today.evening),goal:1},{title:'点亮 7 天',detail:'累计 7 个不同业务日完成刷牙',count:dates(progress).length,goal:7},{title:'早晚都认真',detail:'累计 3 天早晚两次都完成',count:doubleDays(progress),goal:3}]
  return <Shell active='quests' progress={progress}><LoadError text={error}/><Heading title='今天的护牙小目标' subtitle='早晚各一次，每一步都认真。'/><View className='feature-hero'><Picture name='quests'/><Text className='muted'>好习惯，从今天开始</Text></View><View className='quest-list'>{quests.map(q=><View className='quest-row' key={q.title}><Picture name='points'/><View className='quest-body'><View className='row-between'><Text className='card-title'>{q.title}</Text><Text className='green'>{q.count>=q.goal?'✓':`${q.count}/${q.goal}`}</Text></View><Text className='quest-detail'>{q.detail}</Text><Meter value={q.count/q.goal}/></View></View>)}</View></Shell>
}
