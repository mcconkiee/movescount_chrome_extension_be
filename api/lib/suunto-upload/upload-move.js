const config = require('../config.js');
var http = require('http');
var request = require('request');
const activityTypeId = {
  running: 3,
  cycling: 4,
  mtBiking: 5
};
const move = {
  cookie: config.cookie,
  create: function (routeDataObject, done) {
    let activityID = activityTypeId['cycling'];
    //for me, if it's less than 6.3ish miles, make it a run, otherwise, a ride
    if (routeDataObject.routeData.distance < 12000) {
      activityID = activityTypeId['running'];
    }
    var options = {
      method: 'POST',
      hostname: 'www.movescount.com',
      port: null,
      path: '/moves/move',
      headers: {
        'content-type': 'multipart/form-data; boundary=----WebKitFormBoundarySM5xoybHlVNWCNMz',
        cookie: config.cookie
      }
    };

    var req = http.request(options, function (res) {
      var chunks = [];

      res.on('data', function (chunk) {
        chunks.push(chunk);
      });

      res.on('end', function () {
        var body = Buffer.concat(chunks);
        const json = JSON.parse(body.toString());
        console.log('*******CREATED MOVE! ', json.moveID);
        done(null, body.toString());
      });
    });
    const routeID = routeDataObject.routeData.routeID;
    const duration = routeDataObject.helperData.duration.totalMS;
    const distance = routeDataObject.helperData.distance;
    const startLat = routeDataObject.helperData.start.lat;
    const startLon = routeDataObject.helperData.start.lon;
    const speed = routeDataObject.helperData.speed;
    const start = new Date(routeDataObject.helperData.duration.start).getTime();
    const notes = `route: ${routeID}`;
    const writeData =
      `------WebKitFormBoundarySM5xoybHlVNWCNMz\r\nContent-Disposition: form-data; name="moveData"\r\n\r\n{"activityID":${activityID},"duration":${duration},"startDate":${start},"hasTime":true,"notes":"${notes}","tags":[],"type":"19","diveBuddy":null,"diveMaster":null,"boatName":null,"downhillCount":null,"downhillGradeAvg":null,"downhillGradeMax":null,"null":null,"downhillDuration":0,"downhillDistance":null,"downhillDistanceMax":null,"downhillDescent":null,"downhillDescentMax":null,"downhillSpeedAvg":null,"downhillSpeedMax":null,"maxDepth":0,"visibility":null,"diveNumber":null,"surfaceTime":0,"hrAvg":null,"hrPeak":null,"hrMin":null,"intensity":2,"distance":${distance},"speedAvg":${speed},"speedMax":null,"paceAvg":null,"paceMax":null,"recoveryTime":null,"swolfAvg":null,"performanceLevel":null,"emgAvg":null,"emgLeft":null,"emgRight":null,"emgFront":null,"emgBack":null,"emgTotal":null,"powerAvg":null,"powerMax":null,"feeling":3,"weather":1,"te":null,"calories":null,"cadenceAvg":null,"cadenceMax":null,"ascentAltitude":null,"descentAltitude":null,"ascentTime":0,"descentTime":0,"flatTime":0,"highAltitude":null,"lowAltitude":null,"temperatureAvg":null,"temperatureMax":null,"temperatureMin":null,"bottomTemperature":null,"olfEnd":null,"altitudeMode":null,"personalMode":null,"maxOxygenConsumption":null,"timeInZone1":0,"timeInZone2":0,"timeInZone3":0,"timeInZone4":0,"timeInZone5":0,"peakEpoc":null,"activitySpecificFields":[{"fields":[{"name":"MaxWatts","value":null},{"name":"AvgWatts","value":null},{"name":"Instructor","value":null},{"name":"ClassName","value":null},{"name":"Steps","value":null},{"name":"GameResult","value":null},{"name":"LooserEvenOrWinner","value":null},{"name":"BasketBallQuarterResult1","value":null},{"name":"BasketBallQuarterResult2","value":null},{"name":"BasketBallQuarterResult3","value":null},{"name":"BasketBallQuarterResult4","value":null},{"name":"OverperiodResult","value":null},{"name":"Opponent","value":null},{"name":"SoccerFirstHalftimeResult","value":null},{"name":"SoccerSecondHalftimeResult","value":null},{"name":"Penaltyshootout","value":null},{"name":"IceHockeyFirstPeriodResult","value":null},{"name":"IceHockeySecondPeriodResult","value":null},{"name":"IceHockeyThirdPeriodResult","value":null},{"name":"VolleyBallFirstSet","value":null},{"name":"VolleyBallSecondSet","value":null},{"name":"VolleyBallThirdSet","value":null},{"name":"VolleyBallFourthSet","value":null},{"name":"VolleyBallFifthSet","value":null},{"name":"FootballFirstSet","value":null},{"name":"FootballSecondSet","value":null},{"name":"FootballThirdSet","value":null},{"name":"FootballFourthSet","value":null},{"name":"FootballOverperiodResult","value":null},{"name":"SoftballFirstInning","value":null},{"name":"SoftballSecondInning","value":null},{"name":"SoftballThirdInning","value":null},{"name":"SoftballFourthInning","value":null},{"name":"SoftballFifthInning","value":null},{"name":"SoftballSixthInning","value":null},{"name":"SoftballSeventhInning","value":null},{"name":"BaseballFirstInning","value":null},{"name":"BaseballSecondInning","value":null},{"name":"BaseballThirdInning","value":null},{"name":"BaseballFourthInning","value":null},{"name":"BaseballFifthInning","value":null},{"name":"BaseballSixthInning","value":null},{"name":"BaseballSeventhInning","value":null},{"name":"BaseballEightInning","value":null},{"name":"BaseballNinthInning","value":null},{"name":"TennisFirstGame","value":null},{"name":"TennisSecondGame","value":null},{"name":"TennisThirdGame","value":null},{"name":"TennisFourthGame","value":null},{"name":"TennisFifthGame","value":null},{"name":"TennisSixthGame","value":null},{"name":"TennisSeventhGame","value":null},{"name":"TennisCourt","value":null},{"name":"BadmintonFirstGame","value":null},{"name":"BadmintonSecondGame","value":null},{"name":"BadmintonThirdGame","value":null},{"name":"BadmintonFourthGame","value":null},{"name":"BadmintonFifthGame","value":null},{"name":"BadmintonSixthGame","value":null},{"name":"BadmintonSeventhGame","value":null},{"name":"TableTennisFirstGame","value":null},{"name":"TableTennisSecondGame","value":null},{"name":"TableTennisThirdGame","value":null},{"name":"TableTennisFourthGame","value":null},{"name":"TableTennisFifthGame","value":null},{"name":"TableTennisSixthGame","value":null},{"name":"TableTennisSeventhGame","value":null},{"name":"RacquetBallFirstGame","value":null},{"name":"RacquetBallSecondGame","value":null},{"name":"RacquetBallThirdGame","value":null},{"name":"RacquetBallFourthGame","value":null},{"name":"RacquetBallFifthGame","value":null},{"name":"SquashFirstGame","value":null},{"name":"SquashSecondGame","value":null},{"name":"SquashThirdGame","value":null},{"name":"SquashFourthGame","value":null},{"name":"SquashFifthGame","value":null},{"name":"RacePosition","value":null},{"name":"TotalPar","value":null},{"name":"TotalStrokes","value":null},{"name":"NetPoints","value":null},{"name":"HandballFirstHalf","value":null},{"name":"HandballSecondHalf","value":null},{"name":"HandballOverperiodFirstHalf","value":null},{"name":"HandballOverperiodSecondHalf","value":null},{"name":"HorseName","value":null},{"name":"OrienteeringCourseDistance","value":null},{"name":"OrienteeringNbrOfControls","value":null},{"name":"RugbyFirstHalf","value":null},{"name":"RugbySecondHalf","value":null},{"name":"RugbyExtraTime","value":null},{"name":"HuntingShotCount","value":null},{"name":"HuntingBigGame","value":null},{"name":"HuntingSmallGame","value":null},{"name":"HuntingBirds","value":null},{"name":"FishingCatches","value":null}]}],"resourceFields":[],"latitude":${startLat},"longitude":${startLon},"routeIDs":[${routeID}],"utcStartTime":null}\r\n------WebKitFormBoundarySM5xoybHlVNWCNMz--`;
    // console.log('*******writeData for move', writeData);
    req.write(writeData);
    req.end();
  },
  delete: function (id, cb) {
    var options = {
      method: 'POST',
      hostname: 'www.movescount.com',
      port: null,
      path: '/move/delete',
      headers: {
        cookie: config.cookie
      }
    };

    var req = http.request(options, function (res) {
      var chunks = [];

      res.on('data', function (chunk) {
        chunks.push(chunk);
      });
      res.on('error', function (error) {
        cb(error, null);
      });

      res.on('end', function () {
        var body = Buffer.concat(chunks);
        cb(null, body.toString());
      });
    });

    req.write(`id=${id}`);
    req.end();
  },
  findAll(done) {
    var options = {
      method: 'GET',
      url: 'http://www.movescount.com/Move/MoveList',
      headers: {
        cookie: config.cookie
      }
    };

    request(options, function (error, response, body) {
      console.log('*******body', body);
      const json = JSON.parse(body);
      const keys = Object.keys(json.Schema);
      const data = json.Data; //array of arrays , each 52 big
      let objects = [];
      data.forEach(dataObject => {
        let pojo = {};
        dataObject.forEach((dataValue, idx) => {
          pojo[keys[idx]] = dataValue;
        });
        objects.push(pojo);
      });
      done(error, objects);
    });
  },
  remove(id, done) {
    var options = {
      method: 'POST',
      url: 'http://www.movescount.com/move/delete',
      headers: {
        'postman-token': 'ea796a23-e599-c40d-35e1-45eb48f6a2ca',
        'cache-control': 'no-cache',
        connection: 'keep-alive',
        'x-requested-with': 'XMLHttpRequest',
        referer: 'http://www.movescount.com/moves/move188104050',
        accept: '*/*',
        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36',
        'accept-language': 'en-US,en;q=0.9',
        'accept-encoding': 'gzip, deflate',
        origin: 'http://www.movescount.com',
        'x-newrelic-id': 'UgEAVFFUGwcAVlhUBQA=',
        cookie: config.cookie
      },
      body: 'id=' + id
    };
    request(options, function (error, response, body) {
      console.log('*******removed move', id);
      done(error, body);
    });
  },
  removeAll(done) {
    let counter = 0;
    move.findAll((error, moveObjects) => {
      console.log('*******found X objects = ', moveObjects.length);
      let counterTotal = moveObjects.length;
      moveObjects.forEach(moveObject => {
        move.remove(moveObject.MoveID, (error, data) => {
          counter++;
          console.log('*******counter,counterTotal', counter, counterTotal);
          if (counter == counterTotal) {
            done(error, data);
          }
        });
      });
    });
  }
};
module.exports = move;
