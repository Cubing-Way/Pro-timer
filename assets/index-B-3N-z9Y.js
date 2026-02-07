(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))o(s);new MutationObserver(s=>{for(const r of s)if(r.type==="childList")for(const l of r.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&o(l)}).observe(document,{childList:!0,subtree:!0});function n(s){const r={};return s.integrity&&(r.integrity=s.integrity),s.referrerPolicy&&(r.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?r.credentials="include":s.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function o(s){if(s.ep)return;s.ep=!0;const r=n(s);fetch(s.href,r)}})();const G=new Worker("./public/cstimer_module.js?worker_file&type=classic");let O=0;const q={};G.onmessage=e=>{const[t,,n]=e.data;q[t]?.(n),delete q[t]};function k(e,t=[]){return new Promise(n=>{O++,q[O]=n,G.postMessage([O,e,t])})}const K={getScramble:(e,t=0)=>k("scramble",[e,t]),getImage:(e,t)=>k("image",[e,t]),setSeed:e=>k("seed",[e])};let j="";const ge={333:["333",0],"333oh":["333",0],"333fm":["333fm",0],222:["222so",0],444:["444wca",0],555:["555wca",60],666:["666wca",80],777:["777wca",100],"333bf":["333ni",0],"444bf":["444bld",40],"555bf":["555bld",60],"333mbf":["r3ni",5],minx:["mgmp",70],pyram:["pyrso",10],skewb:["skbso",0],sq1:["sqrs",0],clock:["clkwca",0]};async function T(e="333",t){const[n,o]=ge[e];if(!n)return;const s=await K.getScramble(n,o),r=await K.getImage(s,n);j=s;const l=t;l.innerHTML=r,he(e,t);const u=document.getElementById("scrambleDisplay");e==="minx"||e==="megaminx"?u.textContent=ye(s):u.textContent=s,ve()}function ye(e){const t=e.split(" ");let n=[],o=[];for(const s of t)o.push(s),(s==="U"||s==="U'")&&(n.push(o.join(" ")),o=[]);return o.length&&n.push(o.join(" ")),n.join(`
`)}function ve(){const e=document.getElementById("scrambleContainer"),t=document.getElementById("scrambleDisplay");let n=40;for(t.style.fontSize=n+"px",t.style.whiteSpace="pre-wrap",t.style.wordBreak="break-word",t.offsetHeight;t.scrollHeight>e.clientHeight;)n-=1,t.style.fontSize=n+"px"}function he(e,t){t.id==="scrambleVis"?["333","333bf","333mbf","333oh","333fm"].includes(e)?f(.45,75,70,t):e==="222"?f(.6,-43,-10,t):e==="pyram"?f(.4,55,70,t):["444","444bf"].includes(e)?f(.35,130,110,t):e==="skewb"?f(.4,65,75,t):["555","555"].includes(e)?f(.3,165,135,t):e==="666"?f(.25,180,150,t):e==="777"?f(.22,195,155,t):e==="minx"?f(.5,105,40,t):e==="clock"?f(.5,60,15,t):e==="sq1"&&f(.4,105,55,t):["333","333bf","333mbf","333oh","333fm"].includes(e)?f(.45,75,70,t):e==="222"?f(.6,-43,-10,t):e==="pyram"?f(.4,55,70,t):["444","444bf"].includes(e)?f(.35,130,110,t):e==="skewb"?f(.4,65,75,t):["555","555"].includes(e)?f(.3,165,135,t):e==="666"?f(.25,180,150,t):e==="777"?f(.22,195,155,t):e==="minx"?f(.5,105,40,t):e==="clock"?f(.5,60,15,t):e==="sq1"&&f(.4,105,55,t)}function f(e,t,n,o){let s=null;if(o.id==="scrambleVis"){s=document.querySelector(".panel-cube"),s.style.transformOrigin="bottom right",s.style.transform=`scale(${e})`,s.style.position="absolute",s.style.right=`${t}px`,s.style.bottom=`${n}px`;const r=document.getElementById("scrambleVis"),l=r.width||600,u=r.height||400;s.style.width=l*e+"px",s.style.height=u*e+"px"}else{s=document.querySelector(".panel-cube2"),s.style.transformOrigin="bottom center",s.style.transform=`scale(${e})`,s.style.right=`${t}px`,s.style.bottom=`${n}px`;const r=document.getElementById("scrambleVis"),l=r.width||600,u=r.height||400;s.style.width=l*e+"px",s.style.height=u*e+"px"}}const a={timerPhase:0,interval:0,wcaInterval:0,wcaDelayCount:!1,inspecting:!1,inspection:0};function Y(){a.timerPhase!==1?a.timerPhase++:a.timerPhase===1&&($("color","red"),a.wcaInterval=setInterval(()=>{$("color","limeGreen"),a.wcaDelayCount++},300))}function Q(){a.wcaDelayCount>=1?(a.timerPhase++,a.wcaDelayCount=0,clearInterval(a.wcaInterval)):($("color","#eaeaf0"),a.wcaDelayCount=0,clearInterval(a.wcaInterval))}function X(){a.inspection=0,a.inspecting=!0,$("time",`${a.inspection}`),a.interval=setInterval(()=>{a.inspection++,a.inspection===8&&new Audio("./audio/8seconds.mp3").play(),a.inspection===12&&new Audio("./audio/12seconds.mp3").play(),a.inspection===17&&clearInterval(a.interval),$("time",a.inspection)},1e3)}function H(e){return(Math.floor(e*100)/100).toFixed(2)}function pe(e){let t=e/1e3,n=Math.floor(t/60),o=Math.floor(n/60);if(n<1)return H(t);if(n>=1)return t=t-60*n,`${n}: ${t<10?"0":""}${H(t)}`;if(n>=60)return n=n-60*o,`${o}: ${n<10?"0":""}${n}: ${t<10?"0":""}${H(t)}`}function ee(){$("color","#eaeaf0"),clearInterval(a.interval),a.inspecting=!1;const e=performance.now();a.interval=setInterval(()=>{$("time",pe(performance.now()-e))},10)}function te(){clearInterval(a.interval),document.getElementById("timer").innerHTML,a.timerPhase=0}const i={mode:"ao5",solveCounter:0,solvesArray:[]};function ne(e){if(typeof e=="number")return e;if(e.includes(":")){const[t,n]=e.split(":");return parseInt(t,10)*60+parseFloat(n)}return parseFloat(e)}function be(e){const t=Number(e);return Number.isFinite(t)?t.toFixed(2):"-"}function J(e){if(e>=60){const t=Math.floor(e/60),n=(e%60).toFixed(2).padStart(5,"0");return`${t}:${n}`}return e.toFixed(2)}function M(e){return e.penalty==="DNF"?"DNF":e.penalty==="+2"?J(e.time+2)+" (+2)":J(e.time)}function g(e){if(e==="DNF"||(e=Number(e),!Number.isFinite(e)))return"DNF";if(e>=60){const t=Math.floor(e/60),n=(e%60).toFixed(2).padStart(5,"0");return`${t}:${n}`}return be(e)}function z(e,t){const n=e.map(m=>m.penalty==="DNF"?1/0:m.penalty==="+2"?m.time+2:m.time);let o=null,s=null;if(t==="ao5"){if(n.filter(p=>p===1/0).length>=2)return{dnf:!0};const c=[...n].sort((p,S)=>p-S);o=c[0],s=c[c.length-1];const b=c.slice(1,4);let x=null;b.includes(1/0)?x="DNF":x=b.reduce((p,S)=>p+S,0)/b.length;const F=n.filter(p=>p!==1/0),me=F.reduce((p,S)=>p+S,0)/F.length,fe=F.reduce((p,S)=>p+Math.pow(S-me,2),0)/F.length,U=Math.sqrt(fe);if(c.length===4){const p=(c[0]+c[1]+c[2])/3,S=(c[3]+c[2]+c[1])/3;return{dnf:!1,avg:x,best:o,worst:s,sigma:U,bpAo5:p,wpA05:S}}return{dnf:!1,avg:x,best:o,worst:s,sigma:U}}if(n.filter(m=>m===1/0).length>=1)return{dnf:!0};const l=n.reduce((m,c)=>m+c,0)/n.length,u=n.reduce((m,c)=>m+Math.pow(c-l,2),0)/n.length,v=Math.sqrt(u);return o=Math.min(...n),s=Math.max(...n),{dnf:!1,avg:l,best:o,worst:s,sigma:v}}function se(e,t,n){let o=null;n===16?o="+2":n===17&&(o="DNF");const s=ne(e);i.solvesArray.push({time:s,penalty:o||null,scramble:t,inspection:n,createdAt:Date.now()}),i.solveCounter++;const r=i.mode==="ao5"?5:3;if(i.solveCounter===r){const l=z(i.solvesArray,i.mode),u={mode:i.mode,average:l.avg==="DNF"?"DNF":g(l.avg),worst:g(l.worst),best:g(l.best),sigma:g(l.sigma),solves:structuredClone(i.solvesArray)};return i.solvesArray=[],i.solveCounter=0,u}return null}const d={sessions:JSON.parse(localStorage.getItem("sessions"))||{Default:{averages:[]}},currentSession:localStorage.getItem("currentSession")||"Default",selectEl:document.getElementById("sessionSelect")},Ee=y();i.mode=Ee.mode||"ao5";document.getElementById("modeBtn").textContent="Mode: "+i.mode;function E(){localStorage.setItem("sessions",JSON.stringify(d.sessions)),localStorage.setItem("currentSession",d.currentSession)}function y(){return d.sessions[d.currentSession]||(d.sessions[d.currentSession]={averages:[]}),d.sessions[d.currentSession]}function A(){const e=d.selectEl;e.innerHTML="",Object.keys(d.sessions).forEach(n=>{const o=document.createElement("option");o.value=n,o.textContent=n,n===d.currentSession&&(o.selected=!0),e.appendChild(o)});const t=document.createElement("option");t.disabled=!0,t.textContent="────────────",e.appendChild(t),e.appendChild(new Option("➕ New session...","__new__")),e.appendChild(new Option("✏ Rename current...","__rename__")),e.appendChild(new Option("🗑 Delete current...","__delete__"))}function P(e){d.currentSession=e,E(),A(),document.dispatchEvent(new CustomEvent("sessionChanged"))}d.selectEl.onchange=()=>{const e=d.selectEl.value;if(e==="__new__"){const t=prompt("New session name:");if(!t||d.sessions[t]){A();return}d.sessions[t]={averages:[]},P(t);return}if(e==="__rename__"){const t=d.currentSession,n=prompt("Rename session:",t);if(!n||n===t||d.sessions[n]){A();return}d.sessions[n]=d.sessions[t],delete d.sessions[t],P(n);return}if(e==="__delete__"){if(Object.keys(d.sessions).length===1){alert("You must have at least one session."),A();return}if(!confirm("Delete current session?")){A();return}delete d.sessions[d.currentSession];const t=Object.keys(d.sessions)[0];P(t);return}P(e)};A();function Be(){const e=y();i.mode=i.mode==="ao5"?"mo3":"ao5",e.mode=i.mode,E(),document.getElementById("modeBtn").textContent="Mode: "+i.mode,i.solvesArray=[],i.scramblesArray=[],i.solveCounter=0}function Se(){confirm("Delete all averages in this session?")&&(Ce(),i.solvesArray=[],i.scramblesArray=[],i.solveCounter=0)}function we(){const e=y();i.mode=e.mode||"ao5",document.getElementById("modeBtn").textContent="Mode: "+i.mode,i.solvesArray=[],i.scramblesArray=[],i.solveCounter=0}const w=document.getElementById("detailsModal"),Ie=document.getElementById("modalBody"),$e=document.getElementById("closeModalBtn");$e.onclick=()=>w.classList.add("hidden");w.onclick=e=>{e.target===w&&w.classList.add("hidden")};function V(){const e=D();let t='<h3 class="modal-title">Session averages</h3>';e.forEach((n,o)=>{t+=`
            <div class="modal-average-card">
                <div class="modal-average-header">
                    <b>${n.mode} #${e.length-o}: ${n.average}</b>
                </div>

                <div class="modal-solves">
        `,n.solves.forEach((s,r)=>{t+=`
                <div class="modal-solve-row">
                    <div class="modal-solve-main">
                        <span>#${r+1}: ${M(s)}</span>

                        <div class="modal-solve-actions">
                            <button onclick="setPenalty(${o}, ${r}, null)">OK</button>
                            <button onclick="setPenalty(${o}, ${r}, '+2')">+2</button>
                            <button onclick="setPenalty(${o}, ${r}, 'DNF')">DNF</button>
                            <button onclick="removeSolve(${o}, ${r})">✖</button>
                        </div>
                    </div>

                    <div class="modal-scramble">
                        ${n.solves[r].scramble}
                    </div>
                </div>
            `}),t+=`
                </div>
            </div>
        `}),Ie.innerHTML=t,w.classList.remove("hidden")}function Ae(){const e=y();e.averages||(e.averages=[])}function oe(e){Ae(),y().averages.unshift(e),E()}function Ce(){const e=y();e.averages=[],E()}function D(){return y().averages||[]}function re(){if(i.solvesArray.length>0)return{type:"current",solveIndex:i.solvesArray.length-1};const e=D();if(e.length===0)return null;const t=0,n=e[0];return!n||n.solves.length===0?null:{type:"saved",blockIndex:t,solveIndex:n.solves.length-1}}function Le(e,t,n){const s=D()[e];s.solves[t].penalty=n;const r=z(s.solves,s.mode).avg;s.average=r==="DNF"?"DNF":g(r),E()}function Me(e,t){const n=D();if(e===-1){if(t<0||t>=i.solvesArray.length)return;i.solvesArray.splice(t,1),i.solveCounter--,i.solveCounter<0&&(i.solveCounter=0);return}const o=n[e];if(e===0&&i.solvesArray.length===0){const r=o.solves.filter((l,u)=>u!==t);i.solvesArray=structuredClone(r),i.solveCounter=r.length,n.splice(e,1),w.classList.add("hidden"),E();return}if(confirm(`This solve belongs to a finished average.

OK = Replace this solve (reopen average)
Cancel = Delete the whole average`)){const r=o.solves.filter((l,u)=>u!==t);i.solvesArray=structuredClone(r),i.solveCounter=r.length,n.splice(e,1),w.classList.add("hidden"),E();return}confirm("Delete the entire average? This cannot be undone.")&&(n.splice(e,1),E())}function W(e){const t=re();t&&(t.type==="current"?i.solvesArray[t.solveIndex].penalty=e:window.setPenalty(t.blockIndex,t.solveIndex,e))}function Te(){const e=re();e&&(e.type==="current"?window.removeSolve(-1,e.solveIndex,!0):window.removeSolve(e.blockIndex,e.solveIndex,!0))}const De=-180,_=De*60*1e3;function xe(e=Date.now()){const t=new Date(e+_);return t.setUTCHours(0,0,0,0),t.getTime()-_}function Fe(e=Date.now()){const t=new Date(e+_);return t.setUTCHours(23,59,59,999),t.getTime()-_}function ie(e){const t=[];return e.averages.forEach(n=>{n.solves.forEach(o=>{t.push(o)})}),i.solvesArray.forEach(n=>t.push(n)),t}function le(e,t){let n=[],o=[],s=0;if(t.averages.forEach(c=>{c.average!=="DNF"&&o.push(ne(c.average))}),e.forEach(c=>{console.log(new Date(c.createdAt)),c.penalty===null?(n.push(c.time),s++):(c.penalty==="+2"&&n.push(c.time+2),s++)}),n.length===0)return{bestTime:0,mean:0,sigma:0,bestAvg:0,solveCounter:s};const r=o.length?Math.min(...o):0,l=Math.min(...n),u=n.reduce((c,b)=>c+b,0)/n.length,v=n.reduce((c,b)=>c+Math.pow(b-u,2),0)/n.length,m=Math.sqrt(v);return{bestTime:l,mean:u,sigma:m,bestAvg:r,solveCounter:s}}function Pe(e,t){const n=Date.now();let o,s;return o=xe(n),s=Fe(n),e.filter(r=>r.createdAt>=o&&r.createdAt<=s)}function ae(){const e=y(),t=ie(e);return le(t,e)}function _e(e){const t=y(),n=ie(t),o=Pe(n);return le(o,t)}function Ne(){const e=ae();document.getElementById("stat-solves").textContent=e.solveCounter,document.getElementById("stat-best-time").textContent=g(e.bestTime),document.getElementById("stat-mean").textContent=g(e.mean),document.getElementById("stat-sigma").textContent=g(e.sigma),document.getElementById("stat-best-avg").textContent=g(e.bestAvg);const t=y(),n=document.getElementById("avg-table-head"),o=document.getElementById("avg-history-body");n.innerHTML="",o.innerHTML="";let s=0;t.averages.forEach(l=>{l.solves.length>s&&(s=l.solves.length)});let r="<tr><th>#</th><th>Type</th><th>Avg</th>";for(let l=0;l<s;l++)r+=`<th>${l+1}</th>`;r+=`
    <th>Best</th>
    <th>Worst</th>
    <th>σ</th>
  </tr>`,n.innerHTML=r,t.averages.forEach((l,u)=>{const v=document.createElement("tr");let m=`
      <td>${t.averages.length-u}</td>
      <td>${l.mode.toUpperCase()}</td>
      <td><strong>${l.average}</strong></td>
    `;l.solves.forEach(b=>{m+=`<td>${M(b)}</td>`});const c=s-l.solves.length;for(let b=0;b<c;b++)m+="<td></td>";m+=`
      <td>${l.best}</td>
      <td>${l.worst}</td>
      <td>${l.sigma}</td>
    `,v.innerHTML=m,o.appendChild(v)})}function Oe(e,t){let n="";return e==="live"&&(n+=`
            <div class="history-average current-average">
                <div class="history-solves">
        `,i.solvesArray.forEach((o,s)=>{n+=`
                <div class="history-solve">
                    ${s+1} - ${M(o)}
                </div>
            `}),n+=`
                </div>
            </div>
        `),e==="saved"&&t&&(n+=`
            <div class="history-average current-average">
                <div class="history-solves">
        `,t.solves.forEach((o,s)=>{n+=`
                <div class="history-solve">
                    ${s+1} - ${M(o)}
                </div>
            `}),n+=`
                </div>
            </div>
        `),n}function ke(e,t){let n="";for(let o=0;o<e.length;o++){const s=e[o];t==="saved"&&o===0||(n+=`
            <div class="history-block history-average">
                <div class="history-solves">
        `,s.solves.forEach((r,l)=>{n+=`
                <div class="history-solve">
                    ${l+1} - ${M(r)}
                </div>
            `}),n+=`
                </div>
                <div class="history-title">
                    ${s.mode}: ${s.average}
                </div>
            </div>
        `)}return n}function Z(e){return`
        Best single: ${e.bestTime!==1/0?g(e.bestTime):"-"}
        <br>
        Best ao5: ${e.bestAvg!==1/0?g(e.bestAvg):"-"}
        <br>
        Session Mean: ${e.mean?g(e.mean):"-"}
        <br>
        Session &sigma;: ${e.sigma?g(e.sigma):"-"}
        <br>
        Solves: ${e.solveCounter?e.solveCounter:"-"}
    `}function He({type:e,solves:t,mode:n,block:o}){if(e==="live"){if(!t||t.length===0)return"";const s=z(t,n),r=s.best,l=s.worst,u=s.sigma,v=s.bpAo5,m=s.wpA05;return t.length===4&&n==="ao5"?`                
                Best: ${g(r)}
                <br>
                Worst: ${g(l)}
                <br>
                &sigma;: ${g(u)}
                <hr>
                bpAo5: ${g(v)}
                <br>
                wpAo5: ${g(m)}
            `:`                
            Best: ${g(r)}
            <br>
            Worst: ${g(l)}
            <br>
            &sigma;: ${g(u)}
        `}return e==="saved"&&o?`                
            Best: ${o.best}
            <br>
            Worst: ${o.worst}
            <br>
            &sigma;: ${o.sigma}
            <hr>
            ${o.mode}: ${o.average}
        `:""}function B(){const e=D(),t=ae(),n=_e(),o=document.getElementById("currentAverageValue"),s=document.getElementById("historyPanel"),r=document.getElementById("current-stats"),l=document.getElementById("stats"),u=document.getElementById("today-stats");let v=null,m=null;i.solvesArray.length>0?v="live":e.length>0&&(v="saved",m=e[0]),o&&(o.innerHTML=Oe(v,m)),r&&(r.innerHTML=He({type:v,solves:i.solvesArray,mode:i.mode,block:m})),s&&(s.innerHTML=ke(e,v)),l&&(l.innerHTML=Z(t),u.innerHTML=Z(n))}const N=document.getElementById("eventSelect");let h=y().scrambleType||"333",I=null;window.innerWidth>768?I=document.querySelector("#scrambleVis"):I=document.querySelector("#scrambleVis2");const qe=y();h=qe.scrambleType||"333";N.value=h;R(h);T(h,I);N.addEventListener("change",()=>{const e=y();h=N.value,e.scrambleType=h,E(),R(h),T(h,I)});document.addEventListener("sessionChanged",()=>{h=y().scrambleType||"333",N.value=h,R(h),T(h,I)});function $(e,t){e==="color"?document.getElementById("timer").style.color=t:e==="time"&&(document.getElementById("timer").textContent=t)}function ce(){const e=document.getElementById("timer"),t=document.getElementById("touchOverlay");if(!e||!t)return;function n(o){o===e||o===t||(o.contains(e)?[...o.children].forEach(n):o.classList.add("focus-hidden"))}n(document.body)}function de(){document.querySelectorAll(".focus-hidden").forEach(e=>{e.classList.remove("focus-hidden")})}let L=!1;document.getElementById("touchOverlay").addEventListener("touchstart",e=>{if(e.preventDefault(),!e.repeat){if(L){document.querySelector(".panel-cube2").style.display="none",document.getElementById("scramble-button").innerHTML="Scramble visualizer",L=!1;return}if(Y(),a.timerPhase===1&&!a.inspecting&&X(),a.timerPhase===3){te();const t=se(document.getElementById("timer").innerHTML,j,a.inspection);t&&(oe(t),console.log(t)),B(),T(h,I),de()}}});document.getElementById("touchOverlay").addEventListener("touchend",e=>{e.preventDefault(),!e.repeat&&(a.timerPhase===1&&Q(),a.timerPhase===2&&(ee(),ce()))});document.addEventListener("keydown",e=>{if(e.key===" "){if(e.preventDefault(),e.repeat)return;Y()}if(e.key===" "&&a.timerPhase===1&&!a.inspecting&&X(),e.key===" "&&a.timerPhase===3){te();const t=se(document.getElementById("timer").innerHTML,j,a.inspection);t&&(oe(t),console.log(t)),B(),T(h,I),de()}});document.addEventListener("keyup",e=>{e.preventDefault(),!e.repeat&&(e.key===" "&&a.timerPhase===1&&Q(),e.key===" "&&a.timerPhase===2&&(ee(),ce()))});const ue=document.getElementById("stats-page"),je=document.getElementById("open-stats-btn"),ze=document.getElementById("close-stats-btn");je.addEventListener("click",()=>{Ne(),ue.classList.add("open")});ze.addEventListener("click",()=>{ue.classList.remove("open")});function R(e){const t=y(),o=Ve(e)?"mo3":"ao5";i.mode!==o&&(i.mode=o,t.mode=o,document.getElementById("modeBtn").textContent="Mode: "+o,i.solvesArray=[],i.solveCounter=0,E())}function Ve(e){return["333bf","444bf","555bf","666","777"].includes(e)}document.getElementById("modeBtn").addEventListener("click",()=>{Be(),B()});document.getElementById("scramble-button").addEventListener("click",()=>{if(L){document.querySelector(".panel-cube2").style.display="none",document.getElementById("scramble-button").innerHTML="Scramble visualizer",L=!1;return}L=!0,document.querySelector(".panel-cube2").style.display="grid",document.getElementById("scramble-button").innerHTML="close"});const C={modeBtn:document.getElementById("modeBtn"),clearBtn:document.getElementById("clearBtn"),openSessionBtn:document.getElementById("modal-button"),penaltyOkBtn:document.getElementById("penaltyOkBtn"),penaltyPlus2Btn:document.getElementById("penaltyPlus2Btn"),penaltyDnfBtn:document.getElementById("penaltyDnfBtn"),removeLastBtn:document.getElementById("removeLastBtn")};document.querySelectorAll("button").forEach(e=>{e.addEventListener("click",()=>{e.blur()})});document.querySelectorAll("select").forEach(e=>{e.addEventListener("change",()=>{e.blur()})});window.setPenalty=function(e,t,n){Le(e,t,n),E(),B(),w.classList.contains("hidden")||V()};window.removeSolve=function(e,t){Me(e,t),E(),B(),w.classList.contains("hidden")||V()};document.addEventListener("sessionChanged",()=>{we(),B()});C.clearBtn.onclick=()=>{Se(),B()};C.openSessionBtn.onclick=V;C.penaltyOkBtn.onclick=()=>{W(null),B()};C.penaltyPlus2Btn.onclick=()=>{W("+2"),B()};C.penaltyDnfBtn.onclick=()=>{W("DNF"),B()};C.removeLastBtn.onclick=()=>Te();B();
