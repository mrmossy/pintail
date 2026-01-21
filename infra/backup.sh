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
# Calculate cutoff date in seconds
CUTOFF_DATE=$(date -d "-$RETENTION_DAYS days" +%s)

# Clean up n8n backups
aws s3 ls $S3_BUCKET/n8n/ | grep '\.tar\.gz$' | while read -r line; do
    file_date=$(echo $line | awk '{print $1 " " $2}')
    file_name=$(echo $line | awk '{print $4}')
    if [[ $(date -d "$file_date" +%s) -lt $CUTOFF_DATE ]]; then
        aws s3 rm "$S3_BUCKET/n8n/$file_name"
    fi
done

# Clean up Budibase backups
aws s3 ls $S3_BUCKET/budibase/ | grep '\.tar\.gz$' | while read -r line; do
    file_date=$(echo $line | awk '{print $1 " " $2}')
    file_name=$(echo $line | awk '{print $4}')
    if [[ $(date -d "$file_date" +%s) -lt $CUTOFF_DATE ]]; then
        aws s3 rm "$S3_BUCKET/budibase/$file_name"
    fi
done

echo "Backup complete: $DATE"

