// ============================================================
// DATA / KODE AKSES / PENYIMPANAN
// ============================================================

export const STORAGE_KEY = 'kojay_stok';

// Kode untuk masuk ke Panel Owner / Manajer.
export const OWNER_CODE = 'kopi123kopi';

export const seed = () => ({
  mats:[
    {id:'kopi',nama:'Biji kopi',sat:'g',stok:1000,min:200},
    {id:'air',nama:'Air',sat:'ml',stok:5000,min:1000},
    {id:'es',nama:'Es batu',sat:'g',stok:5000,min:1000},
    {id:'sfc',nama:'Susu full cream',sat:'ml',stok:3000,min:600},
    {id:'sck',nama:'Susu coklat',sat:'ml',stok:2000,min:500},
    {id:'ga',nama:'Gula aren',sat:'ml',stok:500,min:100},
    {id:'hz',nama:'Sirup hazelnut',sat:'ml',stok:500,min:100}
  ],
  prods:[
    {id:'am',nama:'Americano',note:'Espresso 50 ml',
      bom:[{m:'kopi',q:20},{m:'air',q:100},{m:'es',q:50}]},
    {id:'ks',nama:'Kopi Susu Gula Aren',note:'Espresso 60 ml',
      bom:[{m:'kopi',q:20},{m:'sfc',q:200},{m:'ga',q:20},{m:'es',q:50}]},
    {id:'mo',nama:'Mochaccino',note:'Espresso 60 ml',
      bom:[{m:'kopi',q:20},{m:'sck',q:200},{m:'es',q:50}]},
    {id:'hl',nama:'Hazelnut Latte',note:'Espresso 60 ml',
      bom:[{m:'kopi',q:20},{m:'sfc',q:200},{m:'ga',q:20},{m:'hz',q:20},{m:'es',q:50}]}
  ],
  log:[]
});

export function loadData(){
  try{
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || seed();
  }catch(e){
    return seed();
  }
}

export function saveData(data){
  try{
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }catch(e){
    showToast('Gagal menyimpan data di peramban ini');
  }
}

export function resetData(){
  const data = seed();
  saveData(data);
  return data;
}

export function $(selector){
  return document.querySelector(selector);
}

export function esc(s){
  return String(s).replace(/[&<>"']/g,c=>({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[c]));
}

export function fmt(n){
  return Number(n).toLocaleString('id-ID',{maximumFractionDigits:2});
}

export function uid(){
  return Math.random().toString(36).slice(2,8);
}

export function material(data,id){
  return data.mats.find(m=>m.id===id);
}

export function status(m){
  return m.stok<=0?'out':m.stok<=m.min?'low':'ok';
}

export const statusLabel = {ok:'Aman',low:'Menipis',out:'Habis'};

export function lowStock(data){
  return data.mats.filter(m=>m.stok<=m.min);
}

export function options(arr,sel){
  return arr.map(x=>`<option value="${x.id}" ${x.id===sel?'selected':''}>${esc(x.nama)}${x.sat?' ('+x.sat+')':''}</option>`).join('');
}

export function logit(data,tipe,m,jml,ket,user){
  data.log.push({
    t:Date.now(),tipe,mat:m.nama,sat:m.sat,jml,
    sisa:m.stok,ket,user
  });
}

export function toast(message){
  const el = $('#toast');
  if(!el)return;
  el.textContent = message;
  el.style.display='block';
  clearTimeout(toast.timer);
  toast.timer=setTimeout(()=>el.style.display='none',3500);
}

export function logout(){
  sessionStorage.removeItem('kojay_role');
  location.href='index.html';
}
