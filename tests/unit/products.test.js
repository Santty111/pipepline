const test = require('node:test');
const assert = require('node:assert');
const productController = require('../../src/controllers/productController');

test('Suite de Pruebas Unitarias - Controlador de Productos', async (t) => {
  t.beforeEach(() => {
    productController.reiniciarDatos();
  });

  await t.test('obtenerTodos() debe devolver el listado inicial de productos', () => {
    const res = productController.obtenerTodos();
    assert.strictEqual(res.exito, true);
    assert.strictEqual(res.total, 3);
  });

  await t.test('crear() debe agregar un nuevo producto con ID autoincremental', () => {
    const nuevo = {
      nombre: 'Router Mikrotik CCR2004',
      categoria: 'Redes',
      precio: 550.00,
      sku: 'PROD-ROUT1',
      stock: 5
    };
    const res = productController.crear(nuevo);
    assert.strictEqual(res.exito, true);
    assert.strictEqual(res.datos.id, 4);
    assert.strictEqual(res.datos.nombre, 'Router Mikrotik CCR2004');
  });

  await t.test('actualizarStock() debe modificar la cantidad o rechazar si es insuficiente', () => {
    const res = productController.actualizarStock(1, -2);
    assert.strictEqual(res.exito, true);
    assert.strictEqual(res.datos.stock, 10);

    const resInvalido = productController.actualizarStock(1, -999);
    assert.strictEqual(resInvalido.exito, false);
  });

  await t.test('buscarPorTermino() debe filtrar productos por nombre o categoría', () => {
    const res = productController.buscarPorTermino('cisco');
    assert.strictEqual(res.exito, true);
    assert.strictEqual(res.total, 1);
    assert.strictEqual(res.datos[0].sku, 'PROD-1002');
  });
});
