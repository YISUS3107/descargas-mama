# Descargas para Mamá — Premium Dark Mode

Una app web ultra-simple para descargar videos de YouTube en **MP3** o **MP4**.
Diseñada con estilo **Premium Dark Mode** (inspirado en Spotify / Netflix) y pensada para que cualquier persona, sin conocimientos técnicos, la use sin problemas.

---

## Características

- **Interfaz limpia y elegante**: fondo oscuro, botones grandes, texto claro.
- **Un solo paso**: pegás el link, tocás un botón y listo.
- **Descarga directa al celular o computadora**.
- **Limpieza automática**: los archivos temporales se borran del servidor inmediatamente después de enviarse.
- **Mensajes de error amigables**: si algo falla, se explica con cariño.

---

## Cómo subirlo gratis a Internet (paso a paso)

Para que mamá pueda usarlo desde cualquier lugar, sin tener tu PC prendida, vamos a usar **Railway** (gratis y compatible con FFmpeg para MP3 real).

> ⚠️ **Importante:** Railway te pide una tarjeta de crédito o débito para verificar la cuenta. **No te cobran nada** en el plan gratuito, pero la piden para evitar abuso. Si no tenés tarjeta, volvé a la Opción Render (M4A sin MP3).

### Paso 1: Crear cuenta en GitHub

1. Andá a [https://github.com/signup](https://github.com/signup).
2. Registrate con tu email y elegí un nombre de usuario (es gratis).
3. Verificá tu email.

### Paso 2: Subir este proyecto a GitHub

1. Andá a [https://github.com/new](https://github.com/new).
2. En **Repository name** escribí: `descargas-mama`.
3. Dejá todo como está y tocá el botón verde **Create repository**.
4. Abrí la terminal (PowerShell o CMD) **dentro de la carpeta del proyecto** (`mama-youtube-downloader`) y ejecutá estos comandos uno por uno:

```bash
git init
git add .
git commit -m "Primera version"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/descargas-mama.git
git push -u origin main
```

> **Reemplazá** `TU_USUARIO` con tu nombre de usuario de GitHub.

Si te pide usuario y contraseña, usá tu nombre de usuario de GitHub y como contraseña usá un **Personal Access Token** (no tu contraseña normal). Para crear uno andá a [https://github.com/settings/tokens](https://github.com/settings/tokens), tocá **Generate new token (classic)**, marcá el checkbox de **repo** y generalo.

---

### Paso 3: Crear cuenta en Railway

1. Andá a [https://railway.com](https://railway.com).
2. Tocá **Start a New Project** o **Get Started**.
3. Registrate con tu cuenta de **GitHub** (es la opción más fácil).
4. Te va a pedir verificación con número de teléfono y una tarjeta de crédito/débito (no te cobran, es solo verificación).

---

### Paso 4: Crear el servicio en Railway

1. En el dashboard de Railway, tocá **New Project**.
2. Seleccioná **Deploy from GitHub repo**.
3. Buscá y elegí tu repositorio **`descargas-mama`**.
4. Railway va a detectar automáticamente el archivo `nixpacks.toml` y va a instalar **FFmpeg + Python + dependencias** solo.
5. Esperá unos **2 a 3 minutos** mientras construye y despliega.
6. Cuando termine, vas a ver una URL tipo:

```
https://descargas-mama.up.railway.app
```

¡Esa es la dirección de la página! Copiala, probala en tu navegador y después pasasela a mamá.

> **¿No funciona?** Asegurate de que Railway esté usando el builder **Nixpacks** (o **Railpack**). Podés verificarlo en **Settings > Builder** del servicio.

---

### Paso 5: Esperar el deploy

Railway se va a poner a trabajar. Vas a ver una ventana con logs (texto corriendo). Esperá unos **2 a 3 minutos** hasta que diga algo como:

```
Deploy succeeded
```

Arriba vas a ver una URL del tipo:

```
https://descargas-mama.up.railway.app
```

¡Esa es la dirección de la página! Copiala, probala en tu navegador y después pasasela a mamá.

---

## Instalar como app en el celular de mamá

Una vez que esté subida a Internet:

### Android (Chrome)
1. Abrí la URL en Chrome.
2. Tocá el menú de **tres puntitos** arriba a la derecha.
3. Tocá **"Agregar a pantalla de inicio"** o **"Instalar app"**.

### iPhone (Safari)
1. Abrí la URL en Safari.
2. Tocá el botón **Compartir** (cuadrado con flecha abajo).
3. Bajá un poco y tocá **"Agregar a pantalla de inicio"**.

Ahora aparece un ícono lindo junto a WhatsApp, como una app más.

---

## Solución de problemas

| Problema | Solución |
|---|---|
| En Railway tarda la primera vez | Es normal en el plan gratuito. El servidor se "duerme" tras un rato sin uso. La primera descarga del día tarda unos **20-40 segundos** en "despertar". Después va rápido. Decile a mamá: *"La primera vez tarda un poquito, como cuando calentamos la pava"*. |
| "No pude revisar ese video" | El link está roto, es privado o YouTube cambió algo. Probá con otro. |
| "Este video tiene protección" | YouTube bloquea algunos videos con copyright muy estricto (música oficial de grandes sellos, TV). Probá con otro. |
| La descarga tarda mucho | Los videos muy largos o en alta calidad pesan más. Sé paciente. |

---

## Cómo usar en tu PC (modo local)

Si querés probarlo en tu computadora antes de subirlo:

1. Instalá **FFmpeg**:
   - **Windows:** Abrí PowerShell como administrador y ejecutá `winget install Gyan.FFmpeg`. Después cerrá y volvé a abrir la terminal.
   - **Mac:** `brew install ffmpeg`
   - **Linux:** `sudo apt install ffmpeg`

2. Desde la carpeta del proyecto, ejecutá:
```bash
pip install -r requirements.txt
python app.py
```

3. Abrí tu navegador en:
```
http://127.0.0.1:8765
```

---

Hecho con cariño para mamá ❤️
