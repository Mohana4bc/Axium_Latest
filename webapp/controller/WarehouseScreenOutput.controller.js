sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"com/axium/Axium/model/formatter"
], function (Controller, History, Filter, FilterOperator, formatter) {
	"use strict";

	return Controller.extend("com.axium.Axium.controller.WarehouseScreenOutput", {
		formatter: formatter,

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf Z_AXIUMPLASTIC.view.WarehouseScreenOutput
		 */
		onInit: function () {

			this.getView().getModel("WarehouseScreenOutputModel");
			this.getView().setModel("WarehouseScreenOutputModel");
			this.getView().addEventDelegate({
				onBeforeShow: jQuery.proxy(function (evt) {
					this.onBeforeShow(evt);
				}, this)
			});
		},
		onBeforeShow: function () {
			this.getView().getModel("WarehouseScreenOutputModel");
			this.getView().setModel("WarehouseScreenOutputModel");
		},

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf Z_AXIUMPLASTIC.view.WarehouseScreenOutput
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf Z_AXIUMPLASTIC.view.WarehouseScreenOutput
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf Z_AXIUMPLASTIC.view.WarehouseScreenOutput
		 */
		//	onExit: function() {
		//
		//	}

		onPressBack: function () {
			sap.ui.getCore().matNum = "";
			var sHistory = History.getInstance();
			var sPreviousHash = sHistory.getPreviousHash();
			if (sPreviousHash != undefined) {
				window.history.go(-1);
			} else {
				var sRouter = sap.ui.core.UIComponent.getRouterFor(this);
				sRouter.navTo("WarehouseScreen", true);
			}
		},

		onFilter: function (oEvent) {

			//build filter array
			var aFilter = [],

				sQuery = oEvent.getParameter('query'),

				oList = this.getView().byId("MainList"), //retrieve list control

				oBinding = oList.getBinding("items"); //get binding for aggregation 'Items'

			if (sQuery) {
				aFilter.push(new Filter("Material", FilterOperator.Contains, sQuery));
			}
			//apply filter. an empty filter array simply removes the filter
			//which will make all entries visible again
			oBinding.filter(aFilter);

		}

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.axium.Axium.view.WarehouseScreenOutput
		 */
		//	onInit: function() {
		//
		//	},

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf com.axium.Axium.view.WarehouseScreenOutput
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf com.axium.Axium.view.WarehouseScreenOutput
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf com.axium.Axium.view.WarehouseScreenOutput
		 */
		//	onExit: function() {
		//
		//	}

	});

});