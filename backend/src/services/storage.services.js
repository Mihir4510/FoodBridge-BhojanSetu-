const ImageKit = require("@imagekit/nodejs");

const imagekit = new ImageKit({
  publicKey: process.env.IMAGE_PUBLIC_KEY,
  privateKey: process.env.IMAGE_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGE_URL_ENDPOINT
});

async function uploadFile(fileBuffer, originalName) {
  const result = await imagekit.upload({
    file: fileBuffer.toString("base64"),
    fileName: `${Date.now()}-${originalName}`,
    folder: "/bhojansetu/donations"
  });

  return {
    url: result.url,
    fileId: result.fileId
  };
}

module.exports = uploadFile;