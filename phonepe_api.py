import asyncio
import base64
import collections
import concurrent.futures
import datetime
import json
import math
import os
import re
import shutil
import string
import subprocess
import sys
import tempfile
import time
from array import array

import edge_tts
import requests
import websockets
from faster_whisper import WhisperModel
from faster_whisper.audio import decode_audio

# ==========================================
# CONFIG
# ==========================================

FFMPEG = "ffmpeg"                 # or full path, e.g. r"C:\ffmpeg\bin\ffmpeg.exe"
MODEL_NAME = "qwen2.5:3b"
OLLAMA_URL = "http://localhost:11434/api/chat"
KEEP_ALIVE = "30m"                # keeps the model loaded so replies start fast
PORT = 8765                       # must match: ngrok http 8765

# ---- Languages the bot should understand ----
# Fewer languages = better detection. Add "ta", "te", "mr" if your farmers need them.
ALLOWED_LANGS = ["en", "hi", "kn"]
FORCE_LANGUAGE = None             # e.g. "kn" to lock every call to Kannada (fastest, most accurate)

# ---- Speech recognition ----
FAST_MODEL = "small"              # used for English and for language detection
ACCURATE_MODEL = "medium"         # used for Hindi/Kannada/etc. Set to "small" if too slow.
WHISPER_BEAM = 1                  # 1 = fastest, 3 = a bit more accurate
CPU_THREADS = min(8, os.cpu_count() or 4)

# Confirmed by your test: 16-bit PCM at 8 kHz
AUDIO_FORMAT = "pcm"

SILENCE_SECONDS = 0.7             # pause that ends the question (raise if it cuts you off)
SILENCE_RMS = 300                 # raise (e.g. 500) if a noisy line never counts as silence
IGNORE_AFTER_SPEAKING = 0.6       # seconds to ignore the line after the bot talks
MAX_AHEAD_SECONDS = 0.3           # how far ahead of playback we send audio
MIN_CHUNK_CHARS = 24              # shortest piece of text sent to the voice

VOICE_RATE = "-5%"

# ---- DEFAULT LOCATION for NASA data: CHANGE THESE to your farmers' area ----
DEFAULT_LOCATION = ("Karnataka", 12.97, 77.59)   # (name, latitude, longitude)

# If the farmer says one of these place names, NASA data for that place is used.
LOCATIONS = {
    "bengaluru": (12.97, 77.59), "bangalore": (12.97, 77.59),
    "mysuru": (12.30, 76.64), "mysore": (12.30, 76.64),
    "mandya": (12.52, 76.90), "hassan": (13.00, 76.10),
    "tumakuru": (13.34, 77.10), "shivamogga": (13.93, 75.57),
    "davanagere": (14.47, 75.92), "dharwad": (15.46, 75.01),
    "hubballi": (15.36, 75.12), "belagavi": (15.85, 74.50),
    "ballari": (15.14, 76.92), "raichur": (16.21, 77.36),
    "kalaburagi": (17.33, 76.83), "vijayapura": (16.83, 75.71),
    "chikkamagaluru": (13.32, 75.77),
    "delhi": (28.61, 77.21), "lucknow": (26.85, 80.95),
    "ludhiana": (30.90, 75.86), "jaipur": (26.91, 75.79),
    "nagpur": (21.15, 79.09), "pune": (18.52, 73.86),
    "hyderabad": (17.39, 78.49), "chennai": (13.08, 80.27),
    "coimbatore": (11.02, 76.96), "patna": (25.59, 85.14),
    "kolkata": (22.57, 88.36), "ahmedabad": (23.02, 72.57),
    "bhopal": (23.26, 77.41),
}

NASA_DAILY_URL = "https://power.larc.nasa.gov/api/temporal/daily/point"
NASA_CLIMATE_URL = "https://power.larc.nasa.gov/api/temporal/climatology/point"
NASA_CACHE_SECONDS = 6 * 3600
NASA_DAYS = 40

LANGUAGE_NAMES = {
    "en": "English", "hi": "Hindi", "kn": "Kannada", "ta": "Tamil", "te": "Telugu",
    "mr": "Marathi", "bn": "Bengali", "gu": "Gujarati", "ml": "Malayalam",
}

VOICES = {
    "en": "en-IN-NeerjaNeural",
    "hi": "hi-IN-SwaraNeural",
    "kn": "kn-IN-SapnaNeural",
    "ta": "ta-IN-PallaviNeural",
    "te": "te-IN-ShrutiNeural",
    "mr": "mr-IN-AarohiNeural",
    "bn": "bn-IN-TanishaaNeural",
    "gu": "gu-IN-DhwaniNeural",
    "ml": "ml-IN-SobhanaNeural",
}
DEFAULT_VOICE = VOICES["en"]

# ---- Welcome message: played in this order when the call connects ----
# Edit the wording freely. Only languages listed in ALLOWED_LANGS are played.
GREETINGS = [
    ("en", "Welcome to Field Shift, your farming assistant. Please ask your question."),
    ("hi", "फील्ड शिफ्ट में आपका स्वागत है। कृपया अपना खेती का सवाल पूछिए।"),
    ("kn", "ಫೀಲ್ಡ್ ಶಿಫ್ಟ್‌ಗೆ ಸ್ವಾಗತ. ದಯವಿಟ್ಟು ನಿಮ್ಮ ಕೃಷಿ ಪ್ರಶ್ನೆಯನ್ನು ಕೇಳಿ."),
    ("ta", "ஃபீல்ட் ஷிஃப்ட்டுக்கு வரவேற்கிறோம். உங்கள் விவசாய கேள்வியைக் கேளுங்கள்."),
    ("te", "ఫీల్డ్ షిఫ్ట్‌కు స్వాగతం. దయచేసి మీ వ్యవసాయ ప్రశ్న అడగండి."),
    ("mr", "फील्ड शिफ्टमध्ये आपले स्वागत आहे. कृपया आपला शेतीचा प्रश्न विचारा."),
]

# Short phrase played right after the question is understood, while the answer is prepared
FILLERS = {
    "en": "One moment.",
    "hi": "एक मिनट।",
    "kn": "ಒಂದು ನಿಮಿಷ.",
    "ta": "ஒரு நிமிடம்.",
    "te": "ఒక్క నిమిషம்.".replace("ம்", "ం"),
    "mr": "एक मिनिट.",
}

WHISPER_PROMPTS = {
    "en": (
        "Farming questions from an Indian farmer: soil, fertilizer, urea, compost, manure, "
        "pests, pesticide, irrigation, drip, paddy, rice, wheat, cotton, tomato, sugarcane, "
        "maize, seeds, harvest, yield, monsoon, crop disease."
    ),
    "hi": "किसान के सवाल: मिट्टी, खाद, यूरिया, कीट, सिंचाई, धान, गेहूं, कपास, टमाटर, गन्ना, मक्का, बीज, फसल, बारिश।",
    "kn": "ರೈತರ ಪ್ರಶ್ನೆಗಳು: ಮಣ್ಣು, ಗೊಬ್ಬರ, ಕೀಟ, ನೀರಾವರಿ, ಭತ್ತ, ರಾಗಿ, ಜೋಳ, ಟೊಮೆಟೊ, ಕಬ್ಬು, ಮೆಕ್ಕೆಜೋಳ, ಬೆಳೆ, ಮಳೆ.",
    "ta": "விவசாயிகளின் கேள்விகள்: மண், உரம், பூச்சி, நீர்ப்பாசனம், நெல், கரும்பு, தக்காளி, பயிர், மழை.",
    "te": "రైతు ప్రశ్నలు: నేల, ఎరువు, పురుగు, నీటిపారుదల, వరి, చెరకు, టమాటా, పంట, వర్షం.",
}

# Things Whisper invents on noise
JUNK_PHRASES = {
    "thank you", "thanks", "thanks for watching", "thank you for watching",
    "you", "bye", "okay", "ok", "hmm", "firmly", "oh",
}

PUNCT = str.maketrans("", "", string.punctuation + "।॥")
SENT_SPLIT = re.compile(r"(?<=[.!?।])\s+")

# ==========================================
# AUDIO FORMAT SETTINGS
# ==========================================

if AUDIO_FORMAT == "pcm":
    FFMPEG_IN = ["-f", "s16le"]
    FFMPEG_OUT = ["-f", "s16le", "-acodec", "pcm_s16le"]
    BYTES_PER_SEC = 16000   # 8000 samples * 2 bytes
    FRAME_BYTES = 320       # 20 ms
    SILENCE_BYTE = b"\x00"
else:
    FFMPEG_IN = ["-f", "mulaw"]
    FFMPEG_OUT = ["-f", "mulaw"]
    BYTES_PER_SEC = 8000
    FRAME_BYTES = 160
    SILENCE_BYTE = b"\xff"

OUT_CHUNK_BYTES = BYTES_PER_SEC // 10    # 100 ms per message

DEBUG_DIR = os.path.dirname(os.path.abspath(__file__))

# ==========================================
# SPEECH MODELS
# ==========================================


def load_model(size):
    return WhisperModel(size, device="cpu", compute_type="int8", cpu_threads=CPU_THREADS)


print("Loading speech models (the first run downloads them)...")
fast_model = load_model(FAST_MODEL)

if ACCURATE_MODEL == FAST_MODEL:
    accurate_model = fast_model
else:
    try:
        accurate_model = load_model(ACCURATE_MODEL)
    except Exception as error:
        print("Could not load", ACCURATE_MODEL, "- using", FAST_MODEL, "instead:", repr(error))
        accurate_model = fast_model


# ==========================================
# NASA POWER DATA - FETCH
# ==========================================

MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"]

CORE_PARAMS = "T2M,T2M_MAX,T2M_MIN,PRECTOTCORR,RH2M,ALLSKY_SFC_SW_DWN,GWETROOT,GWETTOP"
EXTRA_PARAMS = "T2MDEW,WS2M,GWETPROF"

NASA_CACHE = {}   # (lat, lon) -> {"time": ..., "text": ...}


def fetch_daily(lat, lon):
    end = datetime.date.today() - datetime.timedelta(days=1)
    start = end - datetime.timedelta(days=NASA_DAYS)

    # try everything first; if NASA rejects a parameter, fall back to the core set
    for names in (CORE_PARAMS + "," + EXTRA_PARAMS, CORE_PARAMS):
        try:
            response = requests.get(
                NASA_DAILY_URL,
                params={
                    "parameters": names,
                    "community": "AG",
                    "longitude": lon,
                    "latitude": lat,
                    "start": start.strftime("%Y%m%d"),
                    "end": end.strftime("%Y%m%d"),
                    "format": "JSON",
                },
                timeout=20,
            )
            response.raise_for_status()
            return response.json()["properties"]["parameter"]
        except Exception as error:
            print("NASA daily request failed:", repr(error))
    return {}


def fetch_climatology(lat, lon):
    try:
        response = requests.get(
            NASA_CLIMATE_URL,
            params={
                "parameters": "T2M,PRECTOTCORR,RH2M,ALLSKY_SFC_SW_DWN",
                "community": "AG",
                "longitude": lon,
                "latitude": lat,
                "format": "JSON",
            },
            timeout=20,
        )
        response.raise_for_status()
        return response.json()["properties"]["parameter"]
    except Exception as error:
        print("NASA climatology request failed:", repr(error))
        return {}


# ==========================================
# NASA POWER DATA - ANALYSIS (Python does the maths, not Qwen)
# ==========================================

def series(params, name):
    return [
        (day, value)
        for day, value in sorted(params.get(name, {}).items())
        if value is not None and value > -900
    ]


def vals(params, name, count):
    return [value for _, value in series(params, name)][-count:]


def mean(values):
    return sum(values) / len(values) if values else None


def climate_value(clim, name, month):
    value = clim.get(name, {}).get(month)
    if value is None or value < -900:
        return None
    return value


def soil_label(value):
    if value < 0.30:
        return "dry"
    if value < 0.60:
        return "moderate"
    return "wet"


def build_nasa_text(name, lat, lon, params, clim):
    t_days = series(params, "T2M")
    if not t_days:
        return ""

    last = t_days[-1][0]
    last_date = datetime.date(int(last[0:4]), int(last[4:6]), int(last[6:8]))
    month = MONTHS[last_date.month - 1]
    next_month = MONTHS[last_date.month % 12]

    facts = []
    signals = []

    # ---- temperature ----
    t14 = vals(params, "T2M", 14)
    t7 = t14[-7:]
    t_prev = t14[:-7]
    tmax14 = vals(params, "T2M_MAX", 14)
    tmin14 = vals(params, "T2M_MIN", 14)
    tavg = mean(t7)

    if tavg is not None:
        text = f"Temperature last 7 days: average {tavg:.1f} C"
        if tmax14 and tmin14:
            text += f", hottest day {max(tmax14[-7:]):.1f} C, coolest night {min(tmin14[-7:]):.1f} C"
        if t_prev:
            change = tavg - mean(t_prev)
            if abs(change) >= 0.5:
                text += f", {'warmer' if change > 0 else 'cooler'} by {abs(change):.1f} C than the week before"
        normal_t = climate_value(clim, "T2M", month)
        if normal_t is not None:
            text += f" (usual for {month}: {normal_t:.1f} C)"
        facts.append(text + ".")

    heat_days = sum(1 for v in tmax14 if v >= 35)
    cold_nights = sum(1 for v in tmin14 if v <= 10)
    if heat_days >= 3:
        signals.append(f"HEAT STRESS: HIGH - {heat_days} of the last 14 days reached 35 C or more; irrigate in the evening and mulch.")
    if cold_nights >= 3:
        signals.append(f"COLD STRESS: {cold_nights} nights of the last 14 were 10 C or colder; protect sensitive crops.")

    # ---- rainfall ----
    r30 = vals(params, "PRECTOTCORR", 30)
    r14 = r30[-14:]
    r7 = r30[-7:]
    rain7 = sum(r7) if r7 else None

    if r30:
        text = f"Rainfall: {sum(r7):.1f} mm in the last 7 days, {sum(r14):.1f} mm in 14 days, {sum(r30):.1f} mm in {len(r30)} days"
        rainy = sum(1 for v in r14 if v >= 2.5)
        text += f"; rain fell on {rainy} of the last 14 days"
        since = None
        for index, value in enumerate(reversed(r30)):
            if value >= 2.5:
                since = index
                break
        if since is not None:
            text += f"; last useful rain {since} day(s) before the latest data" if since else "; it rained on the latest day"
        else:
            text += f"; no useful rain in {len(r30)} days"
        normal_rain = climate_value(clim, "PRECTOTCORR", month)
        if normal_rain is not None and normal_rain * len(r30) > 1:
            expected = normal_rain * len(r30)
            pct = (sum(r30) / expected - 1) * 100
            text += f" (usual for this window: {expected:.0f} mm, so {abs(pct):.0f}% {'above' if pct >= 0 else 'below'} normal)"
        facts.append(text + ".")

    # ---- soil moisture ----
    root = vals(params, "GWETROOT", 8)
    top = vals(params, "GWETTOP", 1)
    prof = vals(params, "GWETPROF", 1)
    root_now = root[-1] if root else None

    if root_now is not None:
        text = f"Soil moisture (0 = bone dry, 1 = saturated): root zone {root_now:.2f} ({soil_label(root_now)})"
        if top:
            text += f", topsoil {top[0]:.2f} ({soil_label(top[0])})"
        if prof:
            text += f", whole soil profile {prof[0]:.2f}"
        if len(root) >= 2:
            change = root[-1] - root[0]
            if abs(change) >= 0.03:
                text += f"; root zone is {'getting wetter' if change > 0 else 'drying out'} over the last week"
        facts.append(text + ".")

    # ---- water balance (estimated crop water demand vs rain) ----
    temp_by_day = dict(series(params, "T2M"))
    sun_by_day = dict(series(params, "ALLSKY_SFC_SW_DWN"))
    rain_by_day = dict(series(params, "PRECTOTCORR"))
    common = sorted(set(temp_by_day) & set(sun_by_day) & set(rain_by_day))[-7:]
    balance = None

    if len(common) >= 5:
        # Hargreaves radiation method; sunlight kWh/m2/day -> MJ -> mm of evaporation
        demand = sum(
            0.0135 * (temp_by_day[d] + 17.8) * (sun_by_day[d] * 3.6 / 2.45)
            for d in common
        )
        rain_common = sum(rain_by_day[d] for d in common)
        balance = rain_common - demand
        facts.append(
            f"Estimated crop water demand over the last {len(common)} days: {demand:.0f} mm, "
            f"against {rain_common:.0f} mm of rain, so the water balance is {balance:+.0f} mm "
            f"({'deficit, crops need irrigation' if balance < 0 else 'surplus'})."
        )

    # ---- humidity and disease ----
    rh14 = vals(params, "RH2M", 14)
    humid_days = sum(1 for v in rh14 if v >= 80)

    if rh14:
        text = f"Humidity: average {mean(rh14[-7:]):.0f} percent in the last 7 days; {humid_days} of the last 14 days had humidity of 80 percent or more"
        dew = vals(params, "T2MDEW", 7)
        if dew and t7 and len(dew) == len(t7):
            wet_nights = sum(1 for t, d in zip(t7, dew) if t - d <= 2)
            text += f"; leaves likely stayed wet on {wet_nights} of the last 7 days"
        facts.append(text + ".")

        if tavg is not None:
            if humid_days >= 7 and 18 <= tavg <= 32:
                signals.append("FUNGAL DISEASE RISK: HIGH - warm and humid for many days; watch for blight, mildew and rust, avoid overhead irrigation.")
            elif humid_days >= 4 and 16 <= tavg <= 34:
                signals.append("FUNGAL DISEASE RISK: MODERATE - scout the crop regularly.")
            else:
                signals.append("FUNGAL DISEASE RISK: LOW.")

    # ---- wind ----
    wind7 = vals(params, "WS2M", 7)
    if wind7:
        windy = sum(1 for v in wind7 if v >= 5)
        facts.append(f"Wind: average {mean(wind7):.1f} metres per second; {windy} of the last 7 days were windy (5 m/s or more).")
        if windy >= 3:
            signals.append("SPRAYING: avoid spraying on windy days; spray in the calm early morning.")

    # ---- sunlight ----
    sun7 = vals(params, "ALLSKY_SFC_SW_DWN", 7)
    if sun7:
        facts.append(f"Sunlight: average {mean(sun7):.1f} kWh per square metre per day over the last 7 days.")

    # ---- irrigation signal ----
    if root_now is not None:
        if root_now < 0.30 or (balance is not None and balance < -25 and root_now < 0.50):
            signals.append("IRRIGATION: HIGH - soil is dry or the water balance is negative; irrigate soon.")
        elif root_now > 0.70 or (rain7 is not None and rain7 >= 50):
            signals.append("IRRIGATION: LOW - soil is wet; hold irrigation and keep field drainage open.")
        else:
            signals.append("IRRIGATION: MODERATE - soil moisture is fair; irrigate lightly if the crop is young or flowering.")

        if 0.35 <= root_now <= 0.75 and heat_days < 3:
            signals.append("SOWING: soil moisture is suitable for sowing.")
        elif root_now < 0.35:
            signals.append("SOWING: soil is dry; sow only if irrigation is available.")
        else:
            signals.append("SOWING: soil is very wet; wait for the field to drain before sowing.")

    # ---- long-term outlook (averages, NOT a forecast) ----
    rain_this = climate_value(clim, "PRECTOTCORR", month)
    rain_next = climate_value(clim, "PRECTOTCORR", next_month)
    temp_next = climate_value(clim, "T2M", next_month)
    outlook = []
    if rain_this is not None:
        outlook.append(f"{month} usually gets about {rain_this * 30:.0f} mm of rain")
    if rain_next is not None:
        text = f"{next_month} about {rain_next * 30:.0f} mm"
        if temp_next is not None:
            text += f" with an average temperature of {temp_next:.0f} C"
        outlook.append(text)
    if outlook:
        facts.append("Long-term NASA averages for this location, not a forecast: " + "; ".join(outlook) + ".")

    header = (
        f"NASA POWER satellite data for {name} (latitude {lat}, longitude {lon}). "
        f"Latest data is from {last_date.isoformat()}."
    )

    text = header + "\nFACTS:\n- " + "\n- ".join(facts)
    if signals:
        text += "\nADVICE SIGNALS (calculated from the facts):\n- " + "\n- ".join(signals)
    return text


def get_nasa_summary(loc):
    name, lat, lon = loc
    key = (round(lat, 2), round(lon, 2))
    now = time.time()

    entry = NASA_CACHE.get(key)
    if entry and now - entry["time"] < NASA_CACHE_SECONDS:
        return entry["text"]

    try:
        with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
            daily_job = pool.submit(fetch_daily, lat, lon)
            climate_job = pool.submit(fetch_climatology, lat, lon)
            params = daily_job.result()
            clim = climate_job.result()

        text = build_nasa_text(name, lat, lon, params, clim) if params else ""
        if text:
            NASA_CACHE[key] = {"time": now, "text": text}
            return text
    except Exception as error:
        print("NASA data error:", repr(error))

    return entry["text"] if entry else ""


def find_location(question):
    lowered = question.lower()
    for place, (lat, lon) in LOCATIONS.items():
        if place in lowered:
            return (place.title(), lat, lon)
    return None


# ==========================================
# TEXT HELPERS
# ==========================================

def clean_for_speech(text):
    text = re.sub(r"[*#_`>\[\]]", "", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def is_junk(text, lang):
    words = text.lower().translate(PUNCT).split()
    if not words:
        return True
    if " ".join(words) in JUNK_PHRASES:
        return True
    if lang == "en" and len(words) < 2:
        return True
    return False


def build_messages(question, lang, nasa_text):
    language_name = LANGUAGE_NAMES.get(lang, "English")

    # The system text stays identical between questions (same place), so Ollama can reuse
    # its cached start of the prompt. The language instruction goes in the user message.
    system = (
        "You are Field Shift, a voice assistant that helps Indian farmers on a phone call. "
        "No lists, no markdown, no emojis. "
        "If the question is unclear or not about farming, politely ask the farmer to repeat."
    )

    if nasa_text:
        system += (
            "\n\nYou give advice ONLY from the NASA satellite data below. Rules:\n"
            "1. Start from the data. Quote at least two real numbers from it "
            "(for example rainfall in mm, soil moisture, temperature) and say what they mean for the farmer's question.\n"
            "2. Follow the ADVICE SIGNALS. Do not contradict them.\n"
            "3. Say that the numbers come from NASA data.\n"
            "4. The data is recent past conditions and long-term averages. It is NOT a forecast. "
            "Never promise rain or weather.\n"
            "5. Never invent a number. If something is not in the data, say you do not have it.\n"
            "6. End with one short, practical action for the farmer.\n\n"
            + nasa_text
        )
    else:
        system += (
            "\n\nNASA data could not be loaded right now. Give careful general advice "
            "and tell the farmer that NASA data is not available at the moment."
        )

    sentences = "2 to 3" if lang == "en" else "2"
    user = (
        f"{question}\n\n"
        f"(Reply only in {language_name}, in {sentences} short, simple sentences, using the NASA data.)"
    )

    return [
        {"role": "system", "content": system},
        {"role": "user", "content": user},
    ]


# ==========================================
# STREAMING LLM (runs in a thread)
# ==========================================

def stream_llm(messages, loop, queue, max_tokens):
    """Streams Qwen's answer and pushes complete sentences into the queue."""
    buffer = ""
    pending = ""
    full = []

    def emit(text):
        text = clean_for_speech(text)
        if text:
            full.append(text)
            loop.call_soon_threadsafe(queue.put_nowait, text)

    try:
        with requests.post(
            OLLAMA_URL,
            json={
                "model": MODEL_NAME,
                "stream": True,
                "keep_alive": KEEP_ALIVE,
                "options": {"temperature": 0.3, "num_predict": max_tokens, "num_ctx": 3072},
                "messages": messages,
            },
            stream=True,
            timeout=120,
        ) as response:
            response.raise_for_status()

            for line in response.iter_lines():
                if not line:
                    continue
                piece = json.loads(line).get("message", {}).get("content", "")
                buffer += piece

                parts = SENT_SPLIT.split(buffer)
                buffer = parts.pop()          # last part may be unfinished

                for part in parts:
                    pending = (pending + " " + part).strip()
                    if len(pending) >= MIN_CHUNK_CHARS:
                        emit(pending)
                        pending = ""

        pending = (pending + " " + buffer).strip()
        if pending:
            emit(pending)

        print("Answer:", " ".join(full))

    finally:
        loop.call_soon_threadsafe(queue.put_nowait, None)


# ==========================================
# TEXT TO SPEECH
# ==========================================

def run_ffmpeg(args):
    return subprocess.run([FFMPEG, "-y", *args], check=True, capture_output=True)


async def synthesize(text, voice):
    with tempfile.TemporaryDirectory() as folder:
        mp3_path = os.path.join(folder, "part.mp3")
        raw_path = os.path.join(folder, "part.raw")

        try:
            await edge_tts.Communicate(text, voice, rate=VOICE_RATE).save(mp3_path)
        except Exception as error:
            print("Voice failed, using default voice:", repr(error))
            await edge_tts.Communicate(text, DEFAULT_VOICE, rate=VOICE_RATE).save(mp3_path)

        await asyncio.to_thread(
            run_ffmpeg,
            [
                "-i", mp3_path,
                "-af", "highpass=f=100,dynaudnorm",
                *FFMPEG_OUT,
                "-ar", "8000",
                "-ac", "1",
                raw_path,
            ],
        )

        with open(raw_path, "rb") as audio_file:
            return audio_file.read()


AUDIO_CACHE = {"greeting": b"", "filler": {}}


async def prepare_audio():
    """Builds the welcome message and the 'one moment' phrases once, at start-up."""
    pause = SILENCE_BYTE * (BYTES_PER_SEC // 5)
    pieces = []

    for lang, text in GREETINGS:
        if lang not in ALLOWED_LANGS:
            continue
        try:
            pieces.append(await synthesize(text, VOICES.get(lang, DEFAULT_VOICE)))
            pieces.append(pause)
        except Exception as error:
            print("Could not prepare greeting for", lang, ":", repr(error))

    AUDIO_CACHE["greeting"] = b"".join(pieces)

    for lang, text in FILLERS.items():
        if lang not in ALLOWED_LANGS:
            continue
        try:
            AUDIO_CACHE["filler"][lang] = await synthesize(text, VOICES.get(lang, DEFAULT_VOICE))
        except Exception as error:
            print("Could not prepare filler for", lang, ":", repr(error))

    seconds = len(AUDIO_CACHE["greeting"]) / BYTES_PER_SEC
    print(f"Welcome message ready ({seconds:.1f} s). Fillers ready for: {', '.join(AUDIO_CACHE['filler']) or 'none'}")


async def send_audio(websocket, stream_sid, audio, state):
    for position in range(0, len(audio), OUT_CHUNK_BYTES):
        chunk = audio[position:position + OUT_CHUNK_BYTES]

        remainder = len(chunk) % FRAME_BYTES
        if remainder:
            chunk += SILENCE_BYTE * (FRAME_BYTES - remainder)

        # stay only a little ahead of what the caller is hearing
        now = time.monotonic()
        ahead = max(state["play_end"], now) - now
        if ahead > MAX_AHEAD_SECONDS:
            await asyncio.sleep(ahead - MAX_AHEAD_SECONDS)

        await websocket.send(json.dumps({
            "event": "media",
            "stream_sid": stream_sid,
            "media": {"payload": base64.b64encode(chunk).decode("ascii")},
        }))

        state["play_end"] = max(state["play_end"], time.monotonic()) + len(chunk) / BYTES_PER_SEC


async def greet_task(websocket, stream_sid, state):
    try:
        audio = AUDIO_CACHE["greeting"]
        if audio:
            print("Playing welcome message...")
            await send_audio(websocket, stream_sid, audio, state)
    except Exception as error:
        print("Welcome message stopped:", repr(error))
    finally:
        state["busy"] = False
        state["ignore_until"] = max(time.monotonic(), state["play_end"]) + 0.3


async def answer_question(websocket, stream_sid, question, lang, state, t0, filler_task=None):
    # pick the location: a place the farmer named, else the last one, else the default
    loc = find_location(question) or state["loc"] or DEFAULT_LOCATION
    state["loc"] = loc

    nasa_text = await asyncio.to_thread(get_nasa_summary, loc)
    print(f"Using NASA data for {loc[0]} ({'loaded' if nasa_text else 'NOT available'}) "
          f"[{time.monotonic() - t0:.1f} s]")

    messages = build_messages(question, lang, nasa_text)
    voice = VOICES.get(lang, DEFAULT_VOICE)
    max_tokens = 160 if lang == "en" else 280    # Indian scripts need many more tokens

    loop = asyncio.get_running_loop()
    sentence_queue = asyncio.Queue()
    audio_queue = asyncio.Queue()

    async def feeder():
        # start turning each sentence into speech as soon as it arrives
        while True:
            sentence = await sentence_queue.get()
            if sentence is None:
                await audio_queue.put(None)
                break
            await audio_queue.put(asyncio.create_task(synthesize(sentence, voice)))

    feeder_task = asyncio.create_task(feeder())
    producer_task = asyncio.create_task(
        asyncio.to_thread(stream_llm, messages, loop, sentence_queue, max_tokens)
    )

    first_audio = True
    try:
        while True:
            item = await audio_queue.get()
            if item is None:
                break

            audio = await item

            if first_audio:
                first_audio = False
                print(f"First answer audio ready after {time.monotonic() - t0:.1f} s")
                if filler_task:
                    await filler_task          # let "one moment" finish before the answer
                    filler_task = None

            await send_audio(websocket, stream_sid, audio, state)
    finally:
        feeder_task.cancel()
        tasks = [producer_task, feeder_task]
        if filler_task:
            tasks.append(filler_task)
        results = await asyncio.gather(*tasks, return_exceptions=True)
        if isinstance(results[0], Exception):
            print("LLM error:", repr(results[0]))

    print("Voice response sent.")


# ==========================================
# DETECT APPROXIMATE SILENCE
# ==========================================

def looks_like_silence(audio):
    if not audio:
        return False

    if AUDIO_FORMAT == "pcm":
        usable = len(audio) - (len(audio) % 2)
        samples = array("h")
        samples.frombytes(audio[:usable])
        if sys.byteorder == "big":
            samples.byteswap()
        if not samples:
            return False
        rms = math.sqrt(sum(s * s for s in samples) / len(samples))
        return rms < SILENCE_RMS

    quiet = sum(1 for byte in audio if byte >= 250 or byte <= 5)
    return quiet / len(audio) > 0.90


# ==========================================
# DETECT LANGUAGE + TRANSCRIBE (runs in a thread)
# ==========================================

def good_score(lang):
    return -1.0 if lang == "en" else -1.4


def detect_language(audio):
    """Picks the most likely language among ALLOWED_LANGS only."""
    try:
        _, _, all_probs = fast_model.detect_language(audio)
        scores = {code: prob for code, prob in all_probs if code in ALLOWED_LANGS}
        total = sum(scores.values())
        if scores and total > 0:
            best = max(scores, key=scores.get)
            confidence = scores[best] / total
            print(f"Detected language: {best} ({confidence:.0%})")
            return best, confidence
    except Exception as error:
        print("Language detection failed:", repr(error))
    return None, 0.0


def run_whisper(audio, lang):
    model = fast_model if lang == "en" else accurate_model

    segments, info = model.transcribe(
        audio,
        language=lang,
        beam_size=WHISPER_BEAM,
        vad_filter=True,
        vad_parameters={"min_silence_duration_ms": 500},
        initial_prompt=WHISPER_PROMPTS.get(lang),
        condition_on_previous_text=False,
        temperature=0.0,
        without_timestamps=True,
    )

    parts = []
    scores = []
    for segment in segments:
        if segment.no_speech_prob > 0.6:
            continue
        parts.append(segment.text.strip())
        scores.append(segment.avg_logprob)

    text = " ".join(parts).strip()
    score = sum(scores) / len(scores) if scores else -9.0
    return text, score


def detect_and_transcribe(wav_path, locked_lang):
    audio = decode_audio(wav_path, sampling_rate=16000)

    # 1) language fixed in the settings
    forced = FORCE_LANGUAGE or (ALLOWED_LANGS[0] if len(ALLOWED_LANGS) == 1 else None)
    if forced:
        text, score = run_whisper(audio, forced)
        return text, forced, score

    # 2) language already known for this call: skip detection (saves time)
    if locked_lang:
        text, score = run_whisper(audio, locked_lang)
        if text and score >= good_score(locked_lang):
            return text, locked_lang, score

        # weak result: maybe the farmer switched language
        detected, confidence = detect_language(audio)
        if detected and detected != locked_lang and confidence >= 0.6:
            text2, score2 = run_whisper(audio, detected)
            if text2 and score2 > score:
                return text2, detected, score2
        return text, locked_lang, score

    # 3) first question of the call: detect once
    lang, _ = detect_language(audio)
    lang = lang or ALLOWED_LANGS[0]
    text, score = run_whisper(audio, lang)
    return text, lang, score


# ==========================================
# PROCESS FARMER AUDIO
# ==========================================

async def process_question(websocket, stream_sid, audio, state):
    t0 = time.monotonic()
    print("Processing farmer audio...")

    try:
        with tempfile.TemporaryDirectory() as folder:
            raw_path = os.path.join(folder, "question.raw")
            wav_path = os.path.join(folder, "question.wav")

            with open(raw_path, "wb") as audio_file:
                audio_file.write(audio)

            await asyncio.to_thread(
                run_ffmpeg,
                [
                    *FFMPEG_IN,
                    "-ar", "8000",
                    "-ac", "1",
                    "-i", raw_path,
                    "-af", "highpass=f=100,dynaudnorm",
                    "-ar", "16000",
                    "-ac", "1",
                    wav_path,
                ],
            )

            # DEBUG: the exact WAV Whisper hears
            shutil.copy(wav_path, os.path.join(DEBUG_DIR, "debug_question.wav"))

            question, lang, score = await asyncio.to_thread(
                detect_and_transcribe, wav_path, state["lang"]
            )

        print(f"Farmer said ({lang}, confidence {score:.2f}): {question!r}  "
              f"[heard in {time.monotonic() - t0:.1f} s]")

        min_score = -1.2 if lang == "en" else -1.6
        if score < min_score or is_junk(question, lang):
            print("Ignoring (noise, unclear or too short).")
            return

        state["lang"] = lang

        # react immediately with a short cached phrase while the answer is prepared
        filler = AUDIO_CACHE["filler"].get(lang)
        filler_task = (
            asyncio.create_task(send_audio(websocket, stream_sid, filler, state))
            if filler else None
        )

        await answer_question(websocket, stream_sid, question, lang, state, t0, filler_task)

    except subprocess.CalledProcessError as error:
        print("ffmpeg failed:", error.stderr.decode(errors="ignore")[-500:])

    except requests.RequestException as error:
        print("LLM request failed:", repr(error))

    except Exception as error:
        print("Error while processing question:", repr(error))


async def answer_task(websocket, stream_sid, audio, state):
    state["busy"] = True
    try:
        await process_question(websocket, stream_sid, audio, state)
    finally:
        state["busy"] = False
        state["ignore_until"] = (
            max(time.monotonic(), state["play_end"]) + IGNORE_AFTER_SPEAKING
        )


# ==========================================
# EXOTEL WEBSOCKET VOICEBOT
# ==========================================

async def exotel_voicebot(websocket):
    stream_sid = None
    audio_buffer = bytearray()
    silence_duration = 0.0
    heard_speech = False
    pre_roll = collections.deque(maxlen=5)   # about 100 ms before speech starts
    state = {"busy": False, "ignore_until": 0.0, "play_end": 0.0, "lang": None, "loc": None}

    print("Caller connected")

    try:
        async for message in websocket:
            data = json.loads(message)
            event = data.get("event")

            if event == "connected":
                print("WebSocket connection established")

            elif event == "start":
                stream_sid = (
                    data.get("stream_sid")
                    or data.get("streamSid")
                    or data.get("start", {}).get("stream_sid")
                    or data.get("start", {}).get("streamSid")
                )
                print("Call started. Stream SID:", stream_sid)
                audio_buffer.clear()
                silence_duration = 0.0
                heard_speech = False
                pre_roll.clear()

                # refresh the NASA data while the welcome message plays
                asyncio.create_task(asyncio.to_thread(get_nasa_summary, DEFAULT_LOCATION))

                # play the welcome message (the microphone is ignored while it plays)
                state["busy"] = True
                asyncio.create_task(greet_task(websocket, stream_sid, state))

            elif event == "media":
                # ignore the line while the bot is speaking or thinking
                if state["busy"] or time.monotonic() < state["ignore_until"]:
                    continue

                payload = data.get("media", {}).get("payload", "")
                if not payload:
                    continue

                chunk = base64.b64decode(payload)

                is_silent = looks_like_silence(chunk)
                chunk_seconds = len(chunk) / BYTES_PER_SEC

                if not heard_speech:
                    if is_silent:
                        pre_roll.append(chunk)
                        continue

                    heard_speech = True
                    print("Receiving farmer audio...")
                    for old_chunk in pre_roll:
                        audio_buffer.extend(old_chunk)
                    pre_roll.clear()

                audio_buffer.extend(chunk)

                if is_silent:
                    silence_duration += chunk_seconds
                else:
                    silence_duration = 0.0

                ready_to_process = (
                    len(audio_buffer) >= BYTES_PER_SEC
                    and silence_duration >= SILENCE_SECONDS
                ) or len(audio_buffer) >= BYTES_PER_SEC * 10

                if ready_to_process:
                    question_audio = bytes(audio_buffer)
                    audio_buffer.clear()
                    silence_duration = 0.0
                    heard_speech = False
                    pre_roll.clear()

                    state["busy"] = True     # set now so no audio slips in
                    asyncio.create_task(
                        answer_task(websocket, stream_sid, question_audio, state)
                    )

            elif event == "stop":
                print("Call ended")
                break

            else:
                print("WebSocket event:", event)

    except websockets.exceptions.ConnectionClosed as error:
        print("WebSocket disconnected:", repr(error))

    except Exception as error:
        print("Voicebot error:", repr(error))


# ==========================================
# START-UP WARM-UP
# ==========================================

def warm_up():
    try:
        requests.post(
            OLLAMA_URL,
            json={
                "model": MODEL_NAME,
                "stream": False,
                "keep_alive": KEEP_ALIVE,
                "options": {"num_predict": 1},
                "messages": [{"role": "user", "content": "hi"}],
            },
            timeout=180,
        )
        print("Language model ready.")
    except Exception as error:
        print("Could not warm up the language model:", repr(error))

    text = get_nasa_summary(DEFAULT_LOCATION)
    print("=" * 45)
    print(text if text else "NASA data: NOT available (check internet)")
    print("=" * 45)


# ==========================================
# MAIN
# ==========================================

async def main():
    await asyncio.to_thread(warm_up)
    await prepare_audio()

    async with websockets.serve(
        exotel_voicebot,
        "0.0.0.0",
        PORT,
        max_size=None,
        ping_interval=None,   # avoids "keepalive ping timeout"
    ):
        print("=" * 45)
        print("FIELD SHIFT VOICEBOT RUNNING")
        print("WebSocket port:", PORT)
        print("AI model:", MODEL_NAME)
        print("Speech models:", FAST_MODEL, "(English) /", ACCURATE_MODEL, "(other languages)")
        print("Languages:", ", ".join(ALLOWED_LANGS))
        print("Default NASA location:", DEFAULT_LOCATION[0])
        print("=" * 45)
        await asyncio.Future()


if __name__ == "__main__":
    asyncio.run(main())