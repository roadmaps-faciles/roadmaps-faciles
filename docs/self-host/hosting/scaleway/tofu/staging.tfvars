# Copier ce fichier et renseigner les valeurs sensibles
# Usage : tofu apply -var-file=staging.tfvars

environment = "staging"
region      = "fr-par"
domain      = "example.com"
manage_dns  = false
image_tag   = "latest"

# Database
db_node_type      = "DB-DEV-S"
db_volume_size_gb = 10
# db_password = "..."   # passer via TF_VAR_db_password ou -var

# Compute
web_min_scale = 1
web_max_scale = 2
web_memory_mb = 1024
web_cpu_m     = 1000

# Redis (Upstash free tier par exemple)
# redis_url = "rediss://..."

# Email (SMTP) - non-secrets
smtp_host       = "smtp.tem.scw.cloud"
smtp_port       = "587"
smtp_login      = ""
smtp_from_email = "Roadmaps <noreply@example.com>"
# smtp_password = "..."   # passer via TF_VAR_smtp_password

# Secrets app (jamais ici) - passer via TF_VAR_ :
#   TF_VAR_auth_secret                : openssl rand -base64 32
#   TF_VAR_jwt_secret                 : openssl rand -base64 32
#   TF_VAR_webhook_secret             : openssl rand -base64 32
#   TF_VAR_integration_encryption_key : openssl rand -base64 32
#   TF_VAR_scw_access_key / TF_VAR_scw_secret_key
