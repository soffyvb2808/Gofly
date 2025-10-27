class Producto {
  constructor(id, nombre, descripcion, precio, pais, ciudad, imagen, puntuacion) {
    this.id = id;
    this.nombre = nombre;
    this.descripcion = descripcion;
    this.precio = precio;
    this.pais = pais;
    this.ciudad = ciudad;
    this.imagen = imagen;
    this.puntuacion = puntuacion;
  }

  static fromRow(row) {
    return new Producto(
      row.id, row.nombre, row.descripcion, Number(row.precio),
      row.pais, row.ciudad, row.imagen, row.puntuacion
    );
  }
}

module.exports = Producto;
