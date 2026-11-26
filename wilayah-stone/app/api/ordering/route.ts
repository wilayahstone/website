import {publicOrdering} from '../../../lib/server/operations';
import {json} from '../../../lib/http';
export const dynamic='force-dynamic';
export async function GET(){try{return json(await publicOrdering())}catch{return json({whatsappNumber:'',whatsappEnabled:false},503)}}
