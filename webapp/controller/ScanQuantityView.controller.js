sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/m/MessageBox"
], function (Controller, History, MessageBox) {
	"use strict";

	return Controller.extend("com.axium.Axium.controller.ScanQuantityView", {
		onInit: function () {
			this.odataService = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZWM_GW_RFSCREENS_SRV/", true);
			this.oList = this.getView().byId("idList");
			this.result = {};
			this.aData = [];
			this.result.items = [];
			this.getView().addEventDelegate({
				onBeforeShow: jQuery.proxy(function (evt) {
					this.onBeforeShow(evt);
				}, this)
			});
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("ScanQuantityView").attachPatternMatched(this._onObjectMatched, this);
			// this.getView().byId("id4").setValue("0.000");
			// this.getView().byId("id4").setValue(0);
			this.flag = false;
			sap.ui.getCore().myBatchFlag = "";
			// sap.ui.getCore().myflag = false;
			sap.ui.getCore().countHU = 0;
			sap.ui.getCore().listFlag = "";
			sap.ui.getCore().palScannedQuantity = sap.ui.getCore().alreadyScannedPallet;
		},

		onBeforeRendering: function () {
			var oModel = this.getOwnerComponent().getModel("oListHU");
			oModel.setData({});
			oModel.refresh(true);

			var dummyData = this.getOwnerComponent().getModel("batchQty");
			this.dummyData = [];
			this.getOwnerComponent().getModel("batchQty").setData(this.dummyData);
			this.getOwnerComponent().getModel("oListHU").refresh(true);
		},

		_onObjectMatched: function (oEvent) {
			// sap.ui.getCore().myflag = false;
			var oRef = this;
			if (sap.ui.getCore().listFlag === true) {
				var aData = oRef.getView().getModel("oListHU").getData();
				oRef.aData = [];
				oRef.getView().getModel("oListHU").setData(oRef.aData);
				oRef.getView().getModel("oListHU").refresh(true);
				this.getView().byId("idList").destroyItems();
			}

			if (sap.ui.getCore().itemCategory === "KEN") {
				oRef.getView().byId("idBin").setValue("IM Consignment Stock");
				oRef.getView().byId("idBin").setEnabled(false);
			} else {
				oRef.getView().byId("idBin").setValue("");
				oRef.getView().byId("idBin").setEnabled(true);
			}

			// var oList = this.getView().byId("idList");
			// oList.getBinding("items").refresh(true);
			// oRef.getView().byId("idBin").setData("");
			var myMatJson = new sap.ui.model.json.JSONModel();
			var data = {};
			data.myMatNo = oEvent.getParameter("arguments").MaterialNumber;

			var matdesc = oEvent.getParameter("arguments").MaterialDescription;
			matdesc = decodeURIComponent(matdesc);
			data.myMatDesc = matdesc;
			data.myQuantity = oEvent.getParameter("arguments").Quantity;
			// data.myBinNum = oEvent.getParameter("arguments").BinNumber;
			data.myDeliveryNum = oEvent.getParameter("arguments").DeliveryNo;
			// data.myBatchNum = oEvent.getParameter("arguments").BatchNo;
			data.myScannedQty = oEvent.getParameter("arguments").ScannedQuantity;
			// data.myBatchNum = oEvent.getParameter("arguments").BinNumber
			// myMatJson.setData(data);
			// data.myScannedQty = "0.000";
			myMatJson.setData(data);
			this.getView().setModel(myMatJson, "oMatSelect");
		}, // _onObjectMatched : function (oEvent){
		// 	//comment
		// },

		// onAfterRendering: function () {
		// 	var oRef = this;
		// 	setTimeout(function () {
		// 		var oInput = oRef.getView().byId("id1");
		// 		oInput.focus();
		// 	}, 1000);
		// },

		onBeforeShow: function (oEvent) {
			sap.ui.getCore().countHU = 0;
			var oRef = this;
			setTimeout(function () {
				var oInput = oRef.getView().byId("idBin");
				oInput.focus();
			}, 1000);
			var batchNum = sap.ui.getCore().batchNum;
			if (batchNum === "") {
				oRef.getView().byId("batNum").setdisplayOnly(true);
			}
			// oRef.getView().byId("id8").setText(batchNum);
		},
		onClearBin: function (oEvent) {
			var oRef = this;
			oRef.getView().byId("idBin").setValue("");
			oRef.getView().byId("id1").setValue("");
			setTimeout(function () {
				var oInput = oRef.getView().byId("idBin");
				oInput.focus();
			}, 1000);
		},
		getWareHouseNum: function (oEvent) {
			var Fgwarehouseno = this.getView().byId("warehouseWarehouseScreenId").getSelectedItem().getText();
		},
		handleBinNumber: function (oEvent) {
			var oRef = this;
			var binFlag = false;

			var tempVar = oRef.getView().byId("idBin").getValue();
			oRef.getView().byId("idBin").setValue(tempVar);
			var aData = oRef.getView().getModel("oListHU");
			oRef.getView().getModel("oListHU").refresh(true);

			// if ((tempVar.length >= 5) || (tempVar.length >= 6) || (tempVar.length >= 7) || (tempVar.length >=
			// 		8) || (tempVar.length >= 9) || (tempVar.length >= 10)) {
			// if (tempVar.length <= 10) {
			setTimeout(function () {

				if (aData != undefined) {
					// var aData = oRef.getOwnerComponent().getModel("oListHU").getData();
					var extFlag = true;

					$.each(aData.HUSet, function (index, item) {

						if (item.BinNumber === tempVar) {
							extFlag = false;
							oRef.getView().byId("idBin").setValue("");
							sap.m.MessageBox.alert("Bin Number is already scanned", {
								title: "Information"
							});
						}
					});
					// this.getView().byId("id1").setValue("");
				}
				if (extFlag) {

					oRef.odataService.read("/ScannedBinNumber?BinNumber='" + tempVar + "'", {

						success: cSuccess,
						failed: cFailed
					});
				}

				function cSuccess(data) {

					if (data.Message === "valid Bin") {
						oRef.validateBin();
						setTimeout(function () {
							var oInput = oRef.getView().byId("id1");
							oInput.focus();
						}, 1000);

					} else if (tempVar === "") {
						MessageBox.error("Please Scan Valid Bin Number");
					} else {
						MessageBox.error("Invalid Bin");
						oRef.getView().byId("idBin").setValue("");
					}

				}

				function cFailed() {
					MessageBox.error("Bin Number Scan failed");

				}
			}, 1000);

			// } else {
			// 	// setTimeout(function () {
			// 	// 	MessageBox.error("Please Scan Valid Bin Number");
			// 	// 	oRef.getView().byId("idBin").setValue("");
			// 	// }, 1500);
			// 	binFlag = true;
			// 	return binFlag;
			// }

		},
		onPressAvailableBins: function (oEvent) {
			var that = this;
			var data = that.getView().byId("id2").getValue();

			// aData = this.getView().byId("idtable").getModel("oTableModelAlias").getData();

			// var tempobj = that.getView().byId("id1").getData();
			// var tempobj = oEvent.getParameters().query;
			//var tempobj = that.selectedHU;
			// /sap/opu/odata/sap/ZWM_GW_RFSCREENS_SRV/RMPickAvailableBinsSet?$filter=Material eq '000000003000000724'
			// var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
			// oRouter.navTo("DeliveryAvailableBin", {});
			this.odataService.read("/RMPickAvailableBinsSet?$filter=Material eq '" + data + "'", null, null, false, function (response) {
				// console.log(response);
				that.result.items.push(response);
				that.getView().getModel("oDelAvailableBin").setData(response);
				that.getView().getModel("oDelAvailableBin").refresh(true);
			});
			var response = that.getView().getModel("oDelAvailableBin").getData();
			this.dialog = sap.ui.xmlfragment("com.axium.Axium.view.DeliveryAvailableBins", this);
			this.getView().addDependent(this.dialog);
			// var oDeliveryAvailableBins = new sap.ui.model.json.JSONModel();
			// oDeliveryAvailableBins.setData({
			// 	root: response
			// });
			this.dialog.setModel("oDelAvailableBin");
			this.dialog.open();
		},
		handleBinSearch: function (oEvent) {
			setTimeout(function () {
				var sValue = oEvent.getParameter("value");
				var oFilter = [new sap.ui.model.Filter("StorageBin", sap.ui.model.FilterOperator.Contains, sValue), new sap.ui.model.Filter(
					"BatchNo", sap.ui.model.FilterOperator.Contains, sValue), new sap.ui.model.Filter(
					"Pallets", sap.ui.model.FilterOperator.Contains, sValue)];

				var ofilter = new sap.ui.model.Filter({
					aFilters: oFilter,
					bOr: true
				});
				var oBinding = oEvent.getSource().getBinding("items");
				oBinding.filter([ofilter]);
			}, 1000);

		},
		validateBin: function (oEvent) {
			var oRef = this;
			sap.ui.getCore().valBin = false;
			var data = this.getView().byId("id2").getValue();
			var bin = oRef.getView().byId("idBin").getValue();
			this.odataService.read("/RMPickAvailableBinsSet?$filter=Material eq '" + data + "'", null, null, false, function (response) {
				// console.log(response);
				oRef.result.items.push(response);
				oRef.getView().getModel("oDelAvailableBin").setData(response);
				var test = oRef.getView().getModel("oDelAvailableBin").getData();
				for (var t = 0; t < test.results.length; t++) {
					if (bin === test.results[t].StorageBin) {
						sap.ui.getCore().valBin = true;
						return sap.ui.getCore().valBin;
					}
				}
				if (sap.ui.getCore().valBin === false) {
					MessageBox.error("Please select bins from availble bins only");
					oRef.getView().byId("idBin").setValue("");
				}

			});
		},
		batchNotEnabled: function (oEvent) {
			var oRef = this;
			var batchEnabled = oRef.getView().byId("id8");
			batchEnabled.setEnabled(false);
			batchEnabled.setValue("");
			oRef.getView().byId("id4").setValue(sap.ui.getCore().alreadyScannedPallet);
			sap.ui.getCore().scannedPallet = sap.ui.getCore().ZscannedPallet;
			var aData = oRef.getView().getModel("oListHU").getData();
			oRef.aData = [];
			oRef.getView().getModel("oListHU").setData(oRef.aData);
			oRef.getView().getModel("oListHU").refresh(true);

		},
		batchEnabled: function (oEvent) {
			var oRef = this;
			var batchEnabled = oRef.getView().byId("id8");
			batchEnabled.setEnabled(true);
			batchEnabled.setValue("");
			oRef.getView().byId("id4").setValue(sap.ui.getCore().alreadyScannedPallet);
			sap.ui.getCore().scannedPallet = sap.ui.getCore().ZscannedPallet;
			var aData = oRef.getView().getModel("oListHU").getData();
			oRef.aData = [];
			oRef.getView().getModel("oListHU").setData(oRef.aData);
			oRef.getView().getModel("oListHU").refresh(true);
			setTimeout(function () {
				var oInput = oRef.getView().byId("id8");
				oInput.focus();
			}, 1000);
		},

		handleBatchNumber: function (oEvent) {
			var oRef = this;

			// if (sap.ui.getCore().batchReq === "NO") {
			// 	that.handleBinNumber();
			// }
			// else {
			// this. flag = true;
			var bFlag = false;
			var oZFlag = false;
			var tempVar = this.getView().byId("id8").getValue();
			if (tempVar.length >= 5) {
				setTimeout(function () {
					oRef.odataService.read("/ScannedBatchNo?BatchNo='" + tempVar + "'", {
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
								oRef.getView().byId("id8").setValue("");
								// this.flag = false;
								// return this.flag;
							} else {
								// var oRef = this;
								var binData = oRef.getView().getModel("oDelAvailableBin").getData();
								for (var i = 0; i < binData.results.length; i++) {
									if (tempVar === binData.results[i].BatchNo) {
										oZFlag = true;
										i = i + binData.results.length;
									} else {
										oZFlag = false;
									}
								}
								if (oZFlag === false) {
									MessageBox.error("Please Scan Batch Number From Available Bins Only");
									oRef.getView().byId("id8").setValue("");
								} else {
									setTimeout(function () {
										var oInput = oRef.getView().byId("id1");
										oInput.focus();
									}, 1000);
								}

								// that.handleBinNumber();
								// MessageBox.alert(
								// 	"Please Enter Valid Delivery Number"
								// );
							}
						}
					}

					function cFailed() {
						MessageBox.error("Could Not Read Scanned Batch Number");
					}
				}, 1000);
			} else {
				// setTimeout(function () {
				// 	MessageBox.error("Please Scan Valid Batch Number");
				// 	oRef.getView().byId("id8").setValue("");
				// }, 1500);
				bFlag = true;
				return bFlag;
			}
			// this.getView().byId("id1").setValue(tempVar);
			// ScannedBatchNo?BatchNo='0000000010'

			// }

		},

		handleSearch: function (oEvent) {
			var oRef = this;
			var hFlag = false;
			var rQuantity = oRef.getView().byId("id3").getValue();
			var sQuantity = oRef.getView().byId("id4").getValue();
			var oBinNumber = oRef.getView().byId("idBin").getValue();
			sQuantity = parseFloat(sQuantity);
			rQuantity = parseFloat(rQuantity);
			if (oBinNumber === "") {
				MessageBox.information("Please Scan Bin Number");
				oRef.getView().byId("id1").setValue("");
				setTimeout(function () {
					var oInput = oRef.getView().byId("idBin");
					oInput.focus();
				}, 1000);
			} else {
				if (sQuantity < rQuantity) {
					var oRadioBtn = oRef.getView().byId("idScanBatch");
					var batchValue = oRef.getView().byId("id8").getValue();
					var oSelected = oRadioBtn.getSelected();
					if (oSelected === true && batchValue === "") {
						oRef.getView().byId("id1").setValue("");
						MessageBox.error("Please Scan Batch Number");
						setTimeout(function () {
							var oInput = oRef.getView().byId("id8");
							oInput.focus();
						}, 1000);
					} else {
						var tempVar = oRef.getView().byId("id1").getValue();
						var materialNumber = oRef.getView().byId("id2").getValue();
						var bool = tempVar.startsWith("(");
						if (bool) {
							tempVar = tempVar.replace(/[^A-Z0-9]+/ig, "");
						} else {
							tempVar = tempVar;
						}
						var regExp = /^0[0-9].*$/;
						var test = regExp.test(tempVar);
						console.log(test);
						if (test || bool) {
							if (tempVar.length >= 20) {
								setTimeout(function () {
									tempVar = tempVar.replace(/[^A-Z0-9]+/ig, "");
									tempVar = tempVar.replace(/^0+/, '');
									oRef.getView().byId("id1").setValue(tempVar);
									var tempMat = oRef.getView().byId("id2");
									var aData = oRef.getView().getModel("oListHU");
									if (aData != undefined) {
										var aData = oRef.getOwnerComponent().getModel("oListHU").getData();
										var extFlag = true;

										$.each(aData.HUSet, function (index, item) {

											if (item.ExternalHU === tempVar) {
												extFlag = false;
												oRef.getView().byId("id1").setValue("");
												sap.m.MessageBox.alert("HU Number is already scanned", {
													title: "Information"
												});
											}
										});
										// this.getView().byId("id1").setValue("");
									}
									if (extFlag) {

										oRef.odataService.read("/ScannedHUMaterial?ExternalHU='" + tempVar + "'&Material='" + materialNumber + "'", {
											success: cSuccess,
											failed: cFailed
										});
									}

									function cSuccess(data) {

										if (data.Message === "Valid HU") {
											oRef.batchGet();
											// console.log(aData);
											// var emptyData = oRef.aData;
											// emptyData = [{}];
											// oRef.aData.push({
											// 	ExternalHU: data.ExternalHU
											// });

											// var oModel = new sap.ui.model.json.JSONModel();

											// oModel.setData({
											// 	HUSet: oRef.aData
											// });
											// oRef.getOwnerComponent().setModel(oModel, "oListHU");
											// oRef.onItemPress();
											// this.getView().byId("id1").setValue("");

										} else if (tempVar === "") {

										} else {
											MessageBox.error("Please scan a correct HU");
											oRef.getView().byId("id1").setValue("");
										}

									}

									function cFailed() {
										MessageBox.error("HU Number Scan Failed");
									}
								}, 1000);
							} else {
								// setTimeout(function () {
								// 	MessageBox.error("Please Scan Valid HU");
								// 	oRef.getView().byId("id1").setValue("");
								// }, 1500);
								hFlag = true;
								return hFlag;
							}
						} else {
							if (tempVar.length >= 18) {
								// tempVar = tempVar.replace(/^0+/, '');
								setTimeout(function () {
									tempVar = tempVar.replace(/[^A-Z0-9]+/ig, "");
									tempVar = tempVar.replace(/^0+/, '');
									oRef.getView().byId("id1").setValue(tempVar);
									var tempMat = oRef.getView().byId("id2");
									var aData = oRef.getView().getModel("oListHU");
									if (aData != undefined) {
										var aData = oRef.getOwnerComponent().getModel("oListHU").getData();
										var extFlag = true;

										$.each(aData.HUSet, function (index, item) {

											if (item.ExternalHU === tempVar) {
												extFlag = false;
												oRef.getView().byId("id1").setValue("");
												sap.m.MessageBox.alert("HU Number is already scanned", {
													title: "Information"
												});
											}
										});
										// this.getView().byId("id1").setValue("");
									}
									if (extFlag) {

										oRef.odataService.read("/ScannedHUMaterial?ExternalHU='" + tempVar + "'&Material='" + materialNumber + "'", {
											success: cSuccess,
											failed: cFailed
										});
									}

									function cSuccess(data) {

										if (data.Message === "Valid HU") {
											oRef.batchGet();
											// console.log(aData);
											// var emptyData = oRef.aData;
											// emptyData = [{}];
											// oRef.aData.push({
											// 	ExternalHU: data.ExternalHU
											// });

											// var oModel = new sap.ui.model.json.JSONModel();

											// oModel.setData({
											// 	HUSet: oRef.aData
											// });
											// oRef.getOwnerComponent().setModel(oModel, "oListHU");
											// oRef.onItemPress();
											// this.getView().byId("id1").setValue("");

										} else if (tempVar === "") {

										} else {
											MessageBox.error("Please scan a correct HU");
											oRef.getView().byId("id1").setValue("");
										}

									}

									function cFailed() {
										MessageBox.error("HU Number Scan Failed");
									}
								}, 1000);
							} else {
								// setTimeout(function () {
								// 	MessageBox.error("Please Scan Valid HU");
								// 	oRef.getView().byId("id1").setValue("");
								// }, 1500);
								hFlag = true;
								return hFlag;
							}
						}

					}
				} else {
					MessageBox.error("HU Picking Completed");
					oRef.getView().byId("id1").setValue("");
				}
			}

		},
		batchGet: function (oEvent) {
			var oRef = this;
			var tempVar = oRef.getView().byId("id1").getValue();
			oRef.getView().byId("id1").setValue(tempVar);
			var tempMat = oRef.getView().byId("id2").getValue();
			var obatcNo = oRef.getView().byId("id8").getValue();
			var oRadioBtn = oRef.getView().byId("idScanBatch");
			var oSelected = oRadioBtn.getSelected();
			var aData = oRef.getView().getModel("oListHU");
			var batchFlag = false;
			if (oSelected === true) {
				sap.ui.getCore().myBatchFlag = "X";
				this.odataService.read("/HUQtyDetailsSet?$filter=ExternalHU eq '" + tempVar + "' and Material eq '" + tempMat + "'", {
					// this.odataService.read("/HUQtyDetailsSet?$filter=ExternalHU eq '00000000002000057331' and Material eq '000000003000000724' and ScannedQnty eq '0' and RequirementQnty eq '41600.000' and BinNumber eq 'U_ZONE'", {
					success: cSuccess,
					failed: cFailed
				});

				function cSuccess(data) {
					if (obatcNo === data.results[0].BatchNo || obatcNo === data.results[0].BatchNo1) {
						oRef.aData.push({
							ExternalHU: data.results[0].HU,
							BatchNo: data.results[0].BatchNo,
							ScannedQnty: data.results[0].ScannedQnty
						});

						var oModel = new sap.ui.model.json.JSONModel();

						oModel.setData({
							HUSet: oRef.aData
						});
						oRef.getOwnerComponent().setModel(oModel, "oListHU");
						oRef.onItemPress();
					} else {
						MessageBox.information("Please Scan HU of Same Batch Number");
						// oRef.getView().byId("id8").setValue("");
						oRef.getView().byId("id1").setValue("");
						batchFlag = true;
						return batchFlag;

					}
				}

				function cFailed() {
					MessageBox.error("HU Scan Failed");

				}
			} else {
				this.odataService.read("/HUQtyDetailsSet?$filter=ExternalHU eq '" + tempVar + "' and Material eq '" + tempMat + "'", {
					// this.odataService.read("/HUQtyDetailsSet?$filter=ExternalHU eq '00000000002000057331' and Material eq '000000003000000724' and ScannedQnty eq '0' and RequirementQnty eq '41600.000' and BinNumber eq 'U_ZONE'", {
					success: cSuccess,
					failed: cFailed
				});

				function cSuccess(data) {
					oRef.binGet();

					// oRef.aData.push({
					// 	ExternalHU: data.results[0].ExternalHU,
					// 	BatchNo: data.results[0].BatchNo,
					// 	ScannedQnty: data.results[0].ScannedQnty
					// });

					// var oModel = new sap.ui.model.json.JSONModel();

					// oModel.setData({
					// 	HUSet: oRef.aData
					// });
					// oRef.getOwnerComponent().setModel(oModel, "oListHU");
					// oRef.onItemPress();

				}

				function cFailed() {

				}

			}

		},

		binGet: function (oEvent) {
			var oRef = this;
			var tempVar = oRef.getView().byId("id1").getValue();
			var tempMat = oRef.getView().byId("id2").getValue();
			var bin = oRef.getView().byId("idBin").getValue();
			var oFlag = true;
			this.odataService.read("/HUQtyDetailsSet?$filter=ExternalHU eq '" + tempVar + "' and Material eq '" + tempMat + "'", {
				// this.odataService.read("/HUQtyDetailsSet?$filter=ExternalHU eq '00000000002000057331' and Material eq '000000003000000724' and ScannedQnty eq '0' and RequirementQnty eq '41600.000' and BinNumber eq 'U_ZONE'", {
				success: cSuccess,
				failed: cFailed
			});

			function cSuccess(data) {
				// if (bin !== data.results[0].BinNumber) {
				// 	MessageBox.information("Please Scan HU of Same Bin Number");
				// 	oRef.getView().byId("id1").setValue("");
				// // } else {
				var huBatch = data.results[0].BatchNo;
				var binData = oRef.getView().getModel("oDelAvailableBin").getData();
				for (var i = 0; i < binData.results.length; i++) {
					if (huBatch === binData.results[i].BatchNo) {
						oFlag = true;
						i = i + binData.results.length;
					} else {
						oFlag = false;
					}
				}
				if (oFlag === false) {
					MessageBox.error("Please Scan HU's of Batch/s From Available Bins Only");
					oRef.getView().byId("id1").setValue("");
				} else {
					oRef.aData.push({
						ExternalHU: data.results[0].HU,
						BinNumber: bin,
						BatchNo: data.results[0].BatchNo,
						ScannedQnty: data.results[0].ScannedQnty
					});

					var oModel = new sap.ui.model.json.JSONModel();

					oModel.setData({
						HUSet: oRef.aData
					});
					oRef.getOwnerComponent().setModel(oModel, "oListHU");
					oRef.onItemPress();
				}

				// }

			}

			function cFailed() {

			}

		},

		onItemPress: function (oEvent) {
			// var myScannedQty = new sap.ui.model.json.JSONModel();
			// var data = {};
			var tempHU = this.getView().byId("id1").getValue();
			var tempReqQty = this.getView().byId("id3").getValue();
			// var tempBin = this.getView().byId("id5").getValue();
			var tempMat = this.getView().byId("id2").getValue();

			// var tempHU = "00000000002000057331";
			// var tempReqQty = 41600.000;
			// var tempBin = "U_ZONE";
			// var tempMat = "000000003000000724";
			// var tempHU = "00000000002000057364";
			// var tempMat = "000000003000000879";
			var oRef = this;

			var temp = this.getView().byId("id4").getValue();

			var record = [];

			// var aData = oRef.getView().getModel("oScannedQty");

			// /sap/opu/odata/sap/ZWM_GW_RFSCREENS_SRV/HUQtyDetailsSet?$filter=ExternalHU eq '00000000001000000007' and Material eq '3'

			this.odataService.read("/HUQtyDetailsSet?$filter=ExternalHU eq '" + tempHU + "' and Material eq '" + tempMat + "'", {
				// this.odataService.read("/HUQtyDetailsSet?$filter=ExternalHU eq '00000000002000057331' and Material eq '000000003000000724' and ScannedQnty eq '0' and RequirementQnty eq '41600.000' and BinNumber eq 'U_ZONE'", {
				success: cSuccess,
				failed: cFailed
			});

			function cSuccess(data) {
				// console.log(data);

				var scanQty = oRef.getView().byId("id4").getValue();
				var tempScanQty = data.results[0].ScannedQnty;
				var tempBatch = data.results[0].BatchNo;
				var tempHU = data.results[0].HU;
				// var batchQty = new sap.ui.model.json.JSONModel();
				// var dummyData = oRef.getView().getModel("batchQty").getData();
				// var bq = {};
				// var mbq = [];
				// bq.BatchNo = tempBatch;
				// bq.ScannedQTY = tempScanQty;
				// bq.ScannedHU = tempHU;
				// mbq.push(bq);

				// var tempModel = new sap.ui.model.json.JSONModel();
				// tempModel.setData({
				// 	tempSet: mbq
				// });
				// s

				sap.ui.getCore().countHU = parseFloat(scanQty) + 1;
				// sap.ui.getCore().countHU = sap.ui.getCore().countHU + 1;

				var totalScannedQty = parseFloat(scanQty) + parseFloat(tempScanQty);
				totalScannedQty = totalScannedQty.toFixed(3);

				oRef.getView().byId("id4").setValue((sap.ui.getCore().countHU).toLocaleString());
				// oRef.getView().byId("id4").setValue("1020.000");

				var aData = oRef.getView().getModel("oDeliveryNo").getData();
				var tabTempScan = aData.results[sap.ui.selectedIndex].ScannedQuantity;
				var tabTempScanQty = parseFloat(tabTempScan) +
					parseFloat(tempScanQty);
				// aData.results[sap.ui.selectedIndex].ScannedQuantity = tabTempScanQty.toFixed(3);
				aData.results[sap.ui.selectedIndex].ScannedQuantity = sap.ui.getCore().countHU;
				if (sap.ui.getCore().requiredPallet !== sap.ui.getCore().scannedPallet) {
					aData.results[sap.ui.palIndex].ScannedQuantity = sap.ui.getCore().scannedPallet;
					aData.results[sap.ui.palIndex].ScannedQuantity = parseFloat(aData.results[sap.ui.palIndex].ScannedQuantity) + 1;
					sap.ui.getCore().scannedPallet = aData.results[sap.ui.palIndex].ScannedQuantity;
				}

				oRef.getView().getModel("oDeliveryNo").refresh(true);

				var bData = oRef.getView().getModel("oScannedQtySelect").getData();
				var binScanTemp = parseFloat(bData.myScannedQty);
				var binScanQtyTemp = parseFloat(binScanTemp) + parseFloat(tempScanQty);
				bData.myScannedQty = binScanQtyTemp.toFixed(3);
				bData.myScannedQty = (sap.ui.getCore().countHU).toLocaleString();
				oRef.getView().getModel("oScannedQtySelect").refresh(true);

				// var sData = oRef.getView().getModel("oBinScanModel");
				// var sdata = {};
				// sData.setData(data);
				// sdata.binNum = oRef.getView().byId("id5").getText();
				// sdata.ScannedQt = oRef.getView().byId("id4").getValue();
				// sData.setData(sdata);

				// var oMyModel = new sap.ui.model.json.JSONModel();

				// oMyModel.setData({
				// 	ScannedSet: sdata
				// });
				// oRef.getView().setModel(oMyModel, "oBinScanModel");

				oRef.getView().byId("id1").setValue("");
				setTimeout(function () {
					var oInput = oRef.getView().byId("id1");
					oInput.focus();
				}, 1000);
				// oRef.onBeforeShow(oEvent);
				// var data = {};
				// data.ScannedQt = data.ScannedQnty;
				// myScannedQty.setData(data);
				// oRef.getOwnerComponent().setModel(myScannedQty, "oScannedQty");
			}

			function cFailed() {
				MessageBox.error("HU Number Scan failed");
			}
		},

		onDelete: function (oEvent) {

			// // /sap/opu/odata/sap/ZWM_GW_RFSCREENS_SRV/PickDataStorageSet(DeliveryNo='63289',Material='123456',ExternalHU='123645')

			// this.oModel = this.getView().getModel("oListHU");
			// var tempHU = this.getView().getModel("oListHU").getData(this.result).HUSet[0].ExternalHU;
			// // var tempHU = "00000000002000057364";
			// var tempMat = this.getView().byId("id2").getValue();
			// var oRef = this;
			// this.odataService.read("/HUQtyDetailsSet?$filter=ExternalHU eq '" + tempHU + "' and Material eq '" + tempMat + "'", {
			// 	// this.odataService.read("/HUQtyDetailsSet?$filter=ExternalHU eq '00000000002000057331' and Material eq '000000003000000724' and ScannedQnty eq '0' and RequirementQnty eq '41600.000' and BinNumber eq 'U_ZONE'", {
			// 	success: cSuccess,
			// 	failed: cFailed
			// });

			// function cSuccess(data) {

			// 	var scanQty = oRef.getView().byId("id4").getValue();
			// 	sap.ui.getCore().countHU = parseFloat(scanQty) - 1;
			// 	// sap.ui.getCore().countHU = sap.ui.getCore().countHU - 1;
			// 	var tempScanQty = data.results[0].ScannedQnty;
			// 	var totalScannedQty = parseFloat(scanQty) - parseFloat(tempScanQty);
			// 	totalScannedQty = totalScannedQty.toFixed(3);
			// 	// data.myScanQty = data.results[0].ScannedQnty;
			// 	oRef.getView().byId("id4").setValue((sap.ui.getCore().countHU).toLocaleString());
			// 	// oRef.getView().byId("id4").setValue(data.myScanQty);
			// 	// sap.ui.getCore().countHU = sap.ui.getCore().countHU - 1;
			// 	var aData = oRef.getView().getModel("oDeliveryNo").getData();
			// 	var tabTempScan = aData.results[sap.ui.selectedIndex].ScannedQuantity;
			// 	aData.results[sap.ui.selectedIndex].ScannedQuantity = parseFloat(tabTempScan) -
			// 		parseFloat(tempScanQty);
			// 	// aData.results[sap.ui.selectedIndex].ScannedQuantity = aData.results[sap.ui.selectedIndex].ScannedQuantity.toFixed(3);
			// 	aData.results[sap.ui.selectedIndex].ScannedQuantity = sap.ui.getCore().countHU;
			// 	if (sap.ui.getCore().requiredPallet !== sap.ui.getCore().scannedPallet) {
			// 		aData.results[sap.ui.palIndex].ScannedQuantity = sap.ui.getCore().scannedPallet;
			// 		aData.results[sap.ui.palIndex].ScannedQuantity = parseFloat(aData.results[sap.ui.palIndex].ScannedQuantity) - 1;
			// 		sap.ui.getCore().scannedPallet = aData.results[sap.ui.palIndex].ScannedQuantity;
			// 	}
			// 	// aData.results[sap.ui.palIndex].ScannedQuantity = parseFloat(aData.results[sap.ui.palIndex].ScannedQuantity) - 1;
			// 	oRef.getView().getModel("oDeliveryNo").refresh(true);

			// 	var bData = oRef.getView().getModel("oScannedQtySelect").getData();
			// 	var binScanTemp = parseFloat(bData.myScannedQty);
			// 	bData.myScannedQty = parseFloat(binScanTemp) - parseFloat(tempScanQty);
			// 	bData.myScannedQty = bData.myScannedQty.toFixed(3);
			// 	bData.myScannedQty = (sap.ui.getCore().countHU).toLocaleString();
			// 	oRef.getView().getModel("oScannedQtySelect").refresh(true);

			// 	oRef.getView().byId("id1").setValue("");
			// 	setTimeout(function () {
			// 		var oInput = oRef.getView().byId("id1");
			// 		oInput.focus();
			// 	}, 1000);
			// 	// var data = {};
			// 	// data.ScannedQt = data.ScannedQnty;
			// 	// myScannedQty.setData(data);
			// 	// oRef.getOwnerComponent().setModel(myScannedQty, "oScannedQty");
			// }

			// function cFailed() {
			// 	MessageBox.error("HU Number Scan failed");
			// }

			var that = this;
			that.oModel = that.getView().getModel("oListHU");
			var data = that.getView().getModel("oListHU").getData(that.result);

			that.oList = that.byId("idList");

			var sItems = that.oList.getSelectedItems();

			if (sItems.length === 0) {
				MessageBox.information("Please Select a HU to Delete");
				return;
			} else {

				this.oModel = this.getView().getModel("oListHU");
				var tempHU = this.getView().getModel("oListHU").getData(this.result).HUSet[0].ExternalHU;
				// var tempHU = "00000000002000057364";
				var tempMat = this.getView().byId("id2").getValue();
				var oRef = this;
				this.odataService.read("/HUQtyDetailsSet?$filter=ExternalHU eq '" + tempHU + "' and Material eq '" + tempMat + "'", {
					// this.odataService.read("/HUQtyDetailsSet?$filter=ExternalHU eq '00000000002000057331' and Material eq '000000003000000724' and ScannedQnty eq '0' and RequirementQnty eq '41600.000' and BinNumber eq 'U_ZONE'", {
					success: cSuccess,
					failed: cFailed
				});

				function cSuccess(data) {

					var scanQty = oRef.getView().byId("id4").getValue();
					sap.ui.getCore().countHU = parseFloat(scanQty) - 1;
					// sap.ui.getCore().countHU = sap.ui.getCore().countHU - 1;
					var tempScanQty = data.results[0].ScannedQnty;
					var totalScannedQty = parseFloat(scanQty) - parseFloat(tempScanQty);
					totalScannedQty = totalScannedQty.toFixed(3);
					// data.myScanQty = data.results[0].ScannedQnty;
					oRef.getView().byId("id4").setValue((sap.ui.getCore().countHU).toLocaleString());
					// oRef.getView().byId("id4").setValue(data.myScanQty);
					// sap.ui.getCore().countHU = sap.ui.getCore().countHU - 1;
					var aData = oRef.getView().getModel("oDeliveryNo").getData();
					var tabTempScan = aData.results[sap.ui.selectedIndex].ScannedQuantity;
					aData.results[sap.ui.selectedIndex].ScannedQuantity = parseFloat(tabTempScan) -
						parseFloat(tempScanQty);
					// aData.results[sap.ui.selectedIndex].ScannedQuantity = aData.results[sap.ui.selectedIndex].ScannedQuantity.toFixed(3);
					aData.results[sap.ui.selectedIndex].ScannedQuantity = sap.ui.getCore().countHU;
					if (sap.ui.getCore().requiredPallet !== sap.ui.getCore().scannedPallet) {
						aData.results[sap.ui.palIndex].ScannedQuantity = sap.ui.getCore().scannedPallet;
						aData.results[sap.ui.palIndex].ScannedQuantity = parseFloat(aData.results[sap.ui.palIndex].ScannedQuantity) - 1;
						sap.ui.getCore().scannedPallet = aData.results[sap.ui.palIndex].ScannedQuantity;
					}
					// aData.results[sap.ui.palIndex].ScannedQuantity = parseFloat(aData.results[sap.ui.palIndex].ScannedQuantity) - 1;
					oRef.getView().getModel("oDeliveryNo").refresh(true);

					var bData = oRef.getView().getModel("oScannedQtySelect").getData();
					var binScanTemp = parseFloat(bData.myScannedQty);
					bData.myScannedQty = parseFloat(binScanTemp) - parseFloat(tempScanQty);
					bData.myScannedQty = bData.myScannedQty.toFixed(3);
					bData.myScannedQty = (sap.ui.getCore().countHU).toLocaleString();
					oRef.getView().getModel("oScannedQtySelect").refresh(true);

					oRef.getView().byId("id1").setValue("");
					setTimeout(function () {
						var oInput = oRef.getView().byId("id1");
						oInput.focus();
					}, 1000);
					// var data = {};
					// data.ScannedQt = data.ScannedQnty;
					// myScannedQty.setData(data);
					// oRef.getOwnerComponent().setModel(myScannedQty, "oScannedQty");
				}

				function cFailed() {
					MessageBox.error("HU Number Scan failed");
				}

				for (var i = sItems.length - 1; i >= 0; i--) {
					var path = sItems[i].getBindingContext("oListHU").getPath();
					var idx = parseInt(path.substring(path.lastIndexOf('/') + 1));
					data.HUSet.splice(idx, 1);
				}
				that.getView().getModel("oListHU").refresh(true);
			}
			that.oList.removeSelections();
		},

		// onPressBack: function () {
		// 	var oRef = this;
		// 	var rtn = false;

		// 	if (this.flag === false) {

		// 		MessageBox.confirm("Data not saved, Would you like to save ?", {
		// 			title: "Confirmation",
		// 			Action: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
		// 			onClose: function (oAction) {
		// 				if (oAction === sap.m.MessageBox.Action.OK) {
		// 					rtn = true;
		// 					return rtn;

		// 				} else {
		// 					var aData = oRef.getView().getModel("oListHU").getData();
		// 					oRef.aData = [];
		// 					oRef.getView().getModel("oListHU").setData(oRef.aData);
		// 					oRef.getView().getModel("oListHU").refresh(true);
		// 					oRef.getView().byId("idList").destroyItems();
		// 					this.getView().byId("id1").setValue("");
		// 					this.getView().byId("id4").setValue("0.000");

		// 					var aData = oRef.getView().getModel("oDeliveryNo").getData();
		// 					aData.results[sap.ui.selectedIndex].ScannedQuantity = "0.000";
		// 					oRef.getView().getModel("oDeliveryNo").refresh(true);

		// 					var bData = oRef.getView().getModel("oScannedQtySelect").getData();
		// 					bData.myScannedQty = "0.000";
		// 					oRef.getView().getModel("oScannedQtySelect").refresh(true);

		// 					MessageBox.confirm("Would you like to scan another Bin for the same material ?", {
		// 						title: "Confirmation",
		// 						Action: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
		// 						onClose: function (oAction) {
		// 							if (oAction === sap.m.MessageBox.Action.OK) {
		// 								var sHistory = History.getInstance();
		// 								var sPreviousHash = sHistory.getPreviousHash();
		// 								if (sPreviousHash !== undefined) {
		// 									window.history.go(-1);
		// 								}
		// 							} else {
		// 								var sHistory = History.getInstance();
		// 								var sPreviousHash = sHistory.getPreviousHash();
		// 								if (sPreviousHash !== undefined) {
		// 									window.history.go(-2);
		// 								}
		// 							}
		// 						}.bind(oRef),
		// 						styleClass: "",
		// 						initialFocus: null,
		// 						textDirection: sap.ui.core.TextDirection.Inherit
		// 					});
		// 				}
		// 			}.bind(oRef),
		// 			styleClass: "",
		// 			initialFocus: null,
		// 			textDirection: sap.ui.core.TextDirection.Inherit
		// 		});

		// 	} else {
		// 		var aData = oRef.getView().getModel("oListHU").getData();
		// 		oRef.aData = [];
		// 		oRef.getView().getModel("oListHU").setData(oRef.aData);
		// 		oRef.getView().getModel("oListHU").refresh(true);
		// 		oRef.getView().byId("idList").destroyItems();
		// 		this.getView().byId("id1").setValue("");
		// 		// this.getView().byId("id4").setValue("0.000");

		// 		MessageBox.confirm("Would you like to scan another Bin for the same material ?", {
		// 			title: "Confirmation",
		// 			Action: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
		// 			onClose: function (oAction) {
		// 				if (oAction === sap.m.MessageBox.Action.OK) {
		// 					var sHistory = History.getInstance();
		// 					var sPreviousHash = sHistory.getPreviousHash();
		// 					if (sPreviousHash !== undefined) {
		// 						window.history.go(-1);
		// 					}
		// 				} else {
		// 					var sHistory = History.getInstance();
		// 					var sPreviousHash = sHistory.getPreviousHash();
		// 					if (sPreviousHash !== undefined) {
		// 						window.history.go(-2);
		// 					}
		// 				}
		// 			}.bind(oRef),
		// 			styleClass: "",
		// 			initialFocus: null,
		// 			textDirection: sap.ui.core.TextDirection.Inherit
		// 		});
		// 	}

		// },

		onPressBack: function () {
			var oRef = this;
			var rtn = false;
			// sap.ui.getCore().myflag = true;

			if (sap.ui.getCore().myflag === false) {

				MessageBox.show("Data not saved, would you like to save?", {
					icon: MessageBox.Icon.QUESTION,
					title: "Delivery Confirmation",
					actions: [MessageBox.Action.YES, MessageBox.Action.NO],
					onClose: function (oAction) {
						if (oAction === sap.m.MessageBox.Action.YES) {
							rtn = true;
							return rtn;
						} else {
							var aData = oRef.getView().getModel("oListHU").getData();
							oRef.aData = [];
							oRef.getView().getModel("oListHU").setData(oRef.aData);
							oRef.getView().getModel("oListHU").refresh(true);
							oRef.getView().byId("idList").destroyItems();
							oRef.getView().byId("id1").setValue("");
							oRef.getView().byId("id4").setValue(sap.ui.getCore().alreadyScannedPallet);

							var aData = oRef.getView().getModel("oDeliveryNo").getData();
							aData.results[sap.ui.selectedIndex].ScannedQuantity = sap.ui.getCore().alreadyScannedPallet;
							aData.results[sap.ui.palIndex].ScannedQuantity = aData.results[sap.ui.selectedIndex].ScannedQuantity;
							oRef.getView().getModel("oDeliveryNo").refresh(true);

							var bData = oRef.getView().getModel("oScannedQtySelect").getData();
							bData.myScannedQty = "0.000";
							oRef.getView().getModel("oScannedQtySelect").refresh(true);
							var sHistory = History.getInstance();
							var sPreviousHash = sHistory.getPreviousHash();
							if (sPreviousHash !== undefined) {
								window.history.go(-1);
							}

							// MessageBox.confirm("Would you like to scan another Bin for the same material ?", {
							// 	title: "Confirmation",
							// 	Action: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
							// 	onClose: function (oAction) {
							// 		if (oAction === sap.m.MessageBox.Action.OK) {
							// 			var sHistory = History.getInstance();
							// 			var sPreviousHash = sHistory.getPreviousHash();
							// 			if (sPreviousHash !== undefined) {
							// 				window.history.go(-1);
							// 			}
							// 		} else {
							// 			var sHistory = History.getInstance();
							// 			var sPreviousHash = sHistory.getPreviousHash();
							// 			if (sPreviousHash !== undefined) {
							// 				window.history.go(-2);
							// 			}
							// 		}
							// 	}.bind(oRef),
							// 	styleClass: "",
							// 	initialFocus: null,
							// 	textDirection: sap.ui.core.TextDirection.Inherit
							// });
						}
					}.bind(oRef),
					styleClass: "",
					initialFocus: null,
					textDirection: sap.ui.core.TextDirection.Inherit
				});

			} else {
				// oRef._onObjectMatched();
				var aData = oRef.getView().getModel("oListHU").getData();
				oRef.aData = [];
				oRef.getView().getModel("oListHU").setData(oRef.aData);
				oRef.getView().getModel("oListHU").refresh(true);
				oRef.getView().byId("idList").destroyItems();
				oRef.getView().byId("id1").setValue("");
				oRef.getView().byId("id4").setValue(sap.ui.getCore().alreadyScannedPallet);

				var aData = oRef.getView().getModel("oDeliveryNo").getData();
				aData.results[sap.ui.selectedIndex].ScannedQuantity = sap.ui.getCore().alreadyScannedPallet;
				aData.results[sap.ui.palIndex].ScannedQuantity = aData.results[sap.ui.selectedIndex].ScannedQuantity;
				oRef.getView().getModel("oDeliveryNo").refresh(true);

				var bData = oRef.getView().getModel("oScannedQtySelect").getData();
				bData.myScannedQty = "0.000";
				oRef.getView().getModel("oScannedQtySelect").refresh(true);
				var sHistory = History.getInstance();
				var sPreviousHash = sHistory.getPreviousHash();
				if (sPreviousHash !== undefined) {
					window.history.go(-1);
				}
				// var aData = oRef.getView().getModel("oListHU").getData();
				// oRef.aData = [];
				// oRef.getView().getModel("oListHU").setData(oRef.aData);
				// oRef.getView().getModel("oListHU").refresh(true);
				// oRef.getView().byId("idList").destroyItems();
				// oRef.getView().byId("id1").setValue("");
				// // this.getView().byId("id4").setValue("0.000");

				// MessageBox.confirm("Would you like to scan another Bin for the same material ?", {
				// 	title: "Confirmation",
				// 	Action: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
				// 	onClose: function (oAction) {
				// 		if (oAction === sap.m.MessageBox.Action.OK) {
				// 			var sHistory = History.getInstance();
				// 			var sPreviousHash = sHistory.getPreviousHash();
				// 			if (sPreviousHash !== undefined) {
				// 				window.history.go(-1);
				// 			}
				// 		} else {
				// 			var sHistory = History.getInstance();
				// 			var sPreviousHash = sHistory.getPreviousHash();
				// 			if (sPreviousHash !== undefined) {
				// 				window.history.go(-2);
				// 			}
				// 		}
				// 	}.bind(oRef),
				// 	styleClass: "",
				// 	initialFocus: null,
				// 	textDirection: sap.ui.core.TextDirection.Inherit
				// });
			}

		},

		onSave: function (oEvent) {
			var oRadioBtn = this.getView().byId("idScanBatch");
			sap.ui.getCore().batchGetSelected = oRadioBtn.getSelected();
			sap.ui.getCore().batchScanRadioBtn = oRadioBtn;
			var oRB = this.getView().byId("idDontScanBatch");
			sap.ui.getCore().dontScanBatchRadioBtn = oRB;
			var batchNumberClear = this.getView().byId("id8");
			sap.ui.getCore().clearBatchNumber = batchNumberClear;
			if (sap.ui.getCore().batchGetSelected === true) {
				sap.ui.getCore().myBatchFlag = "X";
			} else {
				sap.ui.getCore().myBatchFlag = "";
			}

			// var oSelected = oRadioBtn.getSelected();
			this.removeDataFromTable();
			var data = {};
			data.NavDeliveryHeaderPickDataStorage = [];

			// var sendData = {};
			// var qty = this.getView().byId("id4").getValue();
			// temp.Quantity = parseFloat(qty);

			// temp.Quantity = this.getView().byId("id4").getValue();
			// temp.StorageBin = this.getView().byId("id5").getText();
			// temp.Material = this.getView().byId("id10").getText();
			// temp.DeliveryNo = this.getView().byId("id7").getText();
			// temp.BatchNo = this.getView().byId("id8").getText();

			var oQuantitytemp = this.getView().byId("id4").getValue();
			// var oQuantity = parseFloat(oQuantitytemp);
			// .toFixed(3);
			// var oStorageBin = this.getView().byId("id5").getText();
			// var oMaterial = this.getView().byId("id10").getText();
			// var oDeliveryNo = this.getView().byId("id7").getText();
			// var oBatchNo = this.getView().byId("id8").getText();
			// var oMessage = "";

			// data.DeliveryNo = this.getView().byId("id7").getValue();
			data.DeliveryNo = sap.ui.getCore().deliveryNum;
			data.Material = this.getView().byId("id2").getValue();
			data.Indicator = sap.ui.getCore().myBatchFlag;
			// data.StorageBin = this.getView().byId("id5").getValue();
			// data.BatchNo = this.getView().byId("id8").getValue();
			data.Message = "";
			// data.Quantity = oQuantitytemp;
			var result = this.oList.getModel("oListHU").getData();
			var oRef = this;
			// var data = {};
			// data.NavFGHeaderFGItems = [];
			// $.each(result.HUSet, function(index, item) {
			// 	var temp = {};
			// 	temp.ExternalHU = item.ExternalHU;
			// 	temp.BinNumber = item.binNo;
			// 	temp.Message = "";
			// 	data.NavFGHeaderFGItems.push(temp);
			// });
			// temp.Message = "";
			// var result = this.oList.getModel("oListHU").getData();
			var tempbin = result.HUSet[0].BinNumber;
			for (var i = 0; i < result.HUSet.length; i++) {
				if (tempbin !== result.HUSet[i].BinNumber) {
					sap.ui.getCore().myBinFlag = "X";
				} else {
					sap.ui.getCore().myBinFlag = "";
				}
			}
			// console.log(sap.ui.getCore().myBinFlag);

			$.each(result.HUSet, function (index, item) {
				var temp = {};
				temp.ExternalHU = item.ExternalHU;
				temp.BatchNo = item.BatchNo;
				temp.StorageBin = item.BinNumber;
				temp.Quantity = item.ScannedQnty;
				sap.ui.getCore().assignBatchNum = temp.BatchNo;
				data.NavDeliveryHeaderPickDataStorage.push(temp);
			});

			// data.NavDeliveryHeaderPickDataStorage.push(temp);

			// var result = this.oList.getModel("oListHU").getData();
			// temp.ExternalHU = result.HUSet[0].ExternalHU;

			// data.dummy.push(temp);

			// this.odataService.setHeaders({
			// 	"DeliveryNo": "oDeliveryNo",
			// 	"Material": "oMaterial",
			// 	"StorageBin": "oStorageBin",
			// 	"Quantity": "oQuantity",
			// 	"Message": "oMessage",
			// 	"BatchNo": "oBatchNo"
			var testFlag = true;
			// });
			// (DeliveryNo='oDeliveryNo',Material='oMaterial',StorageBin='oStorageBin',Quantity='oQuantity',Message='oMessage',BatchNo='oBatchNo')
			this.odataService.create("/DeliveryNoHeaderSet", data, null, function (odata, response) {

				MessageBox.success("Data Successfully Saved", {
					title: "Success",
					Action: "OK",
					onClose: function (oAction) {
						if (oAction === sap.m.MessageBox.Action.OK) {
							// oRef.getView().byId("idList").destroyItems();
							var sHistory = History.getInstance();
							var sPreviousHash = sHistory.getPreviousHash();
							if (sPreviousHash !== undefined) {
								window.history.go(-1);
							}
						}
					}.bind(oRef),
					styleClass: "",
					initialFocus: null,
					textDirection: sap.ui.core.TextDirection.Inherit
				});
				oRef.getView().byId("id4").setValue("");

				// oRef.getView().byId("idList").destroyItems();

				// this.flag = true;
				sap.ui.getCore().myflag = true;
				sap.ui.getCore().doorFlag.setEnabled(true);
			}, function (odata, response) {
				// var errorResponse = JSON.parse(odata.response.body);
				// var errorDetails = errorResponse.error.innererror.errordetails[0].message;
				// var errorResponse = JSON.parse(odata.response.body);
				// errorResponse = errorResponse.innererror.errordetails[0].message;
				// var errorString = "";

				// // var errorString = "Data could not be submitted";
				// $.each(errorDetails, function (index, item) {
				// 	if (index !== errorDetails.length - 1) {
				// 		errorString = errorString + item.code + " " + item.message + "\n";
				// 	}

				// });

				var error = JSON.parse(odata.response.body);
				var error1 = error;
				// var error2 = error1.error.innererror.errordetails[0].message;
				var error2 = error1.error.innererror.errordetails;
				var singleBatchMsg = "";
				$.each(error2, function (index, item) {

					if (index !== error2.length - 1) {
						error2 = item.message;
						if (error2 === "Please Select Single Batch") {
							singleBatchMsg = "Please Select Single Batch";
						}
					}

				});

				if (singleBatchMsg === "Please Select Single Batch") {
					oRef.changeBatch();
					testFlag = false;
					return testFlag;
				} else {
					var errorDetails = odata.message;
					if (errorDetails === "HTTP request failed") {
						MessageBox.error("The HU's Scanned are already saved", {
							title: "Error",
							Action: "CLOSE",
							onClose: function (oAction) {
								if (oAction === sap.m.MessageBox.Action.CLOSE) {
									oRef.removeDataFromTable();
									sap.ui.getCore().batchScanRadioBtn.setSelected(false);
									sap.ui.getCore().dontScanBatchRadioBtn.setSelected(true);
									sap.ui.getCore().clearBatchNumber.setValue("");
									sap.ui.getCore().clearBatchNumber.setEnabled(false);

									var aData = oRef.getView().getModel("oListHU").getData();
									oRef.aData = [];
									oRef.getView().getModel("oListHU").setData(oRef.aData);
									oRef.getView().getModel("oListHU").refresh(true);
									oRef.getView().byId("idList").destroyItems();
									oRef.getView().byId("id1").setValue("");
									oRef.getView().byId("id4").setValue(sap.ui.getCore().alreadyScannedPallet);

									var aData = oRef.getView().getModel("oDeliveryNo").getData();
									aData.results[sap.ui.selectedIndex].ScannedQuantity = sap.ui.getCore().alreadyScannedPallet;
									aData.results[sap.ui.palIndex].ScannedQuantity = aData.results[sap.ui.selectedIndex].ScannedQuantity;
									oRef.getView().getModel("oDeliveryNo").refresh(true);

									var bData = oRef.getView().getModel("oScannedQtySelect").getData();
									bData.myScannedQty = "0.000";
									oRef.getView().getModel("oScannedQtySelect").refresh(true);

									var sHistory = History.getInstance();
									var sPreviousHash = sHistory.getPreviousHash();
									if (sPreviousHash !== undefined) {
										window.history.go(-1);
									}

								}
							},
							styleClass: "",
							initialFocus: null,
							textDirection: sap.ui.core.TextDirection.Inherit
						});
					}
				}

			});

		},
		removeDataFromTable: function () {
			var oDelNum = sap.ui.getCore().delNum;
			this.odataService.remove("/DeleteFGPickDeliverySet(DeliveryNo='" + oDelNum + "')", null, null, false, function (
				odata,
				response) {
				// console.log(response);
			});
		},
		changeBatch: function () {

			// var oRadioBtn = this.getView().byId("idScanBatch");
			// oRadioBtn.setSelected(true);
			// this.getView().byId("id8").setValue(sap.ui.getCore().assignBatchNum);
			var dummyFlag = true;
			var that = this;
			that.removeDataFromTable();

			MessageBox.information("All HU's are of same batch", {
				title: "Information",
				Action: "OK",
				onClose: function (oAction) {
					if (oAction === sap.m.MessageBox.Action.OK) {
						// var oRef = this;
						// var oRadioBtn = oRef.getView().byId("idScanBatch");
						// sap.ui.getCore().batchGetSelected = oRadioBtn.getSelected();
						// sap.ui.getCore().batchScanRadioBtn = oRadioBtn;
						// var oRB = oRef.getView().byId("idDontScanBatch");
						// sap.ui.getCore().dontScanBatchRadioBtn = oRB;
						// var batchNumberClear = oRef.getView().byId("id8");
						// sap.ui.getCore().clearBatchNumber = batchNumberClear;
						// if (sap.ui.getCore().batchGetSelected === true) {
						// 	sap.ui.getCore().myBatchFlag = "X";
						// } else {
						// 	sap.ui.getCore().myBatchFlag = "";
						// }
						sap.ui.getCore().myBatchFlag = "X";
						var data = {};
						data.NavDeliveryHeaderPickDataStorage = [];

						var oQuantitytemp = that.getView().byId("id4").getValue();
						data.DeliveryNo = sap.ui.getCore().deliveryNum;
						data.Material = that.getView().byId("id2").getValue();
						data.Indicator = sap.ui.getCore().myBatchFlag;
						data.Message = "";
						var result = that.oList.getModel("oListHU").getData();
						var oRef = this;

						$.each(result.HUSet, function (index, item) {
							var temp = {};
							temp.ExternalHU = item.ExternalHU;
							temp.BatchNo = item.BatchNo;
							temp.StorageBin = item.BinNumber;
							temp.Quantity = item.ScannedQnty;
							sap.ui.getCore().assignBatchNum = temp.BatchNo;
							data.NavDeliveryHeaderPickDataStorage.push(temp);
						});

						that.odataService.create("/DeliveryNoHeaderSet", data, null, function (odata, response) {

							MessageBox.success("Data Successfully Saved", {
								title: "Success",
								Action: "OK",
								onClose: function (oAction) {
									if (oAction === sap.m.MessageBox.Action.OK) {
										var sHistory = History.getInstance();
										var sPreviousHash = sHistory.getPreviousHash();
										if (sPreviousHash !== undefined) {
											window.history.go(-1);
										}
									}
								}.bind(oRef),
								styleClass: "",
								initialFocus: null,
								textDirection: sap.ui.core.TextDirection.Inherit
							});
							that.getView().byId("id4").setValue("");
							sap.ui.getCore().myflag = true;
							sap.ui.getCore().doorFlag.setEnabled(true);
						}, function (odata, response) {

							// var error = JSON.parse(odata.response.body);
							// var error1 = error;
							// var error2 = error1.error.innererror.errordetails[0].message;

							// if (error2 === "Please Select Single Batch") {
							// 	oRef.changeBatch();
							// }
							// else {
							var errorDetails = odata.message;
							if (errorDetails === "HTTP request failed") {
								MessageBox.error("The HU's Scanned are already saved", {
									title: "Error",
									Action: "CLOSE",
									onClose: function (oAction) {
										if (oAction === sap.m.MessageBox.Action.CLOSE) {
											oRef.removeDataFromTable();
											sap.ui.getCore().batchScanRadioBtn.setSelected(false);
											sap.ui.getCore().dontScanBatchRadioBtn.setSelected(true);
											sap.ui.getCore().clearBatchNumber.setValue("");
											sap.ui.getCore().clearBatchNumber.setEnabled(false);

											var aData = that.getView().getModel("oListHU").getData();
											that.aData = [];
											that.getView().getModel("oListHU").setData(oRef.aData);
											that.getView().getModel("oListHU").refresh(true);
											that.getView().byId("idList").destroyItems();
											that.getView().byId("id1").setValue("");
											that.getView().byId("id4").setValue(sap.ui.getCore().alreadyScannedPallet);

											var aData = that.getView().getModel("oDeliveryNo").getData();
											aData.results[sap.ui.selectedIndex].ScannedQuantity = sap.ui.getCore().alreadyScannedPallet;
											aData.results[sap.ui.palIndex].ScannedQuantity = aData.results[sap.ui.selectedIndex].ScannedQuantity;
											that.getView().getModel("oDeliveryNo").refresh(true);

											var bData = that.getView().getModel("oScannedQtySelect").getData();
											bData.myScannedQty = "0.000";
											that.getView().getModel("oScannedQtySelect").refresh(true);

											var sHistory = History.getInstance();
											var sPreviousHash = sHistory.getPreviousHash();
											if (sPreviousHash !== undefined) {
												window.history.go(-1);
											}

										}
									},
									styleClass: "",
									initialFocus: null,
									textDirection: sap.ui.core.TextDirection.Inherit
								});
							}
							// }

						});

					} else {
						dummyFlag = false;
						return dummyFlag;
					}
				}
			});

		}
	});

});