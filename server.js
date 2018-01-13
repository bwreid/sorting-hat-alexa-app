const AlexaAppServer = require('./config')
const port = process.env.PORT || 8080

AlexaAppServer.start({
  server_root: __dirname,
  public_html: 'public',
  app_dir: 'apps',
  port
})
