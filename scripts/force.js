function force(vector, type = "standard"){
  this.vector = vector;
  this.type = type;
}

function calculateForce(forces, type = "standard"){
  var force = new vector(0,0);
  for (var i = 0; i < forces.length; i++){
    if (forces[i].type == type){
      force = vAdd(force, forces[i].vector);
    }
  }

  //force.x *= deltaTime * 0.001;
  //force.y *= deltaTime * 0.001;

  return force;
}