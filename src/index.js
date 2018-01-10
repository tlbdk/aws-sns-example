// @ts-check
'use strict'

const request = require('request')
const http = require('http')
const listenPort = 9000

let httpServer = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/receive') {
    let chunks = []
    req.on('data', function(chunk) {
      chunks.push(chunk)
    })
    req.on('end', function() {
      try {
        let messageBytes = Buffer.concat(chunks)
        let message = JSON.parse(messageBytes.toString('utf8'))
        // TODO: Validate message: https://github.com/mattrobenolt/node-snsclient/blob/master/lib/snsclient.js
        if (message.Type === 'SubscriptionConfirmation') {
          request.get(message.SubscribeURL, {}, (err, response, body) => {
            console.log(`SubscriptionConfirmation: ${response.statusCode}`)
            console.log(`${body}`)
          })
        } else if (message.Type === 'Notification') {
          console.log(JSON.stringify(message, null, 2))
        }
      } catch (e) {
        console.error(e)
      }
    })
    return res.end()
  }
  res.writeHead(404)
  res.end('Not found')
})

httpServer.listen(listenPort, () => {
  console.log(`Listning on ${listenPort}`)
})
