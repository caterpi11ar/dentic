import Taro from '@tarojs/taro'
export type AudioSettings={sound:boolean;voice:boolean}
const base=process.env.TARO_ENV==='h5'?'/assets/brush-audio/':'assets/brush-audio/'
let ding:Taro.InnerAudioContext|undefined
let voice:Taro.InnerAudioContext|undefined
function create(volume:number){const context=Taro.createInnerAudioContext();context.volume=volume;context.onError(()=>{});return context}
export function stopGuideAudio(){for(const ctx of [ding,voice]){try{ctx?.stop()}catch{}}}
export function destroyGuideAudio(){stopGuideAudio();for(const ctx of [ding,voice]){try{ctx?.destroy()}catch{}}ding=undefined;voice=undefined}
export function playGuideVoice(file:string,enabled:boolean){if(!enabled)return;try{voice??=create(1);voice.stop();voice.src=`${base}voice/${file}`;voice.play()}catch{}}
export function playGuideStart(settings:AudioSettings){stopGuideAudio();playGuideVoice('start.mp3',settings.voice)}
export function playGuideStep(index:number,settings:AudioSettings){
  if(index<0||index>14)return
  if(index>0&&settings.sound){try{ding??=create(.6);ding.stop();ding.src=`${base}step-ding.mp3`;ding.play()}catch{}}
  playGuideVoice(`step-${String(index+1).padStart(2,'0')}.mp3`,settings.voice)
}
export function playGuideComplete(settings:AudioSettings){stopGuideAudio();playGuideVoice('complete.mp3',settings.voice)}
