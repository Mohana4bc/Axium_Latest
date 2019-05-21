sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/m/MessageBox",
	"sap/m/Button",
	"sap/m/MessageToast",
	"sap/m/Dialog",
	"sap/m/Text"
], function (Controller, History, MessageBox, Button, MessageToast, Dialog, Text) {
	"use strict";

	return Controller.extend("com.axium.Axium.controller.BinScanPick", {

		onInit: function (oEvent) {

			this.result = {};
			this.result.items = [];
			// var flag = "";
			this.odataService = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZWM_GW_RFSCREENS_SRV/", true);
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("BinScanPick").attachPatternMatched(this._onObjectMatched, this);
		},

		_onObjectMatched: function (oEvent) {
			// console.log(oEvent.getParameter("arguments").MatSelect);
			// debugger;
			var oRef = this;
			var material = oEvent.getParameter("arguments").MatSelect;
			var materialBindinfo = decodeURIComponent(material);
			var a = materialBindinfo.lastIndexOf("/");
			var index = materialBindinfo.slice(+a + +1, 29);
			this.index = +index;
			this.mat = materialBindinfo;
			this.getView().bindElement("ProductionOrderMaterials>" + this.mat);
			var listId = oRef.getView().byId("BatchSplit");
			listId.bindElement("ProductionOrderMaterials>" + this.mat);

			var oModel = this.getOwnerComponent().getModel("ProductionOrderMaterials").getData();
			sap.ui.getCore().batchnum = oModel.ProductionOrderMaterialSet[this.index].Indicator;
			if (oModel.ProductionOrderMaterialSet[this.index].Indicator === "X") {
				var batch = this.getView().byId("BatchNumber");
				batch.setVisible(true);
			} else {
				var batch = this.getView().byId("BatchNumber");
				batch.setVisible(false);

			}

			if (oModel.ProductionOrderMaterialSet[this.index].Indicator === "X") {
				var split = this.getView().byId("split");
				split.setVisible(true);
			} else {

				var split = this.getView().byId("split");
				split.setVisible(false);
			}

		},

		onPressavailableBins: function (oEvent) {
			var that = this;
			var MatSelected = that.getView().byId("id1").getValue();
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.navTo("AvailableBinPick", {
				MatSelect: MatSelected
			});
			this.odataService.read("/RMPickAvailableBinsSet?$filter=Material eq '" + MatSelected + "'", null, null, false, function (response) {
				that.result.items.push(response);
				// that.result.push(response);
				that.getView().getModel("oAvailableBins").setData(response);
				that.getView().getModel("oAvailableBins").refresh(true);

			});

		},
		onPressBack: function () {
			var oRef = this;
			var binNumber = this.getView().byId("BinNumber").getValue();
			var iQty = this.getView().byId("id2").getValue();
			var batchNumber = this.getView().byId("BatchNumber").getValue();
			if (binNumber !== "" || iQty !== "" || batchNumber !== "") {
				var dialog = new Dialog({
					title: "Confirm",
					type: "Message",
					content: new Text({
						text: "Data which is not saved will be deleted are you sure you want to go back?"
					}),
					beginButton: new Button({
						text: "Yes",
						press: function () {
							oRef.getView().byId("BinNumber").setValue("");
							oRef.getView().byId("id2").setValue("");
							oRef.getView().byId("BatchNumber").setValue("");
							var oRouter = oRef.getOwnerComponent().getRouter();
							oRouter.navTo("PODet", {});
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
				oRef.getView().byId("BinNumber").setValue("");
				oRef.getView().byId("id2").setValue("");
				oRef.getView().byId("BatchNumber").setValue("");
				// var index = oRef.mat.slice(28, 29);
				var oRouter = oRef.getOwnerComponent().getRouter();
				oRouter.navTo("PODet", {});
				// oRouter.navTo("PODetBack", {
				// 	index: index
				// });
			}
		},
		onPressSpilt: function (oEvent) {
			var oRef = this;
			var binNumber = this.getView().byId("BinNumber").getValue();
			var iQty = this.getView().byId("id2").getValue();
			var batchNumber = this.getView().byId("BatchNumber").getValue();
			var oModel = oRef.getOwnerComponent().getModel("ProductionOrderMaterials");
			var oModeldata = oModel.getData();
			var Split = {};
			Split.IssueQnty = iQty;
			Split.StorageBin = binNumber;
			Split.BatchNo = batchNumber;
			oModeldata.ProductionOrderMaterialSet[oRef.index].MaterialSplit.push(Split);
			oModel.refresh();
			oRef.flag = "N";
			oRef.getView().byId("BinNumber").setValue("");
			oRef.getView().byId("BatchNumber").setValue("");
			oRef.getView().byId("id2").setValue("");
		},
		handleBin: function (oEvent) {
			var oRef = this;
			var binNumber = this.getView().byId("BinNumber").getValue();

			this.odataService.read("/ScannedBinNumber?BinNumber='" + binNumber + "'", {
				success: cSuccess,
				failed: cFailed
			});

			function cSuccess(data) {

				if (data.Message === "valid Bin") {
					oRef.onPressSpilt();

				} else if (binNumber === "") {
					MessageBox.error("Please Enter Bin Number");
				} else {
					MessageBox.error("Invalid Bin");
					oRef.getView().byId("BinNumber").setValue("");
				}

			}

			function cFailed() {
				MessageBox.error("Bin Number Scan failed");

			}

		},
		handleBatch: function (oEvent) {
			var that = this;
			var batchNumber = this.getView().byId("BatchNumber").getValue();
			var iQty = this.getView().byId("id2").getValue();
			if (sap.ui.getCore().batchnum !== "X") {
				that.handleBin();
			} else {
				this.odataService.read("/ScannedRMPickBatch?BatchNo='" + batchNumber + "'", {
					success: cSuccess,
					failed: cFailed
				});

				function cSuccess(data, response) {
					if (batchNumber === "") {
						MessageBox.error("Please Enter Batch Number");

					} else if (iQty === "") {
						MessageBox.error("Please Enter Issued Quantity");
					} else {

						if (data.Message === "Batch does not exists" || data.Message === "Batch Qty is Zero") {
							sap.m.MessageBox.alert(data.Message, {
								title: "Information",
								onClose: null,
								styleClass: "",
								initialFocus: null,
								textDirection: sap.ui.core.TextDirection.Inherit
							});
							that.getView().byId("BatchNumber").setValue("");

						} else {
							that.handleBin();
						}
					}
				}

				function cFailed() {
					MessageBox.error("Could Not Read Scanned Batch Number");
				}
			}

		},

		onSave: function () {
			var oRef = this;
			var binNumber = this.getView().byId("BinNumber").getValue();
			var iQty = this.getView().byId("id2").getValue();
			var batchNumber = this.getView().byId("BatchNumber").getValue();

			var oModel = oRef.getOwnerComponent().getModel("ProductionOrderMaterials");
			var oModeldata = oModel.getData();
			var Split = {};
			Split.IssueQnty = iQty;
			Split.StorageBin = binNumber;
			Split.BatchNo = batchNumber;
			oModeldata.ProductionOrderMaterialSet[oRef.index].MaterialSplit.push(Split);
			oModel.refresh();
			oRef.flag = "N";
			oRef.getView().byId("BinNumber").setValue("");
			oRef.getView().byId("BatchNumber").setValue("");
			oRef.getView().byId("id2").setValue("");

			var index = oRef.mat.slice(28, 29);
			var oRouter = oRef.getOwnerComponent().getRouter();
			oRouter.navTo("PODetBack", {
				index: index
			});

		},

		handleBinNumber: function (oEvent) {
			var oRef = this;
			var binNumber = this.getView().byId("BinNumber").getValue();
			this.odataService.read("/ScannedBinNumber?BinNumber='" + binNumber + "'", {
				success: cSuccess,
				failed: cFailed
			});

			function cSuccess(data) {

				if (data.Message === "valid Bin") {
					oRef.onSave();

				} else if (binNumber === "") {
					MessageBox.error("Please Enter Bin Number");
				} else {
					MessageBox.error("Invalid Bin");
					oRef.getView().byId("BinNumber").setValue("");
				}

			}

			function cFailed() {
				MessageBox.error("Bin Number Scan failed");

			}

		},
		handleBatchNumber: function (oEvent) {
			var that = this;
			var batchNumber = this.getView().byId("BatchNumber").getValue();
			var iQty = this.getView().byId("id2").getValue();
			if (sap.ui.getCore().batchnum !== "X") {
				that.handleBinNumber();
			} else {
				this.odataService.read("/ScannedRMPickBatch?BatchNo='" + batchNumber + "'", {
					success: cSuccess,
					failed: cFailed
				});

				function cSuccess(data, response) {
					if (batchNumber === "") {
						MessageBox.error("Please Enter Batch Number");

					} else if (iQty === "") {
						MessageBox.error("Please Enter Issued Quantity");
					} else {

						if (data.Message === "Batch does not exists" || data.Message === "Batch Qty is Zero") {
							sap.m.MessageBox.alert(data.Message, {
								title: "Information",
								onClose: null,
								styleClass: "",
								initialFocus: null,
								textDirection: sap.ui.core.TextDirection.Inherit
							});
							that.getView().byId("BatchNumber").setValue("");

						} else {
							that.handleBinNumber();
						}
					}
				}

				function cFailed() {
					MessageBox.error("Could Not Read Scanned Batch Number");
				}
			}

		}
	});

});