import { OWNER_CODE, toast } from './data.js';

const app = document.querySelector('#app');

function render(){
  app.innerHTML = `
    <div class="card login">
      <h1>Kojay Coffee</h1>
      <p class="mut">Sistem persediaan bahan baku dan penjualan.</p>

      <button class="b" id="cashierBtn">Kasir</button>
      <button class="b" id="ownerBtn">Manajer</button>

      <div id="codeBox" style="display:none;text-align:left;margin-top:1rem">
        <label>Kode Manajer
          <input id="ownerCode" type="password" autocomplete="off"
                 placeholder="Masukkan kode akses">
        </label>
        <button class="b" id="submitCode" style="margin-top:.7rem">
          Buka Panel Owner / Manajer
        </button>
        <div class="error" id="error"></div>
      </div>

    </div>
  `;

  document.querySelector('#cashierBtn').onclick=()=>{
    sessionStorage.setItem('kojay_role','Kasir');
    location.href='kasir.html';
  };

  document.querySelector('#ownerBtn').onclick=()=>{
    document.querySelector('#codeBox').style.display='block';
    document.querySelector('#ownerCode').focus();
  };

  document.querySelector('#submitCode').onclick=checkCode;
  document.querySelector('#ownerCode').onkeydown=e=>{
    if(e.key==='Enter')checkCode();
  };
}

function checkCode(){
  const input=document.querySelector('#ownerCode');
  const error=document.querySelector('#error');

  if(input.value===OWNER_CODE){
    sessionStorage.setItem('kojay_role','Owner / Manajer');
    location.href='owner.html';
  }else{
    error.textContent='Kode akses salah.';
    input.select();
  }
}

render();
