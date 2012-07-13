"use strict";

window.templates = window.templates || {};
window.templates.webgl = window.templates.webgl || {};


window.templates.webgl.reload_info = function(buffer)
{
  return [
    "div",
    [
      "span", "",
      "class", "ui-button reload-window",
      "handler", "reload-window",
      "tabindex", "1"
    ],
    "class", "info-box"
  ];
};

window.templates.webgl.buffer_base = function(buffer)
{
  var MAX_NUM_ELEMENTS = 1000;
  var data_table;
  if (buffer.data_is_loaded())
  {
    data_table = window.templates.webgl.buffer_data_table(buffer);
  }
  else
  {
    data_table = ["div", "Loading buffer data."];
  }

  var buffer_info = [
    {name: "Target", value: buffer.target_string()},
    {name: "Usage", value: buffer.usage_string()},
    {name: "Size", value: String(buffer.size)},
    {name: "Length", value: String(buffer.data.length)}
  ];
  var info_table_rows = buffer_info.map(function(info){
    return [
      "tr",
      [
        [
          "th",
          info.name
        ],
        [
          "td",
          info.value
        ]
      ]
    ];
  });

  return [
    "div",
    [
      [
        "div",
        [
          [
            "h2",
            "Buffer " + String(buffer.index)
          ],
          [
            "table",
            info_table_rows,
            "class",
            "table-info"
          ]
        ]
      ],
      data_table
    ]
  ];
};

window.templates.webgl.buffer_data_table = function(buffer)
{
  var MAX_NUM_ELEMENTS = 1000;
  var data_table_rows = [];
  for (var i = 0; i < Math.min(buffer.data.length, MAX_NUM_ELEMENTS); i++)
  {
    var value = buffer.data[i];
    data_table_rows.push([
      "tr",
      [
        [
          "td",
          String(i),
          "style", // TODO make css class
          "text-align: right"
        ],
        [
          "td",
          String(value)
        ]
      ]
    ]);
  }

  // TODO temporary solution since Dragonfly will freeze when to many elements
  var more_data = [];
  if (buffer.data.length > MAX_NUM_ELEMENTS)
  {
    var diff = buffer.data.length - MAX_NUM_ELEMENTS;
    more_data = [
      "div",
      "There are " + String(diff) + " more elements."
    ];
  }

  var data_table_head = [
    "tr",
    [
      [
        "td",
        "Index"
      ],
      [
        "td",
        "value"
      ]
    ],
    "class",
    "header"
  ];

  var data_table = [
    "table",
    [
      data_table_head,
      data_table_rows
    ],
    "class",
    "sortable-table buffer-data-table"
  ];
  return [data_table, more_data];
};

window.templates.webgl.trace_row = function(call, call_number, view_id)
{
  var func_text = [
    "span", call.function_name
  ]; // TODO click should jump to script tab...

  var content = [func_text];

  content.push(["span", "("]);

  var argobj = window.webgl.api.function_arguments_to_objects(call.function_name, call.args);
  for (var i = 0; i < argobj.length; i++)
  {
    var arg = argobj[i];
    var html = ["span", String(arg.text)];
    if (arg.action)
    {
      html.push(
          "handler", "webgl-trace-argument",
          "class", "link");
    }
    html.push(
        "data-call-number", call_number,
        "data-argument-number", i);

    if (i > 0) content.push(", ");
    content.push(html);
  }

  content.push(["span", ")"]);

  var row_class = "";
  if (call.have_error)
  {
    content.push(" >> ", ["span", "error: " + String(call.error_code)]);
    row_class = "trace-error";
  }
  else if (call.redundant)
  {
    row_class = "trace-redundant";
  }
  else if (call.drawcall)
  {
    row_class = "trace-drawcall";
  }

  return [
    "tr", [
      ["td", String(call_number + 1)],
      ["td", content]
      //["td", call.is_drawcall()]
    ],
    "class", row_class,
    "data-call-number", call_number,
    "handler", "webgl-trace-row"
  ];
};

window.templates.webgl.trace_table = function(calls, view_id)
{
  var content = [];
  for (var i = 0; i < calls.length; i++)
  {
    var call = calls[i];
    content.push(window.templates.webgl.trace_row(call, i, view_id));
  }

  return [
    "table", content,
    "class", "sortable-table trace-table", // TODO css
  ];
};

window.templates.webgl.texture = function(texture)
{
  var image_source = null;
  if (texture.img && texture.img.source)
  {
    image_source = {
      name: "Image source",
      value: texture.img.source
    };
  }

  var img = [];
  if (texture.img.data)
  {
    img = ["img", "src", texture.img.data ];
    if (texture.img.flipped)
    {
      img.push("class");
      img.push("flipped");
    }
  }
  else
  {
    img = ["div",
      ["img", "src", "./ui-images/loading.png"],
      "class", "loading-image",
      "style", "width: " + String(texture.width ? texture.width : 128) + "px; height: " + String(texture.height ? texture.height : 128) + "px;"
    ];
  }

  var const_to_string = window.webgl.api.constant_value_to_string;

  var border_info = !texture.border ? null : {
    name: "Border",
    value: String(texture.border)
  };

  var texture_info = [
    {
      name: "Source",
      value: texture.element_type
    },
    image_source,
    {
      name: "Dimensions",
      value: texture.height + "x" + texture.width + " px"
    },
    {
      name: "Format",
      value: const_to_string(texture.format)
    },
    {
      name: "Internal format",
      value: const_to_string(texture.internalFormat)
    },
    {
      name: "Type",
      value: const_to_string(texture.type)
    },
    border_info,
    {
      name: "TEXTURE_WRAP_S",
      value: const_to_string(texture.texture_wrap_s)
    },
    {
      name: "TEXTURE_WRAP_T",
      value: const_to_string(texture.texture_wrap_t)
    },
    {
      name: "TEXTURE_MIN_FILTER",
      value: const_to_string(texture.texture_min_filter)
    },
    {
      name: "TEXTURE_MAG_FILTER",
      value: const_to_string(texture.texture_mag_filter)
    }
  ];

  var info_table_rows = texture_info.map(function(info){
    return info == null ? [] : [
      "tr",
      [
        [
          "th",
          info.name
        ],
        [
          "td",
          info.value
        ]
      ]
    ];
  });

  var info_table = [
    "table",
    info_table_rows,
    "class", "table-info"
  ];

  return [ "div",
    ["h2", "Texture " + String(texture.index)],
    img,
    info_table
  ];
};

// Argument draw_call may be undefined.
window.templates.webgl.generic_call = function(trace_call, draw_call, call)
{
  var function_name = trace_call.function_name;
  var function_call = 
      window.webgl.api.function_call_to_string(trace_call.function_name, trace_call.args);  
  var callnr = parseInt(call) + 1; // Start call count on 1. 

  // Makes a link to the webgl specification of the actual function. 
  var spec_link = ["span", "Goto specification",
                   "handler", "webgl-speclink-click",
                   "class", "link",
                   "function_name",
                    window.webgl.api.function_to_speclink(function_name)
                  ];
  
  // The following code is to build a function call string. It checks for 
  // arguments that are clickable and makes it into a link.
  var func_text = ["span", function_name];
  var function_string = [["h2", func_text]];
  function_string.push("(");
  var argobj =
      window.webgl.api.function_arguments_to_objects(trace_call.function_name, trace_call.args);
  for (var i=0; i<argobj.length; i++)
  {
    var arg = argobj[i];
    var html = ["span", String(arg.text)];
    if (arg.action)
    {
      html.push(
          "handler", "webgl-draw-argument",
          "class", "link",
          "arg", arg);
    }
    if (i>0) function_string.push(", ");
    function_string.push(html); 
  }
  function_string.push(")");
  // End

  // Makes a link to the script tag to show where the call was made. 
  var loc = trace_call.loc;
  var script_url = loc.short_url || loc.url;
  var script_ref;
  if (trace_call.loc == null)
  {
    script_ref = [];
  }
  else if (trace_call.loc.script_id == null)
  {
    script_ref = [
      "span", "Called from " + loc.caller_name + " in " + script_url
    ];
  }
  else
  {
    script_ref = [
      "span", "Goto script",
      "handler", "webgl-drawcall-goto-script",
      "class", "link",
      "data-line", String(loc.line),
      "data-script-id", String(loc.script_id),
      "title", "Called from " + loc.caller_name + " in " + script_url
    ];
  }
  // End

  var ret = [["div", ["h2", "Call: " + callnr], 
                    ["p", function_string],
                    ["p", spec_link],
                    ["p", script_ref],
                    "class", "draw-call-info"
             ]];
 
  // Add a draw call view if the call was a draw call. 
  if (draw_call)
  {
    ret.push(window.templates.webgl.drawcall(draw_call, trace_call));
  }

  return ret;
};

window.templates.webgl.drawcall = function(draw_call, trace_call)
{
  var fbo = draw_call.fbo;
  var img = ["img", "width", fbo.width, "height", fbo.height, "src", fbo.data];

  if (fbo.flipped)
  {
    img.push("class", "flipped");
  }

  var buffer_link = [ "span",
    String(draw_call.buffer),
    "handler", "webgl-drawcall-buffer",
    "class", "link",
    "buffer", draw_call.buffer
  ];

  var state = [
    "table",
      [
        [ "tr",
          ["th", window.webgl.api.constant_value_to_string(draw_call.buffer_target)],
          ["td", buffer_link ]
        ],
        [ "tr",
          [ "th", "Program" ],
          [ "td", String(draw_call.program_index)]
        ],
      ],
      "class", "draw-call-info"
  ];


  var html = [];
  html.push(["div",
              state,
              img
            ]);


  return html;
};

window.templates.webgl.shader_source = function(source)
{
  var line_count = 1;
  var lines = [];
  source.split('\n').forEach(function() { lines.push(line_count++); });
  return (
  ['div',
    ['pre', source, 'class', 'sh_glsl'],
    ['div', lines.join('\n'), 'class', 'resource-line-numbers', 'unselectable', 'on'],
    'class', 'resource-detail-container mono line-numbered-resource js-resource-content'
  ]);
};

window.templates.webgl.uniform_table = function(call_index, program)
{
  var uniforms = program.uniforms;
  var rows = [];

  rows.push([
    "tr",
    [
      [
        "td",
        "Uniform name"
      ],
      [
        "td",
        "Type"
      ],
      [
        "td",
        "Value"
      ]
    ],
    "class", "header"
  ]);

  for (var i = 0; i < uniforms.length; i++)
  {
    var uniform = uniforms[i];

    var value = uniform.values[0].value;

    var last_index = 0;
    var values = uniform.values;
    for (var j = 1; j < values.length && values[j].call_index <= call_index; j++)
    {
      last_index = j;
      value = values[j].value;
    }

    var changed_this_call = false;
    if (last_index !== 0)
    {
      if (values[last_index].call_index === call_index)
      {
        changed_this_call = true;
      }
      value = values[last_index].value;
    }

    rows.push([
      "tr",
      [
        [
          "td",
          uniform.name
        ],
        [
          "td",
          window.webgl.api.constant_value_to_string(uniform.type)
        ],
        [
          "td",
          String(value),
          "class", changed_this_call ? "changed" : ""
        ]
      ]
    ]);
  }

  var table = [
    "div",
    [
      "table",
      rows,
      "class", "sortable-table uniform-table"
    ],
    "class", "uniforms"
  ];

  return table;
};

window.templates.webgl.taking_snapshot = function()
{
    var html = ["div",
                  ["p", ["img", "src", "./ui-images/loading.png"]],
                  ["p", "Taking snapshot..."],
                  "class", "info-box"
                ];
    return html;
}

window.templates.webgl.program = function(call_index, program)
{
  var programs = [];

  for (var i = 0; i < program.shaders.length; i++)
  {
    var shader = program.shaders[i];

    var shader_type = window.webgl.api.constant_value_to_string(shader.type);
    switch (shader_type)
    {
      case "VERTEX_SHADER":
        shader_type = "Vertex";
        break;
      case "FRAGMENT_SHADER":
        shader_type = "Fragment";
        break;
    }
    programs.push([
      ["h1", shader_type + " shader " + String(shader.index)],
      window.templates.webgl.shader_source(shader.src)
    ]);
  }

  var uniform_table = window.templates.webgl.uniform_table(call_index, program);

  var html =
  [
    "div",
     uniform_table,
     programs
  ];


  return html;
};
