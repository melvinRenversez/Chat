const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const winston = require('winston');

// Configuration de Winston : on définit un format qui retourne uniquement le message
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.printf(info => info.message),
  transports: [
    // Ici, le fichier sera créé avec le nom "messages.txt"
    new winston.transports.File({ filename: 'messages.txt' })
  ]
});

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  // Enregistre la connexion de l'utilisateur
  logger.info(`Un utilisateur s'est connecté (${socket.id})`);

  socket.on('chat', (msg) => {
    // Enregistre uniquement le message (sans métadonnées supplémentaires)
    logger.info(`message: ${msg.name} : ${msg.msg}`);
    socket.broadcast.emit("chat", msg);
  });

  socket.on('test', (msg) => {
    logger.info(`test: ${msg.name} : ${msg.msg}`);
    io.emit("chat", msg);
  });

  socket.on('disconnect', () => {
    logger.info(`Un utilisateur s'est déconnecté (${socket.id})`);
  });
});

server.listen(3000, () => {
  logger.info('Server is running on port 3000');
});
