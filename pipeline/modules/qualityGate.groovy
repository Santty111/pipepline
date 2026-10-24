/**
 * =============================================================================
 * MÓDULO GROOVY MODULAR: Quality Gate & Metrics Helper
 * Ubicación: pipeline/modules/qualityGate.groovy
 * 
 * Este módulo contiene la lógica Groovy para inspeccionar reportes de calidad,
 * validar métricas contra umbrales y generar resúmenes en consola.
 * =============================================================================
 */

/**
 * Valida el reporte de calidad generado por Sonar / Code-Quality
 */
def validarReporteCalidad(String rutaReporte) {
    if (!fileExists(rutaReporte)) {
        echo "⚠️ [QualityGate] No se encontró el archivo de reporte en ${rutaReporte}"
        return false
    }

    echo "📊 [QualityGate] Analizando reporte de calidad: ${rutaReporte}"
    String contenido = readFile(rutaReporte)
    
    // Inspección de estado en Groovy
    if (contenido.contains('"estado": "PASSED"')) {
        echo "✅ [QualityGate] El reporte confirma que todas las reglas de calidad fueron aprobadas."
        return true
    } else {
        echo "❌ [QualityGate] El Quality Gate reportó fallos en las métricas de tolerancia."
        return false
    }
}

/**
 * Imprime un encabezado formateado para trazabilidad de etapas
 */
def imprimirEncabezadoEtapa(String nombreEtapa, String descripcion) {
    echo "========================================================="
    echo " 🚀 [ETAPA MODULAR] ${nombreEtapa.toUpperCase()}"
    echo " 📝 ${descripcion}"
    echo " ⏱️  Timestamp: ${new Date().format('yyyy-MM-dd HH:mm:ss')}"
    echo "========================================================="
}

// Retornar 'this' para permitir la exportación de métodos en Jenkins
return this
