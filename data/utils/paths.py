from pathlib import Path

# Ruta raíz del proyecto (2 niveles arriba desde utils/)
ROOT_DIR = Path(__file__).resolve().parent.parent

def data_path(filename: str) -> Path:
    """
    Retorna la ruta absoluta de un archivo dentro de la carpeta data/.
    """
    return ROOT_DIR / filename
