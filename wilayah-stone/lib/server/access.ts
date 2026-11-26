import type {StoreUser} from '../identity';
import {can,isRole,normaliseEmail,permissionsFor,Role,Permission,roles} from '../permissions';
import {getRecord,insertRecord,listRecords,saveRecord,compareAndSet,consumeRate} from './data';
import {runtime} from './runtime';
import type {StaffIdentity} from '../admin-auth-policy';
import type {RecordRow} from './data';
import {HttpError} from '../http';
import {z} from 'zod';
import {sharedAdminMode,sharedAdminConfigured} from './email-sessions';
export type Staff={user:StoreUser;role:Role;permissions:Permission[]};
type Member={email:string;role:Role;active:boolean;identityId?:string;googleUserId?:string;requestedRole?:Role;status:'Invited'|'Active'|'Pending approval'|'Disabled';joinedAt?:string;selectedAt?:string;onboardedAt?:string;updatedBy?:string};
type Directory={version:1;members:Record<string,Member>;createdAt:string;updatedBy?:string};
const directoryId='staff:directory';
function isEmail(user:StoreUser|null|undefined):user is StaffIdentity{return !!user&&(user as StaffIdentity).authProvider==='email'&&/^email:[a-f0-9-]{36}$/i.test(user.userId)}
function binding(member?:Member){return member?.identityId||member?.googleUserId}
function sameIdentity(member:Member|undefined,user:StoreUser){const value=binding(member);return !!value&&/^(email|google):[a-f0-9-]{36}$/i.test(value)&&value.slice(value.indexOf(':')+1)===user.userId.slice(user.userId.indexOf(':')+1)}
async function directory():Promise<RecordRow<Directory>>{
 const existing=await getRecord(directoryId,'setting');if(existing)return existing;
 const legacy=await listRecords('staff',undefined,500),members:Record<string,Member>=Object.create(null),at=new Date().toISOString();
 for(const r of legacy){const email=normaliseEmail(String(r.data.email||'')),role=r.data.role==='master_admin'?'administrator':r.data.role;if(!z.string().email().safeParse(email).success||!isRole(role))continue;const identityId=r.data.identityBindings?.email||r.data.identityBindings?.google||(/^(email|google):/.test(String(r.data.identityId||''))?r.data.identityId:undefined);members[email]={email,role,active:r.data.active===true,identityId,status:r.data.active===true?'Invited':'Disabled'};}
 const bootstrap=normaliseEmail(runtime().ADMIN_BOOTSTRAP_EMAIL||'');if(!Object.values(members).some(m=>m.active&&m.role==='administrator')&&z.string().email().safeParse(bootstrap).success)members[bootstrap]={email:bootstrap,role:'administrator',active:true,status:'Invited'};
 await insertRecord(directoryId,'setting','store',{version:1,members,createdAt:at});const current=await getRecord(directoryId,'setting');if(!current)throw Error('Staff directory unavailable');return current;
}
export async function getStaff(user?:StoreUser|null):Promise<Staff|null>{
 if(sharedAdminMode()){
  if(!sharedAdminConfigured()||!user||(user as StaffIdentity).authProvider!=='shared_code'||!/^store-admin:[a-f0-9-]{36}$/i.test(user.userId))return null;
  const account=await getRecord('store-admin:identity','setting');if(!account||account.owner!=='auth:directory'||account.data.disabledAt||'store-admin:'+account.data.id!==user.userId)return null;
  return {user,role:'administrator',permissions:permissionsFor('administrator')};
 }
 if(!isEmail(user))return null;const email=normaliseEmail(user.email);
 for(let i=0;i<4;i++){const r=await directory(),member=r.data.members[email];if(!member||!member.active||!isRole(member.role))return null;if(binding(member)&&!sameIdentity(member,user))return null;if(member.identityId===user.userId)return {user,role:member.role,permissions:permissionsFor(member.role)};
  const data={...r.data,members:{...r.data.members,[email]:{...member,identityId:user.userId,googleUserId:undefined,joinedAt:member.joinedAt||new Date().toISOString()}}};if(await compareAndSet(r,data))return {user,role:member.role,permissions:permissionsFor(member.role)};
 }return null;
}
export async function registrationState(user:StaffIdentity){const staff=await getStaff(user);if(sharedAdminMode()){if(!staff)throw new HttpError(401,'Enter the store access code to continue.');return {email:user.email,displayName:user.displayName,stage:'ready',role:'administrator',requestedRole:null,firstAdministrator:false,roles:[],accessMode:'shared_code'}}const r=await directory(),m=r.data.members[normaliseEmail(user.email)];if(binding(m)&&!sameIdentity(m,user))throw new HttpError(403,'This email is already linked to another verified identity. Contact a store administrator.');return {email:user.email,stage:staff?(m.onboardedAt?'ready':'choose_role'):m?.status==='Pending approval'?'pending':'choose_role',role:staff?.role||null,requestedRole:m?.requestedRole||null,firstAdministrator:!!staff&&staff.role==='administrator'&&!m.onboardedAt,roles};}
export async function selectRole(user:StaffIdentity,input:unknown){if(sharedAdminMode())throw new HttpError(400,'This workspace uses a single store administrator.');if(!isEmail(user))throw new HttpError(401,'Sign in with your work email.');const role=z.enum(roles).parse(input),email=normaliseEmail(user.email);if(!await consumeRate('staff-signup:'+user.userId,10))throw new HttpError(429,'Please wait before updating your role request.');
 for(let i=0;i<4;i++){const r=await directory(),old=r.data.members[email];if(!old&&Object.keys(r.data.members).length>=200)throw new HttpError(429,'The workspace has reached its staff limit. Contact a store administrator.');if(binding(old)&&!sameIdentity(old,user))throw new HttpError(403,'This email is linked to another verified identity.');if(old?.active&&old.role==='administrator'&&!old.onboardedAt&&role!=='administrator')throw new HttpError(400,'Complete the initial setup as a store administrator. You can manage staff roles in Team.');const now=new Date().toISOString(),approved=old?.active&&old.role===role,member:Member={...old,email,role:old?.role||role,requestedRole:role,active:approved===true,status:approved?'Active':'Pending approval',identityId:user.userId,googleUserId:undefined,joinedAt:old?.joinedAt||now,selectedAt:now,onboardedAt:approved?now:old?.onboardedAt};
  if(old?.active&&old.onboardedAt)throw new HttpError(409,'Your role is already assigned. Ask a store administrator to change it.');
  if(await compareAndSet(r,{...r.data,members:{...r.data.members,[email]:member}})){await saveRecord(crypto.randomUUID(),'audit',user.userId,{action:approved?'staff.onboarded':'staff.role_requested',record:email,role:approved?role:'applicant',details:{requestedRole:role},at:now});return registrationState(user)}
 }throw new HttpError(409,'Staff access changed. Refresh and try again.');
}
export async function updateTeam(staff:Staff,input:unknown){if(sharedAdminMode())throw new HttpError(400,'This workspace uses a single store administrator.');if(!can(staff.role,'roles.manage'))throw new HttpError(403,'A store administrator must manage staff access.');const data=z.object({email:z.string().trim().email().max(200),role:z.enum(roles),active:z.boolean()}).strict().parse(input),email=normaliseEmail(data.email);
 for(let i=0;i<4;i++){const r=await directory(),actor=r.data.members[normaliseEmail(staff.user.email)];if(!actor?.active||actor.role!=='administrator'||!sameIdentity(actor,staff.user))throw new HttpError(403,'Your store-administrator access has changed.');const old=r.data.members[email];if(!old&&Object.keys(r.data.members).length>=200)throw new HttpError(409,'The workspace staff limit has been reached.');if(old?.active&&binding(old)&&old.role==='administrator'&&(!data.active||data.role!=='administrator')&&Object.values(r.data.members).filter(m=>m.active&&m.role==='administrator'&&binding(m)).length<=1)throw new HttpError(409,'Keep at least one active store administrator. Add another administrator first.');const now=new Date().toISOString(),member:Member={...old,...data,email,status:data.active?(binding(old)?'Active':'Invited'):'Disabled',updatedBy:staff.user.email,onboardedAt:old?.selectedAt&&data.active?now:old?.onboardedAt};
  if(await compareAndSet(r,{...r.data,members:{...r.data.members,[email]:member},updatedBy:staff.user.email})){await audit(staff,'team.access',email,{role:data.role,active:data.active});return;}
 }throw new HttpError(409,'The team changed. Refresh and try again.');
}
export async function audit(staff:Staff,action:string,record:string|null,details:unknown={}){await saveRecord(crypto.randomUUID(),'audit',staff.user.userId,{action,record,role:staff.role,details,at:new Date().toISOString()})}
export async function teamList(){if(sharedAdminMode())return [];const r=await directory();return Object.values(r.data.members).map(m=>({id:m.email,...m,claimed:!!binding(m),identityId:undefined,googleUserId:undefined,updated:r.updated})).sort((a,b)=>a.email.localeCompare(b.email));}
export {can};
