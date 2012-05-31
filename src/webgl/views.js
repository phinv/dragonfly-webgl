﻿"use strict";

window.cls || (window.cls || {});
cls.WebGL || (cls.WebGL = {});

/**
 * @constructor
 * @extends ViewBase
 */
cls.WebGLTraceView = function(id, name, container_class)
{
  this._state = null;
  this._container = null;

  this.createView = function(container)
  {
    this._container = container;
    this._trace = new cls.WebGLTrace();
    this._table = this._table || 
                           new SortableTable(this.tabledef, null, null, null, null, false, "trace-table");

    this._render();
  };

  this.ondestroy = function() 
  {
  };

  this._render = function()
  {
    if ((window.webgl.contexts.length > 0) && (this._trace_data)) {
      this._container.clearAndRender(this._table.render());
    }
    else if (window.webgl.contexts.length > 0)
    {
      this._container.clearAndRender(
        ['div',
         ['p', "No trace available."],
         'class', 'info-box'
        ]
      );
    }
    else
    {
      this._container.clearAndRender(
        ['div',
         ['p', "No WebGLContext present..."],
         'class', 'info-box'
        ]
      );
    }
  };

  this._on_refresh = function()
  {
    if (window.webgl.contexts[0]) // TODO temporary
    {
      this._trace.get_trace(window.webgl.contexts[0]); // TODO temp
    }
    else
    {
      alert("WebGL is not present"); // TODO remove
    }
  };

  this._on_new_trace = function(msg)
  {
    var trace = this._trace.trace_data[msg];
    var tbl_data = [];
    for (var i = 0; i < trace.length; i++)
    {
      var call_text = trace[i].function_name + "(" + trace[i].args.join(", ") + ")";
      if (trace[i].has_error) call_text += " -> Error code: " + String(trace[i].error_code)
      tbl_data.push({"number" : String(i + 1), "call" : call_text});
    }
    this._table.set_data(tbl_data);
    this._trace_data = trace;
    this._container.clearAndRender(this._table.render());
  };

  this.tabledef = {
    column_order: ["number", "call"],
    columns: {
      number: {
        label: "Number",
        sorter: "unsortable"
      },
      call: {
        label: "Function call",
        sorter: "unsortable"
      }
    }
  };

  var eh = window.eventHandlers;
  eh.click["refresh-webgl-trace"] = this._on_refresh.bind(this);

  messages.addListener('webgl-new-trace', this._on_new_trace.bind(this));

  this.init(id, name, container_class);
};

cls.WebGLTraceView.create_ui_widgets = function()
{
  new ToolbarConfig(
    'webgl_trace',
    [
      {
        handler: 'refresh-webgl-trace',
        title: "Refresh the trace",
        icon: 'reload-webgl-trace'
      }
    ],
    null
  );
}

cls.WebGLTraceView.prototype = ViewBase;



cls.WebGLStateView = function(id, name, container_class)
{
  this._state = null;
  this._sortable_table;
  this._container = null;

  this.createView = function(container)
  {
    this._container = container;
    this._table = this._table || 
                           new SortableTable(this.tabledef, null, null, null, null, false, "state-table");



    if (window.webgl.available())
    {
      // TODO: Temporary
      window.webgl.request_state(window.webgl.contexts[0]);
      //window.webgl.request_state(this._selected_context);
    }

    this._render();
  };

  this.ondestroy = function() 
  {
    // TODO remove listeners

  };

  this.clear = function ()
  {
    this._state = null;

    if (window.webgl.available())
    {
      // TODO: Temporary
      window.webgl.request_state(window.webgl.contexts[0]);
      //window.webgl.request_state(this._selected_context);
    }

    this._render();
  };

  this._render = function()
  {
    if (!this._container)
    {
      return;
    }

    if ((window.webgl.contexts.length > 0) && (this._state)) {
      this._container.clearAndRender(this._table.render());
    }
    else if (window.webgl.contexts.length > 0)
    {
      this._container.clearAndRender(
        ['div',
         ['p', "Loading WebGL state..."],
         'class', 'info-box'
        ]
      );
    }
    else
    {
      this._container.clearAndRender(
        ['div',
         ['p', "No WebGLContext present..."],
         'class', 'info-box'
        ]
      );
    }
  };

  this._on_new_state = function(msg)
  {
    var state = msg.state;
    var tbl_data = [];
    for (var pname in state)
    {
      tbl_data.push({"variable" : pname, "value" : state[pname]});
    }
    this._table.set_data(tbl_data);
    this._state = msg.state;
    this._container.clearAndRender(this._table.render());
  };

  this._on_refresh = function()
  {
    if (window.webgl.available())
    {
      // TODO: Temporary
      window.webgl.request_state(window.webgl.contexts[0]);
      //window.webgl.request_state(this._selected_context);
    }
  };

  this.tabledef = {
    column_order: ["variable", "value"],
    columns: {
      variable: {
        label: "State Variable", // TODO
        classname: "col-pname"
      },
      value: {
        label: "Value",
        sorter: "unsortable"
      }
    }
  };


  var eh = window.eventHandlers;

  eh.click["refresh-webgl-state"] = this._on_refresh.bind(this);

  messages.addListener('webgl-new-state', this._on_new_state.bind(this));
  messages.addListener('webgl-clear', this.clear.bind(this));

  this.init(id, name, container_class);
}

cls.WebGLStateView.prototype = ViewBase;



cls.WebGLStateView.create_ui_widgets = function()
{
  new ToolbarConfig(
    'webgl_state',
    [
      {
        handler: 'refresh-webgl-state',
        title: "Refresh the state", // TODO
        icon: 'reload-webgl-state'
      }
    ],
    null,
    null,
    [
      {
        handler: 'select-webgl-context',
        title: "Select WebGL context", // TODO
        type: 'dropdown',
        class: 'context-select-dropdown',
        template: window['cst-selects']['context-select'].getTemplate()
      }
    ]
  );
}


cls.ContextSelect = function(id)
{
  var selected_value = "LOL";



  this.init(id);
};

cls.ContextSelect.prototype = new CstSelect();

