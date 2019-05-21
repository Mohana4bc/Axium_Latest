sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox"
], function (Controller, MessageBox) {
	"use strict";

	return Controller.extend("com.axium.Axium.controller.CountPI", {
		onInit: function () {
			var oRef = this;
			this.aData = [];
			oRef.odataService = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZWM_GW_RFSCREENS_SRV/", true);

			this.getView().addEventDelegate({
				onBeforeShow: jQuery.proxy(function (evt) {
					this.onBeforeShow(evt);
				}, this)
			});
			// sap.ui.getCore().saveFlag = false;
			// oRef.getView().byId("box").setValue("0");
			// oRef.getView().byId("pallet").setValue("0");

		},
		onBeforeShow: function () {
			var oRef = this;
			if (sap.ui.getCore().indicator === "X") {
				var count = oRef.getView().byId("count");
				var box = oRef.getView().byId("box");
				var pallet = oRef.getView().byId("pallet");
				count.setEnabled(true);
				count.setVisible(false);
				box.setVisible(true);
				pallet.setVisible(true);
			} else {
				var count = oRef.getView().byId("count");
				var box = oRef.getView().byId("box");
				var pallet = oRef.getView().byId("pallet");
				count.setVisible(true);
				box.setVisible(false);
				pallet.setVisible(false);
			}
			// oRef.onInit();

		},

		onPressBack: function () {
			var that = this;
			var sRouter = sap.ui.core.UIComponent.getRouterFor(that);
			sRouter.navTo("MaterialDetPI", true);
		},
		onSave: function () {
			var that = this;
			var model = that.getView().getModel("PhysicalInventory").getData();
			var perPalQty = model.matDet[sap.ui.selectedIndex].PerPalQty;
			var perBoxQty = model.matDet[sap.ui.selectedIndex].PerBoxQty;
			sap.ui.getCore().mat = that.getView().byId("matNum").getValue();
			sap.ui.getCore().matdesc = that.getView().byId("matDesc").getValue();
			sap.ui.getCore().batch = that.getView().byId("batch").getValue();
			sap.ui.getCore().uom = that.getView().byId("uom").getValue();
			sap.ui.getCore().box = that.getView().byId("box").getValue();
			sap.ui.getCore().pallet = that.getView().byId("pallet").getValue();
			var Bin = that.getView().byId("idBin").getValue();
			var materialNumber = that.getView().byId("matNum").getValue();
			var uom = that.getView().byId("uom").getValue();
			var count = that.getView().byId("count").getValue();
			var calculatedPallet = parseFloat(sap.ui.getCore().pallet) * parseFloat(perPalQty);
			var calculatedBox = parseFloat(sap.ui.getCore().box) * parseFloat(perBoxQty);

			if (sap.ui.getCore().box !== "" && sap.ui.getCore().pallet !== "") {
				// sap.ui.getCore().totalQuantity = parseFloat(sap.ui.getCore().count) + calculatedPallet + calculatedBox;
				sap.ui.getCore().totalQuantity = 0 + calculatedPallet + calculatedBox;
				sap.ui.getCore().totalQuantity = sap.ui.getCore().totalQuantity;
				// model.matDet[sap.ui.selectedIndex].Pallets = calculatedPallet;
				// model.matDet[sap.ui.selectedIndex].Boxes = calculatedBox;
				model.matDet[sap.ui.selectedIndex].Pallets = sap.ui.getCore().pallet;
				model.matDet[sap.ui.selectedIndex].Boxes = sap.ui.getCore().box;
				model.matDet[sap.ui.selectedIndex].Count = sap.ui.getCore().totalQuantity;
				that.getView().getModel("PhysicalInventory").refresh(true);
			}

			if (sap.ui.getCore().box === "" && sap.ui.getCore().pallet !== "") {
				// sap.ui.getCore().totalQuantity = parseFloat(sap.ui.getCore().count) + calculatedPallet;
				sap.ui.getCore().totalQuantity = 0 + calculatedPallet + calculatedBox;
				sap.ui.getCore().totalQuantity = sap.ui.getCore().totalQuantity;
				// model.matDet[sap.ui.selectedIndex].Pallets = calculatedPallet;
				// model.matDet[sap.ui.selectedIndex].Boxes = "0.000";
				model.matDet[sap.ui.selectedIndex].Boxes = sap.ui.getCore().box;
				model.matDet[sap.ui.selectedIndex].Count = sap.ui.getCore().totalQuantity;
				that.getView().getModel("PhysicalInventory").refresh(true);
			}

			if (sap.ui.getCore().box !== "" && sap.ui.getCore().pallet === "") {
				// sap.ui.getCore().totalQuantity = parseFloat(sap.ui.getCore().count) + calculatedBox;
				sap.ui.getCore().totalQuantity = 0 + calculatedPallet + calculatedBox;
				sap.ui.getCore().totalQuantity = sap.ui.getCore().totalQuantity;
				// model.matDet[sap.ui.selectedIndex].Pallets = "0.000";
				// model.matDet[sap.ui.selectedIndex].Boxes = calculatedBox;
				model.matDet[sap.ui.selectedIndex].Pallets = sap.ui.getCore().pallet;
				model.matDet[sap.ui.selectedIndex].Count = sap.ui.getCore().totalQuantity;
				that.getView().getModel("PhysicalInventory").refresh(true);
			}
			if (sap.ui.getCore().box === "0.000" && sap.ui.getCore().pallet === "0.000") {
				// sap.ui.getCore().totalQuantity = parseFloat(sap.ui.getCore().count) + parseFloat(count);
				sap.ui.getCore().totalQuantity = 0 + parseFloat(count);
				model.matDet[sap.ui.selectedIndex].Count = sap.ui.getCore().totalQuantity;
				that.getView().getModel("PhysicalInventory").refresh(true);
			}

			var data = {};
			data.CountItemsSet = [];
			data.BinNumber = Bin;
			// data.Status = "COUNTED";
			var temp = {};
			temp.BinNumber = Bin;
			temp.Material = materialNumber;
			temp.Batch = sap.ui.getCore().batch;
			temp.UOM = uom;
			temp.Status = sap.ui.getCore.phyInvenStatus;
			temp.Boxes = calculatedBox;
			temp.Plant = sap.ui.getCore().plnt;
			temp.StrLoc = sap.ui.getCore().stgloc;
			temp.Pallets = sap.ui.getCore().pallet;
			temp.Boxes = sap.ui.getCore().box;
			temp.Quantity = sap.ui.getCore().totalQuantity.toFixed(3);
			data.CountItemsSet.push(temp);
			this.odataService.create("/CountHeaderSet", data, null, function (odata, response) {
				console.log(response);
				sap.ui.getCore().Status = "COUNTED";
				sap.ui.getCore().onSuccessfullSaveIntoZtable = true;
				that.getView().getModel("PhysicalInventory").refresh(true);
				MessageBox.success("Data Successfully Saved", {
					title: "Success",
					Action: "OK",
					onClose: function (oAction) {
						if (oAction === sap.m.MessageBox.Action.OK) {
							// oRef.getView().byId("idList").destroyItems();
							// var sHistory = History.getInstance();
							// var sPreviousHash = sHistory.getPreviousHash();
							// if (sPreviousHash !== undefined) {
							// 	window.history.go(-1);
							// } else {
							var sRouter = sap.ui.core.UIComponent.getRouterFor(that);
							sRouter.navTo("MaterialDetPI", true);
							// }
						}
					}.bind(that),
					styleClass: "",
					initialFocus: null,
					textDirection: sap.ui.core.TextDirection.Inherit
				});

			}, function (odata, response) {
				console.log(response);
				MessageBox.error("Data Not Saved");
			});
			that.getView().byId("box").setValue("");
			that.getView().byId("pallet").setValue("");

		}
	});

});