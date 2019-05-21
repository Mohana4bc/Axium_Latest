sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/m/Button",
	"sap/m/Dialog",
	"sap/m/Text"
], function (Controller, History, Button, Dialog, Text) {
	"use strict";

	return Controller.extend("com.axium.Axium.controller.BoxQuantity", {

		onInit: function () {
			var oRef = this;
			this.batchNumber = "";
			this.receivedQuantity = "";
			this.flag = "";
			this.index = "";
			this.odataService = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZWM_GW_RFSCREENS_SRV/", true);
			/*	var BoxQuantity = [];
				var oModel = new sap.ui.model.json.JSONModel();
				oModel.setData({
					boxQuantitySet: BoxQuantity
				});
				oRef.getOwnerComponent().setModel(oModel, "BoxDetails");*/
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("BoxQuantity").attachPatternMatched(this._onObjectMatched, this);
		},

		_onObjectMatched: function (oEvent) {
			var oRef = this;
			oRef.getView().addEventDelegate({
				onBeforeShow: jQuery.proxy(function (evt) {
					oRef.onBeforeShow(evt);
				}, oRef)
			});

			var oMatModel = oRef.getOwnerComponent().getModel("Materials").getData();
			this.batchNumber = oEvent.getParameter("arguments").batchNumber;
			if (this.batchNumber === "N") {
				this.batchNumber = "";
			}
			this.receivedQuantity = oEvent.getParameter("arguments").receivedQuantity;
			this.flag = oEvent.getParameter("arguments").flag;
			this.index = oEvent.getParameter("arguments").index;
			this.UOM = oMatModel.materialSet[this.index].UOM;
			var oModelBoxQuantity = this.getOwnerComponent().getModel("BoxDetails").getData();
			if (this.flag === "N") {
				this.flag = "Y";
				oModelBoxQuantity.boxQuantitySet.push({
					Number: 1,
					Value: this.receivedQuantity,
					Weight: this.UOM
				});
				this.getOwnerComponent().getModel("BoxDetails").refresh();
			}
		},

		onBeforeShow: function (oEvent) {
			var oRef = this;
			setTimeout(function () {
				var oInput = oRef.getView().byId("valueId");
				oInput.focus();
			}, 1000);
		},

		addRow: function () {
			var oModel = this.getOwnerComponent().getModel("BoxDetails");
			var length = oModel.getData().boxQuantitySet.length;
			/*var count = length + 1;
			oModel.getData().boxQuantitySet.push({
				Number: count,
				Value: ""
			});*/
			//var count = length + 1;
			oModel.getData().boxQuantitySet.push({
				Number: "",
				Value: "",
				Weight: this.UOM
			});
			oModel.refresh();
		},

		deleteRow: function (oEvent) {
			var path = oEvent.getParameter("listItem").getBindingContextPath();
			var index = path.slice(16, 17);
			var oModel = this.getOwnerComponent().getModel("BoxDetails");
			var x = oModel.getData().boxQuantitySet;
			x.splice(index, 1);
			oModel.refresh();
			/*var z = oModel.getData().boxQuantitySet;
			for (var i = 0; i < z.length; i++) {
				z[i].Number = +i + 1;
			}
			oModel.refresh();*/
		},
		onNext: function () {
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.navTo("MaterialDetailBoxQuantity", {
				flag: this.flag
			});
		}

		// onPressBack: function() {
		// 	/*var sHistory = History.getInstance();
		// 	var sPreviousHash = sHistory.getPreviousHash();
		// 	if (sPreviousHash != undefined) {
		// 		window.history.go(-1);
		// 	} else {
		// 		var sRouter = sap.ui.core.UIComponent.getRouterFor(this);
		// 		sRouter.navTo("Home", true);
		// 	}*/
		// 	var oRouter = this.getOwnerComponent().getRouter();
		// 	oRouter.navTo("MaterialDetailBoxQuantity", {
		// 		flag: this.flag
		// 	});
		// }
	});

});