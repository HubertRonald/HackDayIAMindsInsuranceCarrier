variable "project_id" {
  description = "ID del proyecto de GCP"
  type        = string
}

variable "image_name" {
  description = "Imagen del contenedor para Cloud Run"
  type        = string
  default     = "hackday-gemini-backend"
}

variable "image_tag" {
  description = "Imagen del contenedor para Cloud Run"
  type        = string
  default     = "latest"
}

variable "region" {
  description = "Región para despliegue"
  type        = string
  default     = "us-central1"
}

variable "credentials_file" {
  description = "Ruta al archivo JSON de cuenta de servicio"
  type        = string
}

variable "service_name" {
  description = "Nombre del servicio Cloud Run"
  type        = string
  default     = "hackday-gemini-backend"
}
