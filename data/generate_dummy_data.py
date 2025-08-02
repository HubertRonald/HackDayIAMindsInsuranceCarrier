
import csv
import random
import datetime
from utils.paths import data_path

# Fijar semilla para reproducibilidad
random.seed(0)

# Directorio del script actual
output_file = data_path("gemini_interactions_dummy.csv")

# Opciones para los campos
productos = ["Seguro de Auto", "Seguro de Vida", "Seguro de Salud", "Seguro de Hogar"]
etapas = ["Cotización", "Formulario", "Confirmación", "Pago", "Finalizado"]

# Crear datos dummies
dummy_data = []
for i in range(100):
    user_input = f"Consulta del cliente {i+1}"
    response = f"Respuesta generada por Gemini para la consulta {i+1}"
    file_name = f"screenshot_{i+1}.jpg"
    producto = random.choice(productos)
    etapa = random.choice(etapas)
    timestamp = (datetime.datetime.now() - datetime.timedelta(
        days=random.randint(0, 30),
        hours=random.randint(0, 23),
        minutes=random.randint(0, 59)
    )).strftime("%Y-%m-%dT%H:%M:%S")

    dummy_data.append([user_input, response, file_name, producto, etapa, timestamp])

# Guardar el CSV dentro de /data
with open(output_file, mode='w', newline='', encoding='utf-8') as file:
    writer = csv.writer(file)
    writer.writerow(["user_input", "response", "file_name", "producto", "etapa", "timestamp"])
    writer.writerows(dummy_data)

print(f"✅ Archivo '{output_file}' generado con {len(dummy_data)} registros.")
