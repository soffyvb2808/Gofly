const db = require('../db');
const Usuario = require('../models/Usuario');

exports.getAllUsuarios = async (req, res) => {
  try {
    const conn = db.promise();
    const [results] = await conn.execute('SELECT id, nombre, email, rol, created_at FROM usuarios');
    res.json(results.map(r => ({ id: r.id, nombre: r.nombre, email: r.email, rol: r.rol })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.getUsuarioById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const conn = db.promise();
    const [results] = await conn.execute('SELECT id, nombre, email, rol FROM usuarios WHERE id=?', [id]);
    if (results.length === 0) return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    res.json(results[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.createUsuario = async (req, res) => {
  try {
    const { nombre, email, password } = req.body;
    if (!nombre || !email || !password) return res.status(400).json({ error: 'Faltan datos' });
    const bcrypt = require('bcryptjs');
    const hash = await bcrypt.hash(password, 10);
    const conn = db.promise();
    const [result] = await conn.execute('INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)', [nombre, email, hash]);
    res.json({ mensaje: 'Usuario creado', id: result.insertId });
  } catch (err) {
    console.error(err);
    if (err && err.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: 'Email ya registrado' });
    res.status(500).json({ error: err.message });
  }
};

exports.updateUsuario = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { nombre, email, password } = req.body;
    const conn = db.promise();
    if (password) {
      const bcrypt = require('bcryptjs');
      const hash = await bcrypt.hash(password, 10);
      await conn.execute('UPDATE usuarios SET nombre=?, email=?, password=? WHERE id=?', [nombre, email, hash, id]);
    } else {
      await conn.execute('UPDATE usuarios SET nombre=?, email=? WHERE id=?', [nombre, email, id]);
    }
    res.json({ mensaje: 'Usuario actualizado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.deleteUsuario = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const conn = db.promise();
    const [result] = await conn.execute('DELETE FROM usuarios WHERE id=?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    res.json({ mensaje: 'Usuario eliminado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
