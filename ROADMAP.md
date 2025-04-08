## Objetivo de este documento

Este documento sirve como una declaración pública de las mejoras que se realizarán en nuestro proyecto. Describe los hitos clave, objetivos y cronogramas para el desarrollo y entrega de estas mejoras.

## Hoja de ruta

La siguiente hoja de ruta proporciona una visión general de las características planificadas, sus fechas de lanzamiento esperadas y el estado actual:

### 🚧 Activo

| Característica | Fecha de Lanzamiento Esperada |
| -------------- | ----------------------------- |

### ⏳ Planificado

| Característica | Estado | Fecha de Finalización Esperada |
| -------------- | ------ | ------------------------------ |

## Propuestas

La siguiente propuesta describe una característica potencial y su cronograma esperado:

### Propuesta: Mejora de la Documentación

La iniciativa de mejora de la documentación tiene como objetivo mejorar significativamente la experiencia del desarrollador y la adopción de Actioman al proporcionar documentación completa, bien estructurada y características de tipado sólido.

1. Definiciones de tipos para `actionman.json.ts`

   - Añadir definiciones de tipos para habilitar soporte de tipado fuerte en IDEs.
   - Implementar validación con `zod` para garantizar la seguridad de tipos en tiempo de ejecución y la corrección de la configuración.
   - Exportar tipos para autocompletado en IDEs y mejorar la productividad del desarrollador.
   - Proveer errores de validación claros cuando la configuración sea incorrecta.
   - Incluir comentarios JSDoc para una mejor documentación en línea.

2. Guía para la creación de Hooks/Plugins
   - Documentación detallada sobre el ciclo de vida de los hooks y el flujo de ejecución.
   - Tutorial paso a paso para crear plugins personalizados.
   - Referencia completa de la API para el sistema de plugins.
   - Ejemplos prácticos que cubren casos de uso comunes:
     - Registro de solicitudes/respuestas.
     - Middleware de autenticación.
     - Configuración de CORS.
     - Manejo de errores.
     - Validación de solicitudes.
     - Monitoreo de rendimiento.

### Propuesta: Mejoras en la Experiencia del Desarrollador

Esta iniciativa se centra en mejorar el flujo de trabajo de desarrollo y la experiencia de depuración para hacer que Actioman sea más amigable y eficiente para los desarrolladores.

1. Manejo Mejorado de Errores en la CLI

   - Implementar mensajes de error contextuales que expliquen tanto el problema como su causa.
   - Proveer sugerencias de solución para escenarios de error comunes.
   - Incluir enlaces a documentación relacionada en los mensajes de error.
   - Añadir trazas de pila en modo de depuración para facilitar la resolución de problemas.
   - Implementar códigos de error para referencia fácil y búsqueda en la documentación.
   - Salida en consola con colores para una mejor visibilidad de los errores.

2. Implementación del Modo `watch`
   - Funcionalidad de recarga en vivo que detecta cambios en los archivos del proyecto.
   - Compilación incremental inteligente para minimizar el tiempo de reconstrucción.
   - Soporte para entornos de ejecución Bun y Node.js.
   - Patrones de observación configurables y reglas de exclusión.
   - Observación de archivos eficiente en memoria con reconstrucciones optimizadas.
   - Integración con herramientas de IDE para una experiencia de desarrollo fluida.
   - Soporte de recarga en caliente para servidores de desarrollo.
