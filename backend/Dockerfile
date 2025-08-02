# Imagen base de Python
FROM python:3.11-slim

# Establecer directorio de trabajo
WORKDIR /app

# Evitar mensajes interactivos durante la instalación
ENV DEBIAN_FRONTEND=noninteractive

# Copiar requirements y instalar dependencias
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar el código de la app
COPY app/ ./app

# ----------------------------
# Variables de entorno
# ----------------------------
# Se usará la identidad de la cuenta de servicio de Cloud Run
ENV GOOGLE_CLOUD_PROJECT=${GOOGLE_CLOUD_PROJECT}
# Ajustar puerto (Cloud Run lo pasa vía $PORT)
ENV PORT=8080

# Exponer el puerto usado por uvicorn
EXPOSE 8080

# Comando de inicio
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]
