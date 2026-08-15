const {
    app,
    BrowserWindow,
    dialog
} = require("electron");

const { spawn } = require("child_process");
const path = require("path");

let backendProcess = null;
let mainWindow = null;


function getBackendPath() {
    if (app.isPackaged) {
        return path.join(
            process.resourcesPath,
            "backend",
            "LAVIBS_ND_Backend.exe"
        );
    }

    return path.join(
        __dirname,
        "..",
        "dist",
        "backend",
        "LAVIBS_ND_Backend.exe"
    );
}


function getFrontendPath() {
    if (app.isPackaged) {
        return path.join(
            process.resourcesPath,
            "frontend",
            "index.html"
        );
    }

    return path.join(
        __dirname,
        "..",
        "dist",
        "frontend",
        "index.html"
    );
}


function startBackend() {

    const backendPath = getBackendPath();

    console.log("Starting backend:");
    console.log(backendPath);

    backendProcess = spawn(
        backendPath,
        [],
        {
            cwd: path.dirname(backendPath),
            windowsHide: true
        }
    );

    backendProcess.stdout?.on("data", data => {
        console.log(`Backend: ${data}`);
    });

    backendProcess.stderr?.on("data", data => {
        console.error(`Backend error: ${data}`);
    });

    backendProcess.on("error", error => {

        console.error(
            "Could not start backend:",
            error
        );

        dialog.showErrorBox(
            "LAVIBS ND",
            `Could not start the backend.\n\n${error.message}`
        );
    });

    backendProcess.on("exit", code => {

        console.log(
            `Backend exited with code ${code}`
        );
    });
}


function createWindow() {

    const frontendPath = getFrontendPath();

    console.log("Loading frontend:");
    console.log(frontendPath);

    mainWindow = new BrowserWindow({

        width: 1400,
        height: 900,

        minWidth: 1000,
        minHeight: 700,

        webPreferences: {
            contextIsolation: true,
            nodeIntegration: false
        }
    });

    mainWindow.loadFile(frontendPath);

    mainWindow.webContents.on(
        "did-fail-load",
        (event, errorCode, errorDescription, validatedURL) => {

            console.error(
                "Frontend failed to load:",
                errorCode,
                errorDescription,
                validatedURL
            );

            dialog.showErrorBox(
                "LAVIBS ND",
                `The frontend failed to load.\n\n${errorDescription}\n\n${validatedURL}`
            );
        }
    );

    mainWindow.webContents.on(
        "console-message",
        (event, level, message, line, sourceId) => {

            console.log(
                `Renderer console: ${message}`
            );
        }
    );

    mainWindow.on("closed", () => {
        mainWindow = null;
    });
}


app.whenReady().then(() => {

    startBackend();

    setTimeout(() => {
        createWindow();
    }, 2000);
});


app.on("before-quit", () => {

    if (backendProcess) {
        backendProcess.kill();
        backendProcess = null;
    }
});


app.on("window-all-closed", () => {

    if (process.platform !== "darwin") {
        app.quit();
    }
});