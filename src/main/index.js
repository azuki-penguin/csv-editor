import { app, BrowserWindow, dialog, ipcMain, Menu } from 'electron'
import fs from 'fs'

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

function openFile() {
  if (mainWindow === null) {
    createWindow()
  }

  dialog.showOpenDialog(mainWindow, {
    properties: [ 'openFile' ]
  }, files => {
    if (files) {
      let file_info = {
        bytes: fs.readFileSync(files[0]),
        path:  files[0]
      }

      mainWindow.webContents.send('send-file-contents', file_info)
    }
  })
}

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    height: 563,
    useContentSize: true,
    width: 1000
  })

  mainWindow.loadURL(winURL)
  Menu.setApplicationMenu(Menu.buildFromTemplate([
    {
      label: 'csv-editor',
      submenu: [
        {
          label: 'Quit',
          accelerator: 'CmdOrCtrl+Q',
          click() { app.quit() }
        }
      ]
    },

    {
      label: 'File',
      submenu: [
        {
          label: 'Open',
          accelerator: 'CmdOrCtrl+O',
          click() { openFile() }
        },

        {
          label: 'Save',
          accelerator: 'CmdOrCtrl+S',
          click() {
            mainWindow.webContents.send('save-file')
            ipcMain.on('save-data', (e, file) => {
              let writer = fs.createWriteStream(file.path)
              writer.write(file.bytes)
            })
          }
        },

        {
          label: 'Close',
          accelerator: 'CmdOrCtrl+W',
          click() {
            if (mainWindow != null) {
              mainWindow.close()
            }
          }
        }
      ]
    }
  ]))

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})
