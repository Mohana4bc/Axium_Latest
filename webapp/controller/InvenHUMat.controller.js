sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/m/MessageBox"
], function (Controller, History, MessageBox) {
	"use strict";

	return Controller.extend("com.axium.Axium.controller.InvenHUMat", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.axium.Axium.view.InvenHUMat
		 */
		onInit: function () {
			this.odataService = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZWM_GW_RFSCREENS_SRV/", true);
			this.aData = [];
			this.oList = this.getView().byId("idList");
			this.getView().addEventDelegate({
				onBeforeShow: jQuery.proxy(function (evt) {
					this.onBeforeShow(evt);
				}, this)
			});
			sap.ui.getCore().initialCount = 0;
			this.getView().byId("idHUMatCount").setValue(sap.ui.getCore().initialCount);

		},
		onBeforeShow: function () {
			this.getView().byId("idHUMatCount").setValue("0");
			var oRef = this;
			var aData = oRef.getView().getModel("InvenHUBin").getData();
			oRef.aData = [];
			oRef.getView().getModel("InvenHUBin").setData(oRef.aData);
			var oHU = oRef.getView().byId("idHUNum");
			var oMatNum = oRef.getView().byId("idMatNum");
			var oMatDesc = oRef.getView().byId("idInvenMatDesc");
			var oBatchNum = oRef.getView().byId("idBatchNum");
			var oQty = oRef.getView().byId("idQty");
			var oAddButton = oRef.getView().byId("idAdd");

			oRef.getView().byId("binId").setValue("");
			oRef.getView().byId("idDPlant").setValue("");
			oRef.getView().byId("idDSloc").setValue("");
			oRef.getView().byId("idMatNum").setValue("");
			oRef.getView().byId("idInvenMatDesc").setValue("");
			oRef.getView().byId("idBatchNum").setValue("");
			oRef.getView().byId("idQty").setValue("");

			if (sap.ui.getCore().InvenStrLocFlag === true) {
				oMatNum.setVisible(false);
				oMatDesc.setVisible(false);
				oBatchNum.setVisible(false);
				oQty.setVisible(false);
				oAddButton.setVisible(false);
				oHU.setVisible(true);
			} else {
				if (sap.ui.getCore().InvenStrLocFlag === false) {
					// oRef.odataService.read("/MaterialsSet?$filter=WareHouseNumber eq '" + sap.ui.getCore().WareHouseNum + "'",
					// 	null, null, false,
					// 	function (oData, oResponse) {
					// 		if (oRef.getView().byId("idMatNum") !== undefined) {
					// 			oRef.getView().byId("idMatNum").destroyItems();
					// 		}
					// 		for (var i = 0; i < oData.results.length; i++) {
					// 			oRef.getView().byId("idMatNum").addItem(
					// 				new sap.ui.core.ListItem({
					// 					text: oData.results[i].MaterialDesc,
					// 					//key: response.results[i].Material,
					// 					additionalText: oData.results[i].Material
					// 				}));
					// 		}
					// 	});
					// oRef.odataService.read("/MaterialsSet", null, null, false, function (response) {
					// 	if (oRef.getView().byId("idMatNum") !== undefined) {
					// 		oRef.getView().byId("idMatNum").destroyItems();
					// 	}
					// 	for (var i = 0; i < response.results.length; i++) {
					// 		oRef.getView().byId("idMatNum").addItem(
					// 			new sap.ui.core.ListItem({
					// 				// text: response.results[i].Material,
					// 				// key: response.results[i].Material,
					// 				// additionalText: response.results[i].MaterialDesc

					// 				text: response.results[i].MaterialDesc,
					// 				key: response.results[i].MaterialDesc,
					// 				additionalText: response.results[i].Material

					// 			}));
					// 	}
					// });
					oHU.setVisible(false);
					oMatNum.setVisible(true);
					oMatDesc.setVisible(true);
					oBatchNum.setVisible(true);
					oQty.setVisible(true);
					oAddButton.setVisible(true);
				}
			}
		},
		onHandleHUNumber: function () {
			var oRef = this;
			var huNumber = oRef.getView().byId("idHUNum").getValue();
			var aData = oRef.getView().getModel("InvenHUBin");
			var hFlag = false;
			// var huNumber = oRef.getView().byId("id1").getValue();
			// var materialNumber = oRef.getView().byId("id2").getValue();
			var srcPlant = sap.ui.getCore().PlantNumber;
			var srcStrLoc = sap.ui.getCore().StorageLocation;
			var bool = huNumber.startsWith("(");
			if (bool) {
				huNumber = huNumber.replace(/[^A-Z0-9]+/ig, "");
			} else {
				huNumber = huNumber;
			}
			var regExp = /^0[0-9].*$/;
			var test = regExp.test(huNumber);
			if (test || bool) {
				if (huNumber.length >= 20) {
					setTimeout(function () {
						huNumber = huNumber.replace(/[^A-Z0-9]+/ig, "");
						huNumber = huNumber.replace(/^0+/, '');
						oRef.getView().byId("idHUNum").setValue(huNumber);
						var indicator = "X";
						var aData = oRef.getOwnerComponent().getModel("InvenHUBin");
						if (aData !== undefined) {
							var aData = oRef.getOwnerComponent().getModel("InvenHUBin").getData();
							var extFlag = true;
							$.each(aData.HUBinSet, function (index, item) {

								if (item.ExternalHU === huNumber) {
									extFlag = false;
									oRef.getView().byId("idHUNum").setValue("");
									sap.m.MessageBox.alert("HU Number is already scanned", {
										title: "Information"
									});
								}
							});
						}
						// /ScannedHU?ExternalHU ="00000000002000000055" and Indicator ="X"
						// /ScannedHU?ExternalHU='" +hunumber+"'&Indicator='"+indicator+"' 

						if (extFlag) {
							// /sap/opu/odata/sap/ZWM_GW_RFSCREENS_SRV/ReconHUScanned/?ExternalHU='1111'&SourcePlant='1001'&SourceSLoc='FP01'

							oRef.odataService.read("ReconHUScanned/?ExternalHU='" + huNumber + "'&SourcePlant='" + srcPlant + "'&SourceSLoc='" +
								srcStrLoc + "'", {
									success: cSuccess,
									failed: cFailed
								});

						}

						function cSuccess(data) {

							if (data.Message === "Valid HU") {
								oRef.getHUDetails(huNumber);
								// oRef.aData.push({
								// 	ExternalHU: data.ExternalHU,
								// });
								// var oModel = new sap.ui.model.json.JSONModel();

								// oModel.setData({
								// 	HUBinSet: oRef.aData
								// });
								// oRef.getOwnerComponent().setModel(oModel, "InvenHUBin");
								// oRef.getView().byId("idHUNum").setValue("");

							} else if (huNumber === "") {

							} else {
								var msg = data.Message;
								MessageBox.error(msg);
								// MessageBox.error("Invalid HU");
								oRef.getView().byId("idHUNum").setValue("");
							}

						}

						function cFailed() {
							MessageBox.error("HU Number Scan Failed");
						}
					}, 1000);
				} else {
					hFlag = true;
					return hFlag;
				}
			} else {
				if (huNumber.length >= 18) {
					setTimeout(function () {
						huNumber = huNumber.replace(/[^A-Z0-9]+/ig, "");
						huNumber = huNumber.replace(/^0+/, '');
						oRef.getView().byId("idHUNum").setValue(huNumber);
						var indicator = "X";
						var aData = oRef.getView().getModel("InvenHUBin");
						if (aData !== undefined) {
							var aData = oRef.getOwnerComponent().getModel("InvenHUBin").getData();
							var extFlag = true;
							$.each(aData.HUBinSet, function (index, item) {

								if (item.ExternalHU === huNumber) {
									extFlag = false;
									oRef.getView().byId("idHUNum").setValue("");
									sap.m.MessageBox.alert("HU Number is already scanned", {
										title: "Information"
									});
								}
							});
						}
						// /HUQtyDetailsSet?$filter=ExternalHU eq '" + fnNumber + "' and Material eq '" + tempMat + "'"
						if (extFlag) {
							// ReconHUScanned/?ExternalHU='211111'&SourcePlant='1001'&SourceSLoc='FP01'
							oRef.odataService.read("ReconHUScanned/?ExternalHU='" + huNumber + "'&SourcePlant='" + srcPlant + "'&SourceSLoc='" +
								srcStrLoc + "'", {
									success: cSuccess,
									failed: cFailed
								});

						}

						function cSuccess(data) {

							if (data.Message === "Valid HU") {
								oRef.getHUDetails(huNumber);
								// oRef.aData.push({
								// 	ExternalHU: data.ExternalHU,
								// });
								// var oModel = new sap.ui.model.json.JSONModel();

								// oModel.setData({
								// 	HUBinSet: oRef.aData
								// });
								// oRef.getOwnerComponent().setModel(oModel, "InvenHUBin");
								// oRef.getView().byId("idHUNum").setValue("");

							} else if (huNumber === "") {

							} else {
								var msg = data.Message;
								MessageBox.error(msg);
								// MessageBox.error("Invalid HU");
								oRef.getView().byId("idHUNum").setValue("");
							}

						}

						function cFailed() {
							MessageBox.error("HU Number Scan Failed");
						}
					}, 1000);
				} else {
					hFlag = true;
					return hFlag;
				}
			}

		},
		getHUDetails: function (huNumber) {
			var oRef = this;
			var fnNumber = huNumber;
			var tempMat = "";
			this.odataService.read("/HUQtyDetailsSet?$filter=ExternalHU eq '" + fnNumber + "' and Material eq '" + tempMat + "'", {
				// this.odataService.read("/HUQtyDetailsSet?$filter=ExternalHU eq '00000000002000057331' and Material eq '000000003000000724' and ScannedQnty eq '0' and RequirementQnty eq '41600.000' and BinNumber eq 'U_ZONE'", {
				success: cSuccess,
				failed: cFailed
			});

			function cSuccess(data) {
				var huBatch = data.results[0].BatchNo;
				var hu = data.results[0].HU;
				var ScannedQty = data.results[0].ScannedQnty;
				var Material = data.results[0].Material;
				var MatDesc = data.results[0].MaterialDesc;
				// oRef.getView().byId("idBatchNum").setValue
				// idQty
				oRef.aData.push({
					ExternalHU: hu,
					Material: Material,
					MatDesc: MatDesc,
					StorageLocation: sap.ui.getCore().StorageLocation,
					Plant: sap.ui.getCore().PlantNumber,
					BatchNumber: huBatch,
					Quantity: ScannedQty
				});
				var oModel = new sap.ui.model.json.JSONModel();

				oModel.setData({
					HUBinSet: oRef.aData
				});
				oRef.getOwnerComponent().setModel(oModel, "InvenHUBin");
				oRef.getView().byId("idHUNum").setValue("");
				var huMatCount = oRef.getView().byId("idHUMatCount").getValue();
				sap.ui.getCore().initialCount = parseFloat(huMatCount) + 1;
				oRef.getView().byId("idHUMatCount").setValue(sap.ui.getCore().initialCount);

			}

			function cFailed() {

			}

		},
		// selectMaterial: function (oEvent) {
		// 	sap.ui.getCore().globalMat = this.getView().byId("idMatNum").getSelectedItem().getAdditionalText();
		// },
		invenMatValidate: function () {
			var oRef = this;
			var mat = oRef.getView().byId("idMatNum").getValue();
			oRef.odataService.read("/MaterialSet('" + mat + "')", null, null, false, function (oData, oResponse) {
					var matdesc = oResponse.data.MaterialDesc;
					oRef.getView().byId("idInvenMatDesc").setValue(matdesc);
					// oRef.MatScan(mat);
					// console.log(oResponse);
				},
				function (oData, oResponse) {
					// console.log(oResponse);
					var error = JSON.parse(oData.response.body);
					var errorMsg = error.error.message.value;
					if (errorMsg === "Material Not Found.") {
						oRef.getView().byId("idMatNum").setValue("");
						MessageBox.error("Please scan a correct material");
						oRef.getView().byId("idMatNum").setValue("");
						MessageBox.error("Please scan a correct material");
					}
				}
			);
		},
		onAddMaterial: function () {
			var oRef = this;
			var oMat = oRef.getView().byId("idMatNum").getValue();
			var oBatchNo = oRef.getView().byId("idBatchNum").getValue();
			var oQty = oRef.getView().byId("idQty").getValue();
			var oMatDesc = oRef.getView().byId("idInvenMatDesc").getValue();
			oRef.aData.push({
				ExternalHU: "",
				StorageLocation: sap.ui.getCore().StorageLocation,
				Plant: sap.ui.getCore().PlantNumber,
				BatchNumber: oBatchNo,
				Quantity: oQty,
				Material: oMat,
				MatDesc: oMatDesc
			});
			var oModel = new sap.ui.model.json.JSONModel();

			oModel.setData({
				HUBinSet: oRef.aData
			});
			oRef.getOwnerComponent().setModel(oModel, "InvenHUBin");
			oRef.getView().byId("idMatNum").setValue("");
			oRef.getView().byId("idInvenMatDesc").setValue("");
			oRef.getView().byId("idBatchNum").setValue("");
			oRef.getView().byId("idQty").setValue("");
			var huMatCount = oRef.getView().byId("idHUMatCount").getValue();
			sap.ui.getCore().initialCount = parseFloat(huMatCount) + 1;
			oRef.getView().byId("idHUMatCount").setValue(sap.ui.getCore().initialCount);

		},
		onPressBack: function () {
			var oRef = this;
			var oHU = oRef.getView().byId("idHUNum");
			var oMatNum = oRef.getView().byId("idMatNum");
			oRef.getView().byId("idHUMatCount").setValue("0");
			oRef.getView().byId("binId").setValue("");
			oRef.getView().byId("idDPlant").setValue("");
			oRef.getView().byId("idDSloc").setValue("");
			oRef.getView().byId("idMatNum").setValue("");
			oRef.getView().byId("idInvenMatDesc").setValue("");
			oRef.getView().byId("idBatchNum").setValue("");
			oRef.getView().byId("idQty").setValue("");

			var sRouter = sap.ui.core.UIComponent.getRouterFor(this);
			sRouter.navTo("InventoryPlntStrloc", true);
			oHU.setVisible(true);
			oMatNum.setVisible(true);
		},
		onDelete: function () {
			var that = this;
			that.oModel = that.getView().getModel("InvenHUBin");
			var data = that.getView().getModel("InvenHUBin").getData(that.result);

			that.oList = that.byId("idList");

			var sItems = that.oList.getSelectedItems();

			if (sItems.length === 0) {
				MessageBox.information("Please Select a row to Delete");
				return;
			} else {

				for (var i = sItems.length - 1; i >= 0; i--) {
					var path = sItems[i].getBindingContextPath();
					var idx = parseInt(path.substring(path.lastIndexOf('/') + 1));
					data.HUBinSet.splice(idx, 1);
				}
				that.getView().getModel("InvenHUBin").refresh(true);
				var huMatCount = that.getView().byId("idHUMatCount").getValue();
				sap.ui.getCore().initialCount = parseFloat(huMatCount) - 1;
				that.getView().byId("idHUMatCount").setValue(sap.ui.getCore().initialCount);
			}
			that.oList.removeSelections();
		},
		binNumberValidation: function () {
			var oRef = this;
			var oInvenbinFlag = false;
			var tempVar = oRef.getView().byId("binId").getValue();
			oRef.getView().byId("binId").setValue(tempVar);
			// if ((tempVar.length >= 5) || (tempVar.length >= 6) || (tempVar.length >= 7) || (tempVar.length >=
			// 		8) || (tempVar.length >= 9) || (tempVar.length >= 10)) {
			// if (tempVar.length <= 10) {
			setTimeout(function () {
				oRef.getView().byId("binId").setValue(tempVar);
				console.log(tempVar);

				// oRef.odataService.read("/ScannedBinNumber?BinNumber='" + tempVar + "'", {

				// 	success: cSuccess,
				// 	failed: cFailed
				// });

				// function cSuccess(data) {

				// 	if (data.Message === "valid Bin") {

				// 	} else if (tempVar === "") {
				// 		MessageBox.error("Please Scan Valid Bin Number");
				// 		oRef.getView().byId("binId").setValue("");
				// 	} else {
				// 		MessageBox.error("Invalid Bin");
				// 		oRef.getView().byId("binId").setValue("");
				// 	}

				// }

				// function cFailed() {
				// 	MessageBox.error("Bin Number Scan failed");
				// 	oRef.getView().byId("binId").setValue("");

				// }
			}, 1000);

			// } else {
			// 	// setTimeout(function () {
			// 	// 	MessageBox.error("Please Scan Valid Bin Number");
			// 	// 	oRef.getView().byId("idBin").setValue("");
			// 	// }, 1500);
			// 	oInvenbinFlag = true;
			// 	return oInvenbinFlag;
			// }

		},
		dPlantValidation: function () {
			var oRef = this;
			var dPlant = oRef.getView().byId("idDPlant").getValue();
			oRef.odataService.read("/ReconPlantValidation?Plant='" + dPlant + "'", {
				success: cSuccess,
				failed: cFailed
			});

			function cSuccess(data, response) {
				console.log(response);
				if (response.data.Message === "INVALID") {
					oRef.getView().byId("idDPlant").setValue("");
					MessageBox.error("Please scan a valid plant");
				}

			}

			function cFailed(data, response) {
				// console.log(response);
			}

		},
		dSlocValidation: function () {
			var oRef = this;
			var dPlant = oRef.getView().byId("idDPlant").getValue();
			var dSloc = oRef.getView().byId("idDSloc").getValue();
			// ReconSlocValidation ? Sloc = 'FP01' & Plant = '1001' / ReconSlocValidation ? Plant = '" + dPlant + "'
			// and Sloc = '" + dSloc + "'
			// "
			// /ReconSlocValidation?Sloc='" + dSloc + "'& Plant='" + dPlant + "'"
			// ReconSlocValidation?Sloc='FP01'&Plant='1001' 
			// "/ReconSlocValidation?Plant = '" + dPlant + "'&Sloc = '" + dSloc + "'"
			oRef.odataService.read("/ReconSlocValidation?Sloc='" + dSloc + "'&Plant='" + dPlant + "'", {
				success: cSuccess,
				failed: cFailed
			});

			function cSuccess(data, response) {
				console.log(response);
				if (response.data.Message === "INVALID") {
					oRef.getView().byId("idDSloc").setValue("");
					MessageBox.error("Please scan a valid storage location");
				} else if (response.data.Message === "Enter Plant and Storage Location") {
					oRef.getView().byId("idDSloc").setValue("");
					MessageBox.error("Please scan destination plant first");
				}

			}

			function cFailed(data, response) {

			}
		},
		onInvenSubmit: function () {
			var oBinNumber = this.getView().byId("binId").getValue();
			var oPlant = this.getView().byId("idDPlant").getValue();
			var oSloc = this.getView().byId("idDSloc").getValue();

			if (oBinNumber === "" || oPlant === "" || oSloc === "") {
				MessageBox.error("Please scan all the mandatory fields");
			} else {
				var data = {};
				data.NavReconHeadItems = [];
				var result = this.oList.getModel("InvenHUBin").getData();
				var oRef = this;
				data.Plant = sap.ui.getCore().PlantNumber;
				data.StorageLocation = sap.ui.getCore().StorageLocation;
				$.each(result.HUBinSet, function (index, item) {
					var temp = {};
					temp.Plant = sap.ui.getCore().PlantNumber;
					temp.StorageLoc = sap.ui.getCore().StorageLocation;
					temp.Batch = item.BatchNumber;
					temp.Scannedqty = item.Quantity;
					// temp.Scannedqty = "2";
					temp.Material = item.Material;
					temp.Handlingunit = item.ExternalHU;
					temp.Carrier = oBinNumber;
					temp.DPlant = oPlant;
					temp.DSloc = oSloc;
					data.NavReconHeadItems.push(temp);
				});
				this.odataService.create("/ReconAppHeaderSet", data, null, function (odata, response) {
					var matDoc = response.data.Carrier;
					var msg = "Goods Movement is Successfull, Material Document Number is: " + matDoc + "";
					// MessageBox.success("Data Saved");
					MessageBox.success(msg, {
						title: "Success",
						Action: "OK",
						onClose: function (oAction) {
							if (oAction === sap.m.MessageBox.Action.OK) {
								// oRef.getView().byId("idList").destroyItems();
								var sHistory = History.getInstance();
								var sPreviousHash = sHistory.getPreviousHash();
								if (sPreviousHash !== undefined) {
									oRef.getView().byId("binId").setValue("");
									oRef.getView().byId("idHUMatCount").setValue("0");
									window.history.go(-1);
								}
							}
						}.bind(oRef),
						styleClass: "",
						initialFocus: null,
						textDirection: sap.ui.core.TextDirection.Inherit
					});
				}, function (response) {
					var error = JSON.parse(response.response.body);
					var msg = error.error.innererror.errordetails[0].message;
					MessageBox.error(msg, {
						title: "Error",
						Action: "Close",
						onClose: function (oAction) {
							// if (oAction === "CLOSE") {
							// 	var sHistory = History.getInstance();
							// 	var sPreviousHash = sHistory.getPreviousHash();
							// 	if (sPreviousHash !== undefined) {
							// 		oRef.getView().byId("binId").setValue("");
							// 		oRef.getView().byId("idHUMatCount").setValue("0");
							// 		window.history.go(-1);
							// 	}
							// }
						}.bind(oRef),
						styleClass: "",
						initialFocus: null,
						textDirection: sap.ui.core.TextDirection.Inherit
					});
				});
			}
		}

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf com.axium.Axium.view.InvenHUMat
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf com.axium.Axium.view.InvenHUMat
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf com.axium.Axium.view.InvenHUMat
		 */
		//	onExit: function() {
		//
		//	}
	});

});