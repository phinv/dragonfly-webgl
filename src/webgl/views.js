﻿"use strict";

window.cls || (window.cls = {});
cls.WebGL || (cls.WebGL = {});

/* Settings view for snapshots */
cls.WebGLSnapshotView = function(id, name, container_class)
{
  this.init(id, name, container_class);
};

cls.WebGLSnapshotView.create_ui_widgets = function()
{
  var checkboxes =
  [
    'fbo-readpixels',
    'stack-trace'
  ];

  var on_change_stacktrace = function (enabled)
  {
    if (enabled)
    {
      /* When this option is enabled, there is no use in having the "break on
       * exceptions" option set, as it will break for every call that webgl
       * does..
       */
      window.settings['js_source'].set('error', false);
    }
  };

  new Settings
  (
    // id
    'webgl-snapshot',
    // key-value map
    {
      'fbo-readpixels' : true,
      'stack-trace' : false,
      'history_length' : 4,
      'snapshot_delay' : 4
    },
    // key-label map
    {
      'history-length': "Object history length",
      'fbo-readpixels': "Read pixels from framebuffer after draw calls",
      'snapshot-delay': "Set a timer for taking snapshots",
      'stack-trace': "Get WebGL call reference"
    },
    // settings map
    {
      checkboxes: checkboxes,
      customSettings:
      [
        'history_length',
        'snapshot_delay'
      ],
    },
    // template
    {
      'history_length':
      function(setting)
      {
        return (
        [
          'setting-composite',
          ['label',
            setting.label_map['history-length'] + ': ',
            ['input',
              'type', 'number',
              'handler', 'set-history-size',
              'max', '128',
              'min', '0',
              'value', setting.get('history_length')
            ]
          ]
        ] );
      },
      'snapshot_delay':
      function(setting)
      {
        return (
        [
          'setting-composite',
          ['label',
            setting.label_map['snapshot-delay'] + ': ',
            ['input',
              'type', 'number',
              'handler', 'set-snapshot-delay',
              'max', '60',
              'min', '0',
              'value', setting.get('snapshot_delay')
            ]
          ]
        ] );
      }
    },
    "webgl",
    {
      'stack-trace': on_change_stacktrace.bind(this)
    }
  );

  var eh = window.eventHandlers;
  eh.change['set-history-size'] = function(event, target)
  {
    var history_size = Number(event.target.value);
    settings['webgl-snapshot'].set('history_length', history_size);
  }

  eh.change['set-snapshot-delay'] = function(event, target)
  {
    var snapshot_delay = Number(event.target.value);
    settings['webgl-snapshot'].set('snapshot_delay', snapshot_delay);
  }
};

/* General settings view */
cls.WebGLGeneralView = function(id, name, container_class)
{
  this.init(id, name, container_class);
}

cls.WebGLGeneralView.create_ui_widgets = function()
{
  var checkboxes =
  [
    'enable-debugger',
    'highlight-objects'

  ];

  new Settings
  (
    // id
    'webgl-general',
    // key-value map
    {
      'enable-debugger' : true,
      'highlight-objects' : true
    },
    // key-label map
    {
      'enable-debugger': "Enable the WebGL Debugger",
      'highlight-objects': "Highlight objects in the trace list"
    },
    // settings map
    {
      checkboxes: checkboxes,
    },
    // template
    {
    },
    "webgl"
  );

  var eh = window.eventHandlers;
  eh.change['set_max_preview_size'] = function(event, target)
  {
    var preview_size = Number(event.target.value);
    settings['webgl-general'].set('max_preview_size', preview_size);
  };
};

/* Preview settings view */
cls.WebGLPreviewView = function(id, name, container_class)
{
  this.init(id, name, container_class);
}

cls.WebGLPreviewView.create_ui_widgets = function()
{
  var checkboxes =
  [
    'front-face-normal',
    'back-face-normal'
  ];

  new Settings
  (
    // id
    'webgl-preview',
    // key-value map
    {
      'front-face-normal' : false,
      'back-face-normal' : true,
      'max_preview_size' : 128 // In KB
    },
    // key-label map
    {
      'front-face-normal': "Show normal on front facing triangles",
      'back-face-normal': "Show normal on back facing triangles",
      'max_preview_size': "Max size of automatic buffer preview"
    },
    // settings map
    {
      checkboxes: checkboxes,
      customSettings:
      [
        'max_preview_size'
      ]
    },
    // template
    {
      'max_preview_size':
      function(setting)
      {
        return (
        [
          'setting-composite',
          ['label',
            setting.label_map['max_preview_size'] + ': ',
            ['input',
              'type', 'number',
              'handler', 'set_max_preview_size',
              'max', '10240', // Roughly 10 Megabyte
              'min', '0',
              'value', setting.get('max_preview_size')
            ],
            'kB'
          ]
        ] );
      }
    },
    "webgl"
  );

  var eh = window.eventHandlers;
  eh.change['set_max_preview_size'] = function(event, target)
  {
    var preview_size = Number(event.target.value);
    settings['webgl-preview'].set('max_preview_size', preview_size);
  };


};

/**
 * Base class for all call views.
 * @constructor
 * @extends ViewBase
 */
cls.WebGLCallView = Object.create(ViewBase, {
  _container: {
    writable: true,
    value: null
  },
  _render_enabled: {
    writable: true,
    value: true
  },
  createView: {
    writable: true, configurable: true,
    value: function(container)
    {
      this._container = container;
      if (this._render_enabled) this.render();
      cls.WebGLCallView.active_view = this;
    }
  },
  ondestroy: {
    writable: true, configurable: true,
    value: function()
    {
      this._container = null;
      cls.WebGLCallView.active_view = null;
    }
  },
  render: {
    value: function()
    {
      if (!this._container)
      {
        this._render_enabled = false;
        window.views.webgl_mode.cell.children[0].children[0].tab.setActiveTab(this.id);
        this._render_enabled = true;
      }
      if (this._template)
      {
        this._container.clearAndRender(this._template);
      }
      else
      {
        this._container.clearAndRender(["div", "Take a snapshot and then select a call, buffer or texture."]);
      }
    }
  },
  display_call: {
    value: function(snapshot, call_index)
    {
      if (!this._container)
      {
        this._render_enabled = false;
        window.views.webgl_mode.cell.children[0].children[0].tab.setActiveTab(this.id);
        this._render_enabled = true;
      }

      this._snapshot = snapshot;
      this._call_index = call_index;

      this._render.apply(this, arguments);
    }
  },
  render_with_header: {
    value: function(snapshot, call_index, template)
    {
      if (call_index === -1)
      {
        template = window.templates.webgl.info_with_header(template);
      }
      else
      {
        var trace = snapshot.trace[call_index];
        var state_parameters = snapshot.state.get_function_parameters(trace.function_name, call_index, true);
        template = window.templates.webgl.call_with_header(call_index, trace, state_parameters, template);
      }
      this._template = template;

      this._container.clearAndRender(template);
    }
  },
  show_full_state_table: {
    value: function()
    {
      var parameters = this._snapshot.state.get_all_parameters(this._call_index, true);
      var data = [];
      for (var key in parameters)
      {
        if (!parameters.hasOwnProperty(key)) continue;
        var param = parameters[key];
        data.push({
          parameter: String(key),
          value: window.templates.webgl.state_parameter(key, param)
        });
      }
      this._state_table.set_data(data);
    }
  },
  toggle_state_list: {
    value: function()
    {
      if (!this._container) return;
      this._full_state = !this._full_state;

      var state_container = document.getElementById("webgl-state-table-container");
      if (this._full_state)
      {
        this.show_full_state_table();
        state_container.clearAndRender(this._state_table.render());
      }
      else
      {
        var trace = this._snapshot.trace[this._call_index];
        var state_parameters = this._snapshot.state.get_function_parameters(trace.function_name, this._call_index, true);
        var state = window.templates.webgl.state_parameters(state_parameters);
        state_container.clearAndRender(state);
      }

      var state_toggle = document.getElementById("webgl-state-table-text");
      state_toggle.textContent = "Show " + (this._full_state ? "a selection of" : "all") + " parameters";
    }
  }
});


// Add listeners and methods for call view events.
cls.WebGLCallView.initialize = function()
{
  var tabledef = {
    handler: "webgl-state-table",
    column_order: ["parameter", "value"],
    columns: {
      parameter: {
        label: "Parameter"
      },
      value: {
        label: "Value"
      }
    },
    groups: {
      type: {
        label: "Parameter type", // TODO
        // TODO use the parameter groups
        grouper : function (res) { return Math.round(Math.random() * 5); },
      }
    }
  };

  this._state_table = new SortableTable(tabledef, null, ["parameter", "value"], null, null, false, "state-table");

  var on_goto_script_click = function(evt, target)
  {
    var line = parseInt(target.getAttribute("data-line"));
    var script_id = parseInt(target.getAttribute("data-script-id"));

    var sourceview = window.views.js_source;
    window.runtimes.setSelectedScript(script_id);
    UI.get_instance().show_view("js_mode");
    if (sourceview)
    {
      sourceview.show_and_flash_line(script_id, line);
    }
  };

  var on_speclink_click = function(evt, target)
  {
    window.open(target.getAttribute("function_name"));
  };

  var on_toggle_state_list = function(evt, target)
  {
    var view = cls.WebGLCallView.active_view;
    if (view)
    {
      view.toggle_state_list();
    }
  };


  var eh = window.eventHandlers;
  eh.click["webgl-speclink-click"] = on_speclink_click;
  eh.click["webgl-drawcall-goto-script"] = on_goto_script_click;
  eh.click["webgl-toggle-state-list"] = on_toggle_state_list;
};

cls.WebGLSnapshotSelect = function(id)
{
  this._snapshot_list = [{}];
  this.disabled = true;
  this._selected_snapshot_index = null;
  this._selected_context_id = null;
  this._highlighting = null;

  this.getSelectedOptionText = function()
  {
    if (this.disabled)
    {
      return "No WebGL contexts available.";
    }
    else if (this._selected_context_id != null && this._selected_snapshot_index != null)
    {
      var snapshot = window.webgl.snapshots[this._selected_context_id][this._selected_snapshot_index];
      return "WebGLSnapshot #" + this._selected_snapshot_index + " (frame: " + snapshot.frame + ")";
    }
    else
    {
      return "No Snapshot available...";
    }
  };

  this.getSelectedOptionValue = function()
  {
  };

  /**
   * Returns the id of the context that is currently selected.
   * Returns null if there is no context selected.
   */
  this.get_selected_context = function()
  {
    return this._selected_context_id;
  };

  /**
   * Return the snapshot that is currently selected.
   *
   */
  this.get_selected_snapshot = function()
  {
    if (this._selected_context_id != null && this._selected_snapshot_index != null)
    {
      return window.webgl.snapshots[this._selected_context_id][this._selected_snapshot_index];
    }
    return null;
  };

  this.getTemplate = function()
  {
    var select = this;
    return function(view)
    {
      return window.templates['cst-select'](select, select.disabled);
    };
  };

  this.templateOptionList = function(select_obj)
  {
    var ret = ["div"];
    var snapshots = select_obj._snapshot_list;

    var contexts = window.webgl.contexts;

    // Iterating the contexts.
    for (var i = 0; i < contexts.length; i++)
    {
      var context_id = contexts[i];
      ret.push([
        "cst-webgl-title",
        "WebGLContext #" + i,
        "context-id", context_id,
        "class", "js-dd-dir-path"
      ]);

      if (context_id in snapshots)
      {
        // Iterating the snapshots in that context.
        for (var j = 0; j < snapshots[context_id].length; j++)
        {
          ret.push([
            "cst-option",
            "Snapshot #" + j,
            "snapshot-index", j,
            "context-index", i,
            "context-id", context_id,
            "unselectable", "on"
          ]);
        }
      }

      ret.push([
        "cst-option",
        "Take snapshot",
        "context-id", context_id,
        "take-snapshot", true,
      ]);
    }

    ret.push("handler", "webgl-select-context");

    return ret;
  };

  this.checkChange = function(target_ele)
  {
    var context_id = target_ele['context-id'];
    var snapshot_index = target_ele['snapshot-index'];
    var take_snapshot = target_ele['take-snapshot'];

    if (take_snapshot !== undefined)
    {
      window.webgl.request_snapshot(context_id);
      this._selected_context_id = context_id;
      this._selected_snapshot_index = null;
      clear_spotlight();
      return false;
    }
    else if (snapshot_index != null && this._selected_snapshot_index !== snapshot_index)
    {
      this._selected_context_id = context_id;
      this._selected_snapshot_index = snapshot_index;
      messages.post('webgl-changed-snapshot', window.webgl.snapshots[context_id][snapshot_index]);
      clear_spotlight();
      return true;
    }
    return false;
  };

  /**
   * Reloads the tab if it is currently shown.
   */
  var refresh_tab = function()
  {
    var tab = "webgl_mode";
    if (window.topCell.tab.activeTab === tab)
    {
      window.topCell.tab.setActiveTab(tab, true);
    }
  };

  var on_new_context = function(ctx_id)
  {
    if (!this.disabled) return;
    this.disabled = false;
    this._selected_context_id = ctx_id;
    refresh_tab();
  };

  var on_new_snapshot = function(ctx_id)
  {
    var snapshots = window.webgl.snapshots;
    this.disabled = !window.webgl.available();
    this._snapshot_list = snapshots;

    this._selected_context_id = ctx_id;
    this._selected_snapshot_index = snapshots[ctx_id].length - 1;

    var snapshot = snapshots[ctx_id].get_latest_snapshot();
    messages.post("webgl-changed-snapshot", snapshot);
    this.updateElement();
  };

  var clear = function()
  {
    this._selected_snapshot_index = null;
    this._selected_context_id = null;
    clear_spotlight();

    if (!this.disabled)
    {
      this.disabled = true;
      refresh_tab();
    }
  };

  var clear_spotlight = function()
  {
    if (this._highlighting)
    {
      window.hostspotlighter.soft_spotlight(0);
      this._highlighting = null;
    }
  }.bind(this);




  var on_mouseover = function(event, target)
  {
    var option = event.target.get_ancestor("cst-option") || event.target.get_ancestor("cst-webgl-title");

    if (option)
    {
      var context_id = option['context-id'];
      var canvas_id = window.webgl.interfaces[context_id].canvas.object_id;
      if (canvas_id !== this._highlighting)
      {
        window.hostspotlighter.soft_spotlight(canvas_id);
        this._highlighting = canvas_id;
      }

    }
  };

  var on_mouseout = function(event, target)
  {
    clear_spotlight();
  };

  var eh = window.eventHandlers;
  eh.mouseover["webgl-select-context"] = on_mouseover.bind(this);
  eh.mouseout["webgl-select-context"] = on_mouseout.bind(this);

  messages.addListener('webgl-new-context', on_new_context.bind(this));
  messages.addListener('webgl-new-snapshot', on_new_snapshot.bind(this));
  messages.addListener('webgl-clear', clear.bind(this));

  this.init(id);
};

cls.WebGLSnapshotSelect.prototype = new CstSelect();

// -----------------------------------------------------------------------------

cls.WebGLSideView = Object.create(ViewBase, {
  _container: {
    writable: true,
    value: null
  },
  createView: {
    writable: true, configurable: true,
    value: function(container)
    {
      this._container = container;
      this.render();
    }
  },
  ondestroy: {
    writable: true, configurable: true,
    value: function()
    {
      this._container = null;
    }
  },
  render: {
    value: function()
    {
      if (!this._container) return;

      if (window.webgl.taking_snapshot)
      {
        this._container.clearAndRender(window.templates.webgl.taking_snapshot());
      }
      else if (window.webgl.runtime_id === -1)
      {
        this._container.clearAndRender(window.templates.webgl.reload_info());
      }
      else if (window.webgl.contexts.length === 0)
      {
        this._container.clearAndRender(window.templates.webgl.no_contexts());
      }
      else
      {
        this._render();
      }
    }
  },
  init_events: {
    value: function()
    {
      var eh = window.eventHandlers;
      eh.click["webgl-" + this.id + "-take-snapshot"] = this.on_take_snapshot.bind(this);
      eh.click["webgl-" + this.id + "-take-custom-snapshot"] = this.on_take_custom_snapshot.bind(this);

      messages.addListener('webgl-changed-snapshot', this.on_snapshot_change.bind(this));
      messages.addListener('webgl-taking-snapshot', this.render.bind(this));
    }
  },
  on_take_snapshot: {
    value: function()
    {
      if (!this._container) return;
      var ctx_id = window['cst-selects']['snapshot-select'].get_selected_context();
      if (ctx_id != null)
      {
          window.webgl.request_snapshot(ctx_id);
      }

      if (this._on_take_snapshot) this._on_take_snapshot(ctx_id);
      this.render();
    }
  },
   //TODO Many improvments possible, for example run the timeout on the 
   // debuggee, add multiple frames snapshot, etc.
  on_take_custom_snapshot: {
    value: function()
    {
      if (!this._container) return;
      var ctx_id =
        window['cst-selects']['snapshot-select'].get_selected_context();
      if (ctx_id === null) return;

      var func = function()
      {
        this.on_take_snapshot();
      }.bind(this);
      var delay = window.settings['webgl-snapshot'].get('snapshot_delay')*1000;
      var count = window.settings['webgl-snapshot'].get('snapshot_delay')-1;
      if (count < 0)
      {
        count = 0;
      }
      var snapshot_timer; 
      var render_func = function()
      {
        if (count > 0)
        {
          this._container.clearAndRender(window.templates.webgl.taking_delayed_snapshot(count--));
        }
        else
        {
          clearInterval(snapshot_timer);
        }
      }.bind(this);
      
      snapshot_timer = setInterval(render_func, 1000);  
      setTimeout(func, delay);
    }
  },
  on_snapshot_change: {
    value: function(snapshot)
    {
      if (this._on_snapshot_change) this._on_snapshot_change(snapshot);
      this.render();
    }
  }
});

cls.WebGLSideView.create_ui_widgets = function(id)
{
  new ToolbarConfig(
    id,
    [
      {
        handler: 'webgl-' + id + '-take-snapshot',
        title: "Take snapshot",
        icon: 'webgl-take-snapshot'
      },
      {
        handler: 'webgl-' + id + '-take-custom-snapshot',
        title: "Take custom snapshot",
        icon: 'webgl-take-snapshot'
      }
    ],
    null,
    null,
    [
      {
        handler: 'select-webgl-snapshot',
        title: "Select WebGL snapshot", // TODO
        type: 'dropdown',
        class: 'context-select-dropdown',
        template: window['cst-selects']['snapshot-select'].getTemplate()
      }
    ]
  );
};
