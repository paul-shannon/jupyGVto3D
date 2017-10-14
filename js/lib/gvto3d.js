var widgets = require('@jupyter-widgets/base');
var _ = require('lodash');
var cytoscape = require('cytoscape');
var igv = require('igv_wrapper')

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
//----------------------------------------------------------------------------------------------------
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
      var self = this;
      var tabsOuterDiv = $("<div id='tabsOuterDiv' style='border:1px solid blue; height: 800px; width: 100%'></div>");
      var tabsList = $("<ul></ul>");
      tabsList.append("<li><a href='#igvTab'>igv</a></li>");
      tabsList.append("<li><a href='#cyjsTab'>cyjs</a></li>")
      var igvTab = $("<div id='igvTab'>tab one</div>");
      var cyjsTab = $("<div id='cyjsTab'></div>");
      var cyjsDiv = $("<div id='cyjsDiv' style='border:1px solid green; height: 720px; width: 100%'></div>");
      cyjsTab.append(cyjsDiv);
      tabsOuterDiv.append(tabsList);
      tabsOuterDiv.append(igvTab);
      tabsOuterDiv.append(cyjsTab);
      return(tabsOuterDiv);
      },

   //--------------------------------------------------------------------------------
    createCyjs: function(){
        var options = {container: $("#cyjsDiv"),
                       elements: {nodes: [{data: {id:'a'}}],
				  edges: [{data:{source:'a', target:'a'}}]},
                       style: cytoscape.stylesheet()
                       .selector('node').style({'background-color': '#ddd',
						'label': 'data(id)',
						'text-valign': 'center',
						'text-halign': 'center',
						'border-width': 1})
                       .selector('node:selected').style({'overlay-opacity': 0.2,
							 'overlay-color': 'gray'})
                       .selector('edge').style({'line-color': 'black',
						'target-arrow-shape': 'triangle',
						'target-arrow-color': 'black',
						'curve-style': 'bezier'})
                       .selector('edge:selected').style({'overlay-opacity': 0.2,
							 'overlay-color': 'gray'})
                      };

	console.log("about to call cytoscape with options");
	var cy = cytoscape(options);
	console.log("after call to cytoscape");
	return(cy)
        },


   //--------------------------------------------------------------------------------
   render: function() {

      var self = this;
      this.$el.append(this.createDiv());
      setTimeout(function(){$("#tabsOuterDiv").tabs()}, 0);
      //setTimeout(function(){self.createCyjs();}, 1000)
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
          case "displayGraph":
              this.displayGraph(msg);
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
           $("#igvTab").text(newContent);
           }
        else if(tabNumber == 2){
           $("#cyjsTab").text(newContent);
           }
        }, // writeToTab

     //--------------------------------------------------------------------------------
     raiseTab: function(msg){
        var tabName = msg.payload
        switch(tabName){
           case("1"):
              $('a[href="#igvTab"]').click();
              break;
           case("2"):
              $('a[href="#cyjsTab"]').click();
              break;
           default:
              alert("raiseTab: no tab named " + tabName);
           }
        }, // writeToTab

     //--------------------------------------------------------------------------------
     displayGraph: function(msg){
       $('a[href="#cyjsTab"]').click();
        var self = this;
        self.cyjs = self.createCyjs();
        setTimeout(function(){self.cyjs.fit(100);}, 500);

        } // displayGraph

     //--------------------------------------------------------------------------------
   }); // GVto3DView


module.exports = {
  GVto3DModel : GVto3DModel,
  GVto3DView : GVto3DView
  };
