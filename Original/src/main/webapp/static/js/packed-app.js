(function (global, ko, $) {
    //main View Modal
    function CanvasImgSourceProcessor(params){
        var self = this;
        var root = params.view;
        self.imgSrc = ko.observable();
        
        self.imgUpload = function(element){
            var reads = new FileReader();
            reads.readAsDataURL(element.files[0]);
            reads.onload = function (e) {
                self.imgSrc(this.result);
            };
        };
        self.canvasInit = function(){
            
        };
    };
    
    function CloudStoreViewModel() {
        var self = this;
        self.MianTemplate = ko.observable("mianTemplate");
        self.imgProcessor = new CanvasImgSourceProcessor({view: self});
        self.mainMenus = ko.observableArray([]);
        
        self.getMianMenus = ko.pureComputed(function(){
            if(!self.mainMenus().length){
                self.mainMenus.push(new menuObj({text: "Img Source Processor", hash: "#imgSourceProcessor", type: menuObjEnum.normal}));
            }
            return self.mainMenus();
        });
    }
    //sammy function
    function initSammy(global){
        var app = $.sammy(function () {
            this.get('#/', function () {
                global.ViewModal.MianTemplate("mianTemplate");
                
            });
            this.get('#imgSourceProcessor', function () {
                global.ViewModal.MianTemplate("sourceProcessorTemplate");
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
