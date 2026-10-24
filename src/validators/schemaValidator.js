/**
 * Validador de esquemas de datos para el microservicio de inventario
 */

function validarProducto(producto) {
  const errores = [];

  if (!producto || typeof producto !== 'object') {
    return { valido: false, errores: ['El cuerpo del producto debe ser un objeto válido'] };
  }

  // Validación de nombre
  if (!producto.nombre || typeof producto.nombre !== 'string' || producto.nombre.trim().length < 3) {
    errores.push('El nombre debe tener al menos 3 caracteres');
  }

  // Validación de precio
  if (typeof producto.precio !== 'number' || producto.precio <= 0) {
    errores.push('El precio debe ser un número mayor a 0');
  }

  // Validación de SKU (Código de producto tipo PROD-XXXX)
  const skuRegex = /^PROD-[A-Z0-9]{4,8}$/;
  if (!producto.sku || !skuRegex.test(producto.sku)) {
    errores.push('El SKU debe tener el formato PROD-XXXX (ej: PROD-1001)');
  }

  // Validación de stock
  if (producto.stock !== undefined && (typeof producto.stock !== 'number' || producto.stock < 0)) {
    errores.push('El stock no puede ser un número negativo');
  }

  return {
    valido: errores.length === 0,
    errores
  };
}

function validarLogin(credenciales) {
  if (!credenciales || typeof credenciales !== 'object') {
    return { valido: false, mensaje: 'Credenciales inválidas' };
  }
  const { email, password } = credenciales;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return { valido: false, mensaje: 'Formato de correo electrónico inválido' };
  }
  if (!password || typeof password !== 'string' || password.length < 6) {
    return { valido: false, mensaje: 'La contraseña debe tener al menos 6 caracteres' };
  }
  return { valido: true };
}

module.exports = {
  validarProducto,
  validarLogin
};
