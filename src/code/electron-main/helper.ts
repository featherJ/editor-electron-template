import { join } from 'path'
import fs from 'fs'
import { app } from 'electron'
const dataPath = join(app.getPath('userData'), 'data.json')

export function getLocalData(key?:string) {
  if (!fs.existsSync(dataPath)) {
    fs.writeFileSync(dataPath, JSON.stringify({}), { encoding: 'utf-8' })
  }
  const data = fs.readFileSync(dataPath, { encoding: 'utf-8' })
  const json = JSON.parse(data)
  return key ? json[key] : json
}

export function setLocalData(key:string, value:any) {
  const data = fs.readFileSync(dataPath, { encoding: 'utf-8' })
  const json = JSON.parse(data)
  json[key] = value
  fs.writeFileSync(dataPath, JSON.stringify(json), { encoding: 'utf-8' })
}

export async function sleep(ms:number) {
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      resolve(void 0)
      clearTimeout(timer)
    }, ms)
  })
}