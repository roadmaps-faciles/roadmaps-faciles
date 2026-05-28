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
  default = "fr-par"
}

variable "domain" {
  type        = string
  description = "Domaine principal (ex: roadmaps-faciles.fr)"
}

variable "manage_dns" {
  type        = bool
  default     = false
  description = "true si le domaine est gere par Scaleway DNS"
}

variable "image_tag" {
  type    = string
  default = "latest"
}

# --- Database ---

variable "db_node_type" {
  type    = string
  default = "DB-DEV-S"
}

variable "db_volume_size_gb" {
  type    = number
  default = 10
}

variable "db_password" {
  type      = string
  sensitive = true
}

# --- Compute ---

variable "web_min_scale" {
  type    = number
  default = 1
}

variable "web_max_scale" {
  type    = number
  default = 3
}

variable "web_memory_mb" {
  type    = number
  default = 1024
}

variable "web_cpu_m" {
  type    = number
  default = 1000
  description = "CPU limit in millicores"
}

# --- Redis ---

variable "redis_url" {
  type        = string
  description = "URL Redis (Upstash, auto-heberge, etc.)"
}

# --- Secrets ---

variable "jwt_secret" {
  type      = string
  sensitive = true
}

variable "webhook_secret" {
  type      = string
  sensitive = true
}

variable "scw_access_key" {
  type      = string
  sensitive = true
}

variable "scw_secret_key" {
  type      = string
  sensitive = true
}

variable "smtp_password" {
  type      = string
  sensitive = true
  default   = ""
}
