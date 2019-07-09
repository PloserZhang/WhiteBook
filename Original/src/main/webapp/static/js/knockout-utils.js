(function (global, ko) {
    //http://knockoutjs.com/documentation/deferred-updates.html
    //Set this to false to make it easy to debug
    ko.options.deferUpdates = true;

//    //http://stackoverflow.com/questions/30219427/rate-limiting-all-observables-by-default
//    (function () {
//        var originalObservableFn = ko.observable;
//        ko.observable = function (x) {
//            return originalObservableFn.apply(ko,[x]).extend({rateLimit: 50});
//        };
//        ko.observable.bind(ko);
//    })();

//    ko.options.useOnlyNativeEvents=true;
//    
//    if("REP.prod.REP"==="true")
//    {
//        //http://stackoverflow.com/questions/13942279/knockoutjs-prevent-event-bubbling-for-elements-with-no-handler?answertab=active#tab-top
//        ko.bindingProvider.instance.preprocessNode = function(node) {
//            if (node.removeAttribute && node.hasAttribute && node.hasAttribute('data-bind')) {
//                setTimeout(function() {
//                    node.removeAttribute('data-bind');
//                }, 0);
//            }
//        };
//    }
    ko.peek = ko.utils.peekObservable;
    ko.bindingHandlers.preventBubble = {
        init: function (element, valueAccessor) {
            var eventNames = ko.utils.unwrapObservable(valueAccessor());
            var names = eventNames.split(",");
            ko.utils.arrayForEach(names, function (eventName) {
                ko.utils.registerEventHandler(element, eventName, function (event) {
                    event.cancelBubble = true;
                    if (event.stopPropagation) {
                        event.stopPropagation();
                    }
                });
            });
        }

    };
    ko.bindingHandlers.traceNativeEvent = {
        init: function (element, valueAccessor) {
            var eventNames = ko.utils.unwrapObservable(valueAccessor());
            var names = eventNames.split(",");
            function trackEvents(target, eventName) {
                target.addEventListener(eventName, function (event) {
                    console.log("Trace output " + eventName + " DefaultPrevented " + (event.cancelBubble || (typeof event.returnValue !== 'undefined' && !event.returnValue)) + " on ");

                    console.log("Trace output " + eventName + " on ");
                    console.log(event);
                    console.log(target);

                }, false);

                if (target.parentNode && target.parentNode !== target) {
                    trackEvents(target.parentNode, eventName);
                }

            }
            ko.utils.arrayForEach(names, function (eventName) {
                trackEvents(element, eventName);
            });
        }
    };
    ko.bindingHandlers.traceJQueryEvent = {
        init: function (element, valueAccessor) {
            var eventNames = ko.utils.unwrapObservable(valueAccessor());
            var names = eventNames.split(",");
            function trackEvents(target, eventName) {
                $(target).on(eventName, function (event) {

                    console.log("Trace output " + eventName + " DefaultPrevented " + event.isDefaultPrevented() + " on ");
                    console.log(event);
                    console.log(target);

                });

                if (target.parentNode && target.parentNode !== target) {
                    trackEvents(target.parentNode, eventName);
                }

            }
            ko.utils.arrayForEach(names, function (eventName) {
                trackEvents(element, eventName);
            });
        }
    };

    ko.bindingHandlers['readonly'] = {
        init: function (element, valueAccessor) {
            var value = ko.utils.unwrapObservable(valueAccessor());
            if(value){
                window.setTimeout(function(){
                    if(!element.value){
                        $(element).attr({"unselectable":"on","onfocus":"this.blur()"});
                    }
                },10);
            }
        },
        'update': function (element, valueAccessor) {
            var value = ko.utils.unwrapObservable(valueAccessor());
            if (!value && element.readOnly){
                element.readOnly = false;
                $(element).removeAttr("unselectable onfocus");
            }else if (value && !element.readOnly){
                element.readOnly = true;
                if(!element.value){
                    $(element).attr({"unselectable":"on","onfocus":"this.blur()"});
                }
            }
        }
    };

    ko.bindingHandlers.autogrow = {
        init: function (element, valueAccessor, allBindingsAccessor) {
            var value = ko.utils.unwrapObservable(valueAccessor());
            if ('width' === value) {

                function autowidth(e) {
                    if ($("#hidden_span").length === 0) {
                        //not loaded yet
                        return;
                    }
                    $("#hidden_span").html("");
                    var p = $('<p/>');
                    p.text($(element).val());
                    $("#hidden_span").append(p);
                    var obligate = $(element).attr("obligate-width");
                    if (obligate) {
                        obligate = parseInt(obligate);
                    }
                    if (obligate == 0) {
                        obligate = 100;
                    }
                    try {
                        var hidden_span_scroll_width = $("#hidden_span")[0].scrollWidth + 10;
                        if (hidden_span_scroll_width > window.innerWidth - obligate) {
                            hidden_span_scroll_width = window.innerWidth - obligate;
                        }
                        $(element).css("width", hidden_span_scroll_width);
                    } catch (e)
                    {

                    }
                }

                $(element).on('keyup', autowidth);
                $(element).on('input', autowidth);
                autowidth();
                $(window).on("resize orientationchange", autowidth);
            } else if ('height' === value || value) {
                autosize(element);
            }
        },
        update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            var value = ko.utils.unwrapObservable(valueAccessor());
            if (value)
                autosize(element);
            else
                autosize.destroy(element);
        }
    };

    ko.bindingHandlers.sort = {
        //http://stackoverflow.com/questions/14932259/knockout-js-table-sorting-using-column-headers
        //http://jsfiddle.net/brendonparker/6S85t/
        init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var value = valueAccessor();
            var compare = value.compare;
            var sign = value.sign;
            var callback = value.callback;

            if (!compare) {
                value.bind = ko.utils.unwrapObservable(value.bind);
                var comp = window.getCompareByType(value.type);
                
                var exprStr = ko.utils.unwrapObservable(value.bind);
                var functionBody = "with($data||{}){return(" + exprStr + ")}";
                var expr = new Function('$root', '$data', functionBody);
                expr = expr.bind(value.data, value.root);
            }

            ko.utils.registerEventHandler(element, "click", function () {
                var data = value.data;
                var elem = $(element);
                if (value.selector) {
                    elem = $(elem).parent(value.selector);
                }
                var iconSelector = "i";
                if (value.icon) {
                    iconSelector = value.icon;
                }
                var iconElem = $(elem.find(iconSelector)[0]);
                var asc = iconElem.hasClass("fa-arrow-up");
                asc = !asc;
                //or fa-long-arrow-up/fa-long-arrow-down?
                elem.parent().find(".fa-arrow-up").removeClass("fa-arrow-up");
                elem.parent().find(".fa-arrow-down").removeClass("fa-arrow-down");
                if (asc) {
                    iconElem.removeClass("fa-arrow-down");
                    iconElem.addClass("fa-arrow-up");
                    iconElem.attr("title", l10n("tab.ascendingOrder"));
                } else {
                    iconElem.removeClass("fa-arrow-up");
                    iconElem.addClass("fa-arrow-down");
                    iconElem.attr("title", l10n("tab.descendingOrder"));
                }
                data.sort(function (left, right) {
                    var rec1 = left;
                    var rec2 = right;

                    if (!asc) {
                        rec1 = right;
                        rec2 = left;
                    }
                    
                    if (!compare) {
                        rec1 = expr(rec1);
                        rec2 = expr(rec2);
                        return rec1 === rec2 ? 0 : comp(rec1, rec2);
                    } else {
                        return compare(rec1, rec2);
                    }
                });

                if (callback) {
                    callback(asc, value.type, sign);
                }
            });
        }
    };


    ko.bindingHandlers.smartshow = {
        init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            var selector = ko.utils.unwrapObservable(valueAccessor());
            ko.utils.registerEventHandler(element, "mouseover", function () {
                var data = bindingContext['$data'];
                if (data.smartshow)
                    data.smartshow(true);
                data.smartToShow = true;
                window.setTimeout(function () {
                    if (data.smartToShow)
                        $(element).find(selector).removeClass("smarthidden");
                }, 10);

            });
            ko.utils.registerEventHandler(element, "mouseout", function (event) {
//                var elem = event.target;
//                if(jQuery.contains( element, elem )){
//                    return;
//                }

                //not hidde datepicker field
                var data = bindingContext['$data'];
                data.smartToShow = false;
                window.setTimeout(function () {
                    if (!data.smartToShow) {
                        if ($(element).hasClass("smartcheck") && $(element).find(selector).hasClass("checkbox-custom")) {
                            if ($(element).find(selector).find("input[type=checkbox]").is(':checked')) {
                                return;
                            }
                        }
                        if (data.smartshow)
                            data.smartshow(false);
                        var dataBind = $(element).find(selector).attr('data-bind');
                        if (!dataBind || (dataBind.indexOf('datepicker') === -1 && dataBind.indexOf('clearicon') === -1))
                            $(element).find(selector).addClass("smarthidden");
                    }
                }, 50);


            });
        }

    };
    function hoverOperators(onlyIn, element, valueAccessor, allBindings, viewModel, bindingContext) {
        var toggle = valueAccessor();
        ko.utils.registerEventHandler(element, "mouseover", function () {
            toggle(true);
        });
        if (!onlyIn) {
            ko.utils.registerEventHandler(element, "mouseout", function (event) {
                toggle(false);
            });
        }
    }
    ko.bindingHandlers.hover = {};
    ko.bindingHandlers.hover.init = hoverOperators.bind(ko.bindingHandlers.hover, false);
    ko.bindingHandlers.hoverIn = {};
    ko.bindingHandlers.hoverIn.init = hoverOperators.bind(ko.bindingHandlers.hoverIn, true);

    ko.bindingHandlers.autowidth = {
        init: function (element, valueAccessor) {
            var config = ko.utils.unwrapObservable(valueAccessor());
            var expr = function () {
                return window.innerWidth * config / 100;
            };
            if (typeof config === "object") {
                var related;
                if (config.closest)
                    related = $(element).closest(config.closest);
                else if (config.related)
                    related = $(config.related);
                else
                    related = $($(element).prev()[0]);

                var functionBody = "with({}){return(" + config.expr + ")}";
                var realtedFunc = new Function('$related', 'width', 'element', functionBody);

                expr = function () {
                    return realtedFunc(related, related.width(), $(element));
                };
            }
            function resize() {
                setTimeout(function () {
                    if ($(element).is(':visible')) {
                        $(element).width(expr());
                    }
                }, 10);
            }
            $(window).on("resize orientationchange", function () {
                resize();
            });
            resize();
        }
    };
    ko.bindingHandlers.autoheight = {
        init: function (element, valueAccessor) {
            var config = ko.utils.unwrapObservable(valueAccessor());
            var expr = function () {
                return $(window).height() * config / 100;
            };
            if (typeof config === "object") {
                var related;
                if (config.related)
                    related = $(config.related);
                else
                    related = $($(element).prev()[0]);

                var functionBody = "with({}){return(" + config.expr + ")}";
                var realtedFunc = new Function('$related', 'height', 'element', functionBody);

                expr = function () {
                    return realtedFunc(related, related.height(), $(element));
                };
            }
            function resize() {
                setTimeout(function () {
                    $(element).height(expr());
                    $("#allfiles").trigger("reflow");
                }, 100);
            }
            $(window).on("resize orientationchange", function () {
                resize();
            });
            resize();
        }
    };
    ko.bindingHandlers.clearicon = {
        init: function (element, valueAccessor, allBindingsAccessor) {
            var clearicon = ko.utils.unwrapObservable(valueAccessor());
            var show, blur;
            var alwaysShow = false;
            var click = null;
            if (typeof clearicon === "object") {
                show = clearicon.show;
                blur = clearicon.blur;
                alwaysShow = clearicon.always;
                click = clearicon.click;
            } else {
                show = clearicon;
                blur = false;
            }
            
            if (show || alwaysShow) {
                var clearIcon = $($(element).next(".inputclear.fa-times-circle")[0]);
                if (!clearIcon || clearIcon.length == 0) {
                    clearIcon = $("<i class='hidden inputclear fa fa-times-circle'>");
                    clearIcon.insertAfter($(element));
                }
                function showclear() {
                    if (alwaysShow || Boolean($(element).val())) {
                        clearIcon.removeClass("hidden");
                    } else {
                        clearIcon.addClass("hidden");
                    }
                }
                $(element).on('keyup', showclear);
                $(element).on('input', showclear);
                $(element).on('change', showclear);
                $(element).on('focus', showclear);

                showclear();
                clearIcon.click(function () {
                    $(element).val('');
                    
                    if (!blur) {
                        $(element).focus();
                    }
                    
                    if ($(element).hasClass('tt-input')) {
                        var th = $(element).typeahead('val', '');
                    }
                    $(element).trigger("iconclear");
                    $(element).trigger("change");
                    showclear();
                    if (click) {
                        click();
                    }
                });
            }
        }
    };
    function keyUpBinding(testKey, element, valueAccessor, allBindingsAccessor, viewModel) {
        var allBindings = allBindingsAccessor();
        var callback = valueAccessor();
        var ctrl = false;
        var tab = false;
        var $ele = $(element);
        
        if ((typeof callback !== 'function')) {
            ctrl = callback.ctrl;
            tab = callback.tab;
            callback = callback.callback;
        }
        
        $ele.keyup(function (event) {
            var keyCode = (event.which ? event.which : event.keyCode);
            
            if (testKey(keyCode, (!ctrl || event.ctrlKey))) {
                if ($.isFunction(callback)) {
                    callback.call(viewModel);
                }
                
                if (tab) {
                    if (ko.validation.utils.isValidatable(tab)) {
                        if (!tab.isValid()) {
                            tab.isModified(true);//显示错误信息
                            return;
                        }
                    }

                    var $parent = $ele.parents(".tab-parent");
                    var tabIndex = (Number($ele.attr("data-tabindex")) || 0) + 1;
                    var $next = $parent.find("[data-tabindex=\"" +  tabIndex + "\"]");
                    if ($next.prop("nodeName") !== "INPUT" && $next.prop("nodeName") !== "TEXTAREA") {
                        if($next.find("input").length>0){
                            $next = $($next.find("input")[0]);
                        }else{
                            $next = $($next.find("textarea")[0]);
                        }   
                    }
                    $next.focus();
                    $next.select();
                }
                return false;
            }
            return true;
        });
    }
    ko.bindingHandlers.spaceAndEnterkey = {
        init: keyUpBinding.bind(this, function(keyCode, ctrl){
            return (keyCode === 13 && ctrl) || keyCode === 32;
        })
    };
    ko.bindingHandlers.enterkey = {
        init: keyUpBinding.bind(this, function(keyCode, ctrl){
            return (keyCode === 13 && ctrl);
        })
    };
    ko.bindingHandlers.ctrlAndenterkey = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
            var allBindings = allBindingsAccessor();
            var callback = valueAccessor();
            var ctrl = false;
            var valueUpdate = null;
            if ((typeof valueAccessor()) !== 'function') {
                ctrl = callback.ctrl;
                valueUpdate = callback.valueUpdate;
                callback = callback.callback;
            }
            $(element).keyup(function (event) {
                var keyCode = (event.which ? event.which : event.keyCode);
                if (keyCode === 13 && (ctrl && event.ctrlKey)) {
                    callback(viewModel, event);
                }else if(!ctrl &&keyCode === 13&&!event.ctrlKey){
                    callback(viewModel, event);
                }else if(!ctrl &&keyCode === 13&&event.ctrlKey){
                    if(valueUpdate){
                        valueUpdate(allBindings);
                    }
                }
            });
            $(element).keydown(function (event) {//触发keydown事件阻止浏览器的默认的操作，防止出现换行符的输入
                var keyCode = (event.which ? event.which : event.keyCode);
                if (keyCode === 13 && (ctrl && event.ctrlKey)) {
                    return false;
                }else if(!ctrl &&keyCode === 13&&!event.ctrlKey){
                    return false;
                }
            });
        }
    };
//    ko.bindingHandlers.textAtKey = {
//        init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
//            var allBindings = allBindingsAccessor();
//            var callback = valueAccessor();
//
//            $(element).keypress(function (event) {
//                var keyCode = event.keyCode || event.which;
//
//                if (keyCode === 64 && callback !== null) {
//                    callback.call(viewModel);
//                    return false;
//                }
//                return true;
//            });
//        }
//    };
    ko.bindingHandlers.passcapcheck = {
        /*caps lock check*/
        init: function (element, valueAccessor, allBindingsAccessor, viewModel) {    
            var allBindings = allBindingsAccessor();
            var callback = valueAccessor();
            var capslockSpanElement = null;
            function getCapsLockElement(){
                var spanElem = element;
                while (!capslockSpanElement) {
                    var capslocks = $(spanElem).find(".capslock");
                    if (capslocks.length) {
                        capslockSpanElement = capslocks;
                    }
                    spanElem = spanElem.parentNode;
                }
            }
            
            $(element).blur(function () {
                if(!capslockSpanElement){
                    getCapsLockElement();
                }
                if (capslockSpanElement&&!capslockSpanElement.hasClass("smarthidden")) {
                    capslockSpanElement.addClass("smarthidden");
                }
            });

            $(element).keyup(function (event) {
                if(!capslockSpanElement){
                    getCapsLockElement();
                }
                var keyCode = event.keyCode || event.which;
                if (keyCode === 20) {
                    capslockSpanElement.addClass("smarthidden");
                }
                ;
            });
            $(element).keypress(function (event) {
                if(!capslockSpanElement){
                    getCapsLockElement();
                }
                var keyCode = event.keyCode || event.which;
                var isShift = event.shiftKey || (keyCode === 16) || false; // shift键是否按住
                if(capslockSpanElement){
                    if (
                            ((keyCode >= 65 && keyCode <= 90) && !isShift) // Caps Lock 打开，且没有按住shift键 
                            || ((keyCode >= 97 && keyCode <= 122) && isShift)// Caps Lock 打开，且按住shift键
                            ) {
                        capslockSpanElement.removeClass("smarthidden");
                    } else {
                        capslockSpanElement.addClass("smarthidden");
                    }
                }
                if (keyCode === 13 && callback && $.isFunction(callback)) {
                    callback.call(viewModel);
                    return false;
                }
                return true;
            });
        }
    };
    $.fn.extend({
        disableSelection: function () {
            this.each(function () {
                this.onselectstart = falseFn;
                this.unselectable = "on";
                $(this).css('-moz-user-select', 'none');
                $(this).css('-webkit-user-select', 'none');
            });
            return this;
        }
    });
    ko.bindingHandlers.longpress = {
        init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            var select= $(element).data('select');
            if(!select){
                $(element).disableSelection();
            }
            var supporttouch = window.ontouchstart !== undefined || (window.DocumentTouch && document instanceof DocumentTouch);
            var callback = valueAccessor();
            var timeout = allBindings.get('longpress_timeout');
            if (timeout) {
                timeout = ko.utils.unwrapObservable(timeout);
            } else {
                timeout = 500;
            }

            var longpress;
//            var startTime;
//            $(element).on('mousedown', function (event) {
//                if (!supporttouch && event.button === 2) {
//                    //ignore right button
//                    return;
//                }
//                longpress = true;
//                startTime = new Date().getTime();
//                setTimeout(function () {
//                    if (longpress) {
//                        longpress = false;
//                        var data = ko.utils.unwrapObservable(bindingContext.$data);
//                        callback.call(data, data, element);
//                    }
//                }, timeout);
//            });
//            $(element).on('mouseup', function () {
//                if( new Date().getTime() - startTime < timeout){
//                    longpress = false;
//                }
//            });
            
            if (RootView.isIOSClient()) {
                $(element).on('taphold', function () {
                    longpress = true;
                    var data = ko.utils.unwrapObservable(bindingContext.$data);
                    callback.call(data, data, element);
                    $("#longpress-background").removeClass("hidden");
                });
                function preventDefault(){
                    if(longpress){
                        longpress = false;
                        window.setTimeout(function(){
                            $("#longpress-background").addClass("hidden");
                        },10);
                    }
                }
                window.addEventListener("touchend", preventDefault, false);
                ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                    window.removeEventListener("touchend", preventDefault, false);
                });
            } else {
                $(element).on('taphold', function () {
                    longpress = false;
                    var data = ko.utils.unwrapObservable(bindingContext.$data);
                    callback.call(data, data, element);
                });
                
                //禁用手机浏览器自带的长按弹出菜单事件
                if(RootView.isSmallScreen() && !RootView.isClient()){
                    $(element).on('contextmenu', function(e){
                        if(e.preventDefault){
                            e.preventDefault();
                        }else{
                            window.event.returnValue = false;
                        }
                    });
                    ko.utils.domNodeDisposal.addDisposeCallback(element, function (){
                        $(element).off("contextmenu");
                    });
                }
            }
        }
    };
    ko.bindingHandlers.progress = {
        init: function (element, valueAccessor) {
            $(element).progressbar(0);
        },
        update: function (element, valueAccessor) {
            var val = ko.utils.unwrapObservable(valueAccessor());
            $(element).progressbar("value", val);
            $(element).attr("step", Math.floor(((val - 1) / 10)));
        }
    };
    //http://bootstrap-tagsinput.github.io/bootstrap-tagsinput/examples/
    //http://twitter.github.io/typeahead.js/examples/
    ko.bindingHandlers.tagsinput = {
        update: function (element, valueAccessor) {
            setTimeout(function () {
                var val = ko.utils.unwrapObservable(valueAccessor());
                $(element).tagsinput(val);
            }, 10);

        }
    };

    ko.bindingHandlers.datepicker = {
        update: function (element, valueAccessor) {
            setTimeout(function () {
                var val = ko.utils.unwrapObservable(valueAccessor());
                //requirejs(['datepicker'], function(datepicker){
                $(element).datetimepicker(val);
                //});
            }, 10);

        }
    };

    ko.bindingHandlers.selectmenu = {
        init: function (element, valueAccessor) {
            setTimeout(function () {
                var val = ko.utils.unwrapObservable(valueAccessor());
                $(element).selectmenu(val);
            }, 10);

        }
    };


    ko.bindingHandlers.floatThead = {
        init: function (element, valueAccessor) {
            setTimeout(function () {
                var val = ko.utils.unwrapObservable(valueAccessor());
                $(element).floatThead(val);
            }, 10);
        }
    };
    ko.bindingHandlers.typeahead = {
        update: function (element, valueAccessor, allBindings) {
            var uaParser = new UAParser();
            var self = this;
            self.parentElement = element.parentNode;
            self.typeahead =null; 
            if (uaParser.getBrowser().name === "IE" && uaParser.getBrowser().major <= 8) {
                return;
            }
            
            function typeaheadResize(){
                var typeMenu = $(self.parentElement).find(".typeahead-menu")[0];
                if(!self.typeahead || !typeMenu){
                    return false;
                }
                var position = getElementFixedPosition(self.typeahead[0]);
                typeMenu.style.left = position.left;
                typeMenu.style.top = position.top;
                typeMenu.style.width = self.typeahead.width() + "px";
            }
            function typeaheadLoad(){
                if(!element.clientHeight || !element.clientWidth){
                    return false;
                }
                var val = ko.utils.unwrapObservable(valueAccessor());
                if (!val.source) {
                    val.source = substringMatcher(val.data);
                    val.data = null;
                }
                val.source = ko.unwrap(val.source);
                val.templates = ko.unwrap(val.templates);
                val.onload = ko.unwrap(val.onload);
                
                if(ko.unwrap(RootView.isSmallScreen)){
                    self.typeahead = $(element).typeahead({hint: true, highlight: true, minLength: 0}, val);
                } else {
                    var position = getElementFixedPosition(element);
                    var menu = document.createElement("div");
                    menu.classList.add("typeahead-menu");
                    if ($(element.parentNode).find(".typeahead-menu").length) {
                        menu = $(element.parentNode).find(".typeahead-menu")[0];
                    }
                    menu.style.left = position.left;
                    menu.style.top = position.top;
                    menu.style.width = $(element).width() + "px";
                    if (element.nextSibling) {
                        element.parentNode.insertBefore(menu, element.nextSibling);
                    } else {
                        element.parentNode.appendChild(menu);
                    }
                    self.typeahead = $(element).typeahead({hint: true, highlight: true, minLength: 0, menu: element.nextSibling}, val);
                    self.typeahead.on("focusin", typeaheadResize);
                    self.typeahead.on('focusout', typeaheadResize);
                    window.addEventListener("resize", typeaheadResize);
                    ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                        window.removeEventListener("resize", typeaheadResize);
                    });
                }
                self.typeahead.on("typeahead:selected typeahead:autocompleted", function (e, suggestion) {
                    $(element).trigger("change");
                    if (val.change) {
                        ko.unwrap(val.change)(suggestion);
                    }

                });

                self.typeahead.on("keydown", function (e) {
                    if (e.keyCode && e.keyCode === 13) {
                        var suggestion = $(element).val();
                        $(element).trigger("change");
                        $(element).typeahead('close');
                        if (val.change) {
                            ko.unwrap(val.change)(suggestion);
                        }
                    }
                });
                
                if (val.onload) {
                    val.onload(self.typeahead);
                }
                return true;
            }
            var sum = 0;
            var typeaheadCd = window.setInterval(function () {
                sum++;
                if(typeaheadLoad() || sum > 10){
                    window.clearInterval(typeaheadCd);
                }
            }, 100);
            ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                window.clearInterval(typeaheadCd);
            });
        }
    };
    /*如果是button， disable的特性没有起作用： 希望用户看到button,能够点击， 错误信息，通过提示给出*/
    function updateElementState(element, valueAccessor){
        var value = ko.unwrap(valueAccessor());
        var permitExpr;
        var type = "enable";

        if (value !== null && typeof value === "object") {
            permitExpr = value["permit"];
            type = value["type"];
        } else {
            //value is click function
            permitExpr = !!value;
        }
        var permit = $.isFunction(permitExpr) ? permitExpr() : permitExpr;
        permit = type === "disable" ? !permit : permit;
        var $element = $(element);

        if (permit) {
            $element.removeClass("disabled");
        } else {
            $element.addClass("disabled");
        }
    }
    
    function clickEventThrottle(element, click){
        var taskExecuting = false;
                
        ko.utils.registerEventHandler(element, "click", function(event){
            if (!taskExecuting) {
                taskExecuting = true;
                click(event);
                window.setTimeout(function(){
                    taskExecuting = false;
                }, 400);
            }
       });
    }
    
    ko.bindingHandlers.clickPermit = {
        init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext){
                var value = ko.unwrap(valueAccessor());
                var permitExpr;
                var click;
                var msg;
                var type = "enable";
                if (value !== null && typeof value === "object") {
                    permitExpr = value["permit"];
                    type = value["type"];
                    click = value["click"];
                    msg = value["msg"] !== undefined ? value["msg"] : l10n("operate_hint.lessPermit");
                } else {
                    //value is click function
                    permitExpr = !!value;
                    click = value;
                }
                
                clickEventThrottle(element, function(event){
                    var permit = $.isFunction(permitExpr) ? permitExpr() : permitExpr;
                    permit = type === "disable" ? !permit : permit;
                    
                    if (permit && click) {
                        click.apply(viewModel, [viewModel, event]);
                    } else if (!permit && msg) {
                        msg = $.isFunction(msg) && (!ko.isObservable(msg) || ko.isWriteableObservable(msg)) 
                            ? msg(viewModel) 
                            : ko.unwrap(msg);
                        RootView.codeRt.toastShow(msg);
                    }
                });
                
                ko.utils.registerEventHandler(element, "mouseover", function(){
                   var permit = $.isFunction(permitExpr) ? permitExpr() : permitExpr;
                    permit = type === "disable" ? !permit : permit;
                    var $element = $(element);
                    if (permit) {
                        $element.removeAttr("title");
                    } else {
                        msg = $.isFunction(msg) && (!ko.isObservable(msg) || ko.isWriteableObservable(msg))
                            ? msg(viewModel) 
                            : ko.unwrap(msg);
                        $element.attr({title: msg});
                    }
              });
              updateElementState(element, valueAccessor);

        },
        update: function(element, valueAccessor){
            updateElementState(element, valueAccessor);
        }
    };
        
    ko.bindingHandlers.clickThrottle = {
        init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext){
            var click = ko.unwrap(valueAccessor());
            
            if (click) {
                clickEventThrottle(element, function(event){
                    click.apply(viewModel, [viewModel, event]);
                });
            }
        }
    };
    ko.bindingHandlers.placeholderFix = {
        init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext){
            element.placeholder = ko.unwrap(valueAccessor());
            ko.utils.registerEventHandler(element, "focus", function(){
                this.placeholder = "";
            });
            ko.utils.registerEventHandler(element, "blur", function(){
                this.placeholder = ko.unwrap(valueAccessor());
            });
        }
    };
    
    ko.bindingHandlers.pullToRefresh = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var params = valueAccessor(),callback,waitForRefresh;
            if (isFunction(params)) {
                callback = params;
            }else if(params && params.callback){
                callback = params.callback;
                waitForRefresh = params.waitForRefresh;
            }else{
                return false;
            }
            var time = 0, timeController, overtimeTimeout,overtime = 8;
            
            function refreshCallback(){//触发收回功能
                window.PullToRefresh.refreshCallback();
            };
            function checkRefresh() {
                time++;
                if (!timeController) {
                    timeController = window.setInterval(function () {
                        time--;
                        if (time < 0) {
                            window.clearInterval(timeController);
                        }
                    }, 4000);
                }
                if (time > 3) {
                    RootView.codeRt.toastShow(l10n("operate_hint.refreshFrequent"));
                } else if (callback) {
                    callback(bindingContext.$data ,refreshCallback);
                    if(waitForRefresh){
                        if(overtimeTimeout){
                            window.clearTimeout(overtimeTimeout);
                        }
                        overtimeTimeout = window.setTimeout(function(){
                            refreshCallback();
                            window.clearTimeout(overtimeTimeout);
                        }, overtime*1000);
                    }
                }
            }
            var ptr = window.PullToRefresh.init({
                mainElement: element,
                instructionsPullToRefresh: l10n('common.pullToRefresh'),
                instructionsReleaseToRefresh: l10n('common.releaseToRefresh'),
                instructionsRefreshing: l10n('common.refreshing'),
                onRefresh: function () {
                    checkRefresh();
                },timeCallback: waitForRefresh && false
            });
            ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                ptr.destroy();
            });
        }
    };
    ko.bindingHandlers.touchfeedback = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            //disabled since break ios:Issue #9548 ios消息界面卡死
            return;
            
            var callback = valueAccessor();
            var data = bindingContext.$data;
            if (callback == null) {
                return false;
            }
            var touchStartX = 0;
            var touchStartY = 0;
            var scrollX = 0;
            var scrollY = 0;
            element.addEventListener('touchstart', function (event) {
                var touch = event.targetTouches[0];
                touchStartX = touch.pageX;
                touchStartY = touch.pageY;
                scrollX = 0;
                scrollY = 0;
                callback({startX:touchStartX ,startY:touchStartY ,moveX: scrollX,moveY: scrollY,states: touchStates.start,data: data,element: element });
            }, false);
            element.addEventListener('touchmove', function (event) {
                var touch = event.targetTouches[0];
                scrollX = touch.pageX - touchStartX;
                scrollY = touch.pageY - touchStartY;
                callback({startX:touchStartX ,startY:touchStartY ,moveX: scrollX,moveY: scrollY,states: touchStates.move,data: data,element: element});
            }, false);
            element.addEventListener('touchend', function () {
                callback({startX:touchStartX ,startY:touchStartY ,moveX: scrollX,moveY: scrollY,states: touchStates.end,data: data,element: element});
            }, false);
        }
    };
    
    ko.bindingHandlers.scrollEvent = {
        init:function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext){
            var callback = valueAccessor();
            if(!callback){
                return false;
            }
            $(element).scroll(function(){
                var ele = element;
                callback({type: scorllType.elementScroll,top: ele.scrollTop ,element: element });
            });
            $(document).scroll(function(){
                var ele = document.documentElement;
                callback({type: scorllType.documentScroll,top: ele.scrollTop ,element: element });
            });
            window.addEventListener('mousewheel', function(){
                callback({type: scorllType.default ,element: element });
            }, false);  
        }
    };
    
    global.closeDropDown = function( element ){
        var ulDropMenu = findElementChildren(element,".dropdown-menu");
        if(!ulDropMenu.length){
            return false;
        }
        var dropMenu = ulDropMenu[0];
        var mouseOver = function(){
            window.setTimeout(function(){
                dropMenu.classList.remove("hidden"); 
            }, 100);
        };
        element.addEventListener("mouseover",mouseOver,false);
        dropMenu.addEventListener("click",function(){
             if( RootView.isSmallScreen() ){
                $(element).hasClass("dropdown") ?  $(element).removeClass("open") : $(element).find(".dropdown").removeClass("open");
             }else{
                window.setTimeout(function(){ dropMenu.classList.add("hidden"); }, 100);
             }
        },true);
    };
    ko.bindingHandlers.closeDropdown = {
        init: function(element, valueAccessor){
            closeDropDown(element);
        }
    };
    
    ko.bindingHandlers.tooltip = {
        init: function (element, valueAccessor) {
            var local = ko.utils.unwrapObservable(valueAccessor()),
                    options = {};

            ko.utils.extend(options, ko.bindingHandlers.tooltip.options);
            ko.utils.extend(options, local);

            $(element).tooltip(options);

            ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                $(element).tooltip("destroy");
            });
        },
        options: {
            placement: "bottom",
            trigger: "hover"
        }
    };

    ko.bindingHandlers.dropdown = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
            var touchStart = 0;
            var config = valueAccessor();
            var innerElem = element.firstElementChild;
            var functionBody = "with({}){return(" + config.expr + ")}";
            var realtedFunc = new Function('top', 'scrolltop', functionBody);

            expr = function (top, scrolltop) {
                return realtedFunc(top, scrolltop);
            };
            if (config.isMsg) {
                setTimeout(function () {

                    $(element).scrollTop(100000);
                }, 200);
            }

            element.addEventListener('touchstart', function (event) {
                var touch = event.targetTouches[0];
                touchStart = touch.pageY;
            }, false);
            element.addEventListener('touchmove', function (event) {
                var touch = event.targetTouches[0];
                innerElem.style.top = innerElem.offsetTop + touch.pageY - touchStart + 'px';
                touchStart = touch.pageY;
            }, false);
            element.addEventListener('touchend', function (event) {
                touchStart = 0;
                var top = innerElem.offsetTop;
                var scrolltop = $(element).scrollTop();
                if (expr(top, scrolltop)) {
                    var oldScrollHeight = $(element)[0].scrollHeight;
                    if (config.isMsg) {
                        config.callback.call(viewModel, function (isAvoidLoad)
                        {
                            setTimeout(function () {
                                var newScrollHeight = $(element)[0].scrollHeight;
                                $(element).scrollTop(newScrollHeight - oldScrollHeight);
                            }, 200);
                        });
                    } else {
                        if (config.callback) {
                            config.callback.call(viewModel);
                        }
                    }
                }
                if (top > 0) {
                    var time = setInterval(function () {
                        innerElem.style.top = innerElem.offsetTop - 2 + 'px';
                        if (innerElem.offsetTop <= 0)
                            clearInterval(time);
                    }, 1)
                }
            }, false);
        }
    };
    
    global.fixedDropdownMenuFunction = function( element, params ){
        if( RootView.isSmallScreen() && params.notFixedInPhone ){
            return;
        }
        var menuWidth = params.menuWidth;
        var disableClose = ko.unwrap(params.disableClose);
        var disableHover = ko.unwrap(params.disableHover);
//        var dialogId = params.root ? params.root.dialogId : params.dialogId;
//        var modalDialogElement = $(document.getElementById(dialogId)).find(".modal-dialog")[0];
        var modalDialogElement = $(element).parents(".modal-dialog")[0];
        var ulElement = $(element).find(".dropdown-menu").length ? $(element).find(".dropdown-menu")[0] : null;
        var rightMove = parseInt(params.rightMove) || 0;
        var marginTop = parseInt(params.marginTop) || 0;
        
        if (!ulElement) {
            return false;
        }
        function isIEBrowser() {
            var userAgent = navigator.userAgent;
            var isIE = userAgent.indexOf("compatible") > -1 && userAgent.indexOf("MSIE") > -1;
            return isIE || window.ActiveXObject !== undefined;
        }
        function getOffsetTop(element, menuUlHeight) {
            var top = 0;
            var windowHeight = window.innerHeight;
            var elementHeight = $(element).height();
            
            if (isIEBrowser()) {
                top =  element.getBoundingClientRect().top+ $(element).height();
            }else if(modalDialogElement){
                top =  element.getBoundingClientRect().top - modalDialogElement.getBoundingClientRect().top + $(element).height();
            }else{
                top =  element.getBoundingClientRect().top + $(element).height();
            }
            //check top  height and position  fixed
            if (( windowHeight - top) <  menuUlHeight && top < menuUlHeight) {
                return 0;
            } else if ((windowHeight - top) > menuUlHeight) {
                return top;
            } else {
                return top - menuUlHeight - elementHeight;
            }
        }
        function getOffsetLeft(element,menuUlHeight) {
            var left = 0;
            var windowWidth = window.innerWidth;
            
            if(isIEBrowser()){
                left =  element.getBoundingClientRect().left;
            }else if(modalDialogElement){
                left =  element.getBoundingClientRect().left - modalDialogElement.getBoundingClientRect().left -1;
            }else{
                left =  element.getBoundingClientRect().left;
            }
            //check top width and position fixed
            if((windowWidth - left) < menuUlHeight){
                return windowWidth - menuUlHeight;
            }
            return left;
            
        }
        if(!disableHover){
            element.addEventListener("mouseover", function(){
                ulElement =  $(element).find(".dropdown-menu")[0];
                if(!ulElement){
                    return false;
                }
                if (menuWidth) {
                    ulElement.style.width = menuWidth;
                }
                ulElement.style.minWidth = $(element).width()+"px";
                ulElement.classList.add("fixed-dropdown");
                ulElement.style.top = getOffsetTop(element, $(ulElement).height()) + marginTop+"px";
                ulElement.style.left = getOffsetLeft(element, $(ulElement).width())+ rightMove + "px";
                ulElement.classList.remove("hidden");
            });
            element.addEventListener("mouseleave", function(){
                if(!ulElement){
                    return false;
                }
                ulElement.style.top = "0px";
                ulElement.style.left = "0px";
                ulElement.classList.remove("fixed-dropdown");
                element.classList.remove("open");
            });
        }else{
            element.classList.add("nohover");
        }
        if (!disableClose ) {
            ulElement.addEventListener("click", function () {
                window.setTimeout(function () {
                    if(disableHover){
                        element.classList.remove("open");
                    }else{
                         ulElement.classList.add("hidden");
                    }
                },100);
            });
        }
   }; 
     
    ko.bindingHandlers.fixedDropdownMenu = {
        init: function (element, valueAccessor, allBindings, viewModel) {
            fixedDropdownMenuFunction( element, valueAccessor() );
        }
    };
    ko.bindingHandlers['qrcode'] = {
        'update': function (element, valueAccessor) {
            var uaParser = new UAParser();
            if (uaParser.getBrowser().name === "IE" && uaParser.getBrowser().major <= 8) {
                return;
            }
            var value;
            try {
                value = ko.utils.unwrapObservable(valueAccessor());
            } catch (e) {
                return;
            }
            if (!value) {
                return;
            }
            var url = value;
            var options = {
                width: 160,
                height: 160,
                colorDark: "#000000", //#28A8FF"
                correctLevel: QRCode.CorrectLevel.Q
            };
            if (typeof value !== "string") {
                url = ko.utils.unwrapObservable(value.url);
                var userOps = value;
                Object.keys(userOps).forEach(function (key) {
                    if (key !== 'url') {
                        options[key] = ko.unwrap(userOps[key]);
                    }
                });
            }

            url = buildFullLink(url);
            //url = encodeURI(url);
            $(element).html(""); //clear preview ones
            var qrcode = new QRCode(element, options);
            qrcode.makeCode(url);

        }
    };
    ko.bindingHandlers['affix'] = {
        'update': function (element, valueAccessor) {
            if (window.innerWidth < 992) {
                return false;
            }
            var value;
            try {
                value = ko.utils.unwrapObservable(valueAccessor());
            } catch (e) {
                return;
            }
            if (!value) {
                return;
            }
            var options = {
            };
            if (typeof value !== "string") {
                var userOps = value;
                Object.keys(userOps).forEach(function (key) {
                    options[key] = ko.unwrap(userOps[key]);
                });
            }
            window.setTimeout(function () {
                $(element).affix(options);
            }, 10);
        }
    };
        //similar to ko function makeWithIfBinding(bindingKey, isWith, isNot, makeContextCallback)
    ko.bindingHandlers['feature'] = {
        'init': function(element, valueAccessor, allBindings, viewModel, bindingContext) {
            var didDisplayOnLastUpdate,
                savedNodes;
            ko.computed(function() {
                var rawValue = valueAccessor(),
                    dataValue = ko.utils.unwrapObservable(rawValue),
                    shouldDisplay = window.RootView && window.RootView.isShowFeature(dataValue),
                    isFirstRender = !savedNodes,
                    needsRefresh = isFirstRender || (shouldDisplay !== didDisplayOnLastUpdate);

                if (needsRefresh) {
                    // Save a copy of the inner nodes on the initial update, but only if we have dependencies.
                    if (isFirstRender && ko.computedContext.getDependenciesCount()) {
                        savedNodes = ko.utils.cloneNodes(ko.virtualElements.childNodes(element), true /* shouldCleanNodes */);
                    }

                    if (shouldDisplay) {
                        if (!isFirstRender) {
                            ko.virtualElements.setDomNodeChildren(element, ko.utils.cloneNodes(savedNodes));
                        }
                        ko.applyBindingsToDescendants(bindingContext, element);
                    } else {
                        ko.virtualElements.emptyNode(element);
                    }
                    //add hidden-feature class if disabled\
                    if(element && element.className) {
                        ko.utils.toggleDomNodeCssClass(element, 'hidden-feature', !shouldDisplay);
                    }
                    didDisplayOnLastUpdate = shouldDisplay;
                }
            }, null, { disposeWhenNodeIsRemoved: element });
            return { 'controlsDescendantBindings': true };
        }
    };
    ko.bindingHandlers.passwordvisual = {
        init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            var params = valueAccessor();
            if(params&&params.hidden){
                return false;
            }
            $(element).append("<i id='passwordVisual' class='fa fa-eye-slash'></i> ");
            element.classList.add("password_visual");
            window.setTimeout(function () {
                var childrens = element.children;
                var visualElem = null, passwordElem = null, inputElem = null, isVisual = false;
                for (var i = 0; i < childrens.length; i++) {
                    var elem = childrens[i];
                    if (elem.id === "passwordVisual") {
                        visualElem = elem;
                    } else if (elem.id === "password") {
                        passwordElem = elem;
                    }//dont add else
                    if (elem.tagName === "INPUT" || elem.tagName === "input") {
                        inputElem = elem;
                    }
                }
                if (!passwordElem) {
                    if (inputElem) {
                        passwordElem = inputElem;
                    } else {
                        return false;
                    }
                }
                //passwordElem.autocomplete = "off";
                $(element).prepend("<input type=\"password\" style=\"display: none\"/> ");
                if (window.innerWidth > 991) {
                    passwordElem.addEventListener("focus", function () {
                        if (!isVisual) {
                            passwordElem.type = "password";
                        }
                        passwordElem.select();
                    });
                } else {
                    passwordElem.type = "password";
                }
                visualElem.addEventListener("click", function () {
                    if (isVisual) {
                        visualElem.classList.remove("fa-eye");
                        visualElem.classList.add("fa-eye-slash");
                        passwordElem.type = "password";
                    } else {
                        visualElem.classList.remove("fa-eye-slash");
                        visualElem.classList.add("fa-eye");
                        passwordElem.type = "text";
                    }
                    isVisual = !isVisual;
                    window.setTimeout(function(){
                        if (isVisual) {
                            visualElem.classList.remove("fa-eye");
                            visualElem.classList.add("fa-eye-slash");
                            passwordElem.type = "password";
                        }
                        isVisual = !isVisual;
                    },5000);
                });
            }, 20);
        }
    };
    ko.bindingHandlers.preventAutoFill = {
        init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            if(navigator && navigator.userAgent && navigator.userAgent.indexOf('Trident/')>0){
                //not apply on ie
                return;
            }
            var $element = $(element);
            $element.addClass("prevent-auto-fill");
            $element.attr("readonly", true);
            $element.one("focus", function(){
               $(this).removeAttr("readonly"); 
            });
            $element.one("touchstart", function(){
               $(this).removeAttr("readonly"); 
            });
            if(/Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor)){
                $element.attr("autocomplete", "not_save_password");
            }else{
                $element.attr("autocomplete", "off");
            }
        }
    };

    ko.bindingHandlers.mouseDragEvent = {
        init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            var callback = valueAccessor();
            var self = this;
            self.down = false;
            self.startX  = 0;
            self.startY = 0;
            element.addEventListener("mousedown", function (event) {
                self.startX = event.pageX;
                self.startY = event.pageY;
                callback(element,{moveX: event.pageX - self.startX, moveY: event.pageY - self.startY, states: touchStates.start});
                self.down = true;
            });
            element.addEventListener("mouseup", function (event) {
                self.down = false;
            });
            element.addEventListener("mouseleave", function (event) {
                self.down = false;
            });
            element.addEventListener("mousemove", function (event) {
                if(self.down){
                    callback(element,{moveX: event.pageX - self.startX, moveY: event.pageY - self.startY, states: touchStates.move});
                }
            });
        }
    };

    ko.bindingHandlers.activeInputError = {
        init: function (element, valueAccessor) {
            var listener = valueAccessor();
            if (ko.isObservable(listener)) {
                var subscribe = listener.subscribe(function(value){
                    var validation = $(element).find(".validationMessage")[0];
                    
                    if (validation) {
                        validation = $(validation);
                        
                        validation.html(value);
                        if (value == '') {
                            validation.hide();
                        } else {
                            validation.show();
                        }
                    } else {
                        $(element).append("<span class='validationMessage'>" + value + "</span>");
                    }
                });
                 ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                    subscribe.dispose();
                    listener("");
                });
            }
        }
    };
    
    ko.bindingHandlers.elementChangeCallback = {
        init: function (element, valueAccessor) {
            var params = valueAccessor();
            var initCallback = params.init;
            var changeCallback = params.change;
            var disposeCallback = params.dispose;
            if (typeof initCallback === "function") {
                window.setTimeout(function(){
                    initCallback(element);
                },100);
            }
            function elementChange() {
                window.setTimeout(function(){//因为在resize事件中，element的变化是未生效时的变化，所以需要延迟调用，获取已改变的elemene
                    changeCallback(element);
                },100);
            }
            if(changeCallback){
                window.addEventListener("resize",elementChange, false);
            }
            ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                if (typeof disposeCallback === "function") {
                    disposeCallback(element);
                }
                if(changeCallback){
                    window.removeEventListener("resize",elementChange, false);
                }
            });
        }
    };
    
    ko.bindingHandlers.elementCanvasInit = {//用以生成canvas初始化，同时也可以在之后增添一些对应的初始化内容，比如动画等
        init: function (element, valueAccessor) {
            window.setTimeout(function () {
                var params = valueAccessor()
                var ctx = element.getContext("2d");
                if(params.width){
                   element.width = params.width; 
                }
                if(params.height){
                    element.height = params.height;
                }
                var callback = params.callback;
                if (ctx) {
                    if (typeof callback === "function") {
                        callback(ctx, element);
                    }
                }
            },100);
        }
    };
    
    ko.bindingHandlers.callIf = {
        update: function (element, valueAccessor) {
            var val = ko.utils.unwrapObservable(valueAccessor());
            if(ko.unwrap(val.if)){
                window.setTimeout(function(){
                    val.action(element,val,valueAccessor);    
                },10);
            }
        }
    };
    ko.virtualElements.allowedBindings['callIf'] = true;
    
    ko.bindingHandlers.callOnBlank = {
        init: function (element, valueAccessor) {
            var val = ko.utils.unwrapObservable(valueAccessor());
            if(!ko.unwrap(val.value)){
                window.setTimeout(function(){
                    val.action(element,val,valueAccessor);    
                },10);
            }
        }
    };

    //http://knockoutjs.com/documentation/custom-bindings-for-virtual-elements.html
    ko.expressionRewriting.bindingRewriteValidators['feature'] = false; // Can't rewrite control flow bindings
    ko.virtualElements.allowedBindings['feature'] = true;
    

    function deepObservable(item) {
        item = ko.utils.unwrapObservable(item);
        if (typeof item === 'undefined' || item === null) {
            return null;
        } // null, undefined values check

        var types = [Number, String, Boolean, ProtoBuf.Long];

        // normalizing primitives if someone did new String('aaa'), or new Number('444');
        for (var k in types) {
            var type = types[k];
            if (item instanceof type) {
                return item;
            }

            if (item && item.constructor && item.constructor === type) {
                return item;
            }
        }
        if (ProtoBuf.Long.isLong(item)) {
            return item;
        }

        if (Object.prototype.toString.call(item) === "[object Array]") {
            item.forEach(function (child, index, array) {
                deepObservable(child);
            });
            return item;
        } else if (typeof item === "object") {
            var keys = [];
            for (var key in item) {
                if (item.hasOwnProperty(key))
                    if (key.indexOf("_ko_") !== 0 && key.indexOf("$") !== 0 && key.indexOf("_") !== 0)
                        keys.push(key);
            }
            keys.forEach(function (key) {
                var val = item[key];
                deepObservable(val);
                if (Object.prototype.toString.call(val) === "[object Array]") {
                    item[key] = ko.observableArray(val);
                } else
                    item[key] = ko.observable(val);
            });
        }
        return item;
    }

    function snapshot(item) {
        item = ko.utils.unwrapObservable(item);
        if (item === null || typeof (item) !== 'object') {
            return item;
        }

        var temp = new item.constructor();

        for (var key in item) {
            if (item.hasOwnProperty(key)) {
                temp[key] = snapshot(item[key]);
            }
        }

        return temp;
    }

    function undeepObservable(item) {
        item = ko.utils.unwrapObservable(item);
        if (typeof item === 'undefined' || item === null) {
            return null;
        } // null, undefined values check

        var types = [Number, String, Boolean, ProtoBuf.Long];

        // normalizing primitives if someone did new String('aaa'), or new Number('444');
        for (var k in types) {
            var type = types[k];
            if (item instanceof type) {
                return item;
            }

            if (item && item.constructor && item.constructor === type) {
                return item;
            }
        }
        if (ProtoBuf.Long.isLong(item)) {
            return item;
        }

        if (Object.prototype.toString.call(item) === "[object Array]") {
            item.forEach(function (child, index, array) {
                item[index] = undeepObservable(child);
            });
            return item;
        } else if (typeof item === "object") {
            var keys = [];
            for (var key in item) {
                if (item.hasOwnProperty(key))
                    if (key.indexOf("_ko_") !== 0 && key.indexOf("$") !== 0 && key.indexOf("_") !== 0)
                        keys.push(key);
            }
            keys.forEach(function (key) {
                var val = item[key];
                item[key] = undeepObservable(val);
            });
        }
        return item;
    }

    ko.deepObservable = deepObservable;
    ko.undeepObservable = undeepObservable;//snapshot;

    function deepObservableClone(item) {
        item = ko.utils.unwrapObservable(item);
        if (typeof item === 'undefined' || item === null) {
            return null;
        } // null, undefined values check

        var types = [Number, String, Boolean, ProtoBuf.Long];

        // normalizing primitives if someone did new String('aaa'), or new Number('444');
        for (var k in types) {
            var type = types[k];
            if (item instanceof type) {
                return item;
            }

            if (item && item.constructor && item.constructor === type) {
                return item;
            }
        }
        if (ProtoBuf.Long.isLong(item)) {
            return item;
        }

        if (Object.prototype.toString.call(item) === "[object Array]") {
            var newItem = [];
            item.forEach(function (child, index, array) {
                newItem.push(deepObservableClone(child));
            });
            return newItem;
        } else if (typeof item === "object") {
            var keys = [];
            for (var key in item) {
                if (item.hasOwnProperty(key))
                    if (key.indexOf("_ko_") !== 0 && key.indexOf("$") !== 0 && key.indexOf("_") !== 0)
                        keys.push(key);
            }
            var newItem = new item.constructor();
            if (item.__proto__) {
                newItem.__proto__ = item.__proto__;
            }
            keys.forEach(function (key) {
                var val = item[key];
                var newVal = deepObservableClone(val);
                if (Object.prototype.toString.call(val) === "[object Array]") {
                    newItem[key] = ko.observableArray(newVal);
                } else
                    newItem[key] = ko.observable(newVal);
            });
            return newItem;
        }
    }
    function undeepObservableClone(item) {
        item = ko.utils.unwrapObservable(item);
        if (typeof item === 'undefined' || item === null) {
            return null;
        } // null, undefined values check

        var types = [Number, String, Boolean, ProtoBuf.Long];

        // normalizing primitives if someone did new String('aaa'), or new Number('444');
        for (var k in types) {
            var type = types[k];
            if (item instanceof type) {
                return item;
            }

            if (item && item.constructor && item.constructor === type) {
                return item;
            }
        }
        if (ProtoBuf.Long.isLong(item)) {
            return item;
        }

        if (Object.prototype.toString.call(item) === "[object Array]") {
            var newItem = [];
            item.forEach(function (child, index, array) {
                newItem[index] = undeepObservableClone(child);
            });
            return newItem;
        } else if (typeof item === "object") {
            var keys = [];
            for (var key in item) {
                if (item.hasOwnProperty(key))
                    if (key.indexOf("_ko_") !== 0 && key.indexOf("$") !== 0 && key.indexOf("_") !== 0)
                        keys.push(key);
            }
            var newItem = new item.constructor();
            if (item.__proto__) {
                newItem.__proto__ = item.__proto__;
            }
            keys.forEach(function (key) {
                var val = item[key];
                newItem[key] = undeepObservableClone(val);
            });
            return newItem;
        }
    }
    ko.deepObservableClone = deepObservableClone;
    ko.undeepObservableClone = undeepObservableClone;//clone;

    //an observable that retrieves its value when first bound
    ko.onDemandObservable = function (callback, target, array) {
        var _value = array ? ko.observableArray([]) : ko.observable();  //private observable

        var result = ko.computed({
            read: function () {
                //if it has not been loaded, execute the supplied function
                if (!result.loaded()) {
                    callback.call(target);
                }
                //always return the current value
                return _value();
            },
            write: function (newValue) {
                //indicate that the value is now loaded and set it
                result.loaded((null !== newValue));
                _value(newValue);
            },
            deferEvaluation: true  //do not evaluate immediately when created
        });

        var smallDateTip = null;
        function createSmallDateTip(x,y,text){
            var tip = document.createElement('I');
            document.body.appendChild(tip);
            tip.style.left = x;
            tip.style.top = y;
            tip.textContent = text;
            smallDateTip = tip;
        }
        ko.bindingHandlers.showSmallDateTip = {
            init: function (element) {
                var x,y,fileData = arguments[3],timer = 2000;
                var dateTimeString = new Date(parseInt(fileData.date || fileData.updatedTime)).toLocaleString();
                element.addEventListener('click',function(event){
                    event.cancelBubble = true;
                    event && event.preventDefault && event.preventDefault();
                    event && event.stopPropagation && event.stopPropagation();
                    x = event.clientX+'px';
                    y = event.clientY+window.scrollY+10+'px';
                    if(smallDateTip){
                        smallDateTip.style.left = x;
                        smallDateTip.style.top = y;
                        smallDateTip.textContent = dateTimeString;
                    }else{
                        createSmallDateTip(x,y,dateTimeString);
                    }
                    smallDateTip.className = 'smallDateTip';
                   window.clearTimeout(smallDateTip.tid);
                    smallDateTip.tid = setTimeout(function(){
                        smallDateTip.className = 'smallDateTip hide';
                    },timer);
                },false);
            }
        };
        //expose the current state, which can be bound against
        result.loaded = ko.observable();
        //load it again
        result.refresh = function () {
            result.loaded(false);
        };

        return result;
    };

})(this, ko);