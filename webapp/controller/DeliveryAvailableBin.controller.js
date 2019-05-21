sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/m/MessageBox"
], function (Controller, History, MessageBox) {
	"use strict";

	return Controller.extend("com.axium.Axium.controller.DeliveryAvailableBin", {

		onPressBack: function () {
			var sHistory = History.getInstance();
			var sPreviousHash = sHistory.getPreviousHash();
			if (sPreviousHash != undefined) {
				window.history.go(-1);
			} else {
				var sRouter = sap.ui.core.UIComponent.getRouterFor(this);
				sRouter.navTo("ScanQuantityView", true);
			}

		}

	});

});