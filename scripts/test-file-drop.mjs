// Exercise the real React drag/drop handlers against an in-memory API; no remote writes.
import {JSDOM} from 'jsdom';
import ts from 'typescript';
import {readFile,mkdir,writeFile,rm} from 'node:fs/promises';
import {createRoot} from 'react-dom/client';
import {act} from 'react';
import assert from 'node:assert/strict';
const temp=new URL('../.drop-test/',import.meta.url);await mkdir(temp,{recursive:true});
for(const name of ['App','catalog']){let source=await readFile(new URL('../src/'+name+(name==='App'?'.tsx':'.ts'),import.meta.url),'utf8');source=source.replace('"./catalog"','"./catalog.mjs"').replaceAll('import.meta.env.BASE_URL','"/lingyao-workspace/"');await writeFile(new URL(name+'.mjs',temp),ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext,jsx:ts.JsxEmit.ReactJSX}}).outputText)}
const dom=new JSDOM('<div id="root"></div>',{url:'https://calfnai.github.io/lingyao-workspace/'});
globalThis.window=dom.window;globalThis.document=dom.window.document;globalThis.HTMLElement=dom.window.HTMLElement;globalThis.IS_REACT_ACT_ENVIRONMENT=true;
dom.window.HTMLElement.prototype.scrollIntoView=()=>{};
const requests=[];globalThis.fetch=async(url,opts)=>{requests.push({url,opts});return {ok:true,json:async()=>url.endsWith('/api/upload')?{id:'test-file',name:'drop.md',mime:'text/plain',size:15}:{messages:[],files:[],hasMore:false}}};
let root;
try{
 const {default:App}=await import(new URL('App.mjs',temp));root=createRoot(document.getElementById('root'));
 await act(async()=>root.render((await import('react')).createElement(App)));
 const button=t=>[...document.querySelectorAll('button')].find(b=>b.textContent.includes(t)||b.getAttribute('aria-label')===t);
 await act(async()=>button('更多功能').click());await act(async()=>button('进入 IT 测试区').click());
 const app=document.querySelector('.app');const file=new File(['# drop test'],'drop.md',{type:'text/markdown'});
 const drag=type=>{const event=new dom.window.Event(type,{bubbles:true,cancelable:true});Object.defineProperty(event,'dataTransfer',{value:{types:['Files'],files:[file],dropEffect:'copy'}});return event};
 await act(async()=>app.dispatchEvent(drag('dragenter')));assert(document.querySelector('.drop-overlay'));
 const drop=drag('drop');await act(async()=>app.dispatchEvent(drop));assert(drop.defaultPrevented);assert(!document.querySelector('.drop-overlay'));
 const upload=requests.find(r=>r.url.endsWith('/api/upload'));assert(upload);assert.equal(upload.opts.body.get('room'),'test');assert.equal(upload.opts.body.get('file').name,'drop.md');assert(document.querySelector('.pending').textContent.includes('drop.md'));
 assert(!requests.some(r=>r.url.endsWith('/api/message')),'drop must not auto-send a message');
 console.log('PASS: drop overlay, prevent navigation, upload original file to selected room, pending attachment, no auto-send');
}finally{if(root)await act(async()=>root.unmount());dom.window.close();await rm(temp,{recursive:true,force:true})}
