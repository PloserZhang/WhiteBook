(function (global, ko, $) {
    //main View Modal
    function CloudStoreViewModel() {
        var self = this;
        self.MianTemplate = ko.observable("mianTemplate");
    }
    //sammy function
    function initSammy(global){
        var app = $.sammy(function () {
            this.get('#/', function () {
                global.ViewModal.MianTemplate("mianTemplate");
                $(document.body).find("load_text").addClass("hidden");
            });
            this.get('#/test', function () {
                $('#main').text('Hello World');
            });
        });
        app.run();
    };
    window.addEventListener("load", function () {
        global.ViewModal = new CloudStoreViewModel();
        ko.applyBindings(global.ViewModal);
        initSammy(global);
    }, false);
})(this, ko,$);
