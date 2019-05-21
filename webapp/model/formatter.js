sap.ui.define([], function () {
	"use strict";

	return {
		calculateInventory: function (Unit, Quantity) {

			var sResult = "";

			if (Unit === "EA") {
				Quantity = Quantity / 24;
				Quantity = Quantity.toFixed(2);
			}

			if (Quantity < 1000) {
				sResult = "Equals: " + Quantity + " CS (From UOM is Case)";
			} else if (Quantity < 10000) {
				sResult = "Equals: " + Quantity + " CS (From UOM is Case)";
			} else if (Quantity < 100000) {
				sResult = "Equals: " + Quantity + " CS (From UOM is Case)";
			} else if (Quantity < 1000000) {
				sResult = "Equals: " + Quantity + " CS (From UOM is Case)";
			} else if (Quantity < 10000000) {
				sResult = "Equals: " + Quantity + " CS (From UOM is Case)";
			}

			return sResult;

		},

		calculateWarehouse: function (Unit, Quantity) {

			var sResult = "";

			if (Unit === "EA") {
				Quantity = Quantity / 24;
				Quantity = Quantity.toFixed(2);
			}

			if (Quantity < 1000) {
				sResult = "Equals: " + Quantity + " CS (From UOM is Case)";
			} else if (Quantity < 10000) {
				sResult = "Equals: " + Quantity + " CS (From UOM is Case)";
			} else if (Quantity < 100000) {
				sResult = "Equals: " + Quantity + " CS (From UOM is Case)";
			} else if (Quantity < 1000000) {
				sResult = "Equals: " + Quantity + " CS (From UOM is Case)";
			} else if (Quantity < 10000000) {
				sResult = "Equals: " + Quantity + " CS (From UOM is Case)";
			}

			return sResult;

		}

	};

});