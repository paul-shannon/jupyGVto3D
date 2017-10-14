var widgets = require('@jupyter-widgets/base');
var _ = require('lodash');


// Custom Model. Custom widgets models must at least provide default values
// for model attributes, including
//
//  - `_view_name`
//  - `_view_module`
//  - `_view_module_version`
//
//  - `_model_name`
//  - `_model_module`
//  - `_model_module_version`
//
//  when different from the base class.

// When serialiazing the entire widget state for embedding, only values that
// differ from the defaults will be specified.
var GVto3DModel = widgets.DOMWidgetModel.extend({
    defaults: _.extend(widgets.DOMWidgetModel.prototype.defaults(), {
        _model_name : 'GVto3DModel',
        _view_name : 'GVto3DView',
        _model_module : 'jupyGVto3D',
        _view_module : 'jupyGVto3D',
        _model_module_version : '0.1.0',
        _view_module_version : '0.1.0',
        msgFromKernel: "",
        })
   }); // GVto3DModel


var GVto3DView = widgets.DOMWidgetView.extend({

    _requestCount: 0,

   createDiv: function(){
      var tabsOuterDiv = $("<div id='tabsOuterDiv' style='border:1px solid blue; height: 800px; width: 100%%'></div>");
      var tabsList = $("<ul></ul>");
      tabsList.append("<li><a href='#tabs_1'>1</a></li>");
      tabsList.append("<li><a href='#tabs_2'>2</a></li>")
      var tabDiv_1 = $("<div id='tabs_1'>tab one</div>");
      var tabDiv_2 = $("<div id='tabs_2'>tab two</div>");
      tabsOuterDiv.append(tabsList);
      tabsOuterDiv.append(tabDiv_1);
      tabsOuterDiv.append(tabDiv_2);
      return(tabsOuterDiv);
      },


   //--------------------------------------------------------------------------------
   render: function() {

      this.$el.append(this.createDiv());
      setTimeout(function(){$("#tabsOuterDiv").tabs()}, 0);
      this.listenTo(this.model, 'change:msgFromKernel', this.dispatchRequest, this);
      },

    //--------------------------------------------------------------------------------
    updateStateToKernel: function(self, state){

        var jsonString = JSON.stringify(state);
        self.model.set("_browserState", jsonString);
        self.touch();
        },

    //--------------------------------------------------------------------------------
    dispatchRequest: function(){

       console.log(" === entering dispatchRequest, this is ");
       console.log(this);
       console.log("dispatchRequest, count: " + this._requestCount);
       this.updateStateToKernel(this, {requestCount: this._requestCount});

       this._requestCount += 1;
       window.requestCount = this._requestCount;

       var msgRaw = this.model.get("msgFromKernel");
       var msg = JSON.parse(msgRaw);
       console.log(msg);
       console.log("========================");
       switch(msg.cmd){
          case "writeToTab":
             this.writeToTab(msg);
             break;
          case "raiseTab":
              this.raiseTab(msg);
              break;
          default:
              alert("dispatchRequest: unrecognized msg.cmd: " + msg.cmd);
          } // switch
       }, // dispatchRequest

    //--------------------------------------------------------------------------------
     writeToTab: function(msg){
       var tabNumber = msg.payload.tabNumber;
       var newContent = msg.payload.msg;
       if(tabNumber == 1){
           $("#tabs_1").text(newContent);
           }
        else if(tabNumber == 2){
           $("#tabs_2").text(newContent);
           }
        }, // writeToTab

     //--------------------------------------------------------------------------------
     raiseTab: function(msg){
        var tabName = msg.payload
        switch(tabName){
           case("1"):
              $('a[href="#tabs_1"]').click();
              break;
           case("2"):
              $('a[href="#tabs_2"]').click();
              break;
           default:
              alert("raiseTab: no tab named " + tabName);
           }
        } // writeToTab
     //--------------------------------------------------------------------------------

   }); // GVto3DView


module.exports = {
  GVto3DModel : GVto3DModel,
  GVto3DView : GVto3DView
  };
