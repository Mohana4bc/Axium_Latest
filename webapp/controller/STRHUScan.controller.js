sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/m/MessageBox"
], function (Controller, History, MessageBox) {
	"use strict";

	return Controller.extend("com.axium.Axium.controller.STRHUScan", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.axium.Axium.view.STRHUScan
		 */
		onInit: function () {
			this.odataService = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZWM_GW_RFSCREENS_SRV/", true);
			this.oList = this.getView().byId("idList");
			this.result = {};
			this.aData = [];
			this.result.items = [];
			sap.ui.getCore().saveFlag = false;
			this.getView().addEventDelegate({
				onBeforeShow: jQuery.proxy(function (evt) {
					this.onBeforeShow(evt);
				}, this)
			});
		},
		onBeforeShow: function () {
			var oRef = this;
			var aData = oRef.getView().getModel("oListHU").getData();
			oRef.aData = [];
			oRef.getView().getModel("oListHU").setData(oRef.aData);
			oRef.getView().getModel("oListHU").refresh(true);
			this.getView().byId("idList").destroyItems();
		},
		onPressBack: function () {
			var sRouter = sap.ui.core.UIComponent.getRouterFor(this);
			sRouter.navTo("STRMaterials", true);
			this.getView().byId("idSTRHU").setValue("");
			var oRef = this;
			var aData = oRef.getView().getModel("oListHU").getData();
			oRef.aData = [];
			oRef.getView().getModel("oListHU").setData(oRef.aData);
			oRef.getView().getModel("oListHU").refresh(true);
			this.getView().byId("idList").destroyItems();
			// var aData = oRef.getView().getModel("STRMatDocMaterials").getData();
			// var sQuantity = oRef.getView().byId("idSTRScannedPallets").getValue();
			// aData.results[sap.ui.selectedIndex].ScannedQuantity = "2";
			// oRef.getView().getModel("STRMatDocMaterials").refresh(true);
		},
		validateHU: function () {
			var oRef = this;
			var hFlag = false;
			var rQuantity = oRef.getView().byId("idSTRRequiredPallets").getValue();
			var sQuantity = oRef.getView().byId("idSTRScannedPallets").getValue();
			sQuantity = parseFloat(sQuantity);
			rQuantity = parseFloat(rQuantity);

			if (sQuantity < rQuantity) {
				var tempVar = oRef.getView().byId("idSTRHU").getValue();
				var materialDocNumber = oRef.getView().byId("idSTRMatDocNum").getValue();
				var bool = tempVar.startsWith("(");
				if (bool) {
					tempVar = tempVar.replace(/[^A-Z0-9]+/ig, "");
				} else {
					tempVar = tempVar;
				}
				var regExp = /^0[0-9].*$/;
				var test = regExp.test(tempVar);
				if (test || bool) {
					if (tempVar.length >= 20) {
						setTimeout(function () {
							tempVar = tempVar.replace(/[^A-Z0-9]+/ig, "");
							tempVar = tempVar.replace(/^0+/, '');
							oRef.getView().byId("idSTRHU").setValue(tempVar);
							var aData = oRef.getView().getModel("oListHU");
							if (aData != undefined) {
								var aData = oRef.getOwnerComponent().getModel("oListHU").getData();
								var extFlag = true;

								$.each(aData.HUSet, function (index, item) {

									if (item.ExternalHU === tempVar) {
										extFlag = false;
										oRef.getView().byId("idSTRHU").setValue("");
										sap.m.MessageBox.alert("HU Number is already scanned", {
											title: "Information"
										});
									}
								});
							}
							if (extFlag) {
								oRef.odataService.read("/MaterialDocHUValidation/?MaterialDocNo='" + materialDocNumber + "'&ExternalHU='" + tempVar + "'", {
									success: cSuccess,
									failed: cFailed
								});
							}

							function cSuccess(data) {

								if (data.Message === "Valid") {
									oRef.HUDetails();
								} else if (tempVar === "") {

								} else {
									MessageBox.error("Please scan a correct HU");
									oRef.getView().byId("idSTRHU").setValue("");
								}

							}

							function cFailed() {
								MessageBox.error("HU Number Scan Failed");
							}
						}, 1000);
					} else {
						hFlag = true;
						return hFlag;
					}
				} else {
					if (tempVar.length >= 18) {
						setTimeout(function () {
							tempVar = tempVar.replace(/[^A-Z0-9]+/ig, "");
							tempVar = tempVar.replace(/^0+/, '');
							oRef.getView().byId("idSTRHU").setValue(tempVar);
							var tempMat = oRef.getView().byId("idSTRMatDocNum");
							var aData = oRef.getView().getModel("oListHU");
							if (aData != undefined) {
								var aData = oRef.getOwnerComponent().getModel("oListHU").getData();
								var extFlag = true;

								$.each(aData.HUSet, function (index, item) {

									if (item.ExternalHU === tempVar) {
										extFlag = false;
										oRef.getView().byId("idSTRHU").setValue("");
										sap.m.MessageBox.alert("HU Number is already scanned", {
											title: "Information"
										});
									}
								});
							}
							if (extFlag) {

								oRef.odataService.read("/MaterialDocHUValidation/?MaterialDocNo='" + materialDocNumber + "'&ExternalHU='" + tempVar + "'", {
									success: cSuccess,
									failed: cFailed
								});
							}

							function cSuccess(data) {

								if (data.Message === "Valid") {
									oRef.HUDetails();
								} else if (tempVar === "") {

								} else {
									MessageBox.error("Please scan a correct HU");
									oRef.getView().byId("idSTRHU").setValue("");
								}

							}

							function cFailed() {
								MessageBox.error("HU Number Scan Failed");
							}
						}, 1000);
					} else {

						hFlag = true;
						return hFlag;
					}
				}

			} else {
				MessageBox.error("HU Picking Completed");
				oRef.getView().byId("idSTRHU").setValue("");
			}

		},
		HUDetails: function () {
			var oRef = this;
			var tempVar = oRef.getView().byId("idSTRHU").getValue();
			var materialNumber = oRef.getView().byId("idSTRMaterialNumber").getValue();
			this.odataService.read("/HUQtyDetailsSet?$filter=ExternalHU eq '" + tempVar + "' and Material eq '" + materialNumber + "'", {
				success: cSuccess,
				failed: cFailed
			});

			function cSuccess(data) {

				oRef.aData.push({
					ExternalHU: data.results[0].HU,
					BatchNo: data.results[0].BatchNo,
					ScannedQnty: data.results[0].ScannedQnty
				});

				var oModel = new sap.ui.model.json.JSONModel();

				oModel.setData({
					HUSet: oRef.aData
				});
				oRef.getView().byId("idSTRHU").setValue("");
				oRef.getOwnerComponent().setModel(oModel, "oListHU");
				var sQuantity = oRef.getView().byId("idSTRScannedPallets").getValue();
				sQuantity = parseFloat(sQuantity);
				sQuantity = sQuantity + 1;
				oRef.getView().byId("idSTRScannedPallets").setValue(sQuantity);
			}

			function cFailed() {
				MessageBox.error("HU Scan Failed");
			}
		},
		onSave: function () {
			var oRef = this;
			var rQuantity = oRef.getView().byId("idSTRRequiredPallets").getValue();
			var sQuantity = oRef.getView().byId("idSTRScannedPallets").getValue();
			sQuantity = parseFloat(sQuantity);
			rQuantity = parseFloat(rQuantity);
			if (sQuantity < rQuantity) {
				MessageBox.error("Please scan all required pallets");
			} else {
				var aData = oRef.getView().getModel("STRMatDocMaterials").getData();
				var sQuantity = oRef.getView().byId("idSTRScannedPallets").getValue();
				aData.results[sap.ui.selectedIndex].ScannedQuantity = sQuantity;
				oRef.getView().getModel("STRMatDocMaterials").refresh(true);
				sap.ui.getCore().saveFlag = true;

				var aData = oRef.getView().getModel("oListHU").getData();
				oRef.aData = [];
				oRef.getView().getModel("oListHU").setData(oRef.aData);
				oRef.getView().getModel("oListHU").refresh(true);
				this.getView().byId("idList").destroyItems();
				var sRouter = sap.ui.core.UIComponent.getRouterFor(this);
				sRouter.navTo("STRMaterials", true);
				oRef.getView().byId("idSTRHU").setValue("");
			}
		}

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf com.axium.Axium.view.STRHUScan
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf com.axium.Axium.view.STRHUScan
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf com.axium.Axium.view.STRHUScan
		 */
		//	onExit: function() {
		//
		//	}

	});

});