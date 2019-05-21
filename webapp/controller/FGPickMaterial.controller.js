sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/m/MessageBox"
], function (Controller, History, MessageBox) {
	"use strict";

	return Controller.extend("com.axium.Axium.controller.FGPickMaterial", {
		onInit: function () {
			this.result = {};
			this.result.items = [];
			this.odataService = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZWM_GW_RFSCREENS_SRV/", true);

			var oRef = this;
			sap.ui.getCore().countHU = 0;
			// sap.ui.getCore().batchScanRadioBtn.setSelected(true);
			// sap.ui.getCore().dontScanBatchRadioBtn.setSelected(false);
			// sap.ui.getCore().clearBatchNumber.setValue("");
			// sap.ui.getCore().clearBatchNumber.setEnabled(true);

			// this.odataService.read("/DoorNoSet", null, null, false, function (response) {
			// 	if (oRef.getView().byId("doorid") !== undefined) {
			// 		oRef.getView().byId("doorid").destroyItems();
			// 	}
			// 	for (var i = 0; i < response.results.length; i++) {
			// 		oRef.getView().byId("doorid").addItem(
			// 			new sap.ui.core.ListItem({
			// 				// text: response.results[i].Material,
			// 				// key: response.results[i].Material,
			// 				// additionalText: response.results[i].MaterialDesc

			// 				text: response.results[i].DoorNumber,
			// 				key: response.results[i].DoorNumber,
			// 				additionalText: response.results[i].DoorDesc

			// 			}));
			// 	}
			// });

			this.getView().getModel("oDeliveryNo");
			// this.getView().byId("FGPickMaterials");
			this.getView().setModel("oDeliveryNo");
			this.getView().addEventDelegate({
				onBeforeShow: jQuery.proxy(function (evt) {
					this.onBeforeShow(evt);
				}, this)
			});

			// var value = tempDoorNum.setValue("");

			// var oRouter = this.getOwnerComponent().getRouter();
			// oRouter.getRoute("FGPickMaterial").attachPatternMatched(this._onObjectMatched, this);
			// var aData = oRef.getView().getModel("oDeliveryNo");
			// var aData = this.getOwnerComponent().getModel("oDeliveryNo");
			// debugger;
			// console.log(aData);
			// var data = {};
			// data.DeliveryNo = "";
			// data.MaterialNumber = "";
			// data.Quantity = 0;
			// data.MaterialDescription = "";
			// data.ScannedQty = 0;
			// aData.setData({		
			// 	DeliveryNoItemsSet:data
			// });
			sap.ui.getCore().myBatchFlag = "";
			sap.ui.getCore().listFlag = "false";
			sap.ui.getCore().doorFlag = this.getView().byId("doorid");
			sap.ui.getCore().doorFlag.setEnabled(false);
			var oTableData = oRef.getOwnerComponent().getModel("oDeliveryNo").getData();
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
			// var doorEnable = oRef.getView().byId("doorid");
			// doorEnable.setEnabled(false);
		},

		onBeforeShow: function (oEvent) {
			var oRef = this;
			setTimeout(function () {
				var oInput = oRef.getView().byId("doorid");
				oInput.focus();
			}, 1000);
			var doorEnable = oRef.getView().byId("doorid");
			// doorEnable.setEnabled(false);
			var oTable = oRef.getView().byId("FGPickMaterials");
			oTable.setMode("SingleSelectMaster");
			oTable.removeSelections("true");
			var oTableData = this.getView().getModel("oDeliveryNo").getData();
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
			// if (sap.ui.getCore().scanSumFlag === sap.ui.getCore().reqSumFlag) {
			// 	sap.ui.getCore().doorFlag.setEnabled(true);
			// } else {
			// 	sap.ui.getCore().doorFlag.setEnabled(false);
			// }
			if (sap.ui.getCore().doorFlag.getEnabled() === true || sap.ui.getCore().scanSumFlag === sap.ui.getCore().reqSumFlag) {
				sap.ui.getCore().doorFlag.setEnabled(true);
			} else {
				sap.ui.getCore().doorFlag.setEnabled(false);
			}
			// var oTableData = this.getView().getModel("oDeliveryNo").getData();
			// $.each(oTableData, function (index, item) {

			// 	var i;
			// 	for (i = 0; i < item.length; i++) {
			// 		// var temp = {};
			// 		// temp.Quantity = item[i].Quantity;
			// 		if (item[i].ScannedQuantity === "0.000") {

			// 			doorEnable.setEnabled(false);
			// 		}

			// 	}
			// });

		},

		// _onObjectMatched: function(oEvent) {
		// 	var oRef = this;
		// 	var deliveryNo = oEvent.getParameter("arguments").DeliveryNo;
		// 	var FGPickMaterial = [];
		// 	this.odataService = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZWM_GW_RFSCREENS_SRV/", true);
		// 	this.odataService.read("/DeliveryNoItemsSet?$filter=DeliveryNo eq'" + deliveryNo + "'", {
		// 		success: cSuccess,
		// 		failed: cFailed
		// 	});

		// 	function cSuccess(data) {
		// 		// for (var i = 0; i < data.results.length; i++) {
		// 		// 	FGPickMaterial.push({
		// 		// 		DeliveryNo: data.results[i].DeliveryNo,
		// 		// 		MaterialNumber: data.results[i].MaterialNumber,
		// 		// 		Quantity: data.results[i].Quantity,
		// 		// 		MaterialDescription: data.results[i].MaterialDescription,
		// 		// 		// ScannedQty:0
		// 		// 	});
		// 		// }

		// 		// var oModel = new sap.ui.model.json.JSONModel();
		// 		// oModel.setData({
		// 		// 	DeliveryNoItemsSet: FGPickMaterial
		// 		// });

		// 		var aData = oRef.getView().getModel("oDeliveryNo");
		// 		aData.setData({
		// 			DeliveryNoItemsSet: data.results
		// 		});

		// 		oRef.getView().getModel("oDeliveryNo").refresh(true);

		// 		// oRef.getOwnerComponent().setModel(oModel, "FGPickMaterials");
		// 	}

		// 	function cFailed() {
		// 		MessageBox.error("Could Not Read DeliveryNoSet");
		// 	}
		// },

		onPressBack: function () {
			this.getView().byId("doorid").setValue("");
			var oRef = this;
			var rtn = false;

			if (sap.ui.getCore().myflag === true) {
				MessageBox.show("Data not submitted, would you like to submit?", {
					icon: MessageBox.Icon.QUESTION,
					title: "Delivery Confirmation",
					actions: [MessageBox.Action.YES, MessageBox.Action.NO],
					onClose: function (oAction) {
						if (oAction === sap.m.MessageBox.Action.YES) {
							rtn = true;
							return rtn;
						} else {
							sap.ui.getCore().doorFlag.setEnabled(false);
							sap.ui.getCore().listFlag = true;
							var oDelNum = sap.ui.getCore().delNum;
							this.odataService.remove("/DeleteFGPickDeliverySet(DeliveryNo='" + oDelNum + "')", null, null, false, function (
								odata,
								response) {
								// console.log(response);
							});

							var sHistory = History.getInstance();
							var sPreviousHash = sHistory.getPreviousHash();
							if (sPreviousHash !== undefined) {
								window.history.go(-1);
							} else {
								var sRouter = sap.ui.core.UIComponent.getRouterFor(this);
								sRouter.navTo("ScanDelNo", true);
							}
						}
					}.bind(oRef),
					styleClass: "",
					initialFocus: null,
					textDirection: sap.ui.core.TextDirection.Inherit
				});
			} else {
				sap.ui.getCore().doorFlag.setEnabled(false);
				sap.ui.getCore().listFlag = true;
				var sHistory = History.getInstance();
				var sPreviousHash = sHistory.getPreviousHash();
				if (sPreviousHash !== undefined) {
					window.history.go(-1);
				} else {
					var sRouter = sap.ui.core.UIComponent.getRouterFor(this);
					sRouter.navTo("ScanDelNo", true);
				}
			}

		},

		onSelectMaterial: function (oEvent) {
			var oTableData = this.getView().getModel("oDeliveryNo").getData();
			sap.ui.getCore().reqSumFlag = 0;
			sap.ui.getCore().scanSumFlag = 0;
			var materialSelectAgain = false;
			var selecteditem = oEvent.getSource().getSelectedItem();
			var bpath = selecteditem.getBindingContextPath();
			var Mindex = bpath.split('/')[2];
			sap.ui.selectedIndex = parseFloat(Mindex);
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
				materialSelectAgain = true;
				MessageBox.information("Material/s already picked", {
					title: "Information",
				});
				return materialSelectAgain;
			} else {
				this.getView().getModel("oDeliveryNo").getData();
				var sdata = this.getView().getModel("oDeliveryNo").getData();
				for (var i = 0; i < sdata.results.length; i++) {
					var matdesc = sdata.results[i].MaterialNumber;
					if (matdesc.startsWith("Pallets") || matdesc.startsWith("PALLETS") || matdesc.startsWith("Pallets")) {
						sap.ui.palIndex = i;
					} else {
						sap.ui.palIndex = sap.ui.selectedIndex;
					}
				}

				var oModel = this.getView().getModel("oDeliveryNo").getData();

				sap.ui.getCore().batchReq = oModel.results[sap.ui.selectedIndex].Indicator;
				sap.ui.getCore().alreadyScannedPallet = oModel.results[sap.ui.selectedIndex].ScannedQuantity;
				sap.ui.getCore().requiredPallet = oModel.results[sap.ui.palIndex].Quantity;
				sap.ui.getCore().scannedPallet = oModel.results[sap.ui.palIndex].ScannedQuantity;
				sap.ui.getCore().ZscannedPallet = oModel.results[sap.ui.palIndex].ScannedQuantity;
				// sap.ui.getCore().matScannedPallet = oModel.results[sap.ui.selectedIndex].ScannedQuantity;

				var oListItem = oEvent.getParameter("listItem") || oEvent.getSource();
				var materialSelected = oListItem.getAggregation("cells")[1].getProperty("text");
				var materialDesc = oListItem.getAggregation("cells")[0].getProperty("text");
				materialDesc = encodeURIComponent(materialDesc);
				var quantity = oListItem.getAggregation("cells")[3].getProperty("text");
				var deliveryNum = oListItem.getAggregation("cells")[2].getProperty("text");
				sap.ui.getCore().deliveryNum = deliveryNum;
				// sap.ui.getCore().batchReq = oListItem.getAggregation("cells")[3].getProperty("text");
				var scannedQty = oListItem.getAggregation("cells")[4].getProperty("text");
				// var materialSelected = oEvent.getSource().getCells()[1].getText();
				// var quantity = oEvent.getSource().getCells()[2].getText();

				sap.ui.getCore().delNum = deliveryNum;

				var oRef = this;
				var aData = oRef.getView().getModel("oScannedQtySelect");
				var data = {};
				data.myMatNo = materialSelected;
				data.myMatDesc = materialDesc;
				data.myDelNum = deliveryNum;
				data.myQuantity = quantity;
				data.myScannedQty = scannedQty;
				aData.setData(data);
				oRef.getView().getModel("oScannedQtySelect").refresh(true);

				// var sData = oRef.getView().getModel("oBinScanModel");
				// var sdata = {};
				// sData.setData(sdata);
				// sdata.binNum = "Bin";
				// sdata.ScannedQt = "123";
				// sData.setData(sdata);
				// // oRef.getView().getModel("oBinScanModel").refresh(true);
				// var oMyModel = oRef.getView().getModel("oScanQTModel");

				// oMyModel.setData({
				// 	ScannedSet: sdata
				// });

				// oRef.getView().getModel("oMyModel").refresh(true);

				var navFlag = true;
				var matNum = materialSelected;
				var matDesc = materialDesc;
				var quantity = quantity;
				var deliveryNum = deliveryNum;
				var scannedQty = scannedQty;

				if (materialSelected.startsWith("Pallets") || materialSelected.startsWith("PALLETS") || materialSelected.startsWith("Pallets")) {
					navFlag = false;
					MessageBox.information("PALLETS cannot be scanned", {
						title: "Information",
					});
					return navFlag;
				} else {

					var oRouter = this.getOwnerComponent().getRouter();
					oRouter.navTo("ScanQuantityView", {
						MaterialDescription: matDesc,
						MaterialNumber: matNum,
						Quantity: quantity,
						DeliveryNo: deliveryNum,
						ScannedQuantity: scannedQty
					});
				}
			}

		},

		doorValidation: function (oEvent) {
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
								oRef.onFullSubmit();
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
				// setTimeout(function () {
				// 	MessageBox.error("Please Scan Valid Door Number");
				// 	oRef.getView().byId("doorid").setValue("");
				// }, 1500);
				dFlag = false;
				return dFlag;
			}

		},

		onFullSubmit: function (oEvent) {
			var oRef = this;
			var tempDoorNum = this.getView().byId("doorid");
			var value = tempDoorNum.getValue();
			var oTableData = this.getView().getModel("oDeliveryNo").getData();
			sap.ui.getCore().reqSumFlag = 0;
			sap.ui.getCore().scanSumFlag = 0;
			var sumNotSatified = false;
			var doorFlag = true;

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

			// var oTableData = this.getView().getModel("oDeliveryNo").getData();
			var data = {};
			data.NavDeliHeadDeliItesms = [];
			data.DoorNumber = this.getView().byId("doorid").getValue();
			data.Rmqty = sap.ui.getCore().countHU.toLocaleString();
			data.Indicator = sap.ui.getCore().myBatchFlag;
			data.MulBinsInd = sap.ui.getCore().myBinFlag;

			$.each(oTableData, function (index, item) {

				var i;
				// var temp = {};
				// var arr = [];
				// var tempi;
				// var tempr;
				// var sumqty = 0;
				// var sumscanqty = 0;
				// temp = item;
				for (i = 0; i < 1; i++) {
					// tempi = item[i].Scanned;
					// var qty = parseFloat(item[i].Quantity);
					// var scanqty = parseFloat(item[i].ScannedQuantity);
					// sumqty = sumqty + qty;
					// sumscanqty = sumscanqty + scanqty;
					data.DeliveryNo = item[i].DeliveryNo;
				}
			});

			$.each(oTableData, function (index, item) {

				var i;
				for (i = 0; i < item.length; i++) {
					var temp = {};
					temp.Quantity = item[i].Quantity;
					temp.ScannedQuantity = item[i].ScannedQuantity.toLocaleString();
					data.NavDeliHeadDeliItesms.push(temp);
				}
			});

			if (sap.ui.getCore().scanSumFlag < sap.ui.getCore().reqSumFlag) {

				MessageBox.show("Scanned pallet/s are not equal to required pallet/s. Do you want to continue for partial shipment ?", {
					icon: MessageBox.Icon.QUESTION,
					title: "Delivery Confirmation",
					actions: [MessageBox.Action.YES, MessageBox.Action.NO],
					onClose: function (oAction) {
						if (oAction === sap.m.MessageBox.Action.YES) {
							oRef.sendData();
						} else {
							oRef.getView().byId("doorid").setValue("");
							oRef.removeDataFromTable();
						}
					}

				});

			} else {
				MessageBox.show("Complete Delivery ?", {
					icon: MessageBox.Icon.QUESTION,
					title: "Delivery Confirmation",
					actions: [MessageBox.Action.YES, MessageBox.Action.NO],
					onClose: function (oAction) {
						if (oAction === sap.m.MessageBox.Action.YES) {
							oRef.sendData();
						} else {
							doorFlag = true;
							return doorFlag;
						}
					}
				});

			}

			// sap.ui.core.BusyIndicator.hide();

		},
		removeDataFromTable: function () {
			var oDelNum = sap.ui.getCore().delNum;
			this.odataService.remove("/DeleteFGPickDeliverySet(DeliveryNo='" + oDelNum + "')", null, null, false, function (
				odata,
				response) {
				console.log(response);
			});
		},
		sendData: function () {
			// if (sap.ui.getCore().batchGetSelected === true) {
			// 	sap.ui.getCore().myBatchFlag = "X";
			// } else {
			// 	sap.ui.getCore().myBatchFlag = "";
			// }
			// sap.ui.getCore().batchScanRadioBtn.setSelected(false);

			// sap.ui.getCore().clearBatchNumber.setEnabled(false);
			var oRef = this;
			var tempDoorNum = this.getView().byId("doorid");
			var value = tempDoorNum.getValue();
			var oTableData = this.getView().getModel("oDeliveryNo").getData();
			sap.ui.getCore().reqSumFlag = 0;
			sap.ui.getCore().scanSumFlag = 0;
			var sumNotSatified = false;
			var doorFlag = true;

			var data = {};
			data.NavDeliHeadDeliItesms = [];
			data.DoorNumber = this.getView().byId("doorid").getValue();
			data.Rmqty = sap.ui.getCore().countHU.toLocaleString();
			data.Indicator = sap.ui.getCore().myBatchFlag;
			data.MulBinsInd = sap.ui.getCore().myBinFlag;

			$.each(oTableData, function (index, item) {

				var i;
				// var temp = {};
				// var arr = [];
				// var tempi;
				// var tempr;
				// var sumqty = 0;
				// var sumscanqty = 0;
				// temp = item;
				for (i = 0; i < 1; i++) {
					// tempi = item[i].Scanned;
					// var qty = parseFloat(item[i].Quantity);
					// var scanqty = parseFloat(item[i].ScannedQuantity);
					// sumqty = sumqty + qty;
					// sumscanqty = sumscanqty + scanqty;
					data.DeliveryNo = item[i].DeliveryNo;
				}
			});

			$.each(oTableData, function (index, item) {

				var i;
				for (i = 0; i < item.length; i++) {
					var temp = {};
					temp.Quantity = item[i].Quantity;
					temp.ScannedQuantity = item[i].ScannedQuantity.toLocaleString();
					data.NavDeliHeadDeliItesms.push(temp);
				}
			});

			this.odataService.create("/DeliveryHeaderSet", data, null, function (odata, response) {
					// console.log(response);
					var success = JSON.parse(response.body);
					var length = success.d.NavDeliHeadDeliItesms.results.length;
					length = length - 1;
					var message = success.d.NavDeliHeadDeliItesms.results[length].MaterialDescription;
					// '" + message + "' For Delivery '" + sap.ui.getCore().delNum + "'
					MessageBox.success("Delivery Completed", {
						title: "Success",
						Action: "OK",
						onClose: function (oAction) {
							if (oAction === sap.m.MessageBox.Action.OK) {
								oRef.getView().byId("doorid").setValue("");
								sap.ui.getCore().doorFlag.setEnabled(false);
								var sRouter = sap.ui.core.UIComponent.getRouterFor(oRef);
								sRouter.navTo("ScanDelNo", true);
							}
						}.bind(oRef),
						styleClass: "",
						initialFocus: null,
						textDirection: sap.ui.core.TextDirection.Inherit
					});
					sap.ui.getCore().listFlag = true;
					sap.ui.getCore().dontScanBatchRadioBtn.setSelected(true);
					sap.ui.getCore().clearBatchNumber.setValue("");
					// sap.ui.getCore().myflag = false;
				},
				function (odata, response) {
					console.log(response);
					// var errorResponse = JSON.parse(odata.response.body);
					var errorResponse = JSON.parse(odata.response.body);
					var errorDetailsRFC = errorResponse.error.message.value;
					// var error1 = errorResponse.error.innererror.errordetails[0].message;
					var error1 = errorResponse.error.innererror.errordetails;
					$.each(error1, function (index, item) {
						if (index != error1.length - 1) {
							error1 = item.message;
						}

					});
					// var errorDetails = errorResponse.error.innererror.errordetails;
					// var errorString = "";

					// // var errorString = "Data could not be submitted";
					// $.each(errorDetails, function (index, item) {
					// 	if (index !== errorDetails.length - 1) {
					// 		errorString = errorString + item.code + " " + item.message + "\n";
					// 	}
					// });
					// errorDetails
					if (errorDetailsRFC.startsWith("RFC")) {
						errorDetailsRFC = "All the HU 's are now scanned. Contact CSR for further postings";
						MessageBox.error(errorDetailsRFC, {
							title: "Error",
							Action: "Close",
							onClose: function (oAction) {
								if (oAction === "CLOSE") {
									var sHistory = History.getInstance();
									var sPreviousHash = sHistory.getPreviousHash();
									if (sPreviousHash !== undefined) {
										sap.ui.getCore().doorFlag.setEnabled(false);
										sap.ui.getCore().listFlag = true;
										window.history.go(-1);
									} else {
										sap.ui.getCore().doorFlag.setEnabled(false);
										sap.ui.getCore().listFlag = true;
										var sRouter = sap.ui.core.UIComponent.getRouterFor(this);
										sRouter.navTo("ScanDelNo", true);
									}
								}
							},
							styleClass: "",
							initialFocus: null,
							textDirection: sap.ui.core.TextDirection.Inherit
						});

					} else {
						// sap.ui.getCore().doorFlag.setEnabled(false);
						MessageBox.error(error1, {
							title: "Error",
							onClose: null,
							styleClass: "",
							initialFocus: null,
							textDirection: sap.ui.core.TextDirection.Inherit
						});
					}

				});
			this.getView().byId("doorid").setValue("");
		}

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.axium.Axium.view.FGPickMaterial
		 */
		//	onInit: function() {
		//
		//	},

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf com.axium.Axium.view.FGPickMaterial
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf com.axium.Axium.view.FGPickMaterial
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf com.axium.Axium.view.FGPickMaterial
		 */
		//	onExit: function() {
		//
		//	}
	});

});