(function (global, ko, i18n, ccs, PBCloud) {
//$.get("/verify")

    function CloudStoreViewModel() {
    }
    window.addEventListener("load", function () {
        ko.applyBindings(new CloudStoreViewModel());
    }, false);
})(this, ko, i18n, ccs, PBCloud);
