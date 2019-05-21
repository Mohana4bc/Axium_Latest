sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/m/Button",
	"sap/m/Dialog",
	"sap/m/Text"
], function (Controller, History, Button, Dialog, Text) {
	"use strict";

	return Controller.extend("com.axium.Axium.controller.PutAway", {

		
		onInit: function () {
			this.odataService = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZWM_GW_RFSCREENS_SRV/", true);
			jQuery.sap.require("sap.m.MessageBox");
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
			if (sap.ui.getCore().clearPO === "true") {
				oRef.getView().byId("id1").setValue("");
			}

		},

		onNext: function () {

			var oRef = this;
			var tempVar = this.getView().byId("id1").getValue();
			if (tempVar === "") {
				var dialog = new Dialog({
					title: "Confirm",
					type: "Message",
					content: new Text({
						text: "Please Enter PO Number"
					}),
					beginButton: new Button({
						text: 'OK',
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
				this.odataService.read("/ScannedPO?PoNumber='" + tempVar + "'", {
					success: cSuccess,
					failed: cFailed
				});
			}

			function cSuccess(data, response) {
				if (data.Message === "Valid PO") {
					//MessageBox.alert("PO number is valid");
					var ponumber = oRef.getView().byId("id1").getValue();
					//var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
					var oRouter = oRef.getOwnerComponent().getRouter();
					oRouter.navTo("Material", {
						poNumber: ponumber
					});
					oRef.getView().byId("id1").setValue("");
				} else if (data.Message === "PO Not Released") {
					var dialog = new Dialog({
						title: "Confirm",
						type: "Message",
						content: new Text({
							text: "PO Number is Not Released"
						}),
						beginButton: new Button({
							text: 'OK',
							press: function () {
								oRef.getView().byId("id1").setValue("");
								dialog.close();
							}
						}),
						afterClose: function () {
							dialog.destroy();
						}
					});
					dialog.open();
				} else if (data.Message === "Invalid PO") {
					var dialog = new Dialog({
						title: "Confirm",
						type: "Message",
						content: new Text({
							text: "PO Number is Not Valid"
						}),
						beginButton: new Button({
							text: 'OK',
							press: function () {
								oRef.getView().byId("id1").setValue("");
								dialog.close();
							}
						}),
						afterClose: function () {
							dialog.destroy();
						}
					});
					dialog.open();
				}
			}

			function cFailed() {
				var dialog = new Dialog({
					title: "Confirm",
					type: "Message",
					content: new Text({
						text: "Could not read ScannedPoNumber"
					}),
					beginButton: new Button({
						text: 'OK',
						press: function () {
							dialog.close();
						}
					}),
					afterClose: function () {
						dialog.destroy();
					}
				});
				dialog.open();
			}
		},

		onPressBack: function () {
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.navTo("Home", {});
		}
	});

});