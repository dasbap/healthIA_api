"""
Script de téléchargement du dataset Food Types v3 (Roboflow)
Exécuter une seule fois : python data/download_data.py
"""

import urllib.request
import zipfile
import os

DATASET_URL = "https://universe.roboflow.com/ds/OmPTSxQFVu?key=uAZcal35rz"
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "raw/nutrition")

def download_dataset():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    zip_path = os.path.join(OUTPUT_DIR, "food_types.zip")
    
    print("Téléchargement du dataset Food Types v3...")
    urllib.request.urlretrieve(DATASET_URL, zip_path)
    
    print("Extraction...")
    with zipfile.ZipFile(zip_path, 'r') as z:
        z.extractall(OUTPUT_DIR)
    
    os.remove(zip_path)
    print("Dataset prêt dans data/raw/nutrition/")

if __name__ == "__main__":
    download_dataset()