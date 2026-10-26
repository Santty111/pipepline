/**
 * SCRIPT MODULAR DE NOTIFICACIONES MULTI-CANAL PARA CIRCLECI & CI/CD
 * Ubicación: scripts/notify-pipeline.js
 * 
 * Permite enviar notificaciones desacopladas y enriquecidas a:
 *  1. Discord Webhook (Tarjeta embebida con estado, autor, rama, commit y enlace)
 *  2. GitHub Commit Status API (pending, success, failure, error)
 */

const https = require('node:https');
const { URL } = require('node:url');

// Parsear argumentos de línea de comandos: --status=success --stage="Pruebas Unitarias" --message="Detalles..."
const args = process.argv.slice(2).reduce((acc, arg) => {
  if (arg.startsWith('--')) {
    const [key, value] = arg.slice(2).split('=');
    acc[key] = value !== undefined ? decodeURIComponent(value) : true;
  }
  return acc;
}, {});

// Contexto de ejecución (Variables automáticas de CircleCI o fallback local)
const CI_ENV = {
  isCircleCI: process.env.CIRCLECI === 'true',
  jobName: args.stage || process.env.CIRCLE_JOB || 'Pipeline Job',
  workflowId: process.env.CIRCLE_WORKFLOW_ID || 'N/A',
  buildNum: process.env.CIRCLE_BUILD_NUM || 'Local',
  branch: process.env.CIRCLE_BRANCH || process.env.GIT_BRANCH || 'main',
  commitSha: process.env.CIRCLE_SHA1 || process.env.GIT_COMMIT || 'HEAD',
  buildUrl: process.env.CIRCLE_BUILD_URL || 'https://app.circleci.com/',
  repoUsername: process.env.CIRCLE_PROJECT_USERNAME || 'Santty111',
  repoName: process.env.CIRCLE_PROJECT_REPONAME || 'pipepline',
  author: process.env.CIRCLE_USERNAME || 'DevOps Engineer'
};

const statusInput = (args.status || 'success').toLowerCase();

// Configuración visual por estado
const STATUS_CONFIG = {
  success: {
    label: 'SUCCESS',
    emoji: '✅',
    color: 3066993, // Verde #2ecc71
    githubState: 'success',
    title: '¡Etapa / Pipeline Exitoso en CircleCI!'
  },
  failure: {
    label: 'FAILURE',
    emoji: '❌',
    color: 15158332, // Rojo #e74c3c
    githubState: 'failure',
    title: '¡Fallo Detectado en Pipeline CircleCI!'
  },
  running: {
    label: 'IN PROGRESS',
    emoji: '🔄',
    color: 3447003, // Azul #3498db
    githubState: 'pending',
    title: 'Ejecución en Curso en CircleCI'
  }
};

const currentConfig = STATUS_CONFIG[statusInput] || STATUS_CONFIG.success;
const customMessage = args.message || (statusInput === 'success'
  ? `La etapa [${CI_ENV.jobName}] se completó satisfactoriamente.`
  : `Se detectaron errores en la etapa [${CI_ENV.jobName}]. Revisa los logs.`);

/**
 * Función auxiliar para realizar peticiones HTTP POST JSON
 */
function enviarPost(targetUrl, payload, headers = {}) {
  return new Promise((resolve) => {
    try {
      const urlParsed = new URL(targetUrl);
      const dataString = JSON.stringify(payload);

      const options = {
        hostname: urlParsed.hostname,
        port: urlParsed.port || 443,
        path: urlParsed.pathname + urlParsed.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(dataString),
          'User-Agent': 'CircleCI-DevOps-Notifier',
          ...headers
        }
      };

      const req = https.request(options, (res) => {
        let responseBody = '';
        res.on('data', (chunk) => { responseBody += chunk; });
        res.on('end', () => {
          resolve({ statusCode: res.statusCode, body: responseBody });
        });
      });

      req.on('error', (err) => {
        console.warn(`⚠️ [Notifier] Advertencia al contactar ${urlParsed.hostname}: ${err.message}`);
        resolve({ error: err });
      });

      req.write(dataString);
      req.end();
    } catch (e) {
      console.warn(`⚠️ [Notifier] Error en configuración de URL: ${e.message}`);
      resolve({ error: e });
    }
  });
}

/**
 * Enviar notificación a Discord Webhook
 */
async function notificarDiscord() {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) {
    console.log('ℹ️ [Notifier] Variable DISCORD_WEBHOOK_URL no configurada. Omitiendo envío a Discord.');
    return;
  }

  console.log(`📡 [Notifier] Enviando notificación de estado (${currentConfig.label}) a Discord...`);

  const payload = {
    username: 'CircleCI Cloud Engine',
    avatar_url: 'https://d3r49iyjzgctxf.cloudfront.net/wp-content/uploads/2019/08/circleci-logo.png',
    embeds: [{
      title: `${currentConfig.emoji} ${currentConfig.title}`,
      description: customMessage,
      color: currentConfig.color,
      fields: [
        { name: 'Job / Etapa', value: `\`${CI_ENV.jobName}\``, inline: true },
        { name: 'Rama', value: `\`${CI_ENV.branch}\``, inline: true },
        { name: 'Build #', value: `${CI_ENV.buildNum}`, inline: true },
        { name: 'Repositorio', value: `${CI_ENV.repoUsername}/${CI_ENV.repoName}`, inline: true },
        { name: 'Desencadenado por', value: `${CI_ENV.author}`, inline: true },
        { name: 'Commit SHA', value: `\`${CI_ENV.commitSha.substring(0, 8)}\``, inline: true },
        { name: 'Plataforma CI/CD', value: 'CircleCI 2.1 (Docker Cloud Runners)', inline: false },
        { name: 'Enlace a Ejecución', value: `[Ver detalles en CircleCI](${CI_ENV.buildUrl})`, inline: false }
      ],
      footer: {
        text: 'CircleCI Multi-Job & Modular Workflow Engine • DevOps Inventory Service',
        icon_url: 'https://assets.circleci.com/brand/circleci-icon-light.png'
      },
      timestamp: new Date().toISOString()
    }]
  };

  const res = await enviarPost(webhookUrl, payload);
  if (res.statusCode >= 200 && res.statusCode < 300) {
    console.log('✅ [Notifier] Notificación enviada exitosamente a Discord.');
  } else {
    console.warn(`⚠️ [Notifier] Respuesta inesperada de Discord (Status ${res.statusCode}).`);
  }
}

/**
 * Actualizar GitHub Commit Status API
 */
async function notificarGitHub() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    console.log('ℹ️ [Notifier] Variable GITHUB_TOKEN no configurada. Omitiendo actualización en GitHub.');
    return;
  }

  if (!CI_ENV.commitSha || CI_ENV.commitSha === 'HEAD') {
    console.log('ℹ️ [Notifier] Commit SHA no disponible para GitHub Status API.');
    return;
  }

  const statusUrl = `https://api.github.com/repos/${CI_ENV.repoUsername}/${CI_ENV.repoName}/statuses/${CI_ENV.commitSha}`;
  console.log(`🐙 [Notifier] Actualizando status en GitHub (${currentConfig.githubState}) para commit ${CI_ENV.commitSha.substring(0, 8)}...`);

  const payload = {
    state: currentConfig.githubState,
    target_url: CI_ENV.buildUrl,
    description: customMessage.substring(0, 140),
    context: `ci/circleci: ${CI_ENV.jobName}`
  };

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28'
  };

  const res = await enviarPost(statusUrl, payload, headers);
  if (res.statusCode >= 200 && res.statusCode < 300) {
    console.log('✅ [Notifier] GitHub Commit Status actualizado exitosamente.');
  } else {
    console.warn(`⚠️ [Notifier] Respuesta inesperada de GitHub API (Status ${res.statusCode}).`);
  }
}

async function main() {
  console.log(`🔔 [Notifier] Ejecutando módulo de notificación para estado: [${currentConfig.label}]`);
  await Promise.all([notificarDiscord(), notificarGitHub()]);
  console.log('🏁 [Notifier] Finalizado ciclo de notificaciones.');
  process.exit(0);
}

main();
