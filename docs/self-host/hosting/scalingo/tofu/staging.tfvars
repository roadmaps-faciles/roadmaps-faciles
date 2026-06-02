# Copier ce fichier et renseigner les valeurs
# Usage : tofu apply -var-file=staging.tfvars

environment = "staging"
region      = "osc-fr1"
domain      = "example.com"

# Container sizing
web_container_size  = "M"
web_container_count = 1

# Addon plans
web_db_plan    = "postgresql-starter-512"
web_redis_plan = "redis-starter-256"

# SCM
# Mettre a true uniquement si vous liez un repo GitHub/GitLab a l'app
# (review apps). Necessite scm_auth_integration_uuid (cf. README).
enable_scm_link = false
# scm_auth_integration_uuid = "..."  # via `scalingo integrations`

# S3 (Scaleway Object Storage)
# s3_public_url pointe vers l'instance + /api/uploads : l'URL S3 directe
# n'est jamais exposee au client (route /api/uploads + CSP img-src 'self').
s3_endpoint   = "https://s3.fr-par.scw.cloud"
s3_region     = "fr-par"
s3_bucket     = "roadmaps-faciles-staging"
s3_public_url = "https://example.com/api/uploads"
# s3_access_key = "..."  # via TF_VAR_s3_access_key
# s3_secret_key = "..."  # via TF_VAR_s3_secret_key

# Email
smtp_host       = "smtp-relay.brevo.com"
smtp_port       = "587"
smtp_ssl        = "true"
smtp_login      = ""
smtp_from_email = "noreply@example.com"
# smtp_password = "..."  # via TF_VAR_smtp_password

# Secrets app (obligatoires, a passer via TF_VAR_ ; jamais en clair dans ce fichier) :
#   export TF_VAR_auth_secret=$(openssl rand -base64 32)
#   export TF_VAR_integration_encryption_key=$(openssl rand -base64 32)
#   export TF_VAR_jwt_secret=$(openssl rand -base64 32)
#   export TF_VAR_webhook_secret=$(openssl rand -base64 32)

# DNS provider (optionnel)
# dns_env = {
#   DNS_PROVIDER             = "ovh"
#   DNS_OVH_ENDPOINT         = "ovh-eu"
#   DNS_OVH_APPLICATION_KEY  = "xxx"
#   DNS_OVH_APPLICATION_SECRET = "xxx"
#   DNS_OVH_CONSUMER_KEY     = "xxx"
# }

# Observabilite (optionnel)
# observability_env = {
#   NEXT_PUBLIC_SENTRY_DSN = "https://xxx@sentry.io/xxx"
#   SENTRY_DSN             = "https://xxx@sentry.io/xxx"
# }

# Tracking (optionnel)
# tracking_env = {
#   TRACKING_PROVIDER = "posthog"
#   POSTHOG_KEY       = "phc_xxx"
# }

# OAuth (optionnel)
# oauth_env = {
#   OAUTH_GITHUB_CLIENT_ID     = "xxx"
#   OAUTH_GITHUB_CLIENT_SECRET = "xxx"
# }
