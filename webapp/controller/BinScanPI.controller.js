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

	return Controller.extend("com.axium.Axium.controller.BinScanPI", {
		onInit: function () {
			var oRef = this;
			var data = [];
			oRef.odataService = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZWM_GW_RFSCREENS_SRV/", true);
			this.aData = [];
			this.oList = this.getView().byId("idList");
			oRef.odataService.read("/CountItemsSet", null, null, false, function (response) {
				for (var i = 0; i < response.results.length; i++) {
					data.push({
						BinNumber: response.results[i].BinNumber,
						Status: response.results[i].Status

					});
				}
				var oModel = new sap.ui.model.json.JSONModel();
				oModel.setData({
					binDet: data
				});
				oRef.getOwnerComponent().setModel(oModel, "PlantStorage");

			});
			// this.getView().addEventDelegate({
			// 	onBeforeShow: jQuery.proxy(function (evt) {
			// 		this.onBeforeShow(evt);
			// 	}, this)
			// });
			sap.ui.getCore().bin = "";
			sap.ui.getCore.phyInvenStatus = "COUNTED";
			sap.ui.getCore().binList = false;
		},
		// onBeforeShow: function () {
		// 	var oRef = this;
		// 	// var aData = oRef.getView().getModel("oListHU");
		// 	// var bin = sap.ui.getCore().bin
		// 	this.aData.push({
		// 		binNo: sap.ui.getCore().bin
		// 	});

		// 	var oModel = new sap.ui.model.json.JSONModel();

		// 	oModel.setData({
		// 		BinSet: this.aData
		// 	});
		// 	oRef.getOwnerComponent().setModel(oModel, "oListHU");
		// },

		onBinScan: function () {
			var oRef = this;
			sap.ui.getCore().binList = false;
			sap.ui.getCore.phyInvenStatus = "COUNTED";
			var bin = oRef.getView().byId("bin").getValue();
			var dummyFlag = true;
			// if ((bin.length >= 5) || (bin.length >= 6) || (bin.length >= 7) || (bin.length >=
			// 		8) || (bin.length >= 9) || (bin.length >= 10)) {
			// if (bin.length <= 10) {
			setTimeout(function () {
				sap.ui.getCore().bin = bin;

				oRef.odataService.read("/ScannedBinNumber?BinNumber='" + bin + "'", null,
					null, false,
					function (data) {
						if (bin === "") {
							MessageBox.error("Please Scan Bin");
						} else if (data.Message === "valid Bin") {
							var data = [];
							oRef.aData = [];
							var binStatusFlag = false;
							var result = oRef.oList.getModel("oListHU").getData();
							$.each(result.BinSet, function (index, item) {
								if (item.bin === sap.ui.getCore().bin) {
									binStatusFlag = true;
									return false;
								} else {
									binStatusFlag = false;
								}

							});
							if (binStatusFlag === false) {
								oRef.odataService.read("/BinMaterialSet?$filter=BinNumber eq '" + sap.ui.getCore().bin + "'and StrLoc eq'" + sap.ui.getCore()
									.stgloc +
									"'and Plant eq'" + sap.ui.getCore().plnt + "'", null, null, false,
									function (response) {

										for (var i = 0; i < response.results.length; i++) {
											data.push({
												Material: response.results[i].Material,
												MaterialDesc: response.results[i].MaterialDesc,
												BatchNo: response.results[i].BatchNo,
												Count: response.results[i].Count,
												UOM: response.results[i].UOM,
												Boxes: response.results[i].Boxes,
												PerBoxQty: response.results[i].PerBoxQty,
												PerPalQty: response.results[i].PerPalQty,
												Indicator: response.results[i].Indicator,
												Pallets: response.results[i].Pallets
											});
										}

										var oModel = new sap.ui.model.json.JSONModel();
										oModel.setData({
											matDet: data
										});
										oRef.getOwnerComponent().setModel(oModel, "PhysicalInventory");

									});
								var sRouter = sap.ui.core.UIComponent.getRouterFor(oRef);
								sRouter.navTo("MaterialDetPI", true);
								sap.ui.getCore().bin = oRef.getView().byId("bin").getValue();
							} else {
								MessageBox.error("Bin Number Already Scanned,Please Check The List Below");
							}

						} else {
							sap.m.MessageBox.alert(data.Message, {
								title: "Information",
								onClose: null,
								styleClass: "",
								initialFocus: null,
								textDirection: sap.ui.core.TextDirection.Inherit
							});

						}

					});
				oRef.getView().byId("bin").setValue("");
			}, 1000);
			// } else {
			// 	dummyFlag = false;
			// 	return dummyFlag;
			// }

		},
		onBinPress: function (oEvent) {
			var bin = oEvent.getSource().getIntro();
			sap.ui.getCore.phyInvenStatus = oEvent.getSource().getTitle();
			sap.ui.getCore().binList = true;
			var oRef = this;
			var data = [];
			oRef.odataService.read("/BinMaterialSet?$filter=BinNumber eq '" + bin + "'and StrLoc eq'" + sap.ui.getCore().stgloc +
				"'and Plant eq'" + sap.ui.getCore().plnt + "'", null, null, false,
				function (response) {

					for (var i = 0; i < response.results.length; i++) {
						data.push({
							Material: response.results[i].Material,
							MaterialDesc: response.results[i].MaterialDesc,
							BatchNo: response.results[i].BatchNo,
							Count: response.results[i].Count,
							UOM: response.results[i].UOM,
							Boxes: response.results[i].Boxes,
							PerBoxQty: response.results[i].PerBoxQty,
							PerPalQty: response.results[i].PerPalQty,
							Indicator: response.results[i].Indicator,
							Pallets: response.results[i].Pallets
						});
					}

					var oModel = new sap.ui.model.json.JSONModel();
					oModel.setData({
						matDet: data
					});
					oRef.getOwnerComponent().setModel(oModel, "PhysicalInventory");

				});
			sap.ui.getCore().bin = bin;
			var sRouter = sap.ui.core.UIComponent.getRouterFor(oRef);
			sRouter.navTo("MaterialDetPI", true);
		},
		onSearchPressed: function () {
			var oRef = this;
			var binStatus = oRef.getView().byId("PIstatus").getValue();
			oRef.aData = [];
			this.odataService.read("/CountItemsSet?$filter=StrLoc eq '" + sap.ui.getCore().stgloc + "' and Plant eq '" + sap.ui.getCore().plnt +
				"' and Status eq '" + binStatus + "' ", null, null, false,
				function (response) {
					for (var i = 0; i < response.results.length; i++) {
						var temp = {};
						temp.bin = response.results[i].BinNumber;
						temp.status = response.results[i].Status;
						temp.mat = response.results[i].Material;
						temp.bat = response.results[i].Batch;
						oRef.aData.push(temp);
					}
					var oModel = new sap.ui.model.json.JSONModel();

					oModel.setData({
						BinSet: oRef.aData
					});
					oRef.getOwnerComponent().setModel(oModel, "oListHU");

				},
				function (odata, response) {

				}
			);

		},
		onRefreshPressed: function () {
			var oRef = this;
			oRef.getView().byId("PIstatus").setValue("");
			oRef.aData = [];
			this.odataService.read("/CountItemsSet?$filter=StrLoc eq '" + sap.ui.getCore().stgloc + "' and Plant eq '" + sap.ui.getCore().plnt +
				"' and Status eq '' ", null, null, false,
				function (response) {
					for (var i = 0; i < response.results.length; i++) {
						var temp = {};
						temp.bin = response.results[i].BinNumber;
						temp.status = response.results[i].Status;
						temp.mat = response.results[i].Material;
						temp.bat = response.results[i].Batch;
						oRef.aData.push(temp);
					}
					var oModel = new sap.ui.model.json.JSONModel();

					oModel.setData({
						BinSet: oRef.aData
					});
					oRef.getOwnerComponent().setModel(oModel, "oListHU");

				},
				function (odata, response) {

				}
			);

		},

		onPressBack: function () {
			var that = this;
			var aData = that.getView().getModel("oListHU").getData();
			that.aData = [];
			that.getView().getModel("oListHU").setData(that.aData);
			that.getView().getModel("oListHU").refresh(true);
			var sRouter = sap.ui.core.UIComponent.getRouterFor(that);
			sRouter.navTo("PlantStorageLoc", true);

		},
		onSubmit: function () {
			var data = {};
			var that = this;
			var myModel = that.getView().getModel("oListHU").getData();
			// var binStatusSubmitted = false;
			// that.getView().getModel("oListHU").getData().BinSet.length

			// var result = that.oList.getModel("oListHU").getData();
			// $.each(result.BinSet, function (index, item) {
			// 	if (item.status === "SUBMITTED") {
			// 		binStatusSubmitted = true;
			// 		return false;
			// 	} else {
			// 		binStatusSubmitted = false;
			// 	}

			// });
			// if (binStatusSubmitted === false) {
			if (that.getView().getModel("oListHU").getData().BinSet.length <= 0) {
				MessageBox.error("Bin Numberl list is empty to submit");
			} else {
				data.NavInvHeadInvItem = [];
				data.Plant = sap.ui.getCore().plnt;
				data.StorageLoc = sap.ui.getCore().stgloc;

				var sdata = that.getView().getModel("oListHU").getData(that.result);
				that.olist = that.byId("idList");
				var sItems = that.olist.getSelectedItems();
				var len = sItems.length;
				if (len <= 0) {
					$.each(myModel.BinSet, function (index, item) {
						var temp = {};
						temp.BinNumber = item.bin;
						temp.Status = item.status;
						data.NavInvHeadInvItem.push(temp);
					});
				} else {
					for (var i = sItems.length - 1; i >= 0; i--) {
						var path = sItems[i].getBindingContext("oListHU").getPath();
						var idx = parseInt(path.substring(path.lastIndexOf('/') + 1));
						var datas = {};
						datas.BinNumber = sdata.BinSet[idx].bin;
						datas.Status = sdata.BinSet[idx].status;
						data.NavInvHeadInvItem.push(datas);
					}
				}

				this.odataService.create("/InventoryHeaderSet", data, null, function (odata, response) {
						var msg;
						var bin;
						var msg1 = "";
						// var strMsg = {};
						// strMsg.strAry = [];
						var sMsg = [];
						if (response.data.NavInvHeadInvItem === null) {
							MessageBox.error("Bin/s Already Submitted");
						} else {
							$.each(response.data.NavInvHeadInvItem.results, function (index, item) {
								if (response.data.NavInvHeadInvItem.results.length === 1) {
									msg = response.data.NavInvHeadInvItem.results[index].Matnr;
									bin = response.data.NavInvHeadInvItem.results[index].BinNumber;
									msg1 = "Physical Inventory " + msg + " for Bin number " + bin + "\n";
									sMsg.push(msg1);
								}
								// if (index != response.data.NavInvHeadInvItem.results.length - 1) 
								else {
									msg = response.data.NavInvHeadInvItem.results[index].Matnr;
									bin = response.data.NavInvHeadInvItem.results[index].BinNumber;
									msg1 = "Physical Inventory " + msg + " for Bin number " + bin + "\n";
									sMsg.push(msg1);
								}

							});
							var msgLen = sMsg.length;
							var actualMsg = "";
							for (var i = 0; i < msgLen; i++) {
								actualMsg = actualMsg + sMsg[i].slice(0, 250);
							}
							MessageBox.success(actualMsg, {
								title: "Success",
								Action: "OK",
								onClose: function (oAction) {
									if (oAction === sap.m.MessageBox.Action.OK) {
										// oRef.getView().byId("idList").destroyItems();
										// var sHistory = History.getInstance();
										// var sPreviousHash = sHistory.getPreviousHash();
										// if (sPreviousHash !== undefined) {
										// 	window.history.go(-1);
										// }
										var aData = that.getView().getModel("oListHU").getData();
										that.aData = [];
										that.getView().getModel("oListHU").setData(that.aData);
										that.getView().getModel("oListHU").refresh(true);
										var sRouter = sap.ui.core.UIComponent.getRouterFor(that);
										sRouter.navTo("PlantStorageLoc", true);
									}
								}.bind(this),
								styleClass: "",
								initialFocus: null,
								textDirection: sap.ui.core.TextDirection.Inherit
							});
						}

					},
					function (odata, response) {
						MessageBox.error("Data not saved");
					}
				);
			}
			// } 
			// else {
			// 	MessageBox.error("Bin's with SUBMITTED status are not allowed to submit,");
			// }
		}

	});

});