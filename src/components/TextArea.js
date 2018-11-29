import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class TextArea extends Component {
  static propTypes = {
    text: PropTypes.string
  };

  render() {
    const {
      text
    } = this.props;

    return (
      <textarea
        value={text}
        cols={100}
        rows={100} />
    );
  }
}
