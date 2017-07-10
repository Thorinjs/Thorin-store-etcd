'use strict';
/*
* Checks if the given error contains any kind of etcd error
* */
function parseError(e) {
  if(e.ns === 'STORE.ETCD') return true;
  if(e.code && e.code.indexOf('ETCD') === 0) {
    e.ns = 'STORE.ETCD';
    return true;
  }
}

module.exports = parseError;