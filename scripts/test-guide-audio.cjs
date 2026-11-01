const fs=require('node:fs'),assert=require('node:assert/strict'),vm=require('node:vm'),ts=require('typescript'),crypto=require('node:crypto'),path=require('node:path')
const code=ts.transpileModule(fs.readFileSync('src/components/original-guide/audio.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText
const events=[],contexts=[]
const taro={createInnerAudioContext(){const c={src:'',volume:1,onError(){},stop(){events.push(['stop',this.src])},play(){events.push(['play',this.src])},destroy(){events.push(['destroy',this.src])}};contexts.push(c);return c}}
const exportsAudio={}
vm.runInNewContext(code,{exports:exportsAudio,process:{env:{TARO_ENV:'weapp'}},require(){return {default:taro}}})
const a=exportsAudio,enabled={sound:true,voice:true}
a.playGuideStart(enabled);a.playGuideStep(0,enabled);a.playGuideStep(1,enabled);a.stopGuideAudio();a.playGuideStep(1,enabled);a.playGuideComplete(enabled)
assert.deepEqual(events.filter(e=>e[0]==='play').map(e=>e[1]),['assets/brush-audio/voice/start.mp3','assets/brush-audio/voice/step-01.mp3','assets/brush-audio/step-ding.mp3','assets/brush-audio/voice/step-02.mp3','assets/brush-audio/step-ding.mp3','assets/brush-audio/voice/step-02.mp3','assets/brush-audio/voice/complete.mp3'])
events.length=0;a.playGuideStep(4,{sound:true,voice:false});assert.deepEqual(events.filter(e=>e[0]==='play').map(e=>e[1]),['assets/brush-audio/step-ding.mp3'])
events.length=0;a.playGuideStep(14,{sound:false,voice:true});assert.deepEqual(events.filter(e=>e[0]==='play').map(e=>e[1]),['assets/brush-audio/voice/step-15.mp3'])
events.length=0;a.playGuideStart({sound:false,voice:false});a.playGuideStep(1,{sound:false,voice:false});a.playGuideComplete({sound:false,voice:false});assert.equal(events.filter(e=>e[0]==='play').length,0)
a.destroyGuideAudio();assert.equal(events.filter(e=>e[0]==='destroy').length,2)
const manifest=JSON.parse(fs.readFileSync('docs/original-guide-audio.json','utf8'))
for(const [name,hash] of Object.entries(manifest.files)){const file=path.join('src/static/assets/brush-audio',name);assert.equal(crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'),hash)}
assert.equal(Object.keys(manifest.files).length,18)
console.log('PASS original start/15 regions/completion mapping; independent toggles; teardown; 18 original audio hashes')
