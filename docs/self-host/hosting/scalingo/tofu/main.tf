terraform {
  required_providers {
    scalingo = {
      source  = "Scalingo/scalingo"
      version = "~> 2.7"
    }
  }
}

provider "scalingo" {
  region = var.region
}

# --- App web (Next.js) ---

resource "scalingo_app" "web" {
  name = "${var.project_name}-${var.environment}"

  environment = merge({
    APP_ENV                    = var.environment
    AUTH_TRUST_HOST            = "1"
    AUTH_URL                   = "https://${var.domain}/api/auth"
    SITE_URL       = "https://${var.domain}"
    REPOSITORY_URL = "https://github.com/roadmaps-faciles/roadmaps-faciles"
    NEXT_PUBLIC_APP_ENV        = var.environment
    PLATFORM_DOMAIN            = "scalingo.io"

    # Domaines custom via API Scalingo
    DOMAIN_PROVIDER            = "scalingo"
    DOMAIN_SCALINGO_API_URL    = "https://api.${var.region}.scalingo.com"

    # Stockage S3 (externe)
    STORAGE_PROVIDER           = var.s3_bucket != "" ? "s3" : "noop"
    STORAGE_S3_ENDPOINT        = var.s3_endpoint
    STORAGE_S3_REGION          = var.s3_region
    STORAGE_S3_BUCKET          = var.s3_bucket
    STORAGE_S3_PUBLIC_URL      = var.s3_public_url

    # Email
    MAILER_SMTP_HOST           = var.smtp_host
    MAILER_SMTP_PORT           = var.smtp_port
    MAILER_SMTP_SSL            = var.smtp_ssl
    MAILER_SMTP_LOGIN          = var.smtp_login
    MAILER_FROM_EMAIL          = var.smtp_from_email
  },
    # Secrets (sensitive - Scalingo les masque dans l'UI)
    {
      AUTH_SECRET                  = var.auth_secret
      INTEGRATION_ENCRYPTION_KEY   = var.integration_encryption_key
      SECURITY_JWT_SECRET          = var.jwt_secret
      SECURITY_WEBHOOK_SECRET      = var.webhook_secret
      STORAGE_S3_ACCESS_KEY_ID     = var.s3_access_key
      STORAGE_S3_SECRET_ACCESS_KEY = var.s3_secret_key
      MAILER_SMTP_PASSWORD         = var.smtp_password
    },
    # DNS provider (optionnel)
    var.dns_env,
    # Observabilite (optionnel)
    var.observability_env,
    # Tracking (optionnel)
    var.tracking_env,
    # OAuth (optionnel)
    var.oauth_env,
  )
}

# --- Addons web ---

resource "scalingo_addon" "web_postgresql" {
  app         = scalingo_app.web.id
  provider_id = "postgresql"
  plan        = var.web_db_plan
}

resource "scalingo_addon" "web_redis" {
  app         = scalingo_app.web.id
  provider_id = "redis"
  plan        = var.web_redis_plan
}

# --- Domaine custom web ---

resource "scalingo_domain" "web_root" {
  count       = var.domain != "" ? 1 : 0
  app         = scalingo_app.web.id
  common_name = var.domain
}

resource "scalingo_domain" "web_www" {
  count       = var.domain != "" ? 1 : 0
  app         = scalingo_app.web.id
  common_name = "www.${var.domain}"
}

# --- Container sizing web ---

resource "scalingo_container_type" "web" {
  app    = scalingo_app.web.id
  name   = "web"
  size   = var.web_container_size
  amount = var.web_container_count
}

# --- SCM integration (GitHub → Scalingo) ---

resource "scalingo_scm_repo_link" "web" {
  count = var.enable_scm_link ? 1 : 0
  app   = scalingo_app.web.id

  source                = "https://github.com/roadmaps-faciles/roadmaps-faciles"
  branch                = var.environment == "prod" ? "main" : "dev"
  auth_integration_uuid = var.scm_auth_integration_uuid
  auto_deploy_enabled   = false # Deploy via GitHub Actions, pas auto-deploy

  deploy_review_apps_enabled = var.environment == "staging"
  delete_on_close_enabled    = true
  delete_stale_enabled       = true
  hours_before_delete_stale  = 72
}

