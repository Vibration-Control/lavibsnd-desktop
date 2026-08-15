module.exports = {
    packagerConfig: {
        name: "LAVIBS ND",
        executableName: "LAVIBS_ND",
        asar: true,

        extraResource: [
            "../dist/backend",
            "../dist/frontend"
        ]
    },

    makers: [
        {
            name: "@electron-forge/maker-squirrel",
            config: {
                name: "lavibsnd",
                authors: "Vibration Control",
                description: "LAVIBS ND"
            }
        }
    ]
};