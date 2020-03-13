var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

const fps = 60;

var particles;

setup();
var mainLoop;

function setup(){
  particles = [];

  for (var i = 0; i < 10; i++){
    particles.push(new particle(i*(canvas.width/10) + 30, 100, 30))
  }

  console.log(particles);

  //console.log(particles);
  mainLoop = setInterval(main, 1000/fps);
}

function main(){
  //math
  physics(particles);

  //drawing
  ctx.fillStyle = "#fff";
  ctx.fillRect(0,0,canvas.width, canvas.height);
  drawParticles(particles);
}

function physics(particles){
  for (var i = 0; i < particles.length; i++){
    particles[i].update(1000/fps);
  }

  particles = collisionCheck(particles, canvas.width, canvas.height);
}

function drawParticles(particles){
  for (var i = 0; i < particles.length; i++){
    ctx.strokeStyle = "#000";
    ctx.beginPath();
    ctx.arc(particles[i].x, particles[i].y, particles[i].radius, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.stroke();
  }
}