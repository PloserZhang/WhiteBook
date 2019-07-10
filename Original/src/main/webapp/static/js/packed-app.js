(function (global, ko, i18n, ccs, PBCloud) {
//$.get("/verify")

    function CloudStoreViewModel() {
        var self = this;
        var testCanvas = null;
        self.testProgress = ko.observable(0);
        self.testCanvasInit = function(element){
            testCanvas = new CanvasUI({element: element, strokeStyle: "#1E90FF", lineWidth: 10});
            $(element).css("transform","scale(0.5,0.5)").css("transform-origin","left top");
            var cd = window.setInterval(function () {
                self.testProgress(self.testProgress() + 0.1);
                if (self.testProgress() > 100) {
                    window.clearInterval(cd);
                }
                
                testCanvas.arc({x: 70, y: 70, r: 60, startAngle: ((self.testProgress()-1) / 50), endAngle: (self.testProgress() / 50)});
            }, 10);
        };
        
        
        
        
    }
    window.addEventListener("load", function () {
        ko.applyBindings(new CloudStoreViewModel());
    }, false);
})(this, ko);
