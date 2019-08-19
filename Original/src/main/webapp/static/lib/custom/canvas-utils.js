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
        self.starChainStore = [];
        self.lastTime = null;
        
        function starObj(x, y, xInc, yInc) {
            this.x = x;
            this.y = y;
            this.xInc= xInc;
            this.YInc = yInc;
            this.color = "#F8F8FF";
            this.size = Math.ceil( Math.random()*10);
        }
        function getRandom(){
            return Math.random() * 10 > 5 ? - Math.ceil(Math.random()) * 10 :Math.ceil( Math.random() * 10);
        }
        self.initStars = function(num, width, height){
            var starNum = num || 30;
            for(var i = 0; i < starNum; i++){
                var x = Math.ceil(width*Math.random());
                var y = Math.ceil(height*Math.random());
                
                var star = new starObj(x, y, getRandom(), getRandom());
                self.stars.push(star);
            }
            if(!self.canvas){
                return;
            }
            self.canvas.fillStyle = self.canvas.createLinearGradient({colorArray:["#4876FF","#262626"],x: 0,y: 0,x1: 0,y1: window.innerHeight*2});
            self.canvas.fillRect({x: 0,y: 0,width: window.innerWidth, height: window.innerHeight});
            self.starChainStore[0] = {imgData: self.canvas.getImageData(), x: 0, y: 0};
            self.startHandler();
        };
        
        self.recover = function(){
            self.canvas.clear();
            for(var i = 0;i < self.starChainStore.length; i++){
                self.canvas.putImageData(self.starChainStore[i]);
            }
        };
        
        self.end = function(num){
            num = num || 32;
            for(var i = 0; i< self.stars().length; i++){
                var start = self.stars()[i];
                if(start.x <= 0|| start.y <= 0 || start.x > window.innerWidth || start.y > window.innerHeight || (start.xInc === 0 &&start.yInc ===0)){
                    self.stars.splice(i,1);
                }
            }
            if(self.stars().length < num){
                for(var i = 0; i< (num - self.stars().length); i++){
                    var x = Math.ceil( window.innerWidth * Math.random());
                    var y = Math.ceil( window.innerHeight * Math.random());
                    if(x > y){
                        y = 0;
                    }else{
                        x = 0;
                    }
                    var star = new starObj(x, y, getRandom(), getRandom());
                    self.stars.push(star);
                }
            }
        };
        
        self.startHandler = function (time) {//time ms/step
            if(!time){
                window.requestAnimationFrame(self.startHandler);
                return;
            }
            if (!self.lastTIme) {
                self.lastTIme = time;
                window.requestAnimationFrame(self.startHandler);
                return;
            }
            
            var timeRatio =  time - self.lastTIme;
            self.lastTIme = time;
            self.end();
            self.recover();
            for(var i =0; i< self.stars().length;i++){
                var star = self.stars()[i];
                var xInc = Math.ceil(star.xInc/50*timeRatio);
                var yInc = Math.ceil(star.YInc/50*timeRatio);
                
                star.x = xInc > 1 ? star.x + xInc: xInc < -1 ? star.x +xInc: star.x+1;
                 star.y = yInc > 1 ? star.y + yInc: yInc < -1 ? star.y +xInc: star.y+1;
                self.canvas.fillStyle = star.color;
                self.canvas.fillArc({x: star.x, y: star.y, r: star.size});
            }
            window.requestAnimationFrame(self.startHandler);
        };
        
        self.canvasInit = function(element){
            element.width = window.innerWidth;
            element.height = window.innerHeight;
            self.canvas = new CanvasUI({element: element, fillStyle: "240, 255, 250", strokeStyle: "240, 255, 250", lineWidth: 1});
            self.initStars(0,element.width,element.height);
        };
        
        window.addEventListener("resize",function(){
            self.canvasInit(self.canvas.canvas);
        },false);
    }
    
    function CustomImage(){
        var self = this;
        var canvas = null;
        self.canvasInit = function(element){
            var r = 45;
            var x = 73;
            var y = 73;
            
            canvas = new CanvasUI({element: element, fillStyle: "240, 255, 250", strokeStyle: "240, 255, 250", lineWidth: 1});
            var background =  canvas.createLinearGradient({colorArray:["#23c0ff","#26fcff"],x: 0,y: 0,x1: 200,y1:0});
            canvas.fillStyle = background;
            canvas.fillArc({x: x,y: y, r: r});
            canvas.fillStyle = "#ffffff";
            
            r = 44;
            var ctx = canvas.context;
            
            var progress = 0.7;
            var progressHeight = r * 2 * progress;
            var width, angle, height, x1, y1, x2, y2, startAngle,endAngle ;//通过进度求得的两个坐标
            
            ctx.beginPath();
            if (progressHeight > r) {
                height = progressHeight - r;
                width = Math.sqrt(r * r - Math.pow(height, 2));
                angle = Math.abs(Math.atan2(height, width)) / Math.PI;
                x1 = x -width;
                x2 = x +width;
                y1 = y - height;
                y2 = y1;
                startAngle =  1 + angle;
                endAngle = 2 - angle;
                
            } else if (progressHeight === r) {
                width = r;
                x1 = x -r;
                x2 = x +r;
                y1 = y;
                y2 = y1;
                startAngle = 1 ;
                endAngle = 2;
            } else {
                height = r - progressHeight;
                width = Math.sqrt(r * r - Math.pow(height, 2));
                angle = 0.5 - (Math.abs(Math.atan2(height, width)) / Math.PI);
                x1 = x -width;
                x2 = x +width;
                y1 = y +height;
                y2 = y1;
                startAngle = 0.5 + angle;
                endAngle = 2.5 - angle;
            }
            canvas.fillArc({x: x, y: y, r:r, startAngle: startAngle, endAngle: endAngle, isClockwise: false});

            canvas.fillStyle = background;
            canvas.strokeStyle = background;
            
            canvas.quadraticCurveTo({x0:x1, y0: y1, x1: x1 + width / 2, y1: y1-15, x2: x, y2: y2 ,isFill: true});
            canvas.line({x: x,y: y1,x1:x1, y1: y1});
            
            canvas.fillStyle = "#ffffff";
            canvas.strokeStyle = "#ffffff";
            
            canvas.quadraticCurveTo({x0:x, y0: y2, x1: x + width / 2, y1: y2+15, x2: x2, y2: y2 ,isFill: true});
            canvas.line({x: x,y: y2,x1:x2, y1: y2});
            
            
        };
        
        self.canvasInit2 = function(element){
            var progress = 0.5;
            var height = 130 - 130*progress;
            
            var canvas2 = new CanvasUI({element: element});
            canvas2.fillStyle = canvas2.createLinearGradient({colorArray:["#d7d8e4","#e5e6ee"],x: 0,y: 0,x1: -150,y1:140});
            canvas2.fillPolygon([{x: 0, y: 10}, {x: 13, y: 20}, {x: 13, y: 140}, {x: 0, y: 130}]);
            canvas2.fillStyle = canvas2.createLinearGradient({colorArray:["#dcdee8","#e9eaf1"],x: 0,y: 0,x1: 13,y1:260});
            canvas2.fillPolygon([{x: 13, y: 20}, {x: 26, y: 10}, {x: 26, y: 130}, {x: 13, y: 140}]);
            canvas2.fillStyle = canvas2.createLinearGradient({colorArray:["#e1e3eb","#dfe0ea"],x: 0,y: 0,x1: 26,y1:26});
            canvas2.fillPolygon([{x: 0, y: 10}, {x: 13, y: 0}, {x: 26, y: 10}, {x: 13, y: 20}]);
            
            canvas2.fillStyle = canvas2.createLinearGradient({colorArray:["#ff3944","#ffa3a7"],x: 0,y: 0,x1: -150,y1:140});
            canvas2.fillPolygon([{x: 0, y: 10+height}, {x: 13, y: 20+height}, {x: 13, y: 140}, {x: 0, y: 130}]);
            
            canvas2.fillStyle = canvas2.createLinearGradient({colorArray:["#ff5059","#ffebeb"],x: 0,y: 0,x1: 13,y1:260});
            canvas2.fillPolygon([{x: 13, y: 20+height}, {x: 26, y: 10+height}, {x: 26, y: 130}, {x: 13, y: 140}]);
            
            canvas2.fillStyle = canvas2.createLinearGradient({colorArray:["#ffa2a4","#ff6268"],x: 0,y: 0,x1: 26,y1:26});
            canvas2.fillPolygon([{x: 0, y: 10+height}, {x: 13, y: 0+height}, {x: 26, y: 10+height}, {x: 13, y: 20+height}]);
        };
        
        self.canvasInit3 = function(element){
            var x = 50;
            var y = 50;
            var r = 45;
            var progress = 0.5;
            var canvas3 = new CanvasUI({element: element, strokeStyle: "#dbe2ee",lineWidth: 1});
            canvas3.arc({x: x, y: y, r:r, startAngle: 0.85, endAngle: 2.15, isClockwise: false});
            canvas3.lineWidth = 6;
            canvas3.arc({x: x, y: y, r:r-6, startAngle: 0.85, endAngle: 2.15, isClockwise: false});
            canvas3.lineWidth = 1;
            canvas3.strokeStyle = canvas3.createLinearGradient({colorArray:["#ff4656","#ff956e"],x: 0,y: 0,x1: 150,y1:0});
            canvas3.arc({x: x, y: y, r:r, startAngle: 0.85, endAngle: 0.85+(2.15 - 0.85)*progress, isClockwise: false});
            canvas3.lineWidth = 6;
            canvas3.arc({x: x, y: y, r:r-6, startAngle: 0.85, endAngle: 0.85+(2.15 - 0.85)*progress, isClockwise: false});
            
        };
        
    }
    global.canvasUtil = canvasUtil;
    global.CanvasImgSourceProcessor = CanvasImgSourceProcessor;
    global.CanvasStarChain = CanvasStarChain;
    global.CustomImage = CustomImage;
})(this);

