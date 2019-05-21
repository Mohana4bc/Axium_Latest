sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/m/MessageBox",
	"sap/ui/core/UIComponent",
], function (Controller, History, UIComponent, MessageBox) {
	"use strict";

	return Controller.extend("com.axium.Axium.controller.InventoryPlntStrloc", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.axium.Axium.view.InventoryPlntStrloc
		 */
		onInit: function () {
			var that = this;

			this.result = {};
			this.result.items = [];

			this.odataService = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZWM_GW_RFSCREENS_SRV/", true);
			this.odataService.read("/AllPlantSet", null, null, false, function (response) {
				if (that.getView().byId("plantPlantScreenId") !== undefined) {
					that.getView().byId("plantPlantScreenId").destroyItems();
				}
				for (var i = 0; i < response.results.length; i++) {
					that.getView().byId("plantPlantScreenId").addItem(
						new sap.ui.core.ListItem({
							// text: response.results[i].Material,
							// key: response.results[i].Material,
							// additionalText: response.results[i].MaterialDesc
							text: response.results[i].Plant,
							key: response.results[i].Plant,
							additionalText: response.results[i].PlantDesc

						}));
				}
			});
			this.getView().addEventDelegate({
				onBeforeShow: jQuery.proxy(function (evt) {
					this.onBeforeShow(evt);
				}, this)
			});

		},
		plantLoad: function (oEvent) {
			oEvent.getSource().getBinding("items").resume();
		},
		onBeforeShow: function (oEvent) {
			var oRef = this;
			var plant = oRef.getView().byId("plantPlantScreenId");
			var strLoc = oRef.getView().byId("storageLocationPlantScreenId");
			plant.setValue("");
			strLoc.setValue("");
			plant.clearSelection();
			strLoc.clearSelection();
			sap.ui.getCore().InvenStrLocFlag = "";
		},
		setEmpty: function (oEvent) {
			var oRef = this;
			oRef.getView().byId("plantPlantScreenId").setValue("");
			oRef.getView().byId("storageLocationPlantScreenId").setValue("");
		},

		selectStorageLocation: function () {
			var plant = this.getView().byId("plantPlantScreenId").getSelectedItem().getText();
			var that = this;
			setTimeout(function () {
				that.odataService.read("/StorageLocSet?$filter=Plant eq '" + plant + "'", null, null,
					false,
					function (response) {
						if (that.getView().byId("storageLocationPlantScreenId") !== undefined) {
							that.getView().byId("storageLocationPlantScreenId").destroyItems();
						}
						for (var i = 0; i < response.results.length; i++) {
							that.getView().byId("storageLocationPlantScreenId").addItem(
								new sap.ui.core.ListItem({
									text: response.results[i].StorageLocation,
									key: response.results[i].StorageLocation,

									additionalText: response.results[i].LocationDesc
								}));
						}
					});
			}, 1000);
		},
		onPressBack: function () {
			var sRouter = sap.ui.core.UIComponent.getRouterFor(this);
			sRouter.navTo("Home", true);
		},
		onInvenPlntStrLocSearch: function () {
			sap.ui.getCore().StorageLocation = this.getView().byId("storageLocationPlantScreenId").getValue();
			sap.ui.getCore().PlantNumber = this.getView().byId("plantPlantScreenId").getValue();
			if (sap.ui.getCore().PlantNumber === "" || sap.ui.getCore().StorageLocation === "") {
				// MessageBox.error("Please Select All Mandatory Fields");
				sap.m.MessageBox.error("Please Select All Mandatory Fields");
			} else {
				if (sap.ui.getCore().StorageLocation === "FP01") {
					sap.ui.getCore().InvenStrLocFlag = true;
				} else {
					if (sap.ui.getCore().StorageLocation === "RM01") {
						sap.ui.getCore().InvenStrLocFlag = false;
					}
				}
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("InvenHUMat", {});
				this.setEmpty();
			}
		}

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf com.axium.Axium.view.InventoryPlntStrloc
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf com.axium.Axium.view.InventoryPlntStrloc
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf com.axium.Axium.view.InventoryPlntStrloc
		 */
		//	onExit: function() {
		//
		//	}

	});

});