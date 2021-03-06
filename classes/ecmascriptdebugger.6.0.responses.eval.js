// Autogenerated by hob
window.cls || (window.cls = {});
cls.EcmascriptDebugger || (cls.EcmascriptDebugger = {});
cls.EcmascriptDebugger["6.0"] || (cls.EcmascriptDebugger["6.0"] = {});

cls.EcmascriptDebugger["6.0"].EvalResult = function(arr)
{
  /** 
    * If it is "completed" or "unhandled-exception" then `type`, `value` and `objectValue` will be present.
    */
  this.status = arr[0];
  /** 
    * One of:
    * - `"number"`
    * - `"boolean"`
    * - `"string"`
    * - `"null"`
    * - `"undefined"`
    * - `"object"`
    */
  this.type = arr[1];
  /** 
    * Only present when `type` is `"number"`, `"string"` or `"boolean"`
    */
  this.value = arr[2];
  /** 
    * Only present when `type` is `"object"`
    */
  this.objectValue = arr[3] ? new cls.EcmascriptDebugger["6.0"].ObjectValue(arr[3]) : null;
};

cls.EcmascriptDebugger["6.0"].ObjectValue = function(arr)
{
  this.objectID = arr[0];
  this.isCallable = arr[1];
  /** 
    * type, function or object
    */
  this.type = arr[2];
  this.prototypeID = arr[3];
  /** 
    * The class of the object.
    */
  this.className = arr[4];
  /** 
    * If the object is a function, this is the name of
    * the variable associated with that function (if any).
    */
  this.functionName = arr[5];
};

