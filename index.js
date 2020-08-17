const express = require('express')
const monitor = require('express-status-monitor')

const fs = require('fs')
const path = require('path')
const JSZip = require('jszip')
const filewalker = require('filewalker')

const config = {
  port: process.env.PORT,
  source: path.resolve(process.env.SOURCE),
  secret: process.env.SECRET
}

const authorizeFn = (req, res, next) => {
  const { secret: secretSet } = config
  
  if (typeof secretSet === 'undefined') {
    next()
    return
  }

  const secretReceived = req.header('x-secret')

  if (secretSet !== secretReceived) {
    res.send('Inocrrect secret')
    return
  }

  next()
}

const getBackupFn = (req, res) => {
  console.log(`P: Processing started`)

  const { source } = config

  if (!fs.existsSync(source)) {
    res.send('Backup source defined incorrectly.')
    return
  }

  const zip = new JSZip()

  filewalker(source)
    .on('dir', function(p) {
      console.log('P: Found dir:  %s', p)
      zip.folder(p)
    })
    .on('file', function(p, s) {
      console.log('P: Found file: %s, %d bytes', p, s.size)
      zip.file(p, fs.createReadStream(path.join(source, p)))
    })
    .on('error', function(error) {
      console.error(`P: ${error}`)
      res.send(error)
    })
    .on('done', function() {
      console.log('P: Finished with %d dirs, %d files, %d bytes', this.dirs, this.files, this.bytes)

      res.contentType('application/zip')

      zip.generateNodeStream({ type: 'nodebuffer', streamFiles: true })
      .pipe(res)
      .on('finish', function () {
        console.log(`P: Processing finished`)
        res.end()
      })
    })
  .walk()
}

const app = express()

app.use(monitor())
app.use(authorizeFn)
app.get('/', getBackupFn)

app.listen(config.port, () => {
  console.log(`P: Streamex listening at http://localhost:${config.port}`)
})

