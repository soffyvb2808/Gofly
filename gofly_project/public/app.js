// Frontend app for GoFly - connects to deployed backend
const API_ROOT = 'https://gofly-1.onrender.com/api';
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
    if(page === 'destinos') loadDestinos();
    if(page === 'planes') loadPlanes();
    if(page === 'usuarios') loadUsuarios();
  });
});

document.getElementById('btn-login').addEventListener('click', ()=> showPage('login'));
document.getElementById('btn-logout').addEventListener('click', ()=> {
  TOKEN = null; localStorage.removeItem('gofly_token'); alert('Sesión cerrada'); showPage('home');
});

document.getElementById('explore-btn').addEventListener('click', ()=> {
  showPage('destinos'); loadDestinos();
});

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
  ]},
  { country: 'Inglaterra', countryImg: '/assets/images/london.jpg', places: [
    { id: 20, nombre: 'Big Ben', descripcion: 'Reloj emblemático', precio: 120000, imagen: 'london.jpg', puntuacion:4 },
    { id: 21, nombre: 'Tower Bridge', descripcion: 'Puente histórico', precio: 110000, imagen: 'london.jpg', puntuacion:4 },
    { id: 22, nombre: 'London Eye', descripcion: 'Noria con vistas', precio: 140000, imagen: 'london.jpg', puntuacion:5 }
  ]},
  { country: 'Estados Unidos', countryImg: '/assets/images/ny.jpg', places: [
    { id: 30, nombre: 'Times Square', descripcion: 'Corazón de NY', precio: 200000, imagen: 'ny.jpg', puntuacion:4 },
    { id: 31, nombre: 'Estatua de la Libertad', descripcion: 'Símbolo de libertad', precio: 180000, imagen: 'ny.jpg', puntuacion:5 },
    { id: 32, nombre: 'Central Park', descripcion: 'Parque urbano', precio: 90000, imagen: 'ny.jpg', puntuacion:4 }
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
  cont.innerHTML = 'Cargando...';
  const productos = await fetchProductosFromAPI();
  if(productos && Array.isArray(productos) && productos.length){
    const grouped = groupProductosByCountry(productos);
    cont.innerHTML = grouped.map(g=>`
      <div class="country-card">
        <img src="${g.countryImg ? '/assets/images/'+g.countryImg : '/assets/images/default.jpg'}" alt="${g.country}" />
        <h4>${g.country}</h4>
        <div class="small-muted">${g.places.length} lugares</div>
        <p>${g.places.slice(0,1)[0]?.descripcion || ''}</p>
        <div><button class="btn" data-country="${g.country}" onclick="window.goToPlans('${g.country}')">Ver planes</button></div>
      </div>
    `).join('');
  } else {
    cont.innerHTML = fallbackData.map(f=>`
      <div class="country-card">
        <img src="${f.countryImg}" alt="${f.country}" />
        <h4>${f.country}</h4>
        <div class="small-muted">${f.places.length} lugares</div>
        <p>${f.places[0].descripcion}</p>
        <div><button class="btn" data-country="${f.country}" onclick="window.goToPlans('${f.country}')">Ver planes</button></div>
      </div>
    `).join('');
  }
}

window.goToPlans = function(country){
  showPage('planes');
  loadPlanes(country);
}

async function loadPlanes(countryFilter = null){
  const cont = document.getElementById('planes-list');
  cont.innerHTML = 'Cargando...';
  const productos = await fetchProductosFromAPI();
  let dataToShow = [];
  if(productos && Array.isArray(productos) && productos.length){
    const grouped = groupProductosByCountry(productos);
    if(countryFilter){
      dataToShow = grouped.filter(g=>g.country===countryFilter);
    } else {
      dataToShow = grouped;
    }
    if(dataToShow.length===0){
      cont.innerHTML = '<div>No se encontraron planes para ese país.</div>';
      return;
    }
    cont.innerHTML = dataToShow.map(g=> renderCountryWithPlaces(g)).join('');
  } else {
    const filtered = countryFilter ? fallbackData.filter(f=>f.country===countryFilter) : fallbackData;
    cont.innerHTML = filtered.map(f=> renderCountryWithPlaces(f)).join('');
  }
  attachRatingListeners();
}

function renderCountryWithPlaces(g){
  return `
    <div>
      <h3>${g.country}</h3>
      <div class="grid">
        ${g.places.map(p=>`
          <div class="product-card">
            <img src="${p.imagen ? '/assets/images/'+p.imagen : '/assets/images/default.jpg'}" alt="${p.nombre}" />
            <h4>${p.nombre}</h4>
            <div class="small-muted">${p.descripcion || ''}</div>
            <p><strong>$${p.precio}</strong></p>
            <div class="rating" data-id="${p.id}">
              ${renderStars(p.puntuacion || 0)}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderStars(n){
  let s='';
  for(let i=1;i<=5;i++){
    s += `<span class="star" data-star="${i}">${ i<=n ? '★' : '☆' }</span>`;
  }
  return s;
}

function attachRatingListeners(){
  document.querySelectorAll('.rating').forEach(container=>{
    const id = container.dataset.id;
    container.querySelectorAll('.star').forEach(star=>{
      star.addEventListener('click', async ()=> {
        const val = parseInt(star.dataset.star);
        saveLocalRating(id, val);
        container.innerHTML = renderStars(val);
        attachRatingListeners();
        if(TOKEN){
          try {
            const res = await fetch(`${API_ROOT}/productos/${id}`, {
              method:'PUT',
              headers: { 'Content-Type':'application/json', 'Authorization':'Bearer '+TOKEN },
              body: JSON.stringify({ puntuacion: val })
            });
          } catch(e){
            console.warn('No se pudo guardar puntuación en backend', e);
          }
        }
      });
    });
  });
}

function saveLocalRating(id, val){
  const ratings = JSON.parse(localStorage.getItem('gofly_ratings') || '{}');
  ratings[id] = val;
  localStorage.setItem('gofly_ratings', JSON.stringify(ratings));
}

function loadLocalRatingsIntoDOM(){
  const ratings = JSON.parse(localStorage.getItem('gofly_ratings') || '{}');
  Object.keys(ratings).forEach(id=>{
    const cont = document.querySelector(`.rating[data-id="${id}"]`);
    if(cont) {
      cont.innerHTML = renderStars(ratings[id]);
    }
  });
  attachRatingListeners();
}

async function loadUsuarios(){
  const cont = document.getElementById('usuarios-list');
  cont.innerHTML = 'Cargando...';
  try {
    const res = await fetch(`${API_ROOT}/usuarios`);
    const datos = await res.json();
    cont.innerHTML = datos.map(u => `
      <div class="card small">
        <strong>${u.nombre}</strong>
        <div class="small-muted">${u.email}</div>
      </div>
    `).join('');
  } catch (e) { cont.innerHTML='Error cargando usuarios'; }
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
    alert('Inicio correcto');
    document.getElementById('btn-login').classList.add('hidden');
    document.getElementById('btn-logout').classList.remove('hidden');
    showPage('home');
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

window.addEventListener('load', ()=> {
  loadLocalRatingsIntoDOM();
  if(localStorage.getItem('gofly_token')) {
    document.getElementById('btn-login').classList.add('hidden');
    document.getElementById('btn-logout').classList.remove('hidden');
  }
});
