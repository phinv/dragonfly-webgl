﻿"use strict";

window.cls || (window.cls = {});
cls.WebGL || (cls.WebGL = {});

/* Settings view for snapshots */
cls.WebGLSnapshotView = function(id, name, container_class)
{
  this.init(id, name, container_class);
}

cls.WebGLSnapshotView.create_ui_widgets = function()
{
  var checkboxes =
  [
    'fbo-readpixels'
  ];

  new Settings
  (
    // id
    'snapshot',
    // key-value map
    {
      'fbo-readpixels' : true,
      'history_length' : 4
    },
    // key-label map
    {
      'history-length': "Object history length",
      'fbo-readpixels': "Read pixels from FBO after draw calls"

    },
    // settings map
    {
      checkboxes: checkboxes,
      customSettings:
      [
        'history_length'
      ]
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
      }
    },
    "webgl"
  );

  eventHandlers.change['set-history-size'] = function(event, target)
  {
    var history_size = Number(event.target.value);
    settings.snapshot.set('history_length', history_size);
  }
}



// Makes it possible to render a view with an attached header.
cls.WebGLHeaderViewBase = Object.create(ViewBase,
    {render_with_header:
      {value:
        function(snapshot, call_index, template)
        {
          if (call_index === -1)
          {
            var template = window.templates.webgl.info_with_header(template);
          }
          else
          {
            var trace = snapshot.trace[call_index];
            var state_parameters = snapshot.state.get_function_parameters(trace.function_name, call_index, true);
            var template = window.templates.webgl.call_with_header(call_index, trace, state_parameters, template);
          }

          this._container.clearAndRender(template);
        }
      }
    });


// Add listeners and methods for call view events.
cls.WebGLHeaderViewBase.initialize = function()
{
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

  var eh = window.eventHandlers;
  eh.click["webgl-speclink-click"] = on_speclink_click;
  eh.click["webgl-drawcall-goto-script"] = on_goto_script_click;
};

cls.WebGLSnapshotSelect = function(id)
{
  this._snapshot_list = [{}];
  this.disabled = true;
  this._selected_snapshot_index = null;
  this._selected_context_id = null;

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
    var ret = [];
    var snapshots = select_obj._snapshot_list;

    var contexts = window.webgl.contexts;

    // Iterating the contexts.
    for (var i = 0; i < contexts.length; i++)
    {
      var context_id = contexts[i];
      ret.push([
        "cst-webgl-title",
        "WebGLContext #" + i,
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
        "take-snapshot", true
      ]);
    }

    return ret;
  };

  this.checkChange = function(target_ele)
  {
    // TODO The context should also be highlighted on the debuggee
    var context_id = target_ele['context-id'];
    var snapshot_index = target_ele['snapshot-index'];
    var take_snapshot = target_ele['take-snapshot'];
    this._selected_context_id = context_id;

    if (take_snapshot !== undefined)
    {
      window.webgl.request_snapshot(context_id);
      return false;
    }
    else if (snapshot_index != null && this._selected_snapshot_index !== snapshot_index)
    {
      this._selected_snapshot_index = snapshot_index;
      this._selected_context_id = context_id;
      messages.post('webgl-changed-snapshot', window.webgl.snapshots[context_id][snapshot_index]);
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

    if (!this.disabled)
    {
      this.disabled = true;
      refresh_tab();
    }
  };

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