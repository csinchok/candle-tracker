var HowMuch = function() {
  this.flames = [];
  this.debug = window.location.search.indexOf('debug') > 0;

  this.canvas = document.getElementById('canvas');
  this.context = canvas.getContext('2d');

  this.candle = null;
  this.started = false;
  this.lit = false;

  this.lastFrame = Date.now();

  this.missingTime = 0;

  var self = this;

  this.tracker = new tracking.CandleTracker();
  this.tracker.on('track', function(event) {self.ontrack(event)});

  this.statEls = {
    percentage: document.querySelectorAll('.percentage')[0],
    burnTime: document.querySelectorAll('.burn-time')[0],
    remainingTime: document.querySelectorAll('.remaining-time')[0]
  }
}

HowMuch.prototype.currentCandles = function() {
  return this.flames.filter(function(flame) {
    return flame.isCandle;
  })
}

HowMuch.prototype.stolen = function() {
  
  var overlayEl = document.querySelectorAll('.camera-window .overlay')[0];
  overlayEl.style.display = 'block';

  var overlayTitleEl = document.querySelectorAll('.camera-window .overlay > h3')[0];
  overlayTitleEl.innerHTML = 'Candle has been stolen!';
  overlayTitleEl.style.color = '#DB524B';

  document.querySelectorAll('.camera-window video')[0].style.display = 'none';

  var stopButton = document.querySelectorAll('.stop-candle')[0];
  var newSessionButton = document.querySelectorAll('.new-session')[0];
  stopButton.style.display = 'none';
  newSessionButton.style.display = 'block';

  window.user.candles[this.candle.name] = this.candle
  window.user.save()

  var audio = new Audio('/sounds/siren.wav');
  audio.play()
  audio.onload = function() {
    this.play()
  }

  this.started = null;
  this.candle = null;
}

HowMuch.prototype.ontrack = function(event) {
  var self = this;

  if (this.missingTime > 7 && this.lit) {
    this.stolen();
  }

  this.flames.forEach(function(flame){
    flame.missing += 1;
  });

  for(var i=0;i<event.data.length;i++) {
    var newFlame = new Flame(event.data[i]);

    var found = false;
    this.flames.forEach(function(flame){
      if (flame.overlaps(newFlame)) {
        flame.rect = newFlame.rect;
        flame.missing = 0;
        flame.present++;
        found = true;

        if (self.started && flame.isCandle) {
          self.candle.burnTime += (Date.now() - self.lastFrame) / 1000;

          self.statEls.percentage.innerHTML = self.candle.howMuch().toFixed(5) + '%';
          self.statEls.burnTime.innerHTML = self.candle.formattedBurnTime();
          self.statEls.remainingTime.innerHTML = self.candle.remainingTime();
        }
      }
    });
    if(!found) {
      if (this.started && this.candle && this.currentCandles().length === 0) {
        newFlame.isCandle = true;  // Must be a new candle!
        this.lit = true;
      }
      this.flames.push(newFlame);
    }
  }

  if (this.debug) {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.flames.forEach(function(flame) {
      if(flame.present > 5) {
        self.context.strokeRect(flame.rect.x, flame.rect.y, flame.rect.width, flame.rect.height);
      }
    });
  }

  var overlayEl = document.querySelectorAll('.camera-window .overlay')[0];

  if (this.currentCandles().length === 0) {
    overlayEl.style.display = 'block';
    if (this.started) {
      this.missingTime += ((Date.now() - this.lastFrame) / 1000);
    }
  } else if (this.started) {
    overlayEl.style.display = 'none';
    this.missingTime = 0;
  }

  var i = this.flames.length;
  while(i--){
    if (this.flames[i].missing > 10) {
      this.flames.splice(i, 1);
    }
  }
  
  var setupButton = document.querySelectorAll('.camera-window .overlay > button')[0];

  if (!self.started && self.candle) {
    if (this.flames.length > 1) {
      setupButton.style.display = 'block';
      setupButton.disabled = true;
      setupButton.innerHTML = 'It is not dark enough for candles';
    } else if (setupButton.disabled) {
      setupButton.style.display = 'block';
      setupButton.disabled = false;
      setupButton.innerHTML = 'I have set it up';
    }
  }


  this.lastFrame = Date.now();
}

HowMuch.prototype.init = function() {
  var self = this;

  // Populate the list...
  var candleList = document.querySelectorAll('.candle-list')[0];

  var orLi = candleList.querySelectorAll('.or')[0];

  for (var name in window.user.candles) {
    var candle = window.user.candles[name];
    var el = document.createElement('li');
    el.innerHTML = '<button class="btn candle-btn" data-name="' + candle.name + '">"' + name + '" <span>(' + candle.howMuch().toFixed(1) + '%)</span></button>';

    el.children[0].onclick = function() {
      var c = user.candles[this.dataset.name]
      self.watch(c);
    }

    candleList.insertBefore(el, orLi);
  }

  var addButton = document.querySelectorAll('.candle-list .add button')[0];
  var colorEl = document.querySelectorAll('.candle-list .color select')[0];
  var nameEl = document.querySelectorAll('.candle-list .name input')[0];
  addButton.onclick = function() {
    var color = colorEl.value;
    var name = nameEl.value;

    if (color !== '-- Select Color --' && name) {
      var newCandle = new Candle({
        'name': color + ' ' + name
      });

      self.watch(newCandle);
    }
  }

  var overlayEl = document.querySelectorAll('.camera-window .overlay > h3')[0];
  var setupButton = document.querySelectorAll('.camera-window .overlay > button')[0];
  setupButton.onclick = function() {
    this.style.display = 'none';
    self.started = true;
    overlayEl.innerHTML = 'Please Light Candle On Fire';
  }

}

HowMuch.prototype.watch = function(candle) {
  var self = this;
  tracking.track('#candle', this.tracker, {camera: true});
  self.lastFrame = Date.now();
  this.candle = candle;

  // Setup the candle deets
  var candleNameEl = document.querySelectorAll('.camera-window .candle-name')[0];
  candleNameEl.innerHTML = candle.name;

  var candleWindow = document.querySelectorAll('.candle-window')[0];
  candleWindow.style.display = 'none';

  var cameraWindow = document.querySelectorAll('.camera-window')[0];
  cameraWindow.style.display = 'block';

  var stopButton = document.querySelectorAll('.stop-candle')[0];
  var newSessionButton = document.querySelectorAll('.new-session')[0];
  stopButton.onclick = function() {
    window.user.candles[self.candle.name] = self.candle
    window.user.save()

    var overlayEl = document.querySelectorAll('.camera-window .overlay')[0];
    overlayEl.style.display = 'block';
    var overlayTitleEl = document.querySelectorAll('.camera-window .overlay > h3')[0];
    overlayTitleEl.innerHTML = 'Candle is resting';
    self.candle = null;
    self.started = false;

    stopButton.style.display = 'none';
    newSessionButton.style.display = 'block';
  }

  self.statEls.percentage.innerHTML = self.candle.howMuch().toFixed(5) + '%';
  self.statEls.burnTime.innerHTML = self.candle.formattedBurnTime();
  self.statEls.remainingTime.innerHTML = self.candle.remainingTime();
}

HowMuch.prototype.stop = function() {
  this.candle = null;
}

window.howmuch = new HowMuch();
howmuch.init();

// var flames = [];
// var debug = window.location.search.indexOf('debug') > 0;
// var canvas = document.getElementById('canvas');
// var context = canvas.getContext('2d');
// context.fillStyle = "#FF0000";


// var tracker = new tracking.CandleTracker();



