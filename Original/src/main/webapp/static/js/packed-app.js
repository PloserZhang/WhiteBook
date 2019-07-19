(function (global, ko, $) {
    //main View Modal
    function CloudStoreViewModel() {
        var self = this;
        self.mainTemplate = ko.observable("mainTemplate");
        self.titleTemplate = ko.observable("mainTitleTemplate");
        self.home = ko.observable();
        
        self.titCardInit = function(element){
            var testCanvas = new CanvasUI({element: element, fillStyle: "#1E90FF", strokeStyle: "#1E90FF", lineWidth: 3});
            element.width = $(element).width();
            element.height = $(element).height();
            testCanvas.fillStyle = testCanvas.createLinearGradient({colorArray:["#769fcd","#fefef8"],x: 0,y: 0,x1: 0,y1: element.height*2});
            testCanvas.fillRect({x: 0,y: 0,width: element.width, height: element.height });
        };
        
        self.logoCanvasInit = function(element){
            var testCanvas = new CanvasUI({element: element, fillStyle: "#1E90FF", strokeStyle: "#1E90FF", lineWidth: 3,font: "25px Verdana"});
            element.width = 160;
            element.height = 40;
            testCanvas.fillText({text: "华韵工作室", x:0,y: 30});
        };
        
        self.loginCanvas = null;
        self.loginEvent = null;
        self.loginCanvasInit = function(element){
            if(!element&&!self.loginCanvas){
                return;
            }
            element.width = $(".login-center").width();
            element.height = window.innerHeight - 100;
            self.loginCanvas = new CanvasUI({element: element, fillStyle: "240, 255, 250", strokeStyle: "240, 255, 250", lineWidth: 1});
            self.loginCanvas.fillStyle = self.loginCanvas.createLinearGradient({colorArray:["#00c1cd","#4792cd"],x: 0,y: 0,x1: 0,y1: window.innerHeight*2});
            self.loginCanvas.fillRect({x: 0,y: 0,width: window.innerWidth, height: window.innerHeight});
            
        };
        self.loginCanvasDispose = function(){
            window.removeEventListener("resize",self.loginCanvasInit);
        };
        
        self.user = ko.observable();
        
        self.checkSession = ko.pureComputed(function(){
            return false;
        });
    }
    //sammy function
    function initSammy(global){
        var app = $.sammy(function () {
            this.get('#main', function () {
                global.ViewModal.mainTemplate("mainTemplate");
            });
            this.get('#login', function () {
                global.ViewModal.mainTemplate("loginTemplate");
                window.addEventListener("resize",global.ViewModal.loginCanvasInit,false);
            });
            this.get('#novel', function () {
                global.ViewModal.mainTemplate("novelTemplate");
            });
            this.get('#novelette', function () {
                global.ViewModal.mainTemplate("noveletteTemplate");
            });
            this.get('#story', function () {
                global.ViewModal.mainTemplate("storyTemplate");
            });
            this.get('#script', function () {
                global.ViewModal.mainTemplate("scriptTemplate");
            });
            this.get('#about', function () {
                global.ViewModal.mainTemplate("aboutTemplate");
            });
            this.get('#work', function () {
                global.ViewModal.mainTemplate("aboutTemplate");
            });
        });
        app.run();
    };
    window.addEventListener("load", function () {
        global.ViewModal = new CloudStoreViewModel();
        ko.applyBindings(global.ViewModal);
        initSammy(global);
        $(document.body).find(".load_text").addClass("hidden");
    }, false);
})(this, ko,$);
