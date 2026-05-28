# --- Projet ---

variable "project_name" {
  type    = string
  default = "roadmaps-faciles"
}

variable "environment" {
  type    = string
  default = "staging"
  validation {
    condition     = contains(["staging", "prod"], var.environment)
    error_message = "environment must be 'staging' or 'prod'"
  }
}

variable "region" {
  type    = string
  default = "osc-fr1"
  description = "Region Scalingo (osc-fr1 = Strasbourg)"
}

variable "domain" {
  type        = string
  default     = ""
  description = "Domaine principal (ex: roadmaps-faciles.fr). Vide = pas de domaine custom."
}

# --- Container sizing ---

variable "web_container_size" {
  type    = string
  default = "M"
  description = "Taille des containers web (S, M, L, XL, 2XL)"
}

variable "web_container_count" {
  type    = number
  default = 1
}

# --- Addon plans ---

variable "web_db_plan" {
  type    = string
  default = "postgresql-starter-512"
  description = "Plan PostgreSQL pour l'app web"
}

variable "web_redis_plan" {
  type    = string
  default = "redis-starter-256"
  description = "Plan Redis pour l'app web"
}

# --- SCM ---

variable "enable_scm_link" {
  type    = bool
  default = true
  description = "Lier le repo GitHub a l'app Scalingo (review apps, etc.)"
}

variable "scm_auth_integration_uuid" {
  type        = string
  default     = ""
  description = "UUID de l'intégration SCM Scalingo (github, gitlab). Récupérer via 'scalingo integrations'."
}

# --- S3 (stockage externe) ---

variable "s3_endpoint" {
  type    = string
  default = ""
}

variable "s3_region" {
  type    = string
  default = "fr-par"
}

variable "s3_bucket" {
  type    = string
  default = ""
  description = "Nom du bucket S3. Vide = storage desactive (noop)."
}

variable "s3_public_url" {
  type    = string
  default = ""
}

variable "s3_access_key" {
  type      = string
  sensitive = true
  default   = ""
}

variable "s3_secret_key" {
  type      = string
  sensitive = true
  default   = ""
}

# --- Email ---

variable "smtp_host" {
  type    = string
  default = ""
}

variable "smtp_port" {
  type    = string
  default = "587"
}

variable "smtp_ssl" {
  type    = string
  default = "true"
}

variable "smtp_login" {
  type    = string
  default = ""
}

variable "smtp_password" {
  type      = string
  sensitive = true
  default   = ""
}

# --- Secrets web ---

variable "jwt_secret" {
  type      = string
  sensitive = true
}

variable "webhook_secret" {
  type      = string
  sensitive = true
}

# --- Blocs optionnels (merge dans environment) ---

variable "dns_env" {
  type        = map(string)
  default     = {}
  description = "Variables DNS provider (DNS_PROVIDER, DNS_OVH_*, DNS_CLOUDFLARE_*)"
}

variable "observability_env" {
  type        = map(string)
  default     = {}
  description = "Variables observabilite (SENTRY_DSN, LOG_LEVEL, etc.)"
}

variable "tracking_env" {
  type        = map(string)
  default     = {}
  description = "Variables tracking (NEXT_PUBLIC_TRACKING_PROVIDER, POSTHOG_*, etc.)"
}

variable "oauth_env" {
  type        = map(string)
  default     = {}
  description = "Variables OAuth (OAUTH_GITHUB_*, OAUTH_GOOGLE_*, etc.)"
}
