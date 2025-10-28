
console.log("Usando base de datos simulada (modo demostración)");


const productos = [
  { id: 1, nombre: "Torre Eiffel", descripcion: "El ícono de París, Francia", precio: 450, pais: "Francia" },
  { id: 2, nombre: "Museo del Louvre", descripcion: "El museo más visitado del mundo", precio: 380, pais: "Francia" },
  { id: 3, nombre: "Disneyland Paris", descripcion: "Diversión familiar en París", precio: 520, pais: "Francia" },
  { id: 4, nombre: "Coliseo Romano", descripcion: "El anfiteatro más famoso del mundo", precio: 600, pais: "Italia" },
  { id: 5, nombre: "Canales de Venecia", descripcion: "Paseos románticos por la ciudad flotante", precio: 550, pais: "Italia" },
  { id: 6, nombre: "Catedral de Florencia", descripcion: "Una joya arquitectónica del Renacimiento", precio: 480, pais: "Italia" },
  { id: 7, nombre: "Big Ben", descripcion: "El reloj más emblemático de Londres", precio: 400, pais: "Inglaterra" },
  { id: 8, nombre: "London Eye", descripcion: "Rueda panorámica con vistas espectaculares", precio: 370, pais: "Inglaterra" },
  { id: 9, nombre: "Puente de la Torre", descripcion: "Uno de los puentes más famosos del mundo", precio: 390, pais: "Inglaterra" },
  { id: 10, nombre: "Estatua de la Libertad", descripcion: "Símbolo de Nueva York y EE.UU.", precio: 700, pais: "Estados Unidos" },
  { id: 11, nombre: "Central Park", descripcion: "El pulmón verde de Manhattan", precio: 350, pais: "Estados Unidos" },
  { id: 12, nombre: "Times Square", descripcion: "Corazón luminoso de Nueva York", precio: 420, pais: "Estados Unidos" },
];

const usuarios = [
  { id: 1, nombre: "Laura Vargas", email: "laura@example.com", password: "123456" },
  { id: 2, nombre: "Juan Pérez", email: "juan@example.com", password: "123456" },
];

const db = {
  promise: () => ({
    execute: async (query, params) => {
      
      if (query.includes("FROM productos")) return [[...productos]];
      if (query.includes("INSERT INTO productos")) {
        const nuevo = { id: productos.length + 1, nombre: params[0], descripcion: params[1], precio: params[2] };
        productos.push(nuevo);
        return [{ insertId: nuevo.id }];
      }
      if (query.includes("DELETE FROM productos")) {
        const id = params[0];
        const index = productos.findIndex(p => p.id == id);
        if (index >= 0) productos.splice(index, 1);
        return [{}];
      }

      if (query.includes("FROM usuarios")) return [[...usuarios]];
      if (query.includes("INSERT INTO usuarios")) {
        const nuevo = { id: usuarios.length + 1, nombre: params[1], email: params[2], password: params[3] };
        usuarios.push(nuevo);
        return [{ insertId: nuevo.id }];
      }
      if (query.includes("DELETE FROM usuarios")) {
        const id = params[0];
        const index = usuarios.findIndex(u => u.id == id);
        if (index >= 0) usuarios.splice(index, 1);
        return [{}];
      }

      return [[[]]];
    }
  })
};

module.exports = db;
