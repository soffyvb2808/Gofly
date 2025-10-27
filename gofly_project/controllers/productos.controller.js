const db = require('../db');
const Producto = require('../models/Producto');

async function list(req, res) {
  try {
    const conn = db.promise();
    const [rows] = await conn.execute('SELECT * FROM productos');
    const productos = rows.map(r => Producto.fromRow(r));
    res.json(productos);
  } catch (err) {
    console.error('productos.list error', err);
    res.status(500).json({ error: 'Error en servidor' });
  }
}

async function getById(req, res) {
  try {
    const id = req.params.id;
    const conn = db.promise();
    const [rows] = await conn.execute('SELECT * FROM productos WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(Producto.fromRow(rows[0]));
  } catch (err) {
    console.error('productos.getById error', err);
    res.status(500).json({ error: 'Error en servidor' });
  }
}

async function create(req, res) {
  try {
    const { nombre, descripcion, precio, pais, ciudad, imagen, puntuacion } = req.body;
    if (!nombre) return res.status(400).json({ error: 'Nombre requerido' });

    const conn = db.promise();
    const [result] = await conn.execute(
      'INSERT INTO productos (nombre, descripcion, precio, pais, ciudad, imagen, puntuacion) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [nombre, descripcion || '', precio || 0, pais || '', ciudad || '', imagen || '', puntuacion || 0]
    );

    res.status(201).json({ message: 'Producto creado', id: result.insertId });
  } catch (err) {
    console.error('productos.create error', err && err.stack ? err.stack : err);
    res.status(500).json({ error: 'Error en servidor' });
  }
}

async function update(req, res) {
  try {
    const id = req.params.id;
    const { nombre, descripcion, precio, pais, ciudad, imagen, puntuacion } = req.body;
    const conn = db.promise();
    await conn.execute(
      `UPDATE productos SET
         nombre = COALESCE(?, nombre),
         descripcion = COALESCE(?, descripcion),
         precio = COALESCE(?, precio),
         pais = COALESCE(?, pais),
         ciudad = COALESCE(?, ciudad),
         imagen = COALESCE(?, imagen),
         puntuacion = COALESCE(?, puntuacion)
       WHERE id = ?`,
      [nombre || null, descripcion || null, (precio != null ? precio : null), pais || null, ciudad || null, imagen || null, (puntuacion != null ? puntuacion : null), id]
    );
    res.json({ message: 'Producto actualizado' });
  } catch (err) {
    console.error('productos.update error', err && err.stack ? err.stack : err);
    res.status(500).json({ error: 'Error en servidor' });
  }
}

async function remove(req, res) {
  try {
    const id = req.params.id;
    const conn = db.promise();
    await conn.execute('DELETE FROM productos WHERE id = ?', [id]);
    res.json({ message: 'Producto eliminado' });
  } catch (err) {
    console.error('productos.remove error', err);
    res.status(500).json({ error: 'Error en servidor' });
  }
}

module.exports = { list, getById, create, update, remove };
