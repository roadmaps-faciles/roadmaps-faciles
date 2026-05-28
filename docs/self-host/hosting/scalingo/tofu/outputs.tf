output "web_url" {
  value       = "https://${scalingo_app.web.name}.${var.region}.scalingo.io"
  description = "URL de l'app web (domaine Scalingo)"
}

output "web_app_id" {
  value       = scalingo_app.web.id
  description = "ID de l'app web (pour DOMAIN_SCALINGO_APP_ID)"
}

output "custom_domain" {
  value       = var.domain != "" ? "https://${var.domain}" : "(pas de domaine custom)"
  description = "URL publique avec domaine custom"
}
