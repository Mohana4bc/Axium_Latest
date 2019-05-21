sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/ui/core/UIComponent",
	"sap/m/Button",
	"sap/m/MessageToast",
	"sap/m/Dialog",
	"sap/m/Text"
], function (Controller, History, UIComponent, Button, MessageToast, Dialog, Text) {
	"use strict";

	return Controller.extend("com.axium.Axium.controller.MaterialDetail", {

		onInit: function () {
			var oRef = this;
			this.odataService = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZWM_GW_RFSCREENS_SRV/", true);
			//this.flag = "N"; // To check whether box quantity button is pressed or not N-means boxQuantity not filled and Y means yes i.e. filled
			this.countFlag = "N"; // flag because on press again box quantity button it should not repeat again 
			this.buttonFlag = ""; //To check whether box quantity button is pressed or not
			this.saveBoxQtyFlag = ""; // To check whether save box quantity button is pressed or not to validate split and next button 
			this.manufacturingDate = ""; //initially manufacturing date is empty variable is used t set the sytem date to the input field
			this.boxIndicator = ""; //used for enable and disable box qty button based on storage location
			jQuery.sap.require("sap.m.MessageBox"); //since message box is a static class so we need to execute this first.
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("MaterialDetail").attachPatternMatched(this._onObjectMatched, this);
			oRouter.getRoute("MaterialDetailBoxQuantity").attachPatternMatched(this._onObjectMatchedRQuantity, this);
			var BoxQuantity = [];
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.setData({
				boxQuantitySet: BoxQuantity
			});
			this.getOwnerComponent().setModel(oModel, "BoxDetails");
		},
		onBeforeShow: function (oEvent) {

			var oRef = this;
			var oStgcloc = oRef.getView().byId("storagelocId");
			oStgcloc.clearSelection();
		},

		_onObjectMatched: function (oEvent) {
			var oRef = this;
			if (sap.ui.getCore().storLocFlag === true) {
				oRef.getView().byId("storagelocId").setVisible(false);
			} else {
				oRef.getView().byId("storagelocId").setVisible(true);
			}
			var material = oEvent.getParameter("arguments").material; // selected material path
			var materialBindinfo = decodeURIComponent(material); //since it contains "/" we need to encode and decode
			var a = materialBindinfo.lastIndexOf("/");
			var index = materialBindinfo.slice(+a + +1, 14); //index number of the material selected
			this.index = +index;
			this.mat = materialBindinfo;
			this.getView().bindElement("Materials>" + this.mat); //binding materials model to view
			var listId = oRef.getView().byId("BatchSplit");
			listId.bindElement("Materials>" + this.mat);
			var oModelData = this.getOwnerComponent().getModel("Materials").getData();
			var batchId = this.getView().byId("BatchNumber");
			var splitButton = this.getView().byId("splitButton");
			//var batchLabelId = this.getView().byId("batchNumberid");
			var DateId = this.getView().byId("ManufacturingDate");
			var BoxQtyId = this.getView().byId("boxQuantity");
			var SaveBoxQtyId = this.getView().byId("saveBoxquantity");
			if (oModelData.materialSet[this.index].ValClass === "X") {
				sap.ui.getCore().boxQtyVisibleFlag = "true";
				BoxQtyId.setVisible(true);
				SaveBoxQtyId.setVisible(true);
			} else {
				sap.ui.getCore().boxQtyVisibleFlag = "false";
				BoxQtyId.setVisible(false);
				SaveBoxQtyId.setVisible(false);
			}
			if (oModelData.materialSet[this.index].Indicator === "X") {
				batchId.setVisible(true);
				//batchLabelId.setVisible(true);
				splitButton.setVisible(true);
				DateId.setVisible(true);
			} else {
				batchId.setVisible(false);
				splitButton.setVisible(false);
				//batchLabelId.setVisible(false);
				DateId.setVisible(false);
			}
			if (DateId.getVisible()) {
				var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
					pattern: "yyyy-MM-dd"
				});
				var today = new Date();
				var todayDate = oDateFormat.format(today);
				this.getView().byId("ManufacturingDate").setValue(todayDate);
			}
			var plant = oModelData.materialSet[this.index].Plant;
			var MaterialNo = oModelData.materialSet[this.index].MaterialNumber;
			oRef.odataService.read("/StorageLocSet?$filter=Plant eq '" + plant +
				"'", null, null, false,
				function (oData, oResponse) {
					if (oRef.getView().byId("storagelocId") !== undefined) {
						oRef.getView().byId("storagelocId").destroyItems();
					}
					for (var i = 0; i < oData.results.length; i++) {
						oRef.getView().byId("storagelocId").addItem(
							new sap.ui.core.ListItem({
								text: oData.results[i].StorageLocation,
								//key: response.results[i].Material,
								additionalText: oData.results[i].LocationDesc
							}));
					}
				});
		},

		_onObjectMatchedRQuantity: function (oEvent) {
			this.countFlag = oEvent.getParameter("arguments").flag;
		},

		StorageLoc: function () {
			var oRef = this;
			var storageLoc = oRef.getView().byId("storagelocId").getValue();
			var oModelData = this.getOwnerComponent().getModel("Materials").getData();
			var plant = oModelData.materialSet[this.index].Plant;
			var MaterialNo = oModelData.materialSet[oRef.index].MaterialNumber;
			var IndicatorVal = oModelData.materialSet[oRef.index].ValClass;
			var BoxQtyId = this.getView().byId("boxQuantity");
			var SaveBoxQtyId = this.getView().byId("saveBoxquantity");
			// StorageLocSet?$filter=Plant eq '1001'
			oRef.odataService.read("/StorageLocSet?$filter=Plant eq '" + plant +
				"'", null, null, false,
				function (oData, oResponse) {
					for (var i = 0; i < oData.results.length; i++) {
						if (oData.results[i].StorageLocation === storageLoc) {
							oModelData.materialSet[oRef.index].StorageLoc = oData.results[i].StorageLocation;
							var Indicator = oData.results[i].Indicator;
							oRef.boxIndicator = Indicator;
							if (Indicator === "X" && IndicatorVal === "X") {
								sap.ui.getCore().boxQtyVisibleFlag = "true";
								BoxQtyId.setVisible(true);
								SaveBoxQtyId.setVisible(true);
							} else {
								sap.ui.getCore().boxQtyVisibleFlag = "false";
								BoxQtyId.setVisible(false);
								SaveBoxQtyId.setVisible(false);
							}
						}
					}
				});

		},

		OnhandleDate: function (oEvent) {
			var oRef = this;
			var date = this.getView().byId("ManufacturingDate").getValue();
			var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
				pattern: "yyyy-MM-dd"
			});
			var today = new Date();
			date = new Date(date);
			var todayDate = oDateFormat.format(today);
			var manufacturingDate = oDateFormat.format(date);
			if (manufacturingDate <= todayDate) {
				oEvent.getSource().setValueState(sap.ui.core.ValueState.None);
				this.manufacturingDate = manufacturingDate;
			} else {
				oEvent.getSource().setValueState(sap.ui.core.ValueState.Error);
				var msg = 'You cannot enter date greater than Current date';
				MessageToast.show(msg);
				oRef.getView().byId("ManufacturingDate").setValue("");
			}
		},

		onPressBoxQuantity: function () {
			var oRef = this;
			this.buttonFlag = "X"; //setting button press to true
			var oModelData = this.getOwnerComponent().getModel("Materials").getData();
			var batchNumber = this.getView().byId("BatchNumber").getValue();
			var receivedQuantity = this.getView().byId("ReceivedQuantity").getValue();
			var index = oRef.mat.slice(13, 14);
			if (oModelData.materialSet[this.index].Indicator === "X") {
				batchNumber = this.getView().byId("BatchNumber").getValue();
			} else {
				batchNumber = "N";
			}
			if (oModelData.materialSet[this.index].Indicator === "X") {
				if (batchNumber === "" || receivedQuantity === "") {
					var message = "Please Enter Batch Number and Required Quantity";
					sap.m.MessageBox.alert(message, {
						title: "Information",
						onClose: null,
						styleClass: "",
						initialFocus: null,
						textDirection: sap.ui.core.TextDirection.Inherit
					});
					oRef.buttonFlag = "";
				}
			} else {
				if (receivedQuantity === "") {
					var message = "Please Enter Required Quantity";
					sap.m.MessageBox.alert(message, {
						title: "Information",
						onClose: null,
						styleClass: "",
						initialFocus: null,
						textDirection: sap.ui.core.TextDirection.Inherit
					});
					oRef.buttonFlag = "";
				}
			}
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.navTo("BoxQuantity", {
				batchNumber: batchNumber,
				receivedQuantity: receivedQuantity,
				flag: this.countFlag,
				index: index
			});
		},

		onPressSaveBoxQuantity: function () {
			var oRef = this;
			oRef.saveBoxQtyFlag = "X";
			var receivedQuantity = this.getView().byId("ReceivedQuantity").getValue();
			var index = oRef.mat.slice(13, 14);
			var model = this.getOwnerComponent().getModel("BoxDetails").getData();
			var model2 = this.getOwnerComponent().getModel("Materials").getData();
			var batchNumber = this.getView().byId("BatchNumber");
			if (model2.materialSet[this.index].Indicator === "X") {
				batchNumber = this.getView().byId("BatchNumber").getValue();
			} else {
				batchNumber = "";
			}
			var batchFlag = "";
			for (var i = 0; i < model2.materialSet.length; i++) {
				for (var j = 0; j < model2.materialSet[i].MaterialSplit.length; j++) {
					if (batchNumber !== "" && model2.materialSet[i].MaterialSplit[j].BatchNo === batchNumber) {
						batchFlag = "X";
					}
				}
			}
			if (model2.materialSet[this.index].Indicator === "X" && batchNumber === "") {
				sap.m.MessageBox.alert("Please Enter Batch Number", {
					title: "Information",
					onClose: null,
					styleClass: "",
					initialFocus: null,
					textDirection: sap.ui.core.TextDirection.Inherit
				});
				oRef.saveBoxQtyFlag = "";
			} else {
				if (batchFlag === "X") {
					var message = "Batch Number is already used please use different batch number";
					var dialog = new Dialog({
						title: "Error",
						type: "Message",
						content: new Text({
							text: message
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
					var oResult = {};
					oRef.rQtySum = 0;
					oResult.PurchaseOrder = model2.PoNumber;
					oResult.NavBoxQHBoxQ = [];
					if (this.buttonFlag !== "") {
						for (var i = 0; i < model.boxQuantitySet.length; i++) {
							var qty = model.boxQuantitySet[i].Number * model.boxQuantitySet[i].Value;
							var number = model.boxQuantitySet[i].Number;
							var a = parseInt(number);
							oResult.NavBoxQHBoxQ.push({
								PurchaseOrder: model2.PoNumber,
								Material: model2.materialSet[index].MaterialNumber,
								Batch: batchNumber,
								BoxID: a,
								Quantity: model.boxQuantitySet[i].Value
							});
							oRef.rQtySum = +oRef.rQtySum + +qty;
							oRef.rQtySum = oRef.rQtySum.toString();
						}
					} else {
						oResult.NavBoxQHBoxQ.push({
							PurchaseOrder: model2.PoNumber,
							Material: model2.materialSet[index].MaterialNumber,
							Batch: batchNumber,
							BoxID: 1,
							Quantity: receivedQuantity
						});
						oRef.rQtySum = +oRef.rQtySum + +receivedQuantity;
						oRef.rQtySum = oRef.rQtySum.toString();
					}
					sap.ui.core.BusyIndicator.show(0);
					setTimeout(function () {
						if (oRef.rQtySum === receivedQuantity) {
							oRef.odataService.create("/BoxQuantityHeaderSet", oResult, null, function (oData, oResponse) {
								var dialog = new Dialog({
									title: "Success",
									type: "Message",
									content: new Text({
										text: "Successfully Saved Box Quantity"
									}),
									beginButton: new Button({
										text: 'OK',
										press: function () {
											// oRef.flag = "Y";
											oRef.getView().byId("boxQuantity").setVisible(false);
											oRef.getView().byId("saveBoxquantity").setVisible(false);

											oRef.countFlag = "N";
											oRef.buttonFlag = "";
											var oModelBoxQuantity = oRef.getOwnerComponent().getModel("BoxDetails").getData();
											var len = oModelBoxQuantity.boxQuantitySet.length;
											oModelBoxQuantity.boxQuantitySet.splice(0, len);
											oRef.getOwnerComponent().getModel("BoxDetails").refresh();
											dialog.close();
										}
									}),
									afterClose: function () {
										dialog.destroy();
									}
								});
								dialog.open();
							}, function (oResponse) {
								var Sresponse = JSON.parse(oResponse.response.body);
								var Smessage = Sresponse.error.innererror.errordetails[0].message;
								var dialog = new Dialog({
									title: "Error",
									type: "Message",
									content: new Text({
										text: Smessage
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
							});
						} else {
							var dialog = new Dialog({
								title: "Error",
								type: "Message",
								content: new Text({
									text: "Received Quantity and Sum of Box Quantity should be same"
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
						sap.ui.core.BusyIndicator.hide();
					}, 2000);
				}
			}

		},

		onPressSpilt: function () {
			var oRef = this;
			oRef.buttonTrue = 'X';
			var oModelData = this.getOwnerComponent().getModel("Materials").getData();
			var rQty = this.getView().byId("ReceivedQuantity").getValue();
			var batchNumber = this.getView().byId("BatchNumber").getValue();
			if (oModelData.materialSet[oRef.index].Indicator === "X") {
				if (batchNumber === "") {
					batchNumber = undefined;
				}
			} else {
				var batchNumber = "";
			}
			var date = oRef.getView().byId("ManufacturingDate").getValue();
			//var date = this.manufacturingDate;
			var dateTime = new Date(date).getTime();
			/*var ValClass = oModelData.materialSet[oRef.index].ValClass;
			if (ValClass === "") {
			oRef.rQtySum = this.getView().byId("ReceivedQuantity").getValue();
			}*/
			var flagBox = oRef.CheckBoxQty();
			if (flagBox === "X") {
				oRef.rQtySum = this.getView().byId("ReceivedQuantity").getValue();
			}
			if (rQty !== "" && date !== "" && batchNumber !== undefined) {
				if (oRef.saveBoxQtyFlag === "X" || flagBox === "X") {
					if (rQty === oRef.rQtySum) {
						var Split = {};
						Split.ReceivedQuantity = rQty;
						Split.BinNumber = "";
						Split.DateOfManufacture = "/Date(" + dateTime + ")/";
						Split.BatchNo = batchNumber;
						oModelData.materialSet[oRef.index].MaterialSplit.push(Split);
						oRef.getOwnerComponent().getModel("Materials").refresh();
						if (oModelData.materialSet[oRef.index].Indicator === "X") {
							oRef.getView().byId("BatchNumber").setValue("");
						}
						if (oModelData.materialSet[oRef.index].ValClass === "X") {
							oRef.getView().byId("boxQuantity").setVisible(true);
							oRef.getView().byId("saveBoxquantity").setVisible(true);
						}
						oRef.countFlag = "N";
						oRef.saveBoxQtyFlag = "";
						oRef.getView().byId("ReceivedQuantity").setValue("");
						oRef.getView().byId("storagelocId").setValue("");
						oRef.getView().byId("storagelocId").clearSelection(true);
					} else {
						sap.m.MessageBox.alert("Received Quantity and box Quantity should be same", {
							title: "Information",
							onClose: null,
							styleClass: "",
							initialFocus: null,
							textDirection: sap.ui.core.TextDirection.Inherit
						});
					}
				} else {
					sap.m.MessageBox.alert("Please Save Box Quantity first", {
						title: "Information",
						onClose: null,
						styleClass: "",
						initialFocus: null,
						textDirection: sap.ui.core.TextDirection.Inherit
					});
				}
			} else {
				sap.m.MessageBox.alert("Please Enter all details", {
					title: "Information",
					onClose: null,
					styleClass: "",
					initialFocus: null,
					textDirection: sap.ui.core.TextDirection.Inherit
				});
			}
		},

		onNext: function () {
			var oRef = this;
			oRef.buttonTrue = 'X';
			var oModelData = this.getOwnerComponent().getModel("Materials").getData();
			var rQty = this.getView().byId("ReceivedQuantity").getValue();
			var batchNumber = this.getView().byId("BatchNumber").getValue();
			if (oModelData.materialSet[oRef.index].Indicator === "X") {
				if (batchNumber === "") {
					/*sap.m.MessageBox.alert("Please Enter Batch Number", {
					title: "Information",
					onClose: null,
					styleClass: "",
					initialFocus: null,
					textDirection: sap.ui.core.TextDirection.Inherit
					});*/
					batchNumber = undefined;
				}
			} else {
				var batchNumber = "";
			}
			var DateId = oRef.getView().byId("ManufacturingDate");
			if (DateId.getVisible()) {
				var date = oRef.getView().byId("ManufacturingDate").getValue();
			} else {
				var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
					pattern: "yyyy-MM-dd"
				});
				var today = new Date();
				var todayDate = oDateFormat.format(today);
				var date = todayDate;
			}
			//var date = oRef.getView().byId("ManufacturingDate").getValue();
			var dateTime = new Date(date).getTime();
			/*var ValClass = oModelData.materialSet[oRef.index].ValClass;
			if (ValClass === "") {
			oRef.rQtySum = this.getView().byId("ReceivedQuantity").getValue();
			}*/
			var flagBox = oRef.CheckBoxQty();
			if (flagBox === "X") {
				oRef.rQtySum = this.getView().byId("ReceivedQuantity").getValue();
			}
			if (rQty !== "" && date !== "" && batchNumber !== undefined) {
				if (oRef.saveBoxQtyFlag === "X" || flagBox === "X") {
					if (rQty === oRef.rQtySum) {
						var Split = {};
						Split.ReceivedQuantity = rQty;
						Split.BinNumber = "";
						Split.DateOfManufacture = "/Date(" + dateTime + ")/";
						Split.BatchNo = batchNumber;
						oModelData.materialSet[oRef.index].MaterialSplit.push(Split);
						oRef.getOwnerComponent().getModel("Materials").refresh();
						if (oModelData.materialSet[oRef.index].Indicator === "X") {
							oRef.getView().byId("BatchNumber").setValue("");
						}
						oRef.getView().byId("boxQuantity").setVisible(true);
						oRef.getView().byId("saveBoxquantity").setVisible(true);
						oRef.countFlag = "N";
						oRef.getView().byId("ReceivedQuantity").setValue("");
						oRef.getView().byId("storagelocId").setValue("");
						oRef.getView().byId("storagelocId").clearSelection(true);
						oRef.saveBoxQtyFlag = "";
						var index = oRef.mat.slice(13, 14);
						var oRouter = oRef.getOwnerComponent().getRouter();
						oRouter.navTo("MaterialSelected", {
							index: index,
							buttonTrue: oRef.buttonTrue
						});
						oRef.buttonTrue = 'N';
					} else {
						sap.m.MessageBox.alert("Received Quantity and box Quantity should be same", {
							title: "Information",
							onClose: null,
							styleClass: "",
							initialFocus: null,
							textDirection: sap.ui.core.TextDirection.Inherit
						});
					}
				} else {
					sap.m.MessageBox.alert("Please Save Box Quantity", {
						title: "Information",
						onClose: null,
						styleClass: "",
						initialFocus: null,
						textDirection: sap.ui.core.TextDirection.Inherit
					});
				}
			} else {
				sap.m.MessageBox.alert("Please Enter all details", {
					title: "Information",
					onClose: null,
					styleClass: "",
					initialFocus: null,
					textDirection: sap.ui.core.TextDirection.Inherit
				});
			}
		},

		/*onPressAvailableBin: function() {
		var oRouter = this.getOwnerComponent().getRouter();
		oRouter.navTo("BinsAvailable");
		},*/

		CheckBoxQty: function () {
			var oRef = this;
			var flagBox = "";
			var oModelData = this.getOwnerComponent().getModel("Materials").getData();
			var ValClass = oModelData.materialSet[oRef.index].ValClass;
			if (ValClass === "X" && oRef.boxIndicator === "X") {
				flagBox = "";
			} else {
				flagBox = "X";
			}
			return flagBox;
		},

		onPressBack: function () {
			var oRef = this;
			//var oModelData = this.getOwnerComponent().getModel("Materials").getData();
			//var valClass = oModelData.materialSet[oRef.index].ValClass;
			if (oRef.saveBoxQtyFlag === "X") {
				var oModelData = this.getOwnerComponent().getModel("Materials").getData();
				var dialog = new Dialog({
					title: "Confirm",
					type: "Message",
					content: new Text({
						text: "Data which is not saved will be deleted are you sure you want to go back?"
					}),
					beginButton: new Button({
						text: "Yes",
						press: function () {
							var oResult = {};
							oResult.NavDelBoxQHDelBoxQty = [];
							var x = oRef.getOwnerComponent().getModel("Materials").getData();
							var batchNumber = "";
							if (oModelData.materialSet[oRef.index].Indicator === "X") {
								batchNumber = oRef.getView().byId("BatchNumber").getValue();
							} else {
								batchNumber = "";
							}
							oResult.PoNumber = x.PoNumber;
							oResult.NavDelBoxQHDelBoxQty.push({
								PoNumber: x.PoNumber,
								MaterialNo: x.materialSet[oRef.index].MaterialNumber,
								BatchNo: batchNumber,
								BoxId: 0,
								BoxQty: "0.000"
							});
							oRef.odataService.create("/DelBoxQtyHeadSet", oResult, null, function (oData, oResponse) {
									oRef.getView().byId("boxQuantity").setVisible(true);
									oRef.getView().byId("saveBoxquantity").setVisible(true);
									if (oRef.buttonTrue === undefined) {
										oRef.buttonTrue = "N";
									}
									oRef.countFlag = "N";
									oRef.buttonFlag = "";
									oRef.getView().byId("ReceivedQuantity").setValue("");
									if (oModelData.materialSet[oRef.index].Indicator === "X") {
										oRef.getView().byId("BatchNumber").setValue("");
									}
									oRef.getView().byId("storagelocId").setValue("");
									oRef.manufacturingDate = "";
									var oRouter = oRef.getOwnerComponent().getRouter();
									// oRef.flag = "N";
									oRef.saveBoxQtyFlag = "";
									var arr = x.materialSet[oRef.index].MaterialSplit;
									if (arr !== undefined && arr.length !== 0) {
										var y = x.materialSet[oRef.index].MaterialSplit[0].BatchNo;
									} else {
										var y = "";
									}
									if (y !== "" && y !== undefined) {
										oRouter.navTo("MaterialSelected", {
											index: oRef.index,
											buttonTrue: oRef.buttonTrue
										});
										oRef.buttonTrue = 'N';
									} else {
										oRouter.navTo("MaterialDetailBack", {
											buttonTrue: oRef.buttonTrue
										});
										oRef.buttonTrue = 'N';
										MessageToast.show("Successfully deleted Box Quantity details!");
									}
								},
								function (oResponse) {
									var Sresponse = JSON.parse(oResponse.response.body);
									var ErrorMsg = [];
									var message;
									for (var x in Sresponse.error.innererror.errordetails) {
										if (Sresponse.error.innererror.errordetails[x].severity === "error") {
											var Smessage = Sresponse.error.innererror.errordetails[x].message;
											if (Smessage === "An exception was raised") {
												Smessage = "";
											} else {
												if (Smessage != "") {
													ErrorMsg.push(Smessage);
												}
											}
										}
									}
									for (var i = 0; i < ErrorMsg.length; i++) {
										var index = +i + 1;
										if (index === 1) {
											message = "\n" + index + "." + ErrorMsg[i];
										} else {
											message = message + "\n" + index + "." + ErrorMsg[i];
										}
									}
									var msgdialog = new Dialog({
										title: "Error",
										type: "Message",
										content: new Text({
											text: message
										}),
										beginButton: new Button({
											text: 'OK',
											press: function () {
												msgdialog.close();
											}
										}),
										afterClose: function () {
											msgdialog.destroy();
										}
									});
									msgdialog.open();
								});
							dialog.close();
						}
					}),
					endButton: new Button({
						text: "Cancel",
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
				var oModelData = this.getOwnerComponent().getModel("Materials").getData();
				oRef.getView().byId("boxQuantity").setEnabled(true);
				if (oRef.buttonTrue === undefined) {
					oRef.buttonTrue = "N";
				}
				oRef.getView().byId("saveBoxquantity").setVisible(true);
				oRef.countFlag = "N";
				oRef.buttonFlag = "";
				oRef.saveBoxQtyFlag = "";
				oRef.getView().byId("ReceivedQuantity").setValue("");
				oRef.getView().byId("storagelocId").setValue("");
				if (oModelData.materialSet[oRef.index].Indicator === "X") {
					oRef.getView().byId("BatchNumber").setValue("");
				}
				oRef.manufacturingDate = "";
				var oRouter = oRef.getOwnerComponent().getRouter();
				oRouter.navTo("MaterialDetailBack", {
					buttonTrue: oRef.buttonTrue
				});
				oRef.buttonTrue = 'N';
			}
		}
	});

});