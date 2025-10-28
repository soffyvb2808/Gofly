const API_ROOT = 'https://gofly-1.onrender.com/api';
let TOKEN = localStorage.getItem('gofly_token') || null;

const pages = document.querySelectorAll('.page');
const navBtns = document.querySelectorAll('.nav-btn');

function showPage(id){
  pages.forEach(p => p.id === `page-${id}` ? p.classList.remove('hidden') : p.classList.add('hidden'));
  document.getElementById('btn-login').classList.toggle('hidden', id !== 'login' && !TOKEN);
  document.getElementById('btn-logout').classList.toggle('hidden', TOKEN);
}

navBtns.forEach(b=>{
  const page = b.dataset.page;
  if(page) b.addEventListener('click', ()=> {
    showPage(page);
    if(page === 'destinos') loadDestinos();
    if(page === 'planes') loadPlanes();
    if(page === 'usuarios') loadUsuarios();
  });
});

document.getElementById('btn-login').addEventListener('click', ()=> { showPage('login'); });
document.getElementById('btn-logout').addEventListener('click', ()=> {
  TOKEN = null; localStorage.removeItem('gofly_token'); alert('Sesión cerrada'); showPage('home');
});

// links between login/register UI
document.getElementById('to-register')?.addEventListener('click', ()=> showPage('register'));
document.getElementById('to-login')?.addEventListener('click', ()=> showPage('login'));

showPage('home');

const fallbackData = [
  { country: 'Francia', countryImg: '/assets/images/francia.jpg', places: [
    { id: 1, nombre: 'Torre Eiffel', descripcion: 'Icono de París', precio: 250000, imagen: 'eiffel.jpg', puntuacion:5 },
    { id: 2, nombre: 'Museo del Louvre', descripcion: 'Museo de arte', precio: 180000, imagen: 'louvre.jpg', puntuacion:4 },
    { id: 3, nombre: 'Disneyland Paris', descripcion: 'Parque temático', precio: 300000, imagen: 'disney.jpg', puntuacion:5 }
  ]},
  { country: 'Italia', countryImg: '/assets/images/italia.jpg', places: [
    { id: 10, nombre: 'Coliseo', descripcion: 'Antiguo anfiteatro romano', precio: 220000, imagen: 'italia.jpg', puntuacion:5 },
    { id: 11, nombre: 'Canales de Venecia', descripcion: 'Paseo en góndola', precio: 150000, imagen: 'italia.jpg', puntuacion:4 },
    { id: 12, nombre: 'Duomo de Florencia', descripcion: 'Catedral renacentista', precio: 160000, imagen: 'italia.jpg', puntuacion:4 }
  ]}
];

async function fetchProductosFromAPI(){
  try {
    const res = await fetch(`${API_ROOT}/productos`);
    if(!res.ok) throw new Error('API no disponible');
    const datos = await res.json();
    return datos;
  } catch (e) {
    return null;
  }
}

function groupProductosByCountry(productos){ 
  const grouping = {};
  productos.forEach(p=>{
    const country = p.pais || p.country || 'Otros';
    if(!grouping[country]) grouping[country] = [];
    grouping[country].push(p);
  });
  return Object.keys(grouping).map(country=>({ country, places: grouping[country], countryImg: grouping[country][0].imagen || '/assets/images/default.jpg' }));
}

async function loadDestinos(){
  const cont = document.getElementById('destinos-list');
  cont.innerHTML = '';
  const productos = await fetchProductosFromAPI();
  if(productos && Array.isArray(productos) && productos.length){
    const grouped = groupProductosByCountry(productos);
    cont.innerHTML = grouped.map(g=>`
      <div style="background:#fff;padding:12px;border-radius:8px;margin-bottom:12px">
        <h3>${g.country}</h3><div>${g.places.length} lugares</div>
      </div>
    `).join('');
  } else {
    cont.innerHTML = fallbackData.map(f=>`<div style="background:#fff;padding:12px;border-radius:8px;margin-bottom:12px"><h3>${f.country}</h3><div>${f.places.length} lugares</div></div>`).join('');
  }
}

async function loadPlanes(){
  const cont = document.getElementById('planes-list');
  cont.innerHTML = '';
  const productos = await fetchProductosFromAPI();
  const data = productos && productos.length ? groupProductosByCountry(productos) : fallbackData;
  cont.innerHTML = data.map(d=>`<div style="background:#fff;padding:12px;border-radius:8px;margin-bottom:12px"><h3>${d.country}</h3><div style="display:flex;gap:8px">${d.places.map(p=>`<div style="width:220px"><img src="/assets/images/${p.imagen||'default.jpg'}" style="width:100%;height:120px;object-fit:cover;border-radius:6px"/><h4>${p.nombre}</h4><div>${p.descripcion}</div><div><strong>$${p.precio}</strong></div></div>`).join('')}</div></div>`).join('');
}

async function loadUsuarios(){
  const cont = document.getElementById('usuarios-list');
  cont.innerHTML = '';
  try {
    const res = await fetch(`${API_ROOT}/usuarios`);
    if(!res.ok) throw new Error('no usuarios');
    const datos = await res.json();
    cont.innerHTML = datos.map(u=>`<div style="background:#fff;padding:10px;border-radius:6px;margin-bottom:8px"><strong>${u.nombre}</strong><div>${u.email}</div></div>`).join('');
  } catch(e){ cont.innerHTML = '<div>No hay usuarios o no disponible</div>'; }
}

const formLogin = document.getElementById('form-login');
const formRegister = document.getElementById('form-register');

formLogin?.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-pass').value;
  try{
    const res = await fetch(`${API_ROOT}/auth/login`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email, password }) });
    const data = await res.json();
    if(!res.ok) throw new Error(data.error||'Error');
    TOKEN = data.token; localStorage.setItem('gofly_token', TOKEN);
    alert('Inicio de sesión correcto. Hola ' + (data.nombre||''));
    showPage('home');
  }catch(err){ alert('Error: '+err.message) }
});

formRegister?.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const nombre = document.getElementById('reg-nombre').value;
  const email = document.getElementById('reg-email').value;
  const password = document.getElementById('reg-pass').value;
  const pass2 = document.getElementById('reg-pass2').value;
  if(password !== pass2){ alert('Las contraseñas no coinciden'); return; }
  try{
    const res = await fetch(`${API_ROOT}/auth/register`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ nombre, email, password }) });
    const data = await res.json();
    if(!res.ok) throw new Error(data.error||'Error');
    alert('Registro correcto, por favor inicia sesión');
    showPage('login');
  }catch(err){ alert('Error: '+err.message) }
});

window.addEventListener('load', ()=> {
  if(localStorage.getItem('gofly_token')) {
    TOKEN = localStorage.getItem('gofly_token');
    document.getElementById('btn-login')?.classList.add('hidden');
    document.getElementById('btn-logout')?.classList.remove('hidden');
  }
});
