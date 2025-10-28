const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'miClaveMuySecreta';

async function register(req, res) {
  try {
    const { nombre, email, password } = req.body;
    if (!nombre || !email || !password) return res.status(400).json({ error: 'Faltan datos' });

    const conn = db.promise();
    const [exists] = await conn.execute('SELECT id FROM usuarios WHERE email = ?', [email]);
    if (exists.length) return res.status(400).json({ error: 'Email ya registrado' });

    const hash = await bcrypt.hash(password, 10);
    const [result] = await conn.execute(
      'INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)',
      [nombre, email, hash]
    );

    res.status(201).json({ message: 'Usuario creado', id: result.insertId });
  } catch (err) {
    console.error('register error', err);
    res.status(500).json({ error: 'Error en servidor' });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Faltan datos' });

    const conn = db.promise();
    const [rows] = await conn.execute('SELECT * FROM usuarios WHERE email = ?', [email]);
    if (rows.length === 0) return res.status(401).json({ error: 'Credenciales inválidas' });

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Credenciales inválidas' });

    const token = jwt.sign({ id: user.id, email: user.email }, SECRET, { expiresIn: '4h' });
    res.json({ token });
  } catch (err) {
    console.error('login error', err);
    res.status(500).json({ error: 'Error en servidor' });
  }
}

module.exports = { register, login };
