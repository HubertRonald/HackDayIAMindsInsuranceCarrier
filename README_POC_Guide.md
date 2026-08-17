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


# HackDay Gemini Prototype

## 🎯 Objetivos
- Asesoría en tiempo real
- Simulación de compra
- Experiencia interactiva
- Análisis multimodal (voz + UI)

## 📌 Arquitectura
- **Frontend:** React (Firebase Hosting)
- **Backend:** FastAPI (Cloud Run Serverless)
- **Datos:** Firestore + BigQuery
- **Interacción:** WebSockets para baja latencia

```mermaid
flowchart LR
    A["VS Code DevContainer"]
    B["Desarrollo local"]
    C["Push a GitHub"]
    D["GitHub Actions"]
    E["Deploy Cloud Run Backend"]
    F["Deploy Firebase Hosting"]
    G["App desplegada (estado histórico por verificar)"]
    A --> B --> C --> D --> E --> F --> G
```

## ✅ Métricas sugeridas para Looker Studio
- Interacciones por producto
- Etapas más consultadas
- Conversión de consultas a compra
- Tiempo medio de asistencia
