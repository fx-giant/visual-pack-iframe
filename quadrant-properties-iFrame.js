namespace("fx.quadrantProperties")["iFrame"] = (function (ko, _, leesa, fx, fxDataContext, fxUtil, fxEnum, Quill) {

    //#region shorthand

    var observable = ko.observable;
    var observableArray = ko.observableArray;
    var computed = ko.computed;
    var pureComputed = ko.pureComputed;

    var fxUnwrap = fxUtil.unwrap;
    var isArray = _.isArray;

    function viewModel(params) {

        //#region Param properties
        var fxQuadrant = params.quadrantViewModel;

        var refreshQuadrant = fxQuadrant.refreshQuadrant;

        var koIsLiveSource = fxQuadrant.isLiveSource;

        var quadrantComposer = fxQuadrant.quadrantComposer;
        var projectionEntityManager = quadrantComposer.projectionEntityManager;
        var koProjections = projectionEntityManager.entities;
        var refreshVisual = quadrantComposer.refreshVisual;
        var koQuadrant = quadrantComposer.quadrant;
        var koSource = quadrantComposer.source;
        var koVisual = quadrantComposer.visual;
        var koSelectedConnectionSource = computed(function () {
            return fxQuadrant.selectedConnectionSource();
        });

        var properties = [{
            parameterName: "url"
        }]
        //#endregion

        init();
        //#region Private Methods

        function init() {
            initProperties();
            initSubscribers();
            initValues();
            initEvents();
        }

        function initProperties() {
            //check for every property in properties, if there is no parameterBinding, then it will create a default observable
            for (var i = 0; i < properties.length; i++) {
                var property = properties[i];
                if (!("parameterBinding" in property))
                    property.parameterBinding = observable();
                //this won't replace the edit mode value, because we haven't initialize subscribers
                if ("defaultValue" in property)
                    property.parameterBinding(property.defaultValue);
            }
        }

        function initSubscribers() {
            //subscribe every observable binding in property to update the parameter value in visual parameter
            for (var i = 0; i < properties.length; i++) {
                var property = properties[i];
                var koParameterBinding = property.parameterBinding;
                var parameterName = property.parameterName;
                (function (name) {
                    koParameterBinding.subscribe(function (value) {
                        setParameterValue(name, value);
                    })

                })(parameterName)
            }
        }


        function initValues() {
            //if in edit mode there are some value, this will put the value to each particular property binding
            var parameters = koVisual().parameters || {};
            for (var i = 0; i < properties.length; i++) {
                var property = properties[i];
                var parameterValue = parameters[property.parameterName]
                if (parameterValue != undefined) {
                    property.parameterBinding(parameterValue);
                }
            }
        }

        function initEvents() {
            projectionsChangeEventSubscription = koProjections.subscribe(function (newProjectionContexts) {
                var source = koSource();
                source.projections = _.map(newProjectionContexts, fxUnwrap);
                refreshQuadrant();
            });
        }
       
        function getParameterValue(path) {
            var visual = koVisual();
            var parameters = visual.parameters || {};
            return parameters[path];
        }

        function setParameterValue(path, value) {
            var visual = koVisual();
            var parameters = visual.parameters || {};
            parameters[path] = value;
            visual.parameters = parameters;
            refreshQuadrant()
        }

        function removeParameterValue(visual, path) {
            var parameters = visual.parameters;
            if (!parameters)
                return;
            delete parameters[path];
        }

        function generatePropertyBindings() {
            var bindings = {};
            for (var i = 0; i < properties.length; i++) {
                var property = properties[i];
                var parameterName = property.parameterName;
                var parameterBinding = property.parameterBinding;
                bindings[parameterName] = parameterBinding;
            }
            return bindings;
        }

        //#endregion

        var me = this;
        $.extend(true, me, generatePropertyBindings(), {
            quadrantViewModel: fxQuadrant,
            quadrant: koQuadrant,
            quadrantComposer: quadrantComposer,
            selectedConnectionSource: koSelectedConnectionSource,
        });

        return;
    }

    viewModel.prototype.dispose = function () {}

    return {
        viewModel: viewModel
    };
})(ko, _, leesa, fx, fx.DataContext, fx.util, fx.enum, Quill);