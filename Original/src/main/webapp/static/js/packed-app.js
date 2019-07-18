(function (global, ko, $) {
    //main View Modal
    function CloudStoreViewModel() {
        var self = this;
        self.MianTemplate = ko.observable("mianTemplate");
        self.imgProcessor = new CanvasImgSourceProcessor();
        self.starChain = new CanvasStarChain();
        self.mainMenus = ko.observableArray([]);
        self.titleTemplate = ko.observable("mainTitleTemplate");
        
        self.getMianMenus = ko.pureComputed(function(){
            if(!self.mainMenus().length){
                self.mainMenus.push(new menuObj({text: "BACK", hash: "#index", type: menuObjEnum.normal, template: "mianTemplate"}));
                self.mainMenus.push(new menuObj({text: "IMG SOURCE PROCESSOR", hash: "#imgSourceProcessor", type: menuObjEnum.normal, template: "sourceProcessorTemplate"}));
                self.mainMenus.push(new menuObj({text: "ANIMATION", hash: "#animation", type: menuObjEnum.normal,template: "animationTemplate" }));
                self.mainMenus.push(new menuObj({text: "COLLISION TEST", hash: "#collision", type: menuObjEnum.normal,template: "collisionTemplate"}));
                self.mainMenus.push(new menuObj({text: "SKILL", hash: "#skill", type: menuObjEnum.normal,template: "skillTemplate"}));
                self.mainMenus.push(new menuObj({text: "STAR CHAIN", hash: "#starChain", type: menuObjEnum.normal,template: "starChainTemplate"}));
            }
            return self.mainMenus();
        });
    }
    //sammy function
    function initSammy(global){
        var app = $.sammy(function () {
            this.get('#index', function () {
                global.ViewModal.MianTemplate("mianTemplate");
            });
            this.get('#imgSourceProcessor', function () {
                global.ViewModal.MianTemplate("sourceProcessorTemplate");
            });
            this.get('#animation', function () {
                global.ViewModal.MianTemplate("animationTemplate");
            });
            this.get('#collision', function () {
                global.ViewModal.MianTemplate("collisionTemplate");
            });
            this.get('#skill', function () {
                global.ViewModal.MianTemplate("skillTemplate");
            });
            this.get('#starChain', function () {
                global.ViewModal.MianTemplate("starChainTemplate");
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
