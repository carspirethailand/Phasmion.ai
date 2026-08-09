/* Cendon site — สคริปต์เดียวใช้ทุกหน้า ไม่มี dependency */
(function(){
  "use strict";
  var D=document, root=D.documentElement;

  /* ── ภาษา ─────────────────────────────────────────────────
     จำไว้ใน localStorage ครั้งแรกเดาจากภาษาเบราว์เซอร์      */
  function setLang(l){
    root.setAttribute("lang",l);
    try{localStorage.setItem("cendon.lang",l)}catch(e){}
    D.querySelectorAll("[data-th]").forEach(function(el){
      var v=el.getAttribute(l==="th"?"data-th":"data-en");
      if(v!=null) el.textContent=v;
    });
    D.querySelectorAll("[data-th-html]").forEach(function(el){
      var v=el.getAttribute(l==="th"?"data-th-html":"data-en-html");
      if(v!=null) el.innerHTML=v;
    });
    D.querySelectorAll("[data-th-aria]").forEach(function(el){
      var v=el.getAttribute(l==="th"?"data-th-aria":"data-en-aria");
      if(v!=null) el.setAttribute("aria-label",v);
    });
    D.querySelectorAll(".lang button").forEach(function(b){
      b.setAttribute("aria-pressed", String(b.dataset.l===l));
    });
  }
  var saved=null;
  try{saved=localStorage.getItem("cendon.lang")}catch(e){}
  setLang(saved || ((navigator.language||"th").slice(0,2)==="th" ? "th" : "en"));
  D.addEventListener("click",function(e){
    var b=e.target.closest(".lang button"); if(!b) return;
    setLang(b.dataset.l);
  });

  /* ── เมนูมือถือ ──────────────────────────────────────────── */
  var burger=D.querySelector(".burger");
  if(burger) burger.addEventListener("click",function(){
    D.body.classList.toggle("menu");
    burger.setAttribute("aria-expanded", D.body.classList.contains("menu")?"true":"false");
  });
  D.querySelectorAll(".nav-links a").forEach(function(a){
    a.addEventListener("click",function(){D.body.classList.remove("menu")});
  });

  /* ── เส้นใต้หัวเว็บโผล่เมื่อเลื่อนลง ─────────────────────── */
  var nav=D.querySelector("header.nav"), lastY=-1, ticking=false;
  function onScroll(){
    if(ticking) return; ticking=true;
    requestAnimationFrame(function(){
      var y=window.scrollY;
      if(nav && (y>8)!==(lastY>8)) nav.classList.toggle("stuck", y>8);
      lastY=y; ticking=false;
    });
  }
  addEventListener("scroll",onScroll,{passive:true}); onScroll();

  /* ── เผยตอนเลื่อนถึง + จุดติดไฟให้ภาพประกอบ ──────────────
     ใช้ IntersectionObserver ตัวเดียว ไม่ผูก scroll listener */
  var io=("IntersectionObserver" in window) ? new IntersectionObserver(function(rows){
    rows.forEach(function(r){
      if(!r.isIntersecting) return;
      r.target.classList.add("in");
      io.unobserve(r.target);
    });
  },{rootMargin:"0px 0px -12% 0px",threshold:.12}) : null;

  function watch(){
    D.querySelectorAll(".rv:not(.in),.feat-art:not(.in)").forEach(function(el){
      if(io) io.observe(el); else el.classList.add("in");
    });
  }
  watch();

  /* เส้นที่วาดทีละนิด: คำนวณความยาวจริงของ path เพื่อให้ dash พอดี */
  D.querySelectorAll("svg .dash").forEach(function(p){
    try{ p.style.setProperty("--len", Math.ceil(p.getTotalLength())); }catch(e){}
  });

  /* ── สารบัญคู่มือ: ไฮไลต์หัวข้อที่กำลังอ่าน ─────────────── */
  var toc=D.querySelector(".toc");
  if(toc && "IntersectionObserver" in window){
    var links={}, order=[];
    toc.querySelectorAll("a[href^='#']").forEach(function(a){
      var id=a.getAttribute("href").slice(1);
      links[id]=a; order.push(id);
    });
    var seen={};
    var io2=new IntersectionObserver(function(rows){
      rows.forEach(function(r){ seen[r.target.id]=r.isIntersecting; });
      var pick=order.filter(function(id){return seen[id]})[0];
      if(!pick) return;
      order.forEach(function(id){ links[id] && links[id].classList.toggle("on", id===pick); });
    },{rootMargin:"-84px 0px -66% 0px"});
    order.forEach(function(id){ var h=D.getElementById(id); if(h) io2.observe(h); });
  }

  /* ── ปีปัจจุบันในท้ายเว็บ ────────────────────────────────── */
  D.querySelectorAll("[data-year]").forEach(function(el){
    el.textContent=new Date().getFullYear();
  });
})();
