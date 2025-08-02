import os
from google.cloud import firestore
from google.cloud import bigquery
from google.api_core.exceptions import NotFound

# Inicializa clientes
project_id = os.getenv("GCP_PROJECT_ID")
dataset_id = os.getenv("BIGQUERY_DATASET", "hackday_data")
table_id = os.getenv("BIGQUERY_TABLE", "gemini_interactions")

db = firestore.Client(project=project_id)
bq_client = bigquery.Client(project=project_id)

def save_interaction_firestore(user_input, response, file_name=None, producto=None, etapa=None):
    """
    Guarda una interacción en Firestore.
    """
    doc_ref = db.collection("gemini_interactions").add({
        "user_input": user_input,
        "response": response,
        "file_name": file_name,
        "producto": producto,
        "etapa": etapa,
        "timestamp": firestore.SERVER_TIMESTAMP
    })
    return doc_ref

def ensure_bigquery_table():
    """
    Crea dataset y tabla en BigQuery si no existen.
    """
    dataset_ref = bq_client.dataset(dataset_id)
    try:
        bq_client.get_dataset(dataset_ref)
    except NotFound:
        bq_client.create_dataset(dataset_ref)

    table_ref = dataset_ref.table(table_id)
    try:
        bq_client.get_table(table_ref)
    except NotFound:
        schema = [
            bigquery.SchemaField("user_input", "STRING"),
            bigquery.SchemaField("response", "STRING"),
            bigquery.SchemaField("file_name", "STRING"),
            bigquery.SchemaField("producto", "STRING"),
            bigquery.SchemaField("etapa", "STRING"),
            bigquery.SchemaField("timestamp", "TIMESTAMP"),
        ]
        table = bigquery.Table(table_ref, schema=schema)
        bq_client.create_table(table)

def save_to_bigquery(user_input, response, file_name=None, producto=None, etapa=None):
    """
    Inserta una fila en BigQuery para análisis posterior.
    """
    ensure_bigquery_table()

    rows_to_insert = [{
        "user_input": user_input,
        "response": response,
        "file_name": file_name,
        "producto": producto,
        "etapa": etapa,
        "timestamp": None
    }]
    table_ref = f"{project_id}.{dataset_id}.{table_id}"
    bq_client.insert_rows_json(table_ref, rows_to_insert)