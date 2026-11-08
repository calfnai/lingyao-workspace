import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
export default function ChatMarkdown({text}:{text:string}){
 return <div className="chat-markdown"><Markdown remarkPlugins={[remarkGfm]} components={{img:({alt})=><span>{alt}</span>,a:({href,children})=><a href={href} target="_blank" rel="noopener noreferrer">{children}</a>}}>{text}</Markdown></div>;
}
