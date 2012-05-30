﻿"use strict";

window.cls || (window.cls || {});
cls.WebGL || (cls.WebGL = {});

cls.WebGLTrace = function() 
{
  this.webgl_present = false;
  this.trace_data = {};

  /* Interface */
  this.get_trace = function(){};

  /* Private members */
  this._send_trace_query = function(){};
  this._handle_trace_query = function(){};
  this._finalize_trace_query = function(){};

  // Retrieves the frame trace for the last rendered frame of a WebGL context denoted by it's runtime & object id
  this._send_trace_query = function(obj_id, rt_id)
  {
    var script = cls.WebGL.RPCs.prepare(cls.WebGL.RPCs.get_trace);
    var tag = tagManager.set_callback(this, this._handle_trace_query, [rt_id, obj_id]);
    window.services["ecmascript-debugger"].requestEval(tag, [rt_id, 0, 0, script, [["gl", obj_id]]]);
  };

  this._handle_trace_query = function(status, message, rt_id, obj_id)
  {
    var
      STATUS = 0,
      TYPE = 1,
      VALUE = 2,
      OBJECT_VALUE = 3,
      // sub message ObjectValue
      OBJECT_ID = 0;

    if (message[STATUS] == 'completed')
    {
      if (message[TYPE] == 'null')
      {
        // TODO better error handling
        opera.postError(ui_strings.S_DRAGONFLY_INFO_MESSAGE +
            "failed to recieve a trace.");
      }
      else {
        var return_arr = message[OBJECT_VALUE][OBJECT_ID];
        var tag = tagManager.set_callback(this, this._finalize_trace_query, [rt_id, obj_id]);
        window.services["ecmascript-debugger"].requestExamineObjects(tag, [rt_id, [return_arr]]);
      }
    }
    else
    {
      opera.postError(ui_strings.S_DRAGONFLY_INFO_MESSAGE +
          "failed _handle_trace_query in WebGLTrace");
    }
  };

  this._finalize_trace_query = function(status, message, rt_id, obj_id)
  {
    if (status === 0)
    { 
      var data = [];
      var msg_vars = message[0][0][0][0][1]; 
      for (var i = 0; i < msg_vars.length; i++)
      {
        var parts = msg_vars[i][2].split("|");
        if (parts.length < 2)
        {
          opera.postError(ui_strings.S_DRAGONFLY_INFO_MESSAGE +
            "A trace entry had incorrect data: [" + parts.join(", ") + "]");
          continue;
        }
        var function_name = parts[0];
        var error_code = parts[1];
        var args = parts.slice(2);
        data.push(new TraceEntry(function_name, error_code, args));
      }

      this.trace_data[obj_id] = data;
      this.webgl_present = true;
      messages.post('webgl-new-trace', obj_id);
    }
    else
    {
      opera.postError(ui_strings.S_DRAGONFLY_INFO_MESSAGE +
          "failed _finalize_trace_query in WebGLTrace");
    }
  };
  // ---------------------------------------------------------------------------

  /**
   * Gets a trace of all WebGL calls from the current frame.
   * TODO: Temporary requires that the script runs gl.new_frame() before each new frame is drawn.
   * @context_object_id Id of the context object which should be traced.
   */
  this.get_trace = function(context_object_id)
  {
    var window_id = runtimes.getActiveWindowId();
    var _runtimes = runtimes.getRuntimeIdsFromWindow(window_id);
    _runtimes.forEach(this._send_trace_query.bind(this, context_object_id));
  };
};

/**
 * Used to store a single function call in a frame trace.
 */
function TraceEntry(function_name, error_code, args)
{
  this.function_name = function_name;
  this.error_code = error_code;
  this.has_error = error_code === WebGLRenderingContext.NO_ERROR;
  this.args = args;
}
