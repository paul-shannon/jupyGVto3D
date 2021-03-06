var widgets = require('@jupyter-widgets/base');
var _ = require('lodash');
var cytoscape = require('cytoscape');
var igv = require('igv.js.npm')
//var igv = require('IGV')
require('igv.js.npm/igv.css')
var NGL = require('ngl');

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
      tabsList.append("<li><a href='#nglTab'>3D</a></li>")

      var cyjsTab = $("<div id='cyjsTab'></div>");
      var cyjsDiv = $("<div id='cyjsDiv' style='border:1px solid green; height: 720px; width: 100%'></div>");
      cyjsTab.append(cyjsDiv);

      var igvTab = $("<div id='igvTab'></div>");
      var igvDiv = $("<div id='igvDiv' style='border:1px solid blue; height: 720px; width: 100%'></div>");
      igvTab.append(igvDiv);

      var nglTab = $("<div id='nglTab'></div>");
      var nglDiv = $("<div id='nglDiv' style='border:1px solid blue; height: 720px; width: 100%'></div>");
      nglTab.append(nglDiv)

      tabsOuterDiv.append(tabsList);
      tabsOuterDiv.append(igvTab);
      tabsOuterDiv.append(cyjsTab);
      tabsOuterDiv.append(nglTab);
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
          case "setGenome":
              this.setGenome(msg);
              break;
          case "displayGraph":
              this.displayGraph(msg);
              break;
          case "showPDB":
              this.showPDB(msg);
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
    initializeIGV: function(genomeName){

	var hg38_options = {
	    minimumBases: 5,
	    flanking: 1000,
	    showRuler: true,

	    reference: {
		id: "hg38",
		fastaURL: "https://s3.amazonaws.com/igv.broadinstitute.org/genomes/seq/hg38/hg38.fa",
		cytobandURL: "https://s3.amazonaws.com/igv.broadinstitute.org/annotations/hg38/cytoBandIdeo.txt"
            },
	    tracks: [
		{name: 'Gencode v24',
		 url: "//s3.amazonaws.com/igv.broadinstitute.org/annotations/hg38/genes/gencode.v24.annotation.sorted.gtf.gz",
		 indexURL: "//s3.amazonaws.com/igv.broadinstitute.org/annotations/hg38/genes/gencode.v24.annotation.sorted.gtf.gz.tbi",
		 format: 'gtf',
		 visibilityWindow: 2000000,
		 displayMode: 'EXPANDED'
		},
            ]
	}; // hg38_options

       var igvOptions = hg38_options;
       var igvBrowser = igv.createBrowser($("#igvDiv"), igvOptions);
       return(igvBrowser)
       },

     //--------------------------------------------------------------------------------
     setGenome: function(msg){
       $('a[href="#igvTab"]').click();
        var self = this;
        setTimeout(function(){
	    self.igvBrowser = self.initializeIGV("hg38");},0);
        }, // setGenome

     //--------------------------------------------------------------------------------
     displayGraph: function(msg){
       $('a[href="#cyjsTab"]').click();
        var self = this;
        self.cyjs = self.createCyjs();
        setTimeout(function(){self.cyjs.fit(100);}, 500);

        }, // displayGraph

     //--------------------------------------------------------------------------------
     showPDB: function(msg){

       $('a[href="#nglTab"]').click();
       var self = this;

       console.log("--- displayPDB");
       $("#nglDiv").height($("#nglTab").height()-10);

       window.nglStage = new NGL.Stage("nglDiv");
       window.nglStage.handleResize();
       self.nglStage = window.nglStage;

       console.log(msg.payload)
       var pdbID = msg.payload;
       self.pdbID = pdbID;

       window.addEventListener( "resize", function(event){
         window.nglStage.handleResize();
         }, false );

      function initial_ngl_representation( component ){
         if( component.type !== "structure" ) return;
         component.addRepresentation( "cartoon", {
           aspectRatio: 3.0,
           scale: 1.5,
           colorScale: "Spectral",
           colorScheme: "residueindex",
           });
        component.addRepresentation( "licorice", {
           sele: "hetero and not ( water or ion )",
           multipleBond: true,
           scale: 2.5
           });
        component.addRepresentation( "spacefill", {
           sele: "ion and not water",
           scale: 0.5
          });
        };

       console.log("--- about to view " + pdbID);
       setTimeout(function(){
          window.nglStage.loadFile("rcsb://" + pdbID).then(function(component){
            initial_ngl_representation(component);
            component.autoView();
            console.log("after autoview");
            self.hub.send({cmd: msg.callback, status: "success", callback: "", payload: ""});
          });
       }, 100);

     } // showPDB

     //--------------------------------------------------------------------------------
   }); // GVto3DView


module.exports = {
  GVto3DModel : GVto3DModel,
  GVto3DView : GVto3DView
  };
