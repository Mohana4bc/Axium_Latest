sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/UIComponent",
	"sap/m/MessageBox",
	"sap/ui/core/routing/History",
	"sap/m/Button",
	"sap/m/Dialog",
	"sap/m/MessageToast",
	"sap/m/Text"
], function (Controller, UIComponent, MessageBox, History, Button, Dialog, MessageToast, Text) {
	"use strict";

	return Controller.extend("com.axium.Axium.controller.Material", {
		onInit: function () {
			this.odataService = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZWM_GW_RFSCREENS_SRV/", true);
			this.flagSubmit = ""; //used to check if submit button is pressed or not it is set and clear in onsubmit and checked in onPressBack

			//start of checkbox

			var listId = this.getView().byId("Materials");
			listId.addDelegate({
				onAfterRendering: function () {
					var header = this.$().find('thead');
					var selectAllCb = header.find('.sapMCb');
					selectAllCb.remove();
					this.getItems().forEach(function (r) {
						//var obj = r.getBindingContext().getObject();
						//var enabled = parseInt(obj.Weight, 10) > 40;
						var cb = r.$().find('.sapMCb');
						var oCb = sap.ui.getCore().byId(cb.attr('id'));
						oCb.setEnabled(false);
					});
				}
			}, listId);

			//end of check box

			var Material = [];
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.setData({
				materialSet: Material
			});
			this.getView().addEventDelegate({
				onBeforeShow: jQuery.proxy(function (evt) {
					this.onBeforeShow(evt);
				}, this)
			});
			this.getOwnerComponent().setModel(oModel, "Materials");
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("Material").attachPatternMatched(this._onObjectMatched, this); // this route is used take PO Number ad fetch details based on that Po number
			oRouter.getRoute("MaterialSelected").attachPatternMatched(this._onObjectSelected, this); //this route is used to take the selected item and set checkbox of that selected item
			oRouter.getRoute("MaterialDetailBack").attachPatternMatched(this._onObjectButtonTrue, this); //to make button visible
			sap.ui.getCore().storLocFlag = "";

		},

		onBeforeShow: function (oEvent) {
			var oRef = this;
			setTimeout(function () {
				var oInput = oRef.getView().byId("deliveryNote");
				oInput.focus();
			}, 1000);
		},

		_onObjectButtonTrue: function (oEvent) {
			var oRef = this;
			var buttonTrue = oEvent.getParameter("arguments").buttonTrue;
			if (buttonTrue !== "N") {
				oRef.getView().byId("SubmitId").setVisible(true);
			}
		},

		_onObjectMatched: function (oEvent) {
			var oRef = this;
			var poNumber = oEvent.getParameter("arguments").poNumber;
			this.odataService.read("/PoItemsSet?$filter=PoNumber eq'" + poNumber + "'", {
				success: cSuccess,
				failed: cFailed
			});

			function cSuccess(data) {
				var oModel = oRef.getOwnerComponent().getModel("Materials");
				var modelData = oModel.getData();

				modelData.PoNumber = poNumber;
				for (var i = 0; i < data.results.length; i++) {
					if (data.results[i].MaterialDesc !== "" && data.results[i].MaterialNumber === "") {
						sap.ui.getCore().storLocFlag = true;
					} else {
						sap.ui.getCore().storLocFlag = "";
					}
					modelData.materialSet.push({
						MaterialNumber: data.results[i].MaterialNumber,
						MaterialDesc: data.results[i].MaterialDesc,
						Quantity: data.results[i].Quantity,
						Indicator: data.results[i].Indicator,
						UOM: data.results[i].UOM,
						ValClass: data.results[i].ValClass,
						/* Added on 26/11/2018 */
						Plant: data.results[i].Plant,
						StorageLoc: data.results[i].StorageLoc,
						MaterialSplit: []
					});
				}
				oModel.refresh();
				var count = 0;
				for (var i = 0; i < modelData.materialSet.length; i++) {
					if (modelData.materialSet[i].MaterialDesc !== "") {
						continue;
					} else {
						count = count + 1;
					}
				}
				if (modelData.materialSet.length === count) {
					var dialog = new Dialog({
						title: "Information",
						type: "Message",
						verticalScrolling: true,
						content: new Text({
							text: "There is no open material for the PO scanned"
						}),
						beginButton: new Button({
							text: 'OK',
							press: function () {
								var oRouter = oRef.getOwnerComponent().getRouter();
								oRouter.navTo("PutAway", {});
								sap.ui.getCore().clearPO = "true";
								var len = modelData.materialSet.length;
								modelData.materialSet.splice(0, len);
								oModel.refresh();
							}
						}),
						afterClose: function () {
							dialog.destroy();
						}
					});
					dialog.open();
				} else {
					sap.ui.getCore().clearPO = "false";
				}

			}

			function cFailed() {
				MessageBox.error("Could not read PoItemsSet");
			}
		},

		_onObjectSelected: function (oEvent) {
			this.index = oEvent.getParameter("arguments").index;
			var oList = this.getView().byId("Materials");
			var oRef = this;
			var buttonTrue = oEvent.getParameter("arguments").buttonTrue;
			if (buttonTrue !== "N") {
				oRef.getView().byId("SubmitId").setVisible(true);
			}
			var oSelectedItem = oList.getItems()[this.index];
			/*			if(oSelectedItem){
							$("#" +oSelectedItem).css("background-color", "#CEDFEB");
						}*/
			//oEvent.getSource().setSelectedItem(oSelectedItem, true, true);
			//oSelectedItem.$().css("background-color", "#CEDFEB");
			oList.setSelectedItem(oSelectedItem, "true");
		},

		onSelectMaterial: function (oEvent) {
			this.deliveryNote = this.getView().byId("deliveryNote").getValue();
			if (this.deliveryNote === "") {
				var message = "Please Enter Delivery Note";
				sap.m.MessageBox.alert(message, {
					title: "Information",
					onClose: null,
					styleClass: "",
					initialFocus: null,
					textDirection: sap.ui.core.TextDirection.Inherit
				});
			} else {
				var materialSelected = oEvent.getParameter("listItem").getBindingContextPath();
				//var materialSelected = oEvent.getParameter("listItem").getProperty("title");
				var material = encodeURIComponent(materialSelected);
				var oRouter = this.getOwnerComponent().getRouter();
				oRouter.navTo("MaterialDetail", {
					material: material
				});
			}
		},

		onSubmit: function () {
			this.flagSubmit = "X";
			var oRef = this;
			var flagCount = "";
			var oResult = {};
			var count = 0;
			var x = oRef.getOwnerComponent().getModel("Materials").getData();
			oResult.PoNumber = x.PoNumber;
			// oResult.DeliveryNote = oRef.deliveryNote;
			oResult.DeliveryNote = oRef.getView().byId("deliveryNote").getValue();
			oResult.NavPoheaderPoItems = [];
			var oList = this.getView().byId("Materials");
			var arr = oList.getSelectedContextPaths();
			for (var i = 0; i < x.materialSet.length; i++) {
				var itemExists = arr.includes("/materialSet/" + i);
				if (itemExists === true) {
					var len = x.materialSet[i].MaterialSplit.length;
					if (len !== 0) {
						for (var j = 0; j < len; j++) {
							count = count + 1;
							oResult.NavPoheaderPoItems.push({
								PoNumber: x.PoNumber,
								MaterialNumber: x.materialSet[i].MaterialNumber,
								Plant: x.materialSet[i].Plant,
								StorageLoc: x.materialSet[i].StorageLoc,
								DateOfManufacture: x.materialSet[i].MaterialSplit[j].DateOfManufacture,
								BatchNo: x.materialSet[i].MaterialSplit[j].BatchNo,
								ReceivedQuantity: x.materialSet[i].MaterialSplit[j].ReceivedQuantity,
								BinNumber: x.materialSet[i].MaterialSplit[j].BinNumber
							});
						}
					} else {
						var msg = "Please Enter details for material " + x.materialSet[i].MaterialNumber;
						sap.m.MessageBox.alert(msg, {
							title: "Information",
							onClose: null,
							styleClass: "",
							initialFocus: null,
							textDirection: sap.ui.core.TextDirection.Inherit
						});
					}
				}
			}
			//oRef.getOwnerComponent().getModel("Materials").refresh();
			sap.ui.core.BusyIndicator.show();
			setTimeout(function () {
				if (count !== 0 && count === oResult.NavPoheaderPoItems.length) {
					oRef.odataService.create("/PoHeaderSet", oResult, null, function (oData, oResponse) {
							var Sresponse = JSON.parse(oResponse.body);
							var PoItems = Sresponse.d.NavPoheaderPoItems;
							var SuccessMsg = [];
							var message;
							for (var i in PoItems.results) {
								var MatDocNumber = PoItems.results[i].PoNumber;
								var BatchNumber = PoItems.results[i].BatchNo;
								var MatNumber = PoItems.results[i].MaterialNumber;
								if (BatchNumber !== "") {
									var Smessage = "Successfully Created Material Document Number: " + MatDocNumber + " For Material: " + MatNumber +
										" Batch No: " +
										BatchNumber;
								} else {
									var Smessage = "Successfully Created Material Document Number: " + MatDocNumber + " For Material: " + MatNumber;
								}
								if (Smessage != "") {
									SuccessMsg.push(Smessage);
								}
							}
							for (var i = 0; i < SuccessMsg.length; i++) {
								var index = +i + 1;
								if (index === 1) {
									message = "\n" + index + "." + SuccessMsg[i];
								} else {
									message = message + "\n" + index + "." + SuccessMsg[i];
								}
							}
							var dialog = new Dialog({
								title: "Success",
								type: "Message",
								verticalScrolling: true,
								content: new Text({
									text: message
								}),
								beginButton: new Button({
									text: 'OK',
									press: function () {
										oRef.flagSubmit = "";
										var oList = oRef.getView().byId("Materials");
										var selectedArr = oList.getSelectedItems();
										for (var i = 0; i < selectedArr.length; i++) {
											oList.setSelectedItem(selectedArr[i], false);
										}
										oRef.getView().byId("deliveryNote").setValue("");
										var oModelMaterial = oRef.getOwnerComponent().getModel("Materials").getData();
										var len = oModelMaterial.materialSet.length;
										oModelMaterial.materialSet.splice(0, len);
										oRef.getOwnerComponent().getModel("Materials").refresh();
										dialog.close();
										var oRouter = oRef.getOwnerComponent().getRouter();
										oRouter.navTo("PutAway", {});
									}
								}),
								afterClose: function () {
									dialog.destroy();
								}
							});
							dialog.open();
						},
						function (oData) {
							if (oData.response === undefined) {
								var Errormsg = "Connection Error";
								sap.m.MessageBox.alert(Errormsg, {
									title: "Information",
									onClose: null,
									styleClass: "",
									initialFocus: null,
									textDirection: sap.ui.core.TextDirection.Inherit
								});
							} else {
								var Sresponse = JSON.parse(oData.response.body);
								var ErrorMsg = [];
								//var oModel = oRef.getOwnerComponent().getModel("Materials").getData();
								for (var x in Sresponse.error.innererror.errordetails) {
									if (Sresponse.error.innererror.errordetails[x].severity === "error") {
										var Smessage = Sresponse.error.innererror.errordetails[x].message;
										if (Smessage === "An exception was raised") {
											Smessage = "";
										} else {
											var spaceIndex = Smessage.indexOf(" ");
											var len = Smessage.length;
											var batchNo = Smessage.slice(spaceIndex, len);
											Smessage = Smessage.slice(0, spaceIndex);
											var code = Sresponse.error.innererror.errordetails[x].code;
											var i = code.indexOf('/');
											var materialIndex = code.slice(0, i);
											var index = materialIndex.trim();
											index = +index - +1;
											index = index.toString();
											//var model = oRef.getOwnerComponent().getModel("Materials").getData();
											var material = oResult.NavPoheaderPoItems[index].MaterialNumber;
											if (Smessage != "") {
												Smessage = Smessage + " for Material : " + material + " BatchNo:" + batchNo;
												ErrorMsg.push(Smessage);
											}
										}
									}
								}
								var uniqueNames = [];
								$.each(ErrorMsg, function (i, item) {
									if ($.inArray(item, uniqueNames) === -1)
										uniqueNames.push(item);
								});
								var len = uniqueNames.length;
								var message = "";
								for (var i = 0; i < len; i++) {
									var index = +i + 1;
									if (index === 1) {
										message = "\n" + index + "." + ErrorMsg[i];
									} else {
										message = message + "\n" + index + "." + ErrorMsg[i];
									}
								}
								var dialog = new Dialog({
									title: "Error",
									type: "Message",
									verticalScrolling: true,
									content: new Text({
										text: message
									}),
									beginButton: new Button({
										text: 'OK',
										press: function () {
											oRef.flagSubmit = "";
											var oList = oRef.getView().byId("Materials");
											var arr = oList.getSelectedContextPaths();
											dialog.close();
										}
									}),
									afterClose: function () {
										dialog.destroy();
									}
								});
								dialog.open();
							}
						});

				} else {
					sap.m.MessageBox.alert("Please Enter details of material", {
						title: "Information",
						onClose: null,
						styleClass: "",
						initialFocus: null,
						textDirection: sap.ui.core.TextDirection.Inherit
					});
					oRef.flagSubmit = "";
				}
				sap.ui.core.BusyIndicator.hide();
			}, 2000);

		},

		onPressBack: function () {
			var oRef = this;
			var oResult = {};
			oResult.NavDelBoxQHDelBoxQty = [];
			var flagSelected = "";
			//var selectedItem = oRef.getView().byId("Materials").getSelectedContextPaths();
			var oModel = oRef.getOwnerComponent().getModel("Materials").getData();
			for (var i = 0; i < oModel.materialSet.length; i++) {
				if (oModel.materialSet[i].MaterialSplit.length > 0) {
					flagSelected = "X";
				}
			}
			if (flagSelected === "X" && oRef.flagSubmit !== "X" && sap.ui.getCore().boxQtyVisibleFlag === "true") {
				var dialog = new Dialog({
					title: "Confirm",
					type: "Message",
					content: new Text({
						text: "Data which is not saved will be deleted are you sure you want to go back?"
					}),
					beginButton: new Button({
						text: "Yes",
						press: function () {
							for (var i = 0; i < oModel.materialSet.length; i++) {
								for (var j = 0; j < oModel.materialSet[i].MaterialSplit.length; j++) {
									oResult.NavDelBoxQHDelBoxQty.push({
										//BatchNo: oModel.materialSet[i].MaterialSplit[j].BatchNo
										PoNumber: oModel.PoNumber,
										MaterialNo: oModel.materialSet[i].MaterialNumber,
										BatchNo: oModel.materialSet[i].MaterialSplit[j].BatchNo,
										BoxId: 0,
										BoxQty: "0.000"
									});
								}
							}
							oRef.odataService.create("/DelBoxQtyHeadSet", oResult, null, function (oData, oResponse) {
									var oList = oRef.getView().byId("Materials");
									var selectedArr = oList.getSelectedItems();
									for (var i = 0; i < selectedArr.length; i++) {
										oList.setSelectedItem(selectedArr[i], false);
									}
									oRef.getView().byId("deliveryNote").setValue("");
									var len = oModel.materialSet.length;
									oModel.materialSet.splice(0, len);
									oRef.getOwnerComponent().getModel("Materials").refresh();
									var oRouter = oRef.getOwnerComponent().getRouter();
									oRouter.navTo("PutAway", {});
									MessageToast.show("Successfully deleted Box Quantity details!");
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
				var oList = oRef.getView().byId("Materials");
				var selectedArr = oList.getSelectedItems();
				for (var i = 0; i < selectedArr.length; i++) {
					oList.setSelectedItem(selectedArr[i], false);
				}
				oRef.getView().byId("deliveryNote").setValue("");
				var len = oModel.materialSet.length;
				oModel.materialSet.splice(0, len);
				oRef.getOwnerComponent().getModel("Materials").refresh();
				var oRouter = oRef.getOwnerComponent().getRouter();
				oRouter.navTo("PutAway", {});
			}
		}
	});

});