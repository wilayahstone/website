import {headers} from 'next/headers';
import {publicSiteOrigin} from './site-origin';
import {customSiteOrigin} from '../site';
export async function pageOrigin(){const h=await headers();return h.get('host')===new URL(customSiteOrigin).host?customSiteOrigin:publicSiteOrigin()}
