# Documentación detallada de entrypoint.sh

Este script es un entrypoint para contenedores de integración, escrito en shell (sh). Proporciona utilidades para controlar procesos de fondo, especialmente para pruebas o entornos de integración. A continuación se documenta cada sección y función a detalle:

---

## Propósito general

Permite ejecutar y controlar procesos de fondo (como sleep o comandos arbitrarios), así como terminar procesos relacionados con Bun, facilitando la gestión de pruebas automatizadas en contenedores.

## Configuración inicial

- `set -e`: Termina el script si un comando falla.
- `set -u`: Termina el script si se usa una variable no definida.

## Variables globales

- `SLEEP_PID_FILE`: Ruta al archivo temporal donde se guarda el PID del proceso sleep.
- `COMMAND_PID_FILE`: Ruta al archivo temporal donde se guarda el PID de un comando ejecutado.

## Funciones

### sleep_and_wait

- Inicia un proceso de sleep en segundo plano por un tiempo determinado (por defecto 60 segundos o el valor de `--sleep-time`).
- Guarda el PID en `SLEEP_PID_FILE`.
- Si ya hay un sleep corriendo, muestra un mensaje y no inicia otro.
- Muestra mensajes indicando el tiempo de espera en minutos y segundos.

### kill_process_by_pid_file

- Lee el PID guardado en `SLEEP_PID_FILE`.
- Si el proceso existe, lo termina.
- Elimina el archivo de PID.
- Si no existe el archivo, muestra un mensaje.

### kill_bun_processes

- Busca procesos que contengan 'bun' en su línea de comando.
- Intenta terminar todos esos procesos con `kill -9`.
- Muestra mensajes indicando el resultado.

### exec_command

- Ejecuta un comando arbitrario en segundo plano.
- Guarda el PID en `COMMAND_PID_FILE`.
- Espera a que el comando termine y luego elimina el archivo de PID.
- Si no se pasa ningún comando, muestra un error.

### kill_exec_command

- Lee el PID guardado en `COMMAND_PID_FILE`.
- Si el proceso existe, lo termina.
- Elimina el archivo de PID.
- Si no existe el archivo, muestra un mensaje.

## Lógica principal

- Si no se pasa ningún argumento, muestra un error y termina.
- Según el primer argumento (`sleep`, `kill`, `kill-bun`, `exec`, `kill-exec`), ejecuta la función correspondiente.
- Si el comando no es válido, muestra los comandos disponibles y termina con error.

---

## Comandos disponibles

- `sleep [--sleep-time SEGUNDOS]`: Inicia un sleep en segundo plano.
- `kill`: Termina el proceso sleep iniciado previamente.
- `kill-bun`: Termina todos los procesos relacionados con Bun.
- `exec <comando>`: Ejecuta un comando arbitrario en segundo plano.
- `kill-exec`: Termina el comando ejecutado con `exec`.

---

## Uso típico

- Para mantener un contenedor corriendo: `./entrypoint.sh sleep --sleep-time 300`
- Para ejecutar un comando y poder matarlo después: `./entrypoint.sh exec node server.js`
- Para terminar el sleep: `./entrypoint.sh kill`
- Para terminar el comando: `./entrypoint.sh kill-exec`
- Para limpiar procesos de Bun: `./entrypoint.sh kill-bun`

---

Este script es útil para pruebas de integración, automatización y control de procesos en contenedores.
