const test = require('node:test');
const assert = require('node:assert');
const { sumar, validarEmail } = require('./index');

test('Suite de Pruebas Unitarias - DevOps CI/CD', async (t) => {
  await t.test('sumar() debe calcular la suma correctamente', () => {
    assert.strictEqual(sumar(2, 3), 5);
    assert.strictEqual(sumar(-1, 1), 0);
  });

  await t.test('sumar() debe arrojar un error si los tipos no son números', () => {
    assert.throws(() => sumar('2', 3), {
      name: 'TypeError',
      message: 'Ambos argumentos deben ser números'
    });
  });

  await t.test('validarEmail() debe validar formatos correctos e incorrectos', () => {
    assert.strictEqual(validarEmail('devops@empresa.com'), true);
    assert.strictEqual(validarEmail('formato-invalido'), false);
  });
});
