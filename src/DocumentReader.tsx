import {useMemo,useRef,useState} from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type {Components} from 'react-markdown';

export default function DocumentReader({text,name,status}:{text:string;name:string;status:string}){
 const scroll=useRef<HTMLDivElement>(null);
 const [query,setQuery]=useState(''),[source,setSource]=useState(false);
 const headings=useMemo(()=>{let fence=false;return text.split('\n').flatMap((line,index)=>{if(/^\s*(```|~~~)/.test(line)){fence=!fence;return []}const m=!fence&&line.match(/^(#{1,3})\s+(.+)/);return m?[{id:'section-'+(index+1),label:m[2].replace(/[*`]/g,''),level:m[1].length}]:[]})},[text]);
 const jump=(id:string)=>{scroll.current?.querySelector<HTMLElement>('#'+id)?.scrollIntoView({block:'start'});};
 const components:Components={
  h1:({node,children})=><h1 id={'section-'+node?.position?.start.line}>{children}</h1>,
  h2:({node,children})=><h2 id={'section-'+node?.position?.start.line}>{children}</h2>,
  h3:({node,children})=><h3 id={'section-'+node?.position?.start.line}>{children}</h3>,
  table:({children})=><div className="table-scroll" role="region" aria-label="文档表格，可横向滚动" tabIndex={0}><table>{children}</table></div>,
  a:({href,children})=><a href={href} target="_blank" rel="noopener noreferrer">{children}</a>,
 };
 const matches=useMemo(()=>query.trim()?text.split('\n').filter(line=>line.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())):[],[text,query]);
 const isMarkdown=/\.md$/i.test(name)||/^#\s/m.test(text);
 return <section className="reader" aria-label="文档阅读器">
  <div className="reader-toolbar">
   <input aria-label="搜索文档内容" placeholder="搜索文档内容" value={query} onChange={e=>setQuery(e.target.value)}/>
   <button onClick={()=>scroll.current?.scrollTo({top:0})}>回到开头</button>
   <button onClick={()=>scroll.current?.scrollTo({top:scroll.current.scrollHeight})}>到文末</button>
   {isMarkdown&&<button aria-pressed={source} onClick={()=>setSource(!source)}>{source?'阅读排版':'查看原文'}</button>}
  </div>
  <div ref={scroll} className="reader-scroll" tabIndex={0} role="region" aria-label="文档正文，可上下滚动">
   {status==='history'&&<p className="reader-status">历史存档 · 保留当时口径，不代表当前承诺或已签合同</p>}
   {query.trim()&&<section className="reader-matches" aria-label="搜索结果"><strong>找到 {matches.length} 段匹配内容</strong>{matches.map((line,i)=><p key={i}>{line}</p>)}</section>}
   {!source&&headings.length>3&&<details className="reader-toc"><summary>文档目录 · {headings.length} 节</summary><nav aria-label="文档目录">{headings.map(h=><button key={h.id} style={{paddingLeft:(h.level-1)*12+8}} onClick={()=>jump(h.id)}>{h.label}</button>)}</nav></details>}
   <article className="document-paper">{!text?<p role="status">正在读取文档…</p>:source||!isMarkdown?<pre className="source-text">{text}</pre>:<Markdown remarkPlugins={[remarkGfm]} components={components}>{text}</Markdown>}<p className="document-end">— 文档结束 —</p></article>
  </div>
 </section>
}
