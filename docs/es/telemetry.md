## Telemetría

El cliente de actioman utiliza telemetría para recopilar información anónima sobre el uso del cliente. Esta telemetría se activa al ejecutar comandos de `actioman` como `serve`, `add`, `install`, entre otros. Utilizamos esta información para comprender cómo se usa Actioman y mejorar el servicio continuamente.

Para depurar y ver la información exacta que se envía, puedes activar el modo debug de la telemetría estableciendo la variable de entorno `ACTIOMAN_TELEMETRY_DEBUG=1`. Al activar este modo, la información de telemetría se imprimirá en la consola antes de ser enviada.

### Información Recopilada

La telemetría de actioman recopila la siguiente información anónima:

- **Versión de Actioman:** La versión del cliente de `actioman` que estás utilizando. Esto nos ayuda a entender la adopción de nuevas versiones y a identificar problemas específicos de versiones.
- **Invocaciones de Comandos:** Los comandos de `actioman` que se ejecutan, por ejemplo, `actioman serve`, `actioman add`, etc. Esto nos permite comprender qué funcionalidades son más utilizadas y cómo los usuarios interactúan con la herramienta.
- **Información del Sistema Operativo:** Una cadena de texto que identifica la versión del kernel del sistema operativo (`os.version()`). Esto nos ayuda a entender las plataformas en las que se utiliza Actioman y a garantizar la compatibilidad.
- **Plugins Activos:** La lista de plugins que están activos durante la ejecución de un comando. Esto nos permite entender qué plugins son populares y cómo se utilizan en conjunto.
- **Duración de la Invocación de Comandos:** El tiempo que tarda en ejecutarse cada comando de `actioman`. Esto nos ayuda a identificar posibles problemas de rendimiento y a optimizar la velocidad de la herramienta.
- **Códigos de Errores Internos de Actioman (Próximamente):** En futuras versiones, planeamos incluir códigos de error internos que puedan ocurrir en Actioman. Esto nos ayudará a diagnosticar problemas y mejorar la estabilidad de la herramienta.

**Privacidad y Rendimiento:**

La información recopilada es **totalmente anónima** y no se asocia a ningún usuario o proyecto específico. No recopilamos información personal ni datos sensibles. El objetivo principal de la telemetría es mejorar Actioman para todos los usuarios.

Además, el envío de esta información está diseñado para ser **imperceptible** y no causar ninguna degradación en el rendimiento de tus comandos de `actioman`. Nos aseguramos de que la telemetría tenga un impacto mínimo en tu experiencia de usuario.

**Desactivar la Telemetría:**

La telemetría está **activada por defecto** para ayudarnos a mejorar Actioman. Sin embargo, entendemos que algunos usuarios prefieran desactivarla. Además, para evitar la recopilación de telemetría en entornos automatizados, la telemetría se **desactiva automáticamente en los siguientes entornos:**

- **Entornos de Integración Continua (CI):** Si se detecta la presencia de la variable de entorno `CI` con valor `'true'` o `GITHUB_ACTIONS` con valor `'true'`, la telemetría se desactiva automáticamente. Esto asegura que no se recopile información de builds automatizados.
- **Entornos de Test:** Si la variable de entorno `NODE_ENV` está establecida a `'test'`, la telemetría también se desactiva automáticamente, evitando la recopilación de datos durante las pruebas unitarias o de integración.

Si no te encuentras en uno de estos entornos o deseas desactivar la telemetría manualmente, puedes hacerlo de las siguientes maneras:

- **Variable de Entorno:** Establece la variable de entorno `ACTIOMAN_TELEMETRY_DISABLED=1`. Cuando esta variable está presente, la telemetría se desactiva completamente.

  ```bash
  export ACTIOMAN_TELEMETRY_DISABLED=1
  # o para desactivar solo para un comando:
  ACTIOMAN_TELEMETRY_DISABLED=1 actioman serve
  ```

- **Comando `actioman telemetry`:** Actioman proporciona un comando dedicado para gestionar la telemetría:

  - **Desactivar la telemetría:**

    ```bash
    npx actioman telemetry disable
    ```

  - **Activar la telemetría:**

    ```bash
    npx actioman telemetry enable
    ```

  El comando `actioman telemetry` guarda tu preferencia de telemetría para futuras invocaciones de Actioman.

Entendemos la importancia de la privacidad y la transparencia. Si tienes alguna pregunta o inquietud sobre nuestra telemetría, no dudes en contactarnos.
