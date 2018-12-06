export default class Binding {

  // Class takes in a snapshot as a string and an object of
  // substitutions to auto-replace in the broadcasted text.

  constructor(snapshot, flag) {
    this.snapshot = snapshot;
    this.flag = flag;
  }

  checkOp(op) {
    if (!Array.isArray(op)) throw Error('Op must be an array of components.');

    let last = null;
    for (let i = 0; i < op.length; i++) {
      const c = op[i];

      switch (typeof c) {
        case 'object':
          if (!(typeof c.d === 'number' && c.d > 0)) {
            throw Error('object components must be deletes of size > 0.');
          }
          break;
        case 'string':
          if (!(c.length > 0)) {
            throw Error('Cannot have an empty insert op.');
          }
          break;
        case 'number':
          if (!(c > 0)) {
            throw Error('Skip components must be greater than 0.');
          }
          if (typeof last === 'number') {
            throw Error('Adjacent skip components should be combined');
          }
          break;
      }
      last = c;
    }
    if (typeof last === 'number') {
      throw Error('Op has a trailing skip.');
    }
  }

  makeAppend = op => component => {
    if (!component || component.d === 0) {
      // Component is a no-op; ignore.
    } else if (op.length === 0) {
      op.push(component);
    } else if (typeof component === typeof op[op.length - 1]) {
      if (typeof component === 'object') {
        op[op.length - 1].d += component.d;
      } else {
        op[op.length - 1] += component;
      }
    } else {
      op.push(component);
    }
  };

  makeTake = op => {
    let index = 0;
    let offset = 0;

    const take = (n, indivisibleField) => {
      if (index === op.length) {
        return n === -1 ? null : n;
      }

      const c = op[index];
      let part;

      if (typeof c === 'number') {
        if (n === -1 || c - offset <= n) {
          part = c - offset;
          ++index;
          offset = 0;
          return part;
        } else {
          offset += n;
          return n;
        }
      } else if (typeof c === 'string') {
        if (n === -1 || indivisibleField === 'i' || c.length - offset <= n) {
          part = c.slice(offset);
          ++index;
          offset = 0;
          return part;
        } else {
          if (n === -1 || indivisibleField === 'd' || c.d - offset <= n) {
            part = {
              d: c.d - offset
            };
            ++index;
            offset = 0;
            return part;
          } else {
            offset += n;
            return {
              d: n
            };
          }
        }
      }
    };
  };

  // Trim any excess skips from the end of the operation.
  // There should only be at most one, because the operation was made with append.
  trim = op => {
    if (op.length > 0 && typeof op[op.length - 1] === 'number') {
      op.pop();
    }
    return op;
  };

  componentLength = c => typeof c === 'number' ? c : (c.length || c.d);

  applyOp(op) {
    if (typeof this.snapshot !== 'string') {
      throw Error('Snapshot should be a string.');
    }

    this.checkOp(op);

    const newDoc = [];

    for (let i = 0; i < op.length; i++) {
      const component = op[i];
      switch (typeof component) {
        case 'number':
          if (component > this.snapshot.length) {
            throw Error('the op is too long for this document.');
          }

          newDoc.push(this.snapshot.slice(0, component));
          this.snapshot = this.snapshot.slice(component);
          break;
        case 'string':
          newDoc.push(component);
          break;
        case 'object':
          this.snapshot = this.snapshot.slice(component.d);
          break;
      }
      return newDoc.join('') + this.snapshot;
    }
  }

  transform(op, otherOp, side) {
    if (side !== 'left' && side !== 'right') {
      throw Error(`Side (${side} must be "left" or "right".`);
    }

    this.checkOp(op);
    this.checkOp(otherOp);

    const newOp = [];

    const append = this.makeAppend(newOp);
    const [take, peek] = this.makeTake(op);

    for (let i = 0; i < otherOp.length; i++) {
      const component = otherOp[i];

      let length, chunk;

      switch (typeof component) {
        case 'number':
          length = component;

          while (length > 0) {
            chunk = this.take(length, 'i');
            append(chunk);

            if (typeof chunk !== 'string') {
              length -= this.componentLength(chunk);
            }
          }
          break;
        case 'string': // Insert.
          if (side === 'left') { // Left side should go first.
            append(this.take(-1));

            // The left insert should go first.
            if (typeof peek() === 'string') {
              append(this.take(-1));
            }
          }

          // Otherwise skip the inserted text.
          append(component.length);
          break;
        case 'object':
          while (length > 0) {
            chunk = take(length, 'i');
            switch (typeof chunk) {
              case 'number':
                length -= chunk;
                break;
              case 'object':
                // The delete is unnecessary now. Text has already been deleted.
                length -= chunk.d;
            }
          }
          break;
      }
    }

    let c;
    while ((c = take(-1))) {
      append(c);
    }

    return this.trim(newOp);
  }
};
