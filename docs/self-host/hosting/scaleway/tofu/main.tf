terraform {
  required_providers {
    scaleway = {
      source  = "scaleway/scaleway"
      version = "~> 2.0"
    }
  }
}

provider "scaleway" {
  region = var.region
  zone   = "${var.region}-1"
}

# --- Object Storage (S3) ---

resource "scaleway_object_bucket" "storage" {
  name   = "${var.project_name}-${var.environment}"
  region = var.region

  lifecycle_rule {
    enabled = true
    abort_incomplete_multipart_upload_days = 1
  }
}

resource "scaleway_object_bucket_policy" "public_read" {
  bucket = scaleway_object_bucket.storage.id
  region = var.region

  policy = jsonencode({
    Version = "2023-04-17"
    Statement = [{
      Effect    = "Allow"
      Principal = "*"
      Action    = ["s3:GetObject"]
      Resource  = ["${scaleway_object_bucket.storage.name}/*"]
    }]
  })
}

# --- PostgreSQL (Managed Database) ---

resource "scaleway_rdb_instance" "db" {
  name           = "${var.project_name}-${var.environment}"
  engine         = "PostgreSQL-18"
  node_type      = var.db_node_type
  is_ha_cluster  = var.environment == "prod"
  volume_type    = "bssd"
  volume_size_in_gb = var.db_volume_size_gb

  settings = {
    work_mem       = "16"  # MB
    max_connections = "100"
  }
}

resource "scaleway_rdb_database" "web" {
  instance_id = scaleway_rdb_instance.db.id
  name        = "roadmaps-faciles"
}

resource "scaleway_rdb_user" "app" {
  instance_id = scaleway_rdb_instance.db.id
  name        = "roadmaps"
  password    = var.db_password
}

resource "scaleway_rdb_privilege" "web" {
  instance_id   = scaleway_rdb_instance.db.id
  user_name     = scaleway_rdb_user.app.name
  database_name = scaleway_rdb_database.web.name
  permission    = "all"
}

# --- Container Registry ---

resource "scaleway_registry_namespace" "registry" {
  name   = var.project_name
  region = var.region
}

# --- Serverless Containers ---

resource "scaleway_container_namespace" "app" {
  name   = "${var.project_name}-${var.environment}"
  region = var.region
}

resource "scaleway_container" "web" {
  namespace_id = scaleway_container_namespace.app.id
  name         = "web"
  registry_image = "${scaleway_registry_namespace.registry.endpoint}/web:${var.image_tag}"
  port         = 3000
  min_scale    = var.web_min_scale
  max_scale    = var.web_max_scale
  memory_limit = var.web_memory_mb
  cpu_limit    = var.web_cpu_m

  environment_variables = {
    APP_ENV                      = var.environment
    AUTH_TRUST_HOST               = "1"
    DOMAIN_PROVIDER               = "caddy"
    STORAGE_PROVIDER              = "s3"
    STORAGE_S3_ENDPOINT           = "https://s3.${var.region}.scw.cloud"
    STORAGE_S3_REGION             = var.region
    STORAGE_S3_BUCKET             = scaleway_object_bucket.storage.name
    # L'URL S3 directe n'est jamais exposee au client : la route /api/uploads
    # stream depuis le bucket pour rester en img-src 'self' du CSP.
    STORAGE_S3_PUBLIC_URL         = "https://${var.domain}/api/uploads"
    SITE_URL          = "https://${var.domain}"
    REPOSITORY_URL    = "https://github.com/roadmaps-faciles/roadmaps-faciles"
    REDIS_URL                     = var.redis_url
    MAILER_SMTP_HOST              = var.smtp_host
    MAILER_SMTP_PORT              = var.smtp_port
    MAILER_SMTP_LOGIN             = var.smtp_login
    MAILER_FROM_EMAIL             = var.smtp_from_email
  }

  secret_environment_variables = {
    DATABASE_URL                  = "postgresql://${scaleway_rdb_user.app.name}:${var.db_password}@${scaleway_rdb_instance.db.endpoint_ip}:${scaleway_rdb_instance.db.endpoint_port}/${scaleway_rdb_database.web.name}?sslmode=require"
    AUTH_SECRET                   = var.auth_secret
    SECURITY_JWT_SECRET           = var.jwt_secret
    SECURITY_WEBHOOK_SECRET       = var.webhook_secret
    INTEGRATION_ENCRYPTION_KEY    = var.integration_encryption_key
    STORAGE_S3_ACCESS_KEY_ID      = var.scw_access_key
    STORAGE_S3_SECRET_ACCESS_KEY  = var.scw_secret_key
    MAILER_SMTP_PASSWORD          = var.smtp_password
  }
}

# --- Caddy (VPS + cloud-init) ---
# Serverless Containers ne permettent pas de bind le port 443.
# Caddy tourne sur un petit VPS devant les containers.

resource "scaleway_instance_ip" "caddy" {}

resource "scaleway_instance_server" "caddy" {
  name  = "${var.project_name}-caddy-${var.environment}"
  type  = "DEV1-S"
  image = "ubuntu_noble"
  ip_id = scaleway_instance_ip.caddy.id

  user_data = {
    cloud-init = templatefile("${path.module}/cloud-init-caddy.yml", {
      web_upstream = trimprefix(scaleway_container.web.domain_name, "https://")
      domain       = var.domain
      ask_url      = "https://${trimprefix(scaleway_container.web.domain_name, "https://")}/api/domains/check"
    })
  }
}

# --- DNS (optionnel, si domaine chez Scaleway) ---

resource "scaleway_domain_record" "root" {
  count    = var.manage_dns ? 1 : 0
  dns_zone = var.domain
  name     = ""
  type     = "A"
  data     = scaleway_instance_ip.caddy.address
  ttl      = 300
}

resource "scaleway_domain_record" "wildcard" {
  count    = var.manage_dns ? 1 : 0
  dns_zone = var.domain
  name     = "*"
  type     = "A"
  data     = scaleway_instance_ip.caddy.address
  ttl      = 300
}

