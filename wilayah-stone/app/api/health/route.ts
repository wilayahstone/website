import {databaseHealthy} from '../../../lib/server/data';
export const dynamic='force-dynamic';
export async function GET(){try{await databaseHealthy();return Response.json({status:'ok'},{headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}})}catch{return Response.json({status:'unavailable'},{status:503,headers:{'Cache-Control':'no-store'}})}}
