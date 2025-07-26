// Punto de entrada para utilidades de pruebas de integración con contenedores.
// Reexporta funciones para configurar y limpiar el entorno de contenedores.
//
// - setupContainer: Prepara los recursos y directorios necesarios para las pruebas.
// - cleanupContainer: Limpia y detiene los recursos utilizados durante las pruebas.
export { cleanupContainer, setupContainer } from "./src/setup_container";
