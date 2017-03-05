var App = (function() {

  /**
   * @class
   * @constructor
   * @param {object} options
   */
  var App = function (options) {

    // set options object
    this.options = options;

    // intialize flag for setting action on list items
    this.actionSet;

    // initialize flag for if referrer page is open
    this.isReferrerPageOpen;

    this.articleListContainer = document.querySelector('.articles');
    this.detailsListContainer = document.querySelector('.details');

    this.chartbeatAPI = new API({
      host: this.options.host,
      apiKey: this.options.apiKey,
      version: this.options.version
    });

    this.buildPage();
  };


  /**
   * Generate page UI
   *
   * @method buildPage
   */
  App.prototype.buildPage = function() {
    var _this = this;

    this.drawPagesList(this.startPolling.bind(this));
  };

  /**
   * Kick off retrieving data and drawing lists
   *
   * @method drawPagesList
   * @param {function} onComplete
   */
  App.prototype.drawPagesList = function(onComplete) {
    var _this = this;

    this.getTopPagesData(function(data){
      _this.generateArticleList(data, onComplete);

      // if referrer page is open, regenerate its list
      if (_this.isReferrerPageOpen) {
        var listElement = document.querySelector('.details ul');
        var index = listElement.dataset.index;
        _this.generateReferrerList(data, index);
      }
    }, this.displayError);
  };

  /**
   * Get top pages data from API
   *
   * @method getTopPagesData
   * @param {function} onComplete
   * @param {function} onError
   */
  App.prototype.getTopPagesData = function(onComplete, onError) {
    this.chartbeatAPI.getData({
      path: this.options.path,
      onSuccess: onComplete,
      onError: onError
    });
  };

    /**
   * Generate DOM structure for article list
   *
   * @method generateArticleList
   * @param {object} data
   * @param {function} onComplete
   */
  App.prototype.generateArticleList = function(data, onComplete){

    var _this = this;

    // check if list exists
    var list = document.querySelector('.articles ul');

    if (list) {
      // destroy if exists
      this.articleListContainer.removeChild(list);
    }

    // generate DOM fragment for new article list
    var listElement = document.createElement('ul');
    data.pages.forEach(function(value, index){
      // make list element
      var itemElement = document.createElement('li');

      // add data-index attribute
      itemElement.dataset.index = index;

      // insert visitor data and title data
      var visitorsElement = document.createElement('span');
      var visitors = document.createTextNode(value.stats.people);
      visitorsElement.appendChild(visitors);
      var titleElement = document.createElement('span');
      var title = document.createTextNode(value.title);
      titleElement.appendChild(title);

      //compile
      itemElement.appendChild(visitorsElement);
      itemElement.appendChild(titleElement);

      // add to list
      listElement.appendChild(itemElement);
    });

    // add to container
    this.articleListContainer.appendChild(listElement);

    if (!this.actionSet) {
      this.setArticleListAction(data);
    }

    // all done
    if(onComplete && typeof onComplete === 'function'){
      onComplete();
    }
  };

  /**
   * Sets click event listener on article container
   *
   * @method setArticleListAction
   * @param {object} data
   */
  App.prototype.setArticleListAction = function(data) {

    var _this = this;

    // set event listener on article container
    this.articleListContainer.addEventListener('click', function(e) {

      // delegate event handler to list items and children (span elements)
      if (e.target.nodeName.toLowerCase() === 'li' || e.target.nodeName.toLowerCase() === 'span') {

        // get index from data attribute
        var index = e.target.dataset.index || e.target.parentElement.dataset.index
        // build referrer list
        _this.generateReferrerList(data, index);
      }

      e.preventDefault();
    });

    // set flag to true to avoid attaching listeners again
    this.actionSet = true;
  };

  /**
   * Places error into UI
   *
   * @method displayError
   * @param {object} data
   */
  App.prototype.displayError = function(data){
    // make error element
    var errorElement = document.createElement('div');
    var errorMessage = document.createTextNode('Uh oh. Something went wrong!');
    errorElement.appendChild(errorMessage);
    errorElement.classList.add('error');

    var mainContainer = document.querySelector('main');
    mainContainer.appendChild(errorElement);
  };

  /**
   * Generate DOM structure for referrer list
   *
   * @method generateReferrerList
   * @param {object} data
   * @param {number} index
   */
  App.prototype.generateReferrerList = function(data, index){

    // check if header and list exist
    var header = document.querySelector('.details h1');
    var list = document.querySelector('.details ul');

    if (header && list) {
      // destroy if exists
      this.detailsListContainer.removeChild(header);
      this.detailsListContainer.removeChild(list);
    }

    // generate DOM fragment for new referrer list
    var titleElement = document.createElement('h1');
    var title = document.createTextNode(data.pages[index].title + ' referrers');
    titleElement.appendChild(title);

    var listElement = document.createElement('ul');

    data.pages[index].stats.toprefs.forEach(function(value, index){
      // make list element
      var itemElement = document.createElement('li');

      // insert visitor data and title data
      var visitorsElement = document.createElement('span');
      var visitors = document.createTextNode(value.visitors);
      visitorsElement.appendChild(visitors);
      var domainElement = document.createElement('span');
      var domain = document.createTextNode(value.domain);
      domainElement.appendChild(domain);

      //compile
      itemElement.appendChild(visitorsElement);
      itemElement.appendChild(domainElement);

      // add to list
      listElement.appendChild(itemElement);
    });

    // set data-index attribute
    listElement.dataset.index = index;

    // add to container
    this.detailsListContainer.appendChild(titleElement);
    this.detailsListContainer.appendChild(listElement);

    this.isReferrerPageOpen = true;
  };

  /**
   * Start polling for updates from API
   *
   * @method startPolling
   */
  App.prototype.startPolling = function(){
    var _this = this;

    var pollInterval = setInterval(_this.drawPagesList.bind(this), this.options.intervalTime);
  };

  /**
   * @todo Write function to clear
   * @todo setInterval, for more
   * @todo control.
   */

   App.prototype.clearPolling = function(){
    // clear setInterval
   };

  //return object
  return App;

})();