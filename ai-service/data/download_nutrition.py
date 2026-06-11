import os
import kaggle

OUTPUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "raw/nutrition")

def download_dataset():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    print("Téléchargement du dataset nutritionnel...")
    kaggle.api.authenticate()
    kaggle.api.dataset_download_files(
        "niharika41298/nutrition-details-for-most-common-foods",
        path=OUTPUT_DIR,
        unzip=True
    )
    print("Dataset prêt dans data/raw/nutrition/")

if __name__ == "__main__":
    download_dataset()