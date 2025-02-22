# Tutorial: Implementador de Contratos Inteligentes Soroban con Next.js

## Requisitos Previos

*   Node.js v18+

## Pasos

1.  **Crear Proyecto Next.js:**

    ```
    npx create-next-app@latest soroban-deployer --app
    cd soroban-deployer
    ```

    *   `npx create-next-app`: Crea un nuevo proyecto Next.js.
    *   `cd soroban-deployer`: Navega al directorio del proyecto.
    *   `--app`: Especifica que se use el nuevo `app` router.

2.  **Instalar Dependencias:**

    ```
    npm install --save stellar-sdk formidable
    ```

    *   `npm install`: Instala las bibliotecas necesarias.
        *   `stellar-sdk`: Para interactuar con la red Stellar/Soroban.
        *   `formidable`: Para manejar la carga de archivos.

3.  **Crear Interfaz de Usuario (`src/app/page.tsx`):**

    *   Crea/modifica `src/app/page.tsx` para incluir:
        *   Campos para clave privada y archivo WASM.
        *   Botón "Deploy" que llama a una API.
        *   Componente `Modal` para mostrar resultados.

4.  **Crear API (`src/app/api/deployer/route.js`):**

    *   Crea `src/app/api/deployer/route.js` para:
        *   Recibir clave privada y archivo WASM.
        *   Subir WASM a la red Soroban.
        *   Crear instancia del contrato.
        *   Devolver hash WASM e ID del contrato.
        *   **Importante:** Revisa la documentación de Next.js y `formidable` para configurar correctamente la carga de archivos en el `app` router. Presta especial atención a cómo procesar el cuerpo de la solicitud y cómo enviar la respuesta.

5.  **Ejecutar Aplicación:**

    ```
    npm run dev
    ```

    *   `npm run dev`: Inicia el servidor de desarrollo de Next.js.

## Advertencias

*   **Seguridad:** No uses claves privadas reales en producción.
*   **Horizon:** Puede haber límites de velocidad.

## Notas Adicionales

*   **¿Qué es Horizon?** Horizon es la API de Stellar que la aplicación usa para interactuar con la red. Es el "middleware" que permite enviar transacciones y obtener información sobre cuentas, contratos, etc.
    Puedes experimentar con Horizon Futurenet aquí: `https://horizon-futurenet.stellar.org`.
