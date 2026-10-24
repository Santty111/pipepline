const test = require('node:test');
const assert = require('node:assert');
const { validarProducto, validarLogin } = require('../../src/validators/schemaValidator');

test('Suite de Pruebas Unitarias - Validador de Esquemas', async (t) => {
  await t.test('validarProducto() debe aprobar un producto con estructura válida', () => {
    const productoValido = {
      nombre: 'Memoria RAM DDR5 32GB',
      precio: 145.50,
      sku: 'PROD-RAM5',
      stock: 20
    };
    const resultado = validarProducto(productoValido);
    assert.strictEqual(resultado.valido, true);
    assert.strictEqual(resultado.errores.length, 0);
  });

  await t.test('validarProducto() debe rechazar productos con nombre muy corto o precio negativo', () => {
    const productoInvalido = {
      nombre: 'A',
      precio: -10,
      sku: 'INV',
      stock: -5
    };
    const resultado = validarProducto(productoInvalido);
    assert.strictEqual(resultado.valido, false);
    assert.strictEqual(resultado.errores.length, 4);
  });

  await t.test('validarLogin() debe validar correos y contraseñas seguras', () => {
    assert.strictEqual(validarLogin({ email: 'admin@devops.corp', password: 'Password123' }).valido, true);
    assert.strictEqual(validarLogin({ email: 'correo-invalido', password: '123' }).valido, false);
  });
});
