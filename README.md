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

Para que mamá pueda usarlo desde cualquier lugar, sin tener tu PC prendida.

### Paso 1: Crear cuenta en GitHub

1. Andá a [https://github.com/signup](https://github.com/signup).
2. Registrate con tu email y elegí un nombre de usuario (es gratis).
3. Verificá tu email.

### Paso 2: Subir este proyecto a GitHub

1. Andá a [https://github.com/new](https://github.com/new).
2. En **Repository name** escribí: `descargas-mama`.
3. Dejá todo como está y tocá el botón verde **Create repository**.
4. Ahora vas a ver una pantalla con instrucciones. Buscá la que dice **"…or push an existing repository from the command line"**.
5. Abrí la terminal (PowerShell o CMD) **dentro de la carpeta del proyecto** (`mama-youtube-downloader`) y ejecutá estos comandos uno por uno:

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

### Paso 3: Crear cuenta en Render

1. Andá a [https://render.com](https://render.com).
2. Tocá **Get Started for Free** y registrate con tu cuenta de **GitHub** (es la opción más fácil).
3. Seguí los pasos de verificación (te van a pedir un número de teléfono para un SMS).

---

### Paso 4: Crear el servicio en Render

1. En el dashboard de Render, tocá el botón **New +** (arriba a la derecha).
2. Seleccioná **Web Service**.
3. Vas a ver tus repositorios de GitHub. Buscá y elegí **`descargas-mama`**.
4. Completá los datos así:
   - **Name:** `descargas-mama` (o el nombre que quieras).
   - **Environment:** `Python 3`.
   - **Region:** Elegí la más cercana (Virginia está bien para Latinoamérica).
   - **Branch:** `main`.
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `gunicorn app:app --bind 0.0.0.0:$PORT`
5. En **Instance Type** asegurate de elegir **Free**.
6. Tocá **Create Web Service**.

---

### Paso 5: Esperar el deploy

Render se va a poner a trabajar. Vas a ver una ventana con logs (texto corriendo). Esperá unos **2 a 3 minutos** hasta que diga algo como:

```
Your service is live 🎉
```

Arriba vas a ver una URL del tipo:

```
https://descargas-mama.onrender.com
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
| En Render tarda la primera vez | Es normal en el plan gratuito. El servidor se "duerme" tras 15 minutos sin uso. La primera descarga del día tarda unos **30-60 segundos** en "despertar". Después va rápido. Decile a mamá: *"La primera vez tarda un poquito, como cuando calentamos la pava"*. |
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
