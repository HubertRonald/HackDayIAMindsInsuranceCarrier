# ---------- OUTPUTS ----------
output "cloud_run_url" {
  value = google_cloud_run_service.backend.status[0].url
}

output "artifact_registry_repo" {
  value = google_artifact_registry_repository.hackday_repo.repository_id
}

output "firebase_app_id" {
  value = google_firebase_web_app.frontend.app_id
}
