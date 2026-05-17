import { default as makeWASocket, DisconnectReason, useMultiFileAuthState } from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Mapa para recordar qué link le enviamos botones a quién
const pendingDownloads = new Map();

function sanitizeFilename(name) {
  return name.replace(/[^a-zA-Z0-9À-ſ ]/g, '').trim().substring(0, 50) || 'descarga';
}

function looksLikeYoutube(str) {
  return str.includes('youtube.com') || str.includes('youtu.be');
}

function execYtDlp(args) {
  return new Promise((resolve, reject) => {
    const proc = spawn('yt-dlp', args, { shell: false });
    let stdout = '';
    let stderr = '';
    proc.stdout.on('data', (data) => { stdout += data.toString(); });
    proc.stderr.on('data', (data) => { stderr += data.toString(); });
    proc.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(stderr || `yt-dlp salió con código ${code}`));
      } else {
        resolve(stdout);
      }
    });
  });
}

async function getVideoInfo(url) {
  try {
    const out = await execYtDlp(['--dump-json', '--no-download', url]);
    return JSON.parse(out);
  } catch (e) {
    return null;
  }
}

async function downloadAndSend(sock, jid, url, format, title) {
  const tmpDir = path.join(__dirname, 'temp');
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

  const safeTitle = sanitizeFilename(title);
  const ext = format === 'mp3' ? 'mp3' : 'mp4';
  const outPath = path.join(tmpDir, `${safeTitle}.${ext}`);

  try {
    // Descargar según formato
    if (format === 'mp3') {
      await execYtDlp([
        '-f', 'bestaudio/best',
        '-x', '--audio-format', 'mp3', '--audio-quality', '192',
        '-o', outPath,
        '--no-playlist',
        url
      ]);
    } else {
      await execYtDlp([
        '-f', 'best[ext=mp4]/best',
        '-o', outPath,
        '--no-playlist',
        url
      ]);
    }

    if (!fs.existsSync(outPath)) {
      throw new Error('No se generó el archivo después de descargar.');
    }

    const stats = fs.statSync(outPath);
    const sizeMB = stats.size / (1024 * 1024);

    // WhatsApp tiene límite de 100MB para archivos no oficiales
    if (sizeMB > 95) {
      fs.unlinkSync(outPath);
      await sock.sendMessage(jid, {
        text: 'Uy, mi amor, ese archivo pesa demasiado para WhatsApp (más de 100MB). Probá con un video más corto. 🥺'
      });
      return;
    }

    const fileBuffer = fs.readFileSync(outPath);

    if (format === 'mp3') {
      await sock.sendMessage(jid, {
        audio: fileBuffer,
        mimetype: 'audio/mpeg',
        fileName: `${safeTitle}.mp3`
      });
    } else {
      await sock.sendMessage(jid, {
        video: fileBuffer,
        caption: 'Acá tenés el video, mi amor 🎬❤️',
        fileName: `${safeTitle}.mp4`
      });
    }

    fs.unlinkSync(outPath);

    await sock.sendMessage(jid, {
      text: 'Listo, mi amor. ¿Algo más que quieras bajar? 😊'
    });

  } catch (err) {
    console.error('Error descargando:', err.message);

    // Limpiar si quedó algo
    if (fs.existsSync(outPath)) {
      try { fs.unlinkSync(outPath); } catch (_) {}
    }

    let niceMsg = 'Uy, algo salió mal mientras bajaba el archivo. A veces YouTube cambia las reglas. Probá de nuevo en un ratito, mi amor.';
    const low = err.message.toLowerCase();
    if (low.includes('ffmpeg')) {
      niceMsg = 'Me falta FFmpeg para convertir a MP3. Dile a quien te armó esto que lo instale en la PC, mi amor.';
    } else if (low.includes('copyright') || low.includes('drm')) {
      niceMsg = 'Este video tiene protección y no me deja descargarlo. Probá con otro que no sea de música oficial o TV, mi amor.';
    } else if (low.includes('private') || low.includes('members only')) {
      niceMsg = 'Ese video es privado o solo para miembros. No puedo acceder, mi amor.';
    } else if (low.includes('unavailable') || low.includes('not exist')) {
      niceMsg = 'YouTube dice que ese video no existe o fue borrado. Revisá el link, mi amor.';
    }

    await sock.sendMessage(jid, { text: niceMsg });
  }
}

async function connectToWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true,
    logger: undefined // silenciar logs de Baileys
  });

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log('\n📲 Escaneá este código QR con tu WhatsApp:');
      console.log('   WhatsApp > Menú (⋮) > Dispositivos vinculados > Vincular dispositivo');
      console.log('   Apuntá la cámara al QR que aparece arriba ⬆️\n');
    }

    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect?.error instanceof Boom)
        ? lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut
        : true;

      console.log('🔌 Conexión cerrada. Reconectando:', shouldReconnect);
      if (shouldReconnect) {
        connectToWhatsApp();
      } else {
        console.log('❌ Se cerró sesión. Borrá la carpeta auth_info_baileys y volvé a empezar.');
      }
    } else if (connection === 'open') {
      console.log('\n✅ ¡Bot conectado! Mamá ya puede enviar links de YouTube.\n');
    }
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;

    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const jid = msg.key.remoteJid;

    // Extraer texto del mensaje
    let text = '';
    if (msg.message.conversation) {
      text = msg.message.conversation;
    } else if (msg.message.extendedTextMessage) {
      text = msg.message.extendedTextMessage.text || '';
    } else if (msg.message.buttonsResponseMessage) {
      text = msg.message.buttonsResponseMessage.selectedButtonId || '';
    }

    text = text.trim();

    // Si es respuesta a botones (MP3 o MP4)
    if (msg.message.buttonsResponseMessage) {
      const selected = msg.message.buttonsResponseMessage.selectedButtonId;
      const pending = pendingDownloads.get(jid);

      if (pending && (selected === 'mp3' || selected === 'mp4')) {
        pendingDownloads.delete(jid);
        await sock.sendMessage(jid, { text: 'Dame un momentito que lo bajo... ⏳' });
        await downloadAndSend(sock, jid, pending.url, selected, pending.title);
      }
      return;
    }

    // Si envió un link de YouTube
    if (looksLikeYoutube(text)) {
      await sock.sendMessage(jid, {
        text: `¿Qué querés que te baje de este video? 😊\n\n${text}`
      });

      // Enviar botones
      await sock.sendMessage(jid, {
        text: 'Elegí una opción:',
        footer: 'Descargas para mamá ❤️',
        buttons: [
          { buttonId: 'mp3', buttonText: { displayText: '🎵 Solo Música' }, type: 1 },
          { buttonId: 'mp4', buttonText: { displayText: '🎬 Video Completo' }, type: 1 }
        ],
        headerType: 1
      });

      // Guardar el link para cuando responda
      const info = await getVideoInfo(text);
      pendingDownloads.set(jid, { url: text, title: info?.title || 'descarga' });

      return;
    }

    // Saludo o ayuda
    const lower = text.toLowerCase();
    if (lower === 'hola' || lower === 'ayuda' || lower === 'help' || lower === 'info') {
      await sock.sendMessage(jid, {
        text: '¡Hola, mi amor! 👋\n\nSoy tu asistente de descargas. Solo mandame un link de YouTube y yo te lo bajo en música o video. 🎵🎬\n\n*Pegá el link y listo.*'
      });
    }
  });
}

connectToWhatsApp().catch(err => {
  console.error('Error fatal:', err);
  process.exit(1);
});
