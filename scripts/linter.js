/**
 * Linter Estático para CI/CD (Reglas ESLint / Clean Code)
 * Inspecciona estilo, sintaxis, variables no permitidas y anti-patrones.
 */

const fs = require('node:fs');
const path = require('node:path');
const { execSync } = require('node:child_process');

const REGLAS = {
  LONGITUD_MAXIMA_LINEA: 130,
  PROHIBIDO_EVAL: /\beval\s*\(/,
  PROHIBIDO_DEBUGGER: /\bdebugger\b/,
  PROHIBIDO_VAR: /\bvar\s+[a-zA-Z0-9_$]+/,
  ESPACIOS_AL_FINAL: /[ \t]+$/
};

function obtenerArchivosJs(directorio) {
  let archivos = [];
  const elementos = fs.readdirSync(directorio, { withFileTypes: true });

  for (const elemento of elementos) {
    const rutaCompleta = path.join(directorio, elemento.name);
    if (elemento.isDirectory()) {
      if (elemento.name !== 'node_modules' && elemento.name !== '.git') {
        archivos = archivos.concat(obtenerArchivosJs(rutaCompleta));
      }
    } else if (elemento.name.endsWith('.js')) {
      archivos.push(rutaCompleta);
    }
  }
  return archivos;
}

console.log('🔍 [Linter & Code Style] Iniciando verificación estática de código...');

const carpetas = [path.join(__dirname, '../src'), path.join(__dirname, '../tests')];
let totalArchivos = 0;
let totalErrores = 0;
let totalAdvertencias = 0;

for (const carpeta of carpetas) {
  if (!fs.existsSync(carpeta)) continue;
  const archivos = obtenerArchivosJs(carpeta);
  totalArchivos += archivos.length;

  for (const archivo of archivos) {
    const nombreRelativo = path.relative(path.join(__dirname, '..'), archivo);

    // 1. Verificación de sintaxis nativa
    try {
      execSync(`node --check "${archivo}"`, { stdio: 'pipe' });
    } catch (syntaxErr) {
      console.error(`❌ [SINTAXIS ERROR] ${nombreRelativo}: Error de parseo sintáctico`);
      totalErrores++;
      continue;
    }

    // 2. Verificación de reglas de estilo
    const contenido = fs.readFileSync(archivo, 'utf8');
    const lineas = contenido.split('\n');

    lineas.forEach((linea, index) => {
      const numLinea = index + 1;

      // Regla: Prohibido eval()
      if (REGLAS.PROHIBIDO_EVAL.test(linea)) {
        console.error(`❌ [ERROR - SEGURIDAD] ${nombreRelativo}:${numLinea} - Uso de 'eval()' estrictamente prohibido.`);
        totalErrores++;
      }

      // Regla: Prohibido debugger
      if (REGLAS.PROHIBIDO_DEBUGGER.test(linea)) {
        console.error(`❌ [ERROR - CALIDAD] ${nombreRelativo}:${numLinea} - Sentencia 'debugger' detectada.`);
        totalErrores++;
      }

      // Regla: Uso moderno de const / let en lugar de var
      if (REGLAS.PROHIBIDO_VAR.test(linea)) {
        console.warn(`⚠️ [WARNING - ESTILO] ${nombreRelativo}:${numLinea} - Preferir 'const' o 'let' en lugar de 'var'.`);
        totalAdvertencias++;
      }

      // Regla: Espacios en blanco al final de línea
      if (REGLAS.ESPACIOS_AL_FINAL.test(linea)) {
        console.warn(`⚠️ [WARNING - FORMATO] ${nombreRelativo}:${numLinea} - Espacios en blanco residuales al final de la línea.`);
        totalAdvertencias++;
      }
    });
  }
}

console.log('------------------------------------------------------------');
console.log(`📊 Resumen Linter: ${totalArchivos} archivos analizados.`);
console.log(`   Errores críticos: ${totalErrores}`);
console.log(`   Advertencias    : ${totalAdvertencias}`);
console.log('------------------------------------------------------------');

if (totalErrores > 0) {
  console.error('❌ Fallo en el Linter: Se encontraron errores de estilo o seguridad.');
  process.exit(1);
} else {
  console.log('✅ Linter aprobado: El código cumple con los estándares de estilo y seguridad.');
  process.exit(0);
}
