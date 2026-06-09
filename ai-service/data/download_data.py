import os

OUTPUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "raw/nutrition")

def download_dataset():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    # Aller dans le dossier de destination avant de télécharger
    original_dir = os.getcwd()
    os.chdir(OUTPUT_DIR)
    
    print(f"Téléchargement dans : {OUTPUT_DIR}")
    
    try:
        from roboflow import Roboflow
        rf = Roboflow(api_key="0SGNDkoU0qibztM89kqi")
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