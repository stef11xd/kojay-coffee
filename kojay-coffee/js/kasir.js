import {
  $, loadData, saveData, material, status, statusLabel, lowStock,
  options, esc, fmt, logit, toast, logout
} from './data.js';

const role=sessionStorage.getItem('kojay_role');
if(role!=='Kasir'){
  location.href='index.html';
  throw new Error('Akses kasir ditolak');
}

let D=loadData();
let tab='dash';

function go(t){tab=t;render();}

function render(){
  const low=lowStock(D);
  const tabs=[
    ['dash','Pemantauan Stok'],
    ['jual','Penjualan'],
    ['riwayat','Riwayat']
  ];

  $('#app').innerHTML=`
    <header>
      <h1>Kojay Coffee · Panel Kasir</h1>
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

  if(tab==='jual')previewSale();
}

const views={
  dash(){
    const l=lowStock(D);
    return `
      ${l.length
        ? `<div class="alert"><b>Stok minimum tercapai:</b>
             ${l.map(m=>`${esc(m.nama)} (sisa ${fmt(m.stok)} ${m.sat},
             batas ${fmt(m.min)})`).join('; ')}. Segera informasikan ke Owner / Manajer.</div>`
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

  jual(){
    return `
      <div class="card">
        <h3>Catat penjualan</h3>
        <p class="mut">Stok bahan baku berkurang otomatis sesuai takaran resep.</p>
        <div class="row">
          <label>Produk
            <select id="sp">${options(D.prods)}</select>
          </label>
          <label>Jumlah terjual
            <input id="sq" type="number" min="1" value="1" style="width:100px">
          </label>
          <button class="b" id="sellBtn">Simpan penjualan</button>
        </div>
        <div id="pv" style="margin-top:.8rem"></div>
      </div>
      ${logTable(D.log.filter(x=>x.tipe==='keluar'),'Penjualan terakhir',10)}
    `;
  },

  riwayat(){
    return logTable(D.log,'Riwayat perubahan stok',200);
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

function previewSale(){
  const p=D.prods.find(x=>x.id===$('#sp')?.value);
  const q=Math.floor(+$(`#sq`)?.value)||1;
  if($('#pv'))$('#pv').innerHTML=p?needTable(p,q):'';

  $('#sp')?.addEventListener('change',previewSale);
  $('#sq')?.addEventListener('input',previewSale);
  $('#sellBtn')?.addEventListener('click',sell);
}

function sell(){
  const p=D.prods.find(x=>x.id===$('#sp').value);
  const q=Math.floor(+$(`#sq`).value);

  if(!p||!(q>0))return toast('Isi jumlah terjual minimal 1');

  const n=need(p,q);
  const short=n.filter(x=>x.m.stok<x.q);
  if(short.length)return toast('Stok tidak cukup: '+short.map(x=>x.m.nama).join(', '));

  n.forEach(x=>{
    x.m.stok-=x.q;
    logit(D,'keluar',x.m,-x.q,`Terjual ${q} ${p.nama}`,role);
  });

  saveData(D);
  const lowNow=n.filter(x=>x.m.stok<=x.m.min).map(x=>x.m.nama);
  render();

  toast(lowNow.length
    ? `Tersimpan. Stok minimum: ${lowNow.join(', ')}`
    : `Penjualan ${q} ${p.nama} tersimpan`);
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

render();
