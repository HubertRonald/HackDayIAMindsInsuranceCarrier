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
    G["App en Producción"]
    A --> B --> C --> D --> E --> F --> G
```

## ✅ Métricas sugeridas para Looker Studio
- Interacciones por producto
- Etapas más consultadas
- Conversión de consultas a compra
- Tiempo medio de asistencia
