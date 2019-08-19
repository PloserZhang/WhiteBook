(function (global, factory) {
    global.CanvasUI = factory;
})(this, function(CanvasInitParams){
    var self = this;
    self.canvas = CanvasInitParams.element;
    self.context = CanvasInitParams.context2D || self.canvas.getContext("2d");
    self.pats = [];
    self.gradients = [];
    self.canvasStorage = [];
    
    //attribute
    self.fillStyle = CanvasInitParams.fillStyle;//context.fillStyle=color|gradient|pattern; 颜色 渐变 图 
    self.strokeStyle = CanvasInitParams.strokeStyle;//context.strokeStyle=color|gradient|pattern;
    self.shadowColor = CanvasInitParams.shadowColor;//color 
    self.shadowBlur = CanvasInitParams.shadowBlur;// shadow area
    self.shadowOffsetX = CanvasInitParams.shadowOffsetX;
    self.shadowOffsetY = CanvasInitParams.shadowOffsetY;
    
    //line
    self.lineCap = CanvasInitParams.lineCap;//context.lineCap = butt添加平直的边缘|round圆形线帽|square正方形线帽
    self.lineJoin = CanvasInitParams.lineJoin;//context.lineJoin = bevel斜角|round圆角|miter尖角
    self.lineWidth = CanvasInitParams.lineWidth;//像素
    self.miterLimit = CanvasInitParams.miterLimit;//像素 斜角对接长度
    
    
    //font
    self.font = CanvasInitParams.font;//与css font属性相同 context.font="italic[字体样式] small-caps[字体变体] bold【字体粗细】 12px【字体大小，杭高】 arial【font-family】"等;
    self.textAlign = CanvasInitParams.textAlign;//center文字中心点在坐标中心 | end 文字结束为止在坐标点| left 左对齐| right 右对齐| start 默认
    self.textBaseLine = CanvasInitParams.textBaseLine;//alphabetic默认|top 方框顶端|hanging上半部分为基线|middle基线为文字中心|ideographic下半部分为基线|bottom 最底部为基线
    //context font function
    //fillText("test",x,y)
    //strokeText("test",x,y)
    //measureText("text") 返回一个对象，有以像素计的字体宽度等measureText("text").width
    
    //合成
    self.globalAlpha = CanvasInitParams.globalAlpha;//透明度0.0～1.0
    self.globalCompositeOperation = CanvasInitParams.globalCompositeOperation;//有点高级需要消化
    //source-over【默认：覆盖】 | source-atop【】 | source-in【】 | source-out 【】 |destination-over【再源图像上显示目标图像】|destination-atop|destination-in|destination-out
    // lighter【混合】| copy 【显示源图像。忽略目标图像】|xor 【使用异或操作对源图像与目标图像进行组合。】
    
    
    //function 
    
    //背景图像重叠
    self.setPattern = function(params){//预存pat背景，img要求是element
        var img = params.img;
        var repeat = params.repeat||repeat;//repeat|repeat-x|repeat-y|no-repeat
        var name = params.name;
        var pattern = self.context.createPattern(img, repeat);
        if(img && name){
            for(var i= 0; i< self.pats.length; i++){
                if(self.pats[i].name === name){//
                    self.pats[i].pat = pattern;
                    return false;
                }
            }
            self.pats.push({name: name, pat: pattern});
        }
    };
    self.getPatterm = function(name){
        for(var i = 0; i< self.pats.length; i++){
            if(self.pats[i].name === name){
                return self.pats[i].pat;
            }
        }
        console.log("no find pat.(getPatterm)");
        return false;
    };
    self.createPattern= function(img, repeat){
        if(img){
            self.context.fillStyle=self.context.createPattern(img,repeat || 'repeat');
        }
    };
    //普通渐变
    self.createLinearGradient = function (params) {
        var x = params.x || 0, y = params.y || 0, x1 = params.x1 || 0, y1 = params.y1 || 0;
        var colorArray = params.colorArray;
        var gradient = self.context.createLinearGradient(x, y, x1, y1);
        if (colorArray) {
            for (var i = 0; i < colorArray.length; i++) {
                gradient.addColorStop(i / colorArray.length, colorArray[i]);
            }
        } else {
            gradient.addColorStop(0, "black");
            gradient.addColorStop(1, "white");
        }
        return gradient;
    };
    //圆形渐变
    self.createRadialGradient = function (params) {
        var x0 = params.x0 || 0, y0 = params.y0 || 0, r0 = params.r0 || 0;
        var x1 = params.x1 || 0, y1 = params.y1 || 0, r1 = params.r1 || 0;
        var colorArray = params.colorArray;
        var gradient = self.context.createLinearGradient(x0, y0, r0, x1, y1, r1);
        if (colorArray) {
            for (var i = 0; i < colorArray.length; i++) {
                gradient.addColorStop(i / colorArray.length, colorArray[i]);
            }
        } else {
            gradient.addColorStop(0, "black");
            gradient.addColorStop(1, "white");
        }
        return gradient;
    };
    // set  get gradient function
    self.setGradient = function(params){//预存pat背景，img要求是element
        var gradient = params.gradient;
        var name = params.name;
        if(gradient && name){
            for(var i= 0; i< self.gradients.length; i++){
                if(self.gradients[i].name === name){//
                    self.gradients[i].gradient = gradient;
                    return false;
                }
            }
            self.gradients.push({name: name, gradient: gradient});
        }
    };
    
    self.getGradient = function(name){
        for (var i = 0; i < self.gradients.length; i++) {
            if (self.gradients[i].name === name) {//
                return self.gradients[i].gradient;
            }
        }
        return false;
    };
    
    self.save = function(){
        self.context.save();
    };
    
    self.restore = function(){//还原上一次存储的图像
        self.context.restore();
    };
    
    
    self.stroke = function(){
        self.context.lineWidth = self.lineWidth;
        self.context.strokeStyle = self.strokeStyle;
        self.context.stroke();
    };
    
    self.fill = function(){
        self.context.fillStyle = self.fillStyle;
        self.context.fill();
    };
    
    self.clear = function(){//clearRect not clear
//        self.context.clearRect(0, 0, self.context.width, self.context.height);
        var width = self.canvas.width;
        self.canvas.width = 0;
        self.canvas.width = width;
    };
    
    //清空矩形区域
    self.clearRect = function (parmas) {
        self.context.beginPath();
        var parmas = parmas || {};
        var x = parmas.x||0, y = parmas.y||0, width = parmas.width||self.canvas.width, height = parmas.height||self.canvas.height;
        self.context.clearRect(x, y, width, height);
    };
    
    //限定区域绘制
    self.clipRect = function(params){
        var x = params.x || 0, y = params.y || 0, width = params.width, height = params.height;
        self.context.save();
        self.context.fillRect(x,y,width,height);
    };
    
    
    //标准图形
    self.rect = function (params) {
        self.context.beginPath();
        var x = params.x || 0, y = params.y || 0, width = params.width, height = params.height;
        if (width && height) {
            self.context.rect(x, y, width, height);
            self.stroke();
        }
    };
    
    self.fillRect = function (params) {
        self.context.beginPath();
        var x = params.x || 0, y = params.y || 0, width = params.width, height = params.height;
        if (width && height) {
            self.context.fillStyle = self.fillStyle;
            self.context.fillRect(x, y, width, height);
        }
    };
    
    //圆角矩形
    self.roundedRect = function ( x, y, width, height, radius) {
        var ctx = self.context;
        ctx.beginPath();
        ctx.moveTo(x, y + radius);
        ctx.lineTo(x, y + height - radius);
        ctx.quadraticCurveTo(x, y + height, x + radius, y + height);
        ctx.lineTo(x + width - radius, y + height);
        ctx.quadraticCurveTo(x + width, y + height, x + width, y + height - radius);
        ctx.lineTo(x + width, y + radius);
        ctx.quadraticCurveTo(x + width, y, x + width - radius, y);
        ctx.lineTo(x + radius, y);
        ctx.quadraticCurveTo(x, y, x, y + radius);
        ctx.stroke();
    };
    
    self.line = function(params){
        var x = params.x,y = params.y, x1 = params.x1, y1 = params.y1;
        var ctx = self.context;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x1, y1);
        
        self.stroke();
    };
    
    self.setlines = function(lineArray){//多条线 lineArray obj = {x: 0,y: 0}
        self.context.beginPath();
        self.context.moveTo(lineArray[0].x,lineArray[0].y);
        for(var i= 1; i < lineArray.length; i++){
            self.context.lineTo(lineArray[i].x, lineArray[i].y);
        }
        self.stroke();
    };
    
    function polygon(lineArray){
        self.context.beginPath();
        self.context.moveTo(lineArray[0].x,lineArray[0].y);
        for(var i= 1; i < lineArray.length; i++){
            self.context.lineTo(lineArray[i].x, lineArray[i].y);
        }
        self.context.closePath();
    }
    
    self.strokePolygon = function(lineArray){//多边形（多条线加闭合）
        polygon(lineArray);
        self.stroke();
    };
    self.fillPolygon = function(lineArray){//多边形（多条线加闭合）
        polygon(lineArray);
        self.fill();
    };
    
    
    self.quadraticCurveTo = function(params){//三点曲线（二次贝塞尔曲线） 
        var x0 = params.x0 || 0, y0 = params.y0;
        var x1 = params.x1 || 0, y1 = params.y1;
        var x2 = params.x2 || 0, y2 = params.y2;
        var isFill = params.isFill;
        self.context.beginPath();
        self.context.moveTo(x0, y0);
        self.context.quadraticCurveTo(x1,y1,x2,y2);
        if(isFill){
            self.fill();
        }else{
            self.stroke();
        }
        
    };
    
    self.bezierCurveTo = function(params){//四点曲线（三次贝塞尔曲线）
        var x0 = params.x0 || 0, y0 = params.y0;
        var x1 = params.x1 || 0, y1 = params.y1;
        var x2 = params.x2 || 0, y2 = params.y2;
        var x3 = params.x3 || 0, y3 = params.y3;
        var isFill = params.isFill;
        self.context.beginPath();
        self.context.moveTo(x0, y0);
        self.context.bezierCurveTo(x1,y1,x2,y2,x3,y3);
        if(isFill){
            self.fill();
        }else{
            self.stroke();
        }
    };
    
    function arcFunc(params){
        var x = params.x,y = params.y,r = params.r;
        var startAngle = params.startAngle ||0;//1代表180度
        var endAngle = params.endAngle || 2;
        var isClockwise = params.isClockwise;
        var ctx=self.context;
        ctx.beginPath();
        ctx.arc(x, y, r, startAngle * Math.PI, endAngle * Math.PI, isClockwise);
    }
    
    self.arc = function(params){//圆形
        arcFunc(params);
        self.stroke();
    };
    self.fillArc = function(params){//实心圆
        arcFunc(params);
        self.fill();
    };
    
    self.arcTo = function(params){//两点切线圆  如果只要画弧线，需要x1-r = x0， x0 = x1 && y0 =y1 弧线不出现
        var x0 = params.x0,y0 = params.y0,x1 = params.x1,y1 = params.y1,x2 = params.x2,y2 = params.y2,r = params.r;
        self.context.moveTo(x0, y0);
        self.context.arcTo(x1,y1,x2,y2,r);
        self.stroke();
    };
    

    
    self.fillText = function (params) {
        var text = params.text, x = params.x, y = params.y;
        var ctx = self.context;
        ctx.font = self.font;
        ctx.textAlign = self.textAlign;
        ctx.textBaseLine = self.textBaseLine;
        ctx.fillText(text, x, y);
    };
    
    self.strokeText = function (params) {
        var text = params.text, x = params.x, y = params.y;
        var ctx = self.context;
        ctx.font = self.font;
        ctx.textAlign = self.textAlign;
        ctx.textBaseLine = self.textBaseLine;
        ctx.strokeText(text, x, y);
    };
    
    self.getTextWidth = function(text){
        self.context.font = self.font;
        self.context.measureText(text).width;
    };
    
    self.drawImage = function(params){
        self.context.beginPath();
        var img = params.img, x = params.x, y = params.y;
        var width = params.width, height = params.height;
        if (!img){ return false;};// 图像数据为空
        if(typeof img === "string"){//图像数据为base64字符串，需要处理
            var image = document.createElement("img");
            image.setAttribute("src",img);
            image.onload = function(){
                if(width && height){
                    self.context.drawImage(image,x,y,width,height);
                }else{
                    if(image.width > self.canvas.width){
                        self.context.drawImage(image,x,y,self.canvas.width,image.height*(self.canvas.width/image.width));
                    }else{
                        self.context.drawImage(image,x,y);
                    }
                }
            };
        }else if(width && height){
            self.context.drawImage(img, x, y, width, height);
        }else {
            self.context.drawImage(img, x, y);
        }
        
    };
    
    self.drawAndDealImage = function(params){//绘制图形，包含裁剪等
        var img = params.img, x = params.x, y = params.y;
        var sx = params.sx||x, sy = params.sy||y, swidth = params.swidth||img.width, sheight = params.sheight||img.height
        , width = params.width||img.width, height = params.height||img.height;
        img.onload = function(){//如果初次加载失败，重新加载
            sx = sx||x;
            sy = sy||y;
            swidth = swidth||img.width;
            sheight = sheight||img.height;
            width = width||img.width;
            height = height||img.height;
            self.context.drawImage(img,sx,sy,swidth,sheight,x,y,width,height);
        };
        self.context.drawImage(img,sx,sy,swidth,sheight,x,y,width,height);
    };
    
    self.getImageData = function(params){//获得固定位置的画布图像数据
        var params = params || {};
        var x = params.x || 0, y = params.y || 0, width = params.width||self.canvas.width, height = params.height||self.canvas.height;
        return self.context.getImageData(x, y, width, height);
    };
    
    self.putImageData = function (params) {//将图片资源放入某个区域
        var imgData = params.imgData, x = params.x, y = params.y;
        var dirtyX = params.dirtyX, dirtyY = params.dirtyY, dirtyWidth = params.dirtyWidth, dirtyHeight = params.dirtyHeight;
        if((dirtyX && dirtyY) || (dirtyWidth && dirtyHeight)){
            self.context.putImageData(imgData,x,y,dirtyX,dirtyY,dirtyWidth,dirtyHeight);
        }else{
            self.context.putImageData(imgData,x,y);
        }
        
    };
    
    function getReduceArray(imgDataArray,width){
        var rowNum =  width*4;
        var reduceArray = [];
        for(var i =0; i< imgDataArray.length; i+=rowNum*2){
            for(var j = 0; j< rowNum; j+=8){
//                var px1 = {r: imgDataArray[j],b: imgDataArray[j+1],y:imgDataArray[j+2],z:imgDataArray[j+3]};
//                var px2 = {r: imgDataArray[j+4],b: imgDataArray[j+5],y:imgDataArray[j+6],z:imgDataArray[j+7]};
                var index = i+j;
                var nextRowIndex = index+rowNum;
               
//                var px3 = {r: imgDataArray[nextRowIndex],b: imgDataArray[nextRowIndex+1],y:imgDataArray[nextRowIndex+2],z:imgDataArray[nextRowIndex+3]};
//                var px4 = {r: imgDataArray[nextRowIndex+4],b: imgDataArray[nextRowIndex+5],y:imgDataArray[nextRowIndex+6],z:imgDataArray[nextRowIndex+7]};
                
                var r = (imgDataArray[index]+imgDataArray[index+4]+imgDataArray[nextRowIndex]+imgDataArray[nextRowIndex+4])/4;
                var b = (imgDataArray[index+1]+imgDataArray[index+5]+imgDataArray[nextRowIndex+1]+imgDataArray[nextRowIndex+5])/4;
                var y = (imgDataArray[index+2]+imgDataArray[index+6]+imgDataArray[nextRowIndex+2]+imgDataArray[nextRowIndex+6])/4;
                var z = (imgDataArray[index+3]+imgDataArray[index+7]+imgDataArray[nextRowIndex+3]+imgDataArray[nextRowIndex+7])/4;
                reduceArray.push(r);
                reduceArray.push(b);
                reduceArray.push(y);
                reduceArray.push(z);
            }
        }
        
        return reduceArray;
    };
    
    self.reduce = function(params){//need canvas's imageData obj 缩放
        var imgData = params.imgData,reduce = params.reduce;
        var height = imgData.height;
        var width = imgData.width;
        var dataArray = imgData.data;
        for(var i = 0; i < reduce; i++){
            dataArray = getReduceArray(dataArray, width);
            width = width/2;
            height = height/2;
        }
        var newImgData = self.context.createImageData(width,height);
        for(var i = 0; i< dataArray.length; i++){
            newImgData.data[i] = dataArray[i];
        }
        return newImgData;
    };
    
    function getPixedArrayData(imgDataArray,width){
        var rowNum =  width*4*2;
        var reduceArray = [];
        var rowIndex = 0;
        var imgDataIndex =0;
        reduceArray.length = imgDataArray.length * 4;
        for(var i =0; i< reduceArray.length; i+=rowNum*2){
            for(var j = 0; j< rowNum; j+=8){
                var index = i+j;
                var nextRowIndex = index+rowNum;
                
                var r = imgDataArray[imgDataIndex++];
                var b = imgDataArray[imgDataIndex++];
                var y = imgDataArray[imgDataIndex++];
                var z = imgDataArray[imgDataIndex++];
                
                reduceArray[index] = r;
                reduceArray[index+4]= r;
                reduceArray[nextRowIndex] = r;
                reduceArray[nextRowIndex+4] =r;
                
                reduceArray[index+1]= b;
                reduceArray[index+5]= b;
                reduceArray[nextRowIndex+1]= b;
                reduceArray[nextRowIndex+5]= b;
                
                reduceArray[index+2] = y;
                reduceArray[index+6] = y;
                reduceArray[nextRowIndex+2] = y;
                reduceArray[nextRowIndex+6] = y;
                
                reduceArray[index+3] =z;
                reduceArray[index+7] =z;
                reduceArray[nextRowIndex+3] =z;
                reduceArray[nextRowIndex+7] =z;
            }
            rowIndex++;
        }
        return reduceArray;
    };
    
    self.pixel = function(params){
        var reduce = params.reduce;
        var newImgData = self.reduce(params);
        var width = newImgData.width;
        var dataArray = [];
        for(var i = 0;i < newImgData.data.length;i++){
            dataArray.push(newImgData.data[i]);
        }
        for(var i = 0; i < reduce; i++){
            dataArray = getPixedArrayData(dataArray, width);
            width = width*2;
        }
        var newImgData2 = self.context.createImageData(params.imgData);
        for(var i = 0; i< newImgData2.data.length; i++){
            newImgData2.data[i] = dataArray[i];
        }
        return newImgData2;
    };
    
    self.getNewImageData = function(x,y){//data每四条数据为一个像素点，
        return self.context.createImageData(x,y);
    };
    
    self.checkPoint = function(x,y){
        return self.context.isPointInPath(x,y);
    };
    
    self.scale = function(sx,sy){//缩放 x 为横向放大 y为纵向放大 1=100% 2=200% 0.1=10%
        self.context.scale(sx,sy);
    };
    
    self.rotate = function(degrees){//旋转 单位：角度
        self.context.rotate(degrees*Math.PI/180);
    };
    
    self.translate = function(x,y){//调整坐标偏移，在执行方法后，新的绘制会添加到x和y上
        self.context.translate(x,y);
    };
    
    self.setTransform = function(a,b,c,d,e,f){//这边空间扭曲有些复杂，暂时只对应方法，不做自定义
        self.context.setTransform(a,b,c,d,e,f);
    };
    
    
   
});


