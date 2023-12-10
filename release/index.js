(()=>{function e(e){let t=localStorage.getItem(e);if(!t)return;let n=JSON.parse(t);if(!n.exp||Date.now()>n.exp){localStorage.removeItem(e);return}return n.value}let t=function(t,n=6048e5){let o="cacheWithLocalStorage"+t.name;function a(...i){let r=o+JSON.stringify(i),l=e(r);if(l)return"[object AsyncFunction]"===Object.prototype.toString.call(t)?Promise.resolve(l):l;{let e=t(...i);function s(e){!function(e,t,n){let o=Date.now();localStorage.setItem(e,JSON.stringify({value:t,exp:o+n}))}(r,e,n)}return e instanceof Promise?e.then(e=>(s(e),e)):(s(e),e)}}return a.hasCachedValue=(...t)=>!!e(o+JSON.stringify(t)),a}(async function(e){let{sourceLanguage:t,targetLanguage:n,hostLanguage:o,query:a,type:i}=e,r=encodeURIComponent(a),l=Array.isArray(i)?i.join("&dt="):i,s=`https://translate.googleapis.com/translate_a/single?client=gtx&sl=${t}&tl=${n}&hl=${o}&dt=${l}&dj=1&source=bubble&q=${r}`,c=await fetch(s);return await c.json()},6048e5);function n(e){let t,n;let o=document;if(o.caretPositionFromPoint){let a=o.caretPositionFromPoint(e.clientX,e.clientY);a&&(t=a.offsetNode,n=a.offset)}else if(o.caretRangeFromPoint){let a=o.caretRangeFromPoint(e.clientX,e.clientY);a&&(t=a.startContainer,n=a.startOffset)}return t&&t.textContent&&void 0!==n?[t,n]:[void 0,0]}let o=[{lang:"Spanish",code:"es",score:100},{lang:"French",code:"fr",score:90},{lang:"German",code:"de",score:80},{lang:"Italian",code:"it",score:70},{lang:"Portuguese",code:"pt",score:60},{lang:"Dutch",code:"nl",score:50},{lang:"Swedish",code:"sv",score:40},{lang:"Russian",code:"ru",score:30},{lang:"Japanese",code:"ja",score:40},{lang:"Chinese",code:"zh",score:20},{lang:"Korean",code:"ko",score:30},{lang:"Arabic",code:"ar",score:20},{lang:"Turkish",code:"tr",score:30},{lang:"Polish",code:"pl",score:30},{lang:"Danish",code:"da",score:40},{lang:"Norwegian",code:"no",score:40},{lang:"Finnish",code:"fi",score:30},{lang:"Greek",code:"el",score:20},{lang:"Czech",code:"cs",score:30},{lang:"Hungarian",code:"hu",score:30},{lang:"Romanian",code:"ro",score:20},{lang:"Indonesian",code:"id",score:30},{lang:"Hindi",code:"hi",score:20},{lang:"Hebrew",code:"he",score:20},{lang:"Thai",code:"th",score:30},{lang:"Vietnamese",code:"vi",score:20},{lang:"Bengali",code:"bn",score:20},{lang:"Tagalog",code:"tl",score:30},{lang:"Malay",code:"ms",score:20},{lang:"Ukrainian",code:"uk",score:20},{lang:"Slovak",code:"sk",score:30},{lang:"Lithuanian",code:"lt",score:20},{lang:"Slovenian",code:"sl",score:30},{lang:"Latvian",code:"lv",score:20},{lang:"Croatian",code:"hr",score:30},{lang:"Estonian",code:"et",score:20},{lang:"Serbian",code:"sr",score:20},{lang:"Bulgarian",code:"bg",score:20},{lang:"Icelandic",code:"is",score:30},{lang:"Faroese",code:"fo",score:20},{lang:"Greenlandic",code:"kl",score:10},{lang:"Basque",code:"eu",score:20},{lang:"Catalan",code:"ca",score:30},{lang:"Galician",code:"gl",score:20},{lang:"Welsh",code:"cy",score:20},{lang:"Irish",code:"ga",score:20},{lang:"Scottish Gaelic",code:"gd",score:20},{lang:"Maori",code:"mi",score:10}].sort((e,t)=>t.score-e.score);function a(e,t,n){return Math.min(Math.max(e,t),n)}class i{register(){let e=document.createElement("div");Object.assign(e.style,{position:"fixed",display:"none",pointerEvents:"none",zIndex:"1000",backgroundColor:"white",color:"black",padding:"2px",border:"1px solid black",borderRadius:"2px",left:"0px",top:"0px"}),document.body.appendChild(e),this.element=e,this.freezeUntil=0}unregister(){this.requireElement()&&(this.hideTimeout&&(clearTimeout(this.hideTimeout),delete this.hideTimeout),document.body.removeChild(this.element),delete this.element)}requireElement(){if(void 0==this.element)throw Error("Tooltip is not registered");return this.element}setPosition(e,t,n){let o=this.requireElement(),i=document.documentElement.offsetWidth,r=window.innerHeight;n&&(console.log(e,t,r),console.log(e,t+=t<3*r/4?30:-30,""));let l=a(e-o.offsetWidth/2,0,i-o.offsetWidth),s=a(t,o.offsetHeight,r-o.offsetHeight);o.style.transform=`translate(${l}px, ${s}px)`,Object.assign(this.position,{x:e,y:t})}reposition(){this.setPosition(this.position.x,this.position.y,!1)}move(e){requestAnimationFrame(()=>{this.setPosition(e.clientX,e.clientY,!0)})}show(e,t=0){let n=this.requireElement(),o=Date.now();o<this.freezeUntil||(n.style.display="block",n.innerText=e,this.freezeUntil=o+t,this.reposition())}hideAfterTimeout(e){this.hideTimeout&&clearTimeout(this.hideTimeout),this.hideTimeout=setTimeout(()=>this.hide(),e)}hide(){this.requireElement().style.display="none"}isOver(e){let t=this.requireElement().getBoundingClientRect(),n=e.clientX,o=e.clientY;return n>=t.left&&n<=t.right&&o>=t.top&&o<=t.bottom}constructor(){this.freezeUntil=0,this.position={x:0,y:0}}}let r="[\\p{L}\\p{N}\\p{M}\\p{Pd}']";function l(e,t,n){return Math.min(Math.max(e,t),n)}function s(e,t,n){if(t<=0)return"";let o="next"===n?"nextSibling":"previousSibling",a=e.parentElement,i=[];for(let a=e[o];a;a=a[o]){let e=a.textContent;if(e){if(e.length>=t){"previous"===n?i.push(e.slice(-t)):i.push(e.slice(0,t)),t-=e.length;break}i.push(e),t-=e.length}}return t&&a&&i.push(s(a,t,n)),"previous"===n&&i.reverse(),i.join("")}function c(e,t,n){return[s(e,t,"previous"),s(e,n,"next")]}let u=window,g="translationSourceLanguage";async function d(e,n=1e3,o={}){let a=[...e.matchAll(/[^\p{P}\s\u4e00-\u9fff]+|[\u4e00-\u9fff]/gu)].map(e=>e[0]);for(let e of(a.sort(()=>Math.random()-.5),a)){if(o.cancel)return;if(e.length>20)continue;let a=f(e);if(!t.hasCachedValue(a)){console.log("fetching",e),await new Promise(e=>setTimeout(e,n));try{await t(a)}catch(e){console.error(e),n*=2}}}}function h(){let e=u.translationSourceLanguage||"auto";return"auto"===e&&u.lastLanguage&&Date.now()-(u.lastLanguageTime||0)<1e4?u.lastLanguage:e}function m(){return u.translationTargetLanguage||"en"}function f(e){return{sourceLanguage:h(),targetLanguage:m(),hostLanguage:navigator?.language?.slice(0,2)||"en-US",query:e,type:["t","bd","rm"]}}async function p(e){if(u.translationTooltip?.isOver(e))return;let o=p.lastCalled||0;p.lastCalled=Date.now();let a=Date.now()-o>500,i=function(e){let[t,o]=n(e);if(t)return function(e,t){let n=e.slice(0,t),o=e.slice(t);if((n.slice(-1)+o.slice(0,1)).match(/^[\u4e00-\u9fff]/))return o[0];let a=n.match(RegExp(`(${r}*)$`,"u")),i=o.match(RegExp(`^(${r}+)`,"u"));if(i||a)return(a&&a[1]||"")+(i&&i[1]||"")}(t.textContent||"",o)}(e);if(i){let n=f(i),o=t.hasCachedValue(n);if(!a&&!o){p.cancel&&p.cancel();let t=setTimeout(()=>p(e),500);p.cancel=()=>{clearTimeout(t),p.cancel=void 0},u.translationTooltip?.show(i+": ...");return}let r=await t(n),l=r.dict?.[0],s=l?.entry,c=r.sentences?.map(e=>e.src_translit).filter(e=>e)||[],g=i+(c.length?" ("+c.join(" / ")+")":""),d="";if(s&&s.length){let e=s.filter(e=>(e.score||0)>.25).map(e=>e.word)||[],t=s.filter(e=>.25>=(e.score||0)).map(e=>e.word).slice(0,3)||[];d=e.join(" / ")+(t.length?" ("+t.join(" / ")+")":"")}else r.sentences&&r.sentences.length&&(d=r.sentences?.map(e=>e.trans).filter(e=>e).join(" / ")||"");d&&u.translationTooltip?.show(g+": "+d)}else u.translationTooltip?.hide()}async function v(e){let[o,a]=n(e),i=o?.textContent||"",r=100*Math.round(a/100),s=l(r-100,0,Math.max(0,i.length-200)),g=l(r+100,Math.min(200,i.length),i.length),[f,p]=o?c(o,100-r,r-(i.length-100)):["",""],v=f+i.slice(s,g)+p,w=a>100||f?v.replace(/^[^\p{P}\s]+\s*/u,""):v,y=(a<i.length-100||p?w.replace(/\s*[^\p{P}\s]+$/u,""):w).replace(/\n+/g,"¶");if(d(y,100),y){let e={sourceLanguage:h(),targetLanguage:m(),hostLanguage:navigator?.language?.slice(0,2)||"en-US",query:y,type:["t","rm"]},n=await t(e);u.translationTooltip?.show(n.sentences?.map(e=>e.trans||e.src_translit).join("\nor: ")||"Error",1e3)}}function w(e){u.translationTooltip?.move(e),p(e)}function y(){u.translationTooltip=new i,u.translationTooltip.register(),function(){let e;let t=localStorage.getItem(g),n=document.documentElement.lang?.slice(0,2)||"auto";if(t&&!u.translationSourceLanguage)e=t||n;else{let t=o.map(e=>`${e.code} - ${e.lang}`).join("\n");e=prompt("Source language\nauto - auto\n"+t,n)}e&&(u.translationSourceLanguage=e,localStorage.setItem(g,e))}();let e=(document.addEventListener("mousemove",w),document.addEventListener("mousedown",v),()=>{document.removeEventListener("mousemove",w),document.removeEventListener("mousedown",v)}),t=function(){async function e(t){let n=document.body.innerText;await d(n,1e3,t),await new Promise(e=>setTimeout(e,1e3)),setTimeout(()=>e(t))}if(u.isFetchingRandomWords)return()=>{};u.isFetchingRandomWords=!0;let t={cancel:!1};return e(t),()=>{t.cancel=!0,u.isFetchingRandomWords=!1}}();u.cancelTranslator=()=>{e(),t(),delete u.cancelTranslator}}window.getTextSurroundingElement=c,"loading"===document.readyState?document.addEventListener("DOMContentLoaded",y):y()})();
