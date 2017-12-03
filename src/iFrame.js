namespace("leesa.visual").iFrame = (function (leesa, _, leesaChart) {
	//#region Constant
	var observable = ko.observable;
	//#endregion

	var iFrameChart = {
		fadeIn: function (quadrant, option) {
			option.callback();
		},
		fadeOut: function (quadrant, option) {
			option.callback();
		},
		extend: function (quadrant) {
			if (quadrant._extended("iFrame"))
				return;

			$.extend(true,
				quadrant, {
					_chartObjects: observable(),
					trend: observable(),
				});
		},
		pushDatum: function pushDatum(quadrant, datumOrData) { },
		render: function render(quadrant, callback) {
			var content = quadrant.htmlJContent();
			var visual = quadrant.visual();
			var data = quadrant.data();
			content.html("");
			var parameters = visual.parameters;
			var url = parameters.url || "http://www.fusionexgiant.com";

			//pass through template
			var containers = content;

			var jIFrame = $("<iframe class='nice-iframe'></iframe>")
			jIFrame.attr({
				src: url,
				frameBorder: 0
			});
			jIFrame.appendTo(content);
			callback(quadrant);
		},

		configuration: {}
	};

	return iFrameChart;

	//#region private methods
	//#endregion

})(leesa, _, namespace("leesaChart"));
