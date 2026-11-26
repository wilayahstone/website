import {json} from '../../../../lib/http';
export const dynamic = 'force-dynamic';
export function POST() { return json({error: 'Sign in with your email and password.'}, 410); }
