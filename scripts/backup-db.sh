#!/bin/bash
# backup-db.sh — dump PostgreSQL vers /var/backups/oyez/
# À planifier via cron (voir README ci-dessous)
#
# Crontab recommandé (crontab -e sur le VPS) :
#   0 3 * * * /root/backup-db.sh >> /var/log/oyez-backup.log 2>&1
#
# Ceci crée un fichier par jour (3 jours de rétention glissante).

set -euo pipefail

DB_NAME="${DB_NAME:-annuaire_artisans}"
DB_USER="${DB_USER:-postgres}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/oyez}"
RETENTION_DAYS=3

mkdir -p "$BACKUP_DIR"

FILENAME="oyez_$(date +%Y%m%d_%H%M%S).sql.gz"
FILEPATH="$BACKUP_DIR/$FILENAME"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Démarrage du backup → $FILEPATH"

# Dump compressé via le conteneur Docker Coolify
# Adapter le nom du conteneur si besoin : `docker ps` pour le trouver
docker exec -t "$(docker ps --filter name=postgres --format '{{.Names}}' | head -1)" \
  pg_dump -U "$DB_USER" -d "$DB_NAME" | gzip > "$FILEPATH"

SIZE=$(du -sh "$FILEPATH" | cut -f1)
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Backup OK — $SIZE — $FILEPATH"

# Nettoyage des backups > RETENTION_DAYS jours
find "$BACKUP_DIR" -name "oyez_*.sql.gz" -mtime +"$RETENTION_DAYS" -delete
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Anciens backups nettoyés (>${RETENTION_DAYS}j)"
