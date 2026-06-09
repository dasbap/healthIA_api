# Gestion des erreurs API IA

## Format general

FastAPI renvoie des erreurs lisibles sous la cle `detail`.

Exemple :

```json
{
  "detail": "Recommandation introuvable."
}
```

Pour les erreurs de validation Pydantic, `detail` contient la liste des champs invalides.

## Erreurs gerees

| Cas | Code | Comportement |
| --- | --- | --- |
| Payload JSON invalide | 400 | Message `Payload JSON invalide.` |
| Champ obligatoire manquant | 422 | Detail de validation |
| URL image invalide | 422 | Detail de validation |
| Image absente | 422 ou 400 | Message source image manquante |
| Fichier absent en multipart | 400 | Message explicite |
| Format image non supporte | 400 ou 422 | Message explicite |
| Recommandation introuvable | 404 | `Recommandation introuvable.` |
| Service vision indisponible | 200 avec `fallbackUsed=true` | Fallback documente |
| MongoDB indisponible | 200 avec stockage memoire | Demo stable |

## Impact frontend

Le frontend garde un fallback mock :

- `VITE_USE_MOCKS=true` : mode demo force ;
- `VITE_USE_MOCKS=false` : tentative API reelle ;
- si l'API echoue, les mocks sont affiches et un bandeau indique que l'API IA est indisponible.

Ce comportement permet une demonstration stable sans pretendre que les mocks sont une IA reelle.
