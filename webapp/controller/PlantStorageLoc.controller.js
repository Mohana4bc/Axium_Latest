sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/m/MessageBox"
], function (Controller, History, MessageBox) {
	"use strict";

	return Controller.extend("com.axium.Axium.controller.PlantStorageLoc", {
		onInit: function () {
			var oRef = this;
			oRef.result = {};
			oRef.result.items = [];
			this.aData = [];

			oRef.odataService = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZWM_GW_RFSCREENS_SRV/", true);
			oRef.odataService.read("/InventoryPlantSet", null, null, false, function (response) {
				for (var i = 0; i < response.results.length; i++) {
					oRef.getView().byId("plantId").addItem(
						new sap.ui.core.ListItem({
							text: response.results[i].Plant,
							additionalText: response.results[i].PlantDesc
						}));
				}
			});

		},

		Plant: function (oEvent) {
			var oRef = this;
			var plant = oRef.getView().byId("plantId").getSelectedItem().getText();
			oRef.odataService.read("/StorageLocSet?$filter=Plant eq '" + plant + "'", null, null, false,
				function (response) {
					for (var i = 0; i < response.results.length; i++) {
						oRef.getView().byId("storageId").addItem(
							new sap.ui.core.ListItem({
								text: response.results[i].StorageLocation,
								additionalText: response.results[i].LocationDesc
							}));
					}
				});
		},
		onPressBack: function () {
			var that = this;
			var sRouter = sap.ui.core.UIComponent.getRouterFor(that);
			sRouter.navTo("Home", true);
			that.getView().byId("plantId").setValue("");
			that.getView().byId("storageId").setValue();
			var adata = that.getOwnerComponent().getModel("PhysicalInventory").getData();
			adata = [];
			that.getOwnerComponent().getModel("PhysicalInventory").setData(adata);
			that.getOwnerComponent().getModel("PhysicalInventory").refresh(true);

		},

		onNext: function () {
			var that = this;
			sap.ui.getCore().plnt = that.getView().byId("plantId").getValue();
			sap.ui.getCore().stgloc = that.getView().byId("storageId").getValue();
			if (sap.ui.getCore().plnt === "" || sap.ui.getCore().stgloc === "") {
				MessageBox.alert("Please select the mandatory fields");
			} else {
				that.aData = [];
				that.odataService.read("/CountItemsSet?$filter=StrLoc eq '" + sap.ui.getCore().stgloc + "' and Plant eq '" + sap.ui.getCore().plnt +
					"'", null, null, false,
					function (response) {
						for (var i = 0; i < response.results.length; i++) {
							var temp = {};
							temp.bin = response.results[i].BinNumber;
							temp.status = response.results[i].Status;
							temp.mat = response.results[i].Material;
							temp.bat = response.results[i].Batch;
							that.aData.push(temp);
						}
						// that.aData.push(temp);
						var oModel = new sap.ui.model.json.JSONModel();

						oModel.setData({
							BinSet: that.aData
						});
						that.getOwnerComponent().setModel(oModel, "oListHU");

					},
					function (odata, response) {

					}
				);
				var sRouter = sap.ui.core.UIComponent.getRouterFor(that);
				sRouter.navTo("BinScanPI", true);
				that.getView().byId("plantId").setValue("");
				that.getView().byId("storageId").setValue("");
			}

		}
	});

});