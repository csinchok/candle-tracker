var User = function() {
	this.candles = {};

	var data = window.localStorage.getItem('user');

	if (data) {
		data = JSON.parse(data);
		for(var name in data.candles) {
			this.candles[name] = new Candle(data.candles[name]);
		}
	}
}


User.prototype.save = function() {
	var data = {
		candles: {}
	};
	for(var name in this.candles) {
		data.candles[name] = this.candles[name].export();
	}

	console.log(JSON.stringify(data));

	window.localStorage.setItem('user', JSON.stringify(data));
}


var Session = function(data) {
	this.candleName = data.candleName;

	this.startTime = data.startTime;
	this.endTime = data.endTime;
}

Session.prototype.start = function(candleName) {
	this.startTime = Date.now();
	this.candleName = candleName;
}

Session.prototype.stop = function() {
	this.endTime = Date.now();
	window.user.candles[this.candleName].sessions.push(this.export());
}

Session.prototype.export = function() {
	return {
		startTime: this.startTime,
		candleName: this.candleName,
		endTime: this.endTime
	}
}

var Candle = function(data) {
	this.name = data.name;

	this.sessions = [];

	if (data.sessions) {
		data.sessions.forEach(function(sessionData) {
			this.sessions.push(new Session(sessionData))
		});
	}

	if (window.user) {
		window.user.candles[this.name] = this;
	}
}

Candle.prototype.getBurnTime = function() {
	var time = 0;
	this.sessions.forEach(function(session){
		time += (session.endTime - session.startTime);
	});
	return time;
}

Candle.prototype.export = function() {
	var sessionData = [];
	this.sessions.forEach(function(session){
		sessionData.push(session.export())
	})
	return {
		name: this.name,
		sessions: this.sessions
	}
}

window.user = new User();