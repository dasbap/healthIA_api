# API de reconnaissance d'image

## Code reutilise

La reconnaissance d'image provient du code existant importe depuis la branche `mb_2` :

- `services/ai-service/app/recommender/meal_image_analyzer.py`
- `services/ai-service/app/recommender/vision_model_analyzer.py`
- `services/ai-service/scripts/download_vision_model.py`

## Endpoint

```text
POST /ai/meal/analyze
```

Entrees acceptees :

- JSON avec `imageUrl` ou `image_url` ;
- `multipart/form-data` avec un champ `file` pour envoyer une vraie image depuis le frontend.

Contraintes du fichier upload :

- formats acceptes : JPEG, PNG, WebP ;
- taille maximale : 8 Mo ;
- validation par Pillow avant analyse ;
- lecture en memoire uniquement, sans sauvegarde disque ;
- champ `userId` optionnel, `profile_demo_001` par defaut.

## Fonctionnement reel

Si `VISION_ENABLED=true` et que les dependances de `requirements-vision.txt` sont installees, l'API charge un modele Hugging Face compatible `transformers` au premier appel.

Le modele par defaut est :

```text
nateraw/food
```

Il peut etre remplace avec `VISION_MODEL_NAME`.

Si un modele local est installe dans `services/ai-service/app/models/meal_image_analyzer` ou via `AI_SERVICE_VISION_MODEL_PATH`, l'API tente ce modele local avant le nom Hugging Face configure.

Le modele est charge en cache au premier appel afin d'eviter un rechargement a chaque requete.

Le flux fichier appelle le meme analyseur vision que le flux URL, mais avec les bytes de l'image recue. Si le modele, Torch ou Transformers sont absents, le service revient au fallback backend explicite.

La reponse conserve le contrat frontend existant (`detectedFoods`, `nutrition`, `fallbackUsed`) et ajoute aussi des champs utiles pour la soutenance : `estimatedCalories`, `macros` et `warnings`.

## Fallback

Si le modele, les dependances ou l'image ne sont pas disponibles, l'API renvoie un fallback deterministe avec :

```json
{
  "fallbackUsed": true,
  "model": "healthai-vision-fallback-v1"
}
```

Ce fallback est volontairement explicite. Il permet une demonstration stable, mais ne doit pas etre presente comme une detection IA reelle.

## Configuration Docker

Par defaut, Docker n'installe pas Torch/Transformers pour garder un demarrage local rapide :

```env
AI_SERVICE_INSTALL_VISION=false
```

Pour activer le modele local dans l'image :

```env
AI_SERVICE_INSTALL_VISION=true
AI_SERVICE_VISION_MODEL_ID=nateraw/food
VISION_ENABLED=true
VISION_MODEL_NAME=nateraw/food
VISION_DEVICE=cpu
```

## Dependances

`requirements.txt` contient l'API de base :

- `python-multipart` : obligatoire pour recevoir `multipart/form-data` avec FastAPI ;
- `pillow` : obligatoire ici car l'API valide les images uploadees meme en fallback ;
- `httpx` et `pytest` : necessaires aux tests API.

`requirements-vision.txt` contient uniquement la vraie reconnaissance image locale :

- `torch` ;
- `transformers`.

`torchvision` n'est pas ajoute car le chemin actuel utilise `AutoImageProcessor`, `PIL.Image`, `torch` et `AutoModelForImageClassification`. `pillow` n'est pas duplique dans `requirements-vision.txt` car il est deja requis dans `requirements.txt` pour valider les uploads meme en fallback.

Ces dependances vision restent optionnelles et ne sont pas installees par defaut.

Installation manuelle :

```bash
cd services/ai-service
pip install -r requirements.txt
pip install -r requirements-vision.txt
```

## Healthcheck vision

`GET /health` expose notamment :

```json
{
  "vision": {
    "uploadSupported": true,
    "urlSupported": true,
    "modelName": "nateraw/food",
    "modelAvailable": true,
    "modelLoaded": true,
    "enabled": true,
    "pillow": true,
    "torch": true,
    "transformers": true,
    "fallbackAvailable": true
  }
}
```

Si le modele n'est pas charge ou si les dependances lourdes sont absentes, `enabled=false`, `modelAvailable=false` et le fallback reste disponible.

## Mapping nutritionnel

La reconnaissance image identifie une classe alimentaire. Les calories et macros viennent ensuite d'un mapping approximatif :

- `spaghetti` / `pasta` : 520 kcal, 18 g proteines, 80 g glucides, 14 g lipides ;
- `salad` : 280 kcal, 8 g proteines, 18 g glucides, 14 g lipides ;
- `chicken` : 430 kcal, 45 g proteines, 20 g glucides, 15 g lipides ;
- `pizza` : 700 kcal, 28 g proteines, 85 g glucides, 28 g lipides.

La reconnaissance alimentaire et l'estimation calorique sont deux etapes differentes. Le modele reconnait une classe ; les calories restent une approximation pedagogique.

## Limites

- L'analyse par fichier multipart reconnait le format image, mais utilise un fallback si le modele local n'est pas disponible.
- Les calories et macros restent des estimations.
- Le modele depend de ses classes disponibles, de la qualite de l'image et du cadrage du repas.
- Une confiance faible doit etre presentee comme une estimation prudente, pas comme un diagnostic nutritionnel.
