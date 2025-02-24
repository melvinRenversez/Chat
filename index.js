const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const winston = require('winston');

// Configuration de Winston pour écrire dans un fichier texte sans métadonnées supplémentaires
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.printf(info => info.message),
  transports: [
    new winston.transports.File({ filename: 'messages.txt' })
  ]
});

const app = express();
// Si le serveur est derrière un proxy (ex : Nginx), autorise la récupération de la vraie IP :
app.set('trust proxy', true);

const server = http.createServer(app);
const io = new Server(server);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  // Récupération des informations disponibles depuis le handshake
  const handshake = socket.handshake;
  const ip = handshake.address;
  const userAgent = handshake.headers['user-agent'];
  const referer = handshake.headers['referer'] || 'none';
  const origin = handshake.headers['origin'] || 'none';
  const queryParams = handshake.query; // éventuels paramètres de requête

  // Log complet à la connexion
  logger.info(`Connexion:
    ID: ${socket.id}
    IP: ${ip}
    User-Agent: ${userAgent}
    Referer: ${referer}
    Origin: ${origin}
    Query: ${JSON.stringify(queryParams)}
  `);

  socket.on('chat', (msg) => {
    // Log complet lors de l'envoi d'un message
    logger.info(`Message reçu:
    Nom: ${msg.name}
    Message: ${msg.msg}
    ID: ${socket.id}
    IP: ${ip}
    User-Agent: ${userAgent}
    Referer: ${referer}
    Origin: ${origin}
    `);
    socket.broadcast.emit("chat", msg);
  });

  socket.on('test', (msg) => {
    logger.info(`Test message reçu:
    Nom: ${msg.name}
    Message: ${msg.msg}
    ID: ${socket.id}
    IP: ${ip}
    User-Agent: ${userAgent}
    `);
    io.emit("chat", msg);
  });

  socket.on('disconnect', () => {
    logger.info(`Déconnexion:
    ID: ${socket.id}
    IP: ${ip}
    User-Agent: ${userAgent}
    `);
  });
});

server.listen(3000, () => {
  logger.info('Server is running on port 3000');
});
