sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/m/MessageBox",
	"sap/ui/core/UIComponent",
], function (Controller, History, UIComponent, MessageBox) {
	"use strict";

	return Controller.extend("com.axium.Axium.controller.PlantScreen", {
		onInit: function () {

			var that = this;

			this.result = {};
			this.result.items = [];

			this.odataService = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZWM_GW_RFSCREENS_SRV/", true);

			// this.odataService.read("/MaterialsSet", null, null, false, function (response) {
			// 	if (that.getView().byId("materialPlantScreenId") !== undefined) {
			// 		that.getView().byId("materialPlantScreenId").destroyItems();
			// 	}
			// 	for (var i = 0; i < response.results.length; i++) {
			// 		that.getView().byId("materialPlantScreenId").addItem(
			// 			new sap.ui.core.ListItem({
			// 				// text: response.results[i].Material,
			// 				// key: response.results[i].Material,
			// 				// additionalText: response.results[i].MaterialDesc
			// 				text: response.results[i].MaterialDesc,
			// 				key: response.results[i].MaterialDesc,
			// 				additionalText: response.results[i].Material

			// 			}));
			// 	}
			// });

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

			// this.odataService.read("/PlantsSet", null, null, false, function (response) {
			// 	if (that.getView().byId("plantPlantScreenId") !== undefined) {
			// 		that.getView().byId("plantPlantScreenId").destroyItems();
			// 	}
			// 	for (var i = 0; i < response.results.length; i++) {
			// 		that.getView().byId("plantPlantScreenId").addItem(
			// 			new sap.ui.core.ListItem({
			// 				text: response.results[i].Plant,
			// 				key: response.results[i].Plant,
			// 				additionalText: response.results[i].PlantDesc
			// 			}));
			// 	}
			// });

			// this.odataService.read("/StorageLocationSet", null, null, false, function (response) {
			// 	if (that.getView().byId("storageLocationPlantScreenId") !== undefined) {
			// 		that.getView().byId("storageLocationPlantScreenId").destroyItems();
			// 	}
			// 	for (var i = 0; i < response.results.length; i++) {
			// 		that.getView().byId("storageLocationPlantScreenId").addItem(
			// 			new sap.ui.core.ListItem({
			// 				text: response.results[i].StorageLoc,
			// 				key: response.results[i].StorageLoc,

			// 				additionalText: response.results[i].LocationDesc
			// 			}));
			// 	}
			// });

			this.getView().addEventDelegate({
				onBeforeShow: jQuery.proxy(function (evt) {
					this.onBeforeShow(evt);
				}, this)
			});

			sap.ui.getCore().matNum = "";

		},

		onBeforeShow: function (oEvent) {
			var oRef = this;
			setTimeout(function () {
				var oInput = oRef.getView().byId("plantPlantScreenId");
				oInput.focus();
			}, 1000);
			oRef.getView().byId("materialPlantScreenId").setValue("");
			oRef.getView().byId("plantPlantScreenId").setValue("");
			oRef.getView().byId("storageLocationPlantScreenId").setValue("");

			var oMat = oRef.getView().byId("materialPlantScreenId");
			var oPlant = oRef.getView().byId("plantPlantScreenId");
			var oStorageLoc = oRef.getView().byId("storageLocationPlantScreenId");

			oMat.clearSelection();
			oPlant.clearSelection();
			oStorageLoc.clearSelection();

		},
		handleLoadItems: function (oEvent) {
			oEvent.getSource().getBinding("items").resume();
		},
		plantLoad: function (oEvent) {
			oEvent.getSource().getBinding("items").resume();
		},

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf Z_AXIUMPLASTIC.view.PlantScreen
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf Z_AXIUMPLASTIC.view.PlantScreen
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf Z_AXIUMPLASTIC.view.PlantScreen
		 */
		//	onExit: function() {
		//
		//	}

		setEmpty: function () {
			this.getView().byId("materialPlantScreenId").setValue("");
			this.getView().byId("plantPlantScreenId").setValue("");
			this.getView().byId("storageLocationPlantScreenId").setValue("");
			sap.ui.getCore().matNum = "";
		},

		onPressBack: function () {
			this.setEmpty();

			var sHistory = History.getInstance();
			var sPreviousHash = sHistory.getPreviousHash();
			if (sPreviousHash != undefined) {
				window.history.go(-1);
			} else {
				var sRouter = sap.ui.core.UIComponent.getRouterFor(this);
				sRouter.navTo("StockOverview", true);
			}
		},

		selectMaterial: function (oEvent) {
			// var materialNum = this.getView().byId("materialPlantScreenId").getValue();

			// this.getView().byId("materialPlantScreenId").setValue("");
			// this.getView().byId("storageLocationPlantScreenId").setValue("");
			// var materialNum = sap.ui.getCore().matNum;

			var plant = this.getView().byId("plantPlantScreenId").getSelectedItem().getText();
			var that = this;

			// if (plant === "") {
			// 	this.odataService.read("/StorageLocationSet", null, null, false, function (response) {
			// 		if (that.getView().byId("storageLocationPlantScreenId") !== undefined) {
			// 			that.getView().byId("storageLocationPlantScreenId").destroyItems();
			// 		}
			// 		for (var i = 0; i < response.results.length; i++) {
			// 			that.getView().byId("storageLocationPlantScreenId").addItem(
			// 				new sap.ui.core.ListItem({
			// 					text: response.results[i].StorageLoc,
			// 					key: response.results[i].StorageLoc,

			// 					additionalText: response.results[i].LocationDesc
			// 				}));
			// 		}
			// 	});
			// } else {
			this.odataService.read("/PlantMaterialSet?$filter=Plant eq'" + plant + "'", null, null,
				false,
				function (response) {
					if (that.getView().byId("materialPlantScreenId") !== undefined) {
						that.getView().byId("materialPlantScreenId").destroyItems();
					}
					for (var i = 0; i < response.results.length; i++) {
						that.getView().byId("materialPlantScreenId").addItem(
							new sap.ui.core.ListItem({
								text: response.results[i].MaterialDesc,
								key: response.results[i].MaterialDesc,

								additionalText: response.results[i].Material
							}));
					}
				});
			// var that = this;
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

			// sap.ui.getCore().matNum = this.getView().byId("materialPlantScreenId").getSelectedItem().getAdditionalText();

			// }

		},

		selectStorageLoc: function () {
			sap.ui.getCore().matNum = this.getView().byId("materialPlantScreenId").getSelectedItem().getAdditionalText();
			// console.log(sap.ui.getCore().matNum);
			var materialNum = sap.ui.getCore().matNum;
			var plant = this.getView().byId("plantPlantScreenId").getValue();
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

		onSubmitPlantScreen: function () {
				// sap.ui.core.BusyIndicator.show(0);
				var that = this;
				var flag = false;
				var matnr = this.getView().byId("materialPlantScreenId").getValue();
				// if (matnr === "") {
				// 	matnr = "";
				// } else {
				matnr = sap.ui.getCore().matNum;
				// }

				var werks = this.getView().byId("plantPlantScreenId").getValue();
				var lgort = this.getView().byId("storageLocationPlantScreenId").getValue();

				if (werks === "") {
					flag = true;
					sap.m.MessageBox.error("Please Select Mandatory Fields", {
						title: "Error"
					});
					return flag;
				}
				// sap.ui.core.BusyIndicator.show(0);
				if (flag === false) {

					this.odataService.read("/InvenoryStockSet?$filter=matnr eq '" + matnr + "' and werks eq '" + werks + "' and lgort eq '" + lgort +
						"'", null, null, false,
						function (response) {
							that.getView().getModel("PlantScreenOutputModel").setData(response.results);
							that.getView().getModel("PlantScreenOutputModel").refresh(true);
							var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
							oRouter.navTo("PlantScreenOutput", {});
						},
						function (odata, response) {
							// console.log(odata);
							var jsonParse = JSON.parse(odata.response.body);
							var error = jsonParse.error.message.value;
							sap.m.MessageBox.error(error, {
								title: "Error",
								onClose: null,
								styleClass: "",
								initialFocus: null,
								textDirection: sap.ui.core.TextDirection.Inherit
							});
						}
					);

				}
				// sap.ui.core.BsusyIndicator.hide();
				that.setEmpty();
				// sap.ui.core.BusyIndicator.hide();

			}
			/**
			 * Called when a controller is instantiated and its View controls (if available) are already created.
			 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
			 * @memberOf com.axium.Axium.view.PlantScreen
			 */
			//	onInit: function() {
			//
			//	},

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf com.axium.Axium.view.PlantScreen
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf com.axium.Axium.view.PlantScreen
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf com.axium.Axium.view.PlantScreen
		 */
		//	onExit: function() {
		//
		//	}

	});

});