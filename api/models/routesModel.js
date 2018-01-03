"use strict";
var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var RouteSchema = new Schema({
  uuid: {
    type: String,
    required: "UUID is required"
  },
  url: {
    type: String
  },
  cookie: {
    type: String,
    required: "Cookie is required"
  },
  routeIds: {
    type: Array
  },
  dates: {
    startDate:Date,
    endDate: Date
  },
  sendTo: {
    type: String,
    required: "Please provide a place to send this package"
  },
  Created_date: {
    type: Date,
    default: Date.now
  },
  format:{
    type: String,
    default: 'gpx',
    required: "Download format is required"
  },
  downloadType: {
    type: [
      {
        type: String,
        enum: ["move", "route"]
      }
    ],    
    default: ["route"]
  }
});

module.exports = mongoose.model("Routes", RouteSchema);
