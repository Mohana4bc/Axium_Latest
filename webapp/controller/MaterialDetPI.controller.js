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

	return Controller.extend("com.axium.Axium.controller.MaterialDetPI", {
		onInit: function () {

			var oRef = this;
			var data = [];
			oRef.odataService = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZWM_GW_RFSCREENS_SRV/", true);
			this.aData = [];
			oRef.odataService.read("/BinMaterialSet?$filter=BinNumber eq '" + sap.ui.getCore().bin + "'and StrLoc eq'" + sap.ui.getCore().stgloc +
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
			this.getView().addEventDelegate({
				onBeforeShow: jQuery.proxy(function (evt) {
					this.onBeforeShow(evt);
				}, this)
			});
			sap.ui.getCore().onSuccessfullSaveIntoZtable = false;

		},

		onBeforeShow: function () {
			var oRef = this;
			// sap.ui.getCore().onSuccessfullSaveIntoZtable = false;
			// var data = [];
			// oRef.odataService.read("/BinMaterialSet?$filter=BinNumber eq '" + sap.ui.getCore().bin + "'and StrLoc eq'" + sap.ui.getCore().stgloc +
			// 	"'and Plant eq'" + sap.ui.getCore().plnt + "'", null, null, false,
			// 	function (response) {

			// 		for (var i = 0; i < response.results.length; i++) {
			// 			data.push({
			// 				Material: response.results[i].Material,
			// 				MaterialDesc: response.results[i].MaterialDesc,
			// 				BatchNo: response.results[i].BatchNo,
			// 				Count: response.results[i].Count,
			// 				UOM: response.results[i].UOM,
			// 				Boxes: response.results[i].Boxes,
			// 				PerBoxQty: response.results[i].PerBoxQty,
			// 				PerPalQty: response.results[i].PerPalQty,
			// 				Indicator: response.results[i].Indicator,
			// 				Pallets: response.results[i].Pallets
			// 			});
			// 		}

			// 		var oModel = new sap.ui.model.json.JSONModel();
			// 		oModel.setData({
			// 			matDet: data
			// 		});
			// 		oRef.getOwnerComponent().setModel(oModel, "PhysicalInventory");

			// 	});

			var oTable = oRef.getView().byId("materialDet");
			oTable.removeSelections("true");

		},

		onSelectMaterial: function (oEvent) {
			var that = this;
			var model = that.getView().getModel("PhysicalInventory").getData();
			var selecteditem = oEvent.getSource().getSelectedItem();
			var path = selecteditem.getBindingContextPath();
			var index = path.split('/')[2];
			sap.ui.selectedIndex = parseFloat(index);

			var mat = model.matDet[sap.ui.selectedIndex].Material;
			var matdesc = model.matDet[sap.ui.selectedIndex].MaterialDesc;
			var batch = model.matDet[sap.ui.selectedIndex].BatchNo;
			sap.ui.getCore().count = model.matDet[sap.ui.selectedIndex].Count;
			var UOM = model.matDet[sap.ui.selectedIndex].UOM;
			sap.ui.getCore().box = model.matDet[sap.ui.selectedIndex].Boxes;
			var perBoxQty = model.matDet[sap.ui.selectedIndex].PerBoxQty;
			var perPalQty = model.matDet[sap.ui.selectedIndex].PerPalQty;
			sap.ui.getCore().pallets = model.matDet[sap.ui.selectedIndex].Pallets;
			sap.ui.getCore().indicator = model.matDet[sap.ui.selectedIndex].Indicator;

			var adata = {};

			adata.Material = mat;
			adata.MaterialDesc = matdesc;
			adata.BatchNo = batch;
			adata.Count = sap.ui.getCore().count;
			adata.UOM = UOM;
			adata.PerBoxQty = perBoxQty;
			adata.PerPalQty = perPalQty;
			adata.Boxes = sap.ui.getCore().box;
			adata.Pallets = sap.ui.getCore().pallets;
			adata.BinNumber = sap.ui.getCore().bin;

			var omodel = that.getView().getModel("Count");
			omodel.setData(adata);
			omodel.refresh();

			var sRouter = sap.ui.core.UIComponent.getRouterFor(that);
			sRouter.navTo("CountPI", true);

		},

		onNext: function () {
			var that = this;
			var flag = true;
			var model = that.getView().getModel("PhysicalInventory").getData();
			$.each(model, function (index, item) {

				var i;
				for (i = 0; i < item.length; i++) {

					if (item[i].Count === 0.000 || item[i].Count === 0) {
						flag = false;
					}
				}
			});

			if (flag === true) {
				if (sap.ui.getCore().binList === false && sap.ui.getCore().onSuccessfullSaveIntoZtable === true) {
					that.aData = [];

					that.odataService.read("/BinMaterialSet?$filter=BinNumber eq '" + sap.ui.getCore().bin + "'and StrLoc eq'" + sap.ui.getCore().stgloc +
						"'and Plant eq'" + sap.ui.getCore().plnt + "'", null, null, false,
						function (response) {

							for (var i = 0; i < response.results.length; i++) {
								that.aData.push({
									// Material: response.results[i].Material,
									// MaterialDesc: response.results[i].MaterialDesc,
									// BatchNo: response.results[i].BatchNo,
									// Count: response.results[i].Count,
									// UOM: response.results[i].UOM,
									// Boxes: response.results[i].Boxes,
									// PerBoxQty: response.results[i].PerBoxQty,
									// PerPalQty: response.results[i].PerPalQty,
									// Indicator: response.results[i].Indicator,
									// Pallets: response.results[i].Pallets
									bin: sap.ui.getCore().bin,
									status: sap.ui.getCore.phyInvenStatus,
									bat: response.results[i].BatchNo,
									mat: response.results[i].Material

								});
							}

						});

					// this.aData = [];
					// this.aData.push({
					// 	bin: sap.ui.getCore().bin,
					// 	status: sap.ui.getCore.phyInvenStatus
					// });

					var listData = that.getOwnerComponent().getModel("oListHU");
					var test1 = listData.getProperty("/BinSet");
					test1.push.apply(test1, that.aData);
					listData.setProperty("/BinSet", test1);
					that.getOwnerComponent().getModel("oListHU").refresh(true);
					sap.ui.getCore().onSuccessfullSaveIntoZtable = false;
					var sRouter = sap.ui.core.UIComponent.getRouterFor(that);
					sRouter.navTo("BinScanPI", true);
				} else {
					that.getOwnerComponent().getModel("oListHU").refresh(true);
					var sRouter = sap.ui.core.UIComponent.getRouterFor(that);
					sRouter.navTo("BinScanPI", true);
				}

			} else {
				MessageBox.information("Please Enter Quantity For All Materials");
			}

		},

		onPressBack: function () {
			var that = this;
			// this.aData.push({
			// 	binNo: sap.ui.getCore().bin
			// });

			// var oModel = new sap.ui.model.json.JSONModel();

			// oModel.setData({
			// 	BinSet: this.aData
			// });
			// that.getOwnerComponent().setModel(oModel, "oListHU");
			// that.getOwnerComponent().getModel("oListHU").refresh(true);

			if (sap.ui.getCore().binList === false && sap.ui.getCore().onSuccessfullSaveIntoZtable === true) {
				that.aData = [];

				that.odataService.read("/BinMaterialSet?$filter=BinNumber eq '" + sap.ui.getCore().bin + "'and StrLoc eq'" + sap.ui.getCore().stgloc +
					"'and Plant eq'" + sap.ui.getCore().plnt + "'", null, null, false,
					function (response) {

						for (var i = 0; i < response.results.length; i++) {
							that.aData.push({
								// Material: response.results[i].Material,
								// MaterialDesc: response.results[i].MaterialDesc,
								// BatchNo: response.results[i].BatchNo,
								// Count: response.results[i].Count,
								// UOM: response.results[i].UOM,
								// Boxes: response.results[i].Boxes,
								// PerBoxQty: response.results[i].PerBoxQty,
								// PerPalQty: response.results[i].PerPalQty,
								// Indicator: response.results[i].Indicator,
								// Pallets: response.results[i].Pallets
								bin: sap.ui.getCore().bin,
								status: sap.ui.getCore.phyInvenStatus,
								bat: response.results[i].BatchNo,
								mat: response.results[i].Material

							});
						}

					});

				// this.aData = [];
				// this.aData.push({
				// 	bin: sap.ui.getCore().bin,
				// 	status: sap.ui.getCore.phyInvenStatus
				// });

				var listData = that.getOwnerComponent().getModel("oListHU");
				var test1 = listData.getProperty("/BinSet");
				test1.push.apply(test1, that.aData);
				listData.setProperty("/BinSet", test1);
				that.getOwnerComponent().getModel("oListHU").refresh(true);
				sap.ui.getCore().onSuccessfullSaveIntoZtable = false;
				var sRouter = sap.ui.core.UIComponent.getRouterFor(that);
				sRouter.navTo("BinScanPI", true);
			} else {
				var sRouter = sap.ui.core.UIComponent.getRouterFor(that);
				sRouter.navTo("BinScanPI", true);

			}
			// that.onNext();

		}

	});

});