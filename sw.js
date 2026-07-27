var CACHE = "blobby-20260728021802";
var ASSETS = ["./", "index.html", "manifest.webmanifest", "apple-touch-icon.png", "icon-192.png", "icon-512.png", "b-happy.png", "b-worried.png", "b-determined.png", "b-surprised.png", "b-sad.png", "b-excited.png", "b-joy.png", "pano-in.jpg", "pano-out.jpg", "s1.m4a", "laidback.m4a", "focus.m4a", "s2.m4a", "s3.m4a"];
self.addEventListener("install", function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(ASSETS); })
    .then(function(){ return self.skipWaiting(); }));
});
self.addEventListener("activate", function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.filter(function(k){ return k!==CACHE; })
      .map(function(k){ return caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});
self.addEventListener("fetch", function(e){
  if(e.request.method !== "GET") return;
  // the page itself: network-first so updates land immediately; cache is the offline fallback
  if(e.request.mode === "navigate"){
    e.respondWith(fetch(e.request).then(function(res){
      var copy = res.clone();
      caches.open(CACHE).then(function(c){ c.put("index.html", copy); });
      return res;
    }).catch(function(){ return caches.match("index.html"); }));
    return;
  }
  // static assets: cache-first for instant loads
  e.respondWith(caches.match(e.request, {ignoreSearch:true}).then(function(hit){
    if(hit) return hit;
    return fetch(e.request).then(function(res){
      var copy = res.clone();
      caches.open(CACHE).then(function(c){ c.put(e.request, copy); });
      return res;
    });
  }));
});
