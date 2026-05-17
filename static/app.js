/* ============================================
   Descargas para Mamá — Frontend
   ============================================ */

const urlInput = document.getElementById('urlInput');
const btnMp3   = document.getElementById('btnMp3');
const btnMp4   = document.getElementById('btnMp4');
const statusDiv = document.getElementById('status');
const statusText = document.getElementById('statusText');
const errorDiv = document.getElementById('error');
const errorText = document.getElementById('errorText');

function setLoading(isLoading, message = 'Procesando, un momentito...') {
  btnMp3.disabled = isLoading;
  btnMp4.disabled = isLoading;

  if (isLoading) {
    statusDiv.classList.remove('hidden');
    errorDiv.classList.add('hidden');
    statusText.textContent = message;
    urlInput.blur();
  } else {
    statusDiv.classList.add('hidden');
  }
}

function showError(message) {
  errorText.textContent = message;
  errorDiv.classList.remove('hidden');
  statusDiv.classList.add('hidden');
}

function looksLikeYoutube(str) {
  return str.includes('youtube.com') || str.includes('youtu.be');
}

async function download(format) {
  const url = urlInput.value.trim();

  if (!url) {
    showError('Primero pegá el link de YouTube en el casillero de arriba, mi amor.');
    urlInput.focus();
    return;
  }

  if (!looksLikeYoutube(url)) {
    showError('Eso no se ve como un link de YouTube. Revisalo bien, por favor.');
    urlInput.focus();
    return;
  }

  setLoading(true);

  try {
    const response = await fetch('/download', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, format })
    });

    if (!response.ok) {
      let niceMessage = 'Uy, algo salió mal. Probá de nuevo en un ratito.';
      try {
        const data = await response.json();
        if (data.detail) niceMessage = data.detail;
      } catch (_) {}
      throw new Error(niceMessage);
    }

    const disposition = response.headers.get('content-disposition');
    let filename = `descarga.${format}`;
    if (disposition && disposition.includes('filename=')) {
      filename = disposition
        .split('filename=')[1]
        .replace(/"/g, '')
        .trim();
    }

    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = objectUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(objectUrl);

    setLoading(false);
    urlInput.value = '';
    urlInput.focus();
  } catch (err) {
    setLoading(false);
    showError(err.message || 'Uy, algo salió mal. Probá de nuevo en un ratito.');
  }
}

btnMp3.addEventListener('click', () => download('mp3'));
btnMp4.addEventListener('click', () => download('mp4'));

urlInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    download('mp3');
  }
});

if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/sw.js')
    .catch((err) => console.error('No pude instalar el Service Worker:', err));
}
