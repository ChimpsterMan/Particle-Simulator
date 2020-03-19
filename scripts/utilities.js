function vector(x,y){
  this.x = x;
  this.y = y;
}

function vAdd(vector1, vector2){
  return new vector(vector1.x + vector2.x, vector1.y + vector2.y);
}

function pythagorean(v1){
    return Math.sqrt(v1.x*v1.x + v1.y*v1.y);
}