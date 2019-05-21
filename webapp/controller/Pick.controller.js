sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/m/MessageBox"
], function (Controller, History, MessageBox) {
	"use strict";

	return Controller.extend("com.axium.Axium.controller.Pick", {

		onInit: function () {
			//this.result = {};
			//this.result.items = [];

			this.odataService = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZWM_GW_RFSCREENS_SRV/", true);
			this.getView().addEventDelegate({
				onBeforeShow: jQuery.proxy(function (evt) {
					this.onBeforeShow(evt);
				}, this)
			});

		},
		onBeforeShow: function (oEvent) {
			var oRef = this;
			setTimeout(function () {
				var oInput = oRef.getView().byId("id1");
				oInput.focus();
			}, 1000);
		},

		onPressBack: function () {
			// var sHistory = History.getInstance();
			// var sPreviousHash = sHistory.getPreviousHash();
			// if (sPreviousHash !== undefined) {
			// 	window.history.go(-1);
			// } else {
			var sRouter = sap.ui.core.UIComponent.getRouterFor(this);
			sRouter.navTo("RMPickReturn", true);
			// }
			this.getView().byId("id1").setValue("");

		},
		/*	onNext: function (e) {
				var that = this;
				var tempobj = this.getView().byId("id1").getValue();
				this.odataService.read("/ScannedProductionOrderNo?ProductionOrder='" + tempobj + "'", null, null, false, function (response) {
					if (response.Message === "Invalid Production Order") {
						MessageBox.error(response.Message, {
							title: "Error",
							onClose: null,
							styleClass: "",
							initialFocus: null,
							textDirection: sap.ui.core.TextDirection.Inherit
						});
					} else {
						if (tempobj === "") {
							sap.m.MessageBox.alert("Please Scan Production order number", {
								title: "Information",
								onClose: null,
								styleClass: "",
								initialFocus: null,
								textDirection: sap.ui.core.TextDirection.Inherit
							});
						} else {
							var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
							oRouter.navTo("BOMPick", {});
							that.odataService.read("/ProductionRMPickingSet?$filter=ProductionOrder eq '" + tempobj + "'", null, null, false, function (
								response) {
								//that.result.items.push(response);     Commented by lalit
								//Start of Change by lalit
								for(var i=0; i<response.results.length; i++){
									that.result.items.push({
									MaterialNumber : response.results[i].MaterialNumber,
									MaterialDesc : response.results[i].MaterialDesc,
									ProductCode : response.results[i].ProductCode,
									ProductionOrder : response.results[i].ProductionOrder,
									RequirementQnty : response.results[i].RequirementQnty,
									MaterialSplit : []
									});	
								}
								//End of Change by lalit
								//that.getView().getModel("oTablePickAlias").setData(response);
								that.getOwnerComponent().setModel("oTablePickAlias");
								
								that.getView().getModel("oTablePickAlias").refresh(true);

							});

						}

					}

				});
				this.getView().byId("id1").setValue("");

			}*/
		onNext: function () {

			var oRef = this;
			var tempVar = this.getView().byId("id1").getValue();
			this.odataService.read("/ScannedProductionOrderNo?ProductionOrder='" + tempVar + "'", {
				success: cSuccess,
				failed: cFailed
			});

			function cSuccess(data, response) {

				if (tempVar === "") {
					sap.m.MessageBox.alert("Please Scan Production order number", {
						title: "Information",
						onClose: null,
						styleClass: "",
						initialFocus: null,
						textDirection: sap.ui.core.TextDirection.Inherit
					});

				} else {

					if (data.Message === "Invalid Production Order") {
						oRef.getView().byId("id1").setValue("");
						sap.m.MessageBox.alert("Please Enter Valid Production Order Number", {
							title: "Information",
							onClose: null,
							styleClass: "",
							initialFocus: null,
							textDirection: sap.ui.core.TextDirection.Inherit
						});
					} else {
						//MessageBox.alert("PO number is valid");
						var ponumber = oRef.getView().byId("id1").getValue();
						//var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
						var oRouter = oRef.getOwnerComponent().getRouter();
						oRouter.navTo("BOMPick", {
							poNumber: ponumber
						});

					}
					oRef.getView().byId("id1").setValue("");
				}
			}

			function cFailed(data, response) {
				sap.m.MessageBox.alert("Could not read Scanned Production Order Number", {
					title: "Information",
					onClose: null,
					styleClass: "",
					initialFocus: null,
					textDirection: sap.ui.core.TextDirection.Inherit
				});
			}
		}

	});

});