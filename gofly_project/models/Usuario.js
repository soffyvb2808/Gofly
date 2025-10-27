class Usuario {
  constructor(id, nombre, email, password, rol = 'cliente') {
    this.id = id;
    this.nombre = nombre;
    this.email = email;
    this.password = password;
    this.rol = rol;
  }

  static fromRow(row) {
    return new Usuario(row.id, row.nombre, row.email, row.password, row.rol);
  }
}

module.exports = Usuario;
