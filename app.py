from flask import Flask, request, Response, render_template
import yt_dlp
import tempfile
import os
import shutil

app = Flask(__name__)


def is_valid_youtube(url: str) -> bool:
    return "youtube.com" in url or "youtu.be" in url


def sanitize_filename(name: str) -> str:
    cleaned = "".join(c for c in name if c.isalnum() or c in (" ", "-", "_")).rstrip()
    return cleaned[:50]


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/download", methods=["POST"])
def download():
    data = request.get_json(silent=True) or {}
    url = data.get("url", "").strip()
    fmt = data.get("format", "").strip()

    if not url:
        return {"detail": "Pegá el link de YouTube primero, mi amor."}, 400

    if not is_valid_youtube(url):
        return {"detail": "Ese no parece un link de YouTube. Revisalo bien, por favor."}, 400

    if fmt not in ("mp3", "mp4"):
        return {"detail": "Formato no soportado. Usá Música o Video nomás."}, 400

    tmpdir = tempfile.mkdtemp()

    try:
        info_opts = {
            "quiet": True,
            "skip_download": True,
            "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "referer": "https://www.youtube.com/",
            "headers": {
                "Accept-Language": "en-US,en;q=0.9",
                "Origin": "https://www.youtube.com",
            },
            "geo_bypass": True,
            "cookiefile": None,
        }
        with yt_dlp.YoutubeDL(info_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            raw_title = info.get("title", "descarga")
            title = sanitize_filename(raw_title)
    except Exception:
        shutil.rmtree(tmpdir, ignore_errors=True)
        return {
            "detail": "YouTube no me deja entrar desde el servidor. A veces bloquea las nubes. Probá con otro video o usá la computadora de casa."
        }, 400

    outtmpl = os.path.join(tmpdir, f"{title}.%(ext)s")

    try:
        common_opts = {
            "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "referer": "https://www.youtube.com/",
            "headers": {
                "Accept-Language": "en-US,en;q=0.9",
                "Origin": "https://www.youtube.com",
            },
            "geo_bypass": True,
            "cookiefile": None,
        }

        if fmt == "mp3":
            ydl_opts = {
                **common_opts,
                "format": "bestaudio/best",
                "outtmpl": outtmpl,
                "postprocessors": [
                    {
                        "key": "FFmpegExtractAudio",
                        "preferredcodec": "mp3",
                        "preferredquality": "192",
                    }
                ],
                "quiet": True,
            }
            ext = "mp3"
            mimetype = "audio/mpeg"
        else:
            ydl_opts = {
                **common_opts,
                "format": "best[ext=mp4]/best",
                "outtmpl": outtmpl,
                "quiet": True,
            }
            ext = "mp4"
            mimetype = "video/mp4"

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([url])

        files = [f for f in os.listdir(tmpdir) if os.path.isfile(os.path.join(tmpdir, f))]
        if not files:
            raise RuntimeError("No se generó ningún archivo después de descargar.")

        file_path = os.path.join(tmpdir, files[0])
        filename = f"{title}.{ext}"

        def iterfile():
            with open(file_path, "rb") as f:
                yield from f
            shutil.rmtree(tmpdir, ignore_errors=True)

        response = Response(iterfile(), mimetype=mimetype)
        response.headers["Content-Disposition"] = f'attachment; filename="{filename}"'
        return response

    except Exception as exc:
        shutil.rmtree(tmpdir, ignore_errors=True)
        err_str = str(exc).lower()

        if "ffmpeg" in err_str:
            detail = (
                "Me falta FFmpeg para convertir a MP3. "
                "Dile a quien te armó esto que lo instale en el servidor o la PC."
            )
        elif "copyright" in err_str or "drm" in err_str:
            detail = (
                "Este video tiene protección y no me deja descargarlo. "
                "Probá con otro que no sea de música oficial o TV."
            )
        elif "private" in err_str or "members only" in err_str:
            detail = "Ese video es privado o solo para miembros. No puedo acceder, mi amor."
        elif "unavailable" in err_str or "not exist" in err_str:
            detail = "YouTube dice que ese video no existe o fue borrado. Revisá el link."
        else:
            detail = (
                "Uy, algo salió mal mientras bajaba el archivo. "
                "A veces YouTube cambia las reglas. Intentá de nuevo en un ratito."
            )

        return {"detail": detail}, 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8765, debug=True)
