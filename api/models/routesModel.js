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
  sendTo:{
    type: String,
    required: "Please provide a place to send this package"
  },
  Created_date: {
    type: Date,
    default: Date.now
  }
  //   status: {
  //     type: [{
  //       type: String,
  //       enum: ['pending', 'ongoing', 'completed']
  //     }],
  //     default: ['pending']
  //   }
});

module.exports = mongoose.model("Routes", RouteSchema);
