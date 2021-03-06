# sharedb-react-textbinding
Stanley Sakai

To do: add implementation details.

This component refactors ShareDB DOM bindings for use with React. It listens to a ShareDB subscribed document and funnels updates over WebSockets to and from component state rather than relying on DOM bindings and listeners.

> React component that binds to ShareDB send and receive events.

[![NPM](https://img.shields.io/npm/v/sharedb-react-textbinding.svg)](https://www.npmjs.com/package/sharedb-react-textbinding) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm install --save sharedb-react-textbinding
```

## Usage

```jsx
import React, { Component } from 'react'

import MyComponent from 'sharedb-react-textbinding'

class Example extends Component {
  render () {
    return (
      <MyComponent />
    )
  }
}
```

## License

MIT © [stanographer](https://github.com/stanographer)
# sharedb-react-textbinding
