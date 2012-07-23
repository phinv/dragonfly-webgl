﻿"use strict";

window.cls || (window.cls = {});
cls.WebGL || (cls.WebGL = {});

/**
 * @constructor
 * @extends ViewBase
 */
cls.WebGLTraceView = function(id, name, container_class)
{
  this._container = null;
  this._current_trace = null;
  this._loading_snapshot = false;

  this.createView = function(container)
  {
    this._container = container;
    this._table = this._table ||
                           new SortableTable(this.tabledef, null, null, null, null, false, "trace-table");
    this._render();
  };

  this.ondestroy = function()
  {
    this._container = null;
  };

  this._render = function()
  {
    if (!this._container) return;

    if (this._loading_snapshot)
    {
      this._container.clearAndRender(window.templates.webgl.taking_snapshot());
      return;
    }

    var snapshot = window['cst-selects']['snapshot-select'].get_selected_snapshot();

    if (window.webgl.runtime_id === -1)
    {
      this._container.clearAndRender(window.templates.webgl.reload_info());
    }
    else if (snapshot != null)
    {
      var trace = snapshot.trace;
      this._current_trace = trace;
      var template = window.templates.webgl.trace_table(trace, this.id);
      this._container.clearAndRender(template);
    }
    else if (window.webgl.available())
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
    var ctx_id = window['cst-selects']['snapshot-select'].get_selected_context();
    if (ctx_id != null)
    {
      window.webgl.request_snapshot(ctx_id);
      this._loading_snapshot = true;
    }
  };

  this._on_row_click = function(evt, target)
  {
    var call_index = target["data-call-number"];
    var snapshot = window['cst-selects']['snapshot-select'].get_selected_snapshot();
    var trace_call = snapshot.trace[call_index];
    var template = null;
    var view;
    var tab;
    var real_arg;
    var arg_found = false;
    
    if (trace_call.drawcall)
    {
      tab = "webgl_draw_call";
      view = window.views.webgl_draw_call;
      arg_found = true;
    }
    else
    {
      for (var i=0; i<trace_call.args.length && (!arg_found); i++)
      {
        var arg = trace_call.args[i];
        var type = arg.type;
        switch (type)
        {
          case "WebGLTexture":
              arg_found = true;
              tab = "webgl_texture_call";
              view = window.views.webgl_texture_call;
              template = window.templates.webgl.texture(arg.texture);
              arg.texture.show();
              break;
          case "WebGLBuffer":
              arg_found = true;
              tab = "webgl_buffer_call";
              view = window.views.webgl_buffer_call;
              template = window.templates.webgl.buffer_base(arg.buffer);
              real_arg = arg;
              arg.buffer.show();
              break;
          case "WebGLUniformLocation":
              arg_found = true;
              tab = "webgl_program_call";
              view = window.views.webgl_program_call;
              template = window.templates.webgl.program(call_index, arg.program);
              real_arg = arg;
              break;
          default: 
              break;
        }
      }
    }
    if (!arg_found)
    {
      tab = "webgl_call";
      view = window.views.webgl_call;
    }
    window.views.webgl_mode.cell.children[0].children[0].tab.setActiveTab(tab);
    view.display_by_call(snapshot, call_index, template, real_arg);
  };

  this._on_argument_click = function(evt, target)
  {
    var arg = target["data-linked-object"];
    arg.action();
  };

  this._on_take_snapshot = function()
  {
    window.views.webgl_mode.cell.children[1].children[0].tab.setActiveTab("trace-side-panel");
    this._container.clearAndRender(window.templates.webgl.taking_snapshot());
    this._loading_snapshot = true;
  };

  this._on_changed_snapshot = function()
  {
    window.views.webgl_mode.cell.children[1].children[0].tab.setActiveTab("trace-side-panel");
    this._loading_snapshot = false;
    this._render();
  };

  this.tabledef = {
    column_order: ["number", "call"],
    handler: "webgl-trace-table",
    idgetter: function(res) { return res; },
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
  eh.click["webgl-trace-refresh"] = this._on_refresh.bind(this);
  eh.click["webgl-trace-row"] = this._on_row_click.bind(this);
  eh.click["webgl-trace-argument"] = this._on_argument_click.bind(this);

  messages.addListener('webgl-changed-snapshot', this._on_changed_snapshot.bind(this));
  messages.addListener('webgl-take-snapshot', this._on_take_snapshot.bind(this));

  this.init(id, name, container_class);
};

cls.WebGLTraceView.create_ui_widgets = function()
{
  new ToolbarConfig(
    'trace-side-panel',
    [
      {
        handler: 'webgl-trace-refresh',
        title: "Refresh the trace",
        icon: 'reload-webgl-trace'
      }
    ],
    null,
    null,
    [
      {
        handler: 'select-webgl-snapshot',
        title: 'Select Snapshot',
        type: 'dropdown',
        class: 'context-select-dropdown',
        template: window['cst-selects']['snapshot-select'].getTemplate()
      }
    ]
  );
};

cls.WebGLTraceView.prototype = ViewBase;
