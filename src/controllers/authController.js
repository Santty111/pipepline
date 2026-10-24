/**
 * Controlador de Autenticación y Sesiones
 */

const { validarLogin } = require('../validators/schemaValidator');

class AuthController {
  constructor() {
    this.usuarios = [
      { id: 1, email: 'admin@devops.corp', password: 'Password2026!', rol: 'ADMIN' },
      { id: 2, email: 'operador@devops.corp', password: 'Operador2026!', rol: 'OPERATOR' }
    ];
  }

  autenticar(credenciales) {
    const validacion = validarLogin(credenciales);
    if (!validacion.valido) {
      return { exito: false, codigo: 400, mensaje: validacion.mensaje };
    }

    const usuario = this.usuarios.find(
      u => u.email === credenciales.email && u.password === credenciales.password
    );

    if (!usuario) {
      return { exito: false, codigo: 401, mensaje: 'Credenciales inválidas' };
    }

    const token = `jwt_mock_${usuario.id}_${Date.now()}`;
    return {
      exito: true,
      codigo: 200,
      mensaje: 'Autenticación exitosa',
      token,
      usuario: { id: usuario.id, email: usuario.email, rol: usuario.rol }
    };
  }
}

module.exports = new AuthController();
