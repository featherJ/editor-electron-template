import { importDynamically, requireDynamically } from 'base/dynamicImport';
import './index.css';
import { v4 } from 'uuid';

console.log('👋 This message is being logged by "renderer.js", included via webpack');

class Workbench {
  constructor() {
    window.addEventListener('load', async () => {
      console.log('Window loaded, loading main content...',v4().toString());

      setTimeout(async () => {
        importDynamically("./workbench/workbench.esm").then(({ Workbench }) => {
          new Workbench();
        });
      }, 1000);

    });
  }
}
new Workbench();