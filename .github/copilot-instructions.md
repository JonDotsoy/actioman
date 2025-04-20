# Reglas para los Commits

Este repositorio sigue las reglas de [Conventional Commits](https://www.conventionalcommits.org/es/v1.0.0/).

Utiliza el siguiente formato para tus mensajes de commit:

```
<tipo>[ámbito opcional]: <descripción>

[cuerpo opcional]

[nota(s) al pie opcional(es)]
```

## Tipos permitidos
- feat: Una nueva característica
- fix: Corrección de un error
- docs: Cambios en la documentación
- style: Cambios que no afectan el significado del código (espacios en blanco, formato, puntos y comas, etc.)
- refactor: Cambios en el código que no corrigen errores ni agregan funcionalidades
- perf: Cambios que mejoran el rendimiento
- test: Agregar o corregir pruebas
- build: Cambios que afectan el sistema de construcción o dependencias externas
- ci: Cambios en los archivos y scripts de CI
- chore: Otros cambios que no modifican src ni archivos de prueba
- revert: Revertir un commit anterior

## Ámbito

El ámbito debe corresponder al nombre de la carpeta modificada dentro de `./src/<ámbito>`. Por ejemplo, si modificas archivos en `./src/cli/`, el mensaje de commit debe ser:

```
<tipo>(cli): <descripción>
```

## Ejemplo

```
feat(cli): agregar opción --verbose al comando run

Permite a los usuarios ver más detalles durante la ejecución.

BREAKING CHANGE: la opción --debug ha sido reemplazada por --verbose
```

- Usa el modo imperativo en la descripción ("agregar" en vez de "agregado" o "agrega").
- Limita la descripción a 72 caracteres.
- Si el commit introduce un cambio importante, añade una nota al pie con `BREAKING CHANGE:`.
- Si el commit cierra un issue, referencia el número en el cuerpo o nota al pie.
