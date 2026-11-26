import {json} from '../../../../lib/http';
export const dynamic='force-dynamic';
export async function POST(){return json({error:'Online checkout has been removed. Please contact Wilayah Stone to arrange your order.'},410)}
export const GET=POST;
