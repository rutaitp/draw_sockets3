//STEP 2.
//Express
let express = require('express');
let app = express();
app.use('/', express.static('public'));

//Server
let http = require('http');
let server = http.createServer(app);
let port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log("Server is listening at: " + port);
});

//STEP 3. Socket connection
let io = require('socket.io');
io = new io.Server(server);

//Establish default socket connection
io.sockets.on('connection', (socket) => {
  console.log("We have a new client: " + socket.id);

  //STEP 6. Listen for data
  socket.on("data", (data) =>{
    console.log(data);

    //send to all clients, including myself
    io.sockets.emit('draw-data', data);
  });

  socket.on('disconnect', () =>{
    console.log('Client disconnected: ' + socket.id);
  });
});

//private namespace connection
let private = io.of('/private');
private.on('connection', (socket) => {
  console.log("We have a new client: " + socket.id);

  //listen for room name
  socket.on('room-name', data => {
    console.log(data);

    //add socket to room
    socket.join(data.room);

    //add room property to socket object
    socket.room = data.room;
    // console.log(socket);

    //send a welcome message to new clients
    let welcomeMsg = "Welcome to '" + data.room + "' room!";

    //send a welcome message to everybody in a room
    // private.to(socket.room).emit('joined', {msg: welcomeMsg});
    socket.emit('joined', {msg: welcomeMsg});
  });

  //STEP 6. Listen for data
  socket.on("data", (data) =>{
    console.log(data);

    //send to all clients, including myself
    private.to(socket.room).emit('draw-data', data);
  });

  socket.on('disconnect', () =>{
    // console.log('Client disconnected: ' + socket.id);
    // console.log('Client ' + socket.id + ' disconnected and left room ' + socket.room);
    console.log(`Client ${socket.id} disconencted and left room ${socket.room}`);

    socket.leave(socket.room);
  });
});
