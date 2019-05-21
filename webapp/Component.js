sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"com/axium/Axium/model/models"
], function (UIComponent, Device, models) {
	"use strict";

	return UIComponent.extend("com.axium.Axium.Component", {

		metadata: {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function () {
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);

			// enable routing
			this.getRouter().initialize();

			// set the device model
			this.setModel(models.createDeviceModel(), "device");

			this.setModel(new sap.ui.model.json.JSONModel(), "oTableModelAlias");
			this.setModel(new sap.ui.model.json.JSONModel(), "oAvailableBins");
			this.setModel(new sap.ui.model.json.JSONModel(), "oTablePickAlias");
			this.setModel(new sap.ui.model.json.JSONModel(), "oBOM");
			this.setModel(new sap.ui.model.json.JSONModel(), "oListHU");
			this.setModel(new sap.ui.model.json.JSONModel(), "oListMat");

			//Stock Overview
			this.setModel(new sap.ui.model.json.JSONModel(), "PlantScreenOutputModel");
			this.setModel(new sap.ui.model.json.JSONModel(), "WarehouseScreenOutputModel");

			this.setModel(new sap.ui.model.json.JSONModel(), "oMyScannedQty");
			this.setModel(new sap.ui.model.json.JSONModel(), "oMyBinNumber");

			this.setModel(new sap.ui.model.json.JSONModel(), "oDeliveryNo");
			this.setModel(new sap.ui.model.json.JSONModel(), "oDelAvailableBin");
			this.setModel(new sap.ui.model.json.JSONModel(), "oMatSelect");
			this.setModel(new sap.ui.model.json.JSONModel(), "oScannedQtySelect");
			this.setModel(new sap.ui.model.json.JSONModel(), "oScannedQty");
			this.setModel(new sap.ui.model.json.JSONModel(), "oBinScanModel");
			this.setModel(new sap.ui.model.json.JSONModel(), "oScanQTModel");

			this.setModel(new sap.ui.model.json.JSONModel(), "batchQty");

			this.setModel(new sap.ui.model.json.JSONModel(), "PhysicalInventory");
			this.setModel(new sap.ui.model.json.JSONModel(), "Count");
			this.setModel(new sap.ui.model.json.JSONModel(), "PlantStorage");
			this.setModel(new sap.ui.model.json.JSONModel(), "InvenHUBin");
			this.setModel(new sap.ui.model.json.JSONModel(), "BinHUMatModel");

		}
	});
});