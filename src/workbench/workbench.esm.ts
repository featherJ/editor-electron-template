import { v4 } from "uuid";
import * as fs from "fs";

export class Workbench{
    constructor(){
        const p = document.createElement("p");
        p.append(`I'm real workbench, test uuid:${v4().toString()}`)
        document.body.appendChild(p)
        console.log(fs)
    }
}