output "caddy_ip" {
  value       = scaleway_instance_ip.caddy.address
  description = "IP publique du VPS Caddy - pointer le DNS ici"
}

output "web_url" {
  value       = scaleway_container.web.domain_name
  description = "URL du container web (interne Scaleway)"
}

output "db_endpoint" {
  value       = "${scaleway_rdb_instance.db.endpoint_ip}:${scaleway_rdb_instance.db.endpoint_port}"
  description = "Endpoint PostgreSQL"
}

output "s3_bucket_url" {
  value       = "https://${scaleway_object_bucket.storage.name}.s3.${var.region}.scw.cloud"
  description = "URL publique du bucket S3"
}

output "registry_endpoint" {
  value       = scaleway_registry_namespace.registry.endpoint
  description = "Endpoint du registry pour push les images"
}
