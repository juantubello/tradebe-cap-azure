# Getting Started

Welcome to your new project.

It contains these folders and files, following our recommended project layout:

File or Folder | Purpose
---------|----------
`app/` | content for UI frontends goes here
`db/` | your domain models and data go here
`srv/` | your service models and code go here
`package.json` | project metadata and configuration
`readme.md` | this getting started guide


## Next Steps

- Open a new terminal and run `cds watch` 
- (in VS Code simply choose _**Terminal** > Run Task > cds watch_)
- Start adding content, for example, a [db/schema.cds](db/schema.cds).


# Deploy 

## Folders

Actualmente se encuentran corriendo 2 instancias de la aplicacion dentro del servidor

Para lograr esto, se clono el repositorio dentro de 2 directorios:

- azure_service_dev
- azure_service_prd

dentro de cada uno a nivel root, se crearon sus respectivas variables de entorno (.env)

[![dev-env.png](https://i.postimg.cc/t4cPf3GH/dev-env.png)](https://postimg.cc/NK152r0N)

para que una apunte al blob de dev y otra al blob de produccion.

## PM2

Para tener 2 instancias del servicio corriendo en fondo, utilizamos el manegador de procesos PM2, el cual nos permite correr varias instancias de aplicaciones en fondo y tambien nos da la posibilidad de enlazar
las mismas al arranque del servidor, en otras palabras, ante una caída o reinicio del mismo, nuestros servicios vuelven a estar disponibles de manera automatica. 

para dar de alta un proceso, dentro de nuestra carpeta del proyecto corremos el comando, el cual va a dejar el servicio corriendo en fondo:

`pm2 start npm --name "azure_dev" -- start --no-autorestart`

para ver los procesos corriendo, utilizamos el comando

`pm2 ls`

[![pm2-ls.png](https://i.postimg.cc/DzbsKS74/pm2-ls.png)](https://postimg.cc/FfN1ysdh)

y para eliminar un proceso utilizamos el comando

`pm2 delete azure_dev`

una aclaracion importante, es que por defecto CAP levanta los servicios en el puerto 4004, entonces para poder correr una segunda instancia, es necesario que en el directorio de nuestro servicio, el cual apunta al blob de dev, se modifique el script start del package.json reemplazando el "cds run" por:

 `"start": "cds run --port 3000"`

[![dev-package.png](https://i.postimg.cc/G2wD3bp7/dev-package.png)](https://postimg.cc/sBmxwd77)

de esta manera le indicamos a CAP que debe correr la aplicacion en el puerto 3000
