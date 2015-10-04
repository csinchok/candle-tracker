var Flame = function (rect, isCandle) {
  this.rect = rect;
  this.missing = 0;
  this.present = 0;

  if (isCandle) {
    this.isCandle = true;
  } else {
    this.isCandle = false;
  }
};

Flame.prototype.overlaps = function(flame, cutoff) {
  cutoff = cutoff || .75;

  if (this.rect.x + (this.rect.width * cutoff) < flame.rect.x) {
    return false;
  }

  if (flame.rect.x + (flame.rect.width * cutoff) < this.rect.x) {
    return false;
  }

  if (this.rect.y + (this.rect.height * cutoff) < flame.rect.y) {
    return false;
  }

  if (flame.rect.y + (flame.rect.height * cutoff) < this.rect.y) {
    return false;
  }

  return true;
};