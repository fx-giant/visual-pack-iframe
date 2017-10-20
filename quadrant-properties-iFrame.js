namespace("fx.quadrantProperties")["descriptiveTrend"] = (function (ko, _, leesa, fx, fxDataContext, fxUtil, fxEnum) {
    //#region shorthand

    var observable = ko.observable;
    var computed = ko.computed;
    var pureComputed = ko.pureComputed;
    
    var enumSortingDirection = fxEnum.csSortingDirection;
    var enumDataTypeSimpleTypeDateTime = fxEnum.csDataType.simpleType.dateTime;
    var enumPropertyType = fxEnum.csPropertyType;
    var enumPropertyTypeMeasurement = enumPropertyType.measurement.name;

    var fxUnwrap = fxUtil.unwrap;
    var isMeasurement = fxUtil.isMeasurement;
    var bindingSorting = fxUtil.bindingSorting;
    var bindingPropertyType = fxUtil.bindingPropertyType;
    var getBindingName = fxUtil.bindingName;

    var isArray = _.isArray;

    //#endregion

    //#region Multi Source Key

    var resourceKey = {
        value: "value",
        target: "target"
    };

    //#endregion

    function viewModel(params) {
        //#region Param properties
        
        var fxQuadrant = params.quadrantViewModel;

        var quadrantComposer = fxQuadrant.quadrantComposer;

        var refreshQuadrant = fxQuadrant.refreshQuadrant;
        var koIsLiveSource = fxQuadrant.isLiveSource;

        var koQuadrant = quadrantComposer.quadrant;
        var koSource = quadrantComposer.source;
        var koSourceProjections = quadrantComposer.sourceProjections;
        var koVisual = quadrantComposer.visual;

        //#endregion

        //#region private properties
        var projectionEntityManager = quadrantComposer.projectionEntityManager;
        var koProjections = projectionEntityManager.entities;
        var projectionEntityManagerPush = projectionEntityManager.push.bind(projectionEntityManager);
        var projectionEntityManagerDelete = projectionEntityManager.deleteNRemove.bind(projectionEntityManager);
        var projectionEntityManagerUpdate = projectionEntityManager.replace.bind(projectionEntityManager);

        var koMeasurements = koProjections.filter(isMeasurement);

        //#endregion

        //#region Public properties

        var koValuePathBindingContext = observable();
        var koTargetPathBindingContext = observable();
        

        /**
        * During post init. This variable will then be populated.
        */
        var projectionsChangeEventSubscription = null;

        //#endregion

        //#region Computed properties

        var koSelectedConnectionSource = computed(function () { return fxQuadrant.selectedConnectionSource(); });

        //#endregion

        //#region Event Handler

        //See initEvent
        
        //#endregion

        //#region Action

        function addValuePath(connectionSourceBinding) {

            var connectionSource = connectionSourceBinding.connectionSource;
            var binding = connectionSourceBinding.binding;

            setValuePath(binding);

            var multiSourceItem = createMultiSourceItem(getOrCreateSource(), resourceKey.value, connectionSource);

            multiSourceItem.source.projections.push(binding);

            addNSetProjection(binding, koValuePathBindingContext);
        }
        
        function updateValuePath(existingBinding, newBinding) {
        }

        function deleteValuePath(binding) {
            var visual = koVisual();
            visual.valuePaths = [];
            koValuePathBindingContext(null);

            removeParameterValue(visual, "valuePaths");
            deleteMultiSourceItem(resourceKey.value);
        }

        function addTargetPath(connectionSourceBinding) {

            var connectionSource = connectionSourceBinding.connectionSource;
            var binding = connectionSourceBinding.binding;

            setTargetPath(binding);

            var multiSourceItem = createMultiSourceItem(getOrCreateSource(), resourceKey.target, connectionSource);
            multiSourceItem.source.projections.push(binding);

            addNSetProjection(binding, koTargetPathBindingContext);
        }

        function updateTargetPath(existingBinding, newBinding) {
        }

        function deleteTargetPath(binding) {
            var visual = koVisual();
            visual.targetPaths = [];
            koTargetPathBindingContext(null);

            removeParameterValue(visual, "targetPath");
            deleteMultiSourceItem(resourceKey.target);
        }

        //#endregion

        init();

        function init() {
            var sourceProjections = koSourceProjections();

            var visual = koVisual();
	    visual.isAnimated = true;

            var measurements = koMeasurements();
            convertNSetValuePathToBinding(visual, measurements);

            projectionsChangeEventSubscription = koProjections.subscribe(function (newProjectionContexts) {
                var source = koSource();
                source.projections = _.map(newProjectionContexts, fxUnwrap);
                refreshQuadrant();
            });
        }

        //#region Converter

        function convertNSetValuePathToBinding(visual, measurements) {
            var valuePath = isArray(visual.valuePaths) ? visual.valuePaths[0] : visual.valuePaths;
            convertNSetNameToBinding(measurements, valuePath, koValuePathBindingContext);
        }

        function convertNSetNameToBinding(bindings, bindingName, koObservableObject) {
            var binding = findBindingByName(bindings, bindingName);
            koObservableObject(binding);
        }

        //#endregion

        function setParameterValue(visual, value, path) {
            var parameters = visual.parameters || {};
            parameters[path] = value;
            visual.parameters = parameters;
        }

        function removeParameterValue(visual, path) {
            var parameters = visual.parameters;
            if (!parameters)
                return;
            delete parameters[path];
        }

        function setValuePath(binding) {
            var visual = koVisual();
            var newValuePath = getBindingName(binding);
            visual.valuePaths = [newValuePath];

            setParameterValue(visual, [newValuePath], "valuePaths");
            bindingPropertyType(binding, enumPropertyTypeMeasurement);
        }

        function setTargetPath(binding) {
            var visual = koVisual();
            var newTargetPath = getBindingName(binding);
            visual.targetPath = newTargetPath;

            setParameterValue(visual, newTargetPath, "targetPath");
            bindingPropertyType(binding, enumPropertyTypeMeasurement);
        }

        function addNSetProjection(binding, koObservableObject) {
            var bindingContext = addProjections(binding);
            koObservableObject(bindingContext);
        }

        function addProjections(binding) {
            var bindingContext = projectionEntityManagerPush(binding);
            //User pass in single object, single object will be return as well
            if (!isArray(binding))
                return bindingContext[0];
            return bindingContext;
        }

        function findBindingByName(bindings, bindingName) {
            //if bindingName == string, or object|aggregation
            var foundBinding = _.find(bindings, function (binding) {
                var currentBindingName = getBindingName(binding);
                return currentBindingName === bindingName;
            });
            return foundBinding;
        }

        function getOrCreateSource() {
            var multiSourceDType = "multiSource";
            var source = koQuadrant().source();
            if (source && source.dType === multiSourceDType)
                return source;

            var multiSource = {
                dType: multiSourceDType,
                multiSourceItems: []
            };

            koQuadrant().source(multiSource);

            return multiSource;
        }

        function deleteMultiSourceItem(resourceKey) {
            var multiSource = getOrCreateSource();
            var multiSourceItems = multiSource.multiSourceItems;
            var multiSourceItem = _.find(multiSourceItems,
                function (multiSourceItem) {
                    return multiSourceItem.resourceKey = resourceKey;
                });

            if (!multiSourceItem)
                return;

            var index = multiSourceItems.indexOf(multiSourceItem);
            multiSourceItems.splice(index, 1);
        }

        //#endregion

        var me = this;
        $.extend(true, me, {
            quadrantViewModel: fxQuadrant,
            selectedConnectionSource: koSelectedConnectionSource,

            // Properties
            quadrant: koQuadrant,
            quadrantComposer: quadrantComposer,
            valuePathBindingContext: koValuePathBindingContext,
            targetPathBindingContext: koTargetPathBindingContext,

            //computed

            //action
            addValuePath: addValuePath,
            addTargetPath: addTargetPath,

            updateValuePath: updateValuePath,
            updateTargetPath: updateTargetPath,

            deleteValuePath: deleteValuePath,
            deleteTargetPath: deleteTargetPath,

            //Events
            projectionsChangeEventSubscription: projectionsChangeEventSubscription
        });

        return;
    }


    function createMultiSourceItem(multiSource, resourceKey, connectionSourceContext) {
        var multiSourceItem = {
            resourceKey: resourceKey,
            source: createGiantQueryingSource(connectionSourceContext)
        };

        multiSource.multiSourceItems.push(multiSourceItem);

        return multiSourceItem;
    }


    function createGiantQueryingSource(connectionSourceContext) {

        var connectionSource = connectionSourceContext.entity || connectionSourceContext;

        return {
            dType: "giantQueryingSource",
            connectionSourceId: connectionSource.connectionSourceId,
            remoteConnectionSourceId: connectionSource.remoteConnectionSourceId,
            topBottomRows: 0,
            maximumNumberOfRows: 5000,
            projections: [],
            conditions: []
        };
    }



    viewModel.prototype.dispose = function () {
        var subscription = this.projectionsChangeEventSubscription;
        if (subscription)
            subscription.dispose();
    }

    return {
        viewModel: viewModel
    };
})(ko, _, leesa, fx, fx.DataContext, fx.util, fx.enum);