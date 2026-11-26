#!/usr/bin/env python3
"""MD Simulator server for self-hosting (e.g. a Raspberry Pi).

Serves the app and, when an Anthropic API key is configured, a small AI endpoint
so conversations, the interview room and written replies work outside claude.ai.
The key stays on the server and is never sent to the browser.

    pip install anthropic
    export ANTHROPIC_API_KEY=...            # or `ant auth login`
    export MDSIM_PASSCODE=choose-a-passcode # strongly recommended if others can reach the Pi
    python3 server.py --port 8080

Optional: MDSIM_MODEL (default claude-opus-5-5), MDSIM_DAILY_LIMIT (requests per day, default 300).
"""
import argparse
import hmac
import json
import os
import threading
import time
from datetime import date
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

APP_DIR = Path(__file__).resolve().parent / "app"
MODEL = os.environ.get("MDSIM_MODEL", "claude-opus-5-5")
PASSCODE = os.environ.get("MDSIM_PASSCODE", "")
DAILY_LIMIT = int(os.environ.get("MDSIM_DAILY_LIMIT", "300"))
MAX_INPUT_CHARS = 200_000
EFFORT = {"quick": "low", "default": "medium", "complex": "high"}

try:
    import anthropic
except ImportError:  # the app still works; AI features report themselves unavailable
    anthropic = None

_client = None
_client_error = ""
_usage = {"day": date.today().isoformat(), "count": 0}
_lock = threading.Lock()


def get_client():
    global _client, _client_error
    if _client is not None or _client_error:
        return _client
    if anthropic is None:
        _client_error = "The anthropic package isn't installed (pip install anthropic)."
        return None
    try:
        _client = anthropic.Anthropic()
    except Exception as exc:  # noqa: BLE001 - report any credential problem to the status endpoint
        _client_error = f"No Anthropic credentials found ({type(exc).__name__}). Set ANTHROPIC_API_KEY or run `ant auth login`."
    return _client


def to_messages(inp):
    """Accept a prompt string or a list of {role, content} turns; merge same-role neighbours."""
    turns = [{"role": "user", "content": inp}] if isinstance(inp, str) else list(inp)
    out = []
    for t in turns:
        role, content = t.get("role"), str(t.get("content", ""))
        if role not in ("user", "assistant") or not content.strip():
            continue
        if out and out[-1]["role"] == role:
            out[-1]["content"] += "\n\n" + content
        else:
            out.append({"role": role, "content": content})
    if not out or out[0]["role"] != "user" or out[-1]["role"] != "user":
        raise ValueError("Conversation must start and end with a user turn.")
    return out


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(APP_DIR), **kwargs)

    def log_message(self, fmt, *args):  # quieter logs, no request bodies
        if self.path.startswith("/api/"):
            super().log_message(fmt, *args)

    def _json(self, code, obj):
        body = json.dumps(obj).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _authorised(self):
        if not PASSCODE:
            return True
        return hmac.compare_digest(self.headers.get("X-MDSim-Passcode", ""), PASSCODE)

    def do_GET(self):
        if self.path == "/api/ai/status":
            client = get_client()
            return self._json(200, {
                "available": client is not None,
                "reason": _client_error,
                "model": MODEL if client else None,
                "passcode": bool(PASSCODE),
                "authorised": self._authorised(),
            })
        return super().do_GET()

    def do_POST(self):
        if self.path != "/api/ai/sample":
            return self._json(404, {"error": "not_found"})
        if not self._authorised():
            return self._json(401, {"error": "not_granted", "message": "Wrong or missing passcode."})
        client = get_client()
        if client is None:
            return self._json(503, {"error": "sampling_disabled", "message": _client_error})
        with _lock:
            today = date.today().isoformat()
            if _usage["day"] != today:
                _usage.update(day=today, count=0)
            if _usage["count"] >= DAILY_LIMIT:
                return self._json(429, {"error": "rate_limited", "message": "Daily AI limit reached on this server."})
            _usage["count"] += 1
        try:
            length = int(self.headers.get("Content-Length", "0"))
            if length > MAX_INPUT_CHARS * 4:
                return self._json(413, {"error": "prompt_too_large"})
            req = json.loads(self.rfile.read(length) or b"{}")
            messages = to_messages(req.get("input"))
            if sum(len(m["content"]) for m in messages) > MAX_INPUT_CHARS:
                return self._json(413, {"error": "prompt_too_large"})
        except (ValueError, json.JSONDecodeError) as exc:
            return self._json(400, {"error": "invalid_request", "message": str(exc)})

        effort = EFFORT.get(req.get("modelTier") or "default", "medium")
        self.send_response(200)
        self.send_header("Content-Type", "application/x-ndjson")
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Accel-Buffering", "no")
        self.end_headers()

        def emit(obj):
            self.wfile.write((json.dumps(obj) + "\n").encode())
            self.wfile.flush()

        started = time.time()
        try:
            with client.beta.messages.stream(
                model=MODEL,
                max_tokens=16000,
                betas=["server-side-fallback-2026-07-01"],
                fallbacks="default",
                output_config={"effort": effort},
                messages=messages,
            ) as stream:
                for text in stream.text_stream:
                    emit({"delta": text})
                final = stream.get_final_message()
            if final.stop_reason == "refusal":
                emit({"error": "refused", "message": "Claude declined this request."})
            else:
                emit({"done": True, "truncated": final.stop_reason == "max_tokens", "model": final.model, "secs": round(time.time() - started, 1)})
        except BrokenPipeError:
            pass  # the viewer pressed Stop
        except anthropic.RateLimitError:
            emit({"error": "rate_limited", "message": "The Anthropic API is rate limiting this key. Try again shortly."})
        except anthropic.AuthenticationError:
            emit({"error": "sampling_disabled", "message": "The API key was rejected."})
        except anthropic.APIStatusError as exc:
            emit({"error": "upstream_error", "message": f"API error {exc.status_code}."})
        except anthropic.APIConnectionError:
            emit({"error": "upstream_error", "message": "Couldn't reach the Anthropic API."})


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--host", default="0.0.0.0")
    ap.add_argument("--port", type=int, default=8080)
    args = ap.parse_args()
    get_client()
    print(f"MD Simulator on http://{args.host}:{args.port}  ·  AI: {'on (' + MODEL + ')' if _client else 'off: ' + _client_error}")
    if _client and not PASSCODE:
        print("Warning: no MDSIM_PASSCODE set. Anyone who can reach this server can spend your API credit.")
    ThreadingHTTPServer((args.host, args.port), Handler).serve_forever()


if __name__ == "__main__":
    main()
