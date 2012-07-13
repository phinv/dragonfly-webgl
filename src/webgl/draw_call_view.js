"use strict";

window.cls || (window.cls = {});
cls.WebGL || (cls.WebGL = {});

/**
 * @constructor
 * @extends ViewBase
 */
cls.WebGLDrawCallView = function(id, name, container_class)
{
  this._container = null;
  this._element_buffer = null;

  this.createView = function(container)
  {
    this._container = container;
    this._render();
  };

  var add_canvas = function()
  {
    var canvas_holder = document.getElementById("webgl-canvas-holder");
    canvas_holder.appendChild(window.webgl.gl.canvas);

    // TODO temporary
    window.webgl.gl.canvas.width = 250;
    window.webgl.gl.canvas.height = 250;
  };

  var render_preview = function()
  {
    add_canvas();
    var preview = window.webgl.preview;

    var select = document.getElementById("webgl-attribute-selector");
    var attribute = select.options[select.selectedIndex].attribute;

    preview.set_program(window.webgl.gl.programs.buffer);
    preview.set_attribute(attribute, this._element_buffer);
    preview.render();
  }.bind(this);

  this._render = function()
  {
    this._container.clearAndRender(["div", "No draw call"]);
  };

  this.ondestroy = function()
  {
    this._container = null;
  };

  this.display_by_call = function(call)
  {
    var snapshot = window['cst-selects']['snapshot-select'].get_selected_snapshot();

    var draw_call = snapshot.drawcalls.get_by_call(call);
    var trace_call = snapshot.trace[call];

    if (!draw_call)
    {
      var template = window.templates.webgl.generic_call(trace_call, call);
      this._container.clearAndRender(template);
      //this._container.innerHTML = "No framebuffer snapshot for call " + call;
      return;
    }

    var template = window.templates.webgl.drawcall(draw_call, trace_call);
    this._container.clearAndRender(template);

    if (window.webgl.gl)
    {
      this._element_buffer = draw_call.element_buffer;
      render_preview();
    }

    return;
  };

  var on_attribute_select = function(evt, target)
  {
    render_preview()
  };

  var on_buffer_click = function(evt, target)
  {
    target.buffer.show();
  };

  var on_speclink_click = function(evt, target) 
  {
      window.open(target.getAttribute("function_name"));
  };

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

  var eh = window.eventHandlers;
  eh.click["webgl-select-attribute"] = on_attribute_select.bind(this);
  eh.click["webgl-drawcall-buffer"] = on_buffer_click.bind(this);
  eh.click["webgl-speclink-click"] = on_speclink_click.bind(this);
  eh.click["webgl-drawcall-goto-script"] = on_goto_script_click.bind(this);

  this.init(id, name, container_class);
};

cls.WebGLDrawCallView.prototype = ViewBase;

