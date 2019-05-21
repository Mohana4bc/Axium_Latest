sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/Button",
	"sap/m/Dialog",
	"sap/m/Text"
], function (Controller, Button, Dialog, Text) {
	"use strict";

	return Controller.extend("com.axium.Axium.controller.HUandMatScan", {

		onInit: function () {
			this.odataService = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZWM_GW_RFSCREENS_SRV/", true);
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("HUandMatScan").attachPatternMatched(this._onObjectMatched, this);
		},

		_onObjectMatched: function (oEvent) {
			var oRef = this;
			oRef.warehouseNumber = oEvent.getParameter("arguments").warehouseNumber;
			oRef.sourceStorage = oEvent.getParameter("arguments").sourceStorage;
			oRef.sourceBin = oEvent.getParameter("arguments").sourceBin;

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

		// destinationStorage: function () {
		// 	var oRef = this;
		// 	oRef.destinationStorage = this.getView().byId("destinationStorage").getSelectedItem().getAdditionalText();
		// 	oRef.getView().byId("DestinationBin").setEnabled(true);
		// },

		validateBin: function () {
			var oRef = this;
			var storageType = oRef.getView().byId("destinationStorage").getValue();
			var destinationBin = oRef.getView().byId("DestinationBin").getValue();
			var destinationBinFlag = false;
			if (destinationBin.length >= 5) {
				setTimeout(function () {
					if (storageType !== "") {
						var present = "";
						var binSelected = oRef.getView().byId("DestinationBin").getValue();
						var oBinModel = oRef.getOwnerComponent().getModel("Bins");
						var modelData = oBinModel.getData();
						for (var i = 0; i < modelData.binSet.length; i++) {
							if (modelData.binSet[i].StorageBin === binSelected) {
								present = 'X';
							}
						}
						if (present === "") {
							sap.m.MessageBox.alert("Please Select a valid Bin", {
								title: "Information",
								onClose: null,
								styleClass: "",
								initialFocus: null,
								textDirection: sap.ui.core.TextDirection.Inherit
							});
							oRef.getView().byId("DestinationBin").setValue("");
						} else {
							sap.ui.getCore().TypeafterBin = "false";
						}
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
			} else {
				destinationBinFlag = true;
				return destinationBinFlag;
			}

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
										oRef.getView().byId("scanHUNumber").setEnabled(false);
										oRef.getView().byId("matNumber").setValue(oData.results[0].Material);
										oRef.material = oData.results[0].Material;
										oRef.getView().byId("matNumber").setEnabled(false);
										oRef.getView().byId("materialDesc").setVisible(true);
										oRef.getView().byId("materialDesc").setValue(oData.results[0].MaterialDesc);
										oRef.getView().byId("BatchNumber").setValue(oData.results[0].BatchNo);
										oRef.getView().byId("Quantity").setValue(oData.results[0].ScannedQnty);
										oRef.getView().byId("Quantity").setEnabled(false);
										oRef.getView().byId("destinationStorage").setEnabled(true);
										/*oRef.getView().byId("DestinationBin").setEnabled(true);*/
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
										oRef.getView().byId("scanHUNumber").setEnabled(false);
										oRef.getView().byId("matNumber").setValue(oData.results[0].Material);
										oRef.material = oData.results[0].Material;
										oRef.getView().byId("matNumber").setEnabled(false);
										oRef.getView().byId("materialDesc").setVisible(true);
										oRef.getView().byId("materialDesc").setValue(oData.results[0].MaterialDesc);
										oRef.getView().byId("BatchNumber").setValue(oData.results[0].BatchNo);
										oRef.getView().byId("Quantity").setValue(oData.results[0].ScannedQnty);
										oRef.getView().byId("Quantity").setEnabled(false);
										oRef.getView().byId("destinationStorage").setEnabled(true);
										/*oRef.getView().byId("DestinationBin").setEnabled(true);*/
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
			// setTimeout(function () {
			oRef.odataService.read("/ScannedHU?ExternalHU='" + HuNumber + "'",
				null, null, false,
				function (oData, oResponse) {
					var message = oData.Message;
					if (message === "Valid HU") {
						flag = "X";
					} else {
						flag = "";
					}
				},
				function (oResponse) {
					sap.m.MessageBox.alert("Failed to validate HU Number", {
						title: "Information",
						onClose: null,
						styleClass: "",
						initialFocus: null,
						textDirection: sap.ui.core.TextDirection.Inherit
					});
				});
			return flag;
			// }, 1000);

		},

		MatScan: function () {
			var oRef = this;
			var Indicator,
				materialScan,
				materialDesc, UOM;
			var material = oRef.getView().byId("matNumber").getSelectedItem().getAdditionalText();
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
			if (HUno !== undefined && HUno !== "") {
				flagHu = 'X';
			}
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
			if (SourceBin === DestinationBin) {
				sap.m.MessageBox.alert("Source and Destination Bin cannot be same", {
					title: "Information",
					onClose: null,
					styleClass: "",
					initialFocus: null,
					textDirection: sap.ui.core.TextDirection.Inherit
				});
				oRef.getView().byId("DestinationBin").setValue("");
			} else {
				if (SourceBin !== "" && ExternalHU !== undefined && DestinationBin !== "" && Material !== "" && RequirementQnty !== "" && BatchNo !==
					undefined && WareHouseNumber !== "" && SourceStrTyp !== "" && DestinationStrTyp !== "") {
					if (BatchNo != "") {
						batchValidate = oRef.batchValidation(BatchNo);
					} else {
						batchValidate = "X";
					}
					if (batchValidate === "X") {
						oResult.SourceBin = SourceBin;
						oResult.ExternalHU = ExternalHU;
						oResult.DestinationBin = DestinationBin;
						oResult.Material = Material;
						oResult.RequirementQnty = RequirementQnty;
						oResult.UOM = UOM;
						oResult.BatchNo = BatchNo;
						oResult.Plant = "";
						oResult.WareHouseNumber = WareHouseNumber;
						oResult.SourceStrTyp = SourceStrTyp;
						oResult.DestinationStrTyp = DestinationStrTyp;
						oRef.odataService.create("/BinToBinSet", oResult, null, function (oData, oResponse) {
							var Sresponse = JSON.parse(oResponse.body);
							var TONum = Sresponse.d.Material;
							var message = "Successfully Transfered from " + SourceBin + " Bin To " + DestinationBin + " Bin";
							var dialog = new Dialog({
								title: "Success",
								type: "Message",
								content: new Text({
									text: message
								}),
								beginButton: new Button({
									text: 'OK',
									press: function () {
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
							var message = Sresponse.error.message.value;
							sap.m.MessageBox.alert(message, {
								title: "Information",
								onClose: null,
								styleClass: "",
								initialFocus: null,
								textDirection: sap.ui.core.TextDirection.Inherit
							});

						});
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
			}
		},

		batchValidation: function (batch) {
			var oRef = this;
			var BatchNo = batch;
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
			oRef.getView().byId("destinationStorage").setValue("");
			oRef.getView().byId("destinationStorage").clearSelection(true);
			oRef.getView().byId("destinationStorage").setEnabled(false);
			oRef.getView().byId("DestinationBin").setValue("");
			/*oRef.getView().byId("DestinationBin").clearSelection(true);*/
			// oRef.getView().byId("DestinationBin").setEnabled(false);
		},

		onPressBack: function () {
			var oRef = this;
			oRef.setEmpty();
			var oRouter = oRef.getOwnerComponent().getRouter();
			oRouter.navTo("BinToBin", {});
		}

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf Z_AXIUMPLASTIC.view.HUandMatScan
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf Z_AXIUMPLASTIC.view.HUandMatScan
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf Z_AXIUMPLASTIC.view.HUandMatScan
		 */
		//	onExit: function() {
		//
		//	}
	});

});