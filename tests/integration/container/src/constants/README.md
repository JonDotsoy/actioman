# Instrucciones para la carpeta `constants`

Esta carpeta está destinada a almacenar rutas y variables estáticas utilizadas en los tests de integración.

- **Archivos con el sufijo `local_path.ts`**: Deben contener únicamente rutas estáticas que hacen referencia a archivos o directorios en el sistema de archivos local (host).
- **Archivos con el sufijo `container_path.ts`**: Deben contener únicamente rutas estáticas que hacen referencia a archivos o directorios dentro del contenedor (container).

> **Importante:** Esta especificación debe respetarse siempre que se cree una nueva variable constante que represente una ruta del sistema. El sufijo del archivo debe indicar claramente si la ruta es local o del contenedor.

## Documentación de variables

### image_name.ts

Contiene la constante `IMAGE_NAME`, que almacena el nombre de la imagen Docker utilizada en los tests de integración. Ejemplo:

```ts
export const IMAGE_NAME = "oven/bun:latest";
```

Utiliza esta constante para referenciar la imagen Docker en los scripts y pruebas, asegurando consistencia y facilidad de mantenimiento.

Mantén este criterio para asegurar la claridad y consistencia en la gestión de rutas y variables dentro de los tests de integración.
