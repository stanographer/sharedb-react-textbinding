import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Binding from './binding';

export default class ShareDBBinding extends Component {
  static propTypes = {
    cssClass: PropTypes.string,
    cols: PropTypes.number,
    doc: PropTypes.object,
    elementType: PropTypes.string,
    onLoaded: PropTypes.func,
    rows: PropTypes.number,
    style: PropTypes.object,
    flag: PropTypes.string
  };

  constructor(props) {
    super(props);

    this.state = {
      text: '',
      selectionStart: 0,
      selectionEnd: 0
    };

    // this.handleTextOnChange = this.handleTextOnChange.bind(this);
    // this.preserveCursor = this.preserveCursor.bind(this);
    // this.setCursor = this.setCursor.bind(this);
  }

  componentWillMount() {
    this.subscribe(this.props);
  }

  componentWillUnmount() {
    this.props.doc.removeListener();
    this.props.doc.unsubscribe();
    this.props.doc.destroy();
    this.binding = null;
  }

  componentDidMount() {
    if (this.props.elementType === 'textarea') {
      this.focusTextInput();
    }
  }

  // componentDidUpdate() {
  //   if (this.props.elementType === 'textarea') {
  //     this.setCursor();
  //   }
  // }

  // handleTextOnChange(e) {
  //   const { doc } = this.props;
  //   const change = this.binding.applyLocalChange(doc, this.binding.snapshot, e.target.value);
  //   this.setState({
  //     text: this.binding.snapshot
  //   });
  //   this.preserveCursor();
  // }

  // preserveCursor() {
  //    this.setState({
  //     selectionStart: this.sharedTextArea.current.selectionStart
  //   });
  // }
  //
  // setCursor() {
  //   this.sharedTextArea.current.setSelectionRange(
  //     this.state.selectionStart,
  //     this.state.selectionStart
  //   );
  // }

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
      this.binding = new Binding(doc.data, this.props.flag);

      this.setState({
        text: this.binding.snapshot
      }, onLoaded);
    });

    doc.on('del', () => {
      doc.removeListener();
      doc.destroy();
      doc.unsubscribe();
    });

    doc.on('op', op => {
      setTimeout(() => {
        this.updateField(op);
      });
    }, 0);
  }

  updateField(op) {
    this.setState({
      text: this.binding.applyOp(op)
    });
  }

  render() {
    const {
      cols,
      cssClass,
      doc,
      elementType,
      rows,
      style
    } = this.props;

    const { text } = this.state;

    const element = elementType === 'div'
      ? <div
        className={cssClass || ''}
        style={style || ''}>
        {text}
      </div>
      : <textarea
        ref={this.sharedTextArea}
        className={cssClass || ''}
        style={style || ''}
        defaultValue={text}
        // onChange={e => this.handleTextOnChange(e)}
        cols={cols || 100}
        rows={rows || 10}
      />;
    return (
      element
    );
  }
}
