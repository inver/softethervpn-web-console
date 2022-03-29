import React from "react";
import ReactDOM from "react-dom";
import axe from '@axe-core/react';
import App from '@app/index';

if (process.env.NODE_ENV !== "production") {
  const config = {
    rules: [
      {
        id: 'color-contrast',
        enabled: false
      }
    ],
    disableDeduplicate: true
  };
  // eslint-disable-next-line @typescript-eslint/no-var-requires, no-undef
  axe(React, ReactDOM, 1000, config);
}

ReactDOM.render(<App />, document.getElementById("root") as HTMLElement);
