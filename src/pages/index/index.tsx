import { useShareAppMessage } from '@tarojs/taro'
import BrushPage from '../brush/index'
import { generateShareMessage } from '../../services/share'

export default function IndexPage() {
  useShareAppMessage(() => generateShareMessage())
  return <BrushPage />
}
