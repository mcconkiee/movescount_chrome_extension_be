const togpx = require("togpx");
const geoJsonForData = function geoJsonForData(json,options) {
  const coordinates = [];
  json.points.latitudes.forEach((lat, idx) => {
    const lng = json.points.longitudes[idx];
    const obj = [lng, lat];
    if (json.points.altitudes && json.points.altitudes.length > 0) {
      obj.push(json.points.altitudes[idx]);
    }
    coordinates.push(obj);
  });
  const geoJson = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: { name: options.name },
        geometry: { type: "LineString", coordinates }
      }
    ]
  };
  return geoJson;
};
exports.geoJsonForData = geoJsonForData;

exports.gpxForJson = function gpxForJson(json,options) {
  const geoJson = geoJsonForData(json,options);
  const gpx = togpx(geoJson);
  return gpx;
};
