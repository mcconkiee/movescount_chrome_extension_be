const s3 = require("s3");
const config = require("../config");

const uploadS3 = function uploadS3(zipUrl, options, done) {
  var client = s3.createClient({
    s3Options: config.s3
  });
  var params = {
    localFile: zipUrl,    
    s3Params: {      
      Bucket: config.s3.Bucket,
      Key: `routes/${options.uuid}.zip`,
      ACL:'public-read-write',
    }
  };
  var uploader = client.uploadFile(params);
  uploader.on("error", function(err) {
    console.error("unable to upload:", err.stack);
    done(err,null);
  });
  uploader.on("progress", function() {
    console.log(
      "progress",
      uploader.progressMd5Amount,
      uploader.progressAmount,
      uploader.progressTotal
    );
  });
  uploader.on("end", function() {
    console.log("done uploading");
    // done(null, s3.getPublicUrl(params.s3Params.Bucket, params.s3Params.Key));
    done(null,`https://${params.s3Params.Bucket}.s3.amazonaws.com/${params.s3Params.Key}`)
  });
};
module.exports = uploadS3