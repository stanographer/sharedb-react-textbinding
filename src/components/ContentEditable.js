import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class ContentEditable extends Component {
  static propTypes = {
    text: PropTypes.string
  };

  render() {
    const {
      text
    } = this.props;

    return (
      <div>
        {text}
      </div>
    );
  }
}
