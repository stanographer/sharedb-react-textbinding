export default class Binding {

  // Class takes in a snapshot as a string and an object of
  // substitutions to auto-replace in the broadcasted text.

  constructor(snapshot, subs) {
    this.snapshot = snapshot;
    this.subs = subs;
  }

  // Methods to update state text whenever ops are received
  // through WebSockets.

  applyOp(op) {
    const fields = {
      position: 0,
      insertString: '',
      delNum: 0
    };

    console.log(op);

    // Loops through the different fields and parses out the events
    // and creates a fields object which is then parsed by update().
    for (let i = 0; i < op.length; i++) {
      Binding.update(fields, op[i]);
    }

    if (fields.delNum > 0) {
      // Delete
      this.onRemove(fields.position, fields.delNum);
    }

    if (fields.insertString.length > 0) {
      // Insert
      this.onInsert(fields.position, fields.insertString);
    }

    return this.snapshot;
  }

  // Update parses the fields object.
  static update(fields, value) {
    if (typeof value === 'number') {
      fields.position = value;
    } else if (typeof value === 'string') {
      fields.insertString = value;
    } else if (typeof value === 'object' && value.d !== undefined) {
      fields.delNum = value.d;
    }
  };

  // Calculates the location to insert new characters by dividing the text
  // in half, one before the location of the op, and after. Then joins them together.
  onInsert(position, text) {
    const previous = this.snapshot.replace(/\r\n/g, '\n');
    // Implement subs.
    this.replaceText(previous.slice(0, position) + text + previous.slice(position));
  };

  // Calculates the location to remove characters by dividing the text.
  onRemove(position, length) {
    const previous = this.snapshot.replace(/\r\n/g, '\n');
    this.replaceText(previous.slice(0, position) + previous.slice(position + length));
  };

  // Function overwrites the snapshot with the newly formed text.
  replaceText(newText) {
    this.snapshot = newText;
  };
};
