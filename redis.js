const REDIS_NAMESPACE = 'airnz-inspire';
const API_COLLECTIONS = {
  'destinations':{
    hasNestedEndpoints:true
  },
  'articles':{
    hasNestedEndpoints:true
  },
  'settings':{
    hasNestedEndpoints:false
  },
  'pages':{
    hasNestedEndpoints:true
  },
  'navigation':{
    hasNestedEndpoints:false
  }
}
function fetchEndpoint(endpoint) {
  return new Promise((resolve, reject) => {
    request(url.resolve(app.locals.host, endpoint), (err, res) => {
      if(res.statusCode == '404'){
        reject('Not found');
      }else{
        resolve(res.body)
      }
    });
  })
}

function fetchData(endpoint){
  return new Promise((resolve, reject) => {
    request(url.resolve(app.locals.host, endpoint), (err, res) => {
      if(res.statusCode == '404' || err){
        reject('Not found');
      }else{
        resolve(res.body)
      }
    });
  })
}

function storeData(res){

  let client = redis.createClient();
  let finalEndpoints = [];
  let nestedEndpoints = 0;
  let nestedPromises = [];
  let nestedPromiseCount = 0;
  let finalAPIData = {};

  _.each(API_COLLECTIONS, (coll, key) => {
    // loop through and dive deeper into the ones which have children
    nestedEndpoints++;

    if(coll.hasNestedEndpoints){
      nestedPromises[nestedPromiseCount] = fetchEndpoint(key).then((el) => {
        let obj = JSON.parse(el);

        obj.forEach((detail) => {
          nestedEndpoints++;

          // polyfill
          let d = detail.detail.replace('pages', 'page');

          finalEndpoints.push(d.replace(app.locals.host, ''));
        });
      })

      nestedPromiseCount++;
    }

    finalEndpoints.push(key);
  })

  Promise.all(nestedPromises).then(() => {
    _.each(finalEndpoints, (endpoint, key) => {
      finalEndpoints[key] = fetchData(endpoint).then((data) => {
        finalAPIData[endpoint] = JSON.parse(data);
      }).catch((err) => {
        console.log(err);
      })
    })

    let count = 0;

    Promise.all(finalEndpoints).then(() => {

      app.locals.data = finalAPIData;

      client.set(REDIS_NAMESPACE, JSON.stringify(finalAPIData),
      (err) => {
        if(err){
          res.send("There's been an issue. Here it is:\n" + err);
        }else{
          res.send("Cache has been updated.")
        }
        client.quit();
      });


    })
  })
}