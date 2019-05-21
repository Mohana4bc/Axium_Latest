sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History"
], function (Controller, History) {
	"use strict";

	return Controller.extend("com.axium.Axium.controller.AvailableBinPick", {
		onInit: function () {
			this.getView().getModel("oAvailableBins");
			this.getView().byId("idtable1");
			this.getView().setModel("oAvailableBins");
		},

		onPressBack: function () {
			var sHistory = History.getInstance();
			var sPreviousHash = sHistory.getPreviousHash();
			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				var sRouter = sap.ui.core.UIComponent.getRouterFor(this);
				sRouter.navTo("BinScanPick", true);

			}

		}

	});

});