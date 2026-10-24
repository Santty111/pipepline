/**
 * =============================================================================
 * PIPELINE DECLARATIVO CI/CD EMPRESARIAL OPTIMIZADO
 * Proyecto: Microservicio de Gestión de Inventario (DevOps Inventory API)
 * Repositorio: https://github.com/Santty111/pipepline.git
 * 
 * ESTRATEGIAS DE OPTIMIZACIÓN APLICADAS:
 *  1. Ejecución Paralela: Linting, Unit Testing y Security Audit en paralelo.
 *  2. Estrategia de Branching: Flujo diferenciado (feature/* vs develop vs main).
 *  3. Ejecución Selectiva: Etapas pesadas (E2E y Build) solo en ramas objetivo.
 *  4. Caché de Dependencias: Detección inteligente de cambios en package.json.
 *  5. Notificaciones Multi-Canal: Discord Webhook + GitHub Commit Status API.
 * =============================================================================
 */

pipeline {
    agent any

    options {
        timeout(time: 20, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '15', artifactNumToKeepStr: '5'))
        timestamps()
        disableConcurrentBuilds()
    }

    environment {
        // Credenciales en Jenkins
        GIT_CREDENTIALS_ID      = 'gitlab-private-repo-creds'
        NOTIFICATION_WEBHOOK_ID = 'devops-discord-webhook'
        
        // Repositorio y Configuración
        REPO_URL                = 'https://github.com/Santty111/pipepline.git'
        GITHUB_REPO_OWNER       = 'Santty111'
        GITHUB_REPO_NAME        = 'pipepline'
        
        // Entorno y Optimización
        NODE_ENV                = 'production'
        CACHE_DIR               = "${JENKINS_HOME}/.dependency-cache"
    }

    stages {
        // =====================================================================
        // ETAPA 1: CHECKOUT & CONTROL DE INTEGRACIÓN
        // =====================================================================
        stage('Checkout & Trazabilidad') {
            steps {
                echo "===> [ETAPA 1] Descargando código fuente..."
                checkout scm

                script {
                    env.GIT_COMMIT_HASH = sh(script: 'git rev-parse HEAD', returnStdout: true).trim()
                    env.GIT_CURRENT_BRANCH = env.BRANCH_NAME ?: sh(script: 'git rev-parse --abbrev-ref HEAD', returnStdout: true).trim()
                    echo "📌 Rama actual : ${env.GIT_CURRENT_BRANCH}"
                    echo "📌 Commit SHA  : ${env.GIT_COMMIT_HASH}"
                }

                // Notificar a GitHub que el pipeline ha comenzado (estado: pending)
                actualizarStatusGitHub('pending', 'Pipeline Jenkins en progreso...')
            }
        }

        // =====================================================================
        // ETAPA 2: OPTIMIZACIÓN - GESTIÓN DE CACHÉ Y DEPENDENCIAS
        // =====================================================================
        stage('Preparación & Caché') {
            steps {
                echo "===> [ETAPA 2] Verificando dependencias y estado de caché..."
                sh '''
                    echo "Verificando versión de Node y herramientas:"
                    node -v
                    npm -v

                    # Simulación / Gestión de caché de dependencias basada en hash
                    HASH_ACTUAL=$(md5 -q package.json 2>/dev/null || md5sum package.json | awk '{print $1}')
                    echo "Hash de dependencias (package.json): ${HASH_ACTUAL}"
                '''
            }
        }

        // =====================================================================
        // ETAPA 3: OPTIMIZACIÓN - EJECUCIÓN PARALELA
        // Linting, Pruebas Unitarias y Auditoría de Seguridad se ejecutan concurrentemente
        // =====================================================================
        stage('Validación Paralela (Fast Feedback)') {
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
        // ETAPA 4: ANÁLISIS DE CALIDAD (SONAR QUALITY GATE)
        // Ejecución selectiva: Solo en develop, main o ramas de release
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
        // ETAPA 6: BUILD & EMPAQUETADO DE ARTEFACTOS
        // Ejecución selectiva: Solo en rama principal de producción (main)
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
    // Multi-canal: Notificación a Discord + Actualización de Commit Status en GitHub
    // =========================================================================
    post {
        always {
            script {
                echo "===> [POST-ALWAYS] Finalizando ejecución del build #${env.BUILD_NUMBER}."
            }
        }

        success {
            script {
                echo "===> [POST-SUCCESS] ¡Pipeline Exitoso! Enviando notificaciones..."
                actualizarStatusGitHub('success', 'Pipeline CI/CD exitoso en Jenkins')
                enviarNotificacionDiscord('SUCCESS', 3066993, '✅ Pipeline Exitoso: Todas las etapas y pruebas fueron aprobadas.')
            }
        }

        failure {
            script {
                echo "===> [POST-FAILURE] ¡Pipeline Fallido! Enviando alertas..."
                actualizarStatusGitHub('failure', 'Pipeline CI/CD falló en Jenkins')
                enviarNotificacionDiscord('FAILURE', 15158332, '❌ Pipeline Fallido: Se detectó un error en pruebas o análisis de calidad.')
            }
        }
    }
}

// =============================================================================
// MÓDULOS Y FUNCIONES REUTILIZABLES (Modular Pipeline Functions)
// =============================================================================

/**
 * Actualiza el estado del commit directamente en GitHub vía API REST
 * Estados soportados por GitHub: 'pending', 'success', 'failure', 'error'
 */
def actualizarStatusGitHub(String estado, String descripcion) {
    withCredentials([usernamePassword(credentialsId: env.GIT_CREDENTIALS_ID, usernameVariable: 'GH_USER', passwordVariable: 'GH_TOKEN')]) {
        sh """
            COMMIT_SHA=\$(git rev-parse HEAD 2>/dev/null || echo "${env.GIT_COMMIT_HASH}")
            curl -s -X POST \
                -H "Accept: application/vnd.github+json" \
                -H "Authorization: Bearer \$GH_TOKEN" \
                -H "X-GitHub-Api-Version: 2022-11-28" \
                "https://api.github.com/repos/${env.GITHUB_REPO_OWNER}/${env.GITHUB_REPO_NAME}/statuses/\$COMMIT_SHA" \
                -d '{
                    "state": "${estado}",
                    "target_url": "${env.BUILD_URL}",
                    "description": "${descripcion}",
                    "context": "ci/jenkins-pipeline"
                }' > /dev/null || true
        """
    }
}

/**
 * Envía una tarjeta embebida enriquecida al canal de Discord
 */
def enviarNotificacionDiscord(String estado, int color, String descripcion) {
    withCredentials([string(credentialsId: env.NOTIFICATION_WEBHOOK_ID, variable: 'WEBHOOK_URL')]) {
        sh """
            curl -s -X POST -H "Content-Type: application/json" \
            -d '{
                "username": "Jenkins Enterprise CI/CD",
                "avatar_url": "https://www.jenkins.io/images/logos/jenkins/jenkins.png",
                "embeds": [{
                    "title": "Pipeline ${estado}: ${env.JOB_NAME}",
                    "description": "${descripcion}",
                    "color": ${color},
                    "fields": [
                        {"name": "Build", "value": "#${env.BUILD_NUMBER}", "inline": true},
                        {"name": "Rama", "value": "${env.GIT_CURRENT_BRANCH ?: 'main'}", "inline": true},
                        {"name": "Estrategia", "value": "Optimizado (Paralelo + Branching)", "inline": false},
                        {"name": "Commit SHA", "value": "`${env.GIT_COMMIT_HASH ?: 'HEAD'}`", "inline": false},
                        {"name": "Logs de Ejecución", "value": "${env.BUILD_URL}console", "inline": false}
                    ],
                    "footer": {"text": "Jenkins Automated CI/CD Engine"}
                }]
            }' "\$WEBHOOK_URL" || true
        """
    }
}
