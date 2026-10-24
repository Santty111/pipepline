const test = require('node:test');
const assert = require('node:assert');
const { crearServidor } = require('../../src/app');

test('Suite de Pruebas de Integración y End-to-End (E2E API Test)', async (t) => {
  let servidor;
  let baseUrl;

  // Iniciar servidor en puerto libre antes de los tests
  await new Promise((resolve) => {
    servidor = crearServidor();
    servidor.listen(0, '127.0.0.1', () => {
      const puerto = servidor.address().port;
      baseUrl = `http://127.0.0.1:${puerto}`;
      resolve();
    });
  });

  t.after(() => {
    servidor.close();
  });

  await t.test('GET /api/health debe responder 200 y estado SALUDABLE', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.estado, 'SALUDABLE');
    assert.ok(data.uptimeSegundos !== undefined);
  });

  await t.test('GET /api/products debe devolver el catálogo en formato JSON', async () => {
    const res = await fetch(`${baseUrl}/api/products`);
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.exito, true);
    assert.ok(Array.isArray(data.datos));
  });

  await t.test('POST /api/products debe crear un producto y retornar status 201', async () => {
    const nuevo = {
      nombre: 'Access Point WiFi 6 AX3000',
      precio: 199.90,
      sku: 'PROD-WIFI6',
      stock: 15
    };
    const res = await fetch(`${baseUrl}/api/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nuevo)
    });
    const data = await res.json();
    assert.strictEqual(res.status, 201);
    assert.strictEqual(data.exito, true);
    assert.strictEqual(data.datos.sku, 'PROD-WIFI6');
  });

  await t.test('POST /api/auth/login debe autenticar credenciales correctas', async () => {
    const loginPayload = {
      email: 'admin@devops.corp',
      password: 'Password2026!'
    };
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginPayload)
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.exito, true);
    assert.ok(data.token.startsWith('jwt_mock_'));
  });
});
