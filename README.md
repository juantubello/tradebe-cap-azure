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

Currently, there are 2 instances of the application running within the server.

To achieve this, the repository was cloned into 2 directories:

- azure_service_dev
- azure_service_prd

In each directory at the root level, their respective environment variables (.env) were created so one go vs development blob and the other vs production blob.

[![dev-env.png](https://i.postimg.cc/t4cPf3GH/dev-env.png)](https://postimg.cc/NK152r0N)

## PM2

To have 2 instances of the service running in the background, we use the process manager PM2, which allows us to run multiple instances of applications in the background and also gives us the possibility to bind them to the server startup. In other words, in the event of a server crash or restart, our services are automatically available again.

To start a process, we run the following command within our project folder, which will keep the service running in the background:
`pm2 start npm --name "azure_dev" -- start --no-autorestart`

To view the running processes, we use the command:
`pm2 ls`

[![pm2-ls.png](https://i.postimg.cc/DzbsKS74/pm2-ls.png)](https://postimg.cc/FfN1ysdh)

To delete a process, we use the command:
`pm2 delete azure_dev`

An important clarification is that by default CAP runs services on port 4004, so in order to run a second instance, it is necessary to modify the start script of the package.json file in the directory of our service that points to the dev blob by replacing `"cds run"` with:

 `"start": "cds run --port 3000"`

[![dev-package.png](https://i.postimg.cc/G2wD3bp7/dev-package.png)](https://postimg.cc/sBmxwd77)

in this way, we indicate to CAP that it should run the application on port 3000.
