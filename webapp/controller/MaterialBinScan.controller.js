sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/m/MessageBox"
], function (Controller, History, MessageBox) {
	"use strict";

	return Controller.extend("com.axium.Axium.controller.MaterialBinScan", {
		onInit: function () {
			this.result = {};
			this.result.items = [];
			this.odataService = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZWM_GW_RFSCREENS_SRV/", true);

			this.oList = this.getView().byId("idList");
			this.aData = [];

			this.getView().addEventDelegate({
				onBeforeShow: jQuery.proxy(function (evt) {
					this.onBeforeShow(evt);
				}, this)
			});

			// this.getOwnerComponent().getModel("oMyModel");
			// this.getView().setModel("oMyModel");
			// var myList = this.getView().byId("idList");
			// // this.getOwnerComponent().getModel("oScanQTModel");
			// myList.setModel("oMyModel");
			// var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			// oRouter.getRoute("MaterialBinScan").attachPatternMatched(this._onObjectMatched, this);
		},
		// _onObjectMatched: function(oEvent) {
		// 	// console.log(oEvent.getParameter("arguments").Quantity);
		// 	var oRef = this;

		// 	var aData = oRef.getView().getModel("oListHU").getData();
		// 	this.getView().getModel("oListHU").refresh(true);
		// 	var myMatJson = new sap.ui.model.json.JSONModel();
		// 	var data = {};
		// 	// var args = oEvent.getParameter("arguments");
		// 	// var myMatNo = args.MaterialNumber;
		// 	// var myQuantity = args.Quantity;

		// 	var aData = oRef.getView().getModel("oMatSelect");
		// 	var data = {};
		// 	data.myMatNo = oEvent.getParameter("arguments").MaterialNumber;
		// 	data.myMatDesc = oEvent.getParameter("arguments").MaterialDescription;
		// 	data.myQuantity = oEvent.getParameter("arguments").Quantity;
		// 	data.myDelNum = oEvent.getParameter("arguments").DeliveryNo;
		// 	data.myScannedQty = "0.000";
		// 	aData.setData(data);
		// 	data.myBinNo = "";
		// 	// data.myBinNo = oEvent.getParameter("arguments").BinNumber;

		// 	// oRef.oList.getModel("oListHU").setData(data.myBinNo);
		// 	// oRef.oList.getModel("oListHU").refresh(true);
		// 	// var tempHU = result.HUSet[0].ExternalHU;

		// 	oRef.getView().getModel("oMatSelect").refresh(true);

		// 	// this.getView().setModel(myMatJson, "oMatSelect");

		// onAfterRendering: function () {
		// 	var oRef = this;
		// 	setTimeout(function () {
		// 		var oInput = oRef.getView().byId("id8");
		// 		oInput.focus();
		// 	}, 1000);
		// },

		onBeforeShow: function (oEvent) {
			var oRef = this;
			setTimeout(function () {
				var oInput = oRef.getView().byId("id1");
				oInput.focus();
			}, 1000);
			var batReq = sap.ui.getCore().batchReq;
			if (batReq === 'NO') {
				var batchEnabled = oRef.getView().byId("id8");
				batchEnabled.setEnabled(false);
				var batLabel = oRef.getView().byId("idBatch");
				batLabel.setDisplayOnly(true);
				batLabel.setRequired(false);
			}

		},

		handleBinNumber: function (oEvent) {
			var oRef = this;

			var tempVar = oRef.getView().byId("id1").getValue();
			oRef.getView().byId("id1").setValue(tempVar);
			var aData = oRef.getView().getModel("oListHU");
			oRef.getView().getModel("oListHU").refresh(true);
			if (aData != undefined) {
				// var aData = oRef.getOwnerComponent().getModel("oListHU").getData();
				var extFlag = true;

				$.each(aData.HUSet, function (index, item) {

					if (item.BinNumber === tempVar) {
						extFlag = false;
						oRef.getView().byId("id1").setValue("");
						sap.m.MessageBox.alert("Bin Number is already scanned", {
							title: "Information"
						});
					}
				});
				// this.getView().byId("id1").setValue("");
			}
			if (extFlag) {

				this.odataService.read("/ScannedBinNumber?BinNumber='" + tempVar + "'", {

					success: cSuccess,
					failed: cFailed
				});
			}

			function cSuccess(data) {

				if (data.Message === "valid Bin") {
					oRef.onNextPress();
					// oRef.aData.push({
					// 	BinNumber: data.BinNumber
					// });

					// var oModel = new sap.ui.model.json.JSONModel();

					// oModel.setData({
					// 	HUSet: oRef.aData
					// });
					// oRef.getOwnerComponent().setModel(oModel, "oListHU");

					// this.getView().byId("id1").setValue("");

				} else if (tempVar === "") {
					MessageBox.error("Please Enter Valid Bin Number");
				} else {
					MessageBox.error("Invalid Bin");
					oRef.getView().byId("id1").setValue("");
				}

			}

			function cFailed() {
				MessageBox.error("Bin Number Scan failed");

			}

		},

		handleBatchNumber: function (oEvent) {
			var that = this;

			if (sap.ui.getCore().batchReq === "NO") {
				that.handleBinNumber();
			} else {
				// this. flag = true;
				var tempVar = this.getView().byId("id8").getValue();
				// this.getView().byId("id1").setValue(tempVar);
				// ScannedBatchNo?BatchNo='0000000010'
				this.odataService.read("/ScannedBatchNo?BatchNo='" + tempVar + "'", {
					success: cSuccess,
					failed: cFailed
				});

				function cSuccess(data, response) {
					if (tempVar === "") {
						MessageBox.error("Please Enter Valid Batch Number");
						// 	sap.m.MessageBox.alert("Please Enter Delivery Number", {
						// 		title: "Information",
						// 		onClose: null,
						// 		styleClass: "",
						// 		initialFocus: null,
						// 		textDirection: sap.ui.core.TextDirection.Inherit
						// });	
					} else {

						if (data.Message === "Invalid Batch No") {
							MessageBox.error("Please Enter Valid Batch Number");
							that.getView().byId("id8").setValue("");
							// this.flag = false;
							// return this.flag;
						} else {
							that.handleBinNumber();
							// MessageBox.alert(
							// 	"Please Enter Valid Delivery Number"
							// );
						}
					}
				}

				function cFailed() {
					MessageBox.error("Could Not Read Scanned Batch Number");
				}
			}

		},

		onPressBack: function () {
			var sHistory = History.getInstance();
			var sPreviousHash = sHistory.getPreviousHash();
			if (sPreviousHash != undefined) {
				window.history.go(-1);
			} else {
				var sRouter = sap.ui.core.UIComponent.getRouterFor(this);
				sRouter.navTo("Home", true);
			}
			this.getView().byId("id1").setValue("");
			var batchEnabled = this.getView().byId("id8");
			batchEnabled.setEnabled(true);
			var batLabel = this.getView().byId("idBatch");
			batLabel.setDisplayOnly(false);
			batLabel.setRequired(true);

		},
		onAvailableBinPress: function () {
			//  var that = this;
			// var data = that.getView().byId("id1").getText();
			// 	// var HUSelected = oEvent.getSource().getTitle();
			// var oRouter = this.getOwnerComponent().getRouter();
			// oRouter.navTo("AvailableBins", {
			// 	HUSelect: data
			// });

			var that = this;
			var data = that.getView().byId("id2").getValue();

			// aData = this.getView().byId("idtable").getModel("oTableModelAlias").getData();

			// var tempobj = that.getView().byId("id1").getData();
			// var tempobj = oEvent.getParameters().query;
			//var tempobj = that.selectedHU;
			// /sap/opu/odata/sap/ZWM_GW_RFSCREENS_SRV/RMPickAvailableBinsSet?$filter=Material eq '000000003000000724'
			var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
			oRouter.navTo("DeliveryAvailableBin", {});
			this.odataService.read("/RMPickAvailableBinsSet?$filter=Material eq '" + data + "'", null, null, false, function (response) {
				// console.log(response);
				that.result.items.push(response);
				that.getView().getModel("oDelAvailableBin").setData(response);
				that.getView().getModel("oDelAvailableBin").refresh(true);

			});
		},
		onNextPress: function () {

			var aData = this.getOwnerComponent().getModel("oListHU").getData();
			this.aData = [];
			this.getView().getModel("oListHU").setData(this.aData);
			this.getView().getModel("oListHU").refresh(true);

			// window.location.reload(true);

			// var materialSelected = oEvent.getParameter("listItem").getProperty("title");
			this.getOwnerComponent().getModel("oListHU").setData({});
			var matNum = this.getView().byId("id2").getValue();
			var matDesc = this.getView().byId("id10").getValue();
			matDesc = encodeURIComponent(matDesc);
			// var matDesc = this.getView().byId("id2").getDescription();
			var quantity = this.getView().byId("id3").getValue();
			var binNum = this.getView().byId("id1").getValue();
			// var deliveryNum = this.getView().byId("id9").getText();
			var deliveryNum = sap.ui.getCore().deliveryNum;
			// sap.ui.getCore().batchNum = this.getView().byId("id8").getValue();
			var scannedQty = this.getView().byId("id4").getValue();

			this.getView().byId("id1").setValue("");
			// this.getView().byId("id8").setValue("");
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.navTo("ScanQuantityView", {
				MaterialDescription: matDesc,
				MaterialNumber: matNum,
				Quantity: quantity,
				BinNumber: binNum,
				DeliveryNo: deliveryNum,
				ScannedQuantity: scannedQty
			});

		}

	});

});