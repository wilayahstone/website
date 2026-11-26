export const imamNames=['Imam Ali','Imam Hasan','Imam Husayn','Imam Zayn al-Abidin','Imam Muhammad al-Baqir','Imam Jafar al-Sadiq','Imam Musa al-Kadhim','Imam Ali al-Rida','Imam Muhammad al-Jawad','Imam Ali al-Hadi','Imam Hasan al-Askari','Imam Muhammad al-Mahdi'];
export function imamName(value:string){const plain=value.replace(/\s*\(AS\)/g,'').trim().replace(/al-Kazim\b/g,'al-Kadhim');return imamNames.includes(plain)?plain+' (AS)':value;}
export const imams=imamNames.map(imamName);
export function respectfulText(value:string){const names=[...imamNames,'Imam Musa al-Kazim'].sort((a,b)=>b.length-a.length).join('|');return value.replace(new RegExp('(?:'+names+')(?![A-Za-z-])(?:\\s*\\(AS\\))?','g'),imamName).replace(/Ahlul Bayt(?!\s*\(AS\))/g,'Ahlul Bayt (AS)');}
