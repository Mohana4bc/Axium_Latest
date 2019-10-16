sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/m/MessageBox"
], function (Controller, History, MessageBox) {
	"use strict";

	return Controller.extend("com.axium.Axium.controller.STRMaterials", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.axium.Axium.view.STRMaterials
		 */
		onInit: function () {
			this.odataService = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZWM_GW_RFSCREENS_SRV/", true);
			this.getView().addEventDelegate({
				onBeforeShow: jQuery.proxy(function (evt) {
					this.onBeforeShow(evt);
				}, this)
			});

		},
		onBeforeShow: function () {
			var oRef = this;
			var oTable = oRef.getView().byId("idSTRMaterials");
			oTable.setMode("SingleSelectMaster");
			oTable.removeSelections("true");
		},
		onPressBack: function () {
			var sRouter = sap.ui.core.UIComponent.getRouterFor(this);
			sRouter.navTo("ScanMaterialDocument", true);
		},
		onSTRMaterial: function (oEvent) {
			var selecteditem = oEvent.getSource().getSelectedItem();
			var bpath = selecteditem.getBindingContextPath();
			var Mindex = bpath.split('/')[2];
			sap.ui.selectedIndex = parseFloat(Mindex);
			var oModel = this.getView().getModel("STRMatDocMaterials").getData();
			var strMatNum = oModel.results[sap.ui.selectedIndex].MaterialNumber;
			var strMatDesc = oModel.results[sap.ui.selectedIndex].MaterialDescription;
			var strMatDocNum = oModel.results[sap.ui.selectedIndex].MaterialDocNo;
			var strRequiredPallet = oModel.results[sap.ui.selectedIndex].Quantity;
			var strScannedPallet = "0";
			var data = {};
			data.strMatNum = strMatNum;
			data.strMatDesc = strMatDesc;
			data.strMatDocNum = strMatDocNum;
			data.strRequiredPallet = strRequiredPallet;
			data.strScannedPallet = strScannedPallet;
			var oRef = this;

			oRef.getOwnerComponent().getModel("STRMaterialDetails").setData(data);
			oRef.getOwnerComponent().getModel("STRMaterialDetails").refresh(true);

			var sRouter = sap.ui.core.UIComponent.getRouterFor(this);
			sRouter.navTo("STRHUScan", true);
		}

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf com.axium.Axium.view.STRMaterials
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf com.axium.Axium.view.STRMaterials
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf com.axium.Axium.view.STRMaterials
		 */
		//	onExit: function() {
		//
		//	}

	});

});