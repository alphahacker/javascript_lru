var redis = require('redis');

var redisClient = {};

redisClient.connectClients = function (redisIp) {
  // redisClient.indexMemory = redis.createClient(1234, redisIp);      //사용자가 업로드한 컨텐츠 데이터에 대한 인덱스가 저장되는 곳
  // redisClient.dataMemory = redis.createClient(1235, redisIp);       //실제로 컨텐츠 데이터가 저장되는 곳
  // redisClient.socialMemory = redis.createClient(1236, redisIp);     //각 사용자에게 할당된 메모리양이 저장되는 곳
  // redisClient.locationMemory = redis.createClient(1237, redisIp);   //사용자의 위치가 저장되어있는 곳
  redisClient.friendListMemory = redis.createClient(1238, '127.0.0.1');   //사용자의 친구들 리스트가 저장되어있는 곳
  console.log("redis client created");
}

redisClient.flushMemory = function () {
  redisClient.indexMemory.flushdb( function (err, succeeded) {
      if(err) throw err;
      console.log("index memory flush completed"); // will be true if successfull
  });

  redisClient.dataMemory.flushdb( function (err, succeeded) {
      if(err) throw err;
      console.log("data memory flush completed"); // will be true if successfull
  });

  redisClient.socialMemory.flushdb( function (err, succeeded) {
      if(err) throw err;
      console.log("social memory flush completed"); // will be true if successfull
  });

  redisClient.locationMemory.flushdb( function (err, succeeded) {
      if(err) throw err;
      console.log("location memory flush completed"); // will be true if successfull
  });

  redisClient.friendListMemory.flushdb( function (err, succeeded) {
    if(err) throw err;
    console.log("friend list memory flush completed"); // will be true if successfull
});
}

module.exports = redisClient;
