var API = (function() {

  /**
   * @class
   * @constructor
   * @param {object} options
   */
  var API = function (options) {

    // set options object
    this.options = options;
  };

  /**
   * Retrieve the data from the API
   *
   * @method getData
   * @param {object} options
   */
  API.prototype.getData = function(options) {

    var _this = this;

    // start request
    var requestUrl = this.buildRequestURL(options.path);
    var request = new XMLHttpRequest();
    request.open('GET', requestUrl, true);

    // set callback options
    request.onload = function(e) {
      var isReady = (this.readyState === 4);

      // if status is OK, call success callback
      if (isReady && (this.status === 200)) {
        var parsedResponse = JSON.parse(this.response);
        options.onSuccess(parsedResponse);
      // else check for 404 or 500 status and call error callback
      } else if ((isReady && (this.status === 404)) || (isReady && (this.status === 500))) {
        options.onError(e);
      }
    };

    request.onerror = function(e) {
      options.onError(e);
    };
    
    request.send(null);
  };

  /**
   * Build request URL
   *
   * @method buildRequestURL
   * @param {string} path
   */
  API.prototype.buildRequestURL = function(path) {
    return 'http://api.chartbeat.com/' + path + this.options.version + '?apikey=' + this.options.apiKey + '&host=' + this.options.host;
  };

  // return object
  return API;

})();