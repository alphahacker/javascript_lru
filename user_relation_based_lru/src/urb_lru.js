var locks = require('locks');
var mutex = locks.createMutex();

var redisPool = require('../src/caching.js');
var lruInstance = {};

var lru = function (limit) {
    this.size = 0;
    (typeof limit == "number") ? this.limit = limit : this.limit = 2450;
    this.map = {};
    this.head = null;
    this.tail = null;
    this.priorityValue = 0;
}

lru.prototype.lrunode = function(key, value) {
    if (typeof key != "undefined" && key !== null) {
        this.key = key;
    }
    if (typeof value != "undefined" && value !== null) {
        this.value = value;
    }
    this.prev = null;
    this.next = null;
}

lru.prototype.setHead = function(node) {
    node.next = this.head;
    node.prev = null;
    if (this.head !== null) {
        this.head.prev = node;
    }
    this.head = node;
    if (this.tail === null) {
        this.tail = node;
    }
    this.size++;
    this.map[node.key] = node;
}

/* Change or add a new value in the cache
 * We overwrite the entry if it already exists
 */
lru.prototype.set = function(key, value) {
    var node = new lru.prototype.lrunode(key, value);
    if (this.map[key]) {
        this.map[key].value = node.value;
        this.remove(node.key);
    } else {
        if (this.size >= this.limit) {
            delete this.map[this.tail.key];
            this.size--;
            this.tail = this.tail.prev;
            this.tail.next = null;
        }
    }
    this.setHead(node);
};

/* Retrieve a single entry from the cache */
lru.prototype.get = function(key) {
    if (this.map[key]) {
        var value = this.map[key].value;
        var node = new lru.prototype.lrunode(key, value);
        this.remove(key);
        this.setHead(node);
        return value;
    } else {
        return null;
        //console.log("Key " + key + " does not exist in the cache.")
    }
};

/* Remove a single entry from the cache */
lru.prototype.remove = function(key) {
    var node = this.map[key];
    if (node.prev !== null) {
        node.prev.next = node.next;
    } else {
        this.head = node.next;
    }
    if (node.next !== null) {
        node.next.prev = node.prev;
    } else {
        this.tail = node.prev;
    }
    delete this.map[key];
    this.size--;
};

/* Resets the entire cache - Argument limit is optional to be reset */
lru.prototype.removeAll = function(limit) {
    this.size = 0;
    this.map = {};
    this.head = null;
    this.tail = null;
    if (typeof limit == "number") {
        this.limit = limit;
    }
};

/* Traverse through the cache elements using a callback function
 * Returns args [node element, element number, cache instance] for the callback function to use
 */
lru.prototype.forEach = function(callback) {
    var node = this.head;
    var i = 0;
    while (node) {
        callback.apply(this, [node, i, this]);
        i++;
        node = node.next;
    }
}

/* Returns a JSON representation of the cache */
lru.prototype.toJSON = function() {
    var json = []
    var node = this.head;
    while (node) {
        json.push({
            key : node.key,
            value : node.value
        });
        node = node.next;
    }
    return json;
}

/* Returns a String representation of the cache */
lru.prototype.toString = function() {
    var s = '';
    var node = this.head;
    // console.log("HEAD ---------- : ");
    // console.log(node);
    while (node) {
        s += String(node.key)+':'+node.value;
        // console.log("key : " + node.key);
        // console.log("value : " + node.value);
        node = node.next;
        if (node) {
            s += '\n';
        }
    }
    return s;
}

//set data - completed
lru.prototype.setData = function(key, value, user_1, user_2){
  lruInstance = this;
  mutex.lock(function () {
    var promise = new Promise(function(resolved, rejected){
        getPriorityValue(user_1, user_2, function(retPriorityValue){
          var node = new lruInstance.urbNode(key, value, retPriorityValue);
          resolved(node);
        });
    });
    promise
    .then(function(node){
      return new Promise(function(resolved, rejected){
        if (lruInstance.map[key]) {
            lruInstance.map[key].value = lruInstance.value;
            lruInstance.remove(node.key);
        } else {
            if (lruInstance.size >= lruInstance.limit) {
                delete lruInstance.map[lruInstance.tail.key];
                lruInstance.size--;
                lruInstance.tail = lruInstance.tail.prev;
                lruInstance.tail.next = null;
            }
        }
        resolved(node);
      })
    }, function(err){
        console.log(err);
    })
    .then(function(node){
      return new Promise(function(resolved, rejected){
        lruInstance.setInList(node);
        resolved();
      })
    }, function(err){
        console.log(err);
    })
    .then(function(node){
      return new Promise(function(resolved, rejected){
        mutex.unlock();
        // console.log("LRU INSTANCE : ");
        // console.log(lruInstance);
        resolved();
      })
    }, function(err){
        console.log(err);
    })
  });
}

/* Retrieve a single entry from the cache */
lru.prototype.getData = function(key) {
    lruInstance = this;
    var value;
    if (this.map[key]) {
        mutex.lock(function () {
          var promise = new Promise(function(resolved, rejected){
              var user_1 = "AplisoSA";
              var user_2 = "01BlackRose08";
              getPriorityValue(user_1, user_2, function(retPriorityValue){
                value = lruInstance.map[key].value;
                var node = new lruInstance.urbNode(key, value, retPriorityValue);
                resolved(node);
              });
          });
          promise
          .then(function(node){
            return new Promise(function(resolved, rejected){
              lruInstance.remove(key);
              resolved(node);
            })
          }, function(err){
              console.log(err);
          })
          .then(function(node){
            return new Promise(function(resolved, rejected){
              lruInstance.setHead(node);
              resolved();
            })
          }, function(err){
              console.log(err);
          })
          .then(function(){
            return new Promise(function(resolved, rejected){
              mutex.unlock();
              return value;
              // console.log("LRU INSTANCE : ");
              // console.log(lruInstance);
              resolved();
            })
          }, function(err){
              console.log(err);
          })
        });
    } else {
        return null;
        //console.log("Key " + key + " does not exist in the cache.")
    }
};

lru.prototype.urbNode = function(key, value, paramPriorityValue) {
    var nodeInstance = this;
    var promise = new Promise(function(resolved, rejected){
        nodeInstance.priorityValue = paramPriorityValue;
        resolved();
    });
    promise
    .then(function(){
      return new Promise(function(resolved, rejected){
        if (typeof key != "undefined" && key !== null) {
            nodeInstance.key = key;
        }
        if (typeof value != "undefined" && value !== null) {
            nodeInstance.value = value;
        }
        resolved();
      })
    }, function(err){
        console.log(err);
    })
    .then(function(){
      return new Promise(function(resolved, rejected){
        nodeInstance.prev = null;
        nodeInstance.next = null;
        resolved();
      })
    }, function(err){
        console.log(err);
    })
}

lru.prototype.setInList = function(currNode) {

  var isCompleted = false; //노드를 리스트에 넣는것을 완성했는지 여부.
  if(this.head == null){
    this.head = currNode;
  } else {
    var existingNode = this.head;
    while (existingNode) {
      if(currNode.priorityValue < existingNode.priorityValue){
        if(existingNode.prev == null){  // 기존에 있던게, head면
          existingNode.prev = currNode;
          currNode.next = existingNode;
        } else {
          existingNode.prev.next = currNode;
          currNode.next = existingNode;

          currNode.prev = existingNode.prev;
          existingNode.prev = currNode;
        }
        isCompleted = true;
      }
      existingNode = existingNode.next;
    }
    if(!isCompleted){ //아직 못넣었으면, tail에다가 넣어야함.
      if(this.tail == null){
        currNode.prev = this.tail;
        this.tail = currNode;
      } else {
        this.tail.next = currNode;
        currNode.prev = this.tail;
        this.tail = currNode;
      }
    }
  }
  if(this.tail == null){
    this.tail = currNode;
  }
  this.size++;
  this.map[currNode.key] = currNode;
}

//Closeness value + LRU value의 합인 Priority value 구하기 - completed
var getPriorityValue = function(user_1, user_2, cb) {
  var cvValue;
  var lruValue;
  var promise = new Promise(function(resolved, rejected){
      getCV(user_1, user_2, function(retCV){
        cvValue = retCV;
        resolved();
      })
  });
  promise
  .then(function(){
    return new Promise(function(resolved, rejected){
      lruValue = getLRU();
      resolved();
    })
  }, function(err){
      console.log(err);
  })
  .then(function(){
    return new Promise(function(resolved, rejected){
      cb(parseInt(cvValue) + parseInt(lruValue));
      resolved();
    })
  }, function(err){
      console.log(err);
  })
}

//Closeness value 값 가져오기
var getCV = function(user_1, user_2, cb) {
  var isFriend = false;
  var cvValue = 1;
  var friendList = [];

  //user_1의 친구리스트에 user_2가 있는지 확인
  var promise = new Promise(function(resolved, rejected){
    var key = user_1;
    redisPool.friendListMemory.lrange(key, 0, -1, function (err, result) {
        if(err){
          console.log("redis err : " + err);
          rejected("fail to get the friendList memory in Redis");
        }
        else {
          friendList = result;
          for(var i=0; i<friendList.length; i++){
             if(user_2 == friendList[i]){
               isFriend = true;
               resolved();
             }
          }
          resolved();
        }
      });
  });
  //user_2의 친구리스트에 user_1이 있는지 확인
  promise
  .then(function(){
    return new Promise(function(resolved, rejected){
      if(isFriend == true)  resolved();
      else {
        var key = user_2;
        redisPool.friendListMemory.lrange(key, 0, -1, function (err, result) {
            if(err){
              console.log("redis err : " + err);
              rejected("fail to get the friendList memory in Redis");
            }
            else {
              friendList = result;
              for(var i=0; i<friendList.length; i++){
                 if(user_1 == friendList[i]){
                   isFriend = true;
                   resolved();
                 }
              }
              resolved();
            }
        });
      }
    })
  }, function(err){
      console.log(err);
  })
  .then(function(){
    return new Promise(function(resolved, rejected){
      //친구리스트에 있으면 0, 없으면 1
      if(isFriend){
        cvValue = 0;
        cb(cvValue);
      } else {
        cvValue = 1;
        cb(cvValue);
      }
    })
  }, function(err){
      console.log(err);
  })
}

var getLRU = function(node) {
  //return lruValue;
  return 0;
}


var urb_lru = new lru(24000);
module.exports = urb_lru;
//module.exports = lru;
