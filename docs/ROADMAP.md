# 🗺️ Roadmap Técnico de ActionMan

Este documento detalla el estado actual del proyecto y las tareas planificadas para cada módulo del sistema. Las tareas están organizadas por fases, con una descripción técnica clara de cada ítem y una estimación de tiempo de implementación basado en complejidad y extensión del código existente.

---

## ✅ Fase 1: Núcleo del Producto

| Módulo | Estado | Descripción Técnica | Estimación |
|--------|--------|---------------------|------------|
| `run` | No iniciado | Falta un comando independiente para ejecutar funciones locales desde archivos `.js`. Actualmente solo existe `serve` para exponerlas vía HTTP. | 3 días |
| `dev` | No iniciado | No se dispone de un modo de desarrollo con recarga o exposición automática de endpoints. | 4 días |
| `loader` | Parcial | Existen cargadores de configuración (`factory.ts`) pero no un sistema de descubrimiento de acciones en carpetas. | 4 días |
| `transporter` | No iniciado | Aún no hay un sistema de plugins para diferentes protocolos (HTTP/RPC/WebSocket). | 5 días |
| `telemetry` | Implementado | Telemetría iniciada al ejecutar la CLI (`actioman.ts`). Envía eventos de `command_execution`. Falta comando dedicado para gestionarla. | 1 día (opciones de CLI) |

---

## 🧑‍💻 Fase 2: Experiencia del Usuario

| Componente | Estado | Descripción Técnica | Estimación |
|------------|--------|---------------------|------------|
| Instalación CLI | Implementado | `npm install -g actioman` expone el binario (`actioman.ts`). | 0 días |
| Inicio rápido | Parcial | Documentación en `README` y recetas, pero sin guía unificada que muestre `add`, `install` y telemetría. | 2 días |
| Página web | No iniciado | No se observa un sitio estático. Requiere diseño en Astro/React con guía básica. | 4 días |
| Documentación CLI | Parcial | `cli-reference.md` documenta `serve`, falta cobertura de `add`, `install`, `version` y futura `telemetry`. | 3 días |

---

## 🌍 Fase 3: Adopción y Comunidad

| Elemento | Estado | Descripción Técnica | Estimación |
|----------|--------|---------------------|------------|
| Preguntas frecuentes (FAQ) | No iniciado | No existe `docs/faq.md` con dudas recurrentes. | 1 día |
| Showcase | No iniciado | No hay listado de proyectos que utilicen Actioman. | 2 días |
| Sistema de extensiones | Parcial | Integraciones básicas (`metrics`) están soportadas, pero falta interfaz formal para cargar plugins dinámicos. | 4 días |

---

## 📈 Fase 4: Escalabilidad y Mantenimiento

| Elemento | Estado | Descripción Técnica | Estimación |
|----------|--------|---------------------|------------|
| Tests unitarios | Parcial | Existen pruebas de CLI y módulos individuales (`bun` + Docker) pero muchas dependen de contenedor. Faltan tests para integraciones y cargadores. | 4 días |
| Observabilidad | Parcial | Telemetría presente, pero no hay logs estructurados ni seguimiento de errores centralizado. | 3 días |
| CI/CD | No iniciado | No se detectan flujos de GitHub Actions ni despliegues automáticos. | 3 días |
| Mantenimiento | Planeado | Definir ciclo de releases y revisión de issues usando `release-please`. | 2 días |

---

## Depuración

- `template` y `share-actions` contienen código mínimo sin funcionalidad actual.
- Los tests de integración requieren Docker y pueden fallar sin este entorno.

---

## 📌 Notas Finales

- El roadmap será actualizado conforme se avance en el proyecto.
- Cada ítem debe validarse contra el código actual antes de considerarse completo.
