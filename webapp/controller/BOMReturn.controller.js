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

	return Controller.extend("com.axium.Axium.controller.BOMReturn", {

		onInit: function () {
			this.odataService = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZWM_GW_RFSCREENS_SRV/", true);
			var ProductionOrderMaterial = [];
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.setData({
				ProductionOrderMaterialSet: ProductionOrderMaterial
			});
			this.getOwnerComponent().setModel(oModel, "ProductionOrderMaterial");
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("BOMReturn").attachPatternMatched(this._onObjectMatched, this);
			oRouter.getRoute("PODetailsBack").attachPatternMatched(this._onObjectSelected, this);
		},

		_onObjectMatched: function (oEvent) {
			var oRef = this;
			var poNumber = oEvent.getParameter("arguments").poNumber;
			this.odataService.read("/ProductionRMReturnSet?$filter=ProductionOrder eq '" + poNumber + "'", {
				success: cSuccess,
				failed: cFailed
			});

			function cSuccess(data) {
				var oModel = oRef.getOwnerComponent().getModel("ProductionOrderMaterial");
				var modelData = oModel.getData();
				for (var i = 0; i < data.results.length; i++) {
					if (data.results[i].MaterialNumber === "") {
						var dialog = new Dialog({
							title: "Confirm",
							type: "Message",
							content: new Text({
								text: "Materials not found"
							}),
							beginButton: new Button({
								text: 'OK',
								press: function () {
									var oModelMaterial = oRef.getOwnerComponent().getModel("ProductionOrderMaterial").getData();
									var len = oModelMaterial.ProductionOrderMaterialSet.length;
									oModelMaterial.ProductionOrderMaterialSet.splice(0, len);
									oRef.getOwnerComponent().getModel("ProductionOrderMaterial").refresh();
									oRef.flagSubmit = "";
									var oRouter = oRef.getOwnerComponent().getRouter();
									oRouter.navTo("Return", {});
									dialog.close();
								}
							}),
							afterClose: function () {
								dialog.destroy();
							}
						});
						dialog.open();
					} else {
						modelData.ProductionOrderMaterialSet.push({
							MaterialNumber: data.results[i].MaterialNumber,
							MaterialDesc: data.results[i].MaterialDesc,
							ProductCode: data.results[i].ProductCode,
							ProductionOrder: data.results[i].ProductionOrder,
							RequirementQnty: data.results[i].RequirementQnty,
							Indicator: data.results[i].Indicator,
							MaterialSplit: []
						});
					}

				}
				oModel.refresh();
			}

			function cFailed() {
				MessageBox.error("Could not read PoItemsSet");
			}

		},

		_onObjectSelected: function (oEvent) {

			this.index = oEvent.getParameter("arguments").index;
			var oList = this.getView().byId("idtable1");
			var oSelectedItem = oList.getItems()[this.index];
			// oSelectedItem.$().css("background-color", "#CEDFEB");
			oList.setSelectedItem(oSelectedItem, "true");
		},
		onReturn: function () {

			var oRef = this;
			var data = {};
			data.NavProductionOrderHeaderReturn = [];

			var x = oRef.getOwnerComponent().getModel("ProductionOrderMaterial").getData();
			var oList = this.getView().byId("idtable1");
			var array = oList.getSelectedContextPaths();
			for (var i = 0; i < x.ProductionOrderMaterialSet.length; i++) {
				var items = array.includes("/ProductionOrderMaterialSet/" + i);
				if (items === true) {
					var len = x.ProductionOrderMaterialSet[i].MaterialSplit.length;
					if (len !== 0) {
						for (var j = 0; j < x.ProductionOrderMaterialSet[i].MaterialSplit.length; j++) {
							data.NavProductionOrderHeaderReturn.push({
								ProductionOrder: x.ProductionOrderMaterialSet[i].ProductionOrder,
								ProductCode: x.ProductionOrderMaterialSet[i].ProductCode,
								MaterialNumber: x.ProductionOrderMaterialSet[i].MaterialNumber,
								RequirementQnty: x.ProductionOrderMaterialSet[i].RequirementQnty,
								ReturnQnty: x.ProductionOrderMaterialSet[i].MaterialSplit[j].ReturnQnty,
								StorageBin: x.ProductionOrderMaterialSet[i].MaterialSplit[j].StorageBin,
								BatchNo: x.ProductionOrderMaterialSet[i].MaterialSplit[j].BatchNo
							});
						}
					} else {
						sap.m.MessageBox.alert("Please enter details for materials", {
							title: "Information",
							onClose: null,
							styleClass: "",
							initialFocus: null,
							textDirection: sap.ui.core.TextDirection.Inherit
						});
					}
				}
			}

			this.odataService.create("/ProductionRMReturnHeaderSet", data, null, function (odata, response) {

				var Sresponse = JSON.parse(response.body);
				var PoItems = Sresponse.d.NavProductionOrderHeaderReturn;
				var SuccessMsg = [];
				// var message;
				for (var i in PoItems.results) {
					var ToNumber = PoItems.results[i].ProductionOrder;
					// var BatchNumber = PoItems.results[i].BatchNo;
					var MatNumber = PoItems.results[i].MaterialNumber;
					var Smessage = "Successfully returned for Production order: " + ToNumber + " For Material: " + MatNumber;
					if (Smessage !== "") {
						SuccessMsg.push(Smessage);
					}
				}

				var dialog = new Dialog({
					title: "Confirm",
					type: "Message",
					content: new Text({
						text: Smessage
					}),
					beginButton: new Button({
						text: 'OK',
						press: function () {
							//var oModelMaterial = sap.ui.getCore().getModel("Materials").getData();
							var oModelMaterial = oRef.getOwnerComponent().getModel("ProductionOrderMaterial").getData();
							var len = oModelMaterial.ProductionOrderMaterialSet.length;
							oModelMaterial.ProductionOrderMaterialSet.splice(0, len);
							//sap.ui.getCore().getModel("Materials").refresh();
							oRef.getOwnerComponent().getModel("ProductionOrderMaterial").refresh();
							oRef.flagSubmit = "";
							var oRouter = oRef.getOwnerComponent().getRouter();
							oRouter.navTo("Return", {});
							//MessageToast.show('Submit pressed!');
							dialog.close();
						}
					}),
					afterClose: function () {
						dialog.destroy();
					}
				});
				dialog.open();

			}, function (odata, response) {
				var errorResponse = JSON.parse(odata.response.body);
				var errorDetails = errorResponse.error.innererror.errordetails;
				var errorString = "";
				$.each(errorDetails, function (index, item) {
					if (index !== errorDetails.length - 1) {
						errorString = errorString + item.message + "\n";
					}

				});
				MessageBox.error(errorString, {
					title: "Error",
					onClose: null,
					styleClass: "",
					initialFocus: null,
					textDirection: sap.ui.core.TextDirection.Inherit
				});
			});

		},

		onselectedMatNo: function (oEvent) {

			var materialSelected = oEvent.getSource().oBindingContexts.ProductionOrderMaterial.sPath;
			var material = encodeURIComponent(materialSelected);
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.navTo("BinScanReturn", {
				MatSelect: material
			});

		},

		// onPressBack: function () {
		// 	var oRef = this;
		// 	var oModel = oRef.getOwnerComponent().getModel("ProductionOrderMaterial").getData();
		// 	var len = oModel.ProductionOrderMaterialSet.length;
		// 	oModel.ProductionOrderMaterialSet.splice(0, len);
		// 	oRef.getOwnerComponent().getModel("ProductionOrderMaterial").refresh();
		// 	var sRouter = sap.ui.core.UIComponent.getRouterFor(this);
		// 	sRouter.navTo("Return", true);

		// }
			onPressBack: function () {
			var oRef = this;
			// var oResult = {};
			var flagSelected = "";
			var oModel = oRef.getOwnerComponent().getModel("ProductionOrderMaterial").getData();
			for (var i = 0; i < oModel.ProductionOrderMaterialSet.length; i++) {
				if (oModel.ProductionOrderMaterialSet[i].MaterialSplit.length > 0) {
					flagSelected = "X";
				}
			}
			if (flagSelected === "X" && oRef.flagSubmit !== "X") {
				var dialog = new Dialog({
					title: "Confirm",
					type: "Message",
					content: new Text({
						text: "Data which is not saved will be deleted are you sure you want to go back?"
					}),
					beginButton: new Button({
						text: "Yes",
						press: function () {
							var len = oModel.ProductionOrderMaterialSet.length;
							oModel.ProductionOrderMaterialSet.splice(0, len);
							oRef.getOwnerComponent().getModel("ProductionOrderMaterial").refresh();
							var sRouter = sap.ui.core.UIComponent.getRouterFor(oRef);
							sRouter.navTo("Return", true);
							dialog.close();

						}
					}),
					endButton: new Button({
						text: "Cancel",
						press: function () {
							dialog.close();
						}
					}),
					afterClose: function () {
						dialog.destroy();
					}
				});
				dialog.open();
			} else {
				var len = oModel.ProductionOrderMaterialSet.length;
				oModel.ProductionOrderMaterialSet.splice(0, len);
				oRef.getOwnerComponent().getModel("ProductionOrderMaterial").refresh();
				var sRouter = sap.ui.core.UIComponent.getRouterFor(oRef);
				sRouter.navTo("Return", true);
			}
		}

	});

});