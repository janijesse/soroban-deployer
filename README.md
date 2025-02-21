# Tutorial: Implementador de Contratos Inteligentes Soroban con Next.js

## Requisitos Previos

*   Node.js v18+

## Pasos

1.  **Crear Proyecto Next.js:**

    ```
    npx create-next-app@latest soroban-deployer
    cd soroban-deployer
    ```

    *   `npx create-next-app`:  Crea un nuevo proyecto Next.js.
    *   `cd soroban-deployer`:  Navega al directorio del proyecto.
2.  **Instalar Dependencias:**

    ```
    npm install --save stellar-sdk formidable
    ```

    *   `npm install`:  Instala las bibliotecas necesarias.
        *   `stellar-sdk`: Para interactuar con la red Stellar/Soroban.
        *   `formidable`: Para manejar la carga de archivos.

3.  **Crear Interfaz de Usuario (páginas/index.js):**

    *   Crea/modifica `pages/index.index.tsx` para incluir:
        *   Campos para clave privada y archivo WASM.
        *   Botón "Deploy" que llama a una API.
        *   Componente `Modal` para mostrar resultados.
4.  **Crear API (pages/api/deployer.js):**

    *   Crea `pages/api/deployer.js` para:
        *   Recibir clave privada y archivo WASM.
        *   Subir WASM a la red Soroban.
        *   Crear instancia del contrato.
        *   Devolver hash WASM e ID del contrato.
5.  **Ejecutar Aplicación:**

    ```
    npm run dev
    ```

    *   `npm run dev`: Inicia el servidor de desarrollo de Next.js.

## Advertencias

*   **Seguridad:** No uses claves privadas reales en producción.
*   **Horizon:** Puede haber límites de velocidad.

## Notas Adicionales

*   **¿Qué es Horizon?**  Horizon es la API de Stellar que la aplicación usa para interactuar con la red. Es el "middleware" que permite enviar transacciones y obtener información sobre cuentas, contratos, etc.  
Puedes experimentar con Horizon Futurenet aquí: 
`https://horizon-futurenet.stellar.org`.
