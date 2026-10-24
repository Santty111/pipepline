/**
 * Controlador de Inventario y Productos
 */

const { validarProducto } = require('../validators/schemaValidator');

class ProductController {
  constructor() {
    this.productos = [
      { id: 1, sku: 'PROD-1001', nombre: 'Servidor Dell PowerEdge R750', categoria: 'Hardware', precio: 3499.99, stock: 12 },
      { id: 2, sku: 'PROD-1002', nombre: 'Switch Cisco Catalyst 9300', categoria: 'Redes', precio: 1890.50, stock: 8 },
      { id: 3, sku: 'PROD-1003', nombre: 'Storage SSD Enterprise 3.84TB', categoria: 'Almacenamiento', precio: 620.00, stock: 45 }
    ];
    this.ultimoId = 3;
  }

  obtenerTodos(filtros = {}) {
    let resultado = [...this.productos];
    if (filtros.categoria) {
      resultado = resultado.filter(p => p.categoria.toLowerCase() === filtros.categoria.toLowerCase());
    }
    if (filtros.enStock === true) {
      resultado = resultado.filter(p => p.stock > 0);
    }
    return { exito: true, total: resultado.length, datos: resultado };
  }

  obtenerPorId(id) {
    const producto = this.productos.find(p => p.id === Number(id));
    if (!producto) {
      return { exito: false, error: 'Producto no encontrado' };
    }
    return { exito: true, datos: producto };
  }

  crear(nuevoProducto) {
    const validacion = validarProducto(nuevoProducto);
    if (!validacion.valido) {
      return { exito: false, errores: validacion.errores };
    }

    const skuExistente = this.productos.some(p => p.sku === nuevoProducto.sku);
    if (skuExistente) {
      return { exito: false, errores: [`El SKU ${nuevoProducto.sku} ya está registrado`] };
    }

    this.ultimoId += 1;
    const productoCreado = {
      id: this.ultimoId,
      sku: nuevoProducto.sku,
      nombre: nuevoProducto.nombre.trim(),
      categoria: nuevoProducto.categoria || 'General',
      precio: Number(nuevoProducto.precio),
      stock: nuevoProducto.stock !== undefined ? Number(nuevoProducto.stock) : 0,
      creadoEn: new Date().toISOString()
    };

    this.productos.push(productoCreado);
    return { exito: true, datos: productoCreado };
  }

  actualizarStock(id, cantidad) {
    const producto = this.productos.find(p => p.id === Number(id));
    if (!producto) {
      return { exito: false, error: 'Producto no encontrado' };
    }
    if (producto.stock + cantidad < 0) {
      return { exito: false, error: 'Stock insuficiente para descontar la cantidad solicitada' };
    }
    producto.stock += cantidad;
    return { exito: true, datos: producto };
  }

  reiniciarDatos() {
    this.productos = [
      { id: 1, sku: 'PROD-1001', nombre: 'Servidor Dell PowerEdge R750', categoria: 'Hardware', precio: 3499.99, stock: 12 },
      { id: 2, sku: 'PROD-1002', nombre: 'Switch Cisco Catalyst 9300', categoria: 'Redes', precio: 1890.50, stock: 8 },
      { id: 3, sku: 'PROD-1003', nombre: 'Storage SSD Enterprise 3.84TB', categoria: 'Almacenamiento', precio: 620.00, stock: 45 }
    ];
    this.ultimoId = 3;
  }
}

module.exports = new ProductController();
