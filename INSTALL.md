# Install PowerMem Memory for OpenClaw

Give [OpenClaw](https://github.com/openclaw/openclaw) long-term memory via [PowerMem](https://github.com/oceanbase/powermem): intelligent extraction, Ebbinghaus forgetting curve. After setup, OpenClaw can **remember** facts from conversations and **recall** relevant context before responding.

---

## One-Click Install (Linux / macOS)

**Prerequisites:** OpenClaw installed (`openclaw --version`). PowerMem is **not** installed by this script—you either run a PowerMem server yourself (HTTP mode) or use the `pmem` CLI (CLI mode). The script only deploys the plugin and configures OpenClaw.

```bash
curl -fsSL https://raw.githubusercontent.com/ob-labs/openclaw-extension-powermem/main/install.sh | bash
```

Or run from the repo root (no download):

```bash
cd /path/to/openclaw-extension-powermem
bash install.sh
```

Non-interactive (defaults: HTTP mode, baseUrl http://localhost:8000):

```bash
curl -fsSL https://raw.githubusercontent.com/ob-labs/openclaw-extension-powermem/main/install.sh | bash -s -y
```

Install to a specific OpenClaw instance:

```bash
curl -fsSL ... | bash -s -- --workdir ~/.openclaw-second
```

The script will: 1) check OpenClaw, 2) ask mode (http / cli) and connection details, 3) deploy the plugin into `~/.openclaw/extensions/memory-powermem`, 4) run `npm install` there, 5) set OpenClaw config (plugins.enabled, slots.memory, entries.memory-powermem).

**After running:** Start or ensure PowerMem is running (HTTP: `powermem-server --port 8000` in a dir with `.env`; CLI: `pmem` on PATH and optional `.env`). Then start OpenClaw: `openclaw gateway`.

---

## Quick Start (Let OpenClaw Install It)

Copy the skill file into OpenClaw’s skill directory, then ask OpenClaw to do the rest.

**Linux / macOS:**

```bash
mkdir -p ~/.openclaw/skills/install-powermem-memory
cp /path/to/openclaw-extension-powermem/skills/install-powermem-memory/SKILL.md \
   ~/.openclaw/skills/install-powermem-memory/
```

**Windows (PowerShell):**

```powershell
New-Item -ItemType Directory -Force "$env:USERPROFILE\.openclaw\skills\install-powermem-memory"
Copy-Item "path\to\openclaw-extension-powermem\skills\install-powermem-memory\SKILL.md" `
  "$env:USERPROFILE\.openclaw\skills\install-powermem-memory\"
```

Then tell OpenClaw: **「安装 PowerMem 记忆」** or **“Install PowerMem memory”** — it will read the skill and guide you through setup (install plugin, configure, start PowerMem if needed).

For manual installation, continue below.

---

## Prerequisites

| Component    | Purpose |
|-------------|---------|
| **OpenClaw** | CLI + gateway; run `openclaw --version` and `openclaw onboard` if needed. |
| **PowerMem** | Either (1) **HTTP**: run `powermem-server` (pip or Docker) and have a base URL, or (2) **CLI**: have `pmem` on PATH and a PowerMem `.env` (optional). |

You do **not** need to install PowerMem inside OpenClaw; the plugin talks to an existing server or runs `pmem` locally.

---

## Manual Installation Steps

### 1. Install and start PowerMem (if using HTTP mode)

See [README.md](README.md#step-1-install-and-start-powermem): install with `pip install powermem` or Docker, create `.env` (LLM + Embedding), then:

```bash
cd /path/to/dir/with/.env
powermem-server --host 0.0.0.0 --port 8000
```

Verify: `curl -s http://localhost:8000/api/v1/system/health`

(If using **CLI mode** only, ensure `pmem` is on PATH and optionally set `POWERMEM_ENV_FILE` or use `--env-file`; the plugin will call `pmem` for each request.)

### 2. Install the plugin into OpenClaw

```bash
openclaw plugins install /path/to/openclaw-extension-powermem
# Or symlink for development:
openclaw plugins install -l /path/to/openclaw-extension-powermem
```

Confirm: `openclaw plugins list` shows `memory-powermem`.

### 3. Configure OpenClaw

Edit `~/.openclaw/openclaw.json` (or set via `openclaw config set`):

**HTTP mode:**

```json
{
  "plugins": {
    "enabled": true,
    "slots": { "memory": "memory-powermem" },
    "entries": {
      "memory-powermem": {
        "enabled": true,
        "config": {
          "mode": "http",
          "baseUrl": "http://localhost:8000",
          "autoCapture": true,
          "autoRecall": true,
          "inferOnAdd": true
        }
      }
    }
  }
}
```

**CLI mode (no server):**

```json
"config": {
  "mode": "cli",
  "envFile": "/path/to/powermem/.env",
  "pmemPath": "pmem",
  "autoCapture": true,
  "autoRecall": true,
  "inferOnAdd": true
}
```

### 4. Restart and verify

Restart the OpenClaw gateway (or app), then:

```bash
openclaw ltm health
openclaw ltm add "I prefer Americano in the morning"
openclaw ltm search "coffee"
```

If health is OK and search returns the memory, setup is complete.

---

## Multi-Instance (--workdir)

To target a different OpenClaw instance:

```bash
# Install script
curl -fsSL ... | bash -s -- --workdir ~/.openclaw-second

# Manual config
OPENCLAW_STATE_DIR=~/.openclaw-second openclaw config set plugins.slots.memory memory-powermem
```

---

## Troubleshooting

| Symptom | Fix |
|--------|-----|
| `openclaw ltm health` fails | PowerMem server not running or wrong `baseUrl`; for CLI, check `pmem` on PATH and `.env`. |
| Plugin not loaded | Ensure `plugins.slots.memory` is `memory-powermem` and gateway restarted. |
| Add/search returns 500 or empty | Check PowerMem logs; usually LLM/Embedding API key or model in `.env`. |

More: [README.md#troubleshooting](README.md#troubleshooting).
