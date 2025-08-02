# Infraestructura HackDay Gemini Assistant

Este módulo Terraform crea:
- Artifact Registry
- Cloud Run (backend)
- Firebase Hosting (frontend)

## Despliegue manual

```bash
cd terraform
terraform init
terraform apply -auto-approve -var="project_id=MI_PROYECTO" -var="credentials_file=../gcp-key.json"
```

## Destrucción

```bash
terraform destroy -auto-approve
```

## Despliegue automático (CI/CD)
GitHub Actions ejecuta automáticamente:
1. Terraform para infraestructura.
2. Construcción de imagen y despliegue en Cloud Run.
3. Deploy frontend a Firebase Hosting.


## 🚀 Flujo de Despliegue Automático (GitHub Actions)

```mermaid
flowchart TD
    A["Push a main / releases/**"] --> B["⚙️ deploy-infra.yml<br/>Terraform: BigQuery, Firestore, Artifact Registry, Firebase App"]
    B --> C["🚀 deploy-app.yml<br/>Build & Deploy Backend (Cloud Run)<br/>Build & Deploy Frontend (Firebase Hosting)"]
    B --> D["📦 populate-data.yml<br/>Generación y carga de datos dummy<br/>BigQuery + Firestore"]

    subgraph GCP ["Google Cloud Platform"]
      B
      C
      D
    end

    style A fill:#1e3a8a,stroke:#fff,color:#fff
    style B fill:#059669,stroke:#fff,color:#fff
    style C fill:#2563eb,stroke:#fff,color:#fff
    style D fill:#9333ea,stroke:#fff,color:#fff
```

📌 Tabla de Comandos make ...-actions y su efecto en GCP
| **Comando Make**           | **Workflow llamado**          | **Acción ejecutada en GCP (remotamente)**                                                                 | **Cuándo usarlo**                                                                 |
|----------------------------|------------------------------|-----------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------|
| `make deploy-actions`      | `.github/workflows/deploy-infra.yml` | 🚀 Crea/actualiza la infraestructura con Terraform + despliega **backend (Cloud Run)** + **frontend (Firebase Hosting)** usando la rama actual. | Cuando quieres desplegar tu aplicación y la infraestructura en la nube sin correr nada localmente. Ideal para pruebas o despliegue manual. |
| `make populate-actions`    | `.github/workflows/populate-data.yml` | 📦 Genera datos dummy y los carga en **BigQuery** y **Firestore** (requiere infraestructura ya desplegada). | Después de un despliegue para poblar datos de prueba sin correr scripts locales.   |
| `make destroy-actions`     | `.github/workflows/destroy-infra.yml` | 🗑️ Elimina la infraestructura de GCP (Terraform destroy) + borra servicio de **Cloud Run** + elimina hosting en Firebase. | Cuando deseas eliminar toda la infraestructura y despliegues desde la nube sin usar tu terminal local. |


📌 Diagrama de Flujo (Mermaid)

```mermaid
flowchart TD
    A[💻 Developer ejecuta 'make deploy-actions'] -->|1️⃣ Llama API de GitHub| B[GitHub Actions Workflow: deploy-infra.yml]
    B -->|2️⃣ Terraform Apply| C[GCP Infraestructura: Artifact Registry, BigQuery, Firestore]
    B -->|3️⃣ Build & Deploy Backend| D[Cloud Run Service]
    B -->|4️⃣ Build & Deploy Frontend| E[Firebase Hosting]
    E -->|App disponible| F[🌐 URL Pública en Firebase Hosting]

```