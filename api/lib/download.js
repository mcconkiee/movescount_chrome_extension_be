const http = require("http");
const request = require("request");
const download = function download(options, done) {
  console.log("download ", options);

  return new Promise((resolve, reject) => {
    var httpOptions = {
      method: "GET",
      hostname: "www.movescount.com",
      port: null,
      path: options.url,
      headers: {
        cookie: options.cookie
      }
    };

    var req = http.request(httpOptions, function(_res) {
      var chunks = [];

      _res.on("data", function(chunk) {
        chunks.push(chunk);
      });
      _res.on("error", e => {
        console.log('error for route download',e);
        
        reject(e);
      });

      _res.on("end", function() {
        var body = Buffer.concat(chunks);
        resolve(body);
      });
    });

    req.end();
  });
};
module.exports = download;