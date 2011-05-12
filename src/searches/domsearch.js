var DOMSearch = function(min_length)
{
  this._init_super = this._init;

  this._onsearchtypechange = function(event)
  {
  	switch (event.target.name)
  	{
  		case 'dom-search-type':
  		{
  			this.search_type = parseInt(event.target.value);
  			break;
  		}
  		case 'dom-search-ignore-case':
  		{
  			this.ignore_case = Number(event.target.checked);
  			break;
  		}
  	}
  }.bind(this);

  this._init = function(min_length)
  {
  	this._init_super(min_length);
  	this.search_type = DOMSearch.PLAIN_TEXT;
  	this.ignore_case = 1;

  	window.eventHandlers.change['dom-search-type-changed'] = this._onsearchtypechange;
  };

  this._last_query = '';
  this._last_search_type = 0;

  this._handle_search = function()
  {
    window.views.dom.update();
  }.bind(this);

  this.highlight_next = function()
  {
  	if (this._input.value != this._last_query ||
        this.search_type != this._last_search_type)
    {
      this._last_query = this._input.value;
      this._last_search_type = this.search_type;
      window.dom_data.search(this._last_query,
                             this.search_type,
                             this.ignore_case,
                             0,
                             this._handle_search)
    }
  };

  this.highlight_previous = function()
  {
  	
  };

  this.search_delayed = function(event)
  {
  	
  };

  this._init(min_length);
};

DOMSearch.prototype = TextSearch.prototype;

DOMSearch.PLAIN_TEXT = 1;
DOMSearch.REGEXP = 2;
DOMSearch.XPATH = 3;
DOMSearch.CSS = 4;