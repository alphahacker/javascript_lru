var redisPool = require('../src/caching.js');

/* Initialize LRU cache with default limit being 10 items */
var lru = function (limit) {
    this.size = 0;
    (typeof limit == "number") ? this.limit = limit : this.limit = 10;
    this.map = {};
    this.head = null;
    this.tail = null;
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
        console.log("Key " + key + " does not exist in the cache.")
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
    while (node) {
        s += String(node.key)+':'+node.value;
        node = node.next;
        if (node) {
            s += '\n';
        }
    }
    return s;
}

//----------------------------------------------------------------------------//

//데이터를 저장할 node 생성 - completed
//lru node가 priority value 를 가지고 있도록 변경
lru.prototype.urbNode = function(key, value, user_1, user_2) {

    //여기서 this의 의미가 해당 노드를 의미하는게 맞는지 check 필요
    this.priorityValue = this.getPriorityValue(user_1, user_2);

    if (typeof key != "undefined" && key !== null) {
        this.key = key;
    }
    if (typeof value != "undefined" && value !== null) {
        this.value = value;
    }

    this.prev = null;
    this.next = null;
}


//SetHead의 역할을 하는 곳, 이 알고리즘에서는 무조건 Head에 넣는것이 아니라,
//Priority value 값에 따라 적정 위치에 들어간다.
//즉, Read/Write 할때 그 대상이 되는 데이터의 리스트 위치를 잡아준다.
//그러니까 원래 LRU에서 setHead가 호출되는 부분에, 이게 호출 되야함. - completed
lru.prototype.setInList = function(currNode) {
  var isCompleted = false; //노드를 리스트에 넣는것을 완성했는지 여부.

  //이미 노드가 만들어지면서 정렬이 되기때문에,
  //head에서부터 뒤로 차례대로 PriorityValue 값 비교하면서, 자기보다 큰 값 나오면 그 앞에다가 넣는다.
  var existingNode = this.head;
  while (existingNode) {
      existingNode = existingNode.next;
      if(existingNode.priorityValue > currNode.priorityValue){
        //여기다가 노드 넣기 *******************
        existingNode.prev.next = currNode;
        currNode.next = existingNode;

        existingNode.prev = currNode;
        currNode.prev = existingNode.prev;

        //여기에서 노드 넣기 true처리 *******************
        isCompleted = true;
      }
  }

  if(!isCompleted){ //아직 못넣었으면, tail에다가 넣어야함.
    this.tail.next = currNode;
    currNode.prev = this.tail;

    this.tail = currNode;
  }
}

//set data - completed
lru.prototype.setData = function(key, value, user_1, user_2){
  var node = new lru.prototype.urbNode(key, value, user_1, user_2);
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
  this.setInList(node);
}

//Closeness value + LRU value의 합인 Priority value 구하기 - completed
lru.prototype.getPriorityValue = function(user_1, user_2) {

  var cvValue;
  var lruValue;

  var promise = new Promise(function(resolved, rejected){
      // if(err){
      //   rejected();
      // }
      cvValue = this.getCV(user_1, user_2);
      resolved();
  });

  promise
  .then(function(contentIndexList){
    return new Promise(function(resolved, rejected){
      lruValue = this.getLRU();
      resolved();
    })
  }, function(err){
      console.log(err);
  })
  .then(function(contentIndexList){
    return new Promise(function(resolved, rejected){
      return parseInt(cvValue) + parseInt(lruValue);  //이 return 제대로 되는지 확인 필요
      resolved();
    })
  }, function(err){
      console.log(err);
  })
}

//Closeness value 값 가져오기 - completed
lru.prototype.getCV = function(user_1, user_2) {

  var isFriend = false;
  var cvValue = 1;

  //user_1의 친구리스트에 user_2가 있는지 확인
  var promise = new Promise(function(resolved, rejected){
  var key = user_1;
  redisPool.friendListMemory.get(key, function (err, result) {
      if(err){
        error_log.info("fail to get the friendList memory in Redis : " + err);
        error_log.info("key (req.params.userId) : " + key);
        error_log.info();
        rejected("fail to get the friendList memory in Redis");
      }
      else if(result == undefined || result == null){
        resolved();
      }
      else {
        isFriend = true;
        resolved();
      }
    });
  });

  //user_2의 친구리스트에 user_1이 있는지 확인
  promise
  .then(function(contentIndexList){
    return new Promise(function(resolved, rejected){
      if(isFriend == true)  resolved();
      else {
        key = user_2;
        redisPool.friendListMemory.get(key, function (err, result) {
            if(err){
              error_log.info("fail to get the friendList memory in Redis : " + err);
              error_log.info("key (req.params.userId) : " + key);
              error_log.info();
              rejected("fail to get the friendList memory in Redis");
            }
            else if(result == undefined || result == null){
              resolved();
            }
            else {
              isFriend = true;
              resolved();
            }
        });
      }
    })
  }, function(err){
      console.log(err);
  })
  .then(function(contentIndexList){
    return new Promise(function(resolved, rejected){
      //친구리스트에 있으면 0
      //없으면 1
      if(isFriend){
        cvValue = 0;
      } else {
        cvValue = 1;
      }

    })
  }, function(err){
      console.log(err);
  })

  return cvValue;
}

lru.prototype.getLRU = function(node) {
  //return lruValue;

  return 0;
}



module.exports = lru;
