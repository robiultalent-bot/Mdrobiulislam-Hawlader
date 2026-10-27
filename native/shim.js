(function () {
  var cbs = {}, n = 0;
  window.__ntResolve = function (id, ok, payload) {
    var c = cbs[id];
    if (!c) return;
    delete cbs[id];
    if (ok) c.res(payload); else c.rej(payload);
  };
  window.flutter_inappwebview = {
    callHandler: function (name) {
      var args = Array.prototype.slice.call(arguments, 1);
      return new Promise(function (res, rej) {
        var id = "c" + (++n);
        cbs[id] = { res: res, rej: rej };
        try {
          window.AndroidTTS.call(name, JSON.stringify(args), id);
        } catch (e) {
          delete cbs[id];
          rej(e);
        }
      });
    }
  };
})();