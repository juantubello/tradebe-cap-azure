const cds = require('./lib'), { features } = cds.env
// eslint-disable-next-line cds/no-missing-dependencies -- needs to be added by app dev
const express = require('express')
const https = require("https");
const fs = require("fs");

/**
 * Standard express.js bootstrapping, constructing an express `application`
 * and launching a corresponding http server using `app.listen()`.
 * Project-specific `./server.js` can overload this and react to these
 * events:
 *
 * - cds.on('bootstrap',(app)) - emitted before any middleware is added
 * - cds.on('loaded',(model)) - emitted when a model was loaded
 * - cds.on('connect',(srv)) - emitted when a service was connected
 * - cds.on('serving',(srv)) - emitted when a service was served
 * - cds.on('listening',({server,url})) - emitted when the server is listening
 *
 * @param {object} options - canonicalized options from `cds serve` cli
 * @param {boolean} options.in_memory - true if we need to bootstrap an in-memory database
 * @param {string} options.service - name of service to be served; default: 'all'
 * @param {string} options.from - filenames of models to load; default: '*'
 * @param {express.Application} options.app - filenames of models to load; default: '*'
 * @param {express.Handler} options.index - custom handler for /
 * @param {express.Handler} options.favicon - custom handler for /favicon.ico
 * @returns Promise resolving to a Node.js http server as returned by express' `app.listen()`.
 */
module.exports = async function cds_server(options) {

  const _in_prod = process.env.NODE_ENV === 'production'
  const o = { ...options, __proto__: defaults }

  const app = cds.app = o.app || express()
  app.serve = _app_serve                          //> app.serve allows delegating to sub modules
  cds.emit('bootstrap', app)                      //> hook for project-local server.js

  // mount static resources and logger middleware
  if (o.cors) !_in_prod && app.use(o.cors)        //> CORS
  if (o.static) app.use(express_static(o.static))  //> defaults to ./app
  if (o.favicon) app.use('/favicon.ico', o.favicon)  //> if none in ./app
  if (o.index) app.get('/', o.index)                //> if none in ./app

  // load specified models or all in project
  const csn = await cds.load(o.from || '*', o).then(cds.minify) //> separate csn for _init_db
  cds.model = cds.compile.for.nodejs(csn)

  // connect to essential framework services if required
  if (cds.requires.db) cds.db = await cds.connect.to('db').then(_init)
  if (cds.requires.messaging) await cds.connect.to('messaging')

  // serve all services declared in models
  if (cds.requires.middlewares) cds.middlewares.bootstrap(); else if (o.correlate) app.use(o.correlate)
  await cds.serve(o.service, o).in(app)
  await cds.emit('served', cds.services) //> hook for listeners

  // start http server
  const port = (o.port !== undefined) ? o.port : (process.env.PORT || cds.env.server?.port || 4004)

  return https
    .createServer({
      key: fs.readFileSync("/home/techedge/certificates/wildcard.tradebe.com.key"),
      cert: fs.readFileSync("/home/techedge/certificates/wildcard.tradebe.com.crt"),
      ca: [ 
        fs.readFileSync("/home/techedge/certificates/wildcard.tradebe.com.root.crt"),
        fs.readFileSync("/home/techedge/certificates/wildcard.tradebe.com.int.crt")
      ],
     checkServerIdentity: function (host, cert) {
      return undefined;
    } 
  }, app)
    .listen(port, () => { 
      console.log('server is runing at port 4004')
    });

  // return app.listen (port)

  // bootstrap in-memory db
  async function _init(db) {
    if (!o.in_memory || cds.requires.multitenancy) return db
    const fts = cds.requires.toggles && cds.resolve(features.folders)
    const m = !fts ? csn : await cds.load([o.from || '*', ...fts], o).then(cds.minify)
    return cds.deploy(m).to(db, o)
  }

}


// -------------------------------------------------------------------------
// Default handlers, which can be overidden by options passed to the server
//
const defaults = {

  cors, correlate,

  get static() { return cds.env.folders.app },  //> defaults to ./app

  // default generic index.html page
  get index() {
    const index = require('./app/index.js')
    return (_, res) => res.send(index.html)
  },

  // default favicon
  get favicon() {
    const favicon = require.resolve('./app/favicon.ico')
    return express.static(favicon, { maxAge: '14d' })
  }
}


// Helpers to delegate to imported UIs
const path = require('path')
const _app_serve = function (endpoint) {
  return {
    from: (pkg, folder) => {
      folder = !folder ? pkg : path.resolve(require.resolve(pkg + '/package.json'), '../' + folder)
      this.use(endpoint, express.static(folder))
      if (!endpoint.endsWith('/webapp')) (this._app_links || (this._app_links = [])).push(endpoint)
    }
  }
}


function cors(req, res, next) {
  const { origin } = req.headers
  if (origin) res.set('access-control-allow-origin', origin)
  if (origin && req.method === 'OPTIONS')
    return res.set('access-control-allow-methods', 'GET,HEAD,PUT,PATCH,POST,DELETE').end()
  next()
}

function correlate(req, res, next) {
  // derive correlation id from req
  const id = req.headers['x-correlation-id'] || req.headers['x-correlationid']
    || req.headers['x-request-id'] || req.headers['x-vcap-request-id']
    || cds.utils.uuid()
  // new intermediate cds.context, if necessary
  if (!cds.context) cds.context = { id }
  // guarantee x-correlation-id going forward and set on res
  req.headers['x-correlation-id'] = id
  res.set('X-Correlation-ID', id)
  // guaranteed access to cds.context._.req -> REVISIT
  if (!cds.context._) cds.context._ = {}
  if (!cds.context._.req) cds.context._.req = req
  next()
}

function express_static(dir) {
  return express.static(path.resolve(cds.root, dir))
}


// -------------------------------------------------------------------------
if (!module.parent) module.exports({ from: process.argv[2] })
