/**
 * Módulo de lógica de negocio para la demo de CI/CD
 */

function sumar(a, b) {
  if (typeof a !== 'number' || typeof b !== 'number') {
    throw new TypeError('Ambos argumentos deben ser números');
  }
  return a + b;
}

function validarEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

module.exports = {
  sumar,
  validarEmail
};
