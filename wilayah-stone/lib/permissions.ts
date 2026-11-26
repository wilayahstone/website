export const roles=['administrator','catalog_manager','fulfilment','support','editor','viewer'] as const;
export const roleNames:Record<typeof roles[number],string>={administrator:'Store administrator',catalog_manager:'Catalogue manager',fulfilment:'Fulfilment',support:'Customer support',editor:'Content editor',viewer:'Viewer'};
export type Role=typeof roles[number];
export const permissions=['catalog.read','catalog.write','requests.read','requests.write','suppliers.read','suppliers.write','journal.read','journal.write','support.read','support.write','payments.read','payments.write','finances.read','finances.write','approvals.write','settings.write','quotes.write','orders.write','roles.manage','records.archive','audit.read','governance.read'] as const;
export type Permission=typeof permissions[number];
const grants:Record<Role,readonly Permission[]>={
 administrator:permissions,
 catalog_manager:['catalog.read','catalog.write','suppliers.read','journal.read','governance.read'],
 fulfilment:['catalog.read','requests.read','requests.write','suppliers.read','suppliers.write','orders.write','governance.read'],
 support:['catalog.read','requests.read','requests.write','support.read','support.write','payments.read','governance.read'],
 editor:['journal.read','journal.write','catalog.read'],
 viewer:['catalog.read','governance.read']
};
export function isRole(value:unknown):value is Role{return roles.includes(value as Role)}
export function can(role:Role|null|undefined,permission:Permission){return !!role&&grants[role].includes(permission)}
export function permissionsFor(role:Role|null){return role?[...grants[role]]:[]}
export function normaliseEmail(email:string){return email.trim().toLowerCase()}
export const tabPermissions:Record<string,Permission|null>={Overview:null,Catalogue:'catalog.read',Requests:'requests.read',Suppliers:'suppliers.read',Journal:'journal.read',Enquiries:'support.read',Orders:'requests.read',Team:'roles.manage',Governance:'governance.read',Payments:'payments.read',Readiness:'governance.read','Audit log':'audit.read'};
