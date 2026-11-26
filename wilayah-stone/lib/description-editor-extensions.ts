import {Extension,mergeAttributes} from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import {TextStyle,Color,FontSize} from '@tiptap/extension-text-style';
import TextAlign from '@tiptap/extension-text-align';
import Image from '@tiptap/extension-image';
import {descriptionMediaId,safeDescriptionLink} from './product-description';

const ParagraphSpacing=Extension.create({
 name:'paragraphSpacing',
 addGlobalAttributes(){return [{types:['paragraph','heading'],attributes:{paragraphSpacing:{default:null,parseHTML:element=>['compact','normal','relaxed'].includes(element.dataset.spacing||'')?element.dataset.spacing:null,renderHTML:attrs=>attrs.paragraphSpacing?{'data-spacing':attrs.paragraphSpacing}:{}}}}]},
});
const DescriptionImage=Image.extend({
 addAttributes(){return {src:{default:null,parseHTML:element=>{const id=descriptionMediaId(element.getAttribute('src'));return id?'/api/media/'+id:null}},alt:{default:'',parseHTML:element=>element.getAttribute('alt')||''},caption:{default:'',parseHTML:element=>element.closest('figure')?.querySelector('figcaption')?.textContent||'',renderHTML:()=>({})}}},
 parseHTML(){return [{tag:'img[src]',getAttrs:element=>descriptionMediaId(element.getAttribute('src'))?null:false}]},
 renderHTML({HTMLAttributes,node}){return ['figure',{'data-description-image':''},['img',mergeAttributes(this.options.HTMLAttributes,HTMLAttributes)],...(node.attrs.caption?[['figcaption',{},node.attrs.caption]]:[])]},
});
/** Shared by the editor and integration tests, with no remote-image or arbitrary HTML nodes. */
export function descriptionEditorExtensions(){return [
 StarterKit.configure({heading:{levels:[2,3,4]},blockquote:false,code:false,codeBlock:false,horizontalRule:false,strike:false,link:{openOnClick:false,autolink:false,linkOnPaste:false,isAllowedUri:url=>!!safeDescriptionLink(url),HTMLAttributes:{rel:'noopener noreferrer',target:null}}}),
 TextStyle,Color,FontSize,TextAlign.configure({types:['heading','paragraph'],alignments:['left','center','right']}),ParagraphSpacing,
 DescriptionImage.configure({allowBase64:false}),
]}
