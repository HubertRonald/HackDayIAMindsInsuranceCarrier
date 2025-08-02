import csv
import os
import sys
from pathlib import Path
from utils.paths import data_path
from google.api_core.exceptions import NotFound
from google.cloud import bigquery, firestore

# Agregar backend/app al path para importar db.py
ROOT_DIR = Path(__file__).resolve().parent.parent
sys.path.append(str(ROOT_DIR / "backend" / "app"))

from db import save_interaction_firestore, save_to_bigquery

# Variables de entorno requeridas
PROJECT_ID = os.getenv("GCP_PROJECT_ID")
DATASET_ID = os.getenv("BIGQUERY_DATASET", "hackday_data")
TABLE_ID = os.getenv("BIGQUERY_TABLE", "gemini_interactions")
COLLECTION_NAME = "gemini_interactions"

bq_client = bigquery.Client(project=PROJECT_ID)
db = firestore.Client(project=PROJECT_ID)

def check_bigquery():
    """Verifica si dataset y tabla existen en BigQuery"""
    try:
        dataset_ref = bq_client.dataset(DATASET_ID)
        bq_client.get_dataset(dataset_ref)
        table_ref = dataset_ref.table(TABLE_ID)
        bq_client.get_table(table_ref)
        print("✅ BigQuery dataset y tabla encontrados.")
        return True
    except NotFound:
        print("❌ Dataset o tabla de BigQuery no encontrados. Ejecuta Terraform primero.")
        return False

def check_firestore():
    """Verifica acceso a Firestore y la colección de interacciones"""
    try:
        _ = list(db.collection(COLLECTION_NAME).limit(1).stream())
        print("✅ Firestore accesible y colección encontrada.")
        return True
    except Exception as e:
        print(f"❌ Firestore no accesible: {e}")
        return False

def load_data():
    """Carga los datos del CSV en Firestore y BigQuery"""
    csv_file = data_path("gemini_interactions_dummy.csv")

    if not csv_file.exists():
        print(f"❌ El archivo {csv_file} no existe. Genera los datos primero con generate_dummy_data.py")
        sys.exit(1)

    with csv_file.open(mode='r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        count = 0
        for row in reader:
            save_interaction_firestore(
                row["user_input"], row["response"], row["file_name"],
                row["producto"], row["etapa"]
            )
            save_to_bigquery(
                row["user_input"], row["response"], row["file_name"],
                row["producto"], row["etapa"]
            )
            count += 1
    print(f"✅ Se cargaron {count} registros de '{csv_file.name}' en Firestore y BigQuery.")

if __name__ == "__main__":
    print("🔎 Validando servicios en GCP...")
    if check_bigquery() and check_firestore():
        load_data()
    else:
        print("⚠️ No se cargaron datos porque uno o más servicios no están disponibles.")
