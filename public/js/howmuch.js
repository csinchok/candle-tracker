var flames = [];
var debug = window.location.search.indexOf('debug') !== 0;
var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');
context.fillStyle = "#FF0000";


var tracker = new tracking.CandleTracker();

tracker.on('track', function(event) {

  flames.forEach(function(flame){
      flame.missing += 1;
  })

  for(var i=0;i<event.data.length;i++) {
    var newFlame = new Flame(event.data[i]);

    var found = false;
    flames.forEach(function(flame){
      if (flame.overlaps(newFlame)) {
        flame.rect = newFlame.rect;
        flame.missing = 0;
        flame.present++;
        found = true;
      }
    });
    if(!found) {
      flames.push(newFlame);
    }
  }

  if (debug) {
    flames.forEach(function(flame) {
      if(flame.present > 5) {
        context.strokeRect(flame.rect.x, flame.rect.y, flame.rect.width, flame.rect.height);
      }
    });
    if (flames.length === 0) {
      document.getElementsByTagName('body')[0].style.backgroundColor = 'red';
    } else {
      document.getElementsByTagName('body')[0].style.backgroundColor = 'white';
    }
  }

  var i = flames.length;
  while(i--){
    if (flames[i].missing > 10) {
      flames.splice(i, 1);
    }
  }

});

tracking.track('#candle', tracker, {camera: true});