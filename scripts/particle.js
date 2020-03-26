var particleCollisionsEnabled = true;
var width = 800;
var height = 600;

function particle(x, y, r, m = 1) {
  this.x = x;
  this.y = y;
  this.radius = r;
  this.mass = m;
  this.velocity = new vector(0,0);
  this.elasticity = 0.3;
  this.forces = [];
  this.collidedParticles = [];
  this.forces.push(new force(new vector(0, 9.8/fps)));

  //status check variables for optimization
  var contact = false;

  this.addForce = function(force){
    this.forces.push(force)
  }
  
  this.update = function(deltaTime){
    //normal collisions
    var calculatedForces = calculateForce(this.forces);
    forces = [];
    forces.push(new force(calculatedForces));

    //take care of hard collisions
    //console.log(this.forces);
    //console.log(vAdd(this.velocity,calculateHardCollisions(this.forces)));
    this.velocity = vAdd(this.velocity,calculateForce(this.forces, "hard"));

    //clear all hard collision forces
    var tempForces = [];
    for (var i = 0; i < this.forces.length; i++){
      if (this.forces[i].type == "hard"){

      } else {
        tempForces.push(this.forces[i]);
      }
    }
    this.forces = tempForces;

    //account for time and convert time unit
    calculatedForces.x *= deltaTime * 0.001;
    calculatedForces.y *= deltaTime * 0.001;
    
    //apply the variables
    this.velocity.x += calculatedForces.x;
    this.velocity.y += calculatedForces.y;

    //position correction
      /*
    if (this.x - this.radius < 0){
        this.x = this.radius-1;
    }
    if (this.y - this.radius < 0){
        this.y = this.radius-1;
    }
    if (this.x + this.radius >= width){
        this.x = width-this.radius+1;
    }
    if (this.y + this.radius >= height){
        this.y = height-this.radius+1;
    }
    */


    //cllean up variables for optimization
    //stop colliding if not moving

  }

  this.getAngle = function() {
    return -Math.atan2(this.velocity.y,this.velocity.x);
  }
}

function collisionCheck(particles, deltaTime, boxWidth, boxHeight){
  //ordering the cells array for optimization
  var boxSize;
  if (boxWidth > boxHeight){
    boxSize = boxWidth;
  } else {
    boxSize = boxHeight;
  }
  //console.log(particles);
  var cellSize = boxSize/(boxSize/(particles[0].radius*2))
  var cells = [];
  //construct the array to hold each element
  for (var y = 0; y < boxHeight; y += cellSize){
    cells.push([]);
    //cells[y] = [];
    for (var x = 0; x < boxWidth; x += cellSize){
      cells[y/cellSize].push([]);
      cells[y/cellSize][x/cellSize] = [];
    }
  }

  //add each particle to the new array
  for (var i = 0; i < particles.length; i++) {
      //position correction
      if (particles[i].x - particles[i].radius < 0){
          particles[i].x = particles[i].radius-1;
      }
      if (particles[i].y - particles[i].radius < 0){
          particles[i].y = particles[i].radius-1;
      }
      if (particles[i].x + particles[i].radius >= width){
          particles[i].x = boxWidth-particles[i].radius+1;
      }
      if (particles[i].y + particles[i].radius >= height){
          particles[i].y = boxHeight-particles[i].radius+1;
      }

      //reset collision data
      particles[i].collidedParticles = [];
    //console.log(particles);
    //console.log(Math.floor(particles[i].y/cellSize) + " " + Math.floor(particles[i].x/cellSize));
    //console.log(cells[Math.floor(particles[i].y/cellSize)]);
    cells[Math.floor(particles[i].y/cellSize)][Math.floor(particles[i].x/cellSize)].push(i);
  }

  //collsion comparisons for each particle
  for (var i = 0; i < particles.length; i++) {
      //console.log(particles[i].velocity);

      particles[i] = wallCollisionCheck(particles[i],boxWidth,boxHeight);

      //add velocities
      particles[i].x += particles[i].velocity.x * deltaTime;
      particles[i].y += particles[i].velocity.y * deltaTime;
  //wall collisions
  //particle collisions
   if (particleCollisionsEnabled){
      var xValues = [0];
      var yValues = [0];

      //cancel sides if collided
      //y coords
       //console.log(Math.floor(particles[i].y/cellSize) + " " + yValues[-1]);
      if (Math.floor(particles[i].y/cellSize) + 1 < cells.length) {
        yValues.push(1);
      }
      if (Math.floor(particles[i].y/cellSize) - 1 >= 0) {
        yValues.push(-1);
      }
      //x coords
      if (Math.floor(particles[i].x/cellSize) + 1 < cells[0].length) {
        xValues.push(1);
      }
      if (Math.floor(particles[i].x/cellSize) - 1 >= 0) {
        xValues.push(-1);
      }

      //console.log(yValues);
      var collidedParticles = [];
      //check all quadrants around
       //console.log(yValues + " " + xValues);
      for (var y = 0; y < yValues.length; y++){
        for (var x = 0; x < xValues.length; x++){
          //console.log(cells[Math.floor(particles[i].y/cellSize) + yValues[y]][Math.floor(particles[i].x/cellSize) + xValues[x]]);
          var particlesInCell = cells[Math.floor(particles[i].y/cellSize) + yValues[y]][Math.floor(particles[i].x/cellSize) + xValues[x]];
          for (var j = 0; j < particlesInCell.length; j++){
            if (particlesInCell[j] != i && particleCollisionCheck(particles[i], particles[particlesInCell[j]])){
                var collided = false;
                for (var k = 0; k < particles[i].collidedParticles.length; k++){
                    if (particlesInCell[j] == particles[i].collidedParticles[k]){
                        //console.log(particlesInCell[j] + " " + particles[i].collidedParticles)
                        collided = true;
                        break;
                    }
                }
                if (collided == false) {
                    collidedParticles.push(particlesInCell[j]);
                }
            }
          }
        }
      }

      //proccess the particles found
      for (var j = 0; j < collidedParticles.length; j++) {
        processParticleCollision(particles, i, collidedParticles[j], boxWidth, boxHeight);
      }
    }
  }

  return particles;
}

//check collision between individual particles
function particleCollisionCheck(particle1, particle2){
    /*
  particle1.x += particle1.velocity.x;
  particle1.y += particle1.velocity.y;

  particle2.x += particle2.velocity.x;
  particle2.y += particle2.velocity.y;

     */

  //console.log(Math.sqrt((particle1.x-particle2.x)*(particle1.x-particle2.x) + (particle1.y-particle2.y)*(particle1.y-particle2.y)) + " " + particle1.radius*2);

  if (Math.sqrt((particle1.x-particle2.x)*(particle1.x-particle2.x) + (particle1.y-particle2.y)*(particle1.y-particle2.y)) <= particle1.radius + particle2.radius){
    return true;
  } else {
    return false;
  }
}

function wallCollisionCheck(particle,boxWidth,boxHeight){
  //right
  if (particle.x + particle.radius > boxWidth) {
    particle.forces.push(new force(new vector(-Math.abs(particle.velocity.x + particle.velocity.x * particle.elasticity), 0), "hard"));
    particle.x = boxWidth - particle.radius;
  }
  //left
  if (particle.x - particle.radius < 0) {
    particle.forces.push(new force(new vector(Math.abs(particle.velocity.x + particle.velocity.x * particle.elasticity), 0), "hard"));
    particle.x = 0 + particle.radius;
  }
  //down
  if (particle.y + particle.radius > boxHeight) {
    particle.forces.push(new force(new vector(0,-Math.abs(particle.velocity.y + particle.velocity.y * particle.elasticity)), "hard"));
    particle.y = boxHeight - particle.radius;
  }
  //up
  if (particle.y - particle.radius < 0) {
    particle.forces.push(new force(new vector(0,Math.abs(particle.velocity.y + particle.velocity.y * particle.elasticity)), "hard"));
    particle.y = 0 + particle.radius;
  }

  return particle;
}

function processParticleCollision(particles, p1, p2, boxWidth, boxHeight){
  var p1Force = new vector(0,0);
  var p2Force = new vector(0,0);
  var p1Speed = pythagorean(particles[p1].velocity);
  var p2Speed = pythagorean(particles[p2].velocity);
  //backtrack
    particles[p1].x -= particles[p1].velocity.x*1;
    particles[p1].y -= particles[p1].velocity.y*1;

    particles[p2].x -= particles[p2].velocity.x*1;
    particles[p2].y -= particles[p2].velocity.y*1;

  //non angular collision formula
    var dotProduct = (particles[p1].velocity.x-particles[p2].velocity.x)*(particles[p1].x-particles[p2].x) + (particles[p1].velocity.y-particles[p2].velocity.y)*(particles[p1].y-particles[p2].y);
    var pyth = Math.pow(particles[p2].x-particles[p1].x,2) + Math.pow(particles[p2].y-particles[p1].y,2);

    p1Force.x = -0.5*(particles[p1].velocity.x - (2*particles[p2].mass/(particles[p1].mass + particles[p2].mass)) * ((dotProduct)/(pyth)) * (particles[p2].x - particles[p1].x));
    p1Force.y = -0.5*(particles[p1].velocity.y - (2*particles[p2].mass/(particles[p1].mass + particles[p2].mass)) * ((dotProduct)/(pyth)) * (particles[p2].y - particles[p1].y));

    dotProduct = (particles[p2].velocity.x-particles[p1].velocity.x)*(particles[p2].x-particles[p1].x) + (particles[p2].velocity.y-particles[p1].velocity.y)*(particles[p2].y-particles[p1].y);
    pyth = Math.pow(particles[p1].x-particles[p2].x,2) + Math.pow(particles[p1].y-particles[p2].y,2);
    p2Force.x = -0.5*(particles[p2].velocity.x - (2*particles[p1].mass/(particles[p2].mass + particles[p1].mass)) * ((dotProduct)/(pyth)) * (particles[p1].x - particles[p2].x));
    p2Force.y = -0.5*(particles[p2].velocity.y - (2*particles[p1].mass/(particles[p2].mass + particles[p1].mass)) * ((dotProduct)/(pyth)) * (particles[p1].y - particles[p2].y));


    //angular solution
  /*var phy1 = -Math.atan2(particles[p2].y-particles[p1].y,particles[p2].x-particles[p1].x)
  var phy2 = -Math.atan2(particles[p1].y-particles[p2].y,particles[p1].x-particles[p2].x)
  //var phy1 = Math.atan((particles[p2].y-particles[p1].y)/(particles[p2].x-particles[p1].x))
  //var phy2 = Math.atan((particles[p1].y-particles[p2].y)/(particles[p1].x-particles[p2].x))
  //((particles[p1].elasticity+particles[p2].elasticity)/2)
  p1Force.x = -((p1Speed*Math.cos(particles[p1].getAngle()-phy1) * (particles[p1].mass-particles[p2].mass) + 2 * particles[p2].mass*p2Speed*Math.cos(particles[p2].getAngle()-phy1)) / (particles[p1].mass + particles[p2].mass)) * Math.cos(phy1)+p1Speed*Math.sin(particles[p1].getAngle()-phy1)*Math.cos(phy1+Math.PI/2);
  p1Force.y = -((p1Speed*Math.cos(particles[p1].getAngle()-phy1) * (particles[p1].mass-particles[p2].mass) + 2 * particles[p2].mass*p2Speed*Math.cos(particles[p2].getAngle()-phy1)) / (particles[p1].mass + particles[p2].mass)) * Math.sin(phy1)+p1Speed*Math.sin(particles[p1].getAngle()-phy1)*Math.sin(phy1+Math.PI/2);

  p2Force.x = ((p2Speed*Math.cos(particles[p2].getAngle()-phy2) * (particles[p2].mass-particles[p1].mass) + 2 * particles[p1].mass*p1Speed*Math.cos(particles[p1].getAngle()-phy2)) / (particles[p2].mass + particles[p1].mass)) * Math.cos(phy2)+p2Speed*Math.sin(particles[p2].getAngle()-phy2)*Math.cos(phy2+Math.PI/2);
  p2Force.y = ((p2Speed*Math.cos(particles[p2].getAngle()-phy2) * (particles[p2].mass-particles[p1].mass) + 2 * particles[p1].mass*p1Speed*Math.cos(particles[p1].getAngle()-phy2)) / (particles[p2].mass + particles[p1].mass)) * Math.sin(phy2)+p2Speed*Math.sin(particles[p2].getAngle()-phy2)*Math.sin(phy2+Math.PI/2);

   */
  particles[p1].addForce(new force(p1Force, "hard"));
  particles[p2].addForce(new force(p2Force, "hard"));

  //backtrack each particle so that they are proper distance away from eachother


    //2nd attempt based on position not velocity
    var diff = new vector(particles[p2].x-particles[p1].x,particles[p2].y-particles[p1].y);
    var h = pythagorean(diff);
    var offsetRatio = new vector(diff.x/h,diff.y/h);
    particles[p1].x -= ((particles[p1].radius + particles[p2].radius)-h) * offsetRatio.x + 1;
    particles[p1].y -= ((particles[p1].radius + particles[p2].radius)-h) * offsetRatio.y + 1;
    //console.log(pythagorean(new vector(particles[p2].x-particles[p1].x,particles[p2].y-particles[p1].y)));

    //particles[p1] = wallCollisionCheck(particles[i],boxWidth,boxHeight);

    //account for particles already calculated
    particles[p2].collidedParticles.push(p1);

    console.log("collided: " + p1 + " " + p2);

    /*
  var count = 0;
  while (particleCollisionCheck(particles[p1],particles[p2])){
    console.log(count += 1);
    var accuracy = 1;
    particles[p1].x -= particles[p1].velocity.x/accuracy;
    particles[p1].y -= particles[p1].velocity.y/accuracy;
    particles[p1] = wallCollisionCheck(particles[p1],boxWidth,boxHeight);

    particles[p2].x -= particles[p2].velocity.x/accuracy;
    particles[p2].y -= particles[p2].velocity.y/accuracy;
    particles[p2] = wallCollisionCheck(particles[p2],boxWidth,boxHeight);
  }*/
}