import Store from './store';
import {getJournalPosts} from '../lib/server/journal';
export const dynamic='force-dynamic';
export default async function Page(){return <Store initialPosts={await getJournalPosts().catch(()=>[])}/>}
