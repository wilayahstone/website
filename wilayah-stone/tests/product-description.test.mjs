import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
import test from 'node:test';
import ts from 'typescript';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {getSchema} from '@tiptap/core';
const require=createRequire(import.meta.url),modules=new Map();
function moduleURL(file){file=path.resolve(file);if(modules.has(file))return modules.get(file);let js=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext,jsx:ts.JsxEmit.ReactJSX}}).outputText;js=js.replace(/from\s+(['"])([^'"]+)\1/g,(_,q,spec)=>{if(spec.startsWith('.')){const p=path.resolve(path.dirname(file),spec);return `from '${moduleURL(fs.existsSync(p+'.tsx')?p+'.tsx':p+'.ts')}'`}return `from '${(spec==='culori'?import.meta.resolve(spec):pathToFileURL(require.resolve(spec).replace(/\.cjs$/,'.js')).href)}'`});const result='data:text/javascript;base64,'+Buffer.from(js).toString('base64');modules.set(file,result);return result}
const descriptionHelpers=await import(moduleURL('lib/product-description.ts'));
const {parseProductDescription,descriptionText,descriptionImageIds,descriptionImageCount,plainDescriptionDocument,safeDescriptionLink,DESCRIPTION_TEXT_LIMIT}=await import(moduleURL('lib/product-description.ts'));
const {ProductDescription}=await import(moduleURL('app/components/product-description.tsx'));
const {descriptionEditorExtensions}=await import(moduleURL('lib/description-editor-extensions.ts'));
const text=(value,marks)=>({type:'text',text:value,...(marks?{marks}:{})}),p=(value,attrs)=>({type:'paragraph',content:[text(value)],...(attrs?{attrs}:{})});
const imageId='11111111-1111-4111-8111-111111111111';
function formatted(){return {type:'doc',content:[{type:'heading',attrs:{level:2,textAlign:'center',paragraphSpacing:'relaxed'},content:[text('A considered ring')]},{type:'paragraph',attrs:{textAlign:'right'},content:[text('925 sterling silver',[{type:'bold'},{type:'italic'},{type:'underline'},{type:'textStyle',attrs:{fontSize:'20px',color:'rgb(8, 61, 46)'}}]),text(' with a selected stone.')]},{type:'bulletList',content:[{type:'listItem',content:[p('An oval setting')]}]},{type:'orderedList',attrs:{start:2},content:[{type:'listItem',content:[p('Choose your ring size')]}]},{type:'paragraph',content:[text('Read the care guide',[{type:'link',attrs:{href:'/care',onclick:'injected'}}])]},{type:'image',attrs:{src:'/api/media/'+imageId,alt:'Oval Aqeeq in a silver ring',caption:'The ring’s setting',onerror:'injected'}}]}}
test('rich descriptions round-trip through the actual editor schema without losing supported formatting',()=>{
 const doc=parseProductDescription(formatted()),schema=getSchema(descriptionEditorExtensions()),editorNode=schema.nodeFromJSON(doc),fromEditor=editorNode.toJSON();editorNode.check();
 assert.deepEqual(parseProductDescription(fromEditor),doc);assert.equal(doc.content[1].content[0].marks.find(mark=>mark.type==='textStyle').attrs.color,'#083d2e');assert.equal(doc.content.at(-1).attrs.onerror,undefined);
 assert.deepEqual(descriptionImageIds(doc),[imageId]);assert.match(descriptionText(doc),/925 sterling silver with a selected stone\./);assert.doesNotMatch(descriptionText(doc),/api\/media|injected/);
});
test('plain-text descriptions retain paragraphs, line breaks, literal markup and Arabic',()=>{
 const value='Silver and stone.\nA personal detail.\n\nيا علي — <script>alert(1)</script>';
 assert.equal(descriptionText(plainDescriptionDocument(value)),value);const html=renderToStaticMarkup(React.createElement(ProductDescription,{description:value}));assert.match(html,/<br\/>/);assert.match(html,/&lt;script&gt;/);assert.doesNotMatch(html,/<script>/);
});
test('public descriptions render semantic formatting, safe links, images and captions without interpreting HTML',()=>{
 const doc=formatted();doc.content[1].content.push(text('<img onerror="bad">'));doc.content[1].content[0].marks.push({type:'link',attrs:{href:'/personalisation'}});
 const html=renderToStaticMarkup(React.createElement(ProductDescription,{description:'Fallback copy',richText:doc}));
 for(const re of [/<h2 style="text-align:center"/,/<strong>/,/<em>/,/<u>/,/<ul>/,/<ol start="2"/,/font-size:1.25rem/,/color:#083d2e/,/href="\/care"/,/<figure>/,/alt="Oval Aqeeq/,/<figcaption>/,/loading="lazy"/,/data-spacing="relaxed"/])assert.match(html,re);
 assert.match(html,/<a href="\/personalisation"[^>]*><span style="color:#083d2e;font-size:1.25rem">/);assert.match(html,/&lt;img onerror=/);assert.doesNotMatch(html,/onclick=|onerror="injected"|<script/);
});
test('unsafe links, external images, unsupported styles and unreasonable nesting are rejected',()=>{
 for(const href of ['javascript:alert(1)','java\nscript:alert(1)','data:text/html,test','//evil.example','\\evil.example','https://user:pass@example.com','vbscript:msgbox(1)']){assert.equal(safeDescriptionLink(href),null);assert.throws(()=>parseProductDescription({type:'doc',content:[{type:'paragraph',content:[text('Unsafe link',[{type:'link',attrs:{href}}])]}]}))}
 for(const href of ['https://wilayahstone.com/care','http://example.com','/personalisation?design=WS-101','mailto:salaam@example.com','tel:+923705198895','#care'])assert.equal(safeDescriptionLink(href),href);
 for(const attrs of [{fontSize:'2000px'},{fontSize:'expression(alert(1))'},{color:'url(https://evil.example)'},{color:'#123456;position:fixed'}])assert.throws(()=>parseProductDescription({type:'doc',content:[{type:'paragraph',content:[text('Untrusted style',[{type:'textStyle',attrs}])]}]}));
 for(const src of ['https://evil.example/image.png','data:image/png;base64,AAAA','/api/store?view=upload&id='+imageId])assert.throws(()=>parseProductDescription({type:'doc',content:[{type:'image',attrs:{src,alt:'A product image'}}]}));
 assert.throws(()=>parseProductDescription({type:'doc',content:[{type:'iframe',attrs:{src:'https://example.com'}}]}));
 assert.throws(()=>parseProductDescription({type:'doc',content:[p('x'.repeat(DESCRIPTION_TEXT_LIMIT+1))]}));
 let nested=p('A nested description');for(let i=0;i<14;i++)nested={type:'bulletList',content:[{type:'listItem',content:[p('List item'),nested]}]};assert.throws(()=>parseProductDescription({type:'doc',content:[nested]}));
 const images=Array.from({length:9},()=>({type:'image',attrs:{src:'/api/media/'+imageId,alt:'A product image'}}));assert.throws(()=>parseProductDescription({type:'doc',content:images}));
});
test('malformed saved rich text falls back to the existing description without exposing unsafe content',()=>{
 const html=renderToStaticMarkup(React.createElement(ProductDescription,{description:'The original silver ring description.',richText:{type:'doc',content:[{type:'paragraph',content:[text('Unsafe',[{type:'link',attrs:{href:'javascript:alert(1)'}}])]}]}}));assert.match(html,/The original silver ring description/);assert.doesNotMatch(html,/javascript:|Unsafe/);
});

test('images within list items preserve captions, count repeated placements and remain valid editor content',()=>{const image={type:'image',attrs:{src:'/api/media/'+imageId,alt:'A silver ring detail',caption:'The silver setting'}};const doc=parseProductDescription({type:'doc',content:[{type:'bulletList',content:[{type:'listItem',content:[p('A closer look at the ring.'),image]}]},image]});const node=getSchema(descriptionEditorExtensions()).nodeFromJSON(doc);node.check();assert.deepEqual(parseProductDescription(node.toJSON()),doc);assert.equal(descriptionImageCount(doc),2);assert.deepEqual(descriptionImageIds(doc),[imageId]);});

test('valid custom and pasted colours accept the full picker range, names, alpha and modern CSS syntax',()=>{
 const {descriptionColor,descriptionPickerColor}=descriptionHelpers;
 const values=['#000','#fff','#abc','#abcd','#123456','#12345678','RED','rebeccapurple','goldenrod','transparent','rgba(0, 0, 0, 0.8)','rgba(255, 0, 128, .5)','rgb(10% 20% 30% / 50%)','rgb(12.5 25.5 30.5)','hsl(240, 100%, 50%)','hsla(120, 50%, 40%, .75)','hwb(30 10% 20% / 50%)','lab(50% 10 -20)','lch(50% 20 80)','oklab(.6 .1 -.1)','oklch(65% .15 150)','color(display-p3 .2 .5 .8)','color(srgb .2 .4 .6 / .8)','currentColor','inherit','WindowText'];
 for(const value of values){const result=descriptionColor(value);assert.ok(result,value);const doc=parseProductDescription({type:'doc',content:[{type:'paragraph',content:[text('A ring with a personal detail.',[{type:'textStyle',attrs:{color:value}}])]}]});assert.equal(doc.content[0].content[0].marks[0].attrs.color,result,value);assert.deepEqual(parseProductDescription(doc),doc,value);assert.match(descriptionPickerColor(value),/^#[\da-f]{6}$/i)}
 assert.equal(descriptionColor('red'),'#ff0000');assert.equal(descriptionColor('#abc'),'#aabbcc');assert.equal(descriptionColor('rgba(0, 0, 0, .8)'),'rgba(0, 0, 0, 0.8)');
 for(const value of ['url(https://evil.example)','red;display:none','expression(alert(1))','var(--untrusted-colour)','<script>','not-a-colour','rgb(Infinity 0 0)','color(srgb NaN 0 0)'])assert.equal(descriptionColor(value),null,value);
});
