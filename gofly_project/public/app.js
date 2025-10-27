const API_ROOT = '/api';
let TOKEN = localStorage.getItem('gofly_token') || null;
const pages = document.querySelectorAll('.page');
const navBtns = document.querySelectorAll('.nav-btn');

function showPage(id){
  pages.forEach(p => p.id === `page-${id}` ? p.classList.remove('hidden') : p.classList.add('hidden'));
  document.getElementById('btn-login').classList.toggle('hidden', id !== 'login');
  document.getElementById('btn-logout').classList.toggle('hidden', !TOKEN);
}

navBtns.forEach(b=>{
  const page = b.dataset.page;
  if(page) b.addEventListener('click', ()=> {
    showPage(page);
    if(page === 'productos') loadProductos();
    if(page === 'usuarios') loadUsuarios();
    if(page === 'planes') loadPlanes();
  });
});

document.getElementById('btn-login').addEventListener('click', ()=> showPage('login'));
document.getElementById('btn-logout').addEventListener('click', ()=> {
  TOKEN = null; localStorage.removeItem('gofly_token'); alert('Sesión cerrada'); showPage('home');
});

showPage('home');

const productosList = document.getElementById('productos-list');
const btnNew = document.getElementById('btn-new-product');
const modal = document.getElementById('modal-product');
const form = document.getElementById('form-product');
const btnCancel = document.getElementById('btn-cancel');
const modalTitle = document.getElementById('modal-title');

btnNew.addEventListener('click', ()=> {
  if (!TOKEN) { alert('Debes iniciar sesión para crear un destino'); return; }
  openModal();
});

btnCancel.addEventListener('click', ()=> closeModal());

function openModal(product = null){
  modal.classList.remove('hidden');
  modalTitle.innerText = product ? 'Editar destino' : 'Nuevo destino';
  document.getElementById('prod-id').value = product ? product.id : '';
  document.getElementById('prod-nombre').value = product ? product.nombre : '';
  document.getElementById('prod-pais').value = product ? product.pais || '' : '';
  document.getElementById('prod-ciudad').value = product ? product.ciudad || '' : '';
  document.getElementById('prod-precio').value = product ? product.precio || 0 : '';
  document.getElementById('prod-imagen').value = product ? product.imagen || '' : '';
  document.getElementById('prod-descripcion').value = product ? product.descripcion || '' : '';
}

function closeModal(){ modal.classList.add('hidden'); form.reset(); }

form.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const id = document.getElementById('prod-id').value;
  const body = {
    nombre: document.getElementById('prod-nombre').value,
    pais: document.getElementById('prod-pais').value,
    ciudad: document.getElementById('prod-ciudad').value,
    precio: parseFloat(document.getElementById('prod-precio').value || 0),
    imagen: document.getElementById('prod-imagen').value,
    descripcion: document.getElementById('prod-descripcion').value
  };

  try {
    const opts = {
      method: id ? 'PUT' : 'POST',
      headers: { 'Content-Type':'application/json', ...(TOKEN ? { 'Authorization': 'Bearer '+TOKEN } : {}) },
      body: JSON.stringify(body)
    };
    const url = id ? `${API_ROOT}/productos/${id}` : `${API_ROOT}/productos`;
    const res = await fetch(url, opts);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || JSON.stringify(data));
    closeModal();
    loadProductos();
    alert(data.message || 'OK');
  } catch (err) { alert('Error: '+err.message) }
});

async function loadProductos(){
  productosList.innerHTML = 'Cargando...';
  try {
    const res = await fetch(`${API_ROOT}/productos`);
    const datos = await res.json();
    if(!Array.isArray(datos)) { productosList.innerHTML = 'Error cargando'; return; }
    productosList.innerHTML = datos.map(p=> renderProductoCard(p)).join('');
    document.querySelectorAll('.btn-edit').forEach(b=>{
      b.addEventListener('click', async ()=> {
        const id = b.dataset.id;
        const resp = await fetch(`${API_ROOT}/productos/${id}`);
        const p = await resp.json();
        openModal(p);
      });
    });
    document.querySelectorAll('.btn-delete').forEach(b=>{
      b.addEventListener('click', async ()=> {
        if(!confirm('Eliminar este destino?')) return;
        const id = b.dataset.id;
        try {
          const res = await fetch(`${API_ROOT}/productos/${id}`, {
            method:'DELETE',
            headers: { ...(TOKEN?{ 'Authorization':'Bearer '+TOKEN}: {}) }
          });
          const r = await res.json();
          if(!res.ok) throw new Error(r.error||JSON.stringify(r));
          loadProductos();
        } catch (e){ alert(e.message) }
      });
    });
  } catch (err) { productosList.innerHTML = 'Error al cargar'; console.error(err) }
}

function renderProductoCard(p){
  const img = p.imagen ? `/assets/images/${p.imagen}` : '/assets/images/default.jpg';
  const stars = renderStars(p.puntuacion || 0);
  return `
    <div class="product-card">
      <img src="${img}" alt="${p.nombre}" />
      <div>
        <h4>${p.nombre}</h4>
        <div class="small-muted">${p.pais || ''} ${p.ciudad ? ' - '+p.ciudad : ''}</div>
        <p>${p.descripcion || ''}</p>
      </div>
      <div class="product-meta">
        <div>
          <strong>$${p.precio}</strong>
          <div>${stars}</div>
        </div>
        <div>
          <button class="btn btn-edit" data-id="${p.id}">Editar</button>
          <button class="btn" data-id="${p.id}" onclick="location.href='#'">Ver</button>
          <button class="btn btn-delete" data-id="${p.id}">Eliminar</button>
        </div>
      </div>
    </div>
  `;
}

function renderStars(n){
  let s=''; for(let i=1;i<=5;i++) s += i<=n ? '★' : '☆'; return `<span style="color:#C58E5B">${s}</span>`;
}

async function loadUsuarios(){
  const cont = document.getElementById('usuarios-list');
  cont.innerHTML = 'Cargando...';
  try {
    const res = await fetch(`${API_ROOT}/usuarios`);
    const datos = await res.json();
    cont.innerHTML = datos.map(u => `<div class="card small"><strong>${u.nombre}</strong><div class="small-muted">${u.email}</div></div>`).join('');
  } catch (e) { cont.innerHTML='Error'; }
}

async function loadPlanes(){
  const cont = document.getElementById('planes-list');
  cont.innerHTML = 'Cargando...';
  try {
    const res = await fetch(`${API_ROOT}/productos`);
    const datos = await res.json();
    cont.innerHTML = datos.map(p=>`<div class="product-card"><img src="${p.imagen ? '/assets/images/'+p.imagen : '/assets/images/default.jpg'}"><h4>${p.nombre}</h4><p>${p.descripcion||''}</p><strong>$${p.precio}</strong></div>`).join('');
  } catch(e){ cont.innerHTML='Error' }
}

const formLogin = document.getElementById('form-login');
const formRegister = document.getElementById('form-register');
document.getElementById('go-register').addEventListener('click', ()=> window.scrollTo(0,document.body.scrollHeight));

formLogin.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-pass').value;
  try{
    const res = await fetch(`${API_ROOT}/auth/login`, {
      method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if(!res.ok) throw new Error(data.error || JSON.stringify(data));
    TOKEN = data.token; localStorage.setItem('gofly_token', TOKEN);
    alert('Inicio correcto'); showPage('home');
    document.getElementById('btn-login').classList.add('hidden');
    document.getElementById('btn-logout').classList.remove('hidden');
  }catch(err){ alert('Error: '+err.message) }
});

formRegister.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const nombre = document.getElementById('reg-nombre').value;
  const email = document.getElementById('reg-email').value;
  const password = document.getElementById('reg-pass').value;
  try{
    const res = await fetch(`${API_ROOT}/auth/register`, {
      method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ nombre, email, password })
    });
    const data = await res.json();
    if(!res.ok) throw new Error(data.error || JSON.stringify(data));
    alert('Registro exitoso, por favor inicie sesión');
    document.getElementById('reg-nombre').value = '';
    document.getElementById('reg-email').value = '';
    document.getElementById('reg-pass').value = '';
  }catch(err){ alert('Error: '+err.message) }
});
