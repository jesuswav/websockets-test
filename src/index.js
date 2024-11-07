const express = require('express')
const http = require('http')
const webSocket = require('ws')

const app = express()

const server = http.createServer(app)

const wss = new webSocket.WebSocketServer({ server })

const clients = {}

// Listen WS connections
wss.on('connection', (ws) => {
  console.log('Cliente conectado')

  ws.on('message', (message) => {
    const parsedMessage = JSON.parse(message)
    // console.log(JSON.parse(message))

    if (parsedMessage.id) {
      const userId = parsedMessage.id

      clients[userId] = ws
      console.log(`Cliente con ID ${userId} conectado`)
    }

    if (parsedMessage.to && clients[parsedMessage.to]) {
      const targetWs = clients[parsedMessage.to]
      const msgToSend = parsedMessage.message
      const startHour = parsedMessage.startHour
      const startMinute = parsedMessage.startMinute
      const finishHour = parsedMessage.finishHour
      const finishMinute = parsedMessage.finishMinute

      console.log('Mensage enviado: ', parsedMessage)
      targetWs.send(
        JSON.stringify({
          id: parsedMessage.id,
          message: msgToSend,
          startHour: startHour,
          startMinute: startMinute,
          finishHour: finishHour,
          finishMinute: finishMinute,
        })
      )
    }
  })

  ws.on('close', () => {
    console.log('Cliente desconectado')
    for (const [id, client] of Object.entries(clients)) {
      if (client === ws) {
        delete clients[id]
        console.log(`Cliente con Id ${id} desconectado`)
      }
    }
  })
})

app.get('/', (req, res) => {
  res.send('Servidor WebSocket corriendo')
})

const IP = '172.20.10.11'
const PORT = 3001
server.listen(PORT, IP, () => {
  console.log(`Servidor corriendo http://${IP}:${PORT}`)
})
