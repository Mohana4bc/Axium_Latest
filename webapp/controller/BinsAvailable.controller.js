sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History"
], function (Controller,History) {
	"use strict";

	return Controller.extend("com.axium.Axium.controller.BinsAvailable", {

		onAfterRendering: function() {
				
				var oRef = this;
				var arrBins = [];
				this.odataService = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZWM_GW_RFSCREENS_SRV/", true);
				this.odataService.read("/RMPutAwayAvailableBinSet", {
				success: cSuccess,
				failed: cFailed
			});
			
				function cSuccess(data) {
					for (var i = 0; i < data.results.length; i++){
						arrBins.push({
							StorageBin: data.results[i].StorageBin
						});
				}	
				
				var oModel = new sap.ui.model.json.JSONModel();
				oModel.setData({
						binsAvailable: arrBins
				});
				oRef.getOwnerComponent().setModel(oModel, "BinsAvailable");
			}
			
				function cFailed() {
					alert("Failed");
			}
		},
		
		onPressBack : function() {
			var sHistory = History.getInstance();
			var sPreviousHash = sHistory.getPreviousHash();
			if(sPreviousHash != undefined){
				window.history.go(-1);
			}else{
				var sRouter = sap.ui.core.UIComponent.getRouterFor(this);
				sRouter.navTo("Home",true);
			}
			
		}

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf Z_AXIUMPLASTIC.view.BinsAvailable
		 */
		//	onExit: function() {
		//
		//	}

	});

});