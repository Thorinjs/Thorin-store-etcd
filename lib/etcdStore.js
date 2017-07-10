'use strict';
const Etcd = require('node-etcd3').Etcd;

/**
 * Created by snupa on 10/07/2017.
 */
module.exports = (thorin, opt) => {

  const config = Symbol(),
    client = Symbol();

  class ThorinEtcdStore extends thorin.Interface.Store {

    static publicName() {
      return "etcd";
    }

    constructor() {
      super();
      this.type = "etcd";
      this[config] = {};
      this[client] = null;
    }

    /*
    * Initialize the store with some config
    * */
    init(storeConfig) {
      this[config] = thorin.util.extend({
        debug: false,
        hosts: ["localhost:2379"],
        namespace: 'ens',
        required: true,
        options: {
          maxRetries: 2,
          timeout: 2000
        }
      }, storeConfig);
      thorin.config('store.' + this.name, this[config]);
    }

    /*
    * Builds a key by appending the store's namespace prefix.
    * */
    key(name) {
      if (typeof this[config].namespace !== 'string') return name;
      if (typeof name !== 'string') return name;
      if(name.charAt(0) !== '/') name = '/' + name;
      return this[config].namespace + name;
    }

    get logger() {
      return thorin.logger(this.name);
    }

    /*
    * Initializes the connection.
    * */
    run(done) {
      let cObj = new Etcd(this[config].hosts, this[config].options),
        logger = this.logger;
      cObj.get('status').then(() => {
        this[client] = cObj;
        done();
      }).catch((e) => {
        logger.warn(`Could not initiate etcd connection`);
        logger.warn(e);
        if(this[config].required) {
          return done(thorin.error('ETCD.CONNECTION', 'Could not establish a connection to etcd'));
        }
        this[client] = cObj;
        done();
      });
    }

    /*
    * Perform a SET.
    * Returns a promise.
    * */
    set(key, value) {
      if (typeof value === 'undefined' || value === null) {
        return Promise.reject(thorin.error('ETCD.DATA', 'Set value not valid', 400));
      }
      return this[client].set(key, value);
    }

    /*
    * Performs a GET.
    * Returns a promise.
    * */
    get(key) {
      return this[client].get(key);
    }

  }

  return ThorinEtcdStore;

};