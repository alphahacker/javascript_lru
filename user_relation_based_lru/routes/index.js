var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var JSON = require('JSON');

var log4js = require('log4js');
log4js.configure('./configure/log4js.json');
var operation_log = log4js.getLogger("operation");
var error_log = log4js.getLogger("error");
var interim_log = log4js.getLogger("interim");

var lru = require('../src/urb_lru');

var app = express();

router.get('/index', function(req, res, next) {

   var urb_lru = new lru(5);
   var key = "1";
   var value = "test";

   urb_lru.set(key, value);
   console.log(urb_lru.get(key));

   res.send("complete");
});

router.get('/urb_test', function(req, res, next) {

   var urb_lru = new lru(5);
   var key = "1";
   var value = "test";

   urb_lru.set(key, value);
   console.log(urb_lru.get(key));
   console.log(urb_lru.toString());

   res.send("complete");
});

router.get('/init', function(req, res, next) {

  var promise = new Promise(function(resolved, rejected){
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
      resolved();
    })
  }, function(err){
      console.log(err);
  })
});

module.exports = router;
