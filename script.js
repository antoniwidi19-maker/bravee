(function(){
var ns="http://www.w3.org/2000/svg",st=document.getElementById("stars"),g=document.getElementById("grid"),i,s,seed=7;
function r(){seed=(seed*16807)%2147483647;return seed/2147483647}
for(i=0;i<160;i++){
  s=document.createElementNS(ns,"circle");
  s.setAttribute("cx",r()*1600);s.setAttribute("cy",r()*900);s.setAttribute("r",r()*1.6+.3);
  s.style.setProperty("--d",(2+r()*4)+"s");      // durasi kelap-kelip
  s.style.setProperty("--l",(-r()*6)+"s");       // delay acak
  st.appendChild(s)
}
for(i=-8;i<=8;i++){s=document.createElementNS(ns,"line");s.setAttribute("x1",800+i*40);s.setAttribute("y1",520);s.setAttribute("x2",800+i*260);s.setAttribute("y2",900);g.appendChild(s)}
for(i=0;i<6;i++){s=document.createElementNS(ns,"line");var y=520+Math.pow(i/5,2)*380;s.setAttribute("x1",0);s.setAttribute("x2",1600);s.setAttribute("y1",y);s.setAttribute("y2",y);g.appendChild(s)}
var track=document.getElementById("track"),sc=[].slice.call(document.querySelectorAll(".scene")),caps=[].slice.call(document.querySelectorAll(".cap")),dots=[].slice.call(document.querySelectorAll(".prog i")),hint=document.getElementById("hint");
function clamp(v){return Math.max(0,Math.min(1,v))}
function update(){
  var max=track.offsetHeight-innerHeight,p=clamp(-track.getBoundingClientRect().top/max),n=sc.length,pos=p*(n-1)+.0001,idx=Math.round(pos);
  sc.forEach(function(el,k){
    var d=pos-k,op=clamp(1-Math.abs(d)1.6),scale=1+(d>0?d.6:d*.15);
    el.style.opacity=op;el.style.transform="scale("+scale+")";el.style.zIndex=op>.5?2:1
  });
  caps.forEach(function(c){c.classList.toggle("on",+c.dataset.i===idx&&Math.abs(pos-idx)<.3)});
  dots.forEach(function(d,k){d.classList.toggle("on",k===idx)});
  hint.style.opacity=p<.03?1:0
}
addEventListener("scroll",update,{passive:true});addEventListener("resize",update);update()
})();
