var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var redis = require('redis');
var JSON = require('JSON');
var sleep = require('system-sleep');

var log4js = require('log4js');
log4js.configure('./configure/log4js.json');
var operation_log = log4js.getLogger("operation");
var error_log = log4js.getLogger("error");
var interim_log = log4js.getLogger("interim");

var lru = require('../src/urb_lru');
var redisPool = require('../src/caching.js');
var dbPool = require('../src/db.js');

var app = express();

var urb_lru = new lru(5);

router.get('/index', function(req, res, next) {

   var urb_lru = new lru(5);
   var key = "1";
   var value = "test";

   urb_lru.set(key, value);
   console.log(urb_lru.get(key));

   res.send("complete");
});

router.get('/index2', function(req, res, next) {

//   var urb_lru = new lru(5);

   var key = "1";
   var value = "test";
   urb_lru.set(key, value);

   key = "2";
   value = "test2";
   urb_lru.set(key, value);

   key = "3";
   value = "test3";
   urb_lru.set(key, value);

   key = "4";
   value = "test4";
   urb_lru.set(key, value);

   key = "5";
   value = "test5";
   urb_lru.set(key, value);

   key = "6";
   value = "test6";
   urb_lru.set(key, value);

   key = "7";
   value = "test7";
   urb_lru.set(key, value);

   key = "8";
   value = "test8";
   urb_lru.set(key, value);key = "8";

   res.send("complete");
});

router.get('/urb_test', function(req, res, next) {

   //var urb_lru = new lru(5);

   var key = "1";
   var value = "test";
   urb_lru.setData(key, value, "01BlackRose08", "AplisoSA");

//   sleep(1000);

   var key = "2";
   var value = "test2";
   urb_lru.setData(key, value, "AplisoSA", "01BlackRose08");

//   sleep(1000);

   var key = "3";
   var value = "test3";
   urb_lru.setData(key, value, "AplisoSA", "01BlackRose08");

  // sleep(1000);

   var key = "4";
   var value = "test4";
   urb_lru.setData(key, value, "AplisoSA", "01BlackRose08");

   //sleep(1000);

   var key = "5";
   var value = "test5";
   urb_lru.setData(key, value, "AplisoSA", "01BlackRose08");

   //sleep(1000);

   var key = "6";
   var value = "test6";
   urb_lru.setData(key, value, "AplisoSA", "01BlackRose08");

   //sleep(1000);

   var key = "7";
   var value = "test7";
   urb_lru.setData(key, value, "AplisoSA", "AAAAAAAAAAAAA");

   //sleep(1000);

   var key = "8";
   var value = "test8";
   urb_lru.setData(key, value, "AplisoSA", "01BlackRose08");

   //sleep(1000);

   var key = "9";
   var value = "test9";
   urb_lru.setData(key, value, "AplisoSA", "AAAAAAAAAAAAA");

   //sleep(1000);

   var key = "10";
   var value = "test10";
   urb_lru.setData(key, value, "AplisoSA", "AAAAAAAAAAAAA");

   //sleep(1000);

   var key = "11";
   var value = "test11";
   urb_lru.setData(key, value, "AplisoSA", "AAAAAAAAAAAAA");

   //sleep(1000);

   var key = "12";
   var value = "test12";
   urb_lru.setData(key, value, "AplisoSA", "AAAAAAAAAAAAA");

   //sleep(1000);

   var key = "13";
   var value = "test13";
   urb_lru.setData(key, value, "AplisoSA", "AAAAAAAAAAAAA");

   //sleep(1000);

   var key = "14";
   var value = "test14";
   urb_lru.setData(key, value, "AplisoSA", "AAAAAAAAAAAAA");

   res.send("complete");
});

router.get('/urb_test_print', function(req, res, next) {

   console.log(urb_lru.toString());

   res.send("complete");
});

router.get('/get_test_print', function(req, res, next) {

  console.log(urb_lru.get(1));
  console.log(urb_lru.get(2));

  res.send("complete");
});

// router.get('/init', function(req, res, next) {
//
//   var promise = new Promise(function(resolved, rejected){
//     resolved();
//   });
//
//   promise
//   /**************************************************************************/
//   /*********************** friend list memory 초기화 **************************/
//   /**************************************************************************/
//   .then(function(){
//     return new Promise(function(resolved, rejected){
//       var users = [];
//       dbPool.getConnection(function(err, conn) {
//         var query_stmt = 'SELECT userId FROM user';
//         conn.query(query_stmt, function(err, rows) {
//           conn.release(); //MySQL connection release
//
//           if(err) rejected("DB err!");
//
//           for (var j=0; j<rows.length; j++) {
//               users.push(rows[j].userId);
//           }
//           resolved(users);
//         })
//       });
//     })
//   }, function(err){
//       console.log(err);
//   })
//   .then(function(users){
//     return new Promise(function(resolved, rejected){
//       var setUserFriendsInRedis = function(i, callback){
//         if(i >= users.length){
//           callback();
//         } else {
//           //여기서 DB에서 user[i] 값으로 프렌드리스트 불러오고 그 값들을 모두 레디스에 넣는다.
//           dbPool.getConnection(function(err, conn) {
//             var query_stmt = 'SELECT friendId FROM friendList WHERE userId = "' + users[i] + '"';
//             conn.query(query_stmt, function(err, rows) {
//               conn.release();
//               if(err){
//                 rejected("DB err!");
//               }
//               else {
//                 var key = users[i];
//                 var friendList = rows;
//                 for(var j=0; j<friendList.length; j++){
//                   var setContentList = function(friendIndex){
//                     var value = friendList[friendIndex].friendId;
//                     redisPool.friendListMemory.lpush(key, value, function (err) {
//                         if(err) rejected("fail to set the friend list memory in Redis");
//                     });
//                   }(j);
//                 }
//                 setUserFriendsInRedis(i+1, callback);
//               }
//             });
//           });
//         }
//       }
//
//       setUserFriendsInRedis(0, function(){
//         resolved();
//         setUserFriendsInRedis = null;
//       })
//     })
//   }, function(err){
//       console.log(err);
//   })
//   .then(function(){
//     return new Promise(function(resolved, rejected){
//       console.log("friend list memory ready");
//       resolved();
//     })
//   }, function(err){
//       console.log(err);
//   })
// });

router.get('/init', function(req, res, next) {

    var promise = new Promise(function(resolved, rejected){
      redisPool.connectClients("127.0.0.1");
      resolved();
    });

    promise
    /**************************************************************************/
    /*********************** friend list memory 초기화 **************************/
    /**************************************************************************/
    .then(function(){
      return new Promise(function(resolved, rejected){
        var users = [];
        dbPool.getConnection(function(err, conn) {
          var query_stmt = 'SELECT userId FROM user';
          conn.query(query_stmt, function(err, rows) {
            conn.release(); //MySQL connection release

            if(err) rejected("DB err!");

            for (var j=0; j<rows.length; j++) {
                users.push(rows[j].userId);
            }
            resolved(users);
          })
        });
      })
    }, function(err){
        console.log(err);
    })
    .then(function(users){
      return new Promise(function(resolved, rejected){
        var setUserFriendsInRedis = function(i, callback){
          if(i >= users.length){
            callback();
          } else {
            //여기서 DB에서 user[i] 값으로 프렌드리스트 불러오고 그 값들을 모두 레디스에 넣는다.
            dbPool.getConnection(function(err, conn) {
              var query_stmt = 'SELECT friendId FROM friendList WHERE userId = "' + users[i] + '"';
              conn.query(query_stmt, function(err, rows) {
                conn.release();
                if(err){
                  rejected("DB err!");
                }
                else {
                  var key = users[i];
                  var friendList = rows;
                  for(var j=0; j<friendList.length; j++){
                    var setContentList = function(friendIndex){
                      var value = friendList[friendIndex].friendId;
                      // if(key == 'AgProud'){
                      // console.log("[set friend list] User ID = " + key + ", Friend ID = " + value);
                      // }
                      redisPool.friendListMemory.lpush(key, value, function (err) {
                          if(err) rejected("fail to set the friend list memory in Redis");
                      });
                    }(j);
                  }
                  setUserFriendsInRedis(i+1, callback);
                }
              });
            });
          }
        }

        setUserFriendsInRedis(0, function(){
          resolved();
          setUserFriendsInRedis = null;
        })
      })
    }, function(err){
        console.log(err);
    })
    .then(function(){
      return new Promise(function(resolved, rejected){
        console.log("friend list memory ready");
        res.send("completed");
        resolved();
      })
    }, function(err){
        console.log(err);
    })
});

module.exports = router;
