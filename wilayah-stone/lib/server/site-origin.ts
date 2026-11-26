import {runtime} from './runtime';
import {customSiteOrigin,legacySiteOrigin,storeSiteOrigins,httpsOrigin} from '../site';
export function publicSiteOrigin(request?:Request){const configured=httpsOrigin(runtime().PUBLIC_SITE_ORIGIN),primary=(runtime().HOSTING_PLATFORM==='node'&&configured||storeSiteOrigins.includes(configured as any))?configured!:legacySiteOrigin;if(primary===customSiteOrigin)return primary;if(request&&new URL(request.url).origin===customSiteOrigin)return customSiteOrigin;return primary}
