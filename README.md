[![GCP](https://img.shields.io/badge/-Google%20Cloud%20Platform-4285F4?style=flat-square&logo=google%20cloud&logoColor=white)](https://cloud.google.com)
[![Python](https://img.shields.io/badge/python-3670A0?style=flat-square&logo=python&logoColor=ffdd54)](https://peps.python.org/pep-0596/#schedule-first-bugfix-release)
[![ReactJS](https://img.shields.io/badge/-ReactJs-61DAFB?style=flat-square&logo=react&logoColor=white&style=for-the-badge)](https://react.dev/)
[![Gemini](https://img.shields.io/badge/Google_AI-Gemini-4285F4?style=flat-square&logo=google)](https://ai.google.dev/gemini-api/docs)
[![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=flat-square&logo=docker&logoColor=white)](https://hub.docker.com/r/amazon/aws-lambda-python)
[![NodeJS](https://img.shields.io/badge/node.js-339933?style=flat-square&logo=Node.js&logoColor=white)](https://nodejs.org/)
[![Json](https://img.shields.io/badge/json-5E5C5C?style=flat-square&logo=json&logoColor=white)](gender_movie_classification/events/event.json)
[![Hoppscotch](https://img.shields.io/badge/Hoppscotch-31C48D?style=flat-square&logo=hoppscotch&logoColor=white)](https://hoppscotch.io/)
![GitHub last commit](https://img.shields.io/github/last-commit/HubertRonald/HackDayIAMindsInsuranceCarrier?style=flat-square)
![GitHub commit activity](https://img.shields.io/github/commit-activity/t/HubertRonald/HackDayIAMindsInsuranceCarrier?style=flat-square&color=dodgerblue)


# HackDay Gemini Assistant

## 🚀 Descripción

Este proyecto implementa un **asistente multimodal** (voz + análisis visual) para un caso de uso de seguros, con backend en **Cloud Run** y frontend en **Firebase Hosting**.

Permite:

- **Detección de UI y flujo de compra**.
- **Asesoría contextual** por texto y voz.
- **Simulación dinámica de cotizaciones**.
- **Interacción gráfica en tiempo real** (tooltips, resaltar campos) mediante WebSockets.

---

## 📂 Estructura del Proyecto

```
📦 HackDayIAMindsInsuranceCarrier
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── db.py
│   │   └── __init__.py
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── index.js
│   │   └── components/
│   ├── public/
│   │   ├── index.html
│   │   ├── favicon.ico
│   │   ├── manifest.json
│   │   └── robots.txt
│   ├── package.json
│   └── .env.example
│
├── terraform/
│   ├── main.tf
│   ├── variables.tf
│   ├── outputs.tf
│   ├── gcp-key.json        # ⚠️ No subir a GitHub
│   └── README.md
│
├── data/
│   ├── generate_dummy_data.py
│   ├── load_dummy_data.py
│   ├── gemini_interactions_dummy.csv
│   └── utils/
│       └── paths.py
│
├── .github/
│   └── workflows/
│       ├── deploy-infra.yml
│       ├── deploy-app.yml
│       ├── destroy-infra.yml
│       └── populate-data.yml
│
├── .env                    # ⚠️ No subir a GitHub
├── Makefile
├── README.md
└── .gitignore
```

---

## ⚙️ Configuración Local

### 1️⃣ Clonar el repositorio

```bash
git clone https://github.com/<usuario>/<repo>.git
cd HackDayIAMindsInsuranceCarrier
```

### 2️⃣ Backend (local)

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8080
```

### 3️⃣ Frontend (local)

```bash
cd frontend
cp .env.example .env
npm install
npm start
```

El frontend usará la variable `REACT_APP_API_URL` definida en `.env` (`http://localhost:8080` para desarrollo).

---

## 🔑 Variables de Entorno

| Variable          | Descripción                                        |
| ----------------- | -------------------------------------------------- |
| GOOGLE\_API\_KEY  | API Key de Gemini                                  |
| GCP\_PROJECT\_ID  | ID del proyecto en GCP                             |
| BIGQUERY\_DATASET | Dataset BigQuery (por defecto `hackday_data`)      |
| BIGQUERY\_TABLE   | Tabla BigQuery (por defecto `gemini_interactions`) |

---

## ☁️ Despliegue con GitHub Actions

1. Configura **Secrets** en tu repositorio (`Settings → Secrets and variables → Actions`):

| Secret           | Valor Ejemplo                      |
| ---------------- | ---------------------------------- |
| `GCP_PROJECT_ID` | `hackday-project-1234`             |
| `GCP_SA_KEY`     | Contenido JSON del Service Account |
| `FIREBASE_TOKEN` | Token de autenticación de Firebase |

2. Los workflows se disparan automáticamente al hacer **push a main** o se pueden ejecutar manualmente.

---

## 🏗️ Comandos `make ...-actions`

| **Comando**           | **Workflow llamado**                  | **Acción en GCP**                                                      |
| --------------------- | ------------------------------------- | ---------------------------------------------------------------------- |
| make deploy-actions   | `.github/workflows/deploy-infra.yml`  | 🚀 Despliega infraestructura (Terraform) y app (Cloud Run + Firebase). |
| make populate-actions | `.github/workflows/populate-data.yml` | 📦 Pobla BigQuery y Firestore con datos dummy.                         |
| make destroy-actions  | `.github/workflows/destroy-infra.yml` | 🗑️ Elimina infraestructura, servicio Cloud Run y Firebase Hosting.    |

---

## 🔄 Flujo CI/CD

```mermaid
%%{init: {"flowchart": {"htmlLabels": false}} }%%
flowchart LR
    A[Push a main/dev] --> B[Deploy Infra & App Workflow]
    B --> C[Terraform: Crea infraestructura BigQuery, Firestore, Artifact Registry, Cloud Run, Firebase]
    C --> D[Build & Deploy Backend en Cloud Run]
    D --> E[Build Frontend e inyección URL Backend]
    E --> F[Deploy Frontend en Firebase Hosting]
    F --> G[Populate Data Workflow opcional]
```

---

## 📊 Datos Dummy y Métricas

Ejecuta:

```bash
make populate-data
```

Esto genera `gemini_interactions_dummy.csv` con 100 registros y los carga a **BigQuery** y **Firestore**, listos para visualizar en **Looker Studio**:

- Distribución de productos consultados.
- Etapas más frecuentes.
- Conversiones a compra finalizada (%).
- Tendencias de interacciones en el tiempo.
- Matriz Producto vs Etapa (heatmap).

---

## 🔮 Futuras Mejoras

- Soporte para **streaming de audio** en tiempo real.
- Integración con sistemas de cotización reales.
- Optimización de prompts y caching de respuestas.
- Autenticación y control de sesiones de usuario.


--
## Autores
---
* **Hubert Ronald** - *Trabajo Inicial* - [HubertRonald / HackDayIAMindsInsuranceCarrier](https://github.com/HubertRonald/HackDayIAMindsInsuranceCarrier)

Ve también la lista de [contribuyentes](https://github.com/HubertRonald/HackDayIAMindsInsuranceCarrier/contributors) que participaron en este proyecto.


## Licencia
---
Este proyecto está bajo licencia MIT - ver la [LICENCIA](LICENSE) archivo (en inglés) con más detalles


---

👨‍💻 **HackDay 2025 IA Minds - Eremia**
