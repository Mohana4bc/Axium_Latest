sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/m/MessageBox"
], function (Controller, History, MessageBox) {
	"use strict";

	return Controller.extend("com.axium.Axium.controller.ScanHU", {
		onInit: function () {

			this.odataService = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZWM_GW_RFSCREENS_SRV/", true);
			this.oList = this.getView().byId("idList");
			this.aData = [];
			this.aDataCpy = [];
			this.Batchno = "";
			this.MaterialDesc = "";
			this.saveFlag = false;
			this.result = {};
			this.result.items = [];

			this.getView().addEventDelegate({
				onBeforeShow: jQuery.proxy(function (evt) {
					this.onBeforeShow(evt);
				}, this)
			});
			// this.getView().byId("idSubmit").setEnabled(false);
			// sap.ui.getCore().FGPutAwaySubmit = false;
			var oRef = this;
			this.odataService.read("/WareHouseSet", null, null, false, function (response) {
				if (oRef.getView().byId("fgWareHouseid") !== undefined) {
					oRef.getView().byId("fgWareHouseid").destroyItems();
				}
				for (var i = 0; i < response.results.length; i++) {
					oRef.getView().byId("fgWareHouseid").addItem(
						new sap.ui.core.ListItem({
							text: response.results[i].WareHouseNumber,
							key: response.results[i].WareHouseNumber,
							additionalText: response.results[i].WHDesc
						}));
				}
			});

		},
		// 	onBeforeShow: function() {

		// 	var listModel = this.getOwnerComponent().getModel("oListHU");
		// 	var oListModel = $.extend(true, {}, listModel);
		// 	this.getOwnerComponent().setModel(oListModel, "oListHU");
		// },
		onBeforeShow: function (oEvent) {
			var oRef = this;
			setTimeout(function () {
				var oInput = oRef.getView().byId("fgWareHouseid");
				oInput.focus();
			}, 1000);
			// if (sap.ui.getCore().FGPutAwaySubmit === true) {
			// 	oRef.getView().byId("idSubmit").setEnabled(true);
			// } else {
			// 	oRef.getView().byId("idSubmit").setEnabled(false);
			// }
		},

		onBeforeRendering: function () {
			var oRef = this;
			var aData = oRef.getView().getModel("oListHU").getData();
			var aDataCpy = oRef.getView().getModel("oListHUCpy").getData();
			oRef.aData = [];
			oRef.aDataCpy = [];
			oRef.getView().getModel("oListHU").setData(oRef.aData);
			oRef.getView().getModel("oListHUCpy").setData(oRef.aDataCpy);
			oRef.getView().getModel("oListHU").refresh(true);
			oRef.getView().getModel("oListHUCpy").refresh(true);
			oRef.getView().byId("idList").destroyItems();
			this.getView().byId("id1").setValue("");
		},

		// onBeforeShow: function(oEvent) {
		// 	var oRef = this;
		// 	setTimeout(function() {
		// 		var oInput = oRef.getView().byId("id1");
		// 		oInput.focus();
		// 	}, 1000);
		// },

		// handleSearch: function(oEvent) {
		onhandleSearch: function (oEvent) {
			var oRef = this;
			var hFlag = false;

			var tempVar = oRef.getView().byId("id1").getValue();
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
						var aDataCpy = oRef.getView().getModel("oListHUCpy");
						if (aDataCpy != undefined) {
							// var aData = oRef.getOwnerComponent().getModel("oListHUCpy").getData();
							var extFlag = true;

							$.each(aDataCpy.oData.HUSet, function (index, item) {

								if (item.ExternalHU === tempVar) {
									extFlag = false;
									MessageBox.information("HU Number is already scanned", {
										title: "Information"
									});
									oRef.getView().byId("id1").setValue("");
								}
							});
						}

						if (extFlag) {
							// this.odataService.read("/ScannedHU?ExternalHU='" + tempVar + "'", {
							// /ScannedHU?ExternalHU='" + huNumber + "'&Indicator='" + indicator + "'
							oRef.odataService.read("/ScannedHU?ExternalHU='" + tempVar + "'", {

								success: cSuccess,
								failed: cFailed
							});

						}

						function cSuccess(data) {
							// var oModel = oRef.getOwnerComponent().getModel("oListHU"); //Get Hold of the Model
							// oModel.setData(null);
							// var aData = oRef.getOwnerComponent().getModel("oListHU").getData();
							//	if (tempVar.length === 20) {
							if (data.Message === "Valid HU") {
								oRef.HUdetails(tempVar);

							}
							//} 
							else {
								MessageBox.error(data.Message);
								oRef.getView().byId("id1").setValue("");
								oRef.getView().byId("fgPutAwayBinId").setValue("");
							}

						}

						function cFailed() {
							MessageBox.error("HU Number Scan failed");

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
						oRef.getView().byId("id1").setValue(tempVar);
						var aDataCpy = oRef.getView().getModel("oListHUCpy");
						if (aDataCpy != undefined) {
							// var aData = oRef.getOwnerComponent().getModel("oListHUCpy").getData();
							var extFlag = true;

							$.each(aDataCpy.oData.HUSet, function (index, item) {

								if (item.ExternalHU === tempVar) {
									extFlag = false;
									MessageBox.information("HU Number is already scanned", {
										title: "Information"
									});
									oRef.getView().byId("id1").setValue("");
								}
							});
						}

						if (extFlag) {
							// this.odataService.read("/ScannedHU?ExternalHU='" + tempVar + "'", {
							oRef.odataService.read("/ScannedHU?ExternalHU='" + tempVar + "'", {

								success: cSuccess,
								failed: cFailed
							});

						}

						function cSuccess(data) {
							// var oModel = oRef.getOwnerComponent().getModel("oListHU"); //Get Hold of the Model
							// oModel.setData(null);
							// var aData = oRef.getOwnerComponent().getModel("oListHU").getData();
							//	if (tempVar.length === 20) {
							if (data.Message === "Valid HU") {
								oRef.HUdetails(tempVar);

								// oRef.aData.push({
								// 	ExternalHU: data.ExternalHU,
								// 	binNo: data.binNo
								// });

								// var oModel = new sap.ui.model.json.JSONModel();

								// oModel.setData({
								// 	HUSet: oRef.aData
								// });

								// var oModelCpy = new sap.ui.model.json.JSONModel();
								// oModelCpy.setData({
								// 	HUSet: oRef.aData
								// });

								// oRef.getOwnerComponent().setModel(oModel, "oListHU");
								// oRef.getOwnerComponent().setModel(oModelCpy, "oListHUCpy");
								// oRef.getView().byId("id1").setValue("");
								// oRef.onBeforeShow(oEvent);
							}
							//} 
							else {
								MessageBox.error(data.Message);
								oRef.getView().byId("id1").setValue("");
								oRef.getView().byId("fgPutAwayBinId").setValue("");
							}

						}

						function cFailed() {
							MessageBox.error("HU Number Scan failed");

						}

					}, 1000);
				} else {
					hFlag = true;
					return hFlag;
				}
			}

		},

		// onSelectHU: function (oEvent) {
		// 	sap.ui.getCore().HUSelected = oEvent.getSource().getTitle();
		// 	var oRef = this;
		// 	oRef.HUdetails();
		// 	// var oRouter = this.getOwnerComponent().getRouter();
		// 	// oRouter.navTo("BinScan", {
		// 	// 	HUSelect: HUSelected,
		// 	// 	Batch: sap.ui.getCore().batchNum,
		// 	// 	descp: sap.ui.getCore().MatDesc,
		// 	// });

		// },

		HUdetails: function (tempVar) {
			var oRef = this;
			var extHU = tempVar;
			// var tempVar = oRef.getView().byId("id1").getValue();
			oRef.odataService.read("/HUQtyDetailsSet?$filter=ExternalHU eq '" + extHU + "'", {
				success: cSuccess,
				failed: cFailed
			});

			function cSuccess(data) {
				if (data.results[0].BatchNo === "NOSTOCK") {
					MessageBox.error("No Stock maintained for the HU");
				} else {
					sap.ui.getCore().batchNum = data.results[0].BatchNo;
					sap.ui.getCore().MatDesc = data.results[0].MaterialDesc;
					sap.ui.getCore().MatNum = data.results[0].Material;
					sap.ui.getCore().FGPutAwayWH = data.results[0].WareHouse;
					var externalHU = data.results[0].HU;
					// sap.ui.getCore().EXHU = externalHU;
					var matDesc = data.results[0].MaterialDesc;
					var matNum = data.results[0].Material;

					oRef.aData.push({
						ExternalHU: externalHU,
						MaterialNum: matNum,
						MaterialDesc: matDesc
					});

					var oModel = new sap.ui.model.json.JSONModel();

					oModel.setData({
						HUSet: oRef.aData
					});

					var oModelCpy = new sap.ui.model.json.JSONModel();
					oModelCpy.setData({
						HUSet: oRef.aData
					});

					oRef.getOwnerComponent().setModel(oModel, "oListHU");
					oRef.getOwnerComponent().setModel(oModelCpy, "oListHUCpy");
					oRef.getView().byId("id1").setValue("");
				}

			}

			function cFailed() {
				MessageBox.error("HU Number Scan failed");

			}

		},
		onPressavailableBins: function () {
			var that = this;
			// var data = that.getView().byId("id1").getValue();
			// var data1 = that.getView().byId("idMat").getValue();
			var oWH = that.getView().byId("fgWareHouseid").getValue();
			if (oWH === "") {
				MessageBox.error("Please Select WareHouse Number");
			} else {
				var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
				oRouter.navTo("AvailableBins", {});
				this.odataService.read("/AvailableBinsFGRMSet?$filter=WareHouse eq '" + oWH +
					"' and Flag eq 'X' and Material eq '" + sap.ui.getCore().MatNum + "'", null,
					null, false,
					function (response) {
						that.result.items.push(response);
						that.getView().getModel("oAvailableBins").setData(response);
						that.getView().getModel("oAvailableBins").refresh(true);
					});
			}

		},
		onBinScan: function () {
			var that = this;
			var oWH = that.getView().byId("fgWareHouseid").getValue();
			var binNo = that.getView().byId("fgPutAwayBinId");
			if (oWH === "") {
				MessageBox.error("Please Select WareHouse Number");
				binNo.setValue("");
			} else {
				sap.ui.getCore().flag = false;
				var sHistory = History.getInstance();
				var sPreviousHash = sHistory.getPreviousHash();
				var HUnumber = that.getView().byId("id1").getValue();
				// var data1 = that.getView().byId("idMat").getValue();
				var binNo = that.getView().byId("fgPutAwayBinId").getValue();
				var fgPutAwayFlag = true;
				// setTimeout(function () {
				// if ((binNo.length >= 5) || (binNo.length >= 6) || (binNo.length >= 7) || (binNo.length >=
				// 		8) || (binNo.length >= 9) || (binNo.length >= 10)) {
				// if (binNo.length >= 10) {
					setTimeout(function () {
						if (sPreviousHash !== undefined) {

							// window.history.go(-1);
							// var oModelData = that.getView().getModel("oHUSelect").getData();
							that.odataService.read("/ScannedBinNumber?BinNumber='" + binNo + "'", null, null, false, function (response) {
								// console.log(response);

								if (binNo === "") {
									// 		var sRouter = sap.ui.core.UIComponent.getRouterFor(that);
									// sRouter.navTo("ScanHU",true);

								} else {
									if (response.Message === "valid Bin") {
										// that.odataService.read("/AvailableBinsFGRMSet?$filter=WareHouse eq '" + oWH +
										// 	"' and Flag eq 'X' and Material eq '" + sap.ui.getCore().MatNum + "'",
										// 	null, null, false,
										// 	function (response) {
										// 		console.log(response);
										// 		that.result.items.push(response);
										// 		that.getView().getModel("oAvailableBins").setData(response);
										// 		var temp = that.getView().getModel("oAvailableBins").getData();
										// 		for (var z = 0; z < temp.results.length; z++) {
										// 			if (binNo === temp.results[z].StorageBin) {
										// 				sap.ui.getCore().flag = true;
										// 				// sap.ui.getCore().FGPutAwaySubmit = true;
										// 				return sap.ui.getCore().flag;
										// 				// window.history.go(-1);
										// 				// MessageBox.error("Please select bins from availble bins only");
										// 			}

										// 		}
										// 		if (sap.ui.getCore().flag === false) {
										// 			MessageBox.error("Please select bins from available bins only", {
										// 				title: "Error",
										// 				Action: "CLOSE",
										// 				onClose: function (oAction) {

										// 					if (oAction === sap.m.MessageBox.Action.CLOSE) {
										// 						that.getView().byId("id2").setValue("");
										// 					}

										// 				}.bind(that),

										// 				styleClass: "",
										// 				initialFocus: null,
										// 				textDirection: sap.ui.core.TextDirection.Inherit
										// 			});
										// 			// MessageBox.Information("Please select bins from availble bins only");
										// 		}

										// 	});

										// var aData = that.getView().getModel("oListHU");

										// for (var i = aData.oData.HUSet.length - 1; i >= 0; i--) {
										// 	if (aData.oData.HUSet[i].ExternalHU === sap.ui.getCore().EXHU) {

										// 		// aData.oData.HUSet[i].binNo = binNo;
										// 		that.getView().getModel("oListHU").refresh(true);
										// 	}
										// }

									}
									// if (sap.ui.getCore().flag === true) {
									// 	// window.history.go(-1);
									// }

								}

								if (response.Message === "Invalid Bin") {
									MessageBox.error(response.Message, {
										title: "Error",
										onClose: null,
										styleClass: "",
										initialFocus: null,
										textDirection: sap.ui.core.TextDirection.Inherit
									});
									that.getView().byId("fgPutAwayBinId").setValue("");

								}

							});

							// window.history.go(-1);

						} else {

							var sRouter = sap.ui.core.UIComponent.getRouterFor(this);
							sRouter.navTo("ScanHU", true);
							// oRouter.navTo("ScanHU", true);

						}
					}, 1500);
				// }
				// else {
				// 	fgPutAwayFlag = false;
				// 	return fgPutAwayFlag;
				// }

			}

		},

		onSubmit: function (oEvent) {
			var oRef = this;
			var tempVar = oRef.getView().byId("id1").getValue();

			// else{
			var result = this.oList.getModel("oListHU").getData();
			if (result.length === 0) {
				MessageBox.error("Please Scan HU's");
			} else {
				var binNo = oRef.getView().byId("fgPutAwayBinId").getValue();
				var oWH = oRef.getView().byId("fgWareHouseid").getValue();
				if (binNo === "" || oWH === "") {
					MessageBox.error("Please Select/Scan Mandatory Fields");
				} else {
					var data = {};
					var flag = true;
					data.NavFGHeaderFGItems = [];
					$.each(result.HUSet, function (index, item) {
						var temp = {};
						// if (item.binNo === undefined) {
						// 	flag = true;
						// 	return flag;
						// } else {
						temp.ExternalHU = item.ExternalHU;
						temp.BinNumber = binNo;
						temp.Message = "";
						data.NavFGHeaderFGItems.push(temp);
						// }
					});

					if (flag === true) {
						this.odataService.create("/FGPutAwayHeaderSet", data, null, function (odata, response) {

							// if(data.NavFGHeaderFGItems.BinNumber===undefined){
							// 		MessageBox.information("Please scan Bin Number");
							// }
							// else{
							MessageBox.success("HU Transferred To Warehouse Successfully", {
								title: "Success",
								Action: "OK",
								onClose: function (oAction) {
									if (oAction === sap.m.MessageBox.Action.OK) {
										var oRef = this;
										var aData = oRef.getView().getModel("oListHU").getData();
										oRef.aData = [];
										oRef.getView().getModel("oListHU").setData(oRef.aData);
										oRef.getView().getModel("oListHU").refresh(true);
										oRef.getView().byId("idList").destroyItems();
										this.getView().byId("id1").setValue("");
										oRef.getView().byId("fgWareHouseid").setValue("");
										oRef.getView().byId("fgPutAwayBinId").setValue("");
										this.saveFlag = true;
										// var sHistory = History.getInstance();
										// var sPreviousHash = sHistory.getPreviousHash();
										// if (sPreviousHash !== undefined) {
										// 	window.history.go(-1);
										// }
									}
								}.bind(oRef),
								styleClass: "",
								initialFocus: null,
								textDirection: sap.ui.core.TextDirection.Inherit
							});
							// oRef.getView().byId("idSubmit").setEnabled(false);
							// sap.ui.getCore().FGPutAwaySubmit = false;
							// var data = oRef.getView().getModel("oListHU").getData();
							// oRef.data = [];
							// oRef.getView().getModel("oListHU").setData(oRef.data);
							// oRef.getView().getModel("oListHU").refresh(true);

						}, function (odata, response) {
							// var errorResponse = JSON.parse(odata.response.body);
							// var errorDetails = errorResponse.error.message.value;
							// var jsonParse = JSON.parse(odata.response.body);
							// var err = jsonParse.error;
							// // var parse1 = JSON.parse(err);
							// var msg = err.message.value;
							// MessageBox.error(msg);
							var errorResponse = JSON.parse(odata.response.body);
							var errorDetails = errorResponse.error.innererror.errordetails;
							// var errorString = "";
							var jsonParse = JSON.parse(odata.response.body);
							var err = jsonParse.error;
							var msg = err.message.value;
							$.each(errorDetails, function (index, item) {
								if (index != errorDetails.length - 1) {
									var code = item.code.trim();
									var i = code.indexOf('/');
									var HU = code.slice(0, i);
									msg = msg + "\n" + HU + " " + item.message + "\n";
								}

							});
							MessageBox.error(msg, {
								title: "Error",
								onClose: null,
								styleClass: "",
								initialFocus: null,
								textDirection: sap.ui.core.TextDirection.Inherit
							});
						});
					} else {
						MessageBox.information("Bin Number Missing");
					}
				}

			}

		},

		onDelete: function (oEvent) {

			var that = this;
			that.oModel = that.getView().getModel("oListHU");
			var data = that.getView().getModel("oListHU").getData(that.result);

			that.oList = that.byId("idList");

			var sItems = that.oList.getSelectedItems();

			if (sItems.length === 0) {
				MessageBox.information("Please Select a row to Delete");
				return;
			} else {

				for (var i = sItems.length - 1; i >= 0; i--) {
					var path = sItems[i].getBindingContext("oListHU").getPath();
					var idx = parseInt(path.substring(path.lastIndexOf('/') + 1));
					data.HUSet.splice(idx, 1);
				}
				that.getView().getModel("oListHU").refresh(true);
			}
			that.oList.removeSelections();
		},

		onPressBack: function () {
			var oRef = this;
			if (this.saveFlag === false) {
				var aData = oRef.getView().getModel("oListHU").getData();
				var aDataCpy = oRef.getView().getModel("oListHUCpy").getData();
				oRef.aData = [];
				oRef.aDataCpy = [];
				oRef.getView().getModel("oListHU").setData(oRef.aData);
				oRef.getView().getModel("oListHUCpy").setData(oRef.aDataCpy);
				oRef.getView().getModel("oListHU").refresh(true);
				oRef.getView().getModel("oListHUCpy").refresh(true);
				oRef.getView().byId("idList").destroyItems();
				this.getView().byId("id1").setValue("");
				oRef.getView().byId("fgWareHouseid").setValue("");
				oRef.getView().byId("fgPutAwayBinId").setValue("");
			}
			// sap.ui.getCore().FGPutAwaySubmit = false;
			var sRouter = sap.ui.core.UIComponent.getRouterFor(this);
			sRouter.navTo("Home", true);
		},
		//Filter Functionality Added

	});

});