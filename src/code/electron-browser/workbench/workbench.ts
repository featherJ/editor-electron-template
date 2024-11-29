import { importDynamically } from 'base/dynamicImport';
import * as remote from "@electron/remote";
import { v4 } from 'uuid';
import './index.css';

console.log('👋 This message is being logged by "renderer.js", included via webpack');

class Workbench {
  constructor() {
    window.addEventListener('load', async () => {
      console.log('Window loaded, loading main content...',v4().toString());
      const p = document.createElement("p");
      p.append(`App Version: ${remote.app.getVersion()}`)
      document.body.appendChild(p)
      setTimeout(async () => {
        importDynamically("./workbench/workbench.esm").then(({ Workbench }) => {
          new Workbench();
        });
      }, 1000);

    });
  }
}
new Workbench();