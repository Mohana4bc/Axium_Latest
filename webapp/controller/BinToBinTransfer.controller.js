sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/UIComponent",
	"sap/m/MessageBox",
	"sap/m/Button",
	"sap/m/Dialog",
	"sap/m/Text"
], function (Controller, UIComponent, MessageBox, Button, Dialog, Text) {
	"use strict";

	return Controller.extend("com.axium.Axium.controller.BinToBinTransfer", {

		onInit: function () {
			var oRef = this;
			jQuery.sap.require("sap.m.MessageBox"); //since message box is a static class so we need to execute this first.
			this.odataService = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZWM_GW_RFSCREENS_SRV/", true);
			this.odataService.read("/WareHouseSet", null, null, false, function (oData, oResponse) {
				for (var i = 0; i < oData.results.length; i++) {
					oRef.getView().byId("warehouseId").addItem(
						new sap.ui.core.ListItem({
							text: oData.results[i].WHDesc,
							//key: response.results[i].Material,
							additionalText: oData.results[i].WareHouseNumber
						}));
				}

			}, function (oResponse) {
				sap.m.MessageBox.alert("Failed To load the warehouse Number", {
					title: "Information",
					onClose: null,
					styleClass: "",
					initialFocus: null,
					textDirection: sap.ui.core.TextDirection.Inherit
				});
			});

		},

		/*		warehouseNumber: function () {
					var oRef = this;
					var warehouseNumber = oRef.getView().byId("warehouseId").getSelectedItem().getAdditionalText();
					this.odataService.read("/StorageTypeSet?$filter=WareHouseNumber eq '" + warehouseNumber + "'", null, null, false, function (oData,
							oResponse) {
							for (var i = 0; i < oData.results.length; i++) {
								oRef.getView().byId("sourceStorage").addItem(
									new sap.ui.core.ListItem({
										text: oData.results[i].StrTypDesc,
										additionalText: oData.results[i].StorageTyp
									}));
								oRef.getView().byId("destinationStorage").addItem(
									new sap.ui.core.ListItem({
										text: oData.results[i].StrTypDesc,
										additionalText: oData.results[i].StorageTyp
									}));
							}

						},
						function (oResponse) {
							sap.m.MessageBox.alert("Failed To load the Storage types", {
								title: "Information",
								onClose: null,
								styleClass: "",
								initialFocus: null,
								textDirection: sap.ui.core.TextDirection.Inherit
							});

						});

				},
		*/
		AutoStorageType: function () {
			var oRef = this;
			var storageBin = oRef.getView().byId("sourceBin").getValue();
			var storageBinFlag = false;
			var warehouseNumber = this.getView().byId("warehouseId").getSelectedItem().getAdditionalText();
			// if ((storageBin.length >= 5) || (storageBin.length >= 6) || (storageBin.length >= 7) || (storageBin.length >=
			// 		8) || (storageBin.length >= 9) || (storageBin.length >= 10)) {
			// if (storageBin.length <= 10) {
				setTimeout(function () {
					oRef.odataService.read("/AutoStorageTypeSet?$filter=WareHouseNumber eq '" + warehouseNumber + "' and BinNumber eq '" +
						storageBin +
						"'", null, null, false,
						function (oData, oResponse) {
							var sourceStorageType;
							for (var i = 0; i < oData.results.length; i++) {
								sourceStorageType = oData.results[i].StorageType;
							}
							oRef.getView().byId("sourceStorage").setValue(sourceStorageType);
						},
						function (oResponse) {
							sap.m.MessageBox.alert("Failed to Load the storage type of scanned Bin", {
								title: "Information",
								onClose: null,
								styleClass: "",
								initialFocus: null,
								textDirection: sap.ui.core.TextDirection.Inherit
							});
						});
				}, 1000);
			// }
			// else {
			// 	storageBinFlag = true;
			// 	return storageBinFlag;
			// }

		},

		onNext: function () {
			var oRef = this;
			var warehouseNumber = this.getView().byId("warehouseId").getSelectedItem().getAdditionalText();
			var sourceStorage = this.getView().byId("sourceStorage").getValue();
			var sourceBin = this.getView().byId("sourceBin").getValue();
			var whBintoBinFlag = false;
			if (warehouseNumber === "A01" || warehouseNumber === "A04") {
				whBintoBinFlag = true;
				sap.ui.getCore().huBinTransfer = "X";
			} else {
				if (warehouseNumber === "A02" || warehouseNumber === "A05") {
					whBintoBinFlag = false;
					sap.ui.getCore().huBinTransfer = "";
				}
			}
			if (warehouseNumber !== "" && sourceStorage !== "" && sourceBin !== "") {
				var oRouter = this.getOwnerComponent().getRouter();
				oRouter.navTo("HUorMatScan", {
					warehouseNumber: warehouseNumber,
					sourceStorage: sourceStorage,
					sourceBin: sourceBin,
					whBintoBinFlag: whBintoBinFlag
				});
				oRef.setEmpty();
			} else {
				sap.m.MessageBox.alert("Warehouse number, source storage type and source storage bin cannot be empty", {
					title: "Information",
					onClose: null,
					styleClass: "",
					initialFocus: null,
					textDirection: sap.ui.core.TextDirection.Inherit
				});
			}
		},

		setEmpty: function () {
			this.getView().byId("warehouseId").setValue("");
			this.getView().byId("warehouseId").clearSelection(true);
			this.getView().byId("sourceStorage").setValue("");
			/*this.getView().byId("sourceStorage").clearSelection(true);*/
			this.getView().byId("sourceBin").setValue("");
			/*this.getView().byId("sourceBin").clearSelection(true);*/
		},

		onPressBack: function () {
			this.setEmpty();
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.navTo("Home", {});
		}

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf Z_AXIUMPLASTIC.view.BinToBinTransfer
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf Z_AXIUMPLASTIC.view.BinToBinTransfer
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf Z_AXIUMPLASTIC.view.BinToBinTransfer
		 */
		//	onExit: function() {
		//
		//	}
	});

});