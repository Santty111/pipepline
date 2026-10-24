/**
 * Aplicación REST API de Inventario y Operaciones CI/CD
 * Diseñada para producción: Enrutamiento nativo, CORS, JSON Parser y métricas.
 */

const http = require('node:http');
const url = require('node:url');
const productController = require('./controllers/productController');
const authController = require('./controllers/authController');

function parsearJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      if (!body) {
        return resolve({});
      }
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject(new Error('JSON malformado en el cuerpo de la petición'));
      }
    });
    req.on('error', reject);
  });
}

function responderJson(res, statusCode, datos) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'X-Service-Name': 'DevOps-Inventory-API',
    'X-Build-Version': process.env.BUILD_VERSION || '1.0.0'
  });
  res.end(JSON.stringify(datos));
}

function crearServidor() {
  const tiempoInicio = Date.now();

  return http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const method = req.method.toUpperCase();

    // Manejo de pre-flight CORS
    if (method === 'OPTIONS') {
      res.writeHead(204, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      });
      return res.end();
    }

    try {
      // 1. Healthcheck Endpoint
      if (pathname === '/api/health' && method === 'GET') {
        const memoria = process.memoryUsage();
        return responderJson(res, 200, {
          estado: 'SALUDABLE',
          uptimeSegundos: Math.floor((Date.now() - tiempoInicio) / 1000),
          timestamp: new Date().toISOString(),
          version: process.env.BUILD_VERSION || '1.0.0-ci',
          memoriaRssMb: Math.round(memoria.rss / 1024 / 1024)
        });
      }

      // 2. Metrics Endpoint (Observabilidad)
      if (pathname === '/api/metrics' && method === 'GET') {
        return responderJson(res, 200, {
          totalProductos: productController.obtenerTodos().total,
          nodeVersion: process.version,
          plataforma: process.platform,
          arquitectura: process.arch
        });
      }

      // 3. Auth Endpoint (Login)
      if (pathname === '/api/auth/login' && method === 'POST') {
        const body = await parsearJsonBody(req);
        const resultado = authController.autenticar(body);
        return responderJson(res, resultado.codigo, resultado);
      }

      // 4. Products: GET /api/products
      if (pathname === '/api/products' && method === 'GET') {
        const filtros = {};
        if (parsedUrl.query.categoria) {
          filtros.categoria = parsedUrl.query.categoria;
        }
        if (parsedUrl.query.enStock === 'true') {
          filtros.enStock = true;
        }
        const resultado = productController.obtenerTodos(filtros);
        return responderJson(res, 200, resultado);
      }

      // 5. Products: POST /api/products
      if (pathname === '/api/products' && method === 'POST') {
        const body = await parsearJsonBody(req);
        const resultado = productController.crear(body);
        const status = resultado.exito ? 201 : 400;
        return responderJson(res, status, resultado);
      }

      // 6. Products: GET /api/products/:id
      const matchProductoId = pathname.match(/^\/api\/products\/(\d+)$/);
      if (matchProductoId && method === 'GET') {
        const id = matchProductoId[1];
        const resultado = productController.obtenerPorId(id);
        const status = resultado.exito ? 200 : 404;
        return responderJson(res, status, resultado);
      }

      // Ruta no encontrada
      return responderJson(res, 404, {
        exito: false,
        error: 'Ruta no encontrada',
        ruta: pathname
      });
    } catch (err) {
      return responderJson(res, 500, {
        exito: false,
        error: 'Error interno del servidor',
        detalle: err.message
      });
    }
  });
}

module.exports = {
  crearServidor
};
