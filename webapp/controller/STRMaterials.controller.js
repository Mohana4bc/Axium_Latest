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
			sap.ui.getCore().doorFlag = this.getView().byId("doorid");
			sap.ui.getCore().doorFlag.setEnabled(false);

		},
		onBeforeShow: function () {
			var oRef = this;
			var oTable = oRef.getView().byId("idSTRMaterials");
			oTable.setMode("SingleSelectMaster");
			oTable.removeSelections("true");
			var oTableData = oRef.getOwnerComponent().getModel("STRMatDocMaterials").getData();
			sap.ui.getCore().reqSumFlag = 0;
			sap.ui.getCore().scanSumFlag = 0;

			$.each(oTableData, function (index, item) {

				var i;
				for (i = 0; i < item.length; i++) {
					var temp = {};
					temp.Quantity = parseFloat(item[i].Quantity);
					temp.ScannedQuantity = parseFloat(item[i].ScannedQuantity);
					sap.ui.getCore().reqSumFlag = sap.ui.getCore().reqSumFlag + temp.Quantity;
					sap.ui.getCore().scanSumFlag = sap.ui.getCore().scanSumFlag + temp.ScannedQuantity;

				}
			});
			if (sap.ui.getCore().scanSumFlag === sap.ui.getCore().reqSumFlag) {
				sap.ui.getCore().doorFlag.setEnabled(true);
			} else {
				sap.ui.getCore().doorFlag.setEnabled(false);
			}
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
			var strScannedPallet = oModel.results[sap.ui.selectedIndex].ScannedQuantity;
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
		},
		doorValidation: function () {
			var oRef = this;
			var dFlag = true;
			var tempDoor = oRef.getView().byId("doorid").getValue();
			if (tempDoor.length >= 3) {
				setTimeout(function () {
					var doorFlag = true;
					oRef.odataService.read("/ScannedDoorNo?DoorNo='" + tempDoor + "'", {
						success: cSuccess,
						failed: cFailed
					});

					function cSuccess(data, response) {
						if (tempDoor === "") {
							MessageBox.error("Please Scan Valid Door Number");
							doorFlag = false;
							return doorFlag;
						} else {
							if (data.DoorDesc === "Valid Door No") {
								oRef.onSubmit();
							} else {
								MessageBox.error("Please Scan Valid Door Number");
								oRef.getView().byId("doorid").setValue("");
								doorFlag = false;
								return doorFlag;
							}

						}
					}

					function cFailed(data, response) {

					}
				}, 1000);

			} else {
				dFlag = false;
				return dFlag;
			}
		},
		onSubmit: function () {

			var oRef = this;
			oRef.odataService.read("/MaterialDoc313mvtSet?$filter=MaterialDocNo eq'" + sap.ui.getCore().matDocNum + "'", {
				success: cSuccess,
				failed: cFailed
			});

			function cSuccess(data, response) {

				var error = data.results[0].ErrorMessage;
				var newdocnum = data.results[0].MaterialDocNoNew;
				if (newdocnum !== "") {

					MessageBox.success("Material Movement Successful, Material Document Number is " + newdocnum + "", {
						title: "Success",
						Action: "OK",
						onClose: function (oAction) {
							if (oAction === sap.m.MessageBox.Action.OK) {
								oRef.getView().byId("doorid").setValue("");
								var sRouter = sap.ui.core.UIComponent.getRouterFor(this);
								sRouter.navTo("ScanMaterialDocument", true);
							}
						}.bind(oRef),
						styleClass: "",
						initialFocus: null,
						textDirection: sap.ui.core.TextDirection.Inherit
					});

				} else {
					oRef.getView().byId("doorid").setValue("");
					MessageBox.error(error);
				}

			}

			function cFailed(data, response) {

			}

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