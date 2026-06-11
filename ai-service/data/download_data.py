import os

OUTPUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "raw/nutrition")
ROBOFLOW_API_KEY_ENV = "ROBOFLOW_API_KEY"

def download_dataset():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    # Aller dans le dossier de destination avant de télécharger
    original_dir = os.getcwd()
    os.chdir(OUTPUT_DIR)
    
    print(f"Téléchargement dans : {OUTPUT_DIR}")
    
    try:
        from roboflow import Roboflow
        api_key = os.getenv(ROBOFLOW_API_KEY_ENV)
        if not api_key:
            raise RuntimeError(f"Variable d'environnement {ROBOFLOW_API_KEY_ENV} manquante.")
        rf = Roboflow(api_key=api_key)
        project = rf.workspace("juan-workspace").project("food-types-po0yz")
        version = project.version(3)
        version.download("folder")
        print("Dataset prêt dans data/raw/nutrition/")
        
    except Exception as e:
        print(f"Erreur : {e}")
    finally:
        os.chdir(original_dir)

if __name__ == "__main__":
    download_dataset()
