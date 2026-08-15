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

    console.log("Starting backend:", backendPath);

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
        console.error(`Backend: ${data}`);
    });

    backendProcess.on("error", error => {
        console.error("Backend failed to start:", error);

        dialog.showErrorBox(
            "LAVIBS ND",
            "The LAVIBS ND backend could not be started."
        );
    });

    backendProcess.on("exit", (code) => {
        console.log(`Backend exited with code ${code}`);
    });
}

function createWindow() {
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

    mainWindow.loadFile(getFrontendPath());

    mainWindow.on("closed", () => {
        mainWindow = null;
    });
}

app.whenReady().then(() => {

    startBackend();

    // Give Flask time to initialize.
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