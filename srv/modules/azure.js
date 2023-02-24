const dotenv = require('dotenv')
const fs = require('fs');
const okStatuses = [200, 201]
const FILE_DELETE_ERROR = "The file was uploaded sucessfully, but there was an error trying to delete the file from the root folder of the service"
const UPLOADED_MESSAGE = "File Uploaded!"

dotenv.config();

module.exports = {

    base64ToBuffer(base64, filename) {
        const Stream = require('stream');
        imgBuffer = Buffer.from(base64, 'base64');

        let s = new Stream.Readable();
        s.push(imgBuffer);
        s.push(null);
        s.pipe(fs.createWriteStream(filename));
        return s;
    },

    async sendImageToAzure(stream, folder, filename) {
        const { BlockBlobClient } = require('@azure/storage-blob'),
            azureStorageConnectionString = process.env.CONNECTION,
            containerName = process.env.CONTAINER + folder,
            blobService = new BlockBlobClient(azureStorageConnectionString, containerName, filename);

        return new Promise(async (resolve, reject) => {

            try {
                const response = await blobService.uploadStream(stream, stream.length);
                const status = response._response.status

                if (okStatuses.includes(status)) {
                    fs.stat(`./${filename}`, function (err) {
                        if (err) {
                            console.log(err)
                            reject(FILE_DELETE_ERROR)
                        }
                        fs.unlink(`./${filename}`, function (err) {
                            if (err) {
                                console.log(err)
                                return reject(FILE_DELETE_ERROR)
                            };
                        });
                        resolve(UPLOADED_MESSAGE);
                    });
                }
            } catch (err) {
                return (err);
            }
        });
    },

    async sendImage(base64Img, folder, filename) {
        const that = this
        return new Promise(async function (resolve, reject) {
            try {
                const res = await that.sendImageToAzure(that.base64ToBuffer(base64Img, filename), folder, filename);
                resolve(res)
            }
            catch (err) {
                reject(err)
            }
        });
    }
}
