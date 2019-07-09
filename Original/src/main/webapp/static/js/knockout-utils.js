(function (global, ko) {
    //http://knockoutjs.com/documentation/deferred-updates.html
    ko.options.deferUpdates = true;
    ko.bindingHandlers.yourBindingName = {
        init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            // This will be called when the binding is first applied to an element
            // Set up any initial state, event handlers, etc. here
        },
        update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            // This will be called once when the binding is first applied to an element,
            // and again whenever any observables/computeds that are accessed change
            // Update the DOM element based on the supplied values here.
        }
    };

})(this, ko);