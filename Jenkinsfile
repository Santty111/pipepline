/**
 * =============================================================================
 * PIPELINE DECLARATIVO CI/CD EMPRESARIAL - ARQUITECTURA MODULAR
 * Proyecto: Microservicio de Gestión de Inventario (DevOps Inventory API)
 * Repositorio: https://github.com/Santty111/pipepline.git
 * 
 * MODULARIDAD APLICADA (Separación de Código Groovy):
 *  - pipeline/modules/notifications.groovy : Gestión desacoplada de notificaciones.
 *  - pipeline/modules/qualityGate.groovy   : Inspección de métricas y Quality Gate.
 *  - Jenkinsfile                            : Orquestación pura declarativa.
 * =============================================================================
 */

// Instancias globales de los módulos Groovy separados
def notificador = null
def qualityHelper = null

pipeline {
    agent any

    options {
        timeout(time: 20, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '15', artifactNumToKeepStr: '5'))
        timestamps()
        disableConcurrentBuilds()
    }

    environment {
        // Credenciales registradas en Jenkins
        GIT_CREDENTIALS_ID      = 'gitlab-private-repo-creds'
        NOTIFICATION_WEBHOOK_ID = 'devops-discord-webhook'
        
        // Repositorio y Contexto GitHub
        REPO_URL                = 'https://github.com/Santty111/pipepline.git'
        GITHUB_REPO_OWNER       = 'Santty111'
        GITHUB_REPO_NAME        = 'pipepline'
        
        // Entorno
        NODE_ENV                = 'production'
    }

    stages {
        // =====================================================================
        // ETAPA 1: CHECKOUT & CARGA MODULAR DE SCRIPTS GROOVY
        // =====================================================================
        stage('Checkout & Módulos Groovy') {
            steps {
                echo "===> [ETAPA 1] Descargando repositorio..."
                checkout scm

                script {
                    // Carga dinámica de los módulos Groovy externos
                    notificador = load 'pipeline/modules/notifications.groovy'
                    qualityHelper = load 'pipeline/modules/qualityGate.groovy'

                    env.GIT_COMMIT_HASH = sh(script: 'git rev-parse HEAD', returnStdout: true).trim()
                    env.GIT_CURRENT_BRANCH = env.BRANCH_NAME ?: sh(script: 'git rev-parse --abbrev-ref HEAD', returnStdout: true).trim()

                    qualityHelper.imprimirEncabezadoEtapa('Integración', "Módulos cargados exitosamente en rama: ${env.GIT_CURRENT_BRANCH}")

                    // Notificación inicial a GitHub Commit Status vía módulo Groovy
                    notificador.actualizarStatusGitHub(
                        estado: 'pending',
                        descripcion: 'Pipeline Jenkins en progreso...'
                    )
                }
            }
        }

        // =====================================================================
        // ETAPA 2: OPTIMIZACIÓN - GESTIÓN DE CACHÉ Y DEPENDENCIAS
        // =====================================================================
        stage('Preparación & Caché') {
            steps {
                echo "===> [ETAPA 2] Verificando dependencias y estado de caché..."
                sh '''
                    echo "Versiones del entorno:"
                    node -v
                    npm -v
                    HASH_ACTUAL=$(md5 -q package.json 2>/dev/null || md5sum package.json | awk '{print $1}')
                    echo "Hash de dependencias (package.json): ${HASH_ACTUAL}"
                '''
            }
        }

        // =====================================================================
        // ETAPA 3: OPTIMIZACIÓN - EJECUCIÓN PARALELA (FAST FEEDBACK)
        // =====================================================================
        stage('Validación Paralela') {
            parallel {
                stage('Linter & Code Style') {
                    steps {
                        echo "===> [Paralelo 1/3] Ejecutando Linter y Análisis Estático..."
                        sh 'npm run lint'
                    }
                }

                stage('Pruebas Unitarias') {
                    steps {
                        echo "===> [Paralelo 2/3] Ejecutando Pruebas Unitarias de Negocio..."
                        sh 'npm run test:unit'
                    }
                }

                stage('Auditoría de Seguridad') {
                    steps {
                        echo "===> [Paralelo 3/3] Ejecutando Auditoría de Vulnerabilidades..."
                        sh 'npm run audit'
                    }
                }
            }
        }

        // =====================================================================
        // ETAPA 4: ANÁLISIS DE CALIDAD & QUALITY GATE
        // Ejecución selectiva: develop, main o ramas release
        // =====================================================================
        stage('Calidad de Código & Sonar Gate') {
            when {
                anyOf {
                    branch 'main'
                    branch 'master'
                    branch 'develop'
                    branch pattern: 'release/*', comparator: 'GLOB'
                }
            }
            steps {
                echo "===> [ETAPA 4] Ejecutando Análisis de Deuda Técnica y Quality Gate..."
                sh 'npm run quality:sonar'
                script {
                    qualityHelper.validarReporteCalidad('code-quality-report.json')
                }
                archiveArtifacts artifacts: 'code-quality-report.json', allowEmptyArchive: true
            }
        }

        // =====================================================================
        // ETAPA 5: PRUEBAS DE INTEGRACIÓN Y E2E (API TEST)
        // Ejecución selectiva: Valida el servidor HTTP en vivo
        // =====================================================================
        stage('Pruebas de Integración (E2E)') {
            when {
                anyOf {
                    branch 'main'
                    branch 'master'
                    branch 'develop'
                }
            }
            steps {
                echo "===> [ETAPA 5] Ejecutando Pruebas de Integración End-to-End sobre el Servidor..."
                sh 'npm run test:integration'
            }
        }

        // =====================================================================
        // ETAPA 6: BUILD & EMPAQUETADO DE PRODUCCIÓN
        // Ejecución selectiva: Solo en rama principal de producción (main / release)
        // =====================================================================
        stage('Build & Empaquetado') {
            when {
                anyOf {
                    branch 'main'
                    branch 'master'
                    branch pattern: 'release/*', comparator: 'GLOB'
                }
            }
            steps {
                echo "===> [ETAPA 6] Empaquetando artefactos optimizados para producción..."
                sh 'npm run build'
            }
        }
    }

    // =========================================================================
    // POST-ACTIONS: NOTIFICACIONES (ALWAYS, SUCCESS, FAILURE)
    // Invoca los métodos de los módulos Groovy externos
    // =========================================================================
    post {
        always {
            script {
                echo "===> [POST-ALWAYS] Finalizando ejecución del build #${env.BUILD_NUMBER}."
            }
        }

        success {
            script {
                echo "===> [POST-SUCCESS] ¡Pipeline Exitoso! Invocando módulo Groovy de notificación..."
                if (notificador) {
                    notificador.actualizarStatusGitHub(
                        estado: 'success',
                        descripcion: 'Pipeline CI/CD exitoso en Jenkins'
                    )
                    notificador.enviarNotificacionDiscord(
                        estado: 'SUCCESS',
                        color: 3066993,
                        descripcion: '✅ Pipeline Exitoso: Todas las etapas y pruebas fueron aprobadas.'
                    )
                }
            }
        }

        failure {
            script {
                echo "===> [POST-FAILURE] ¡Pipeline Fallido! Invocando módulo Groovy de alerta..."
                if (notificador) {
                    notificador.actualizarStatusGitHub(
                        estado: 'failure',
                        descripcion: 'Pipeline CI/CD falló en Jenkins'
                    )
                    notificador.enviarNotificacionDiscord(
                        estado: 'FAILURE',
                        color: 15158332,
                        descripcion: '❌ Pipeline Fallido: Se detectó un error en pruebas o análisis de calidad.'
                    )
                }
            }
        }
    }
}
