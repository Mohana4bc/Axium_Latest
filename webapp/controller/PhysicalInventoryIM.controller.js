sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/m/MessageBox",
	"sap/m/Button",
	"sap/m/Dialog",
	"sap/m/MessageToast",
	"sap/m/Text"
], function (Controller, History, MessageBox, Button, Dialog, MessageToast, Text) {
	"use strict";

	return Controller.extend("com.axium.Axium.controller.PhysicalInventoryIM", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.axium.Axium.view.PhysicalInventoryIM
		 */
		onInit: function () {
			var oRef = this;
			var data = [];
			oRef.odataService = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZWM_GW_RFSCREENS_SRV/", true);
			this.aData = [];
			this.oList = this.getView().byId("idList");
			this.getView().addEventDelegate({
				onBeforeShow: jQuery.proxy(function (evt) {
					this.onBeforeShow(evt);
				}, this)
			});
		},
		onBeforeShow: function () {
			if (sap.ui.getCore().stgloc === "RM01") {
				this.getView().byId("binNumber").setVisible(true);
				this.getView().byId("palletsNumber").setVisible(true);
				this.getView().byId("scannedpalletsNumber").setVisible(true);
				this.getView().byId("matNumber").setVisible(true);
				this.getView().byId("materialDesc").setVisible(true);
				this.getView().byId("BatchNumber").setVisible(true);
				this.getView().byId("palletsNumber").setVisible(false);
				this.getView().byId("scannedpalletsNumber").setVisible(false);

			} else {
				this.getView().byId("binNumber").setVisible(true);
				this.getView().byId("palletsNumber").setVisible(true);
				this.getView().byId("scannedpalletsNumber").setVisible(true);
				this.getView().byId("matNumber").setVisible(true);
				this.getView().byId("materialDesc").setVisible(true);
				this.getView().byId("BatchNumber").setVisible(true);
				this.getView().byId("palletsNumber").setVisible(true);
				this.getView().byId("scannedpalletsNumber").setVisible(true);
			}
		},
		onPressBack: function () {
			var that = this;
			that.getView().byId("binNumber").setValue("");
			that.getView().byId("palletsNumber").setValue("");
			that.getView().byId("binNumber").setEnabled(true);
			that.getView().byId("palletsNumber").setEnabled(true);
			that.getView().byId("scannedpalletsNumber").setValue("0");
			that.getView().byId("matNumber").setValue("");
			that.getView().byId("materialDesc").setValue("");
			that.getView().byId("BatchNumber").setValue("");
			var aData = that.getView().getModel("PYIMListModel").getData();
			that.aData = [];
			that.getView().getModel("PYIMListModel").setData(that.aData);
			var sRouter = sap.ui.core.UIComponent.getRouterFor(that);
			sRouter.navTo("PlantStorageLoc", true);
		},
		onBinValidation: function () {
			var oRef = this;
			var oBinNumber = oRef.getView().byId("binNumber").getValue();
			oRef.odataService.read("/ScannedBinNumber?BinNumber='" + oBinNumber + "'", null,
				null, false,
				function (data) {
					oRef.getView().byId("binNumber").setEnabled(false);
					setTimeout(function () {
						var oInput = oRef.getView().byId("palletsNumber");
						oInput.focus();
					}, 1000);
				},
				function () {
					MessageBox.error("Invalid Bin");
					oRef.getView().byId("binNumber").SetValue("");
				}
			);
		},
		onClearBin: function () {
			var oRef = this;
			// var data = oRef.getView().getModel("PYIMListModel").getData(oRef.result);
			oRef.getView().byId("binNumber").setEnabled(true);
			oRef.getView().byId("palletsNumber").setEnabled(true);
			oRef.getView().byId("binNumber").setValue("");
			oRef.getView().byId("palletsNumber").setValue("");
			oRef.getView().byId("scannedpalletsNumber").setValue("0");
			oRef.getView().byId("Quantity").setValue("");
			oRef.getView().byId("matNumber").setValue("");
			oRef.getView().byId("materialDesc").setValue("");
			oRef.getView().byId("BatchNumber").setValue("");
			var aData = oRef.getView().getModel("PYIMListModel").getData();
			oRef.aData = [];
			oRef.getView().getModel("PYIMListModel").setData(oRef.aData);

		},
		onNextBin: function () {
			var oRef = this;
			oRef.getView().byId("binNumber").setEnabled(true);
			oRef.getView().byId("palletsNumber").setEnabled(true);
			oRef.getView().byId("binNumber").setValue("");
			oRef.getView().byId("palletsNumber").setValue("");
			oRef.getView().byId("scannedpalletsNumber").setValue("0");
			oRef.getView().byId("Quantity").setValue("");
			oRef.getView().byId("matNumber").setValue("");
			oRef.getView().byId("materialDesc").setValue("");
			oRef.getView().byId("BatchNumber").setValue("");
		},
		onMaterialValidate: function () {
			var oRef = this;
			var mat = oRef.getView().byId("matNumber").getValue();
			oRef.odataService.read("/MaterialSet('" + mat + "')", null, null, false, function (oData, oResponse) {
					var matdesc = oResponse.data.MaterialDesc;
					oRef.getView().byId("materialDesc").setValue(matdesc);
					oRef.getView().byId("palletsNumber").setEnabled(false);
				},
				function (oData, oResponse) {
					// console.log(oResponse);
					var error = JSON.parse(oData.response.body);
					var errorMsg = error.error.message.value;
					if (errorMsg === "Material Not Found.") {
						oRef.getView().byId("idMaterialDescription").setValue("");
						MessageBox.error("Please scan a correct material");
					} else {
						oRef.getView().byId("idMaterialDescription").setValue("");
						MessageBox.error("Please scan a correct material");
					}
				}
			);
		},
		onAddMaterial: function () {
			var oRef = this;
			var oBinNumber = oRef.getView().byId("binNumber").getValue();
			var requiredPallets = oRef.getView().byId("palletsNumber").getValue();
			var oQuantity = oRef.getView().byId("Quantity").getValue();
			var oMaterialNumber = oRef.getView().byId("matNumber").getValue();
			var oMaterialDescription = oRef.getView().byId("materialDesc").getValue();
			var oBatch = oRef.getView().byId("BatchNumber").getValue();
			var scannedPallets = oRef.getView().byId("scannedpalletsNumber").getValue();

			if (sap.ui.getCore().stgloc === "RM01") {
				oRef.RM01MaterialAdd();
			} else {
				if (oBinNumber === "" || oQuantity === "" || oMaterialNumber === "" || oMaterialDescription === "" || oBatch === "" ||
					requiredPallets === "") {
					MessageBox.error("Please scan all mandatory fields");
				} else {
					var aData = oRef.getView().getModel("PYIMListModel");
					if (aData !== undefined) {
						// var aData = oRef.getOwnerComponent().getModel("oListHUCpy").getData();
						var extFlag = true;

						$.each(aData.oData.PYIMListSet, function (index, item) {
							var numscannedPallets = parseFloat(scannedPallets);
							var numrequiredPallets = parseFloat(requiredPallets);

							if (item.BinNumber === oBinNumber && item.MaterialNumber === oMaterialNumber && item.Batch === oBatch && numscannedPallets >
								numrequiredPallets) {
								extFlag = false;
								MessageBox.information("Material already scanned", {
									title: "Information"
								});
								oRef.getView().byId("Quantity").setValue("");
								oRef.getView().byId("matNumber").setValue("");
								oRef.getView().byId("materialDesc").setValue("");
								oRef.getView().byId("BatchNumber").setValue("");
							}

						});
						if (extFlag === true) {
							if (scannedPallets === requiredPallets) {
								MessageBox.error("Materials Picked");
								oRef.getView().byId("Quantity").setValue("");
								oRef.getView().byId("matNumber").setValue("");
								oRef.getView().byId("materialDesc").setValue("");
								oRef.getView().byId("BatchNumber").setValue("");
							} else {
								scannedPallets = parseFloat(scannedPallets) + parseFloat(oQuantity);
								if (scannedPallets > requiredPallets) {
									MessageBox.error("Please enter quantity less than required quantity");
									oRef.getView().byId("Quantity").setValue("");
								} else {
									oRef.getView().byId("scannedpalletsNumber").setValue(scannedPallets);
									oRef.aData.push({
										BinNumber: oBinNumber,
										Quantity: oQuantity,
										MaterialNumber: oMaterialNumber,
										MaterialDescription: oMaterialDescription,
										Batch: oBatch
									});

									var oModel = oRef.getView().getModel("PYIMListModel");

									oModel.setData({
										PYIMListSet: oRef.aData
									});
									oRef.getOwnerComponent().setModel(oModel, "PYIMListModel");
									oRef.getView().byId("Quantity").setValue("");
									oRef.getView().byId("matNumber").setValue("");
									oRef.getView().byId("materialDesc").setValue("");
									oRef.getView().byId("BatchNumber").setValue("");
								}

							}

						}
					}

				}
			}

		},
		RM01MaterialAdd: function () {
			var oRef = this;
			var oBinNumber = oRef.getView().byId("binNumber").getValue();
			var oQuantity = oRef.getView().byId("Quantity").getValue();
			var oMaterialNumber = oRef.getView().byId("matNumber").getValue();
			var oMaterialDescription = oRef.getView().byId("materialDesc").getValue();
			var oBatch = oRef.getView().byId("BatchNumber").getValue();
			var aData = oRef.getView().getModel("PYIMListModel");
			if (aData !== undefined) {
				var extFlag = true;
				$.each(aData.oData.PYIMListSet, function (index, item) {

					if (item.BinNumber === oBinNumber && item.MaterialNumber === oMaterialNumber && item.Batch === oBatch && item.Quantity ===
						oQuantity) {
						extFlag = false;
						MessageBox.information("Material already scanned", {
							title: "Information"
						});
						oRef.getView().byId("Quantity").setValue("");
						oRef.getView().byId("matNumber").setValue("");
						oRef.getView().byId("materialDesc").setValue("");
						oRef.getView().byId("BatchNumber").setValue("");
					}

				});
				if (extFlag === true) {
					oRef.aData.push({
						BinNumber: oBinNumber,
						Quantity: oQuantity,
						MaterialNumber: oMaterialNumber,
						MaterialDescription: oMaterialDescription,
						Batch: oBatch
					});

					var oModel = oRef.getView().getModel("PYIMListModel");

					oModel.setData({
						PYIMListSet: oRef.aData
					});
					oRef.getOwnerComponent().setModel(oModel, "PYIMListModel");
					oRef.getView().byId("Quantity").setValue("");
					oRef.getView().byId("matNumber").setValue("");
					oRef.getView().byId("materialDesc").setValue("");
					oRef.getView().byId("BatchNumber").setValue("");
				}

			}

		},
		onDelete: function () {
			var that = this;
			that.oModel = that.getView().getModel("PYIMListModel");
			var data = that.getView().getModel("PYIMListModel").getData(that.result);

			that.oList = that.byId("idList");

			var sItems = that.oList.getSelectedItems();

			if (sItems.length === 0) {
				MessageBox.information("Please Select a Row to Delete");
				return;
			} else {

				for (var i = sItems.length - 1; i >= 0; i--) {
					var path = sItems[i].getBindingContextPath();
					var idx = parseInt(path.substring(path.lastIndexOf('/') + 1));
					var updateQty = data.PYIMListSet[idx].Quantity;
					if (sap.ui.getCore().stgloc === "RM01") {
						data.PYIMListSet.splice(idx, 1);
					} else {
						var scannedPallets = that.getView().byId("scannedpalletsNumber").getValue();
						if (scannedPallets !== "0") {
							scannedPallets = parseFloat(scannedPallets) - parseFloat(updateQty);
							that.getView().byId("scannedpalletsNumber").setValue(scannedPallets);
						} else {
							that.getView().byId("scannedpalletsNumber").setValue("0");
						}

						data.PYIMListSet.splice(idx, 1);
					}

				}
				that.getView().getModel("PYIMListModel").refresh(true);
			}
			that.oList.removeSelections();

		},
		onSave: function () {
			var oRef = this;
			var oRequiredPallets = oRef.getView().byId("palletsNumber").getValue();
			var oScannedPallets = oRef.getView().byId("scannedpalletsNumber").getValue();
			if (sap.ui.getCore().stgloc === "RM01") {
				//Submit Service
			} else {
				if (oScannedPallets !== oRequiredPallets) {
					MessageBox.error("Scanned Pallets/Quantity are not equal");
				} else {
					// Submit Service
				}
			}

		}

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf com.axium.Axium.view.PhysicalInventoryIM
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf com.axium.Axium.view.PhysicalInventoryIM
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf com.axium.Axium.view.PhysicalInventoryIM
		 */
		//	onExit: function() {
		//
		//	}

	});

});