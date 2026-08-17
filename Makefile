# ==============================
# Variables
# ==============================
TERRAFORM_DIR=terraform
DATA_DIR=data
BACKEND_DIR=backend
FRONTEND_DIR=frontend
REGION=us-central1
SERVICE_NAME=hackday-gemini-backend
PYTHON=python3

export GCP_PROJECT_ID ?= $(shell echo $$GCP_PROJECT_ID)
BRANCH := $(shell git rev-parse --abbrev-ref HEAD)

# ==============================
# Terraform
# ==============================
deploy-infra:
	cd $(TERRAFORM_DIR) && terraform init && terraform apply -auto-approve \
		-var="project_id=$(GCP_PROJECT_ID)"

destroy-infra:
	cd $(TERRAFORM_DIR) && terraform destroy -auto-approve \
		-var="project_id=$(GCP_PROJECT_ID)"
	@echo "⚠️ Infraestructura eliminada correctamente."

validate-infra:
	@if ! bq show --format=prettyjson "$(GCP_PROJECT_ID):hackday_data" >/dev/null 2>&1; then \
		echo "❌ Dataset BigQuery no encontrado. Ejecuta 'make deploy-infra' primero."; exit 1; \
	fi
	@if ! gcloud firestore databases describe --project="$(GCP_PROJECT_ID)" --database="(default)" >/dev/null 2>&1; then \
		echo "❌ Firestore no encontrado. La base '(default)' debe existir previamente en el proyecto."; exit 1; \
	fi
	@echo "✅ BigQuery y la precondición externa de Firestore están disponibles."

# ==============================
# Datos Dummy
# ==============================
generate-dummy:
	$(PYTHON) $(DATA_DIR)/generate_dummy_data.py

load-dummy:
	$(PYTHON) $(DATA_DIR)/load_dummy_data.py

populate-data: generate-dummy load-dummy
	@echo "✅ Datos dummy generados y cargados correctamente."

setup-data: deploy-infra populate-data
	@echo "✅ Infraestructura desplegada y datos dummy cargados correctamente."

# ==============================
# Despliegue Backend / Frontend
# ==============================
deploy-backend:
	gcloud auth configure-docker $(REGION)-docker.pkg.dev --quiet
	gcloud builds submit $(BACKEND_DIR) \
		--tag $(REGION)-docker.pkg.dev/$(GCP_PROJECT_ID)/hackday-repo/$(SERVICE_NAME):latest \
		--ignore-file .gcloudignore
	gcloud run deploy $(SERVICE_NAME) \
		--image $(REGION)-docker.pkg.dev/$(GCP_PROJECT_ID)/hackday-repo/$(SERVICE_NAME):latest \
		--region $(REGION) \
		--platform managed \
		--allow-unauthenticated

deploy-frontend:
	cd $(FRONTEND_DIR) && \
	echo "REACT_APP_API_URL=$$(gcloud run services describe $(SERVICE_NAME) \
	    --region $(REGION) \
	    --format='value(status.url)')" > .env && \
	npm install && npm run build && \
	firebase deploy --only hosting

deploy-app: deploy-backend deploy-frontend
	@echo "🚀 Aplicación desplegada correctamente en GCP."

# ==============================
# GitHub Actions
# ==============================
deploy-actions:
	gh workflow run deploy-app.yml -r $(BRANCH)
	@echo "🚀 Workflow 'deploy-app.yml' disparado en GitHub Actions."

populate-actions:
	gh workflow run populate-data.yml -r $(BRANCH)
	@echo "📦 Workflow 'populate-data.yml' disparado en GitHub Actions."

destroy-actions:
	gh workflow run destroy-infra.yml -r $(BRANCH)
	@echo "🗑️ Workflow 'destroy-infra.yml' disparado en GitHub Actions."

# ==============================
# Ejecutar backend en Docker (local)
# ==============================

# Usar imagen ya construida en Artifact Registry
run-local-docker:
	docker run --rm -it \
		-p 8080:8080 \
		--env-file .env \
		-v $(PWD)/backend/credenciales.json:/app/credenciales.json:ro \
		$(REGION)-docker.pkg.dev/$(GCP_PROJECT_ID)/hackday-repo/hackday-gemini-backend:latest

# Construir imagen local y ejecutar (sin subir a Artifact Registry)
run-local-docker-build:
	docker build -t hackday-gemini-backend-local ./backend
	docker run --rm -it \
		-p 8080:8080 \
		--env-file .env \
		-v $(PWD)/backend/credenciales.json:/app/credenciales.json:ro \
		hackday-gemini-backend-local


# ==============================
# Ayuda
# ==============================
help:
	@echo "Comandos disponibles:"
	@echo "  make deploy-infra       		- Despliega infraestructura con Terraform"
	@echo "  make destroy-infra      		- Destruye infraestructura"
	@echo "  make validate-infra     		- Valida que BigQuery y Firestore estén disponibles"
	@echo "  make generate-dummy     		- Genera CSV con datos dummy (local)"
	@echo "  make load-dummy         		- Carga datos dummy a GCP (local)"
	@echo "  make populate-data      		- Genera y carga datos dummy (local)"
	@echo "  make setup-data         		- Despliega infra y carga datos dummy (local)"
	@echo "  make deploy-backend     		- Despliega backend a Cloud Run"
	@echo "  make deploy-frontend    		- Despliega frontend a Firebase Hosting (inyecta URL real de Cloud Run)"
	@echo "  make deploy-app         		- Despliega backend + frontend"
	@echo "  make deploy-actions     		- Dispara workflow de despliegue en GitHub Actions"
	@echo "  make populate-actions   		- Dispara workflow de carga de datos dummy en GitHub Actions"
	@echo "  make destroy-actions    		- Dispara workflow para destruir infraestructura y app en GCP"
	@echo "  make run-local-docker   		- Para correr con la imagen ya desplegada en GCP (Artifact Registry)"
	@echo "  make run-local-docker-build    - Para probar cambios locales sin subirlos"
