angular.module('fAct.services', [
])

.factory('Fire', function( config, $q, $location, $rootScope ) {

  var refs = {};

  var models = {
    'invoices': {

      getPrice: function() {
        if (!this.lines) return 0;
        return this.lines.reduce(function(pv, cv) { return pv + parseFloat(cv.price * cv.quantity); }, 0.0);
      },

      getClient: function() {
        if (!this.client || !this.client.id || !this.clients[this.client.id]) return null;
        return this.clients[this.client.id];
      },

      getVAT: function() {
        return this.getATI() - this.getPrice();
      },

      getATI: function() {
        return this.getPrice() * (1 + this.vat / 100);
      },

      getPaid: function() {
        if (!this.payments) return 0;
        return this.payments.reduce(function(pv, cv) { return pv + parseFloat(cv.amount); }, 0.0);
      },

      getDue: function() {
        return Math.max(0, this.getATI() - this.getPaid());
      },

      getStatus: function() {
        if (!this.num) return 'draft';
        return this.getPaid() >= this.getATI() ? 'closed' : 'open';
      },

      getDecoratedStatus: function() {
        var status = this.getStatus();
        if (status === 'draft') return '<span class="label label-default">' + status + '</span>';
        if (status === 'open') return '<span class="label label-danger">' + this.num + '</span>';
        return '<span class="label label-success">' + this.num + '</span>';
      },

      open: function() {
        var deferred = $q.defer();
        var _this = this;
        service.collection('invoices').then(function(invoices) {
          // Set invoice num
          // get last opened invoice
          var last = _.max(_.filter(invoices, function(inv) {
            return inv.object.financialYear === config.financialYear;
          }), function(inv) { return inv.object.num || 0; });
          _this.num = config.financialYear + '.' + ('000' + (parseInt((last.object.num || 'yyyy.000').slice(5)) + 1)).slice(-3);

          // set date & due date
          _this.date = Date.now();
          _this.dueDate = config.dueDate(_this.date);
          deferred.resolve(_this);
        });
        return deferred.promise;
      },

      populate: function() {
        var deferred = $q.defer();
        if (!this.client || !this.client.id) return;
        var _this = this;
        service.get('clients', this.client.id).then(function(client) {
          _this.clients[client.id] = client;
          deferred.resolve(client);
        });
        return deferred.promise;
      },

      clients: {}
    },

    'clients': {},
    'planning': {}
  }

  var slashurl = function(url) {
    url = url || '';
    if (url[0] !== '/') url = '/' + url;
    if (url[url.length - 1]) url += '/';
    return url;
  }

  var getRef = function(url) {
    url = url ? slashurl(url) : '';
    if (!refs[url]) refs[url] = new Firebase(config.FirebaseUrl + url);
    return refs[url];
  }

  var extend = function(object, url) {
    var base = Object.create(models[url]);
    return _.extend(base, object);
  }

  var service = {

    auth: function() {
      var deferred = $q.defer();
      this.login(true).then(function(user) {
        $rootScope.user = user;
        deferred.resolve(true);
      }, function (error) {
        deferred.reject(error);
      });
      return deferred.promise;
    },

    login: function(dologin) {
      var deferred = $q.defer();
      var _this = this;
      var auth = new FirebaseSimpleLogin(getRef(), function(error, user) {
        if (config.debug) {
          console.log("FirebaseSimpleLogin", error, user);
        }
        if (error) deferred.reject(error);
        else if (user) deferred.resolve(user);
        else {
          if (dologin) {
            if (confirm(config.loginMessage)) auth.login(config.loginProvider);
            else deferred.reject(null);
          }
          else deferred.reject(null);
        }
      });
      return deferred.promise;
    },

    logout: function() {
      var deferred = $q.defer();
      var auth = new FirebaseSimpleLogin(getRef(), function(error) {
        auth.logout();
        if (error) deferred.reject(error);
        else deferred.resolve(null);
      });
      return deferred.promise;
    },

    collection: function(url) {
      var deferred = $q.defer();
      getRef(url).on('value', function(datasnapshot) {
        deferred.resolve(_.map(datasnapshot.val(), function(o, id) {
          return {
            "id": id,
            "url": url,
            //"ref": o.ref(),
            "object": extend(o, url)
          }
        }));
      });
      return deferred.promise;
    },

    create: function(url, src, id) {
      return {
        "id": id || null,
        "url": url,
        "object": extend(src || {}, url)
      }
    },

    live: function(url, id, success, failure) {
      getRef(url).on('value', function(datasnapshot) {
        var child = datasnapshot.child(id);
        if (child.val()) {
          success({
            "id": child.name(),
            "url": url,
            "ref": child.ref(),
            "object": extend(child.val(), url)
          });
        } else {
          failure();
        }
      });
    },

    get: function(url, id) {
      var deferred = $q.defer();
      getRef(url).on('value', function(datasnapshot) {
        var child = datasnapshot.child(id);
        if (child.val()) {
          deferred.resolve({
            "id": child.name(),
            "url": url,
            "ref": child.ref(),
            "object": extend(child.val(), url)
          });
        } else {
          deferred.reject('no data');
        }
      });
      return deferred.promise;
    },

    save: function(item) {
      var deferred = $q.defer();
      if (!item.ref) { // Temporary create an empty item
        if (!item.id) {
          item.ref = getRef(item.url).push({
            "temp": "something"
          });
        } else {
          item.ref = getRef(item.url + '/' + item.id);
        }
      }
      var obj = angular.copy(_.omit(item.object, _.keys(models[item.url])));
      item.ref.set(obj, function(err, o) {
        if (err) deferred.reject(err);
        else item.ref.on('value', function(datasnapshot) {
          deferred.resolve(datasnapshot.name());
        });
      });
      return deferred.promise;
    },

    delete: function(item) {
      var deferred = $q.defer();
      if (!item.ref) deferred.reject('Suppression impossible');
      else {
        item.ref.remove(function(err) {
          if (err) deferred.reject(err);
          else deferred.resolve('ok');
        });
      }
      return deferred.promise;
    },

    sorter: function(predicate) {
      return function(item) {
        if (!predicate) return;
        var predicates = predicate.split('.');

        var res = item.object;
        var ps = _.clone(predicates);
        while (ps.length) {
          var p = ps.shift();
          if (typeof res[p] === 'function') res = res[p]();
          else res = res[p];
        }
        return res;
      }
    },

    finder: function(predicates, query) {

      var comparator = function(obj, text) {
        text = (''+text).toLowerCase();
        return (''+obj).toLowerCase().indexOf(text) > -1;
      };
      var capitalize = function(str) {
        return str.replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
      };
      var find = function(arr, item) {
        var pos = arr.indexOf(item);
        return (pos !== -1) ? arr[pos] : false;
      }
      var _this = this;

      return function(item) {
        if (!predicates || !query) return true;

        var res = true;

        var tokens = query.split(' ');
        _.forEach(tokens, function(token) {
          var localres = false;
          var localPredicates = angular.copy(predicates);
          token = token.trim();

          // specified search (for exemple status:open only search on status key)
          var specific = token.split(':');
          if (specific.length > 1) {
            var predicate = find(localPredicates, specific[0]) || find(localPredicates, 'get' + capitalize(specific[0]));
            if (predicate) localPredicates = [predicate];
            token = specific[1];
          }

          _.forEach(localPredicates, function(predicate) {
            var value = _this.sorter(predicate)(item);
            localres = localres || comparator(value, token);
          })

          res = res && localres;

        });
        return res;

      }
    }

  }

  return service;

})

.factory('Flash', function( toaster, $location ) {

  var flashes = [];

  return {

    pop: function() {
      while(flashes.length) {
        var flash = flashes.pop();
        toaster.pop(flash.type || "success", flash.title || "", flash.message || flash || "", 2000);
      }
    },

    push: function(flash) {
      flashes.push(flash);
      return this;
    },

    redirect: function(to) {
      $location.path(to);
    },

    success: function(message, redirect) {
      this.push({ type: "success", message: message });
      if (redirect && $location.path() !== redirect) this.redirect(redirect);
      else this.pop();
    },

    error: function(message, redirect) {
      this.push({ type: "error", message: message });
      if (redirect && $location.path() !== redirect) this.redirect(redirect);
      else this.pop();
    }

  }
})

.factory('multi', function() {

  var templates = {};

  return {
    addTemplates: function(tmpls) {
      templates = _.extend(templates, tmpls);
    },
    add: function(o, what) {
      if (!o.object[what] || !angular.isArray(o.object[what])) o.object[what] = [];
      o.object[what].push(angular.copy(templates[what]));
    },
    remove: function(o, what, idx) {
      o.object[what].splice(idx, 1);
    }
  }

})
