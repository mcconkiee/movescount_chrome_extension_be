const async = require("async");
const config = require("../config");
const Errors = require("./errors.js");
const fs = require("fs");
const ff = require("ff");
const route = require("./upload-route");
const move = require("./upload-move");

// var path = process.argv[2];
const sleep = function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
};

const suuntoUploader = function suuntoUploader(options, done) {
  const uploadPath = "";
  const path = "";
  async function zzz() {
    await sleep(2000);
  }
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath);
  }
};
module.exports = suuntoUploader;
