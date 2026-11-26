import {getRecord,listRecords} from './data';
import {journalPublic,respectfulJournal,type JournalPost} from '../journal';
export async function getJournalPosts():Promise<JournalPost[]>{return (await listRecords('post',undefined,500)).filter(journalPublic).map(respectfulJournal).sort((a,b)=>(b.data.publishedAt||b.created).localeCompare(a.data.publishedAt||a.created))}
export async function getJournalPost(slug:string){return (await getJournalPosts()).find(p=>p.data.slug===slug)||null}
export async function getLegacyPost(id:string){const p=await getRecord(id,'post');return journalPublic(p)?respectfulJournal(p):null}
