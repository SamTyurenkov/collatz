(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))o(s);new MutationObserver(s=>{for(const i of s)if(i.type==="childList")for(const u of i.addedNodes)u.tagName==="LINK"&&u.rel==="modulepreload"&&o(u)}).observe(document,{childList:!0,subtree:!0});function n(s){const i={};return s.integrity&&(i.integrity=s.integrity),s.referrerPolicy&&(i.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?i.credentials="include":s.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function o(s){if(s.ep)return;s.ep=!0;const i=n(s);fetch(s.href,i)}})();const q="collatz.app",G={startN:27};let I={...G};const X=new Set;function Z(){try{const e=localStorage.getItem(q);if(!e)return;const t=JSON.parse(e);typeof t.startN=="number"&&t.startN>=1&&(I={...G,...t})}catch{}}function tt(){try{localStorage.setItem(q,JSON.stringify(I))}catch{}}function R(){const e=O();X.forEach(t=>t(e))}function et(){Z(),R()}function O(){return{...I}}function nt(e){const t=Math.floor(Number(e));!Number.isFinite(t)||t<1||(I={...I,startN:t},tt(),R())}function k(e){return X.add(e),()=>X.delete(e)}function H(e){const t=Math.floor(Number(e));if(!Number.isFinite(t)||t<1)return[];const n=[t];let o=t;const s=5e5;let i=0;for(;o!==1&&i<s;)o%2===0?o=o/2:o=3*o+1,n.push(o),i++;return n}const st=`<section class="section-start-input" aria-labelledby="start-input-label">
  <h1>Informal proof of Collatz conjecture</h1>
  <label class="start-input-label" id="start-input-label" for="collatz-start-input">
    Positive integer
  </label>
  <input
    type="text"
    id="collatz-start-input"
    inputmode="numeric"
    autocomplete="off"
    aria-describedby="start-input-desc"
  />
  <p class="start-input-desc" id="start-input-desc">
    This value is the starting positive integer used to explore the Collatz map: apply “if even, divide by two; if odd, multiply by three and add one,” and repeat. The conjecture claims every such starting value eventually reaches 1.
  </p>
  <details class="start-steps-accordion">
    <summary>Show all trajectory steps</summary>
    <div class="start-steps-wrap">
      <table class="start-steps-table" aria-label="Trajectory steps table">
        <thead>
          <tr>
            <th>Step</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody id="start-steps-body"></tbody>
      </table>
    </div>
  </details>
</section>
`;function ot(e){const t=e.trim();if(t==="")return null;const n=Number(t);return!Number.isFinite(n)||!Number.isInteger(n)||n<1?null:n}function it(e){e.innerHTML=st;const t=e.querySelector("#collatz-start-input"),n=e.querySelector("#start-steps-body");function o(a){return a.replace(/\D+/g,"")}function s(){const a=o(t.value);t.value=a;const c=ot(a);return c!==null?(nt(c),!0):!1}function i(){t.value=String(O().startN)}function u(a){const c=H(a),r=document.createDocumentFragment();for(let l=0;l<c.length;l++){const d=document.createElement("tr");d.innerHTML=`<td>${l}</td><td>${c[l]}</td>`,r.appendChild(d)}n.innerHTML="",n.appendChild(r)}t.addEventListener("input",()=>{s()}),t.addEventListener("change",()=>{s()}),t.addEventListener("keydown",a=>{a.key==="Enter"&&(s(),t.blur())}),t.addEventListener("blur",()=>{s()||i()}),k(a=>{document.activeElement!==t&&(t.value=String(a.startN)),u(a.startN)}),i(),u(O().startN)}const rt=`<section class="section-dual-graph" aria-labelledby="dual-graph-heading">
  <h2 id="dual-graph-heading">Consider sets instead of a tree</h2>
  <div class="dual-graph-pair" role="group" aria-label="Two views of the same grid">
    <figure class="dual-graph-figure">
      <figcaption>Classic inverse Collatz tree toward 1</figcaption>
      <svg
        class="dual-graph-svg dual-graph-svg-path"
        id="dual-graph-svg-path"
        viewBox="0 0 380 260"
        width="380"
        height="260"
        aria-hidden="true"
      ></svg>
    </figure>
    <figure class="dual-graph-figure">
      <figcaption>
        Sets visualized instead of tree
      </figcaption>
      <svg
        class="dual-graph-svg dual-graph-svg-structure"
        id="dual-graph-svg-structure"
        viewBox="0 0 380 260"
        width="380"
        height="260"
        aria-hidden="true"
      ></svg>
    </figure>
  </div>
  <div class="dual-graph-tooltip" id="dual-graph-tooltip" hidden></div>
  <p class="dual-graph-note" id="dual-graph-note" hidden></p>
  <ul>
    <li>green line - direct connection between steps</li>
    <li>yellow line - connection between sets via 3n+1</li>
    <li>red line - connection between starting number and first visible step on the graph</li>
  </ul>
  <h3>How do the sets relate to Collatz conjecture?</h3>
  <code>
    <pre>
      S<sub>n</sub> = {n, 2n, 4n, ...}
    </pre>
  </code>
  <p>
    There is only one odd number in every set, and all its doubled variations to infinity, this means there is only one exit from every set to another set (except set with 1).
  </p>
  <p>
    There is only one self-looping set with odd integer 1. because in all other cases of odd integers 2n < 3n+1 < 4n, resulting in a step into a different set.
  </p>
  <p>
    Every set starting with n > 1 has only one exit to a different set, but every set also has infinite number of enters via doubled values. this results in a "n" being not important to grow of reduce, because even if it grows to infinity the entry points to the S<sub>1</sub> also grows to infinity and any S<sub>i</sub>which is already connected to S<sub>1</sub> via 3n+1 operation, this makes "n" not important to grow of reduce, because there is infinite amount of entry points to other sets. So we ignore its chaotic behavior.
  </p>
  <h3>What needs additional proof?</h3>
  <p>1. There is no looping sets, except S<sub>1</sub>.</p>
  <p>To prove that, lets consider there exist any other self-looping set. for example S<sub>z</sub> leading to S<sub>z1</sub> which leads to S<sub>z2</sub> which leads back to S<sub>z</sub>.</p>
  <p>If that self-looping set existed, than because of infinite enters nature - it would effectifely result in 75% of numbers leading into the that self-looping set, because it has 3 times more enters than S<sub>1</sub> alone. We do not observe such behaviour currently. And this is just one additional looping set. Imagine tens of looping sets existed - than 90%+ of all numbers would lead into those loopholes.</p>
  <p>To summarize, the logic - if a looping set exists, it also inherits catch-up all nature similar to S<sub>1</sub>, because of inifinite enters and no exit.</p>

  <p>2. There cannot be infinite amount of steps, resulting in path never leading to S<sub>1</sub>.</p>
  <p>For the sets it doesn't matter if "n" grows to a very big number, because every set which leads to S<sub>1</sub> also has infinite amount of enters.</p>
  <p>Since there is no other catch-up all sets, or looping sets, and there is infinite amount of enters in every set multiplied by amount of sets which already lead to S<sub>1</sub> - every step from any initial number may eventually lead to already tested set, just through a higher entrypoint.</p>
  <p>We already know that generally there is a chaotic pattern in "n" value going up and down. and this particular pattern leads to S<sub>1</sub> in the long run.</p>
  <p>Lets look at the worst case, where odd value grows after every 3n+1, this can only happen if the division by 2 step occurs only once and immediately leads to a next odd number.</p>
  <code>
    <pre> 
      n<sub>x</sub> > n<sub>x-1</sub> <br>
      only true if there is only one division step k after 3n+1 step.
    </pre>
  </code>
  <p>For the growth step to happen, there is a condition, as not all odd numbers lead to growth, only about a half of observable odd integers, e.g.</p>
  <code>
    <pre>
      n ≡ 3 mod 4<br>  
      ...3, 7, 11, 15, 19, ... (every second odd number)<br>
      works when 3n+1 is divisible by 2 exactly once (not 2, 3, 4, etc.)
    </pre>
  </code>

  <p>But for consequtive growth the condition becomes even stricter with every step:</p>
  <code>
    <pre>
      n ≡ 2<sup>r</sup> - 1 (mod 2<sup>r</sup>) <br>
      where r consequtive growth steps
    </pre>
  </code>
  <p>So the probability of consequtive growth of odd number is:</p>
  <code>
    <pre>
      1 / 2<sup>r</sup>
    </pre>
  </code>
  <p>This proves chaotic pattern of odd "n" values going up and down is stable for any initial odd number, and having a predictable increasing chance to enter into already tested S<sub>i</sub> sets.</p>
</section>
`,at=17,_=2500,V=Array.from({length:at},(e,t)=>t+1).filter(e=>e%2===1);function lt(e){let t=0,n=e;for(;n*2<=_;)n*=2,t++;return t}const U=Math.max(...V.map(e=>lt(e))),j=52,W=42,D=92,Y=42,J=8,E=[];for(let e=0;e<V.length;e++){let n=V[e],o=0;for(;n<=_;)E.push({value:n,level:o,x:j+e*D,y:W+(U-o)*Y}),n*=2,o++}const S=new Set(E.map(e=>e.value)),N=Object.fromEntries(E.map(e=>[e.value,[e.x,e.y]])),ut=j*2+(V.length-1)*D,ct=W*2+U*Y,L={minX:Math.min(...E.map(e=>e.x)),maxX:Math.max(...E.map(e=>e.x)),minY:Math.min(...E.map(e=>e.y)),maxY:Math.max(...E.map(e=>e.y))};function P(e){let t=e;for(;t%2===0;)t/=2;return t}function dt(e){if((e-1)%3!==0)return null;const t=(e-1)/3;return!Number.isInteger(t)||t<=1||t%2===0?null:t}function ht(e){const t=new Map([[1,[]]]),n=new Map([[1,null]]),o=new Map([[1,0]]),s=[1];let i=0;for(;i<s.length;){const g=s[i++],b=[],w=g*2;w<=e&&b.push(w);const x=dt(g);x!==null&&x<=e&&b.push(x),b.sort((v,z)=>v-z),t.set(g,b);for(const v of b)n.has(v)||(n.set(v,g),o.set(v,o.get(g)+1),t.has(v)||t.set(v,[]),s.push(v))}const u=new Map;for(const[g,b]of o.entries())u.has(b)||u.set(b,[]),u.get(b).push(g);for(const g of u.values())g.sort((b,w)=>b-w);const a=Math.max(...o.values()),c=Math.max(...Array.from(u.values(),g=>g.length-1)),r=36,l=34,d=46,h=26,f=r*2+a*d+Math.max(0,c)*h,p=l*2+a*52,y=new Map,A=Array.from(n.keys()),T=Math.max(...A),B=Math.max(1,p-l*2);for(const[g,b]of u.entries())for(let w=0;w<b.length;w++){const x=b[w],v=r+g*d+w*h,z=p-l-x/T*B;y.set(x,[v,z])}for(const g of A){if(y.has(g))continue;const b=o.get(g),w=r+b*d,x=p-l-g/T*B;y.set(g,[w,x])}return{nodes:A,depthByNode:o,childrenByNode:t,parentByNode:n,positions:y,width:f,height:p}}const m=ht(_),C=m.positions,$=new Set(m.nodes);function pt(){const e=[];for(const t of S){const n=t*2;S.has(n)&&e.push([t,n])}return e}function ft(){const e=[];for(const t of S){if(t%2===0)continue;const n=3*t+1;S.has(n)&&P(n)!==P(t)&&e.push([t,n])}return e}const gt=pt(),bt=ft();function mt(e){const t=[];for(let n=0;n<e.length-1;n++){const o=e[n],s=e[n+1];S.has(o)&&S.has(s)&&t.push([o,s])}return t}function yt(e){const t=[];for(let n=0;n<e.length-1;n++){const o=e[n],s=e[n+1];!$.has(o)||!$.has(s)||(m.parentByNode.get(o)===s||m.parentByNode.get(s)===o)&&t.push([o,s])}return t}function wt(e){const t=new Map;for(let n=0;n<e.length;n++){const o=e[n];t.has(o)||t.set(o,n)}return t}function F(e,t){for(let n=0;n<e.length;n++)if(t.has(e[n]))return n;return-1}function M(e,t,n,o,s){const i=document.createElementNS("http://www.w3.org/2000/svg","line");return i.setAttribute("x1",String(e)),i.setAttribute("y1",String(t)),i.setAttribute("x2",String(n)),i.setAttribute("y2",String(o)),i.setAttribute("class",s),i}function vt(e,t){const n=document.createElementNS("http://www.w3.org/2000/svg","g");n.setAttribute("class","dual-graph-nodes");const o=Array.from(e).sort((s,i)=>{const u=m.depthByNode.get(s)??0,a=m.depthByNode.get(i)??0;return u!==a?u-a:s-i});for(const s of o){const[i,u]=C.get(s),a=document.createElementNS("http://www.w3.org/2000/svg","circle");a.setAttribute("cx",String(i)),a.setAttribute("cy",String(u)),a.setAttribute("r","6.5"),a.setAttribute("class","dual-graph-node"),a.setAttribute("data-value",String(s));const c=t.get(s);a.setAttribute("data-step",c==null?"":String(c));const r=document.createElementNS("http://www.w3.org/2000/svg","text");r.setAttribute("x",String(i)),r.setAttribute("y",String(u-9)),r.setAttribute("text-anchor","middle"),r.setAttribute("class","dual-graph-node-label"),r.textContent=String(s),n.appendChild(a),n.appendChild(r)}return n}function St(e){const t=new Set;for(const n of e){if(!S.has(n))continue;t.add(n);const o=n/2,s=n*2;if(Number.isInteger(o)&&S.has(o)&&t.add(o),S.has(s)&&t.add(s),n%2===1){const i=3*n+1;S.has(i)&&t.add(i)}else if((n-1)%3===0){const i=(n-1)/3;i>0&&i%2===1&&S.has(i)&&t.add(i)}}return t}function xt(e){const t=new Set;for(const n of e){if(!$.has(n))continue;t.add(n);const o=m.parentByNode.get(n);o!=null&&t.add(o);const s=m.childrenByNode.get(n)??[];for(const i of s)t.add(i)}if(!t.size){t.add(1);const n=m.childrenByNode.get(1)??[];for(const o of n)t.add(o)}return t}function At(e){if(!e.size)return`0 0 ${ut} ${ct}`;let t=1/0,n=-1/0,o=1/0,s=-1/0;for(const l of e){const[d,h]=N[l];d<t&&(t=d),d>n&&(n=d),h<o&&(o=h),h>s&&(s=h)}const i=D*.9,u=Y*1.1,a=J*2;t=Math.max(t-i,L.minX-a),n=Math.min(n+i,L.maxX+a),o=Math.max(o-u,L.minY-a),s=Math.min(s+u,L.maxY+a);let c=n-t,r=s-o;if(c<180){const l=(180-c)/2;t-=l,n+=l,c=180}if(r<180){const l=(180-r)/2;o-=l,s+=l,r=180}return`${t} ${o} ${c} ${r}`}function Nt(e){if(!e.size)return`0 0 ${m.width} ${m.height}`;let t=1/0,n=-1/0,o=1/0,s=-1/0;for(const r of e){const l=C.get(r);if(!l)continue;const[d,h]=l;d<t&&(t=d),d>n&&(n=d),h<o&&(o=h),h>s&&(s=h)}const i=85,u=70;t=Math.max(0,t-i),o=Math.max(0,o-u),n=Math.min(m.width,n+i),s=Math.min(m.height,s+u);let a=n-t,c=s-o;if(a<250){const r=(250-a)/2;t=Math.max(0,t-r),n=Math.min(m.width,n+r),a=n-t}if(c<220){const r=(220-c)/2;o=Math.max(0,o-r),s=Math.min(m.height,s+r),c=s-o}return`${t} ${o} ${a} ${c}`}function Et(e){const t=document.createElementNS("http://www.w3.org/2000/svg","g");t.setAttribute("class","dual-graph-nodes");for(const{value:n,x:o,y:s}of E){const i=document.createElementNS("http://www.w3.org/2000/svg","circle");i.setAttribute("cx",String(o)),i.setAttribute("cy",String(s)),i.setAttribute("r",String(J)),i.setAttribute("class","dual-graph-node"),i.setAttribute("data-value",String(n));const u=e.get(n);i.setAttribute("data-step",u==null?"":String(u));const a=document.createElementNS("http://www.w3.org/2000/svg","text");a.setAttribute("x",String(o)),a.setAttribute("y",String(s+3)),a.setAttribute("text-anchor","middle"),a.setAttribute("class","dual-graph-node-label"),a.textContent=String(n),t.appendChild(i),t.appendChild(a)}return t}function K(e,t){e.setAttribute("viewBox",t),e.setAttribute("preserveAspectRatio","xMidYMid meet")}function Ct(e){const[t,n,o,s]=e.split(" ").map(Number);return{minX:t,minY:n,width:o,height:s}}function Q(e,t,n,o,s){const i="http://www.w3.org/2000/svg",{minX:u,minY:a,width:c,height:r}=Ct(t),l=u+c*.88,d=a+r*.12,h=document.createElementNS(i,"g");if(h.setAttribute("class","dual-graph-layer-external"),o){const[y,A]=o;h.appendChild(M(l,d,y,A,"dual-graph-edge-external"))}const f=document.createElementNS(i,"circle");f.setAttribute("cx",String(l)),f.setAttribute("cy",String(d)),f.setAttribute("r","7"),f.setAttribute("class","dual-graph-node dual-graph-node-external"),f.setAttribute("data-value",String(n)),f.setAttribute("data-step","0"),h.appendChild(f);const p=document.createElementNS(i,"text");p.setAttribute("x",String(l-10)),p.setAttribute("y",String(d-10)),p.setAttribute("text-anchor","end"),p.setAttribute("class","dual-graph-node-label dual-graph-node-label-external"),p.textContent=s>0?`start ${n} -> +${s} step(s)`:`start ${n}`,h.appendChild(p),e.appendChild(h)}function Mt(e,t,n,o,s,i){e.innerHTML="",K(e,o);const u="http://www.w3.org/2000/svg",a=document.createElementNS(u,"g");a.setAttribute("class","dual-graph-layer-tree");for(const r of n){const[l,d]=C.get(r),h=m.childrenByNode.get(r)??[];for(const f of h){if(!n.has(f))continue;const[p,y]=C.get(f),A=f===r*2?"dual-graph-edge-double":"dual-graph-edge-bridge";a.appendChild(M(l,d,p,y,A))}}e.appendChild(a);const c=document.createElementNS(u,"g");c.setAttribute("class","dual-graph-layer-path");for(const[r,l]of t){const[d,h]=C.get(r),[f,p]=C.get(l);c.appendChild(M(d,h,f,p,"dual-graph-edge-path"))}if(e.appendChild(c),i){const r=i.targetValue!=null?C.get(i.targetValue):null;Q(e,o,i.startValue,r,i.skippedSteps)}e.appendChild(vt(n,s))}function Tt(e,t,n,o,s){e.innerHTML="",K(e,n);const i="http://www.w3.org/2000/svg",u=document.createElementNS(i,"g");u.setAttribute("class","dual-graph-layer-double");for(const[r,l]of gt){const[d,h]=N[r],[f,p]=N[l];u.appendChild(M(d,h,f,p,"dual-graph-edge-double"))}e.appendChild(u);const a=document.createElementNS(i,"g");a.setAttribute("class","dual-graph-layer-bridge");for(const[r,l]of bt){const[d,h]=N[r],[f,p]=N[l];a.appendChild(M(d,h,f,p,"dual-graph-edge-bridge"))}e.appendChild(a);const c=document.createElementNS(i,"g");c.setAttribute("class","dual-graph-layer-pathoverlay");for(const[r,l]of t){const[d,h]=N[r],[f,p]=N[l];c.appendChild(M(d,h,f,p,"dual-graph-edge-path"))}if(e.appendChild(c),s){const r=s.targetValue!=null?N[s.targetValue]:null;Q(e,n,s.startValue,r,s.skippedSteps)}e.appendChild(Et(o))}function It(e){e.innerHTML=rt;const t=e.querySelector("#dual-graph-svg-path"),n=e.querySelector("#dual-graph-svg-structure"),o=e.querySelector("#dual-graph-tooltip"),s=e.querySelector("#dual-graph-note");function i(){o.hidden=!0}function u(c,r,l,d){o.textContent=r?`${c} (step ${r})`:`${c} (step -)`;const h=e.getBoundingClientRect();o.style.left=`${l-h.left+12}px`,o.style.top=`${d-h.top+12}px`,o.hidden=!1}e.addEventListener("mousemove",c=>{const r=c.target;if(!(r instanceof Element)){i();return}const l=r.closest(".dual-graph-node");if(!l){i();return}const d=l.getAttribute("data-value");if(!d){i();return}const h=l.getAttribute("data-step");u(d,h,c.clientX,c.clientY)}),e.addEventListener("mouseleave",i);function a(){const{startN:c}=O(),r=H(c),l=r[0],d=mt(r),h=yt(r),f=wt(r),p=F(r,S),y=F(r,$),A=St(r),T=xt(r),B=At(A),g=Nt(T),b=p!==0?{startValue:l,targetValue:p>0?r[p]:null,skippedSteps:p>0?p:0}:null,w=y!==0?{startValue:l,targetValue:y>0?r[y]:null,skippedSteps:y>0?y:0}:null;Mt(t,h,T,g,f,w),Tt(n,d,B,f,b);const x=d.length>0,v=l!=null&&S.has(l);!x&&l===1?(s.hidden=!1,s.textContent="Starting at 1, there is no Collatz step to draw on this diagram."):!x&&v?(s.hidden=!1,s.textContent="Your starting value is visible, but subsequent Collatz steps quickly leave this finite window. Try a value that stays in this window longer (for example 160, 96, or 48)."):!x&&!v?(s.hidden=!1,s.textContent="This window shows odd roots 1 to 17 with doubling values up to 2500. Choose a starting value from this window to see path segments."):(s.hidden=!0,s.textContent="")}k(()=>a()),a()}et();it(document.getElementById("section-start-input"));It(document.getElementById("section-dual-graph"));
