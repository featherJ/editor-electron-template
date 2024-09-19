import { v4 } from "uuid";
import * as fs from "fs";

export class Workbench{
    constructor(){
        document.body.append(`<div>I'm real workbench, test uuid:${v4().toString()}<div>`);
        console.log(fs)
    }
}