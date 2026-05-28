# Copier ce fichier et renseigner les valeurs sensibles
# Usage : tofu apply -var-file=staging.tfvars

environment = "staging"
region      = "fr-par"
domain      = "staging.roadmaps-faciles.fr"
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
