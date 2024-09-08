# Social Scraper

## Descripción

**Social Scraper** es una herramienta de consola desarrollada en **Node.js** que utiliza **Playwright** para realizar web scraping en diversas plataformas de redes sociales.

Actualmente, **Social Scraper** soporta los siguientes proveedores:
1. **X (Twitter)**

## Características

- **Soporte Multiplataforma**: Compatible con diferentes redes sociales mediante proveedores específicos.
- **Almacenamiento Estructurado**: Guarda los resultados en archivos JSON organizados por nombre de proveedor y fecha.
- **Análisis de Contenido**: Identifica información sensible en las publicaciones recopiladas.
- **Gestión de Sesiones**: Maneja sesiones iniciadas para realizar scraping de manera eficiente.

## Instalación

### Requisitos Previos

- **Node.js** (versión 18 o superior)
- **npm** 

### Pasos de Instalación

1. **Clonar el Repositorio**

    ```bash
    git clone https://github.com/code3743/social-scraper.git
    ```

2. **Navegar al Directorio del Proyecto**

    ```bash
    cd social-scraper
    ```

3. **Instalar las Dependencias**

    ```bash
    npm install
    ```

## Uso

**Social Scraper** es una herramienta de consola. Para ejecutarla, utiliza el siguiente comando:

```bash
node app.js
```


### Resultados

Los resultados se almacenan en la carpeta `/results` como archivos JSON con el formato `providerName-date.json`. Cada archivo contiene un array de publicaciones con la siguiente estructura:

- **id**: Identificador de la publicación.
- **contenido**: Contenido textual de la publicación.
- **media**: Array de URLs de medios asociados.
- **metadata**: Objeto con información adicional relevante.


## Contribución

Si deseas contribuir a **Social Scraper**, por favor sigue estos pasos:

1. **Haz un Fork del Repositorio**
2. **Crea una Rama para tu Funcionalidad o Corrección de Bug**

    ```bash
    git checkout -b feature/nueva-funcionalidad
    ```

3. **Realiza tus Cambios y Confirma tus Commits**

    ```bash
    git commit -m "Descripción de los cambios"
    ```

4. **Push a tu Rama**

    ```bash
    git push origin feature/nueva-funcionalidad
    ```

5. **Abre un Pull Request**

## Licencia

Este proyecto está licenciado bajo la **Licencia MIT**. Consulta el archivo [LICENSE](LICENSE) para más detalles.
