sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/m/MessageBox"
], function (Controller, History, MessageBox) {
	"use strict";

	return Controller.extend("com.axium.Axium.controller.WarehouseScreen", {

		onInit: function () {

			var that = this;

			this.odataService = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZWM_GW_RFSCREENS_SRV/", true);

			this.odataService.read("/MaterialsSet", null, null, false, function (response) {
				if (that.getView().byId("materialWarehouseScreenId") !== undefined) {
					that.getView().byId("materialWarehouseScreenId").destroyItems();
				}
				for (var i = 0; i < response.results.length; i++) {
					that.getView().byId("materialWarehouseScreenId").addItem(
						new sap.ui.core.ListItem({
							// text: response.results[i].Material,
							// key: response.results[i].Material,
							// additionalText: response.results[i].MaterialDesc

							text: response.results[i].MaterialDesc,
							key: response.results[i].MaterialDesc,
							additionalText: response.results[i].Material

						}));
				}
			});

			// this.odataService.read("/StorageTypeSet", null, null, false, function (response) {
			// 	if (that.getView().byId("storageTypeWarehouseScreenId") !== undefined) {
			// 		that.getView().byId("storageTypeWarehouseScreenId").destroyItems();
			// 	}
			// 	for (var i = 0; i < response.results.length; i++) {
			// 		that.getView().byId("storageTypeWarehouseScreenId").addItem(
			// 			new sap.ui.core.ListItem({
			// 				text: response.results[i].StorageTyp,
			// 				key: response.results[i].StorageTyp,
			// 				additionalText: response.results[i].StrTypDesc
			// 			}));
			// 	}
			// });

			// this.odataService.read("/StorageBinsSet", null, null, false, function (response) {
			// 	if (that.getView().byId("storageBinWarehouseScreenId") !== undefined) {
			// 		that.getView().byId("storageBinWarehouseScreenId").destroyItems();
			// 	}
			// 	for (var i = 0; i < response.results.length; i++) {
			// 		that.getView().byId("storageBinWarehouseScreenId").addItem(
			// 			new sap.ui.core.ListItem({
			// 				text: response.results[i].StorageBin,
			// 				key: response.results[i].StorageBin
			// 			}));
			// 	}
			// });

			this.odataService.read("/WareHouseSet", null, null, false, function (response) {
				if (that.getView().byId("warehouseWarehouseScreenId") !== undefined) {
					that.getView().byId("warehouseWarehouseScreenId").destroyItems();
				}
				for (var i = 0; i < response.results.length; i++) {
					that.getView().byId("warehouseWarehouseScreenId").addItem(
						new sap.ui.core.ListItem({
							text: response.results[i].WareHouseNumber,
							key: response.results[i].WareHouseNumber,
							additionalText: response.results[i].WHDesc
						}));
				}
			});

			// this.odataService.read("/PlantsSet", null, null, false, function (response) {
			// 	if (that.getView().byId("plantWarehouseScreenId") !== undefined) {
			// 		that.getView().byId("plantWarehouseScreenId").destroyItems();
			// 	}
			// 	for (var i = 0; i < response.results.length; i++) {
			// 		that.getView().byId("plantWarehouseScreenId").addItem(
			// 			new sap.ui.core.ListItem({
			// 				text: response.results[i].Plant,
			// 				key: response.results[i].Plant,
			// 				additionalText: response.results[i].PlantDesc
			// 			}));
			// 	}
			// });
			sap.ui.getCore().matNum = "";
			this.getView().addEventDelegate({
				onBeforeShow: jQuery.proxy(function (evt) {
					this.onBeforeShow(evt);
				}, this)
			});

		},
		onBeforeShow: function (oEvent) {
			var oRef = this;
			setTimeout(function () {
				var oInput = oRef.getView().byId("warehouseWarehouseScreenId");
				oInput.focus();
			}, 1000);
			oRef.getView().byId("materialWarehouseScreenId").setValue("");
			oRef.getView().byId("storageTypeWarehouseScreenId").setValue("");
			oRef.getView().byId("storageBinWarehouseScreenId").setValue("");
			oRef.getView().byId("warehouseWarehouseScreenId").setValue("");

			var oMat = oRef.getView().byId("materialWarehouseScreenId");
			var oStoragetype = oRef.getView().byId("storageTypeWarehouseScreenId");
			var oStoragebin = oRef.getView().byId("storageBinWarehouseScreenId");
			var oWH = oRef.getView().byId("warehouseWarehouseScreenId");

			oMat.clearSelection();
			// oStoragetype.clearSelection();
			// oStoragebin.clearSelection();
			oWH.clearSelection();
		},

		// getMaterialNumber: function (oEvent) {
		// 	sap.ui.getCore().matNum = this.getView().byId("materialWarehouseScreenId").getSelectedItem().getAdditionalText();
		// 	console.log(sap.ui.getCore().matNum);
		// 	this.selectStorageBin();
		// },

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf Z_AXIUMPLASTIC.view.WarehouseScreen
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf Z_AXIUMPLASTIC.view.WarehouseScreen
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf Z_AXIUMPLASTIC.view.WarehouseScreen
		 */
		//	onExit: function() {
		//
		//	}

		setEmpty: function () {
			this.getView().byId("materialWarehouseScreenId").setValue("");
			this.getView().byId("storageTypeWarehouseScreenId").setValue("");
			this.getView().byId("storageBinWarehouseScreenId").setValue("");
			this.getView().byId("warehouseWarehouseScreenId").setValue("");
			sap.ui.getCore().matNum = "";
			// this.getView().byId("plantWarehouseScreenId").setValue("");
		},

		onPressBack: function () {
			this.setEmpty();

			var sHistory = History.getInstance();
			var sPreviousHash = sHistory.getPreviousHash();
			if (sPreviousHash != undefined) {
				window.history.go(-1);
			} else {
				var sRouter = sap.ui.core.UIComponent.getRouterFor(this);
				sRouter.navTo("StockOverview", true);
			}
		},

		// selectStorageType: function (oEvent) {
		// 	var warehouseno = this.getView().byId("warehouseWarehouseScreenId").getSelectedItem().getText();
		// 	var that = this;
		// 	// MaterialsSet ? $filter = WareHouseNumber eq 'A01'
		// 	// and StorageTyp eq 'ZA2'
		// 	// var storagetype = "";
		// 	this.odataService.read("/StorageTypeSet?$filter=WareHouseNumber eq '" + warehouseno + "'", null, null, false, function (response) {
		// 		if (that.getView().byId("storageTypeWarehouseScreenId") !== undefined) {
		// 			that.getView().byId("storageTypeWarehouseScreenId").destroyItems();
		// 		}
		// 		console.log(response);
		// 		for (var i = 0; i < response.results.length; i++) {
		// 			that.getView().byId("storageTypeWarehouseScreenId").addItem(
		// 				new sap.ui.core.ListItem({
		// 					text: response.results[i].StorageTyp,
		// 					key: response.results[i].StorageTyp,
		// 					additionalText: response.results[i].StrTypDesc
		// 				}));
		// 		}
		// 	});

		// },

		// selectMaterial: function (oEvent) {
		// 	var warehouseno = this.getView().byId("warehouseWarehouseScreenId").getValue();
		// 	var storagetype = this.getView().byId("storageTypeWarehouseScreenId").getSelectedItem().getText();
		// 	var that = this;
		// 	this.odataService.read("/MaterialsSet?$filter=WareHouseNumber eq '" + warehouseno + "' and StorageTyp eq '" + storagetype + "'",
		// 		null, null, false,
		// 		function (response) {
		// 			if (that.getView().byId("materialWarehouseScreenId") !== undefined) {
		// 				that.getView().byId("materialWarehouseScreenId").destroyItems();
		// 			}
		// 			for (var i = 0; i < response.results.length; i++) {
		// 				that.getView().byId("materialWarehouseScreenId").addItem(
		// 					new sap.ui.core.ListItem({
		// 						// text: response.results[i].Material,
		// 						// key: response.results[i].Material,
		// 						// additionalText: response.results[i].MaterialDesc

		// 						text: response.results[i].MaterialDesc,
		// 						key: response.results[i].MaterialDesc,
		// 						additionalText: response.results[i].Material

		// 					}));
		// 			}
		// 		});

		// },

		// selectStorageBin: function (oEvent) {

		// 	var warehouseno = this.getView().byId("warehouseWarehouseScreenId").getValue();
		// 	var storagetypenumber = this.getView().byId("storageTypeWarehouseScreenId").getValue();
		// 	sap.ui.getCore().matNum = this.getView().byId("materialWarehouseScreenId").getSelectedItem().getAdditionalText();
		// 	// var materialnumber = this.getView().byId("materialWarehouseScreenId").getValue();
		// 	// var materialnumber = "";
		// 	var that = this;
		// 	setTimeout(function () {
		// 		that.odataService.read("/StorageBinsSet?$filter=WareHouseNumber eq '" + warehouseno + "' and StorageTyp eq '" +
		// 			storagetypenumber +
		// 			"' and Material eq '" + sap.ui.getCore().matNum + "'", null, null, false,
		// 			function (response) {
		// 				if (that.getView().byId("storageBinWarehouseScreenId") !== undefined) {
		// 					that.getView().byId("storageBinWarehouseScreenId").destroyItems();
		// 				}
		// 				for (var i = 0; i < response.results.length; i++) {
		// 					that.getView().byId("storageBinWarehouseScreenId").addItem(
		// 						new sap.ui.core.ListItem({
		// 							text: response.results[i].StorageBin,
		// 							key: response.results[i].StorageBin
		// 						}));
		// 				}
		// 			});
		// 	}, 1000);

		// 	// this.odataService.read("/PlantsSet", null, null, false, function (response) {
		// 	// 	if (that.getView().byId("plantWarehouseScreenId") !== undefined) {
		// 	// 		that.getView().byId("plantWarehouseScreenId").destroyItems();
		// 	// 	}
		// 	// 	for (var i = 0; i < response.results.length; i++) {
		// 	// 		that.getView().byId("plantWarehouseScreenId").addItem(
		// 	// 			new sap.ui.core.ListItem({
		// 	// 				text: response.results[i].Plant,
		// 	// 				key: response.results[i].Plant,
		// 	// 				additionalText: response.results[i].PlantDesc
		// 	// 			}));
		// 	// 	}
		// 	// });

		// },

		selectStorageBin: function () {
			var warehouseno = this.getView().byId("warehouseWarehouseScreenId").getSelectedItem().getText();
			// var storagetypenumber = "";
			// sap.ui.getCore().matNum = "";
			// var that = this;
			// setTimeout(function () {
			// 	that.odataService.read("/StorageBinsSet?$filter=WareHouseNumber eq '" + warehouseno + "' and StorageTyp eq '" +
			// 		storagetypenumber +
			// 		"' and Material eq '" + sap.ui.getCore().matNum + "'", null, null, false,
			// 		function (response) {
			// 			if (that.getView().byId("storageBinWarehouseScreenId") !== undefined) {
			// 				that.getView().byId("storageBinWarehouseScreenId").destroyItems();
			// 			}
			// 			for (var i = 0; i < response.results.length; i++) {
			// 				that.getView().byId("storageBinWarehouseScreenId").addItem(
			// 					new sap.ui.core.ListItem({
			// 						text: response.results[i].StorageBin,
			// 						key: response.results[i].StorageBin
			// 					}));
			// 			}
			// 		});
			// }, 1000);
		},
		SelectStorageType: function () {
			// var warehouseNumber = this.getView().byId("warehouseWarehouseScreenId").getValue();
			// var storageBin = this.getView().byId("storageBinWarehouseScreenId").getSelectedItem().getText();
			var that = this;
			var wmBinStockbinNo = that.getView().byId("storageBinWarehouseScreenId").getValue();
			var wmBinStockBinFlag = true;
			var sHistory = History.getInstance();
			var sPreviousHash = sHistory.getPreviousHash();
			// var that = this;
			// setTimeout(function () {
			// if ((wmBinStockbinNo.length >= 5) || (wmBinStockbinNo.length >= 6) || (wmBinStockbinNo.length >= 7) || (wmBinStockbinNo.length >=
			// 		8) || (wmBinStockbinNo.length >= 9) || (wmBinStockbinNo.length >= 10)) {
			// if (wmBinStockbinNo.length <= 10) {
			setTimeout(function () {
				if (sPreviousHash !== undefined) {

					// window.history.go(-1);
					// var oModelData = that.getView().getModel("oHUSelect").getData();
					that.odataService.read("/ScannedBinNumber?BinNumber='" + wmBinStockbinNo + "'", null, null, false, function (response) {
						// console.log(response);

						if (wmBinStockbinNo === "") {
							// 		var sRouter = sap.ui.core.UIComponent.getRouterFor(that);
							// sRouter.navTo("ScanHU",true);

						} else {
							if (response.Message === "valid Bin") {
								that.binSelectStorageType(wmBinStockbinNo);
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
							that.getView().byId("storageBinWarehouseScreenId").setValue("");

						}

					});

					// window.history.go(-1);

				} else {

					var sRouter = sap.ui.core.UIComponent.getRouterFor(this);
					sRouter.navTo("WarehouseScreen", true);
					// oRouter.navTo("ScanHU", true);

				}
			}, 1500);
			// } 
			// else {
			// 	wmBinStockBinFlag = false;
			// 	return wmBinStockBinFlag;
			// }

			// that.SelectMaterial();
		},
		binSelectStorageType: function (wmBinStockbinNo) {
			var that = this;
			var warehouseNumber = that.getView().byId("warehouseWarehouseScreenId").getValue();
			var storageBin = wmBinStockbinNo;
			setTimeout(function () {
				that.odataService.read("/AutoStorageTypeSet?$filter=BinNumber eq '" + storageBin + "' and WareHouseNumber eq '" +
					warehouseNumber +
					"'", null, null, false,
					function (response) {
						var strType = response.results[0].StorageType;
						that.getView().byId("storageTypeWarehouseScreenId").setValue(strType);
						that.odataService.read("/MaterialsSet?$filter=WareHouseNumber eq '" + warehouseNumber + "' and StorageTyp eq '" + strType +
							"'",
							null, null, false,
							function (response) {
								if (that.getView().byId("materialWarehouseScreenId") !== undefined) {
									that.getView().byId("materialWarehouseScreenId").destroyItems();
								}
								for (var i = 0; i < response.results.length; i++) {
									that.getView().byId("materialWarehouseScreenId").addItem(
										new sap.ui.core.ListItem({
											// text: response.results[i].Material,
											// key: response.results[i].Material,
											// additionalText: response.results[i].MaterialDesc

											text: response.results[i].MaterialDesc,
											key: response.results[i].MaterialDesc,
											// additionalText: response.results[i].Material
											additionalText: response.results[i].Materialz

										}));
								}
							});

						// if (that.getView().byId("storageBinWarehouseScreenId") !== undefined) {
						// 	that.getView().byId("storageBinWarehouseScreenId").destroyItems();
						// }
						// for (var i = 0; i < response.results.length; i++) {
						// 	that.getView().byId("storageBinWarehouseScreenId").addItem(
						// 		new sap.ui.core.ListItem({
						// 			text: response.results[i].StorageBin,
						// 			key: response.results[i].StorageBin
						// 		}));
						// }
					});
			}, 1000);
		},
		SelectMaterial: function () {
			sap.ui.getCore().matNum = this.getView().byId("materialWarehouseScreenId").getSelectedItem().getAdditionalText();
		},

		onSubmitWarehouseScreen: function () {
			var that = this;
			var flag = false;
			var matnr = this.getView().byId("materialWarehouseScreenId").getValue();
			// var matnr = sap.ui.getCore().matNum;
			var stype = this.getView().byId("storageTypeWarehouseScreenId").getValue();
			var sbin = this.getView().byId("storageBinWarehouseScreenId").getValue();
			var warehouse = this.getView().byId("warehouseWarehouseScreenId").getValue();
			// var werks = this.getView().byId("plantWarehouseScreenId").getValue();

			// if (warehouse === "" || stype === "" || sbin === "") {
			// 	flag = true;
			// 	sap.m.MessageBox.error("Please Enter All Mandatory Fields ", {
			// 		title: "Error"
			// 	});

			// 	return flag;
			// }

			if (warehouse === "") {
				flag = true;
				sap.m.MessageBox.error("Please Select WareHouse Number ", {
					title: "Error"
				});

				return flag;
			}

			if (flag === false) {
				// if (matnr === "") {
				// 	matnr = "";
				// } else {
				// matnr = sap.ui.getCore().matNum;
				// matnr = "";
				matnr = sap.ui.getCore().matNum;
				// }
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("WarehouseScreenOutput", {});
				this.odataService.read("/WareHouseStockSet?$filter=Material eq '" + matnr + "' and StorageTyp eq '" + stype +
					"' and StorageBin eq '" +
					sbin + "'and WareHouseNumber eq '" + warehouse + "'", null, null, false,
					function (response) {
						that.getView().getModel("WarehouseScreenOutputModel").setData(response.results);
						that.getView().getModel("WarehouseScreenOutputModel").refresh(true);
					});
			}

			that.setEmpty();

		}
	});

});