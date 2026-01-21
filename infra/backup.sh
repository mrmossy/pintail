#!/bin/bash

# Configuration
BACKUP_DIR="/home/ubuntu/pintail/runtime/backups"
S3_BUCKET="s3://pintail-backups-077471612709"
DATE=$(date +%Y-%m-%d_%H-%M-%S)
RETENTION_DAYS=7

# Load environment variables
source /home/ubuntu/pintail/infra/.env

echo "Starting backup: $DATE"

# Create backup directory
mkdir -p $BACKUP_DIR

# ===================
# n8n Data Export
# ===================
echo "Backing up n8n data..."
docker run --rm \
    -v n8n-data:/data \
    -v $BACKUP_DIR:/backup \
    alpine tar czf /backup/n8n-data_$DATE.tar.gz -C /data .

# ===================
# Budibase Data Export
# ===================
echo "Backing up Budibase data..."
docker run --rm \
    -v budibase-data:/data \
    -v $BACKUP_DIR:/backup \
    alpine tar czf /backup/budibase-data_$DATE.tar.gz -C /data .

# ===================
# Upload to S3
# ===================
echo "Uploading to S3..."
aws s3 cp $BACKUP_DIR/n8n-data_$DATE.tar.gz $S3_BUCKET/n8n/
aws s3 cp $BACKUP_DIR/budibase-data_$DATE.tar.gz $S3_BUCKET/budibase/

# ===================
# Clean Up Local Backups
# ===================
echo "Cleaning up old local backups..."
find $BACKUP_DIR -type f -mtime +$RETENTION_DAYS -delete

# ===================
# 7. Clean Up Old S3 Backups
# ===================
echo "Cleaning up old S3 backups..."
# List and delete files older than retention period
aws s3 ls $S3_BUCKET/ | while read -r line; do
    file_date=$(echo $line | awk '{print $1}')
    file_name=$(echo $line | awk '{print $4}')
    if [[ $(date -d "$file_date" +%s) -lt $(date -d "-$RETENTION_DAYS days" +%s) ]]; then
        aws s3 rm "$S3_BUCKET/$file_name"
    fi
done

echo "Backup complete: $DATE"

