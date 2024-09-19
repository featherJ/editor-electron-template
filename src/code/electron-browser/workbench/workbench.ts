import { importDynamically } from 'base/dynamicImport';
import './index.css';

console.log('👋 This message is being logged by "renderer.js", included via webpack');

class Workbench {
  constructor() {
    window.addEventListener('load', async () => {
      console.log('Window loaded, loading main content...');

      setTimeout(async () => {
        const packageName = "./workbench/workbench.esm.js";
        importDynamically(packageName).then(({ Workbench }) => {
          new Workbench();
        });
      }, 1000);

    });
  }
}
new Workbench();