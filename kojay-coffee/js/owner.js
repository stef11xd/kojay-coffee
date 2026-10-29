import {
  $, loadData, saveData, material, status, statusLabel, lowStock,
  options, esc, fmt, logit, toast, uid, resetData, logout
} from './data.js';

const role=sessionStorage.getItem('kojay_role');
if(role!=='Owner / Manajer'){
  location.href='index.html';
  throw new Error('Akses Owner / Manajer ditolak');
}

let D=loadData();
let tab='dash';

function go(t){tab=t;render();}

function render(){
  const low=lowStock(D);
  const tabs=[
    ['dash','Pemantauan Stok'],
    ['masuk','Stok Masuk'],
    ['resep','Resep & BoM'],
    ['bahan','Bahan Baku'],
    ['riwayat','Riwayat']
  ];

  $('#app').innerHTML=`
    <header>
      <h1>Kojay Coffee · Panel Owner / Manajer</h1>
      <div class="row" style="align-items:center">
        <span>${role}${low.length?` · <b>${low.length} bahan perlu restok</b>`:''}</span>
        <button class="s" style="color:inherit" id="logout">Keluar</button>
      </div>
    </header>

    <nav>
      ${tabs.map(t=>`
        <button class="${tab===t[0]?'on':''}" data-tab="${t[0]}">${t[1]}</button>
      `).join('')}
    </nav>

    <main>${views[tab]()}</main>
  `;

  document.querySelectorAll('nav button').forEach(btn=>{
    btn.onclick=()=>go(btn.dataset.tab);
  });
  $('#logout').onclick=logout;

  if(tab==='resep')bom();
}

const views={
  dash(){
    const l=lowStock(D);
    return `
      ${l.length
        ? `<div class="alert"><b>Stok minimum tercapai:</b>
             ${l.map(m=>`${esc(m.nama)} (sisa ${fmt(m.stok)} ${m.sat},
             batas ${fmt(m.min)})`).join('; ')}. Segera tambah stok.</div>`
        : `<div class="alert ok">Semua bahan baku masih di atas batas minimum.</div>`}

      <div class="grid">
        <div class="card"><div class="mut">Jenis bahan baku</div><div class="big">${D.mats.length}</div></div>
        <div class="card"><div class="mut">Perlu restok</div><div class="big">${l.length}</div></div>
        <div class="card"><div class="mut">Produk beresep</div><div class="big">${D.prods.length}</div></div>
      </div>

      <div class="card tw">
        <h3>Stok tersedia</h3>
        <table>
          <tr><th>Bahan</th><th class="num">Stok</th><th class="num">Minimum</th><th>Level</th><th>Status</th></tr>
          ${D.mats.map(m=>{
            const s=status(m);
            const p=Math.min(100,m.min?m.stok/(m.min*3)*100:100);
            return `<tr>
              <td>${esc(m.nama)}</td>
              <td class="num">${fmt(m.stok)} ${m.sat}</td>
              <td class="num">${fmt(m.min)} ${m.sat}</td>
              <td><div class="bar"><i class="${s}" style="width:${p}%"></i></div></td>
              <td><span class="tag ${s}">${statusLabel[s]}</span></td>
            </tr>`;
          }).join('')}
        </table>
      </div>

      <div class="card">
        <h3>Kemampuan produksi</h3>
        <p class="mut">Perkiraan porsi yang bisa dibuat dari stok saat ini.</p>
        <div class="tw">
          <table>
            ${D.prods.map(p=>`
              <tr><td>${esc(p.nama)}</td><td class="num">${maxCup(p)} porsi</td></tr>
            `).join('')}
          </table>
        </div>
      </div>
    `;
  },

  masuk(){
    return `
      <div class="card">
        <h3>Catat stok masuk</h3>
        <div class="row">
          <label>Bahan baku
            <select id="im">${options(D.mats)}</select>
          </label>
          <label>Jumlah masuk
            <input id="ij" type="number" min="0" step="any" style="width:130px">
          </label>
          <label>Keterangan
            <input id="ik" placeholder="mis. beli pasar" style="width:200px">
          </label>
          <button class="b" id="addStockBtn">Simpan stok masuk</button>
        </div>
      </div>
      ${logTable(D.log.filter(x=>x.tipe==='masuk'),'Stok masuk terakhir',10)}
    `;
  },

  resep(){
    return `
      <div class="card">
        <h3>Kebutuhan bahan (BoM)</h3>
        <div class="row">
          <label>Produk<select id="bp">${options(D.prods)}</select></label>
          <label>Jumlah porsi<input id="bq" type="number" min="1" value="1" style="width:100px"></label>
        </div>
        <div id="bo" class="tw" style="margin-top:.8rem"></div>
      </div>

      ${D.prods.map(p=>`
        <div class="card tw">
          <h3>${esc(p.nama)}</h3>
          <p class="mut">${esc(p.note||'')} · takaran per 1 porsi</p>
          <table>
            ${p.bom.map((b,i)=>`
              <tr>
                <td>${esc(material(D,b.m)?.nama||'(bahan dihapus)')}</td>
                <td class="num">${fmt(b.q)} ${material(D,b.m)?.sat||''}</td>
                <td><button class="s d" data-action="del-line" data-pid="${p.id}" data-index="${i}">Hapus</button></td>
              </tr>
            `).join('')}
          </table>

          <div class="row" style="margin-top:.6rem">
            <label>Bahan<select id="rm${p.id}">${options(D.mats)}</select></label>
            <label>Takaran<input id="rq${p.id}" type="number" min="0" step="any" style="width:100px"></label>
            <button class="s" data-action="add-line" data-pid="${p.id}">Tambah ke resep</button>
            <button class="s d" data-action="del-prod" data-pid="${p.id}">Hapus produk</button>
          </div>
        </div>
      `).join('')}

      <div class="card">
        <h3>Tambah produk</h3>
        <div class="row">
          <label>Nama produk<input id="np"></label>
          <button class="b" id="addProdBtn">Tambah produk</button>
        </div>
      </div>
    `;
  },

  bahan(){
    return `
      <div class="card">
        <h3>Tambah bahan baku</h3>
        <div class="row">
          <label>Nama<input id="bn"></label>
          <label>Satuan<input id="bs" placeholder="g / ml" style="width:80px"></label>
          <label>Stok awal<input id="bt" type="number" min="0" step="any" style="width:100px" value="0"></label>
          <label>Batas minimum<input id="bm" type="number" min="0" step="any" style="width:100px" value="0"></label>
          <button class="b" id="addMatBtn">Tambah bahan</button>
        </div>
      </div>

      <div class="card tw">
        <h3>Daftar bahan baku</h3>
        <table>
          <tr><th>Nama</th><th>Satuan</th><th class="num">Stok</th><th class="num">Minimum</th><th></th></tr>
          ${D.mats.map(m=>`
            <tr>
              <td>${esc(m.nama)}</td>
              <td>${esc(m.sat)}</td>
              <td class="num">${fmt(m.stok)}</td>
              <td class="num">${fmt(m.min)}</td>
              <td>
                <button class="s" data-action="edit-mat" data-id="${m.id}">Ubah</button>
                <button class="s d" data-action="del-mat" data-id="${m.id}">Hapus</button>
              </td>
            </tr>
          `).join('')}
        </table>
      </div>
    `;
  },

  riwayat(){
    return `
      ${logTable(D.log,'Riwayat perubahan stok',200)}
      <p class="mut">
        Menghapus riwayat dan mengembalikan data awal:
        <button class="s d" id="resetBtn">Reset semua data</button>
      </p>
    `;
  }
};

function maxCup(p){
  return p.bom.length
    ? Math.max(0,Math.floor(Math.min(...p.bom.map(b=>{
        const m=material(D,b.m);
        return m&&b.q>0?m.stok/b.q:Infinity;
      }))))
    : 0;
}

function need(p,q){
  return p.bom.map(b=>({m:material(D,b.m),q:b.q*q})).filter(x=>x.m);
}

function needTable(p,q){
  return `
    <table>
      <tr><th>Bahan</th><th class="num">Dibutuhkan</th><th class="num">Stok</th><th>Cukup?</th></tr>
      ${need(p,q).map(x=>`
        <tr>
          <td>${esc(x.m.nama)}</td>
          <td class="num">${fmt(x.q)} ${x.m.sat}</td>
          <td class="num">${fmt(x.m.stok)} ${x.m.sat}</td>
          <td><span class="tag ${x.m.stok>=x.q?'ok':'out'}">
            ${x.m.stok>=x.q?'Cukup':'Kurang '+fmt(x.q-x.m.stok)}
          </span></td>
        </tr>
      `).join('')}
    </table>
  `;
}

function bom(){
  const p=D.prods.find(x=>x.id===$('#bp')?.value);
  const q=+$(`#bq`)?.value||1;
  if($('#bo'))$('#bo').innerHTML=p?needTable(p,q):'Belum ada produk.';

  $('#bp')?.addEventListener('change',bom);
  $('#bq')?.addEventListener('input',bom);
}

function logTable(rows,title,lim){
  const r=rows.slice(-lim).reverse();
  return `
    <div class="card tw">
      <h3>${title}</h3>
      <table>
        <tr><th>Waktu</th><th>Jenis</th><th>Bahan</th><th class="num">Perubahan</th><th class="num">Sisa</th><th>Keterangan</th><th>Oleh</th></tr>
        ${r.map(x=>`
          <tr>
            <td>${new Date(x.t).toLocaleString('id-ID')}</td>
            <td><span class="tag ${x.tipe==='masuk'?'ok':x.tipe==='keluar'?'low':'out'}">
              ${x.tipe==='masuk'?'Masuk':x.tipe==='keluar'?'Keluar':'Koreksi'}
            </span></td>
            <td>${esc(x.mat)}</td>
            <td class="num">${x.jml>0?'+':''}${fmt(x.jml)} ${esc(x.sat)}</td>
            <td class="num">${fmt(x.sisa)} ${esc(x.sat)}</td>
            <td>${esc(x.ket||'')}</td>
            <td>${esc(x.user||'-')}</td>
          </tr>
        `).join('')||'<tr><td colspan="7">Belum ada catatan.</td></tr>'}
      </table>
    </div>
  `;
}

function bindActions(){
  $('#addStockBtn')?.addEventListener('click',addStock);
  $('#addProdBtn')?.addEventListener('click',addProd);
  $('#addMatBtn')?.addEventListener('click',addMat);
  $('#resetBtn')?.addEventListener('click',resetAll);

  document.querySelectorAll('[data-action]').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const a=btn.dataset.action;
      if(a==='add-line')addLine(btn.dataset.pid);
      if(a==='del-line')delLine(btn.dataset.pid,+btn.dataset.index);
      if(a==='del-prod')delProd(btn.dataset.pid);
      if(a==='edit-mat')editMat(btn.dataset.id);
      if(a==='del-mat')delMat(btn.dataset.id);
    });
  });
}

const oldRender=render;
render=function(){
  oldRender();
  bindActions();
  if(tab==='resep')bom();
};

function addStock(){
  const m=material(D,$('#im').value),j=+$(`#ij`).value;
  if(!m||!(j>0))return toast('Isi jumlah stok masuk lebih dari 0');

  m.stok+=j;
  logit(D,'masuk',m,j,$('#ik').value.trim(),role);
  saveData(D);
  render();
  toast(`Stok ${m.nama} bertambah ${fmt(j)} ${m.sat}`);
}

function addMat(){
  const nama=$('#bn').value.trim(),sat=$('#bs').value.trim();
  if(!nama||!sat)return toast('Nama dan satuan wajib diisi');

  const m={
    id:uid(),nama,sat,
    stok:+$('#bt').value||0,
    min:+$('#bm').value||0
  };
  D.mats.push(m);

  if(m.stok)logit(D,'masuk',m,m.stok,'Stok awal',role);
  saveData(D);
  render();
}

function editMat(id){
  const m=material(D,id);
  if(!m)return;

  const nama=prompt('Nama bahan',m.nama);
  if(nama===null)return;
  const sat=prompt('Satuan',m.sat);
  if(sat===null)return;
  const mn=prompt('Batas minimum',m.min);
  if(mn===null)return;
  const st=prompt('Koreksi stok (kosongkan jika tidak diubah)',m.stok);

  m.nama=nama.trim()||m.nama;
  m.sat=sat.trim()||m.sat;
  m.min=+mn>=0?+mn:m.min;

  if(st!==null&&st!==''&&+st>=0&&+st!==m.stok){
    const d=+st-m.stok;
    m.stok=+st;
    logit(D,'koreksi',m,d,'Koreksi manual',role);
  }

  saveData(D);
  render();
}

function delMat(id){
  const m=material(D,id);
  if(!m)return;
  if(D.prods.some(p=>p.bom.some(b=>b.m===id)))
    return toast('Bahan dipakai di resep. Hapus dari resep dulu.');

  if(confirm('Hapus '+m.nama+'?')){
    D.mats=D.mats.filter(x=>x.id!==id);
    saveData(D);
    render();
  }
}

function addLine(pid){
  const p=D.prods.find(x=>x.id===pid);
  const m=$('#rm'+pid).value;
  const q=+$('#rq'+pid).value;

  if(!(q>0))return toast('Isi takaran lebih dari 0');

  const e=p.bom.find(b=>b.m===m);
  e?e.q=q:p.bom.push({m,q});
  saveData(D);
  render();
}

function delLine(pid,i){
  D.prods.find(x=>x.id===pid).bom.splice(i,1);
  saveData(D);
  render();
}

function addProd(){
  const n=$('#np').value.trim();
  if(!n)return toast('Isi nama produk');

  D.prods.push({id:uid(),nama:n,note:'',bom:[]});
  saveData(D);
  render();
}

function delProd(id){
  if(confirm('Hapus produk dan resepnya?')){
    D.prods=D.prods.filter(p=>p.id!==id);
    saveData(D);
    render();
  }
}

function resetAll(){
  if(confirm('Semua data akan kembali ke data awal. Lanjutkan?')){
    D=resetData();
    render();
    toast('Data berhasil direset');
  }
}

render();
