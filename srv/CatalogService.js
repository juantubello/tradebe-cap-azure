const cds = require("@sap/cds");
const dotenv = require('dotenv')
const uploader = require('./modules/azure');
dotenv.config()

async function sendImage(req) {
    let base64 = req.data.base64
    let folder = req.data.folder
    let filename = req.data.filename

    try {
        const response = await uploader.sendImage(base64, folder, filename);
        req.data.response = response
        req.data.base64 = ""
        return req.data
    }
    catch (err) {
        throw new Error(err);
    }
}

module.exports = cds.service.impl(async function () {
    const { azure } = this.entities;
    this.on("INSERT", azure, sendImage);
});
