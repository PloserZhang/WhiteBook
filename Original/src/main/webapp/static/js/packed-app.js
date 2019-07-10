(function (global, ko, i18n, ccs, PBCloud) {
//$.get("/verify")

    function CloudStoreViewModel() {
        var self = this;
        self.testProgress = ko.observable(0);
        self.testCanvasInit = function(element){
            var testCanvas = new CanvasUI({element: element, strokeStyle: "#1E90FF", lineWidth: 10});
            $(element).css("transform","scale(0.5,0.5)").css("transform-origin","left top");
            var cd = window.setInterval(function () {
                self.testProgress(self.testProgress() + 0.1);
                if (self.testProgress() > 100) {
                    window.clearInterval(cd);
                }
                
                testCanvas.arc({x: 70, y: 70, r: 60, startAngle: ((self.testProgress()-1) / 50), endAngle: (self.testProgress() / 50)});
            }, 10);
        };
        
        self.canvasInit2 = function(element){
            var testCanvas = new CanvasUI({element: element, fillStyle: "#1E90FF",strokeStyle: "#1E90FF", lineWidth: 3});
//            testCanvas.fillRect({x:0 ,y:0, width: 200,height: 200});
//            testCanvas.setlines([{x:200, y:0},{x:250, y:50},{x:200, y:50},{x:250, y:100},{x:200, y:100},{x:200, y:150},{x:200, y:100},{x:150, y:100},{x:200, y:50},{x:150, y:50}]);
//            testCanvas.fillPolygon([{x:200, y:0},{x:250, y:50},{x:200, y:50},{x:250, y:100},{x:200, y:100},{x:200, y:150},{x:200, y:100},{x:150, y:100},{x:200, y:50},{x:150, y:50}]);
//            testCanvas.quadraticCurveTo({x0: 0, y0: 0, x1: 200, y1: 200, x2: 400, y2: 0});
//            testCanvas.bezierCurveTo({x0: 0, y0: 0, x1: 100, y1: 200, x2: 300, y2:200, x3: 400, y3: 0});
//            testCanvas.fillArc({x: 70, y: 70, r: 60, startAngle: 0, endAngle: 2});
            var ctx = testCanvas.context;
            ctx.moveTo(20, 20);           // 创建开始点
//            ctx.arcTo(150, 20, 150, 70, 50); // 创建弧
            testCanvas.arcTo({x0: 100,y0: 20,x1:150,y1:20,x2: 150, y2:70,r:50});
            
        };
        
        
        
        
    }
    window.addEventListener("load", function () {
        ko.applyBindings(new CloudStoreViewModel());
    }, false);
})(this, ko);
