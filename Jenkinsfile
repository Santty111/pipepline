pipeline {
    agent any

    // Opciones globales del Pipeline
    options {
        timeout(time: 15, unit: 'MINUTES')     // Evita que el job se quede colgado
        buildDiscarder(logRotator(numToKeepStr: '10')) // Mantiene solo los últimos 10 builds
        timestamps()                           // Agrega marcas de tiempo a la consola
    }

    // Parámetros y variables de entorno configurables
    environment {
        // ID de la credencial registrada en Jenkins (Administrar Jenkins -> Credentials)
        GIT_CREDENTIALS_ID = 'gitlab-private-repo-creds'
        
        // URL de tu repositorio privado (HTTPS con Personal Access Token o SSH)
        // Ejemplo HTTPS: 'https://gitlab.com/tu-usuario/tu-repo.git'
        // Ejemplo SSH:   'git@gitlab.com:tu-usuario/tu-repo.git'
        REPO_URL           = 'https://github.com/Santty111/pipepline.git'
        REPO_BRANCH        = 'main'

        // ID de credencial tipo "Secret text" en Jenkins para la notificación
        // (ejemplo: URL de Webhook de Discord o Slack)
        NOTIFICATION_WEBHOOK_ID = 'devops-discord-webhook'
    }

    stages {
        // =========================================================================
        // ETAPA 1: CHECKOUT / INTEGRACIÓN
        // Descarga segura del código desde el repositorio privado usando credenciales
        // =========================================================================
        stage('Checkout / Integración') {
            steps {
                script {
                    echo "========================================================="
                    echo " [ETAPA 1] Descargando código fuente desde Git/GitLab..."
                    echo " Repositorio : ${env.REPO_URL}"
                    echo " Rama        : ${env.REPO_BRANCH}"
                    echo " Credencial  : ${env.GIT_CREDENTIALS_ID}"
                    echo "========================================================="
                }

                // Sintaxis robusta de checkout para repositorios privados
                checkout([
                    $class: 'GitSCM',
                    branches: [[name: "*/${env.REPO_BRANCH}"]],
                    doGenerateSubmoduleConfigurations: false,
                    extensions: [
                        [$class: 'CleanBeforeCheckout'], // Limpia archivos no rastreados antes de compilar
                        [$class: 'PruneStaleBranch']     // Elimina referencias a ramas remotas borradas
                    ],
                    submoduleCfg: [],
                    userRemoteConfigs: [[
                        credentialsId: "${env.GIT_CREDENTIALS_ID}",
                        url: "${env.REPO_URL}"
                    ]]
                ])

                // Validar el commit descargado para trazabilidad
                sh '''
                    echo "===> Commit descargado exitosamente:"
                    git log -1 --stat --pretty=format:"Commit: %h | Autor: %an <%ae> | Fecha: %ad | Mensaje: %s"
                '''
            }
        }

        // =========================================================================
        // ETAPA 2: BUILD & TEST AUTOMATIZADO
        // Compilación / preparación de entorno y ejecución de pruebas unitarias
        // =========================================================================
        stage('Build & Test Automatizado') {
            steps {
                script {
                    echo "========================================================="
                    echo " [ETAPA 2] Iniciando Build y Pruebas Unitarias..."
                    echo "========================================================="
                }

                // Paso 2.1: Inspección de herramientas y entorno
                sh '''
                    echo "===> [Build Step] Inspeccionando versiones del entorno:"
                    node --version
                    which node
                '''

                // Paso 2.2: Instalación de dependencias si existe package-lock.json / package.json
                sh '''
                    echo "===> [Build Step] Verificando dependencias del proyecto..."
                    if [ -f "package-lock.json" ]; then
                        echo "Ejecutando npm ci para instalación reproducible..."
                        npm ci
                    elif [ -f "package.json" ]; then
                        echo "package.json detectado."
                    fi
                '''

                // Paso 2.3: Ejecución de la suite de pruebas unitarias
                // Falla el paso si cualquier prueba falla (código de salida != 0)
                sh '''
                    echo "===> [Test Step] Ejecutando Pruebas Unitarias Automatizadas..."
                    node --test index.test.js
                    echo "===> Todas las pruebas unitarias pasaron satisfactoriamente."
                '''
            }
        }
    }

    // =============================================================================
    // ETAPA 3 / POST-ACTIONS: NOTIFICACIONES AUTOMÁTICAS
    // Se ejecuta al finalizar el flujo según el resultado (SUCCESS, FAILURE, ALWAYS)
    // =============================================================================
    post {
        always {
            script {
                echo "===> Finalización de ejecución para el Build #${env.BUILD_NUMBER}."
            }
        }

        success {
            script {
                echo "===> ¡BUILD EXITOSO! Enviando notificación de éxito..."
            }
            // Inyecta de forma segura el webhook URL sin imprimirlo en texto plano en la consola
            withCredentials([string(credentialsId: "${env.NOTIFICATION_WEBHOOK_ID}", variable: 'WEBHOOK_URL')]) {
                sh '''
                    curl -s -X POST -H "Content-Type: application/json" \
                    -d "{
                        \\"username\\": \\"Jenkins CI/CD\\",
                        \\"avatar_url\\": \\"https://www.jenkins.io/images/logos/jenkins/jenkins.png\\",
                        \\"embeds\\": [{
                            \\"title\\": \\"✅ Pipeline Exitoso: ${JOB_NAME}\\",
                            \\"description\\": \\"El pipeline ha finalizado todas sus etapas correctamente.\\",
                            \\"color\\": 3066993,
                            \\"fields\\": [
                                {\\"name\\": \\"Build N°\\", \\"value\\": \\"#${BUILD_NUMBER}\\", \\"inline\\": true},
                                {\\"name\\": \\"Rama\\", \\"value\\": \\"${REPO_BRANCH}\\", \\"inline\\": true},
                                {\\"name\\": \\"Resultado\\", \\"value\\": \\"SUCCESS (Build & Tests OK)\\", \\"inline\\": false},
                                {\\"name\\": \\"Enlace al Build\\", \\"value\\": \\"${BUILD_URL}\\", \\"inline\\": false}
                            ],
                            \\"footer\\": {\\"text\\": \\"Jenkins Automated CI/CD Engine\\"}
                        }]
                    }" "${WEBHOOK_URL}"
                '''
            }
        }

        failure {
            script {
                echo "===> ¡BUILD FALLIDO! Enviando alerta de error..."
            }
            withCredentials([string(credentialsId: "${env.NOTIFICATION_WEBHOOK_ID}", variable: 'WEBHOOK_URL')]) {
                sh '''
                    curl -s -X POST -H "Content-Type: application/json" \
                    -d "{
                        \\"username\\": \\"Jenkins CI/CD\\",
                        \\"avatar_url\\": \\"https://www.jenkins.io/images/logos/jenkins/jenkins.png\\",
                        \\"embeds\\": [{
                            \\"title\\": \\"❌ Pipeline Fallido: ${JOB_NAME}\\",
                            \\"description\\": \\"Atención: El pipeline falló en alguna de las etapas críticas (Checkout, Build o Tests).\\",
                            \\"color\\": 15158332,
                            \\"fields\\": [
                                {\\"name\\": \\"Build N°\\", \\"value\\": \\"#${BUILD_NUMBER}\\", \\"inline\\": true},
                                {\\"name\\": \\"Rama\\", \\"value\\": \\"${REPO_BRANCH}\\", \\"inline\\": true},
                                {\\"name\\": \\"Resultado\\", \\"value\\": \\"FAILURE\\", \\"inline\\": false},
                                {\\"name\\": \\"Revisar Logs\\", \\"value\\": \\"${BUILD_URL}console\\", \\"inline\\": false}
                            ],
                            \\"footer\\": {\\"text\\": \\"Jenkins Automated CI/CD Engine\\"}
                        }]
                    }" "${WEBHOOK_URL}"
                '''
            }
        }
    }
}
