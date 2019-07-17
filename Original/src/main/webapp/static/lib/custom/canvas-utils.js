(function(global){//需要先引入canvasUI.js
    function canvasTest(){
        this.canvasInit2 = function (element) {
            var testCanvas = new CanvasUI({element: element, fillStyle: "#1E90FF", strokeStyle: "#1E90FF", lineWidth: 3});
//            testCanvas.fillRect({x:0 ,y:0, width: 200,height: 200});
//            testCanvas.setlines([{x:200, y:0},{x:250, y:50},{x:200, y:50},{x:250, y:100},{x:200, y:100},{x:200, y:150},{x:200, y:100},{x:150, y:100},{x:200, y:50},{x:150, y:50}]);
//            testCanvas.fillPolygon([{x:200, y:0},{x:250, y:50},{x:200, y:50},{x:250, y:100},{x:200, y:100},{x:200, y:150},{x:200, y:100},{x:150, y:100},{x:200, y:50},{x:150, y:50}]);
//            testCanvas.quadraticCurveTo({x0: 0, y0: 0, x1: 200, y1: 200, x2: 400, y2: 0});
//            testCanvas.bezierCurveTo({x0: 0, y0: 0, x1: 100, y1: 200, x2: 300, y2:200, x3: 400, y3: 0});
//            testCanvas.fillArc({x: 70, y: 70, r: 60, startAngle: 0, endAngle: 2});
            var ctx = testCanvas.context;
            ctx.moveTo(20, 20);           // 创建开始点
//            ctx.arcTo(150, 20, 150, 70, 50); // 创建弧
            testCanvas.arcTo({x0: 100, y0: 20, x1: 150, y1: 20, x2: 150, y2: 70, r: 50});
        };
    }
    
    function canvasUtil(){//一些进阶方法
        //function 
    }
    
    function CanvasImgSourceProcessor() {
        var self = this;
        self.imgSrc = ko.observable();
        self.canvasImgData = ko.observable();
        self.canvas = null;
        self.canvas2 = null;
        self.canvas3 = null;
        self.imageWidth = ko.observable();
        self.imageHeight = ko.observable();
        self.reduce = ko.observable(0);
        self.reduceImageData = ko.observable();

        self.imgUpload = function (element) {
            var reads = new FileReader();
            reads.readAsDataURL(element.files[0]);
            reads.onload = function (e) {
                self.imgSrc(this.result);
                self.canvas.clear();
                self.canvas2.clear();
                self.canvas.drawImage({img: this.result, x: 0, y: 0});
                window.setTimeout(function () {
                    self.imageWidth($(".sourceProcessorImg").width());
                    self.imageHeight($(".sourceProcessorImg").height());
                });
            };
        };

        self.width = ko.observable(0);
        self.height = ko.observable(0);
        self.x = ko.observable(0);
        self.y = ko.observable(0);

        self.canvasInit = function (element) {
            self.canvas = new CanvasUI({element: element, fillStyle: "#1E90FF", strokeStyle: "#1E90FF", lineWidth: 3});

            ko.computed(function () {
                if (self.width() && self.height()) {
                    window.setTimeout(function () {
                        var imgData = self.canvas.getImageData({x: self.x(), y: self.y(), width: self.width(), height: self.height()});
                        self.canvas2.clear();
                        self.canvasImgData(imgData);
                        self.canvas2.putImageData({imgData: imgData, x: self.x(), y: self.y()});
                    });
                }
                return self.x() && self.y() && self.width() && self.height();
            });
        };

        self.canvasInit2 = function (element) {
            self.canvas2 = new CanvasUI({element: element, fillStyle: "#1E90FF", strokeStyle: "#1E90FF", lineWidth: 3});
        };
        self.canvasInit3 = function (element) {
            self.canvas3 = new CanvasUI({element: element, fillStyle: "#1E90FF", strokeStyle: "#1E90FF", lineWidth: 3});
            ko.computed(function () {
                var imgData = ko.unwrap(self.canvasImgData);
                if (imgData) {
                    var reduce = self.reduce() || 0;
                    self.canvas3.clear();
                    var redImgData = self.canvas3.pixel({imgData: imgData, reduce: reduce});
                    self.canvas3.putImageData({imgData: redImgData, x: 0, y: 0, dirtyX: 0, dirtyY: 0, dirtyWidth: self.width(), dirtyHeight: self.height()});
                    self.reduceImageData(redImgData);
                }
                return self.canvasImgData() && self.reduce();
            });
        };
    }
    
    function CanvasStarChain(){
        var self = this;
        
        self.stars = ko.observableArray();
        self.canvas = null;
        
        function starObj(x, y, xInc, yInc) {
            this.x = x;
            this.y = y;
            this.xInc= xInc;
            this.YInc = yInc;
        }
        
        self.initStars = function(num){
            var starNum = num || 30;
            for(var i = 0; i < starNum; i++){
                var x = Math.ceil(window.innerWidth*Math.random());
                var y = Math.ceil(window.innerHeight*Math.random());
                
                var star = new starObj(x, y, (Math.random() * 10 > 5 ? -Math.random() * 10 : Math.random() * 10), (Math.random() * 10 > 5 ? -Math.random() * 10 : Math.random() * 10));
                self.stars.push(star);
            }
        };
        
        self.end = function(num){
            var starNum = num || Math.random()*10;
            for(var i = 0; i< self.stars.length; i++){
                var start = self.stars[0];
                if(start.x < 0|| start.y < 0){
                    self.stars.splice(new starObj(0, 0, (Math.random() * 10 > 5 ? -Math.random() * 10 : Math.random() * 10), (Math.random() * 10 > 5 ? -Math.random() * 10 : Math.random() * 10)));
                }
            }
            for(var i = 0; i < starNum; i++){
                self.stars.push(new starObj(0, 0, (Math.random() * 10 > 5 ? -Math.random() * 10 : Math.random() * 10), (Math.random() * 10 > 5 ? -Math.random() * 10 : Math.random() * 10)));
            }
        };
        
        function starHandler(time) {//time ms/step
            
            window.requestAnimationFrame(starHandler);
        }
        
        self.start = function(){
            window.requestAnimationFrame(starHandler);
        };
        
        self.canvasInit = function(element){
            element.width = window.innerWidth;
            element.height = window.innerHeight;
            self.canvas = new CanvasUI({element: element, fillStyle: "240, 255, 250", strokeStyle: "240, 255, 250", lineWidth: 1});
            self.canvas.createLinearGradient({colorArray:["#4876FF","#262626"],x: 0,y: 0,x1: 0,y1: window.innerHeight});
            self.canvas.fill()
        };
    }
    
    global.canvasUtil = canvasUtil;
    global.CanvasImgSourceProcessor = CanvasImgSourceProcessor;
    global.CanvasStarChain = CanvasStarChain;
})(this);

