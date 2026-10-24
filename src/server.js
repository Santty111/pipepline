/**
 * Punto de entrada para ejecución del servidor de producción
 */

const { crearServidor } = require('./app');

const PUERTO = process.env.PORT || 3000;
const servidor = crearServidor();

servidor.listen(PUERTO, () => {
  console.log(`========================================================`);
  console.log(` 🚀 Microservicio de Inventario iniciado`);
  console.log(` 📡 Escuchando en: http://localhost:${PUERTO}`);
  console.log(` 🩺 Healthcheck  : http://localhost:${PUERTO}/api/health`);
  console.log(`========================================================`);
});

// Manejo seguro de señales de terminación (Graceful Shutdown)
process.on('SIGTERM', () => {
  console.log('Recibida señal SIGTERM. Cerrando servidor ordenadamente...');
  servidor.close(() => {
    console.log('Servidor cerrado.');
    process.exit(0);
  });
});
