from fastapi import FastAPI, UploadFile, File, Form, WebSocket
from fastapi.responses import JSONResponse
import google.generativeai as genai
import os

from app.db import save_interaction_firestore, save_to_bigquery

app = FastAPI()

# Configurar Gemini
API_KEY = os.getenv("GOOGLE_API_KEY")
genai.configure(api_key=API_KEY)

@app.get("/")
def root():
    return {"message": "Backend funcionando correctamente"}

@app.post("/analyze")
async def analyze(input_text: str = Form(...), file: UploadFile = File(None)):
    """
    Análisis multimodal: recibe texto + screenshot, detecta producto y etapa del flujo.
    Guarda resultados en Firestore y BigQuery.
    """
    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        inputs = []
        if input_text:
            inputs.append(input_text)

        file_name = None
        if file:
            file_name = file.filename
            content = await file.read()
            inputs.append({"mime_type": file.content_type, "data": content})

        prompt = """
        A partir del texto del usuario y la captura de pantalla adjunta:
        - Identifica el producto de seguro de interés (auto, vida, salud, hogar, etc.)
        - Determina la etapa del proceso de compra (cotización, formulario, confirmación, pago, finalizado)
        Responde en formato JSON:
        {"producto": "...", "etapa": "..."}
        """

        response = model.generate_content([prompt] + inputs)

        # Intentar parsear JSON (respuesta del modelo)
        producto = None
        etapa = None
        try:
            import json
            data = json.loads(response.text)
            producto = data.get("producto")
            etapa = data.get("etapa")
        except:
            # Si no es JSON válido, dejamos campos nulos
            pass

        # Guardar en Firestore y BigQuery
        save_interaction_firestore(input_text, response.text, file_name, producto, etapa)
        save_to_bigquery(input_text, response.text, file_name, producto, etapa)

        return JSONResponse(content={
            "producto": producto,
            "etapa": etapa,
            "raw_response": response.text
        })
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)

@app.post("/simulate")
async def simulate(tipo_seguro: str = Form(...), monto: float = Form(...), plazo: int = Form(...)):
    """
    Simula una cotización básica en base a variables del cliente.
    """
    try:
        # Ejemplo de cálculo (puedes reemplazar con lógica real o Gemini)
        tasa = 0.05 if tipo_seguro.lower() == "auto" else 0.07
        precio = monto * tasa * plazo

        response = {
            "tipo_seguro": tipo_seguro,
            "monto": monto,
            "plazo": plazo,
            "cotizacion_estimativa": round(precio, 2)
        }

        save_interaction_firestore(f"Simulación {tipo_seguro}", str(response))
        save_to_bigquery(f"Simulación {tipo_seguro}", str(response))

        return JSONResponse(content=response)
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)

@app.websocket("/ws/assist")
async def websocket_endpoint(websocket: WebSocket):
    """
    WebSocket para enviar instrucciones gráficas a la UI.
    Ejemplo:
    {"action": "highlight", "selector": "#input-monto", "message": "Ingresa el monto asegurado aquí."}
    """
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            # En una implementación real, podrías interpretar data para generar ayuda contextual
            # Aquí simulamos una respuesta fija
            await websocket.send_json({
                "action": "highlight",
                "selector": "#input-monto",
                "message": "Ingresa el monto asegurado aquí."
            })
    except Exception:
        await websocket.close()