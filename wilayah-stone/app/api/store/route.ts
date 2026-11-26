import {createCustomerAuth,verifiedCustomer} from '../../../lib/server/customer-auth';
import {storeGET,storePOST} from '../../../lib/server/store-handler';
export const dynamic='force-dynamic';
async function handle(req:Request,method:typeof storeGET){let auth:ReturnType<typeof createCustomerAuth>|undefined;try{auth=createCustomerAuth(req);const user=await verifiedCustomer(auth);return auth.finish(await method(req,user))}catch{return method(req,null)}}
export async function GET(req:Request){return handle(req,storeGET)}
export async function POST(req:Request){return handle(req,storePOST)}
