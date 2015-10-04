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


var Candle = function(data) {
	this.name = data.name;

	this.burnTime = data.burnTime || 0;

	if (window.user) {
		window.user.candles[this.name] = this;
	}
}

Candle.prototype.formattedBurnTime = function() {
	return this.formattedTime_(this.burnTime);
}

Candle.prototype.formattedTime_ = function(seconds) {
	var hours = 0;
	var minutes = 0;

	if (seconds > (60 * 60)) {
		hours = (seconds - (seconds % (60 * 60))) / (60 * 60);
		seconds = seconds % (60 * 60)
	}
	if (seconds > 60) {
		minutes = (seconds - (seconds % 60)) / 60
		seconds = seconds % 60
	}
	var fmt = '';
	if (hours) {
		fmt += (hours + ' hours');
	}
	if (minutes) {
		if (hours) {
			fmt += ', ';
		}
		fmt += (minutes + ' minutes');
	}
	if (seconds) {
		if (minutes) {
			fmt += ' and ';
		}
		fmt += (Math.round(seconds) + ' seconds');
	}
	return fmt;
}

Candle.prototype.howMuch = function() {
	return 100 - (this.burnTime / (60 * 60 * 6));
}

Candle.prototype.remainingTime = function() {
	return this.formattedTime_((60 * 60 * 6) - this.burnTime);
}

Candle.prototype.export = function() {
	return {
		name: this.name,
		burnTime: this.burnTime
	}
}

window.user = new User();