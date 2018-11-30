import React, { Component } from 'react';
import PropTypes from 'prop-types';
// import TextArea from './components/TextArea';
// import ContentEditable from './components/ContentEditable';

export default class ShareDBBinding extends Component {
  static propTypes = {
    cssClass: PropTypes.string,
    doc: PropTypes.object,
    elementType: PropTypes.string,
    onLoaded: PropTypes.func,
    style: PropTypes.object
  };

  constructor(props) {
    super(props);

    this.state = {
      text: ''
    };
  }

  componentWillMount() {
    this.subscribe(this.props);
  }

  componentWillUnmount() {
    this.props.doc.unsubscribe();
    this.props.doc.destroy();
  }

  subscribe(props) {
    const { doc, onLoaded } = props;

    doc.subscribe(err => {
      if (err) console.log(err);
      if (doc.type === null) {
        this.setState({
          error: 'No document with that user and event combination exists!'
        });
      }
    });

    doc.on('load', () => {
      this.setState({
        text: doc.data
      }, () => {
        this.snapshot = doc.data;
        onLoaded();
      });
    });

    doc.on('del', () => {
      doc.destroy();
      doc.unsubscribe();
    });

    doc.on('op', (op) => {
      this.onOp(op);
    });
  }

  onOp(op) {
    const fields = { pos: 0, insertStr: '', delNum: 0 };

    for (let i = 0; i < op.length; i++) {
      this._updateField(fields, op[i]);
    }

    if (fields.delNum > 0) {
      // delete
      this.onRemove(fields.pos, fields.delNum);
    }

    if (fields.insertStr.length > 0) {
      // insert
      this.onInsert(fields.pos, fields.insertStr);
    }

    this.setState({
      text: this.snapshot
    });
  }

  _updateField(fields, value) {
    if (typeof value === 'number') {
      fields.pos = value;
    } else if (typeof value === 'string') {
      fields.insertStr = value;
    } else if (typeof value === 'object' && value.d !== undefined) {
      fields.delNum = value.d;
    }
  };

  onInsert(position, text) {
    const previous = this.snapshot.replace(/\r\n/g, '\n');
    this.replaceText(previous.slice(0, position) + text + previous.slice(position));
  };

  replaceText(newText) {
    this.snapshot = newText;
  };

  onRemove(position, length) {
    const previous = this.snapshot.replace(/\r\n/g, '\n');
    this.replaceText(previous.slice(0, position) + previous.slice(position + length));
  };

  render() {
    const {
      cssClass,
      elementType,
      style
    } = this.props;

    const { text } = this.state;

    const element = elementType === 'contentEditable'
      ? <div
        className={cssClass || ''}
        style={style || ''}>
        {text}
      </div>
      : <textarea
        value={text}
        cols={100}
        rows={100} />;

    return (
      element
    );
  }
}
