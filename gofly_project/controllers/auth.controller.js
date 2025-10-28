const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'miClaveMuySecreta';

async function register(req, res) {
  try {
    const { nombre, email, password } = req.body;
    if (!nombre || !email || !password)
      return res.status(400).json({ error: 'Faltan datos' });

    const existe = db.usuarios.find(u => u.email === email);
    if (existe) return res.status(400).json({ error: 'Email ya registrado' });

    const hash = await bcrypt.hash(password, 10);
    const nuevo = { id: db.usuarios.length + 1, nombre, email, password: hash };
    db.usuarios.push(nuevo);

    res.status(201).json({ message: 'Usuario creado', id: nuevo.id });
  } catch (err) {
    console.error('register error', err);
    res.status(500).json({ error: 'Error en servidor' });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    const user = db.usuarios.find(u => u.email === email);
    if (!user) return res.status(401).json({ error: 'Credenciales inválidas' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Credenciales inválidas' });

    const token = jwt.sign({ id: user.id, email: user.email }, SECRET, { expiresIn: '4h' });
    res.json({ token, nombre: user.nombre });
  } catch (err) {
    console.error('login error', err);
    res.status(500).json({ error: 'Error en servidor' });
  }
}

module.exports = { register, login };
