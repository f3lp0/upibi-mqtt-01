'use strict'
//
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
var io = new Server(server);

const path = require('path')
app.use('/', express.static(path.join(__dirname, 'public')))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});
io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('RFMH', function(msj) {
    io.emit('RFMH', msj);
  });
  socket.on('EQUIPO1', function(msj) {
    io.emit('EQUIPO1', msj);
  });
  socket.on('EQUIPO2', function(msj) {
    io.emit('EQUIPO2', msj);
  });
  socket.on('EQUIPO3', function(msj) {
    io.emit('EQUIPO3', msj);
  });
  socket.on('EQUIPO4', function(msj) {
    io.emit('EQUIPO4', msj);
  });
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});
//

const Aedes = require('aedes')
const { createServer } = require('net')
const mq = require('mqemitter-redis')({
  port: process.env.REDIS_PORT || 6379
})
const persistence = require('aedes-persistence-redis')({
  port: process.env.REDIS_PORT || 6379
})

function parsePayload (payload) {
  if (payload instanceof Buffer) {
    payload = payload.toString('utf8')
  }
  try {
    payload = JSON.parse(payload)
  } catch (e) {
    payload = null
  }
  return payload
}

const clients = new Map()

function startAedes () {
  const port = 1883
  const aedes = Aedes({
    mq,
    persistence
  })

  const server = createServer(aedes.handle)

  server.listen(port, '0.0.0.0', async function () {    
    console.log('Aedes listening on port:', port)
    aedes.publish({ topic: 'aedes/hello', payload: "I'm broker " + aedes.id })
  })

  server.on('error', handleFatalError)

  aedes.on('subscribe', function (subscriptions, client) {
    console.log('MQTT client \x1b[32m' + (client ? client.id : client) +
              '\x1b[0m subscribed to topics: ' + subscriptions.map(s => s.topic).join('\n'), 'from broker', aedes.id)
  })

  aedes.on('unsubscribe', function (subscriptions, client) {
    console.log('MQTT client \x1b[32m' + (client ? client.id : client) +
              '\x1b[0m unsubscribed to topics: ' + subscriptions.join('\n'), 'from broker', aedes.id)
  })

  // fired when client is connected
  aedes.on('client', function (client) {
    console.log('Client Connected: \x1b[33m' + (client ? client.id : client) + '\x1b[0m', 'to broker', aedes.id)
    clients.set(client.id, null)
    console.log("Equipos conectados:")
    console.log(clients)
    switch (client.id) {
      case 'EQUIPO1':
        io.emit('EQUIPO1-display', "block");
        break
      case 'EQUIPO2':
        io.emit('EQUIPO2-display', "block");
        break
      case 'EQUIPO3':
        io.emit('EQUIPO3-display', "block");
        break
      case 'EQUIPO4':
        io.emit('EQUIPO4-display', "block");
        break
      case 'RFMH':
        io.emit('RFMH-display', "block");
        break
    }
  })

  // fired when client is disconnected
  aedes.on('clientDisconnect', async function (client) {
    console.log('Client Disconnected: \x1b[31m' + (client ? client.id : client) + '\x1b[0m', 'to broker', aedes.id)        
    console.log("Equipo desconectado:")    
    console.log(client.id)    
    clients.delete(client.id)
    console.log("Equipos conectados:")
    console.log(clients)
      
    switch (client.id) {
      case 'EQUIPO1':
        io.emit('EQUIPO1-display', "none");
        break
      case 'EQUIPO2':
        io.emit('EQUIPO2-display', "none");
        break
      case 'EQUIPO3':
        io.emit('EQUIPO3-display', "none");
        break
      case 'EQUIPO4':
        io.emit('EQUIPO4-display', "none");
        break
      case 'RFMH':
        io.emit('RFMH-display', "none");
        break
    }
  })

  // fired when a message is published
  aedes.on('publish', async function (packet, client) {
    console.log('Client \x1b[31m' + (client ? client.id : 'BROKER_' + aedes.id) + '\x1b[0m has published', packet.payload.toString(), 'on', packet.topic, 'to broker', aedes.id)
    const payload = parsePayload(packet.payload)
    switch (packet.topic) {
      case 'EQUIPO1':        
        if (payload) {
          console.log(payload);
          console.log(payload.SpO2);       
          io.emit('EQUIPO1', 10*payload.SpO2);
        }
        break
      case 'EQUIPO2':
        if (payload) {
          console.log(payload);
          console.log(payload.SpO2);       
          io.emit('EQUIPO2', 10*payload.SpO2);
        }
        break
      case 'EQUIPO3':
        if (payload) {
          console.log(payload);
          console.log(payload.SpO2);       
          io.emit('EQUIPO3', 10*payload.SpO2);
        }
        break
      case 'EQUIPO4':
        if (payload) {
          console.log(payload);
          console.log(payload.SpO2);       
          io.emit('EQUIPO4', 10*payload.SpO2);
        }
        break  
      case 'RFMH':
        if (payload) {
          console.log(payload);
          console.log(payload.SpO2);       
          io.emit('RFMH', 10*payload.SpO2);
        }
        break
    }
  })
}

function handleFatalError (err) {
  console.error(err.stack)
  process.exit(1)
}
process.on('uncaughtException', handleFatalError)
process.on('unhandledRejection', handleFatalError)

console.log(__dirname);

startAedes()