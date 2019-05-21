sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	return Controller.extend("com.axium.Axium.controller.Home", {
		onPressFG: function (e) {
			var that = this;
			var data = that.getView().getModel("oListHU").getData();
			that.data = [];
			that.getView().getModel("oListHU").setData(that.data);
			that.getView().getModel("oListHU").refresh(true);
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("ScanHU", {});
			// var oTable = this.getView().byId("idtable");
			// var oModel = oTable.getModel("oTableModelAlias");
			// oModel.setData({});
			// oModel.refresh(true);
			// window.location.reload(true);
			// var oBusy = sap.m.BusyDialog();
			// oBusy.open();
			// oBusy.close();

		},

		// onPressRM : function(e){
		// 	  var that = this;
		//       var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
		//         oRouter.navTo("RMPickReturn",{});
		// },
		// onPick: function (e) {
		// 	var that = this;
		// 	var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
		// 	oRouter.navTo("Pick", {});
		// },
		// onReturn: function (e) {
		// 	var that = this;
		// 	var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
		// 	oRouter.navTo("Return", {});
		// },
		// onRMPutAway: function (e) {
		// 	var that = this;
		// 	var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
		// 	oRouter.navTo("PutAway", {});
		// },

		onPick: function (e) {
			var that = this;
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("Pick", {});
		},
		onReturn: function (e) {
			var that = this;
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("Return", {});
		},
		onRMPutAway: function (e) {
			var that = this;
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("PutAway", {});
		},

		/*Stock Overview*/
		onPressPlantScreen: function (e) {
			var that = this;
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("PlantScreen", {});
		},

		onPressWarehouseScreen: function (e) {
			var that = this;
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("WarehouseScreen", {});
		},
		onPressFGPick: function (e) {
			var that = this;
			var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
			oRouter.navTo("ScanDelNo", {});
		},
		onPressBinToBin: function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("BinToBin", {});
		},
		onPhysicalInventory: function (e) {
			// var that = this;
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("PlantStorageLoc", {});
		},
		onInventoryPress: function (e) {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("InventoryPlntStrloc", {});
		}

	});
});