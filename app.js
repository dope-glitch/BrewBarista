/* BrewBarista front-end. Data is kept in localStorage (db) so customers and owners
   share state in one browser. Replace save()/db with API calls when you add a backend. */
const $=s=>document.querySelector(s),app=$('#app');
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid=()=>Math.random().toString(36).slice(2,8);
const SLOTS=['09:00','11:00','13:00','15:00','17:00','19:00','21:00'];
const CATS=['Specialty Coffee Shop','Fine Dining Restaurant','Healthy & Organic Café'];
const today=()=>{const d=new Date();return new Date(d-d.getTimezoneOffset()*6e4).toISOString().slice(0,10)};
const money=n=>'₹'+Number(n).toLocaleString('en-IN',{maximumFractionDigits:2});
const digits=s=>String(s).replace(/\D/g,'').slice(-10);
const fd=f=>Object.fromEntries(new FormData(f));
const tables=()=>[['T1',2],['T2',4],['T3',6]].map(([label,seats])=>({id:uid(),label,seats}));

function seed(){
  const mk=(i,name,cat,location,desc,menu)=>({id:'c'+i,ownerId:'u'+i,name,cat,location,desc,plan:'Free',tables:tables(),menu:menu.map(([n,p])=>({id:uid(),n,p}))});
  const own=[['u1','Demo Owner','demo@brewbarista.com'],['u2','Asha Rao','asha@saffron.test'],['u3','Dev Nair','dev@greenleaf.test']];
  return{users:[...own.map(([id,name,email])=>({id,role:'owner',name,email,phone:'9876543210',pass:'demo123'})),
    {id:'u9',role:'customer',name:'Demo Customer',email:'customer@brewbarista.com',phone:'9000000000',pass:'demo123'}],
  cafes:[mk(1,'Bean & Bloom',CATS[0],'Old Town Square','Handcrafted brews and single-origin beans in a cozy corner.',[['Single-origin pour-over',180],['Cardamom latte',210],['Almond croissant',140]]),
    mk(2,'The Saffron Table',CATS[1],'Riverside Road','Gourmet dishes and elegant ambiance for special occasions.',[['Tasting menu (5 courses)',1800],['Slow-cooked lamb',950],['Saffron panna cotta',380]]),
    mk(3,'Green Leaf Kitchen',CATS[2],'Garden Lane','Fresh organic meals and smoothies in a serene setting.',[['Acai power bowl',320],['Cold-pressed green juice',160],['Quinoa avocado salad',290]])],
  bookings:[],reviews:[{id:'r0',cafeId:'c1',userId:'u9',bookingId:'seed',name:'Demo Customer',cafe:5,service:4,text:'Lovely pour-over and a calm space.',date:today()}]}}
let db;try{db=JSON.parse(localStorage.getItem('bb_db'))}catch{}
db=db||seed();
const save=()=>localStorage.setItem('bb_db',JSON.stringify(db));
const me=()=>db.users.find(u=>u.id===localStorage.getItem('bb_user'));
const cafeById=id=>db.cafes.find(c=>c.id===id);
const myCafe=()=>db.cafes.find(c=>c.ownerId===me()?.id);
const ui={date:today(),time:SLOTS[0],bill:null};
const held=b=>b.status==='accepted'||b.status==='seated';
const busy=(tid,date,time)=>db.bookings.find(b=>b.tableId===tid&&b.date===date&&b.time===time&&held(b));
const freeTables=(c,date,time,g)=>c.tables.filter(t=>t.seats>=g&&!busy(t.id,date,time));
function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove('show'),3200)}

const revs=c=>db.reviews.filter(r=>r.cafeId===c.id);
const avg=(c,k)=>{const r=revs(c);return r.length?r.reduce((s,x)=>s+x[k],0)/r.length:0};
const stars=n=>`<span class="st" role="img" aria-label="${(+n).toFixed(1)} out of 5">${'★'.repeat(Math.round(n))}<i>${'★'.repeat(5-Math.round(n))}</i></span>`;
const ratingLine=c=>revs(c).length?`${stars(avg(c,'cafe'))} <span class="muted">${avg(c,'cafe').toFixed(1)} café · ${avg(c,'service').toFixed(1)} service (${revs(c).length})</span>`:'<span class="muted">No reviews yet</span>';
const field=(id,label,type='text',extra='')=>`<label for="${id}">${label}</label><input id="${id}" name="${id}" type="${type}" required ${extra}>`;
const catSel=v=>`<label for="cat">Type</label><select id="cat" name="cat">${CATS.map(x=>`<option ${x===v?'selected':''}>${x}</option>`).join('')}</select>`;
const menuList=c=>`<ul class="menu">${c.menu.map(m=>`<li><span>${esc(m.n)}</span><span>${money(m.p)}</span></li>`).join('')||'<li class="muted">Menu coming soon</li>'}</ul>`;
const needLogin=role=>`<div class="panel"><h2>Please log in</h2><p class="note"><a class="btn" href="#/login/${role}">Log in as ${role}</a></p></div>`;
const starPick=n=>`<div class="pick"><input type="hidden" name="${n}" value="0">${[1,2,3,4,5].map(i=>`<button type="button" class="star" data-act="star" data-v="${i}" aria-label="${i} star${i>1?'s':''}">★</button>`).join('')}</div>`;
const billHtml=b=>`<div class="bill">${b.bill.items.map(i=>`<div class="item" style="padding:4px 0;border:0"><span>${esc(i.n)} × ${i.q}</span><span>${money(i.p*i.q)}</span></div>`).join('')}
<div class="item" style="padding:4px 0;border:0"><span>Subtotal</span><span>${money(b.bill.subtotal)}</span></div><div class="item" style="padding:4px 0;border:0"><span>GST (5%)</span><span>${money(b.bill.gst)}</span></div><div class="item tot" style="padding:6px 0 0;border:0"><span>Total</span><span>${money(b.bill.total)}</span></div></div>`;

const cafeCard=c=>`<div class="card"><span class="tag">${esc(c.cat)}</span><h3>${esc(c.name)}</h3><p class="muted">${esc(c.location)}</p><p>${ratingLine(c)}</p><a class="btn sm" href="#/cafe/${c.id}">View &amp; book</a></div>`;
const list=(q,cat)=>{q=q.toLowerCase();const r=db.cafes.filter(c=>(!cat||c.cat===cat)&&(!q||[c.name,c.location,c.cat,...c.menu.map(m=>m.n)].join(' ').toLowerCase().includes(q)));return r.map(cafeCard).join('')||'<p class="muted">No cafés match your search.</p>'};

const authView=(role,mode)=>{const reg=mode==='register',own=role==='owner';
return `<div class="panel"><div class="tabs"><a class="${!own?'on':''}" href="#/${mode}/customer">Customer</a><a class="${own?'on':''}" href="#/${mode}/owner">Café owner</a></div><h2>${reg?'Create account':'Log in'}</h2>
<form data-form="${mode}"><input type="hidden" name="role" value="${role}">
${reg?field('name',own?'Owner name':'Name','text','autocomplete="name"')+field('phone','Phone','tel'):''}
${field('email','Email','email')}${field('pass','Password','password',reg?'minlength="6"':'')}
${reg&&own?`<h3 class="sub">Your café</h3>${field('cafeName','Café name')}${catSel()}${field('location','Location')}${field('pin','PIN code','text','inputmode="numeric" pattern="[0-9]{6}" maxlength="6"')}`:''}
<button type="submit">${reg?'Register':'Log in'}</button></form>
<p class="note">${reg?`Have an account? <a href="#/login/${role}">Log in</a>`:`New here? <a href="#/register/${role}">Register</a><br><span class="muted">Demo: ${own?'demo@brewbarista.com':'customer@brewbarista.com'} / demo123</span>`}</p></div>`};

const myRow=b=>{const c=cafeById(b.cafeId),t=c?.tables.find(x=>x.id===b.tableId),r=db.reviews.find(x=>x.bookingId===b.id);
return `<div class="item col"><div class="item" style="border:0;padding:0"><div><b>${esc(c?.name||'Café')}</b><br><span class="muted">${b.date} at ${b.time} · ${b.guests} guests${t?' · Table '+esc(t.label):''} · ${esc(b.ref)}</span></div>
<div class="right"><span class="tag ${b.status}">${b.status}</span>${b.status==='pending'||b.status==='accepted'?`<button class="sm ghost" data-act="cancel" data-id="${b.id}">End reservation</button>`:''}</div></div>
${b.bill?billHtml(b):''}
${b.status==='completed'?(r?`<p class="muted">Your review — café ${stars(r.cafe)} service ${stars(r.service)} ${esc(r.text)}</p>`:`<form data-form="review"><input type="hidden" name="bookingId" value="${b.id}"><span class="lbl">Rate the café</span>${starPick('cafe')}<span class="lbl">Rate the service</span>${starPick('service')}<label for="rt${b.id}">Feedback</label><input id="rt${b.id}" name="text" placeholder="Tell others about your visit"><button type="submit">Submit review</button></form>`):''}</div>`};

const ownRow=(c,b)=>{const t=c.tables.find(x=>x.id===b.tableId),free=freeTables(c,b.date,b.time,b.guests);let act='';
 if(b.status==='pending')act=free.length?`<select id="t_${b.id}" aria-label="Assign table">${free.map(x=>`<option value="${x.id}">${esc(x.label)} (${x.seats} seats)</option>`).join('')}</select><button class="sm" data-act="accept" data-id="${b.id}">Accept</button><button class="sm ghost" data-act="reject" data-id="${b.id}">Decline</button>`:`<span class="muted">No free table</span><button class="sm ghost" data-act="reject" data-id="${b.id}">Decline</button>`;
 if(b.status==='accepted')act=`<button class="sm" data-act="seat" data-id="${b.id}">Mark seated</button><button class="sm ghost" data-act="reject" data-id="${b.id}">Cancel</button>`;
 if(b.status==='seated')act=`<button class="sm" data-act="billOpen" data-id="${b.id}">Prepare bill</button>`;
 return `<div class="item col"><div class="item" style="border:0;padding:0"><div><b>${esc(b.name)}</b> · ${b.guests} guests${t?' · Table '+esc(t.label):''}<br><span class="muted">${b.date} at ${b.time} · ${esc(b.phone)} · ${esc(b.ref)}</span></div><div class="right"><span class="tag ${b.status}">${b.status}</span>${act}</div></div>
 ${ui.bill===b.id?`<form data-form="bill"><input type="hidden" name="id" value="${b.id}">${c.menu.map(m=>`<div class="item"><label for="q_${m.id}" style="margin:0">${esc(m.n)} · ${money(m.p)}</label><input id="q_${m.id}" name="q_${m.id}" type="number" min="0" value="0" style="width:80px"></div>`).join('')||'<p class="muted">Add menu items first.</p>'}<button type="submit">Generate bill</button></form>`:''}${b.bill?billHtml(b):''}</div>`};

const tabs={
bookings:c=>{const o={pending:0,accepted:1,seated:2,completed:3,rejected:4,cancelled:5};
 return db.bookings.filter(b=>b.cafeId===c.id).sort((a,b)=>o[a.status]-o[b.status]||(a.date+a.time).localeCompare(b.date+b.time)).map(b=>ownRow(c,b)).join('')||'<p class="muted">No reservations yet.</p>'},
tables:c=>`<div class="row"><div><label for="d">Date</label><input id="d" type="date" data-ui="date" value="${ui.date}"></div><div><label for="t">Time slot</label><select id="t" data-ui="time">${SLOTS.map(s=>`<option ${s===ui.time?'selected':''}>${s}</option>`).join('')}</select></div></div>
<div class="wrap" style="margin-top:18px">${c.tables.map(t=>{const b=busy(t.id,ui.date,ui.time),st=b?(b.status==='seated'?'Occupied':'Reserved'):'Free';return `<div class="card"><h3>${esc(t.label)}</h3><p>${t.seats} seats</p><span class="tag ${st}">${st}</span>${b?`<p class="muted">${esc(b.name)} · ${b.guests} guests</p>`:''}<button class="sm ghost" data-act="delTable" data-id="${t.id}">Remove</button></div>`}).join('')}</div>
<form data-form="addTable" class="row3" style="margin-top:18px"><input name="label" placeholder="Label (e.g. T4)" required aria-label="Table label"><input name="seats" type="number" min="1" max="20" placeholder="Seats" required aria-label="Seats"><button type="submit">Add table</button></form>`,
menu:c=>`${c.menu.map(m=>`<div class="item"><span>${esc(m.n)} · ${money(m.p)}</span><button class="sm ghost" data-act="delItem" data-id="${m.id}">Remove</button></div>`).join('')||'<p class="muted">Add your first dish below.</p>'}
<form data-form="addItem" class="row3" style="margin-top:14px"><input name="n" placeholder="Item name" required aria-label="Item name"><input name="p" type="number" min="0" step="0.5" placeholder="Price (₹)" required aria-label="Price"><button type="submit">Add item</button></form>`,
profile:c=>`<form data-form="profile">${field('name','Café name','text',`value="${esc(c.name)}"`)}${catSel(c.cat)}${field('location','Location','text',`value="${esc(c.location)}"`)}<label for="desc">About your café</label><textarea id="desc" name="desc" rows="3">${esc(c.desc)}</textarea><button type="submit">Save café details</button></form>`,
ads:c=>`<div class="card" style="width:100%"><h3>Promotions &amp; subscription</h3><p>Current plan: <b>${c.plan}</b></p><p>Paid plans will let you feature your café at the top of search results and run banner ads on BrewBarista. This feature is coming soon.</p><button disabled>Upgrade — coming soon</button></div>`};
const TABS=[['bookings','Reservations'],['tables','Tables'],['menu','Menu'],['profile','Café'],['ads','Promotions']];

const views={
home:()=>`<section class="hero"><h1>Welcome to BrewBarista</h1><p>Discover the café experience with us</p></section>
<section class="sec"><h2>Our Cafés &amp; Restaurants</h2><div class="wrap">${[['☕ Specialty Coffee Shops','Handcrafted brews, single-origin beans, and cozy spaces for true coffee lovers.'],['🍴 Fine Dining Restaurants','Gourmet dishes, elegant ambiance, and world-class service for every occasion.'],['🥗 Healthy & Organic Cafés','Fresh organic meals and smoothies that nourish body and mind.']].map(([h,p])=>`<div class="card"><h3>${h}</h3><p>${p}</p></div>`).join('')}</div></section>
<section class="sec"><h2>Choose Your Role</h2><div class="wrap"><a class="btn alt" href="#/login/customer">I’m a Customer</a><a class="btn" href="#/login/owner">I’m a Café Owner</a></div></section>`,
login:r=>authView(r==='owner'?'owner':'customer','login'),
register:r=>authView(r==='owner'?'owner':'customer','register'),
cafes:()=>`<section class="sec"><h2>Find a café</h2><div class="bar"><input id="q" type="search" placeholder="Search by name, place or dish" aria-label="Search cafés"><select id="cat" aria-label="Filter by type"><option value="">All types</option>${CATS.map(x=>`<option>${x}</option>`).join('')}</select></div><div class="wrap" id="list">${list('','')}</div></section>`,
cafe:id=>{const c=cafeById(id),u=me();if(!c)return views.cafes();
 return `<div class="panel wide"><span class="tag">${esc(c.cat)}</span><h2 style="text-align:left;margin:8px 0 0">${esc(c.name)}</h2><p class="muted">${esc(c.location)}</p><p style="margin:8px 0">${esc(c.desc)}</p><p>${ratingLine(c)}</p>
<h3 class="sub">Menu</h3>${menuList(c)}<h3 class="sub">Reserve a table</h3>
${u?.role==='customer'?`<form data-form="book"><input type="hidden" name="cafeId" value="${c.id}"><div class="row"><div>${field('date','Date','date',`min="${today()}" value="${today()}"`)}</div><div><label for="time">Time</label><select id="time" name="time">${SLOTS.map(s=>`<option>${s}</option>`).join('')}</select></div></div>${field('guests','Number of guests','number','min="1" max="12" value="2"')}<p class="note" id="avail"></p><button type="submit">Request reservation</button></form>`:`<p class="muted">Please <a href="#/login/customer">log in as a customer</a> to reserve.</p>`}
<h3 class="sub">Reviews</h3>${revs(c).map(r=>`<div class="item col"><div>${esc(r.name)} · café ${stars(r.cafe)} service ${stars(r.service)}</div><p class="muted">${esc(r.text)}</p></div>`).join('')||'<p class="muted">No reviews yet.</p>'}</div>`},
my:()=>{const u=me();if(u?.role!=='customer')return needLogin('customer');
 return `<div class="panel wide"><h2>My reservations</h2>${db.bookings.filter(b=>b.userId===u.id).sort((a,b)=>(b.date+b.time).localeCompare(a.date+a.time)).map(myRow).join('')||'<p class="muted">No reservations yet. <a href="#/cafes">Find a café</a></p>'}</div>`},
owner:tab=>{const u=me(),c=myCafe();if(u?.role!=='owner'||!c)return needLogin('owner');tab=tabs[tab]?tab:'bookings';
 return `<div class="panel wide"><div class="item" style="border:0"><h2 style="margin:0">${esc(c.name)}</h2></div><p>${ratingLine(c)}</p><div class="tabs">${TABS.map(([k,t])=>`<a href="#/owner/${k}" class="${tab===k?'on':''}">${t}</a>`).join('')}</div>${tabs[tab](c)}</div>`},
about:()=>`<div class="panel"><h2>About us</h2><p>BrewBarista connects guests with cafés and restaurants they’ll love, and gives owners one place to manage menus, tables, reservations and bills.</p></div>`,
invest:()=>`<div class="panel"><h2>Investor relations</h2><p>Investor information is coming soon. For enquiries write to <b>investors@brewbarista.com</b>.</p></div>`};

function nav(p){const u=me(),L=u?.role==='owner'?[['owner','Dashboard']]:u?[['cafes','Find a café'],['my','My reservations']]:[['cafes','Find a café'],['login','Log in'],['register','Register']];
 L.push(['about','About Us'],['invest','Investor Relations']);
 $('#nav').innerHTML=L.map(([h,t])=>`<a href="#/${h}" class="${p===h?'on':''}">${t}</a>`).join('')+(u?`<a href="#/" data-act="logout">Log out (${esc(u.name.split(' ')[0])})</a>`:'')}
function avail(){const f=document.querySelector('[data-form=book]');if(!f)return;const e=f.elements,c=cafeById(e.cafeId.value),n=freeTables(c,e.date.value,e.time.value,+e.guests.value||1).length;
 $('#avail').textContent=n?`${n} table${n>1?'s':''} available for this slot`:'No table free for that slot — try another time'}
function render(top){const [,p='home',a]=location.hash.slice(1).split('/');app.innerHTML=(views[p]||views.home)(a);nav(p);if(p==='cafe')avail();if(top)scrollTo(0,0)}
addEventListener('hashchange',()=>render(true));

document.addEventListener('input',e=>{const t=e.target;
 if(t.id==='q'||t.id==='cat'&&$('#list'))$('#list').innerHTML=list($('#q').value,$('#cat').value);
 if(t.closest('[data-form=book]'))avail()});
document.addEventListener('change',e=>{const k=e.target.dataset?.ui;if(k){ui[k]=e.target.value;render()}});

const forms={
login(f){const d=fd(f),u=db.users.find(x=>x.role===d.role&&x.email.toLowerCase()===d.email.toLowerCase()&&x.pass===d.pass);
 if(!u)return toast('Email or password is incorrect.');localStorage.setItem('bb_user',u.id);location.hash=u.role==='owner'?'#/owner':'#/cafes';render(true);toast('Welcome back, '+u.name)},
register(f){const d=fd(f);if(db.users.some(x=>x.email.toLowerCase()===d.email.toLowerCase()))return toast('That email is already registered. Please log in.');
 if(digits(d.phone).length<10)return toast('Enter a valid 10-digit phone number.');
 const u={id:uid(),role:d.role,name:d.name.trim(),email:d.email,phone:digits(d.phone),pass:d.pass};db.users.push(u);
 if(d.role==='owner')db.cafes.push({id:uid(),ownerId:u.id,name:d.cafeName.trim(),cat:d.cat,location:d.location.trim(),pin:d.pin,desc:'',plan:'Free',tables:tables(),menu:[]});
 save();localStorage.setItem('bb_user',u.id);location.hash=u.role==='owner'?'#/owner/menu':'#/cafes';render(true);toast('Account created')},
book(f){const d=fd(f),c=cafeById(d.cafeId),u=me(),g=+d.guests;
 if(d.date<today())return toast('Pick today or a future date.');
 if(!freeTables(c,d.date,d.time,g).length)return toast('No table free for that slot. Try another time.');
 if(db.bookings.some(b=>b.userId===u.id&&b.cafeId===c.id&&b.date===d.date&&b.time===d.time&&(b.status==='pending'||held(b))))return toast('You already have a reservation for that slot.');
 db.bookings.push({id:uid(),ref:'BB-'+uid().toUpperCase(),cafeId:c.id,userId:u.id,name:u.name,phone:u.phone,date:d.date,time:d.time,guests:g,tableId:null,status:'pending',bill:null});
 save();location.hash='#/my';toast('Request sent. The café will reply soon.')},
review(f){const d=fd(f),b=db.bookings.find(x=>x.id===d.bookingId);if(+d.cafe<1||+d.service<1)return toast('Please give both star ratings.');
 db.reviews.push({id:uid(),cafeId:b.cafeId,userId:b.userId,bookingId:b.id,name:b.name,cafe:+d.cafe,service:+d.service,text:d.text.trim(),date:today()});save();render();toast('Thanks for your feedback!')},
bill(f){const d=fd(f),b=db.bookings.find(x=>x.id===d.id),c=cafeById(b.cafeId);
 const items=c.menu.filter(m=>+d['q_'+m.id]>0).map(m=>({n:m.n,p:m.p,q:+d['q_'+m.id]}));if(!items.length)return toast('Enter a quantity for at least one item.');
 const subtotal=items.reduce((s,i)=>s+i.p*i.q,0),gst=Math.round(subtotal*5)/100;b.bill={items,subtotal,gst,total:subtotal+gst};b.status='completed';ui.bill=null;save();render();toast('Bill generated')},
addTable(f){const d=fd(f),c=myCafe();c.tables.push({id:uid(),label:d.label.trim(),seats:+d.seats});save();render()},
addItem(f){const d=fd(f);myCafe().menu.push({id:uid(),n:d.n.trim(),p:+d.p});save();render();toast('Menu item added')},
profile(f){const d=fd(f),c=myCafe();Object.assign(c,{name:d.name.trim(),cat:d.cat,location:d.location.trim(),desc:d.desc.trim()});save();render();toast('Café details saved')}};
const setStatus=(id,s,extra)=>{const b=db.bookings.find(x=>x.id===id);Object.assign(b,{status:s},extra);save();render()};
const acts={
star(el){const v=+el.dataset.v,p=el.parentElement;p.querySelector('input').value=v;p.querySelectorAll('.star').forEach((s,i)=>s.classList.toggle('on',i<v))},
cancel(el){if(confirm('End this reservation?')){setStatus(el.dataset.id,'cancelled');toast('Reservation ended')}},
accept(el){const b=db.bookings.find(x=>x.id===el.dataset.id),tid=$('#t_'+b.id).value;if(busy(tid,b.date,b.time))return toast('That table was just taken.');setStatus(b.id,'accepted',{tableId:tid});toast('Reservation accepted')},
reject(el){const b=db.bookings.find(x=>x.id===el.dataset.id);setStatus(b.id,b.status==='pending'?'rejected':'cancelled',{tableId:null})},
seat(el){setStatus(el.dataset.id,'seated')},
billOpen(el){ui.bill=el.dataset.id;render()},
delTable(el){const c=myCafe();if(db.bookings.some(b=>b.tableId===el.dataset.id&&held(b)))return toast('That table has an active reservation.');c.tables=c.tables.filter(t=>t.id!==el.dataset.id);save();render()},
delItem(el){const c=myCafe();c.menu=c.menu.filter(m=>m.id!==el.dataset.id);save();render()},
logout(){localStorage.removeItem('bb_user');location.hash='#/';render(true)}};
document.addEventListener('submit',e=>{const f=e.target.closest('[data-form]');if(f){e.preventDefault();forms[f.dataset.form](f)}});
document.addEventListener('click',e=>{const el=e.target.closest('[data-act]');if(el){if(el.tagName==='A')e.preventDefault();acts[el.dataset.act](el)}});
render(true);
