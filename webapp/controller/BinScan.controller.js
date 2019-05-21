sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/m/MessageBox"
], function (Controller, History, MessageBox) {
	"use strict";

	return Controller.extend("com.axium.Axium.controller.BinScan", {

		onInit: function (oEvent) {
			this.result = {};
			this.result.items = [];
			// this.data = [];

			this.odataService = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZWM_GW_RFSCREENS_SRV/", true);

			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);

			oRouter.getRoute("BinScan").attachPatternMatched(this._onObjectMatched, this);
			this.getView().addEventDelegate({
				onBeforeShow: jQuery.proxy(function (evt) {
					this.onBeforeShow(evt);
				}, this)
			});
		},
		_onObjectMatched: function (oEvent) {
			var huJson = new sap.ui.model.json.JSONModel();
			var data = {};
			data.huNo = oEvent.getParameter("arguments").HUSelect;
			data.batch = oEvent.getParameter("arguments").Batch;
			data.matNum = oEvent.getParameter("arguments").MatNum;
			data.description = oEvent.getParameter("arguments").descp;
			huJson.setData(data);
			data.binNo = "";
			this.getView().setModel(huJson, "oHUSelect");
		},

		onBeforeShow: function (oEvent) {
			var oRef = this;
			setTimeout(function () {
				var oInput = oRef.getView().byId("id2");
				oInput.focus();
			}, 1000);
		},

		// onAfterRendering: function() {
		// 	var _self = this;
		// 	setTimeout(function() {
		// 		var oInput = _self.getView().byId("id2");
		// 		oInput.focus();
		// 	}, 1000);
		// },

		onPressavailableBins: function (oEvent) {
			//  var that = this;
			// var data = that.getView().byId("id1").getText();
			// 	// var HUSelected = oEvent.getSource().getTitle();
			// var oRouter = this.getOwnerComponent().getRouter();
			// oRouter.navTo("AvailableBins", {
			// 	HUSelect: data
			// });

			var that = this;
			var data = that.getView().byId("id1").getValue();
			var data1 = that.getView().byId("idMat").getValue();

			// aData = this.getView().byId("idtable").getModel("oTableModelAlias").getData();

			// var tempobj = that.getView().byId("id1").getData();
			// var tempobj = oEvent.getParameters().query;
			//var tempobj = that.selectedHU;
			var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
			oRouter.navTo("AvailableBins", {});
			this.odataService.read("/AvailableBinsFGRMSet?$filter=WareHouse eq '" + sap.ui.getCore().FGPutAwayWH +
				"' and Flag eq 'X' and Material eq '" + data1 + "'", null,
				null, false,
				function (response) {
					// console.log(response);
					that.result.items.push(response);
					that.getView().getModel("oAvailableBins").setData(response);
					that.getView().getModel("oAvailableBins").refresh(true);

				});

		},

		onBinScan: function () {
			var that = this;
			sap.ui.getCore().flag = false;
			var sHistory = History.getInstance();
			var sPreviousHash = sHistory.getPreviousHash();
			var HUnumber = that.getView().byId("id1").getValue();
			var data1 = that.getView().byId("idMat").getValue();
			setTimeout(function () {
				if (sPreviousHash !== undefined) {

					// window.history.go(-1);
					var oModelData = that.getView().getModel("oHUSelect").getData();
					that.odataService.read("/ScannedBinNumber?BinNumber='" + oModelData.binNo + "'", null, null, false, function (response) {
						// console.log(response);

						if (oModelData.binNo === "") {
							// 		var sRouter = sap.ui.core.UIComponent.getRouterFor(that);
							// sRouter.navTo("ScanHU",true);

						} else {
							if (response.Message === "valid Bin") {
								that.odataService.read("/AvailableBinsFGRMSet?$filter=WareHouse eq '" + sap.ui.getCore().FGPutAwayWH +
									"' and Flag eq 'X' and Material eq '" + data1 + "'",
									null, null, false,
									function (response) {
										console.log(response);
										that.result.items.push(response);
										that.getView().getModel("oAvailableBins").setData(response);
										var temp = that.getView().getModel("oAvailableBins").getData();
										for (var z = 0; z < temp.results.length; z++) {
											if (oModelData.binNo === temp.results[z].StorageBin) {
												sap.ui.getCore().flag = true;
												sap.ui.getCore().FGPutAwaySubmit = true;
												return sap.ui.getCore().flag;
												// window.history.go(-1);
												// MessageBox.error("Please select bins from availble bins only");
											}

										}
										if (sap.ui.getCore().flag === false) {
											MessageBox.error("Please select bins from availble bins only", {
												title: "Error",
												Action: "CLOSE",
												onClose: function (oAction) {

													if (oAction === sap.m.MessageBox.Action.CLOSE) {
														that.getView().byId("id2").setValue("");
													}

												}.bind(that),

												styleClass: "",
												initialFocus: null,
												textDirection: sap.ui.core.TextDirection.Inherit
											});
											// MessageBox.Information("Please select bins from availble bins only");
										}

									});

								var aData = that.getView().getModel("oListHU");

								for (var i = aData.oData.HUSet.length - 1; i >= 0; i--) {
									if (aData.oData.HUSet[i].ExternalHU === oModelData.huNo) {

										aData.oData.HUSet[i].binNo = oModelData.binNo;
										that.getView().getModel("oListHU").refresh(true);
									}
								}

							}
							if (sap.ui.getCore().flag === true) {
								window.history.go(-1);
							}

						}

						if (response.Message === "Invalid Bin") {
							MessageBox.error(response.Message, {
								title: "Error",
								onClose: null,
								styleClass: "",
								initialFocus: null,
								textDirection: sap.ui.core.TextDirection.Inherit
							});
							that.getView().byId("id2").setValue("");

						}

					});

					// window.history.go(-1);

				} else {

					var sRouter = sap.ui.core.UIComponent.getRouterFor(this);
					sRouter.navTo("ScanHU", true);
					// oRouter.navTo("ScanHU", true);

				}
			}, 1000);

		},
		onPressBack: function (oEvent) {

			var sRouter = sap.ui.core.UIComponent.getRouterFor(this);
			sRouter.navTo("ScanHU", true);
			sap.ui.getCore().FGPutAwaySubmit = false;

		}

	});

});