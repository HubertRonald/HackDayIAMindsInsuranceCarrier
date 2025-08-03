terraform {
  required_version = ">= 1.3.0"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = ">= 5.0.0"
    }
    google-beta = {
      source  = "hashicorp/google-beta"
      version = ">= 5.0.0"
    }
  }

  backend "local" {
    path = "terraform.tfstate"
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

provider "google-beta" {
  project = var.project_id
  region  = var.region
}


# ---------- ARTIFACT REGISTRY ----------
resource "google_artifact_registry_repository" "hackday_repo" {
  location      = var.region
  repository_id = "hackday-repo"
  format        = "DOCKER"
  description   = "Repositorio de imágenes para HackDay Gemini Assistant"
}

# ---------- BIGQUERY DATASET ----------
resource "google_bigquery_dataset" "hackday_dataset" {
  dataset_id                  = "hackday_data"
  location                    = "US"
  delete_contents_on_destroy  = true
}

# ---------- BIGQUERY TABLE ----------
resource "google_bigquery_table" "gemini_interactions" {
  dataset_id          = google_bigquery_dataset.hackday_dataset.dataset_id
  table_id            = "gemini_interactions"
  deletion_protection = false

  schema = jsonencode([
    { name = "user_input", type = "STRING" },
    { name = "response", type = "STRING" },
    { name = "file_name", type = "STRING" },
    { name = "producto", type = "STRING" },
    { name = "etapa", type = "STRING" },
    { name = "timestamp", type = "TIMESTAMP" }
  ])
}

# ---------- SERVICE ACCOUNT ----------
resource "google_service_account" "cloud_run_sa" {
  account_id   = "hackday-cloudrun-sa"
  display_name = "Service Account for Cloud Run Backend"
}

# ---------- PERMISOS FIRESTORE ----------
resource "google_project_iam_member" "firestore_access" {
  project = var.project_id
  role    = "roles/datastore.user"
  member  = "serviceAccount:${google_service_account.cloud_run_sa.email}"
}

# ---------- PERMISOS BIGQUERY ----------
resource "google_project_iam_member" "bigquery_access" {
  project = var.project_id
  role    = "roles/bigquery.dataEditor"
  member  = "serviceAccount:${google_service_account.cloud_run_sa.email}"
}

# ---------- CLOUD RUN SERVICE ----------
resource "google_cloud_run_service" "backend" {
  name     = var.service_name
  location = var.region

  template {
    spec {
      containers {
        image = "${var.region}-docker.pkg.dev/${var.project_id}/hackday-repo/${var.image_name}:${var.image_tag}"
        ports {
          container_port = 8080
        }
        resources {
          limits = {
            cpu    = "1"
            memory = "512Mi"
          }
        }
      }
      service_account_name = google_service_account.cloud_run_sa.email
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }
}

resource "google_cloud_run_service_iam_member" "invoker" {
  location = google_cloud_run_service.backend.location
  service  = google_cloud_run_service.backend.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# ---------- FIREBASE WEB APP ----------
resource "google_firebase_web_app" "frontend" {
  provider     = google-beta
  display_name = "HackDay Gemini Assistant Web App"
  project      = var.project_id
}
