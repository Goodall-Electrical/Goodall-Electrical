# Deploying the Goodall Electrical Website

This site is packaged as a single Docker container. The recommended setup is:

```
[Internet] → [Reverse proxy (Caddy / Nginx / Traefik)] → [goodall-website:3000]
```

The reverse proxy terminates TLS (Let's Encrypt) and forwards to the container. The container itself only speaks plain HTTP on port 3000.

---

## 1. Prerequisites on the host

- Linux server (any modern distro — Ubuntu 22.04+ is fine).
- Docker Engine 24+ and the Docker Compose plugin (`docker compose`, not `docker-compose`).
- A DNS A record pointing `goodallelectrical.com.au` (and the `www.` alias) at the server.
- Outbound port 443 open (so the server can reach Fergus + SMTP).
- A user that's in the `docker` group.

Verify Docker:

```bash
docker --version           # >= 24
docker compose version     # v2+
```

---

## 2. Get the code onto the server

```bash
git clone <your-repo-url> /opt/goodall-website
cd /opt/goodall-website/website
```

(Or `scp -r` the repo across — anything that gets the files there.)

---

## 3. Configure environment

```bash
cp .env.example .env
nano .env
```

Required values:

| Variable | What to set it to |
|---|---|
| `SMTP_HOST` / `PORT` / `USER` / `PASS` / `FROM` | Your Microsoft 365, Google Workspace or transactional provider details |
| `GOODALL_INBOX` | Where contact-form notification emails should land |
| `FERGUS_API_KEY` | Your Fergus Personal Access Token (`fergPAT_…`) |
| `RATE_LIMIT_PER_HOUR` | Leave at `5` unless you want to tune anti-spam |
| `SUBMISSION_LOG_PATH` | Leave at the default — points at the mounted volume |

Make sure the file isn't world-readable:

```bash
chmod 600 .env
```

---

## 4. Build + launch

```bash
docker compose up -d --build
```

That:
- Builds the Docker image (~3 minutes the first time, seconds on rebuilds thanks to cached layers).
- Starts the container in the background.
- Restarts it automatically if it crashes (`restart: unless-stopped`).
- Persists submission logs to a named Docker volume (`submissions`).

Check it's healthy:

```bash
docker compose ps                                 # STATUS should show "healthy"
docker compose logs -f --tail=50                  # Tail logs
curl -sf http://127.0.0.1:3000/api/health         # → {"status":"ok",...}
curl -sf http://127.0.0.1:3000/ | head -5         # → starts with <!DOCTYPE html>
```

---

## 5. Front it with a reverse proxy

Pick one — Caddy is the easiest (auto-TLS, no extra config); Nginx is the most familiar; Traefik fits if you're already running it.

### Caddy (recommended)

Install Caddy on the host, then `/etc/caddy/Caddyfile`:

```caddy
goodallelectrical.com.au, www.goodallelectrical.com.au {
    reverse_proxy 127.0.0.1:3000
    encode gzip zstd
}
```

```bash
sudo systemctl reload caddy
```

That's it — Caddy fetches and renews the Let's Encrypt cert for you.

### Nginx

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name goodallelectrical.com.au www.goodallelectrical.com.au;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name goodallelectrical.com.au www.goodallelectrical.com.au;

    ssl_certificate     /etc/letsencrypt/live/goodallelectrical.com.au/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/goodallelectrical.com.au/privkey.pem;

    location / {
        proxy_pass         http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header   Host              $host;
        proxy_set_header   X-Real-IP         $remote_addr;
        proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_read_timeout 60s;
    }
}
```

Use `certbot --nginx` to provision the cert, then reload Nginx.

> The site reads `X-Forwarded-For` to rate-limit by real client IP. Both Caddy and Nginx above set it correctly.

---

## 6. Verify the live site

From anywhere on the internet:

```bash
curl -I https://goodallelectrical.com.au/             # 200, with HSTS if you've added it
curl -I https://goodallelectrical.com.au/sitemap.xml  # 200, XML
curl -sI https://goodallelectrical.com.au/quote       # 301 → /contact#quote-form
```

Open `/contact` in a browser, submit the form, and confirm it lands in your Fergus inbox.

---

## 7. Deploy updates

When you push new code:

```bash
cd /opt/goodall-website
git pull
cd website
docker compose up -d --build      # rebuild + replace the container
```

Docker layer caching means rebuilds usually take <30 seconds when code changes but `package-lock.json` hasn't.

For a zero-downtime deploy, run two containers behind the proxy and swap them; for a small business site, the 1-2 second blip during `up -d --build` is fine.

---

## 8. Logs, monitoring, backups

**Application logs** — captured by Docker, capped at 50MB by the compose file:

```bash
docker compose logs -f goodall-website
```

**Submission log** — the canonical JSONL record of every form submission:

```bash
docker compose exec goodall-website cat /var/log/goodall/submissions.jsonl
```

**Backup** — back up the `submissions` volume and your `.env` file. The code is in git.

```bash
docker run --rm \
  -v goodall-website_submissions:/data \
  -v "$(pwd)":/backup \
  alpine tar czf /backup/submissions-$(date +%F).tar.gz -C /data .
```

---

## 9. Useful commands

| Goal | Command |
|---|---|
| Stop the site | `docker compose down` |
| Start it again | `docker compose up -d` |
| Restart only (no rebuild) | `docker compose restart` |
| Tail logs | `docker compose logs -f` |
| Smoke-test locally | `./scripts/docker-smoke.sh` |
| Shell inside the container | `docker compose exec goodall-website sh` |
| Force a fresh build | `docker compose build --no-cache` |
| See image size | `docker images goodall-website` |

---

## 10. Local development against the same Docker image

If you want to test the production image on your laptop before deploying:

```bash
cd website
cp .env.example .env       # fill in test values (or use your prod .env)
docker compose up --build  # foreground; Ctrl+C to stop
```

Then hit http://localhost:3000 — same code that runs in production.

For day-to-day editing keep using `npm run dev` (faster, has hot reload). Use the Docker path for pre-deploy verification only.

---

## 11. Rollback

If a deploy breaks something:

```bash
git log --oneline -10        # find the last good commit
git checkout <good-sha>
docker compose up -d --build
```

Or keep the previous image tagged:

```bash
docker tag goodall-website:latest goodall-website:previous-$(date +%Y%m%d-%H%M)
# then on next deploy, you can `docker compose down` and run the old tag manually
```
