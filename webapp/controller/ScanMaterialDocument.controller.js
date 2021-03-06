sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/m/MessageBox"
], function (Controller, History, MessageBox) {
	"use strict";

	return Controller.extend("com.axium.Axium.controller.ScanMaterialDocument", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.axium.Axium.view.ScanMaterialDocument
		 */
		onInit: function () {
			this.odataService = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZWM_GW_RFSCREENS_SRV/", true);
			// this.getView().addEventDelegate({
			// 	onBeforeShow: jQuery.proxy(function (evt) {
			// 		this.onBeforeShow(evt);
			// 	}, this)
			// });
		},
		onPressBack: function () {
			var sRouter = sap.ui.core.UIComponent.getRouterFor(this);
			sRouter.navTo("Home", true);
			this.getView().byId("idScanMaterialDocumentNumber").setValue("");
		},

		validateMDNumber: function () {
			var oRef = this;
			var matDocNum = oRef.getView().byId("idScanMaterialDocumentNumber").getValue();
			sap.ui.getCore().matDocNum = matDocNum;
			oRef.odataService.read("/MaterialDocValidation/?MaterialDocNo='" + matDocNum + "'", {
				success: cSuccess,
				failed: cFailed
			});

			function cSuccess(data, response) {
				if (data.ValidMatDocInd === "Valid") {
					if (data.DocAlreadyPosted === "No") {
						oRef.strMatDocDetails();
					} else {
						MessageBox.error("Material movement completed");
						oRef.getView().byId("idScanMaterialDocumentNumber").setValue("");
					}

				} else {
					MessageBox.error("Please enter valid material document number");
					oRef.getView().byId("idScanMaterialDocumentNumber").setValue("");
				}

			}

			function cFailed() {
				MessageBox.error("Unable to read material document number");
				oRef.getView().byId("idScanMaterialDocumentNumber").setValue("");
			}

		},
		strMatDocDetails: function () {
			var oRef = this;
			var matDocNum = oRef.getView().byId("idScanMaterialDocumentNumber").getValue();
			oRef.getView().byId("idScanMaterialDocumentNumber").setValue("");
			var sRouter = sap.ui.core.UIComponent.getRouterFor(this);
			sRouter.navTo("STRMaterials", true);
			this.odataService.read("/MatDocDetailsSet?$filter=MaterialDocNo eq '" + matDocNum + "'", null, null, false, function (
				response) {
				oRef.getOwnerComponent().getModel("STRMatDocMaterials").setData(response);
				oRef.getOwnerComponent().getModel("STRMatDocMaterials").refresh(true);
			});
		}

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf com.axium.Axium.view.ScanMaterialDocument
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf com.axium.Axium.view.ScanMaterialDocument
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf com.axium.Axium.view.ScanMaterialDocument
		 */
		//	onExit: function() {
		//
		//	}

	});

});