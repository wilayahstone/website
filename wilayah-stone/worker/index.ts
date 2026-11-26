import handler from "vinext/server/fetch-handler";
import { runWithConnectorBinding } from "../lib/connector-context";
import type { ConnectorBinding } from "../lib/connector-contract.mjs";
import {secureResponse} from '../lib/security';
import {notFoundResponse} from '../lib/not-found';
import {policies} from '../lib/catalog';
import {getRecord} from '../lib/server/data';
import {productExists} from '../lib/server/products';
import {getJournalPost} from '../lib/server/journal';
import {legacyJournalSlugs} from '../lib/journal';
const pageNames=new Set(['collection','custom','personalisation','journal','wishlist','bag','account','launch','checkout','payment','admin',...Object.keys(policies),...Object.keys(legacyJournalSlugs)]);

const worker = {
  async fetch(request: Request, env: Cloudflare.Env, ctx: ExecutionContext<{ CONNECTORS?: ConnectorBinding }>) {
    const pathname=new URL(request.url).pathname;
    // Determine missing records before the framework starts streaming HTML;
    // streamed notFound() otherwise renders a missing page with HTTP 200.
    if(pathname.startsWith('/product/')){const id=pathname.slice(9);if(!/^[A-Z0-9][A-Z0-9-]{2,29}$/.test(id))return secureResponse(notFoundResponse(),pathname);try{if(!await productExists(id))return secureResponse(notFoundResponse(),pathname)}catch{return secureResponse(new Response('Please try again shortly.',{status:503,headers:{'Retry-After':'30'}}),pathname)}}
    if(pathname.startsWith('/journal/')){const slug=pathname.slice(9);if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))return secureResponse(notFoundResponse(),pathname);try{if(!await getJournalPost(slug))return secureResponse(notFoundResponse(),pathname)}catch{return secureResponse(new Response('Please try again shortly.',{status:503,headers:{'Retry-After':'30'}}),pathname)}}
    if(pathname.startsWith('/post-')){
      const id=pathname.slice(6);if(!/^[0-9a-f-]{36}$/i.test(id))return secureResponse(notFoundResponse(),pathname);
      try{const post=await getRecord(id,'post');if(post?.data.published!==true||post?.data.archivedAt)return secureResponse(notFoundResponse(),pathname)}catch{return secureResponse(new Response('Please try again shortly.',{status:503,headers:{'Retry-After':'30'}}),pathname)}
    }else if(/^\/[^/.]+\/?$/.test(pathname)&&!pageNames.has(pathname.replace(/^\/|\/$/g,'')))return secureResponse(notFoundResponse(),pathname);
    let binding = ctx.props?.CONNECTORS;
    // Local preview emulates the same request-scoped capability. This branch and
    // the auxiliary service binding are absent from production builds.
    if (import.meta.env.DEV && !binding && env.CONNECTORS) {
      const preview = env.CONNECTORS;
      const expiresAt = Date.now() + 60_000;
      binding = {
        async getContext() {
          if (Date.now() >= expiresAt) return { status: "request_context_expired" };
          return preview.getContext?.() ?? { status: "binding_unavailable" };
        },
        async invoke(connectorId, actionName, args) {
          if (Date.now() >= expiresAt) {
            return { status: "request_context_expired", message: "This request has expired. Please try again." };
          }
          return preview.invoke(connectorId, actionName, args);
        },
      };
    }
    return secureResponse(await runWithConnectorBinding(binding, () => handler.fetch(request, env, ctx)),pathname);
  },
};

export default worker;
