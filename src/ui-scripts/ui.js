﻿var UI = function()
{
  /*

    static methods
      UI.get_instance
  */
  if (UI.instance)
  {
    return UI.instance;
  }
  UI.instance = this;

  this._tabbars = {};
  this._modebars = {};
  this._overlays = {};

   /* interface */
 
   /**
     * To get a tabbar by it's id.
     * @param {String} tabbar_id.
     * @returns an instance of Tabbar.
     */
    this.get_tabbar = function(id){};
    
    this.get_modebar = function(id){};

    this.get_overlay = function(id){};

    this.register_tabbar = function(id, tabs){};
    
    this.register_modebar = function(id, modebar){};

    this.register_overlay = function(id, items){};
    
    this.show_view = function(id){};


    /* implemenation */
    this.get_tabbar = function(id)
    {
      return this._tabbars[id] || null;
    };
    
    this.get_modebar = function(id)
    {
      return this._modebars[id] || null;
    };

    this.get_overlay = function(id)
    {
      return this._overlays[id] || null;
    };

    this.register_tabbar = function(id, tabs)
    {
      if (!this._tabbars[id])
      {
        this._tabbars[id] = new Tabbar(id, tabs);
      }
      return this._tabbars[id];
    };
    
    this.register_modebar = function(id, _class)
    {
      if (!this._modebars[id])
      {
        this._modebars[id] = new _class();
      }
      return this._modebars[id];
    };

    this.register_overlay = function(id, items)
    {
      if (!this._overlays[id])
      {
        this._overlays[id] = items;
      }
      return this._overlays[id];
    };

    this.show_view = function(id)
    {
      // TODO make topCell a private member of UI
      if (window.topCell)
      {
        window.topCell.showView(id);
      }
    };

    this.get_button = function(id)
    {
      // TODO: make this a bit more sophisticated
      return document.getElementById(id);
    };

    this.get_mode_tab = function(id)
    {
      return TabBase.get_tab_by_ref_id(id);
    };
}

UI.get_instance = function()
{
  return this.instance || new UI();
};

