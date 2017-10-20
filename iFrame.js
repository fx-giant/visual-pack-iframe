namespace("leesa.visual").iFrame = (function(leesa, _, leesaChart) {
  //#region Constant
  var observable = ko.observable;
  var url = "https://console.api.ai/api-client/demo/embedded/2d694bc7-1cbc-4f83-bc18-f15991389822";
  //#endregion

  var iFrameChart = {
    fadeIn: function(quadrant, option) {
      option.callback();
    },
    fadeOut: function(quadrant, option) {
      option.callback();
    },
    extend: function(quadrant) {
      if (quadrant._extended("iFrame"))
        return;

      $.extend(true,
        quadrant, {
          _chartObjects: observable(),
          trend: observable(),
        });
    },
    pushDatum: function pushDatum(quadrant, datumOrData) {},
    render: function render(quadrant, callback) {
      var content = quadrant.htmlJContent();
      var visual = quadrant.visual();
      var data = quadrant.data();
      content.html("");

      //pass through template
      var containers = content;

      var jIFrame = $("<iframe />")
      jIFrame.attr({
        height: "100%",
        width: "100%",
        src: url
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
