sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/Button",
	"sap/m/Dialog",
	"sap/m/Text",
	"sap/m/MessageBox"
], function (Controller, Button, Dialog, Text, MessageBox) {
	"use strict";

	return Controller.extend("com.axium.Axium.controller.HUorMatScan", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.axium.Axium.view.HUorMatScan
		 */
		onInit: function () {
			this.odataService = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZWM_GW_RFSCREENS_SRV/", true);
			this.aData = [];
			this.oList = this.getView().byId("idList");
			sap.ui.getCore().bintobinTransferIndicator = "";
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("HUorMatScan").attachPatternMatched(this._onObjectMatched, this);
		},
		_onObjectMatched: function (oEvent) {
			var oRef = this;
			oRef.warehouseNumber = oEvent.getParameter("arguments").warehouseNumber;
			oRef.sourceStorage = oEvent.getParameter("arguments").sourceStorage;
			oRef.sourceBin = oEvent.getParameter("arguments").sourceBin;
			sap.ui.getCore().bintobinTransferWareHouseNumber = oRef.warehouseNumber;
			sap.ui.getCore().bintobinTransferSourceStorage = oRef.sourceStorage;
			sap.ui.getCore().bintobinTransferSourceBin = oRef.sourceBin;
			oRef.whBintoBinFlag = oEvent.getParameter("arguments").whBintoBinFlag;

			if (oRef.whBintoBinFlag === "true") {
				oRef.getView().byId("matNumber").setVisible(false);
				oRef.getView().byId("materialDesc").setVisible(false);
				oRef.getView().byId("BatchNumber").setVisible(false);
				oRef.getView().byId("Quantity").setVisible(false);
				oRef.getView().byId("idMatAdd").setVisible(false);
				oRef.getView().byId("destinationStorage").setEnabled(true);
				sap.ui.getCore().bintobinTransferIndicator = "";

			} else {
				if (oRef.whBintoBinFlag === "false") {
					oRef.getView().byId("scanHUNumber").setVisible(false);
					oRef.getView().byId("matNumber").setVisible(true);
					oRef.getView().byId("materialDesc").setVisible(false);
					oRef.getView().byId("BatchNumber").setVisible(true);
					oRef.getView().byId("Quantity").setVisible(true);
					oRef.getView().byId("idMatAdd").setVisible(true);
					sap.ui.getCore().bintobinTransferIndicator = "X";
				}
			}

			this.odataService.read("/StorageTypeSet?$filter=WareHouseNumber eq '" + oRef.warehouseNumber + "'", null, null, false, function (
					oData,
					oResponse) {
					for (var i = 0; i < oData.results.length; i++) {
						oRef.getView().byId("destinationStorage").addItem(
							new sap.ui.core.ListItem({
								text: oData.results[i].StrTypDesc,
								additionalText: oData.results[i].StorageTyp
							}));
					}

				},
				function (oResponse) {
					sap.m.MessageBox.alert("Failed To load the Storage types", {
						title: "Information",
						onClose: null,
						styleClass: "",
						initialFocus: null,
						textDirection: sap.ui.core.TextDirection.Inherit
					});

				});

			oRef.odataService.read("/MaterialsSet?$filter=WareHouseNumber eq '" + oRef.warehouseNumber + "'",
				null, null, false,
				function (oData, oResponse) {
					if (oRef.getView().byId("matNumber") !== undefined) {
						oRef.getView().byId("matNumber").destroyItems();
					}
					for (var i = 0; i < oData.results.length; i++) {
						oRef.getView().byId("matNumber").addItem(
							new sap.ui.core.ListItem({
								text: oData.results[i].MaterialDesc,
								//key: response.results[i].Material,
								additionalText: oData.results[i].Material
							}));
					}
				});
		},
		validateBin: function () {
			var oRef = this;
			var storageType = oRef.getView().byId("destinationStorage").getValue();
			var destinationBin = oRef.getView().byId("DestinationBin").getValue();
			var destinationBinFlag = false;
			// if ((destinationBin.length >= 5) || (destinationBin.length >= 6) || (destinationBin.length >= 7) || (destinationBin.length >=
			// 		8) || (destinationBin.length >= 9) || (destinationBin.length >= 10)) {
			// if (destinationBin.length <= 10) {
			setTimeout(function () {
				if (storageType !== "") {
					var present = "";
					var binSelected = oRef.getView().byId("DestinationBin").getValue();
					var oBinModel = oRef.getOwnerComponent().getModel("Bins");
					var modelData = oBinModel.getData();
					// for (var i = 0; i < modelData.binSet.length; i++) {
					// 	if (modelData.binSet[i].StorageBin === binSelected) {
					// 		present = 'X';
					// 	}
					// }
					// if (present === "") {
					// 	sap.m.MessageBox.alert("Please Select a valid Bin", {
					// 		title: "Information",
					// 		onClose: null,
					// 		styleClass: "",
					// 		initialFocus: null,
					// 		textDirection: sap.ui.core.TextDirection.Inherit
					// 	});
					// 	oRef.getView().byId("DestinationBin").setValue("");
					// } 
					// else {
					sap.ui.getCore().TypeafterBin = "false";
					// }
				} else {
					if (destinationBin !== "") {
						oRef.odataService.read("/AutoStorageTypeSet?$filter=WareHouseNumber eq '" + oRef.warehouseNumber + "' and BinNumber eq '" +
							destinationBin +
							"'", null, null, false,
							function (oData, oResponse) {
								var destStorageType;
								for (var j = 0; j < oData.results.length; j++) {
									destStorageType = oData.results[j].StorageType;
								}
								oRef.getView().byId("destinationStorage").setValue(destStorageType);
								sap.ui.getCore().TypeafterBin = "true";
							},
							function (oResponse) {
								sap.m.MessageBox.alert("Failed to Load the storage type of scanned Bin", {
									title: "Information",
									onClose: null,
									styleClass: "",
									initialFocus: null,
									textDirection: sap.ui.core.TextDirection.Inherit
								});
							});
					}
				}
			}, 1000);
			// } 
			// else {
			// 	destinationBinFlag = true;
			// 	return destinationBinFlag;
			// }

		},
		HuScan: function () {
			var oRef = this;
			var hflag = false;
			var HuNumber = oRef.getView().byId("scanHUNumber").getValue();
			var bool = HuNumber.startsWith("(");
			if (bool) {
				HuNumber = HuNumber.replace(/[^A-Z0-9]+/ig, "");
			} else {
				HuNumber = HuNumber;
			}
			var regExp = /^0[0-9].*$/;
			var test = regExp.test(HuNumber);
			if (test || bool) {
				if (HuNumber.length >= 20) {
					setTimeout(function () {
						HuNumber = HuNumber.replace(/[^A-Z0-9]+/ig, "");
						HuNumber = HuNumber.replace(/^0+/, '');
						var flag = oRef.validateHu(HuNumber);
						if (flag === "") {
							sap.m.MessageBox.alert("HU Number is not Valid", {
								title: "Information",
								onClose: null,
								styleClass: "",
								initialFocus: null,
								textDirection: sap.ui.core.TextDirection.Inherit
							});
						} else {
							if (HuNumber !== "" && flag === "X") {
								oRef.odataService.read("/HUQtyDetailsSet?$filter=ExternalHU eq '" + HuNumber + "'",
									null, null, false,
									function (oData, oResponse) {
										// oRef.getView().byId("scanHUNumber").setEnabled(false);
										// oRef.getView().byId("matNumber").setValue(oData.results[0].Material);
										// oRef.material = oData.results[0].Material;
										// oRef.getView().byId("matNumber").setEnabled(false);
										// oRef.getView().byId("materialDesc").setVisible(true);
										// oRef.getView().byId("materialDesc").setValue(oData.results[0].MaterialDesc);
										// oRef.getView().byId("BatchNumber").setValue(oData.results[0].BatchNo);
										// oRef.getView().byId("Quantity").setValue(oData.results[0].ScannedQnty);
										// oRef.getView().byId("Quantity").setEnabled(false);
										// oRef.getView().byId("destinationStorage").setEnabled(true);

										var hu = oData.results[0].HU;
										var material = oData.results[0].Material;
										var materialDesc = oData.results[0].MaterialDesc;
										var BatchNo = oData.results[0].BatchNo;
										var scannedQty = oData.results[0].ScannedQnty;
										// sap.ui.getCore().huBinTransfer = "X";

										// oRef.getView().byId("idBatchNum").setValue
										// idQty
										oRef.aData.push({
											HU: hu,
											Material: material,
											MaterialDesc: materialDesc,
											BatchNo: BatchNo,
											ScannedQnty: scannedQty
										});
										var oModel = new sap.ui.model.json.JSONModel();

										oModel.setData({
											BinHUMatSet: oRef.aData
										});
										oRef.getOwnerComponent().setModel(oModel, "BinHUMatModel");
										oRef.getView().byId("scanHUNumber").setValue("");
										oRef.getView().byId("destinationStorage").setEnabled(true);
									},
									function (oResponse) {
										sap.m.MessageBox.alert("Failed to Read HUQtyDetailsSet", {
											title: "Information",
											onClose: null,
											styleClass: "",
											initialFocus: null,
											textDirection: sap.ui.core.TextDirection.Inherit
										});
									});
							} else {
								sap.m.MessageBox.alert("Please enter HU Number", {
									title: "Information",
									onClose: null,
									styleClass: "",
									initialFocus: null,
									textDirection: sap.ui.core.TextDirection.Inherit
								});
							}
						}
					}, 1000);
				} else {
					hflag = true;
					return hflag;
				}
			} else {
				if (HuNumber.length >= 18) {
					setTimeout(function () {
						HuNumber = HuNumber.replace(/[^A-Z0-9]+/ig, "");
						HuNumber = HuNumber.replace(/^0+/, '');
						var flag = oRef.validateHu(HuNumber);
						if (flag === "") {
							sap.m.MessageBox.alert("HU Number is not Valid", {
								title: "Information",
								onClose: null,
								styleClass: "",
								initialFocus: null,
								textDirection: sap.ui.core.TextDirection.Inherit
							});
						} else {
							if (HuNumber !== "" && flag === "X") {
								oRef.odataService.read("/HUQtyDetailsSet?$filter=ExternalHU eq '" + HuNumber + "'",
									null, null, false,
									function (oData, oResponse) {
										// oRef.getView().byId("scanHUNumber").setEnabled(false);
										// oRef.getView().byId("matNumber").setValue(oData.results[0].Material);
										// oRef.material = oData.results[0].Material;
										// oRef.getView().byId("matNumber").setEnabled(false);
										// oRef.getView().byId("materialDesc").setVisible(true);
										// oRef.getView().byId("materialDesc").setValue(oData.results[0].MaterialDesc);
										// oRef.getView().byId("BatchNumber").setValue(oData.results[0].BatchNo);
										// oRef.getView().byId("Quantity").setValue(oData.results[0].ScannedQnty);
										// oRef.getView().byId("Quantity").setEnabled(false);
										// oRef.getView().byId("destinationStorage").setEnabled(true);
										// /*oRef.getView().byId("DestinationBin").setEnabled(true);*/
										var hu = oData.results[0].HU;
										var material = oData.results[0].Material;
										var materialDesc = oData.results[0].MaterialDesc;
										var BatchNo = oData.results[0].BatchNo;
										var scannedQty = oData.results[0].ScannedQnty;
										// sap.ui.getCore().huBinTransfer = "X";

										// oRef.getView().byId("idBatchNum").setValue
										// idQty
										oRef.aData.push({
											HU: hu,
											Material: material,
											MaterialDesc: materialDesc,
											BatchNo: BatchNo,
											ScannedQnty: scannedQty
										});
										var oModel = new sap.ui.model.json.JSONModel();

										oModel.setData({
											BinHUMatSet: oRef.aData
										});
										oRef.getOwnerComponent().setModel(oModel, "BinHUMatModel");
										oRef.getView().byId("scanHUNumber").setValue("");
										oRef.getView().byId("destinationStorage").setEnabled(true);
									},
									function (oResponse) {
										sap.m.MessageBox.alert("Failed to Read HUQtyDetailsSet", {
											title: "Information",
											onClose: null,
											styleClass: "",
											initialFocus: null,
											textDirection: sap.ui.core.TextDirection.Inherit
										});
									});
							}
							// else {
							// 	sap.m.MessageBox.alert("Please enter HU Number", {
							// 		title: "Information",
							// 		onClose: null,
							// 		styleClass: "",
							// 		initialFocus: null,
							// 		textDirection: sap.ui.core.TextDirection.Inherit
							// 	});
							// }
						}
					}, 1000);
				} else {
					hflag = true;
					return hflag;
				}
			}

		},
		validateHu: function (HUNumber) {
			var oRef = this;
			var HuNumber = HUNumber;
			var flag;
			var aData = oRef.getOwnerComponent().getModel("BinHUMatModel");
			if (aData !== undefined) {
				var aData = oRef.getOwnerComponent().getModel("BinHUMatModel").getData();
				var extFlag = true;
				var duplicateHU = false;
				$.each(aData.BinHUMatSet, function (index, item) {

					if (item.HU === HUNumber) {
						extFlag = false;
						duplicateHU = true;
					}
				});
			}

			if (duplicateHU === true) {
				oRef.getView().byId("scanHUNumber").setValue("");
				sap.m.MessageBox.alert("HU Number is already scanned", {
					title: "Information"
				});
			} else {
				if (duplicateHU === false) {
					// oRef.odataService.read("/ScannedHU?ExternalHU='" + HuNumber + "'",
					// 	null, null, false,
					// 	function (oData, oResponse) {
					// 		var message = oData.Message;
					// 		if (message === "Valid HU") {
					// 			flag = "X";
					// 		} else {
					// 			flag = "";
					// 		}
					// 	},
					// 	function (oResponse) {
					// 		sap.m.MessageBox.alert("Failed to validate HU Number", {
					// 			title: "Information",
					// 			onClose: null,
					// 			styleClass: "",
					// 			initialFocus: null,
					// 			textDirection: sap.ui.core.TextDirection.Inherit
					// 		});
					// 	});
					//commeted for latest change in oData service
					oRef.odataService.read("/BinTOBinHUScanned?ExternalHU='" + HuNumber + "'", null, null, false,
						function (oData, oResponse) {
							var message = oResponse.data.Message;
							console.log(oResponse);
							if (message === "HU Pending for Putaway") {
								// flag = "";
								oRef.getView().byId("scanHUNumber").setValue("");
								MessageBox.error(message);
							} else {
								if (message === "Valid HU") {
									flag = "X";
								} else {
									flag = "";
								}

							}

						},
						function (oResponse) {

						}
					);
					return flag;
				}
			}

			// }, 1000);

		},
		MatScan: function () {
			var oRef = this;
			var Indicator,
				materialScan,
				materialDesc, UOM;
			var material = oRef.getView().byId("matNumber").getSelectedItem().getAdditionalText();
			sap.ui.getCore().globalMaterialNumber = material;
			oRef.material = material;
			var flag = oRef.valiateMaterial(material);
			if (flag === "") {
				sap.m.MessageBox.alert("Material Number is Not Valid", {
					title: "Information",
					onClose: null,
					styleClass: "",
					initialFocus: null,
					textDirection: sap.ui.core.TextDirection.Inherit
				});
			} else {
				if (material !== "" && flag === "X") {
					oRef.odataService.read("/MaterialDetailsSet('" + material + "')",
						null, null, false,
						function (oData, oResponse) {
							Indicator = oData.Indicator;
							materialScan = oData.Material;
							materialDesc = oData.MaterialDesc;
							UOM = oData.UOM;
							if (Indicator === "") {
								oRef.getView().byId("BatchNumber").setVisible(false);
							} else {
								oRef.getView().byId("BatchNumber").setVisible(true);
							}
							oRef.getView().byId("scanHUNumber").setVisible(false);
							oRef.getView().byId("materialDesc").setValue("");
							oRef.getView().byId("materialDesc").setVisible(false);
							oRef.getView().byId("BatchNumber").setEnabled(true);
							oRef.getView().byId("Quantity").setEnabled(true);
							oRef.getView().byId("UOM").setVisible(true);
							oRef.getView().byId("UOM").setValue(UOM);
							oRef.getView().byId("destinationStorage").setEnabled(true);
							/*oRef.getView().byId("DestinationBin").setEnabled(true);*/
							oRef.Indicator = Indicator;
							oRef.material = materialScan;
							oRef.UOM = UOM;
						},
						function (oResponse) {
							sap.m.MessageBox.alert("Failed to read Material DetailSet", {
								title: "Information",
								onClose: null,
								styleClass: "",
								initialFocus: null,
								textDirection: sap.ui.core.TextDirection.Inherit
							});
						});
				} else {
					sap.m.MessageBox.alert("Please Enter Material Number", {
						title: "Information",
						onClose: null,
						styleClass: "",
						initialFocus: null,
						textDirection: sap.ui.core.TextDirection.Inherit
					});
				}
			}

		},
		valiateMaterial: function (material) {
			var oRef = this;
			var matNumber = material;
			var flag;
			if (matNumber !== "") {
				oRef.odataService.read("/MaterialDetailsSet('" + matNumber + "')",
					null, null, false,
					function (oData, oResponse) {
						var message = oData.Material;
						if (message === "Invalid Material") {
							flag = "";
						} else {
							flag = "X";
						}
					},
					function (oResponse) {
						sap.m.MessageBox.alert("Failed to validate Material Number", {
							title: "Information",
							onClose: null,
							styleClass: "",
							initialFocus: null,
							textDirection: sap.ui.core.TextDirection.Inherit
						});
					});
				return flag;
			} else {
				sap.m.MessageBox.alert("Please select Material Number", {
					title: "Information",
					onClose: null,
					styleClass: "",
					initialFocus: null,
					textDirection: sap.ui.core.TextDirection.Inherit
				});
			}
		},
		onAddMaterial: function () {
			var oRef = this;
			var materialDesc = oRef.getView().byId("matNumber").getValue();
			// var material = oRef.getView().byId("matNumber").getSelectedItem().getAdditionalText();
			// var materialDesc = oRef.getView().byId("materialDesc").getValue();
			var BatchNo = oRef.getView().byId("BatchNumber").getValue();
			var scannedQty = oRef.getView().byId("Quantity").getValue();
			// sap.ui.getCore().huBinTransfer = "";

			if (BatchNo === "") {
				oRef.aData.push({
					HU: "",
					Material: sap.ui.getCore().globalMaterialNumber,
					MaterialDesc: materialDesc,
					BatchNo: BatchNo,
					ScannedQnty: scannedQty
				});
				var oModel = new sap.ui.model.json.JSONModel();

				oModel.setData({
					BinHUMatSet: oRef.aData
				});
				oRef.getOwnerComponent().setModel(oModel, "BinHUMatModel");
				oRef.getView().byId("matNumber").setValue("");
				oRef.getView().byId("materialDesc").setValue("");
				oRef.getView().byId("BatchNumber").setValue("");
				oRef.getView().byId("Quantity").setValue("");
			} else {
				var myBatchValidation = oRef.batchValidation(BatchNo);

				if (myBatchValidation === "X") {
					oRef.aData.push({
						HU: "",
						Material: sap.ui.getCore().globalMaterialNumber,
						MaterialDesc: materialDesc,
						BatchNo: BatchNo,
						ScannedQnty: scannedQty
					});
					var oModel = new sap.ui.model.json.JSONModel();

					oModel.setData({
						BinHUMatSet: oRef.aData
					});
					oRef.getOwnerComponent().setModel(oModel, "BinHUMatModel");
					oRef.getView().byId("matNumber").setValue("");
					oRef.getView().byId("materialDesc").setValue("");
					oRef.getView().byId("BatchNumber").setValue("");
					oRef.getView().byId("Quantity").setValue("");
				} else {
					sap.m.MessageBox.alert("Batch Number is Not Valid", {
						title: "Information",
						onClose: null,
						styleClass: "",
						initialFocus: null,
						textDirection: sap.ui.core.TextDirection.Inherit
					});
					oRef.getView().byId("BatchNumber").setValue("");
				}
			}

		},
		onDelete: function () {
			var that = this;
			that.oModel = that.getView().getModel("BinHUMatModel");
			var data = that.getView().getModel("BinHUMatModel").getData(that.result);

			that.oList = that.byId("idList");

			var sItems = that.oList.getSelectedItems();

			if (sItems.length === 0) {
				MessageBox.information("Please Select a Row to Delete");
				return;
			} else {

				for (var i = sItems.length - 1; i >= 0; i--) {
					var path = sItems[i].getBindingContextPath();
					var idx = parseInt(path.substring(path.lastIndexOf('/') + 1));
					data.BinHUMatSet.splice(idx, 1);
				}
				that.getView().getModel("BinHUMatModel").refresh(true);
				// var huMatCount = that.getView().byId("idHUMatCount").getValue();
				// sap.ui.getCore().initialCount = parseFloat(huMatCount) - 1;
				// that.getView().byId("idHUMatCount").setValue(sap.ui.getCore().initialCount);
			}
			that.oList.removeSelections();
		},

		onAvailableBin: function () {
			var oRef = this;
			var flagHu = "";
			var oModel = new sap.ui.model.json.JSONModel();
			var Bin = [];
			oModel.setData({
				binSet: Bin
			});
			oRef.getOwnerComponent().setModel(oModel, "Bins");
			var oBinModel = oRef.getOwnerComponent().getModel("Bins");
			var modelData = oBinModel.getData();
			oRef.destinationStorage = this.getView().byId("destinationStorage").getSelectedItem().getAdditionalText();
			var HUno = oRef.getView().byId("scanHUNumber").getValue();
			var matNo = oRef.getView().byId("matNumber").getValue();
			// if (HUno !== undefined && HUno !== "") {
			// 	flagHu = 'X';
			// }
			flagHu = sap.ui.getCore().huBinTransfer;
			oRef.odataService.read("/AvailableBinsFGRMSet?$filter=WareHouse eq '" + oRef.warehouseNumber + "' and Flag eq '" + flagHu +
				"' and Material eq '" + matNo + "' and StorageTyp eq '" + oRef.destinationStorage + "'", null, null, false,
				function (oData, oResponse) {
					for (var i = 0; i < oData.results.length; i++) {
						modelData.binSet.push({
							StorageBin: oData.results[i].StorageBin,
							AvailSpace: oData.results[i].AvailSpace,
							UOMBIN: oData.results[i].UOM,
						});
					}
					oBinModel.refresh();
				},
				function (oResponse) {
					sap.m.MessageBox.alert("Failed to Load the Bins", {
						title: "Information",
						onClose: null,
						styleClass: "",
						initialFocus: null,
						textDirection: sap.ui.core.TextDirection.Inherit
					});
				});
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.navTo("BinTransferBins", {});
		},

		onSave: function () {
			var oRef = this;
			var oResult = {};
			var SourceBin = oRef.sourceBin;
			var ExternalHU = oRef.getView().byId("scanHUNumber").getValue();
			if (ExternalHU === undefined) {
				ExternalHU = "";
			}
			var DestinationBin = oRef.getView().byId("DestinationBin").getValue();
			//var Material = oRef.getView().byId("matNumber").getValue();
			var Material = oRef.material;
			var RequirementQnty = oRef.getView().byId("Quantity").getValue();
			var BatchNo = oRef.getView().byId("BatchNumber").getValue();
			if (BatchNo === undefined) {
				BatchNo = "";
			}
			var WareHouseNumber = oRef.warehouseNumber;
			var SourceStrTyp = oRef.sourceStorage;
			if (sap.ui.getCore().TypeafterBin === "true") {
				var DestinationStrTyp = oRef.getView().byId("destinationStorage").getValue();
			} else {
				var DestinationStrTyp = oRef.getView().byId("destinationStorage").getSelectedItem().getAdditionalText();
			}
			var UOM = oRef.UOM;
			var batchValidate;
			if (UOM === undefined) {
				UOM = "";
			}
			if (sap.ui.getCore().bintobinTransferSourceBin === DestinationBin) {
				sap.m.MessageBox.alert("Source and Destination Bin cannot be same", {
					title: "Information",
					onClose: null,
					styleClass: "",
					initialFocus: null,
					textDirection: sap.ui.core.TextDirection.Inherit
				});
				oRef.getView().byId("DestinationBin").setValue("");
			} else {
				// if (SourceBin !== "" && ExternalHU !== undefined && DestinationBin !== "" && Material !== "" && BatchNo !==
				// 	undefined && WareHouseNumber !== "" && SourceStrTyp !== "" && DestinationStrTyp !== "") {
				// if (BatchNo !== "") {
				// 	batchValidate = oRef.batchValidation(BatchNo);
				// } else {
				// 	batchValidate = "X";
				// }
				// if (batchValidate === "X") {
				var data = {};
				data.BinToBinSet = [];
				data.Indicator = sap.ui.getCore().bintobinTransferIndicator;
				var result = this.oList.getModel("BinHUMatModel").getData();
				$.each(result.BinHUMatSet, function (index, item) {
					var temp = {};
					temp.Indicator = sap.ui.getCore().bintobinTransferIndicator;
					temp.SourceBin = sap.ui.getCore().bintobinTransferSourceBin;
					temp.ExternalHU = item.HU;
					temp.DestinationBin = DestinationBin;
					temp.Material = item.Material;
					temp.RequirementQnty = item.ScannedQnty;
					temp.BatchNo = item.BatchNo;
					temp.WareHouseNumber = sap.ui.getCore().bintobinTransferWareHouseNumber;
					temp.SourceStrTyp = sap.ui.getCore().bintobinTransferSourceStorage;
					temp.DestinationStrTyp = DestinationStrTyp;
					data.BinToBinSet.push(temp);
				});

				// 			sap.ui.getCore().bintobinTransferWareHouseNumber = oRef.warehouseNumber;
				// sap.ui.getCore().bintobinTransferSourceStorage = oRef.sourceStorage;
				// sap.ui.getCore().bintobinTransferSourceBin = oRef.sourceBin;

				// oResult.SourceBin = SourceBin;
				// oResult.ExternalHU = ExternalHU;
				// oResult.DestinationBin = DestinationBin;
				// oResult.Material = Material;
				// oResult.RequirementQnty = RequirementQnty;
				// oResult.UOM = UOM;
				// oResult.BatchNo = BatchNo;
				// oResult.Plant = "";
				// oResult.WareHouseNumber = WareHouseNumber;
				// oResult.SourceStrTyp = SourceStrTyp;
				// oResult.DestinationStrTyp = DestinationStrTyp;
				oRef.odataService.create("/BinToBinHSet", data, null, function (oData, oResponse) {
					var Sresponse = JSON.parse(oResponse.body);
					var TONum = Sresponse.d.Material;
					var message = "Successfully Transfered from " + sap.ui.getCore().bintobinTransferSourceBin + " Bin To " + DestinationBin +
						" Bin";
					var dialog = new Dialog({
						title: "Success",
						type: "Message",
						content: new Text({
							text: message
						}),
						beginButton: new Button({
							text: "OK",
							press: function () {
								var aData = oRef.getView().getModel("BinHUMatModel").getData();
								oRef.aData = [];
								oRef.getView().getModel("BinHUMatModel").setData(oRef.aData);
								oRef.setEmpty();
								dialog.close();
								var oRouter = oRef.getOwnerComponent().getRouter();
								oRouter.navTo("BinToBin", {});
							}
						}),
						afterClose: function () {
							dialog.destroy();
						}
					});
					dialog.open();
				}, function (oResponse) {
					var Sresponse = JSON.parse(oResponse.response.body);
					// var message = Sresponse.error.message.value;
					var message = Sresponse.error.innererror.errordetails[0].message;
					sap.m.MessageBox.alert(message, {
						title: "Error",
						onClose: null,
						styleClass: "",
						initialFocus: null,
						textDirection: sap.ui.core.TextDirection.Inherit
					});

				});
				// } 
				// else {
				// 	sap.m.MessageBox.alert("Batch Number is Not Valid", {
				// 		title: "Information",
				// 		onClose: null,
				// 		styleClass: "",
				// 		initialFocus: null,
				// 		textDirection: sap.ui.core.TextDirection.Inherit
				// 	});
				// 	oRef.getView().byId("BatchNumber").setValue("");
				// }
				// }
			}
		},
		batchValidation: function (BatchNo) {
			var oRef = this;
			var BatchNo = BatchNo;
			BatchNo = encodeURIComponent(BatchNo);
			var flag;
			if (BatchNo !== "") {
				oRef.odataService.read("/ScannedBatchNo?BatchNo='" + BatchNo + "'",
					null, null, false,
					function (oData, oResponse) {
						if (oData.Message === "valid Batch No") {
							flag = "X";
						} else {
							flag = "";
						}
					},
					function (oResponse) {
						sap.m.MessageBox.alert("Failed to validate Scanned Batch No", {
							title: "Information",
							onClose: null,
							styleClass: "",
							initialFocus: null,
							textDirection: sap.ui.core.TextDirection.Inherit
						});
					});
			}
			return flag;
		},
		setEmpty: function () {
			var oRef = this;
			oRef.getView().byId("scanHUNumber").setVisible(true);
			oRef.getView().byId("scanHUNumber").setValue("");
			oRef.getView().byId("scanHUNumber").setEnabled(true);
			oRef.getView().byId("matNumber").setValue("");
			oRef.getView().byId("matNumber").setEnabled(true);
			oRef.getView().byId("matNumber").clearSelection(true);
			oRef.getView().byId("materialDesc").setValue("");
			oRef.getView().byId("materialDesc").setVisible(false);
			oRef.getView().byId("BatchNumber").setVisible(true);
			oRef.getView().byId("BatchNumber").setValue("");
			oRef.getView().byId("BatchNumber").setEnabled(false);
			oRef.getView().byId("Quantity").setValue("");
			oRef.getView().byId("Quantity").setEnabled(false);
			oRef.getView().byId("UOM").setVisible(false);
			// oRef.getView().byId("destinationStorage").setValue("");
			oRef.getView().byId("destinationStorage").clearSelection(true);
			oRef.getView().byId("destinationStorage").setValue("");
			// oRef.getView().byId("DestinationBin").setValue("");
			/*oRef.getView().byId("DestinationBin").clearSelection(true);*/
			oRef.getView().byId("DestinationBin").setValue("");
		},
		onPressBack: function () {
			var oRef = this;
			oRef.setEmpty();
			var aData = oRef.getView().getModel("BinHUMatModel").getData();
			oRef.aData = [];
			oRef.getView().getModel("BinHUMatModel").setData(oRef.aData);
			var oRouter = oRef.getOwnerComponent().getRouter();
			oRouter.navTo("BinToBin", {});
		}

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf com.axium.Axium.view.HUorMatScan
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf com.axium.Axium.view.HUorMatScan
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf com.axium.Axium.view.HUorMatScan
		 */
		//	onExit: function() {
		//
		//	}

	});

});