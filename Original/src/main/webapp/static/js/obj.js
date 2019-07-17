

(function(global){
    global.menuObjEnum = {
        normal: 0,
        import: 1,
        danger: 2,
        warning: 3
    };
})(this);

(function(global){
    function menuObj(params){
        this.hash = params.hash;
        this.text = params.text;
        this.type = params.type;
        this.template = params.template;
    }
    global.menuObj = menuObj;
})(this);
