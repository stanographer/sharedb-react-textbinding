const TextDiffBinding = require('text-diff-binding');

module.exports = ReactStringBinding;

function ReactStringBinding(snapshot, doc, path) {
  const element = {
    value: snapshot
  };

  TextDiffBinding.call(this, element);
  this.doc = doc;
  this.path = path || [];
}

ReactStringBinding.prototype = Object.create(TextDiffBinding.prototype);
ReactStringBinding.prototype.constructor = ReactStringBinding;

ReactStringBinding.prototype.destroy = function() {
  this.detachElement();
  this.detachDoc();
};

ReactStringBinding.prototype.attachDoc = function() {
  var binding = this;
  this._opListener = function(op, source) {
    binding._onOp(op, source);
  };
  this.doc.on('op', this._opListener);
};

ReactStringBinding.prototype._onOp = function(op, source) {
  if (source === this) return;
  if (op.length === 0) return;
  if (op.length > 1) {
    throw new Error('Op with multiple components emitted');
  }
  console.log(op);
  var component = op[0];
  if (isSubpath(this.path, component.p)) {
    this._parseInsertOp(component);
    this._parseRemoveOp(component);
  } else if (isSubpath(component.p, this.path)) {
    this._parseParentOp();
  }
};

ReactStringBinding.prototype._parseInsertOp = function(component) {
  if (!component.si) return;
  var index = component.p[component.p.length - 2];
  var length = component.si.length;
  this.onInsert(index, length);
};

ReactStringBinding.prototype._parseRemoveOp = function(component) {
  if (!component.sd) return;
  var index = component.p[component.p.length - 1];
  var length = component.sd.length;
  this.onRemove(index, length);
};

ReactStringBinding.prototype._parseParentOp = function() {
  this.update();
};

ReactStringBinding.prototype._get = function() {
  var value = this.doc.data;
  for (var i = 0; i < this.path.length; i++) {
    var segment = this.path[i];
    value = value[segment];
  }
  return value;
};

ReactStringBinding.prototype._insert = function(index, text) {
  var path = this.path.concat(index);
  var op = { p: path, si: text };
  this.doc.submitOp(op, { source: this });
};

ReactStringBinding.prototype._remove = function(index, text) {
  var path = this.path.concat(index);
  var op = { p: path, sd: text };
  this.doc.submitOp(op, { source: this });
};

function isSubpath(path, testPath) {
  for (var i = 0; i < path.length; i++) {
    if (testPath[i] !== path[i]) return false;
  }
  return true;
}
