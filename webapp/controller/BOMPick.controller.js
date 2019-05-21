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

	return Controller.extend("com.axium.Axium.controller.BOMPick", {

		onInit: function () {

			// debugger;
			// this.result = {};
			// this.result.items = [];
			this.odataService = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZWM_GW_RFSCREENS_SRV/", true);
			var ProductionOrderMaterials = [];
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.setData({
				ProductionOrderMaterialSet: ProductionOrderMaterials
			});
			this.getOwnerComponent().setModel(oModel, "ProductionOrderMaterials");
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("BOMPick").attachPatternMatched(this._onObjectMatched, this);
			oRouter.getRoute("PODetBack").attachPatternMatched(this._onObjectSelected, this);
			//this.getView().getModel("oTablePickAlias");
			//this.getView().byId("idtable1");
			//this.getView().setModel("oTablePickAlias");

		},

		_onObjectMatched: function (oEvent) {
			//ScannedProductionOrderNo?ProductionOrder
			var oRef = this;
			var poNumber = oEvent.getParameter("arguments").poNumber;
			//this.odataService = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZWM_GW_RFSCREENS_SRV/", true);
			this.odataService.read("/ProductionRMPickingSet?$filter=ProductionOrder eq '" + poNumber + "'", {
				success: cSuccess,
				failed: cFailed
			});

			function cSuccess(data) {

				var oModel = oRef.getOwnerComponent().getModel("ProductionOrderMaterials");
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
									var oModelMaterial = oRef.getOwnerComponent().getModel("ProductionOrderMaterials").getData();
									var len = oModelMaterial.ProductionOrderMaterialSet.length;
									oModelMaterial.ProductionOrderMaterialSet.splice(0, len);
									oRef.getOwnerComponent().getModel("ProductionOrderMaterials").refresh();
									oRef.flagSubmit = "";
									var oRouter = oRef.getOwnerComponent().getRouter();
									oRouter.navTo("Pick", {});
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
			/*var oRef = this;*/
			this.index = oEvent.getParameter("arguments").index;
			var oList = this.getView().byId("idtable1");
			var oSelectedItem = oList.getItems()[this.index];
			oList.setSelectedItem(oSelectedItem, "true");
		},

		onPick: function () {

			var oRef = this;
			var data = {};
			// var count = 0;
			data.NavProductionOrderHeaderPick = [];
			var x = oRef.getOwnerComponent().getModel("ProductionOrderMaterials").getData();
			var oList = this.getView().byId("idtable1");
			var array = oList.getSelectedContextPaths();
			for (var i = 0; i < x.ProductionOrderMaterialSet.length; i++) {
				var items = array.includes("/ProductionOrderMaterialSet/" + i);
				if (items === true) {
					var len = x.ProductionOrderMaterialSet[i].MaterialSplit.length;
					if (len !== 0) {
						for (var j = 0; j < x.ProductionOrderMaterialSet[i].MaterialSplit.length; j++) {
							// count = count + 1;
							data.NavProductionOrderHeaderPick.push({
								ProductionOrder: x.ProductionOrderMaterialSet[i].ProductionOrder,
								ProductCode: x.ProductionOrderMaterialSet[i].ProductCode,
								MaterialNumber: x.ProductionOrderMaterialSet[i].MaterialNumber,
								RequirementQnty: x.ProductionOrderMaterialSet[i].RequirementQnty,
								IssueQnty: x.ProductionOrderMaterialSet[i].MaterialSplit[j].IssueQnty,
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
			// if (count === data.NavProductionOrderHeaderPick.length) {
			this.odataService.create("/ProductionRMPickHeaderSet", data, null, function (odata, response) {

				var Sresponse = JSON.parse(response.body);
				var PoItems = Sresponse.d.NavProductionOrderHeaderPick;
				var SuccessMsg = [];
				// var message;
				for (var i in PoItems.results) {
					var ToNumber = PoItems.results[i].ProductionOrder;
					// var BatchNumber = PoItems.results[i].BatchNo;
					var MatNumber = PoItems.results[i].MaterialNumber;
					var Smessage = "Successfully picked for Production order: " + ToNumber + " For Material: " + MatNumber;
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
							var oModelMaterial = oRef.getOwnerComponent().getModel("ProductionOrderMaterials").getData();
							var len = oModelMaterial.ProductionOrderMaterialSet.length;
							oModelMaterial.ProductionOrderMaterialSet.splice(0, len);
							oRef.getOwnerComponent().getModel("ProductionOrderMaterials").refresh();
							oRef.flagSubmit = "";
							// var oList = oRef.getView().byId("idtable1");
							// var selectedArr = oList.getSelectedItems();
							// for (var i = 0; i < selectedArr.length; i++) {
							// 	oList.setSelectedItem(selectedArr[i], false);
							// }
							// oList.refresh();
							var oRouter = oRef.getOwnerComponent().getRouter();
							oRouter.navTo("Pick", {});
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
						// errorString = errorString + item.code + " " + item.message + "\n";
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
			// } else {
			// 	sap.m.MessageBox.alert("Please Enter details of all the selected material", {
			// 		title: "Information",
			// 		onClose: null,
			// 		styleClass: "",
			// 		initialFocus: null,
			// 		textDirection: sap.ui.core.TextDirection.Inherit
			// 	});
			// 	oRef.flagSubmit = "";
			// }

		},

		onselectedMatNo: function (oEvent) {

			var materialSelected = oEvent.getSource().oBindingContexts.ProductionOrderMaterials.sPath;
			var material = encodeURIComponent(materialSelected);
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.navTo("BinScanPick", {
				MatSelect: material
			});

		},

		// onPressBack: function () {
		// 	var oRef = this;
		// 	var oModel = oRef.getOwnerComponent().getModel("ProductionOrderMaterials").getData();
		// 	var len = oModel.ProductionOrderMaterialSet.length;
		// 	oModel.ProductionOrderMaterialSet.splice(0, len);
		// 	oRef.getOwnerComponent().getModel("ProductionOrderMaterials").refresh();
		// 	var sRouter = sap.ui.core.UIComponent.getRouterFor(this);
		// 	sRouter.navTo("Pick", true);

		// }
		onPressBack: function () {
			var oRef = this;
			// var oResult = {};
			var flagSelected = "";
			var oModel = oRef.getOwnerComponent().getModel("ProductionOrderMaterials").getData();
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
							oRef.getOwnerComponent().getModel("ProductionOrderMaterials").refresh();
							var sRouter = sap.ui.core.UIComponent.getRouterFor(oRef);
							sRouter.navTo("Pick", true);
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
				oRef.getOwnerComponent().getModel("ProductionOrderMaterials").refresh();
				var sRouter = sap.ui.core.UIComponent.getRouterFor(oRef);
				sRouter.navTo("Pick", true);
			}
		}

	});

});