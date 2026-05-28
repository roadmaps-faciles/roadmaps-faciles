output "web_url" {
  value       = "https://${scalingo_app.web.name}.${var.region}.scalingo.io"
  description = "URL de l'app web (domaine Scalingo)"
}

output "web_app_id" {
  value       = scalingo_app.web.id
  description = "ID de l'app web (pour DOMAIN_SCALINGO_APP_ID)"
}

output "licensing_url" {
  value       = "https://${scalingo_app.licensing.name}.${var.region}.scalingo.io"
  description = "URL du serveur de licences (domaine Scalingo)"
}

output "licensing_app_id" {
  value       = scalingo_app.licensing.id
  description = "ID de l'app licensing"
}

output "custom_domain" {
  value       = var.domain != "" ? "https://${var.domain}" : "(pas de domaine custom)"
  description = "URL publique avec domaine custom"
}
