sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/m/MessageBox"
], function (Controller, History, MessageBox) {
	"use strict";

	return Controller.extend("com.axium.Axium.controller.Return", {

		onInit: function () {
			this.result = {};
			this.result.items = [];

			this.odataService = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZWM_GW_RFSCREENS_SRV/", true);
			this.getView().addEventDelegate({
				onBeforeShow: jQuery.proxy(function (evt) {
					this.onBeforeShow(evt);
				}, this)
			});
		},
		onBeforeShow: function (oEvent) {
			var oRef = this;
			setTimeout(function () {
				var oInput = oRef.getView().byId("id1");
				oInput.focus();
			}, 1000);
		},

		onPressBack: function () {
			// var sHistory = History.getInstance();
			// var sPreviousHash = sHistory.getPreviousHash();
			// if (sPreviousHash != undefined) {
			// 	window.history.go(-1);
			// } else {
				var sRouter = sap.ui.core.UIComponent.getRouterFor(this);
				sRouter.navTo("Home", true);
			// }
			this.getView().byId("id1").setValue("");

		},

		onNext: function () {
			var oRef = this;
			var tempVar = this.getView().byId("id1").getValue();
			this.odataService.read("/ScannedProductionOrderNo?ProductionOrder='" + tempVar + "'", {
				success: cSuccess,
				failed: cFailed
			});

			function cSuccess(data, response) {

				if (tempVar === "") {
					sap.m.MessageBox.alert("Please Scan Production order number", {
						title: "Information",
						onClose: null,
						styleClass: "",
						initialFocus: null,
						textDirection: sap.ui.core.TextDirection.Inherit
					});

				} else {

					if (data.Message === "Invalid Production Order") {
						oRef.getView().byId("id1").setValue("");
						sap.m.MessageBox.alert("Please Enter Valid Production Order Number", {
							title: "Information",
							onClose: null,
							styleClass: "",
							initialFocus: null,
							textDirection: sap.ui.core.TextDirection.Inherit
						});
					} else {
						//MessageBox.alert("PO number is valid");
						var ponumber = oRef.getView().byId("id1").getValue();
						//var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
						var oRouter = oRef.getOwnerComponent().getRouter();
						oRouter.navTo("BOMReturn", {
							poNumber: ponumber
						});
						oRef.getView().byId("id1").setValue("");
					}
					
				}
			}

			function cFailed() {
				sap.m.MessageBox.alert("Could not read Scanned Production Order Number", {
					title: "Information",
					onClose: null,
					styleClass: "",
					initialFocus: null,
					textDirection: sap.ui.core.TextDirection.Inherit
				});
			}
		}

	});

});