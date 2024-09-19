/**
 * 同步require
 * @param path 
 * @returns 
 */
export function requireDynamically(path: string): any {
    path = path.split('\\').join('/');
    return eval(`require('${path}');`);
}

/**
 * 异步import
 * @param path 
 * @returns 
 */
export function importDynamically(path: string): Promise<{ default: any;[key: string]: any }> {
    path = path.split('\\').join('/');
    if(path.slice(path.length-3).toLocaleLowerCase() != ".js"){
        path += ".js"
    }
    return eval(`import('${path}');`);
}


