

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
        this.text = params.hash;
        this.type = params.type;
    }
    global.menuObj = menuObj;
})(this);
