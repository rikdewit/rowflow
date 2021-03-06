const {io} = require('./server_setup.js');

let boats = [];
let finished = false;

function Boat(id, distance, rotation, zrotation, name) {
  this.id = id;
  this.distance = distance;
  this.rotation = rotation;
  this.zrotation = zrotation;
  this.name = name;
}

let time = 0;



setInterval(heartbeat, 10);
setInterval(timer, 100);



function heartbeat() {

  io.sockets.emit('heartbeat', boats);
  //console.log(boats)
}

function timer(){
  if(!finished){
    time += 0.1;
  }
  io.sockets.emit('timer', time);
  // console.log(time)
}

function restart(){
  console.log("restart");
  io.sockets.emit('restart');
  for (let i = 0; i<boats.length; i++) {


    

    let boat = boats[i];
    boat.distance = 0;
    boat.rotation = 0;
    boat.zrotation = 0;
    boat.finished = false;
    finished = false;
    time = 0;

  }
}

function won(boat, time){
  io.sockets.emit('won', boat, time);
}



io.sockets.on(
  'connection',
  function(socket) {
    console.log('We have a new client: ' + socket.id);

    socket.on('start', function(data) {
      let boat = new Boat(socket.id, data.distance);
      boats.push(boat);
    });

    socket.on('update', function(data) {
      for (let i = 0; i<boats.length; i++) {
        let boat = boats[i];
        if (socket.id == boat.id) {
         
          boat.distance = data.distance;
          boat.rotation = data.rotation;
          boat.zrotation = data.zrotation;
          boat.finished = data.finished;
          boat.name = data.name;
        }

        if(boat.finished && !finished){
          console.log("Boat finished! "+ boat.name + " " + boat.id);
          finished = true;
          won(boat, time);
          setTimeout(restart, 3000);
        }
      }
    });

    socket.on('disconnect', function() {
      console.log('Client has disconnected ' + socket.id);      
      
          for(let i = 0; i < boats.length; i++){
              
              if(socket.id === boats[i].id){
                  boats.splice(i, 1);
              }
          }
    });

});
