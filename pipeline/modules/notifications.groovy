/**
 * =============================================================================
 * MÓDULO GROOVY MODULAR: Notificaciones Multi-Canal
 * Ubicación: pipeline/modules/notifications.groovy
 * 
 * Este módulo desacopla la lógica de mensajería del Jenkinsfile principal.
 * Se carga dinámicamente usando el paso: load 'pipeline/modules/notifications.groovy'
 * =============================================================================
 */

/**
 * Actualiza el commit status en la API REST de GitHub
 * Estados válidos: 'pending', 'success', 'failure', 'error'
 */
def actualizarStatusGitHub(Map config) {
    String estado       = config.estado ?: 'pending'
    String descripcion  = config.descripcion ?: 'Ejecución en curso'
    String credId       = config.credId ?: env.GIT_CREDENTIALS_ID
    String repoOwner    = config.repoOwner ?: env.GITHUB_REPO_OWNER
    String repoName     = config.repoName ?: env.GITHUB_REPO_NAME
    String buildUrl     = config.buildUrl ?: env.BUILD_URL
    String commitSha    = config.commitSha ?: env.GIT_COMMIT_HASH

    withCredentials([usernamePassword(credentialsId: credId, usernameVariable: 'GH_USER', passwordVariable: 'GH_TOKEN')]) {
        sh """
            SHA=\$(git rev-parse HEAD 2>/dev/null || echo "${commitSha}")
            curl -s -X POST \
                -H "Accept: application/vnd.github+json" \
                -H "Authorization: Bearer \$GH_TOKEN" \
                -H "X-GitHub-Api-Version: 2022-11-28" \
                "https://api.github.com/repos/${repoOwner}/${repoName}/statuses/\$SHA" \
                -d '{
                    "state": "${estado}",
                    "target_url": "${buildUrl}",
                    "description": "${descripcion}",
                    "context": "ci/jenkins-pipeline"
                }' > /dev/null || true
        """
    }
}

/**
 * Envía una notificación enriquecida con tarjeta embebida a Discord Webhook
 */
def enviarNotificacionDiscord(Map config) {
    String estado       = config.estado ?: 'INFO'
    int color           = config.color ?: 3066993
    String descripcion  = config.descripcion ?: 'Notificación de Pipeline'
    String webhookId    = config.webhookId ?: env.NOTIFICATION_WEBHOOK_ID
    String jobName      = env.JOB_NAME ?: 'CI-Pipeline'
    String buildNumber  = env.BUILD_NUMBER ?: '0'
    String branch       = env.GIT_CURRENT_BRANCH ?: (env.BRANCH_NAME ?: 'main')
    String commitSha    = env.GIT_COMMIT_HASH ?: 'HEAD'
    String buildUrl     = env.BUILD_URL ?: '#'

    withCredentials([string(credentialsId: webhookId, variable: 'WEBHOOK_URL')]) {
        sh """
            curl -s -X POST -H "Content-Type: application/json" \
            -d '{
                "username": "Jenkins Enterprise CI/CD",
                "avatar_url": "https://www.jenkins.io/images/logos/jenkins/jenkins.png",
                "embeds": [{
                    "title": "Pipeline ${estado}: ${jobName}",
                    "description": "${descripcion}",
                    "color": ${color},
                    "fields": [
                        {"name": "Build", "value": "#${buildNumber}", "inline": true},
                        {"name": "Rama", "value": "${branch}", "inline": true},
                        {"name": "Arquitectura", "value": "Modular Groovy Engine", "inline": false},
                        {"name": "Commit SHA", "value": "`${commitSha}`", "inline": false},
                        {"name": "Logs de Ejecución", "value": "${buildUrl}console", "inline": false}
                    ],
                    "footer": {"text": "Jenkins Automated CI/CD Engine"}
                }]
            }' "\$WEBHOOK_URL" || true
        """
    }
}

// CRUCIAL: Retornar 'this' para que Jenkins instancie el módulo como objeto reutilizable
return this
