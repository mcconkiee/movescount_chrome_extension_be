const archive = require("./archive");
const download = require("./download");
const uploadS3 = require("./uploadS3");
const email = require("./email");

module.exports = {
  download: download,
  uploadS3: uploadS3,
  archive: archive,
  email: email
};
