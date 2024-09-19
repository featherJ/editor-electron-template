import { importDynamically, requireDynamically } from 'base/dynamicImport';
import './index.css';
import { v4 } from 'uuid';

console.log('👋 This message is being logged by "renderer.js", included via webpack');

class Workbench {
  constructor() {
    window.addEventListener('load', async () => {
      console.log('Window loaded, loading main content...',v4().toString());

      setTimeout(async () => {
        const packageName = "./workbench/workbench.esm";
        // const x = requireDynamically(packageName)
        // console.log("fuck1",x);
        // importDynamically(packageName).then(({ Workbench }) => {
        //   new Workbench();
        // });
        const time = new Date().getTime();
        importDynamically(packageName).then(data => {
          console.log(new Date().getTime()-time);
          console.log("fuck2",data);
        });
        // const time = new Date().getTime();
        // asyncRequire(packageName).then(data=>{
        //   console.log(new Date().getTime()-time);
        //   new data.Workbench();
        //   console.log(data);
          //module has been exported
        // });

      }, 1000);

    });
  }
}
new Workbench();