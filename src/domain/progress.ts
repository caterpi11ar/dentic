export const STORAGE_KEY = 'brushing_records'
export const SETTINGS_KEY = 'dentic_brush_settings_v1'
export type RecordItem = { date: string; session: 'morning' | 'evening'; completed: boolean; duration: number; completedSteps: number; timestamp: number }
export type Progress = { records: RecordItem[]; sound: boolean; voice: boolean }
export const emptyProgress = (): Progress => ({ records: [], sound: true, voice: true })
export function dateKey(d = new Date()) { return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}` }
export function businessDate(now = new Date()) { const d = new Date(now); if (d.getHours()<4) d.setDate(d.getDate()-1); return dateKey(d) }
export function period(now = new Date()): RecordItem['session'] { return now.getHours()>=4 && now.getHours()<12 ? 'morning' : 'evening' }
export function decodeRecords(value: unknown): RecordItem[] {
  if (value === '' || value == null) return []
  if (!Array.isArray(value)) throw new Error('刷牙记录格式异常，原数据已保留。')
  const valid: RecordItem[] = []
  for (const item of value) {
    if (!item || typeof item !== 'object') continue
    const r = item as Partial<RecordItem>
    if (typeof r.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(r.date) || typeof r.timestamp !== 'number' || !Number.isFinite(r.timestamp) || !Number.isFinite(new Date(r.timestamp).getTime()) || typeof r.completed !== 'boolean' || typeof r.duration !== 'number' || !Number.isFinite(r.duration) || r.duration < 0 || typeof r.completedSteps !== 'number' || !Number.isInteger(r.completedSteps) || r.completedSteps < 0 || r.completedSteps > 15) continue
    if (r.session !== undefined && r.session !== 'morning' && r.session !== 'evening') continue
    let session = r.session ?? 'morning'
    if (session === 'evening' && period(new Date(r.timestamp)) === 'morning') session = 'morning'
    const record = { ...r, session } as RecordItem
    const index = valid.findIndex(v => v.date === record.date && v.session === session)
    if (index < 0) valid.push(record)
    else if (record.timestamp >= valid[index].timestamp) valid[index] = record
  }
  if (valid.length !== value.length && value.length && !valid.length) throw new Error('没有可读取的刷牙记录，原数据已保留。')
  return valid
}
export const completedRecords = (p: Progress) => p.records.filter(r => r.completed)
export const dates = (p: Progress) => [...new Set(completedRecords(p).map(r=>r.date))].sort()
export function todayStatus(p: Progress, now = new Date()) { const rs=completedRecords(p).filter(r=>r.date===businessDate(now)); return { morning:rs.some(r=>r.session==='morning'), evening:rs.some(r=>r.session==='evening') } }
export function doubleDays(p: Progress) { return dates(p).filter(d=>{const rs=completedRecords(p).filter(r=>r.date===d);return rs.some(r=>r.session==='morning')&&rs.some(r=>r.session==='evening')}).length }
export function streak(p: Progress, now = new Date()) { const ds=dates(p); const cursor=new Date(`${businessDate(now)}T12:00:00`); if(!ds.includes(dateKey(cursor)))cursor.setDate(cursor.getDate()-1); let count=0;while(ds.includes(dateKey(cursor))){count++;cursor.setDate(cursor.getDate()-1)}return count }
export function journeyDay(p: Progress, now = new Date()) { const ds=dates(p); return Math.max(1,ds.length+(ds.includes(businessDate(now))?0:1)) }
export const STEPS = ['上牙外侧左','上牙外侧前','上牙外侧右','上牙内侧左','上牙内侧前','上牙内侧右','上牙咬合面','下牙外侧右','下牙外侧前','下牙外侧左','下牙内侧右','下牙内侧前','下牙内侧左','下牙咬合面','舌面']
export type BrushState = { phase: 'idle'|'countdown'|'brushing'|'paused'|'completed'; countdown: number; elapsed: number; resume: 'countdown'|'brushing' }
export const startBrush = (): BrushState => ({phase:'countdown',countdown:3,elapsed:0,resume:'countdown'})
export function tick(s: BrushState): BrushState {
  if(s.phase==='countdown')return s.countdown>1?{...s,countdown:s.countdown-1}:{...s,countdown:0,phase:'brushing',resume:'brushing'}
  if(s.phase!=='brushing')return s
  const elapsed=Math.min(150,s.elapsed+1)
  return {...s,elapsed,phase:elapsed===150?'completed':'brushing'}
}
export function pause(s: BrushState): BrushState { return s.phase==='brushing'||s.phase==='countdown'?{...s,resume:s.phase,phase:'paused'}:s }
export function resume(s: BrushState): BrushState { return s.phase==='paused'?{...s,phase:s.resume}:s }
export function completeBrush(p: Progress,s:BrushState,now=new Date()):Progress {
  if(s.phase!=='completed'||s.elapsed!==150)throw new Error('完整完成 15 步后才能记录。')
  const r:RecordItem={date:businessDate(now),session:period(now),completed:true,duration:150,completedSteps:15,timestamp:now.getTime()}
  return {...p,records:[...p.records.filter(old=>old.date!==r.date||old.session!==r.session),r]}
}
