import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Binding from './binding';

export default class ShareDBBinding extends Component {
  static propTypes = {
    cssClass: PropTypes.string,
    doc: PropTypes.object,
    elementType: PropTypes.string,
    onLoaded: PropTypes.func,
    style: PropTypes.object,
    subs: PropTypes.object
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
      console.log(doc.data);
      this.binding = new Binding(doc.data);

      this.setState({
        text: this.binding.snapshot
      }, onLoaded);
    });

    doc.on('del', () => {
      doc.destroy();
      doc.unsubscribe();
    });

    doc.on('op', op => {
      this.updateField(op);
    });
  }

  updateField(op) {
    setTimeout(() => {
      this.setState({
        text: this.binding.applyOp(op)
      });
    }, 0);
  }

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
