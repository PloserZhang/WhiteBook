(function (global, ko) {
//http://knockoutjs.com/documentation/component-overview.html
    ko.components.getViewModelRequire = function (component) {
        var config = ko.components._allRegisteredComponents[component];
        if (config && config.viewModel && typeof config.viewModel['require'] === 'string') {
            return config.viewModel['require'];
        }
    };
    ko.components.getViewModelConfig = function (component, callback) {
        function possiblyGetConfigFromAmd(viewModel, callback) {
            if (typeof viewModel['require'] === 'string') {
                // The config is the value of an AMD module
                requirejs([viewModel['require']], callback);

            } else {
                callback(viewModel);
            }
        }
        var config = ko.components._allRegisteredComponents[component];
        if (config) {
            possiblyGetConfigFromAmd(config.viewModel, callback);
        }
    };

    ko.components.register('my-fileicon', {
        viewModel: function (params) {
            var self = this;
            self.file = ko.unwrap(params.file);

            self.fileIcon = getFileIcon(self.file.docType || self.file.fileInfo.docType);
//        self.getFileTypeImg = function () {
//            return  window.config.getServer() + "/filetypeImage/" + self.file.docType;
//        };  
        },
        template:
                "<i class='fa text-primary' data-bind='css:fileIcon'></i>"
    });
    ko.components.register('contenttype-name-icon', {
        viewModel: function (params) {
            var self = this;
            self.contentType = params.contenttype;
            self.name = params.name;
            self.type = params.type;
            self.isTaskFile = params.isTaskFile;

            self.fileIcon = ko.observable(getFileIcon("other"));
            if( self.isTaskFile){
                 self.fileIcon(getFileIcon(TaskDocType));
            }
            else if (!!self.type && self.type == ccs.ObjectTypeEnum.ObjectTree)
            {
               
                    self.fileIcon(getFileIcon("folder"));
                
            }else{

                requirejs([window.config.getServer('/tool/docmap.js')], function (docmap) {
                    global.docmap = docmap;
                    if (!!docmap && (!!self.contentType || !!self.name)) {
                        var docType = docmap[self.contentType];
                        if (!docType && self.name) {
                            docType = docmap[self.name.substring(self.name.lastIndexOf(".") + 1)]
                        }
                        if (!!docType) {
                            self.fileIcon(getFileIcon(docType));
                        }
                    }
                });
            }



//        self.getFileTypeImg = function () {
//            return  window.config.getServer() + "/filetypeImage/" + self.file.docType;
//        };  
        },
        template:
                "<i class='fa text-primary' data-bind='css:fileIcon()'></i>"
    });


    var userRoleTitleTip = {};
    var userRoleTitle = {};  
    ko.components.register('adminorgicon', {
      
        viewModel: function (params) {
       
            userRoleTitle[ccs.RoleTitle.NormalTitle] = 'fa fa-md fa-user text-primary';
            userRoleTitle[ccs.RoleTitle.FileManageTitle] = 'fa fa-md fa-user-plus text-primary';
            userRoleTitle[ccs.RoleTitle.RepoManageTitle] ='fa fa-md fa-user-md text-primary';
            userRoleTitle[ccs.RoleTitle.OrgManageTitle] = 'fa fa-md fa-user-circle-o text-primary';
            userRoleTitle[ccs.RoleTitle.SystemManageTitle] = 'fa fa-md fa-user-secret text-primary';

             userRoleTitleTip[ccs.RoleTitle.NormalTitle] = l10n('user.normalUser');
             userRoleTitleTip[ccs.RoleTitle.FileManageTitle] = l10n('user.fileManager');
             userRoleTitleTip[ccs.RoleTitle.RepoManageTitle] = l10n('user.repoManager');
             userRoleTitleTip[ccs.RoleTitle.OrgManageTitle] =  l10n('user.orgManager');
             userRoleTitleTip[ccs.RoleTitle.SystemManageTitle] =  l10n('user.systemManager');
            var self = this;
            self.gtype = params.gtype;
            self.roleTitle = params.role;
            self.isOrgItem = false;
            self.isUserItem = false;
            self.isAdmin = false;
            self.clickEvent = params.click;
            self.platform =  params.platform
            self.icon = '';
            self.tip = '';
           
            self.isNormalUser = false;
            switch (self.gtype){
                case ccs.GtypeEnum.User:
                    self.icon = userRoleTitle[self.roleTitle] || userRoleTitle[ccs.RoleTitle.NormalTitle];
                    self.tip =  userRoleTitleTip[self.roleTitle];
                    self.isUserItem = true;
                    self.spanCss = 'mainicon';
                    break;
                case ccs.GtypeEnum.Org:
                    self.isOrgItem = true;
                    self.icon = 'fa fa-md  fa-sitemap text-primary';
                    break;
                case ccs.GtypeEnum.Group:
                    self.icon = 'fa fa-md  fa-group text-primary';
                    break;
                default :
            }
            self.platformtip = l10n("admin.thirdPlatformUser");
            
//            if(self.isOrgItem){
//                self.icon = 'fa fa-md  fa-sitemap text-primary';
//            }else if(self.isUserItem && self.isNormalUser){
//                self.icon = 'fa fa-md fa-user text-primary';
//                self.tip = l10n('admin.normalUser');
//            }else if(self.isUserItem && self.isAdmin){
//                 self.icon = 'fa fa-user-secret text-primary fa-md';
//                 self.tip = l10n('user.admin');
//                 self.spanCss = 'mainicon';
//            }
        },
        template:
                "<span data-bind='click: clickEvent, attr: {title: tip}'><i data-bind='css: icon'></i></span> <span class='mainicon'  data-bind= 'if: isUserItem && platform && platform !== ccs.Authenticator.SYSTEM_AUTHENTICATOR'> <span class='supicon' data-bind='attr:{title: platformtip}'>  <i class='fa fa-external-link-square'></i></span></span>"
    });
    ko.components.register('my-orgicon', {
        viewModel: function (params) {
            var self = this;
            self.gtype = ko.unwrap(params.gtype);
            if (self.gtype == ccs.GtypeEnum.User)
            {
                self.orgIcon = getFileIcon("USER");
            } else if (self.gtype == ccs.GtypeEnum.Group)
            {
                self.orgIcon = getFileIcon("CLUSTER");
            } else
            {
                self.orgIcon = getFileIcon("GROUP");
            }
        },
        template:
                "<i class='fa fa-md  text-primary' data-bind='css:orgIcon'></i>"
    });
    ko.components.register('accounticon', {
        viewModel: function (params) {
            var self = this;

            var accountState = params.accountState;

            self.accountIcon = "";
            self.title = "";
            if (accountState === ccs.AccountState.AccountPending)
            {
                self.title = l10n('user.accountPending');
                self.accountIcon = getFileIcon("accountPending");
            } else if (accountState === ccs.AccountState.AccountDisalbe)
            {
                self.title = l10n('user.accountDisable');
                self.accountIcon = getFileIcon("accountDisable");
            } else if (accountState === ccs.AccountState.AccountDeleted)
            {
                self.title = l10n('user.accountDeleted');
                self.accountIcon = getFileIcon("accountDeleted");
            }
        },
        template:
                "<i class='fa text-primary' data-bind='css:accountIcon, attr:{title: title}'></i>"
    });
    ko.components.register('accounttempicon', {
        viewModel: function (params) {
            var self = this;

            var accountState = params.accountState;

            self.accountIcon = ko.observable("");
            self.title = ko.observable("");
            ko.computed(function(){
                if (ko.unwrap(accountState) === ccs.AccountTempState.AccountTempLocked) {
                    self.title(l10n('user.accountLoginLock'));
                    self.accountIcon(getFileIcon("accountTempLock"));
                } else {
                    self.accountIcon("");
                    self.title("");
                }
            });
        },
        template:
                "<i class='fa text-primary' data-bind='css:accountIcon, attr:{title: title}'></i>"
    });

//    ko.components.register('navicon', {
//        viewModel: function (params) {
//            var self = this;
//            self.navbar = params.navbar;
//
//            self.navIcon = getFileIcon(self.navbar.id);
////        self.getFileTypeImg = function () {
////            return  window.config.getServer() + "/filetypeImage/" + self.file.docType;
////        };  
//        },
//        template:
//                "<i class='fa text-primary' data-bind='css:navIcon'></i>"
//    });

    function stopClickPropagation(event) {
        event.stopPropagation();
    }

    ko.components.register('date-timepicker', {
        viewModel: {
            createViewModel: function(params, componentInfo) {
                 function DateTimepicker(params, componentInfo) {
                    var self = this;
                    self.todayBt = params.todayBt;
                    self.inline = params.inline;
                    self.language = params.language;
                    self.dateOnly = params.dateOnly;
                    self.futureOnly = params.futureOnly;
                    self.value = params.value;
                    self.placeholder = params.placeholder;
                    self.id = ko.unwrap(params.id)||"dateTimepickerId"+$(".datepicker").length;
                    if (self.language !== 'en') {
                        self.language = "cn";
                    }
                    self.maxDate = params.maxDate;
                    self.isSmallScreen = params.isSmallScreen;
                    self.dateFormat = "YYYY-MM-DD hh:mm";
                    if (self.dateOnly) {
                        self.dateFormat = "YYYY-MM-DD";
                    }

//                    var subscriptions = new ko.utils.subtrack(componentInfo);
//                    if(ko.isObservable(self.value)){
//                        subscriptions.push(
//                            self.value.subscribe(function(value){
//                                if(isNaN(new Date(value).getTime())){
//                                    self.value("");
//                                };
//                            })
//                        );
//                    }

                    $(function () {
                            $('.date-timepicker').appendDtpicker({
                            "inline": self.inline,
                            "locale": self.language,
                            "autodateOnStart": false,
                            "closeOnSelected": true,
                            "minuteInterval": 15,
                            "dateFormat": self.dateFormat,
        //                    "current": self.current,
                            "timelistScroll": false,
                            "animation": false,
                            "calendarMouseScroll": true,
                            "todayButton": self.todayBt,
                            "dateOnly": self.dateOnly,
                            "futureOnly": self.futureOnly,
                            "maxDate": self.maxDate
                        });
                    });
                    
                    $(".datepicker").off("click", stopClickPropagation);
                    //阻止datepicker上的事件冒泡，防止日期过滤框消失.事件会在datepicker销毁的时候，自动移除
                    $(".datepicker").on("click", stopClickPropagation);
                    var invalidDatePicker = $("div[style='position: absolute; z-index: 100;']");
                    //每次销毁不够彻底，导致无效的div一直自增，长时间使用怕是会影响到性能。
                    for(var i = 0; i <invalidDatePicker.length; i++){
                        if(!invalidDatePicker[i].children.length){
                            $(invalidDatePicker[i]).remove();
                        }
                    }
                 };
                 return new DateTimepicker(params, componentInfo);
            }
        },
        template:
                "<div class='validation-modal'><input type='text' class='date-timepicker form-group  dl' data-bind='clearicon:true,value: value,validationElement: value,attr: {placeholder: placeholder, id: id}'/></div>"
    });

    var uiArrayViewModel = function (params) {
        var self = this;
        self.sourceArray = params.sourceArray;
        var onPop = global.isFunction(params.onPop) ? params.onPop : null;
        var arrayIndexOf = params.arrayIndexOf || Array.prototype.indexOf;
        
        self.popValue = function (data) {
            var sourceArray = self.sourceArray();
            var index = arrayIndexOf.call(sourceArray, data);
            if (index !== -1) {
                unSelect(data);
                var removed = self.sourceArray.splice(index, 1);
                unSelect(removed[0]);
                if (onPop) {
                    onPop(data);
                }
            }
        };
        
        function unSelect(data){
            if (global.isFunction(data.isSelected)) {
                data.isSelected(false);
            } else if (global.isFunction(data.select)) {
                data.select(false);
            }
        }
    };

    ko.components.register('uiarray', {
        viewModel: uiArrayViewModel,
        template:
                "<div data-bind='foreach: sourceArray'><div style= 'float:left; padding-right: 10px;margin-bottom:3px;' ><a  data-bind='text:$data.name'><a><button type='button' class='close' aria-hidden='true' data-bind='click: $parent.popValue'>&times;</button></div></div> "

    });

    ko.components.register('selected-filelabel', {
        viewModel: uiArrayViewModel,
        template:
                "<div data-bind='foreach: sourceArray'><div style= 'float:left; padding-right: 10px;margin-bottom:3px;' ><div class='lable_div_outer'  data-bind='style: {backgroundColor: $data.backgroundColor}'><span style='min-width: 40px; max-width: 70px; overflow: hidden;text-overflow: ellipsis; white-space: nowrap; display: block;line-height: 18px;' data-bind='text: $data.name, style: {color: $data.fontColor}'></span></div><button type='button' class='close' aria-hidden='true' data-bind='click: $parent.popValue'>&times;</button></div></div> "
    });

    ko.components.register('selectd-org-node', {
        viewModel: uiArrayViewModel,
        template:
                "<ul data-bind='foreach: sourceArray'><li style= 'padding-right: 10px;margin-bottom:3px;clear: both' ><div class='dl select-member-content'><i class='fa dl' data-bind='css: $data.icon'></i><a  data-bind='text:$data.name'><a></div><button type='button' class='close' aria-hidden='true' data-bind='click: $parent.popValue'>&times;</button></li></ul> "

    });
        
//    ko.components.register('selectd-share-org-node', {
//        viewModel: function(params){
//            uiArrayViewModel.call(this, params);
//            this.onChecked = params.onChecked;
//        },
//        template: {element: 'selectd-share-org-node'}
//    });
//
//    ko.components.register('selectd-share-org-node-phone', {
//        viewModel: uiArrayViewModel,
//        template:
//                "<ul data-bind='foreach: sourceArray'>" +
//                "<li style= 'padding-right: 10px;margin-bottom:3px;clear: both;line-height:24px; height:24px;' >"
//                + "<i class='dl phone-check' data-bind=\"click: function(){$data.data().checked(!$data.data().checked())}, preventBubble: 'click', css:$data.data().checked() ? 'fa fa-check-circle greyc activec':'fa fa-circle-thin greyc'\"></i>"
//                + "<div class='dl select-member-content'>"
//                + "<i class='fa' data-bind='css: $data.icon'></i>"
//                + "<a  data-bind='text:$data.name'></a>"
//                + "</div>"
//                + "<span class='dl' data-bind='text: $data.data().role().roleName'></span>"
//                + "<button type='button' class='close' aria-hidden='true' data-bind='click: $parent.popValue'>&times;</button>"
//                + "</li>"
//                + "</ul> "
//
//    });

    ko.components.register('subscribers', {
        viewModel: function (params) {
            var self = this;
            self.sourceArray = params.sourceArray;
            self.isManageStatus = params.isManageStatus;
            self.toDeletedArray = params.toDeletedArray;

            self.popValue = function (data)
            {
                if (-1 !== self.sourceArray.indexOf(data))
                {
                    self.toDeletedArray.push(data);
                    self.sourceArray.remove(data);
                }
            };
            self.showDeleteButton = function () {
                self.toDeletedArray().length = 0;
                self.isManageStatus(true);
            };
            self.isShowManageButton = ko.observable(true);
            self.isManageStatus.subscribe(function (newValue) {
                if (newValue !== null) {
                    self.isShowManageButton(!newValue);
                }

            });

        },
        template: {require: 'text!tmpls/component-comment-subscribers.html'}

    });

    ko.components.register('verifyimage', {
        viewModel: {require: ('tmpls/verify/component-verifyimage.js')},
        template: {require: 'text!' + ('tmpls/verify/component-verifyimage.html')}
    });

    ko.components.register('demos', {
        viewModel: {require: 'tmpls/demos/demos.js'},
        template: {require: 'text!tmpls/demos/demos.html'}
    });

    ko.components.register('headimageeditor', {
        viewModel: {require: 'tmpls/photoEditor/headImageEdit.js'},
        template: {require: 'text!tmpls/photoEditor/headImageEdit.html'}
    });
    ko.components.register('phoneheadimageeditor', {
        viewModel: {require: 'tmpls/photoEditor/headImageEdit.js'},
        template: {require: 'text!tmpls/photoEditor/headImageEdit_phone.html'}
    });
    ko.components.register('photoeditoronline', {
        viewModel: {require: 'tmpls/photoEditor/photoEditor.js'},
        template: {require: 'text!tmpls/photoEditor/photoEditor.html'}
    });
    ko.components.register('phonephotoeditoronline', {
        viewModel: {require: 'tmpls/photoEditor/photoEditor.js'},
        template: {require: 'text!tmpls/photoEditor/photoEditor_phone.html'}
    });
    ko.components.register('distpicker', {
        viewModel: {require: 'tmpls/contact/distpick.js'},
        template: {require: 'text!tmpls/contact/distpick.html'}
    });

    ko.components.register('onLineEdit', {
        viewModel: {require: 'tmpls/component-content-edit.js'},
        template: {require: 'text!tmpls/component-content-edit.html'}
    });
    ko.components.register('contentviewer', {
        viewModel: {require: 'tmpls/component-content-viewer.js'},
        template: {require: 'text!tmpls/component-content-viewer.html'}
    });
    ko.components.register('like-widget', {
        viewModel: {require: 'tmpls/component-like-widget.js'},
        template: {require: 'text!tmpls/component-like-widget.html'}
    });
    ko.components.register('appinfo', {
        viewModel: {require: 'tmpls/component-appinfo.js'},
        template: {require: 'text!tmpls/component-appinfo.html'}
    });
    ko.components.register('ckeditor', {
        viewModel: {require: 'tmpls/component-ckeditor.js'},
        template: {require: 'text!tmpls/component-ckeditor.html'}
    });
    ko.components.register('codemirror', {
        viewModel: {require: 'tmpls/component-codemirror.js'},
        template: {require: 'text!tmpls/component-codemirror.html'}
    });
    ko.components.register('adminsearch', {
        viewModel: {require: window.config.getServer('gpadmin/component-admin-search.js')},
        template: {require: 'text!' + window.config.getServer('gpadmin/component-admin-search.html')}
    });
    ko.components.register('tabadmin', {
        viewModel: {require: window.config.getServer('admin/component-admin.js')},
        template: {require: 'text!' + window.config.getServer('admin/component-admin.html')}
    });
    ko.components.register('tabgpadmin', {
        viewModel: {require: window.config.getServer('gpadmin/component-gpadmin.js')},
        template: {require: 'text!' + window.config.getServer('gpadmin/component-gpadmin.html')}
    });
    ko.components.register('importfile', {
        viewModel: {require: 'tmpls/component-importer.js'},
        template: {require: 'text!tmpls/component-importer.html'}
    });
    ko.components.register('officeonline', {
        viewModel: {require: 'tmpls/component-officeonline.js'},
        template: {require: 'text!tmpls/component-officeonline.html'}
    });
    ko.components.register('filefilters', {require: ('tmpls/file-filter/component-filefilters.js')});
    ko.components.register('phoneverify', {
        viewModel: {require: ('tmpls/verify/component-phone-verify.js')},
        template: {require: 'text!' + ('tmpls/verify/component-tool-verify.html')}
    });
    ko.components.register('emailverify', {
        viewModel: {require: ('tmpls/verify/component-email-verify.js')},
        template: {require: 'text!' + ('tmpls/verify/component-tool-verify.html')}
    });
    ko.components.register('passwordverify', {
        viewModel: {require: ('tmpls/verify/component-password-verify.js')},
        template: {require: 'text!' + ('tmpls/verify/component-password-verify.html')}
    });
    ko.components.register('phone-orgtree', {
        viewModel: {require: 'tmpls/phone-orgtree/phone-orgtree.js'},
        template: {require: 'text!tmpls/phone-orgtree/phone-orgtree.xhtml'}
    });
    
    ko.components.register('phone-filetree', {
        viewModel: {
            createViewModel: function (params, componentInfo) {
                return new PhoneFileTreeModel(params, componentInfo);
            }
        },
        template: {element: 'phone-filetree-components'}
    });
    ko.components.register('tree', {
        viewModel: {
            createViewModel: function (params, componentInfo) {
                return new TreeViewModel(params, componentInfo);
            }
        },
        template: {element: 'tree-components'}
    });
    ko.components.register('org-tree', {
        viewModel: {
            createViewModel: function (params, componentInfo) {
                return new TreeViewModel(params, componentInfo);
            }
        },
        template: {element: 'org-tree-components'}
    });


    ko.components.register('emoji', {
        viewModel: {require: ('tmpls/emoji.js')},
        template: {require: 'text!' + ('tmpls/emoji.html')}
    });
    ko.components.register('calendar', {
        viewModel: {require: ('tmpls/calendar/calendar.js')},
        template: {require: 'text!' + ('tmpls/calendar/calendar.html')}
    });
    ko.components.register('contacts', {
        viewModel: {require: ('tmpls/contact/contact.js')},
        template: {require: 'text!' + ('tmpls/contact/contact.html')}
    });
    ko.components.register('comment', {
        viewModel: {require: 'tmpls/commentr/commentr.js'},
        template: {require: 'text!tmpls/commentr/comment.html'}
    });
    ko.components.register('commentr', {
        viewModel: {require: 'tmpls/commentr/commentr.js'},
        template: {require: 'text!tmpls/commentr/commentr.html'}
    });
    ko.components.register('commentdialog', {
        viewModel: {require: 'tmpls/commentr/commentr.js'},
        template: {require: 'text!tmpls/commentr/comment_dialog.html'}
    });
    ko.components.register('commentr-dir', {
        viewModel: {require: 'tmpls/commentr/commentr.js'},
        template: {require: 'text!tmpls/commentr/commentr_dir.html'}
    });
    ko.components.register('imagedetail', {
        viewModel: {require: 'tmpls/component-image.js'},
        template: {require: 'text!tmpls/component-image.html'}
    });
    ko.components.register('pie', {
        viewModel: {require: 'tmpls/component-pie.js'},
        template: '<div/>'
    });
    ko.components.register('grid', {
        viewModel: {require: 'tmpls/component-grid.js'},
        template: '<table/>'
    });
    
    ko.components.register('echartpie', {require: 'tmpls/chart/echartPie.js'});

    ko.components.register('echartLine', {
        viewModel: {require: 'tmpls/chart/echartLine.js'},
        template: '<div/>'
    });
    
    ko.components.register('ocr', {
        viewModel: {require: window.config.getServer('tmpls/tesseract/ocr.js')},
        template: {require: 'text!' + window.config.getServer('tmpls/tesseract/ocr.html')}
    });
    ko.components.register('unlockpass', {
        viewModel: {require: 'tmpls/unlockpass/component-unlock-pass.js'},
        template: {require: 'text!tmpls/unlockpass/component-unlock-pass.html'}
    });

    ko.components.register('singFileHistoryDialog', {
        viewModel: {require: 'tmpls/singleFileHistory/component-single-file-history.js'},
        template: {require: 'text!tmpls/singleFileHistory/single-file-history-dialog.html'}
    });
    ko.components.register('fileattr', {
        viewModel: {require: 'tmpls/fileattr/component-fileattr.js'},
        template: {require: 'text!tmpls/fileattr/component-fileattr.html'}
    });
    ko.components.register('readme', {
        viewModel: {require: 'tmpls/readme/component-readme.js'},
        template: {require: 'text!tmpls/readme/component-readme.html'}
    });
    ko.components.register('pager', {
        viewModel: {require: 'tmpls/pager/component-pager.js'},
        template: {require: 'text!tmpls/pager/component-pager.xhtml'}
    });
    ko.components.register('nodata', {
        viewModel: {require: 'tmpls/noData/component-nodata.js'},
        template: {require: 'text!tmpls/noData/component-nodata.html'}
    });

    /*首次登录用户检测项*/

    ko.components.register('userlogininit', {
        viewModel: {require: 'tmpls/logininit/component-user-login-init.js'},
        template: {require: 'text!tmpls/logininit/component-user-login-init.html'}
    });

     /*首次登录操作按钮提示项*/

    ko.components.register('operationtip', {
        viewModel: {require: 'tmpls/operationTips/component-operationtip.js'},
        template: {require: 'text!tmpls/operationTips/component-operationtip.html'}
    });
    ko.components.register('brieffolder', {
        viewModel: {require: 'tmpls/component-brief-folder.js'},
        template: {require: 'text!tmpls/component-brief-folder.html'}
    });
    ko.components.register('review', {
        viewModel: {require: 'tmpls/review/component-review.js'},
        template: {require: 'text!tmpls/review/component-review.html'}
    });
    ko.components.register('sharedetail', {
        viewModel: {require: 'tmpls/component-share-detail.js'},
        template: {require: 'text!tmpls/component-share-detail.html'}
    });
    ko.components.register('loginpage', {
        viewModel: {require: 'tmpls/loginPage/component-login-page.js'},
        template: {require: 'text!' + 'tmpls/loginPage/component-login-page.html'}
    });

    ko.route = {};
    ko.route.hash = ko.observable().extend({ notify: 'always' });//方便刷新当前页的数据
    ko.utils.subtrack = function (componentInfo) {
        var subscriptions = [];
        var dispose = function () {
            for (var i = 0; i < subscriptions.length; i++) {
                if (subscriptions[i])
                    subscriptions[i].dispose();
            }
            subscriptions.length = 0;
        };
        this.dispose = dispose;
        ko.utils.domNodeDisposal.addDisposeCallback(componentInfo.element, dispose);
        //$(componentInfo.element).on('destroy', dispose);
        this.push = function (sub) {
            subscriptions.push(sub);
            return sub;
        };
        this.remove = function (sub) {
            if (sub) {
                var index = subscriptions.indexOf(sub);
                delete subscriptions[index];
                sub.dispose();
            }
        };
    };
    //http://stackoverflow.com/questions/17983118/change-observable-but-dont-notify-subscribers-in-knockout-js
    ko.observable.fn.withPausing = function () {
        this.notifySubscribers = function () {
            if (!this.pauseNotifications) {
                ko.subscribable.fn.notifySubscribers.apply(this, arguments);
            }
        };

        this.sneakyUpdate = function (newValue) {
            this.pauseNotifications = true;
            this(newValue);
            this.pauseNotifications = false;
        };

        return this;
    };

    ko.components.register('ko-route', {
        viewModel: {
            createViewModel: function (params, componentInfo) {
                function korouteViewModel(params, componentInfo) {
                    var self = this;
                    self.tmplname = params.template || ko.observable().withPausing();
                    //self.tmplname.extend({rateLimit: 50});
                    self.component = params.component || ko.observable().withPausing();
                    //self.component.extend({rateLimit: 50});
                    self.params = params.params || {};
                    self.data = params.data || ko.observable();
                    self.componentParams = ko.observable().withPausing();
                    //self.componentParams.extend({rateLimit: 50});
                    self.routes = params.routes || ko.observableArray([]);
                    self.base = ko.unwrap(params.base) || '';
                    self.usingTemplate = ko.observable(false).withPausing();
                    self.usingComponent = ko.observable(false).withPausing();
                    //self.usingTemplate.extend({rateLimit: 50});
                    //self.usingComponent.extend({rateLimit: 50});
                    self.defaultRoute = params.defaultRoute;
                    self.lastRoute = null;
                    self.lastRouteOps = ko.observable();

                    self.getDefaultRoute = function () {
                        if (ko.unwrap(self.defaultRoute)) {
                            return ko.unwrap(self.defaultRoute);
                        }
                        var routes = ko.unwrap(self.routes);
                        if (routes && routes.length > 0) {
                            return routes[0].route;
                        }
                    };
                    function hashchanged(data) {
                        var hash = data;
                        if (hash.indexOf("#") === 0)
                            hash = hash.substring(1);
                        var base = self.base;
                        if (base.length !== 0 && base.substring(base.length - 1) === '/') {
                            base = base.substring(0, base.length - 1);
                        }
                        if (base.length !== 0 && hash.indexOf(base) !== 0){
                            return;

                        }
                        hash = hash.substring(base.length);
                        while (hash.indexOf("/") === 0) {
                            hash = hash.substring(1);
                        }
                        var path = hash;
                        if (hash.indexOf("/") > 0) {
                            path = hash.substring(hash.indexOf("/") + 1);
                            hash = hash.substring(0, hash.indexOf("/"));
                        } else {
                            path = "";
                        }
                        if (!hash || hash.length === 0) {
                            hash = self.getDefaultRoute();
                        }
                        var routes = ko.unwrap(self.routes);
                        for (var i = 0; i < routes.length; ++i) {
                            var route = routes[i];
                            if (route.route === hash) {
                                var parentRoute = self.base;
                                if (!parentRoute.endsWith("/")) {
                                    parentRoute += "/";
                                }
                                parentRoute += route.route;

                                self.lastRouteOps({path: path, route: hash, base: self.base, parentRoute: parentRoute});
                                if (route.onenter) {
                                    route.onenter(self.lastRouteOps);
                                }
                                if (ko.isObservable(route.active)) {
                                    route.active(true);
                                }
                                if (route.component) {
                                    var params = ko.unwrap(route.params || {});
                                    if (!ko.isObservable(params.routeOps)) {
                                        params.routeOps = ko.observable();
                                    }
                                    params.routeOps(self.lastRouteOps());
                                }
                                if (self.lastRoute !== route) {
                                    if (route.component) {
                                        self.usingTemplate(false);
                                        //self.usingComponent(false);
                                        self.tmplname.sneakyUpdate('');
                                        self.componentParams.sneakyUpdate(params);
                                        self.component(route.component);
                                        self.usingComponent(true);
                                    } else {
                                        //self.usingTemplate(false);
                                        self.usingComponent(false);
                                        self.component.sneakyUpdate('');
                                        self.tmplname(route.template);
                                        self.usingTemplate(true);
                                    }
                                }
                                self.lastRoute = route;
                                if (route.done) {
                                    route.done(self.lastRouteOps);
                                }
                                //return;
                            } else {
                                if (ko.isObservable(route.active)) {
                                    route.active(false);
                                }
                            }
                        }
                    }
                    var subscriptions = new ko.utils.subtrack(componentInfo);
                    hashchanged(customDecodeURI(window.location.hash));
                    subscriptions.push(ko.route.hash.subscribe(hashchanged));

                }
                return new korouteViewModel(params, componentInfo);

            }
        },
        template:
                "<!-- ko if:usingTemplate --><!-- ko template: {name:tmplname, data:data} --><!-- /ko --><!-- /ko -->\n" +
                "<!-- ko if:usingComponent --><!-- ko component: {name:component,params:componentParams} --><!-- /ko --><!-- /ko -->"
    });
//    ko.components.register('ko-routetab', {
//        viewModel: {
//            createViewModel: function (params, componentInfo) {
//                return params;
//            }
//        },
//        template:
//                '<ul class="nav nav-tabs space-statistics" data-bind="foreach: routes">\n' +
//                '<li role="presentation"  data-bind="css: { active: $data.active() }">\n' +
//                '<a data-bind="click: $parent.gotoTab"><span data-bind="text: $data.getLabel()"/></a>\n' +
//                '</li>\n' +
//                '</ul>\n' +
//                "<!-- ko component: {name:'ko-route',params:$data} --><!-- /ko -->"
//    });
    ko.components.register('ko-tab', {
        viewModel: {
            createViewModel: function (params, componentInfo) {
                params = params || {};
                var self = params;
                self.tmplname = params.template || ko.observable().withPausing();
                //self.tmplname.extend({rateLimit: 50});
                self.component = params.component || ko.observable().withPausing();
                //self.component.extend({rateLimit: 50});
                self.params = params.params || {};

                self.data = params.data || ko.observable();
                self.componentParams = ko.observable().withPausing();

                self.usingTemplate = ko.observable(false).withPausing();
                self.usingComponent = ko.observable(false).withPausing();
                
                self.gotoTab = function (data, event) {
                    var tabs = ko.unwrap(self.tabs);
                    for (var i = 0; i < tabs.length; ++i) {
                        var tab = tabs[i];
                        if (tab === data) {
                            if (ko.isObservable(tab.active)) {
                                tab.active(true);
                            }
                            if (self.lastTab !== tab) {
                                if (tab.onenter) {
                                    tab.onenter(data, event);
                                }
                                if (tab.component) {
                                    self.usingTemplate(false);
                                    //self.usingComponent(false);
                                    self.tmplname.sneakyUpdate('');
                                    self.componentParams.sneakyUpdate(params);
                                    self.component(tab.component);
                                    self.usingComponent(true);
                                } else {
                                    //self.usingTemplate(false);
                                    self.usingComponent(false);
                                    self.component.sneakyUpdate('');
                                    self.tmplname(tab.template);
                                    self.usingTemplate(true);
                                }
                                self.lastTab = tab;
                                if (tab.done) {
                                    tab.done(data, event);
                                }
                            }
                        } else {
                            if (ko.isObservable(tab.active)) {
                                tab.active(false);
                            }
                        }
                    }
                };
                function getActiveTab() {
                    var tabs = ko.unwrap(self.tabs);
                    for (var i = 0; i < tabs.length; ++i) {
                        var tab = tabs[i];
                        if (ko.unwrap(tab.active)) {
                            return tab;
                        }
                    }
                    return tabs[0];
                }
                self.gotoTab(getActiveTab());
                return self;
            }
        },
        template:
                '<ul class="nav nav-tabs" data-bind="foreach: tabs">\n' +
                '<li role="presentation"  data-bind="css: { active: $data.active(),  hidden: $data.getTabClazz() == \'hidden\'}">\n' +
                '<a data-bind="click: $parent.gotoTab"><span data-bind="text: $data.getLabel()"/></a>\n' +
                '</li>\n' +
                '</ul>\n' +
                "<!-- ko if:usingTemplate --><!-- ko template: {name:tmplname, data:data} --><!-- /ko --><!-- /ko -->\n" +
                "<!-- ko if:usingComponent --><!-- ko component: {name:component,params:componentParams} --><!-- /ko --><!-- /ko -->"

    });
    
    var uniqueCheckboxId = 0;
    ko.components.register('custom-checkbox', {
        viewModel: {
            createViewModel: function(params, componentInfo) {
                function CheckboxViewModel(params, componentInfo) {
                    var self = this;
                    var onChecked = params.onChecked;
                    var label = params.label;
                    var origin = params.origin;
                    var confirmCheck = params.confirmCheck;
                    
                    self.checked = params.checked;
                    self.enable = (params.enable !== null && params.enable !== undefined) ? params.enable : true;
                    self.disable = params.disable || ko.pureComputed(function(){return !ko.unwrap(self.enable);});
                    self.bubble = params.bubble || "click";
                    self.tooltip = params.tooltip || {};
                    self.attr = params.attr || {};
                    self.label = null;
                    
                    self.labelIsInherit = params.labelIsInherit || false;
                    self.isSmallScreen = RootView.isSmallScreen;
                    
                    self.labelSpan = params.labelSpan;
                    self.isChecked = function(){
                        var modelValue = ko.unwrap(self.checked);

                        if (typeof modelValue === "boolean") {
                            return modelValue;
                        } else if (modelValue instanceof Array) {
                            return ko.utils.arrayIndexOf(modelValue, ko.unwrap(self.attr["value"])) >= 0;
                        } else {
                            return ko.unwrap(self.attr["value"]) === modelValue;
                        }
                    };
                    
                    self.toggleChecked = function(){
                        var state = !ko.unwrap(self.checked);
                        
                        if (ko.isObservable(self.checked)) {
                            self.checked(state);
                        } else {
                            self.checked = state;
                        }
                    };
                    
                    self.css = ko.pureComputed(function(){
                        if (self.isSmallScreen()) {
                            var css = "circular-checkbox fa greyc ";
                            var disable = ko.unwrap(self.disable);
                            css = self.isChecked() ? css + "fa-check-circle  activec " : css + (disable ? "fa-circle-o ":"fa-circle-thin ");
                            return disable ? css + " disabled" : css;
                        } else {
                            return "checkbox-custom_img ";
                        }
                    });

                    if (!!label) {
                       var id = "custom-checkbox" + uniqueCheckboxId++;
                       self.attr["id"] = id;
                       self.label =  typeof ko.unwrap(label) === "object" ? label : {text: label};
                       self.label.attr = self.label.attr || {};
                       self.label.attr["for"] = id;
                    }

                    if (ko.isSubscribable(self.checked)) {
                        var subscriptions = new ko.utils.subtrack(componentInfo);

                        subscriptions.push(
                            self.checked.subscribe(function(checked){
                                if(global.isFunction(onChecked)){
                                    onChecked(checked, origin);
                                }
                            })    
                        );

                    }
                    
                    var confirmCheckWrapper = null;
                    if ($.isFunction(confirmCheck)) {
                        confirmCheckWrapper = function(e){
                            if (!ko.unwrap(self.disable)) {
                                e.preventDefault();

                                confirmCheck(function(success){
                                    if (success) {
                                        self.checked(!self.checked());
                                    }
                                });
                            }
                        };
                        
                        ko.utils.registerEventHandler($(componentInfo.element).find(".checkbox-custom-label")[0], 'click', confirmCheckWrapper);
                    }
                    
                    ko.utils.registerEventHandler(componentInfo.element, 'click', function(event){
                        event.cancelBubble = true;
                        if (event.stopPropagation) {
                            event.stopPropagation();
                        }
                        if (confirmCheckWrapper) {
                            confirmCheckWrapper(event);
                        }
                    });
                };
                return new CheckboxViewModel(params, componentInfo);
            }    
        },
        
        template: {element: 'custom-checkbox-tmpl'} 
    });
    
    ko.components.register('userRegister', {
        viewModel: {require: 'tmpls/register/component-register.js'},
        template: {require: 'text!tmpls/register/component-register.html'}
    });

    ko.components.register('userChangepass', {
        viewModel: {require: 'tmpls/modifyPass/component-user-modify-pass.js'},
        template: {require: 'text!tmpls/modifyPass/component-user-modify-pass.html'}
    });

    ko.components.register('org-search', {
        viewModel: {require: 'tmpls/orgSearch/component-org-search.js'},
        template: {require: 'text!tmpls/orgSearch/component-org-search.xhtml'}
    });
    
    ko.components.register('phone-filter-datepick', {
        viewModel: function (params) {
            var self = this;
            self.value = params.value;
            self.dateInfo = new CalendarDateInfo(new Date());
            self.srue = params.sure || function () {
                return params.value(self.dateInfo.dateToString());
            };
            self.clear = params.clear || function () {
                return params.value("");
            };
            self.dateInfoDateArray = [
                {
                    text: l10n("time.year"),
                    next: self.dateInfo.nextYear,
                    last: self.dateInfo.lastYear,
                    value: function () {
                        return self.dateInfo.getYear();
                    }
                },
                {
                    text: l10n("time.month"),
                    next: self.dateInfo.nextMonth,
                    last: self.dateInfo.lastMonth,
                    value: function () {
                        return self.dateInfo.getMonth() + 1;
                    }
                }, {
                    text: l10n("time.day"),
                    next: self.dateInfo.nextDay,
                    last: self.dateInfo.lastDay,
                    value: function () {
                        return self.dateInfo.getDate();
                    }
                }
            ];
            self.dateInfoTimeArray = [
                {
                    text: l10n("time.hour"),
                    next: self.dateInfo.nextHour,
                    last: self.dateInfo.lastHour,
                    value: function () {
                        return self.dateInfo.getHour();
                    }
                }, {
                    text: l10n("time.minute"),
                    next: self.dateInfo.nextMinute,
                    last: self.dateInfo.lastMinute,
                    value: function () {
                        return self.dateInfo.getMinute();
                    }
                }
            ];
            self.dateInfo.currentDate.subscribe(function () {
                params.value(self.dateInfo.dateToString());
                var str = self.dateInfo.currentDate();
            });
            var Record = 0;
            self.touchMove = function(params){
                event.preventDefault();
                var data = params.data;
                if(params.states === touchStates.move){
                    if((params.moveY - Record)>20){
                        Record = params.moveY;
                        data.last();
                    }
                    if((params.moveY - Record)<-20){
                        Record = params.moveY;
                        data.next();
                        
                    }
                }
            };
        },
        template: {element: 'tempdatePickerMobileModal'}
    });

    ko.components.register('common-dialog', {
        viewModel: function (params) {
            var self = this;
            var data = params.data;
           
            self.dialogId = data.dialogId;
            self.dialogCss =  data.dialogCss 
                              ? data.dialogCss
                              : (data.smallDialog) ? 'smallDialog' : 'commonDialog';
            self.modalDialogCss = data.fullScreen ? 'bigScreenFullScreen' : data.modalDialogCss;
            self.fullScreen = data.fullScreen || false;
            
            self.hideHeader = data.hideHeader;
            self.headerTemplate = data.headerTemplate || 'commonHeaderTemplate';
            self.headerTemplateData = data.headerTemplateData || data;
            
            data.commonHeaderIcon = ko.computed(function(){
                return RootView.isSmallScreen()
                    ? (data.smallDialog ? 'fa fa-close' : 'fa fa-chevron-left')
                    : 'fa fa-close';});
            data.leftClick = data.leftClick || function closeDialog() {
                $('#' + self.dialogId).modal('hide');
            };

            self.bodyCss = data.bodyCss;
            self.bodyTemplate = data.bodyTemplate;
            self.component = data.component;
            self.bodyTemplateData = data.bodyTemplateData || data;

            self.hideFooter = data.hideFooter;
            self.footerCss = data.footerCss;
            self.footerTemplate = data.footerTemplate || 'commonFooterTemplate';
            self.footerTemplateData = data.footerTemplateData || data;
            if (data.hiddenFooterInPhone && RootView.isSmallScreen()) {
                self.hideFooter = true;
            }
            data.dialogSureText = data.dialogSureText || l10n('dialog.sure');
            data.dialogCancelText = data.dialogCancelText || l10n('dialog.cancel');

            var smallCommonDialog = RootView.isSmallScreen() && self.dialogCss === 'commonDialog';
            if (smallCommonDialog || self.fullScreen) {
                if (data.hideHeader) {
                    self.smallScreenBodyHeight = ko.computed(function(){
                        return (data.hiddenFooterInPhone || self.hideFooter)
                            ? RootView.windowHeight()
                            : (RootView.windowHeight() - 56 + 'px');
                    })
                } else {
                    self.smallScreenBodyHeight = ko.computed(function(){
                        return (data.hiddenFooterInPhone || self.hideFooter)
                            ? RootView.getFullModalBody()
                            : (RootView.windowHeight() - 50 - 56 + 'px');
                    });
                }
            } else {
                self.smallScreenBodyHeight = '';
            }
        },
        template: {element: 'dialog-template'}
    });
    
    ko.components.register('operate-menu', {
        viewModel: {
            createViewModel: function(params, componentInfo) {
                function operateMenu(params,componentInfo) {
                    var self = this;
                    var isSmallScreen = RootView.isSmallScreen();

                    self.showSelect = params.showSelect === false ? false : true;
                    self.selectedNumDisplay = ko.unwrap(params.selectedNumDisplay) || ko.observable('');
                    self.selectAll = params.selectAll;
                    self.selectNone = params.selectNone;
                    self.selectRevert = params.selectRevert;
                    if( isEmpty(self.selectAll) && isEmpty(self.selectNone) && isEmpty(self.selectRevert)){
                        self.showSelect = false;
                    }

                    var inDialog = !!$(componentInfo.element).parents(".modal-content").length;
                    if(inDialog && !RootView.isSmallScreen()){
                        var element = $(componentInfo.element).find(".dropdown")[0];
                        fixedDropdownMenuFunction(element, {dialogId: ko.contextFor(element).$root.dialogId});
                    }
                    var operateMenu = params.operateMenu instanceof Array ?  params.operateMenu : ko.unwrap(params.operateMenu());
                    self.centralOperate = [];
                    self.operateInMore = [];

                    ko.utils.arrayForEach(operateMenu, function (operate, index) {
                        if( operate.showInMore === "both" 
                            || operate.showInMore === "bigScreen" && !isSmallScreen
                            || operate.showInMore === "smallScreen" && isSmallScreen
                            || operate.isSeparator){
                            var itemLength = self.operateInMore.length;

                            if( !operate.isSeparator ){
                                self.operateInMore.push(operate);
                            }else if(itemLength > 0 && !self.operateInMore[itemLength -1 ].isSeparator && index !== operateMenu.length -1 ){
                                self.operateInMore.push(operate);
                            }

                        }else{
                            self.centralOperate.push(operate);
                        }
                        operate.visible = !isEmpty(operate.visible) ? operate.visible : true;
                    });

                    self.showMore = self.operateInMore.length > 0;
                    self.getWidth = ko.observable();
                    if(isSmallScreen){
                        self.getWidth = ko.computed( function(){
                            var widthWeightTotal = 0;

                            ko.utils.arrayForEach(self.centralOperate, function (operate, index) {
                                if( ko.unwrap(operate.visible) ){
                                    widthWeightTotal = (widthWeightTotal + (operate.widthWeight || 1));
                                }
                            });

                            var width;
                            if( self.showMore ){
                                width = self.showSelect ? 100/(widthWeightTotal + 2) : 100/(widthWeightTotal + 1) ;
                            }else{
                                width = self.showSelect ? 100/(widthWeightTotal + 1) : 100/widthWeightTotal;
                            }

                            return width;
                        });
                    }
                }
                return new operateMenu(params, componentInfo);
            }
        },    
        template: {element: 'operate-menu-template'}
    });

    ko.components.register('multi-files-menu', {
        viewModel: function (params) {
            var self = this;
            var isSmallScreen = RootView.isSmallScreen();
            
            self.showSelect = params.showSelect === false ? false : true;
            self.selectedNumDisplay = ko.unwrap(params.selectedNumDisplay) || ko.observable('');
            self.selectAll = params.selectAll;
            self.selectNone = params.selectNone;
            self.selectRevert = params.selectRevert;
            if( isEmpty(self.selectAll) && isEmpty(self.selectNone) && isEmpty(self.selectRevert)){
                self.showSelect = false;
            }
            var centralOperate = [];
            var operateInMore = [];
            var menus = params.menus;
            if(typeof menus === "function"){
                menus = menus();
            }
            menus = ko.unwrap(menus);
            ko.utils.arrayForEach(menus, function (operate, index) {
                if( operate.showInMore === "both" 
                    || operate.showInMore === "bigScreen" && !isSmallScreen
                    || operate.showInMore === "smallScreen" && isSmallScreen
                    || operate.isSeparator){
                        operateInMore.push(operate);           
                }else{
                    centralOperate.push(operate);
                }
            });
            params.menus = centralOperate.concat(operateInMore);
            
            OperateMenu.call(self, params);
            
            self.dispose = function () {
                for(var i=0;i<menus.length;i++){
                    if(menus[i].disable && ko.isComputed(menus[i].disable)){
                        menus[i].disable.dispose();
                    }
                    
                    if(menus[i].visible && ko.isComputed(menus[i].visible)){
                       menus[i].visible.dispose();
                    }
                }
            };
            
            self.getWidth = ko.observable();
            if(isSmallScreen){
                self.getWidth = ko.computed( function(){
                    var width;
                    if(self.isShowMoreMenus()){
                        width = self.showSelect ? 100/(self.shownMenus().length + 2) : 100/self.shownMenus().length+1;
                    }else{
                        width = self.showSelect ? 100/(self.shownMenus().length + 1) : 100/self.shownMenus().length;
                    }       
                    return width;
                });
            }
        },
        template: {element: 'multi-files-menu-template'}
    });
    
    ko.components.register('small-screen-head', {
        viewModel: function (params) {
            var self = this;

            self.name = params.name || RootView.currentTabName;
            self.centralIcon = params.centralIcon;
            self.headCss = params.dialog ? '' : 'navbar-fixed-top visiblecloud-xs visiblecloud-sm';

            self.hiddenLeftOperate = params.hiddenLeftOperate;
            if (!self.hiddenLeftOperate) {
                self.leftIcon = params.leftIcon || 'fa fa-chevron-left';
                self.leftClick = function(data, event){
                    var click = ko.unwrap(params.leftClick);
                    if ($.isFunction(click)) {
                        click.call(data, data, event);
                    }
                } ;
                self.leftTemplate = params.leftTemplate;
                self.leftTemplateData = params.leftTemplateData;
            }

            self.showRightOperate = global.isFunction(params.showRightOperate)
                    ? params.showRightOperate
                    : function () {
                        return params.showRightOperate;
                    };
            self.rightIcon = params.rightIcon || 'fa fa-plus';
            self.rightClick = ko.unwrap(params.rightClick) || RootView.plusContext().defaultPlusClick
            self.rightTemplate = params.rightTemplate;
            self.rightTemplateData = params.rightTemplateData;
            self.switchEvent = params.switchEvent;
            
        },
        template: {element: 'small-screen-head-template'}
    });
    ko.components.register('validity-time', {
        viewModel: {require: 'tmpls/rolePermission/component-validity-time.js'},
        template: {require: 'text!tmpls/rolePermission/component-validity-time.html'}
    });
    ko.components.register('role-time', {
        viewModel: {require: 'tmpls/rolePermission/component-role-time.js'},
        template: {require: 'text!tmpls/rolePermission/component-role-time.html'}
    });
    ko.components.register('role', {
        viewModel: {require: 'tmpls/rolePermission/component-role.js'},
        template: {require: 'text!tmpls/rolePermission/component-role.html'}
    });
    ko.components.register('role-entry-list', {
        viewModel: {require: 'tmpls/rolePermission/component-role-entry-list.js'},
        template: {require: 'text!tmpls/rolePermission/component-role-entry-list.html'}
    });
    ko.components.register('role-templete', {
        viewModel: {require: 'tmpls/rolePermission/component-permission-templete.js'},
        template: {require: 'text!tmpls/rolePermission/component-permission-templete.html'}
    });
    ko.components.register('role-table', {
        viewModel: {require: 'tmpls/rolePermission/component-role-table.js'},
        template: {require: 'text!tmpls/rolePermission/component-role-table.html'}
    });
    ko.components.register('role-peview', {
        viewModel: {require: 'tmpls/rolePermission/component-role-peview.js'},
        template: {require: 'text!tmpls/rolePermission/component-role-peview.html'}
    });
    ko.components.register('volume-set', {
        viewModel: {require: 'tmpls/component-volumeset.js'},
        template: {require: 'text!tmpls/component-volumeset.html'}
    });
    
    ko.components.register('custom-table', {
        viewModel: {require: 'tmpls/customTable/component-custom-table.js'},
        template: {require: 'text!tmpls/customTable/component-custom-table.html'}
    });
    
    ko.components.register('custom-new-table', {
        viewModel: {require: 'tmpls/custom-new-table/component-custom-table.js'},
        template: {require: 'text!tmpls/custom-new-table/component-custom-table.html'}
    });
//    ko.components.register('cloud-dropdown', {
//        viewModel: {require: 'tmpls/component-dropdown.js'},
//        template: {require: 'text!tmpls/component-dropdown.html'}
//    });
    
    ko.components.register('custom-table-item-menu', {
        viewModel: function (params) {
            var self = this;
            self.frontArray = [];
            self.postArray = [];
            self.data = params.data;
            self.getSelected = params.getSelected;
            var itemMenu = ko.unwrap( params.itemMenu);
            if(!itemMenu){
                return false;
            }
            self.click = function (itemData) {
                if (itemData.click) {
                    if (itemData.type && itemData.type === menuItemType.single) {
                        itemData.click(self.data);
                    } else if (itemData.type && itemData.type === menuItemType.multi) {
                        itemData.click(self.getSelected());
                    } else {
                        itemData.click();
                    }
                }
            };
            
            if (itemMenu && itemMenu.length) {
                if (itemMenu.length < 5) {
                    self.frontArray = itemMenu;
                } else {
                    for (var i = 0; i < itemMenu.length; i++) {
                        (i < 4) ? self.frontArray.push(itemMenu[i]) : self.postArray.push(itemMenu[i]);
                    }
                }
            }
            var a = 0;
        },
        template: {element: 'customTableItemMenu'}
    });
    
    ko.components.register('cloud-logo', {
        viewModel: function (params) {
            var self = this;
            self.cloudLogoCss = params.cloudLogoCss || 'logostyle';
            
            self.click = params.click;
            self.productName = ko.unwrap(params.productName);
            self.hiddenCompanyLogo = params.hiddenCompanyLogo || false;
        },
        template: {element: 'cloud-logo-template'}
    });
    
    ko.components.register('form-group', {
        viewModel: function (params) {
            var self = this;
            self.sourceArray = params.sourceArray;
            self.valueProp = params.valueProp;
            self.attr = params.attr || {};
            self.typeahead = params.typeahead;
            self.validateFunc = params.validateFunc;

            self.addData = function(){
                if(isFunction(self.validateFunc) && !self.validateFunc(self.sourceArray)){
                    return;
                }
                self.sourceArray.push(new params.constructor(""));
            };
            
            self.deleteData = function (data){
                self.sourceArray.remove(data);
                if (self.sourceArray().length === 0) {
                    self.sourceArray.push(new params.constructor(""));
                }
            };
        },
        template: {element: 'form-group-template'}
    });
    
    ko.components.register('no-permission', {
        viewModel: function (params) {
            
        },
        template: {element: 'no-permission-template'}
    });
    
    ko.components.register('double-date-timepicker', {
        viewModel: {
            createViewModel: function(params, componentInfo) {
                function DoubleDateTimepicker(params, componentInfo){
                    var self = this;
                    self.startTime = params.startTime;
                    self.endTime = params.endTime;
                    self.startText = params.startText || "";
                    self.endText = params.endText || "";
                    self.futureOnly = params.futureOnly || true;
                    self.maxExpireTime = window.getValidDate(params.maxExpireTime);
                    var placeholder = params.placeholder||"";
                    self.startTimePlaceholder =  placeholder.start ? placeholder.start :placeholder;
                    self.endTimePlaceholder =  placeholder.end ? placeholder.end :placeholder;
                    if(!window.DoubleDateTimeCount){
                        window.DoubleDateTimeCount = 1;
                    }
                    var number = window.DoubleDateTimeCount++;
                    self.startTimeId = "doubleStartTime"+number;
                    self.endTimeId = "doubleEndTime"+number;
                    self.InitSelectDate = function(){
                        if(params.initFunction){
                            params.initFunction();
                        }
                    };
                    var subscriptions = new ko.utils.subtrack(componentInfo);
                    if(ko.isObservable(self.startTime)){
                        subscriptions.push(
                            self.startTime.subscribe(function(date){
                                var minDate = getValidDate(date);
                                if (!isNaN(minDate)) {
                                    $("#"+self.endTimeId).handleDtpicker("setMinDate", minDate);
                                }else{
                                     $("#"+self.endTimeId).handleDtpicker("setMinDate", null);
                                }
                            })
                        );
                    }

                    if(ko.isObservable(self.endTime)){
                        subscriptions.push(
                            self.endTime.subscribe(function(date){
                                var maxDate = getValidDate(date);
                                if (!isNaN(maxDate)) {
                                    $("#"+self.startTimeId).handleDtpicker("setMaxDate", maxDate);
                                }else{
                                    $("#"+self.startTimeId).handleDtpicker("setMaxDate", null);
                                }
                               
                            })
                            );
                    }
                }
                return new DoubleDateTimepicker(params, componentInfo);
            } 
        },
        template: {element: 'tempDoubleDateTimePickerTempalte'}
    });
    
//    ko.components.register('custom-phone-select', {
//        viewModel: function (params) {
//            var self = this;
//            self.isDisable = params.isDisable||false;
//            self.data = params.data || false;
//            self.select,self.hidden = false;
//            self.isShowSelect = params.isShowSelect || ko.observable(true);
//            self.click = params.click ||function(){};
//            if(params.select){
//               self.select = params.select;
//            }else{
//               params.data ?  ko.unwrap(params.data.select) : ko.observable();
//            }
//            if(params.hidden){
//               self.hidden = params.hidden;
//            }else{
//               params.data ?  ko.unwrap(params.data.hidden) : false;
//            }
//            self.showDisable = function () {
//                var isDisable = ko.unwrap(self.isDisable);
//                if (typeof isDisable === "function") {
//                    return isDisable();
//                } else {
//                    return isDisable;
//                }
//            };
//            self.longPressCallback = function(){
//                if (self.hidden) {
//                    self.isShowSelect(!self.isShowSelect());
//                }
//            };
//            self.checkSelect = function(){
//                if(!self.showDisable()){
//                    self.select(!self.select());
//                }
//            };
//            self.checkHidden = function(){
//                self.hidden(!self.hidden());
//            };
//            if (ko.isObservable(self.select)) {
//                self.select.subscribe(function (value) {
//                    if (params.selectCallback) {
//                        params.selectCallback(value);
//                    }
//                });
//            }
//            if (ko.isObservable(self.hidden)) {
//                self.hidden.subscribe(function (value) {
//                    if (params.hiddenCallback) {
//                        params.hiddenCallback(value);
//                    }
//                });
//            }
//            
//            
//        },
//        template: {element: 'customSelectTemplate'}
//    });

    ko.components.register('phone-entry', {
        viewModel: function (params) {
            var self = this;
            self.entryArray = params.entryArray;
            self.currentEntry = params.currentEntry;            
            
            self.currentTypeIcon = ko.unwrap(self.currentEntry).currEntryTypeIcon();
            self.currEntryText = ko.pureComputed(function(){
                var currentEntry = ko.unwrap(self.currentEntry);
                
                if (currentEntry) {
                    return currentEntry.rootEntryLable || currentEntry.text ;
                } else {
                    return "";
                }
                
            });
            self.onEntrySelected = function(entry, event){
                if (params.onEntrySelected) {
                    params.onEntrySelected(entry, event);
                } else if (entry.click) {
                    entry.click(entry, event);
                }
            };
        },
        template: {element: 'phone-entry-template'}
    });    
    
    ko.components.register('desktop-single-menu', {
        viewModel: function(params){
            var self = this;
            OperateMenu.call(self, params);
        },
        template: {element: 'desktop-single-menu-template'}
    });
    
    ko.components.register('phone-single-menu-new', {
        viewModel: function (params) {
            var self = this;
            OperateMenu.call(self, params);
            self.width = ko.observable(100/self.shownNum + "%");

            ko.computed(function(){
                var menusCount = self.shownMenus().length + 1;//plus more menu
                self.width(100/Math.min(self.shownNum, menusCount) + "%")
            });
            
            self.clickEventOnMore = function(){
                RootView.showCommonDialog({
                    root: self
                    ,hideHeader: true
                    ,hideFooter: true
                    ,bodyTemplate: 'more-dialog-body-new'
                    ,dialogCss: 'moreDialogCss'
                    ,modalDialogCss: 'moreDialogModal'
                    ,showInDirection: 'bottom'
                });
            };
        },
        template: {element: 'phone-single-menu-template-new'}
    });
    ko.components.register('phone-single-menu', {
        viewModel: function (params) {
            var self = this;
            var maxOperateNumber = 4;
            
            self.showMore = false;
            self.showInMoreOperate = [];
            self.currentOperateData = params.currentOperateData;
            self.click = function(data){
                data.click(params.currentOperateData);
            };
            var tempMenuArray;
            if(typeof params.menuArray === "function"){
                tempMenuArray = params.menuArray(self.currentOperateData);
            }else{
                tempMenuArray = params.menuArray;
            }
            
            var visibleMenuArray = [];
            for( var i = 0; i < tempMenuArray.length; i++ ) {
                if(isEmpty(tempMenuArray[i].permit)){
                    tempMenuArray[i].permit = true;
                }
                if(isEmpty(tempMenuArray[i].visible) || tempMenuArray[i].visible ){
//                    tempMenuArray[i].click = tempMenuArray[i].click.bind(this, self.currentOperateData);
                    visibleMenuArray.push(tempMenuArray[i]);
                }
                
            }
            var visibleMenuLength = visibleMenuArray.length; 
            
            if( visibleMenuLength <= maxOperateNumber ) {
                self.width = 100/visibleMenuLength + "%";
                self.menuArray = visibleMenuArray;
            } else {
                self.width = 100/maxOperateNumber + "%";
                self.showMore = true;
                self.menuArray = visibleMenuArray.slice(0, maxOperateNumber-1);
                self.showInMoreOperate = visibleMenuArray.slice(maxOperateNumber-1);
            }                                    
            
            if( self.showMore ){
                self.clickEventOnMore = function(){
                    RootView.showCommonDialog({
                        root: self
                        ,hideHeader: true
                        ,hideFooter: true
                        ,bodyTemplate: 'more-dialog-body'
                        ,dialogCss: 'moreDialogCss'
                        ,modalDialogCss: 'moreDialogModal'
                        ,showInDirection: 'bottom'
                    });
                };
            }
        },
        template: {element: 'phone-single-menu-template'}
    });
    
    ko.components.register('custom-input-group', {
        viewModel: function (params) {
            var self = this;
            self.icon = params.icon;
            self.value = params.value;
            self.instantUpdate = isEmpty(params.instantUpdate) ? false : params.instantUpdate;
            self.attr = params.attr;
            
            self.passwordInput = isEmpty(params.passwordInput) ? false : params.passwordInput;
            self.passcapcheck = params.passcapcheck || '';
            self.enterKeyEvent = params.enterKeyEvent || '';
            self.typeaheadData = params.typeaheadData || {};
            
            self.divCss = isEmpty(params.divCss) ? "input-group" : (params.divCss + " input-group");
            self.spanCss = isEmpty(params.spanCss) ? "input-group-addon inputAdd" : (params.spanCss + " input-group-addon inputAdd");
        },
        template: {element: 'custom-input-group-template'}
    });
    
    global.dropdownHeadStyleEnum = {
        onlyText: 1, //例如:快捷导航部分的下拉菜单
        onlyIcon: 2, //例如: 单条数据更多下拉菜单
        blueSmButton: 3, //例如: 我的文件页面,"新建","上传"下拉菜单
        graySmButton: 4, //例如: 部门结构页面,"更多"下拉菜单
        fileTypeDropdown: 5 //例如: 高级搜索,文件类型下拉菜单
    };
    
    function getDropdownHeadClass( dropDownHeadStyle ) {
        var headClassEumObj = {};
        headClassEumObj[dropdownHeadStyleEnum.fileTypeDropdown] = 'filetypedropdown';
        headClassEumObj[dropdownHeadStyleEnum.onlyText] = '';
        headClassEumObj[dropdownHeadStyleEnum.onlyIcon] = 'btn btn-menu';
        headClassEumObj[dropdownHeadStyleEnum.blueSmButton] = 'btn btn-cloudprimary btn-sm';
        headClassEumObj[dropdownHeadStyleEnum.graySmButton] = 'btn btn-clouddefault btn-sm';
        
        return headClassEumObj[dropDownHeadStyle];
    }
    
    
    global.toggleDropdown = function(element, inDialog, keepOpenOnClick ){
        if( RootView.isSmallScreen() ){
            $(element).find(".dropdown-toggle").attr("data-toggle","dropdown");
        }
         
        var dropdownElement = $(element).hasClass("dropdown") ? element : $(element).children(".dropdown")[0];
        if( inDialog ){ 
            if( RootView.isSmallScreen() ){
                var toggleElement = $(element).find(".dropdown-toggle")[0];
                if( !toggleElement ){
                    return;
                }
                toggleElement.addEventListener("tap", function () {
                    var isHidden = !!$(element).find(".dropdown-menu.hidden").length; 
                    var ulElement = $(element).find(".dropdown-menu")[0];
                    if( isHidden ){
                        ulElement.classList.remove("hidden");
                        ulElement.classList.add("fixed-dropdown");
                    }else if($(element).hasClass("dropdown open") || $(element).find(".dropdown.open").length ){
                        window.setTimeout(function () {
                            ulElement.classList.add("hidden");
                            ulElement.classList.remove("fixed-dropdown");
                        },100);
                    }
                });
            }else{
               if( !keepOpenOnClick ){
                    fixedDropdownMenuFunction(dropdownElement, {dialogId: ko.contextFor(element).$root.dialogId});
                }else{
                    fixedDropdownMenuFunction(dropdownElement, {dialogId: ko.contextFor(element).$root.dialogId, disableClose: true});
                } 
            }
        } else {
            if( !keepOpenOnClick ) {
                closeDropDown($(element).children(".dropdown")[0]);
            }
        }
    };
    
    ko.components.register('drop-down', {
        viewModel: {
            createViewModel: function(params, componentInfo) {
                function DropDown(params, componentInfo){
                    var self = this;
                    
                    self.headIcon = params.headIcon || '';
                    self.headClass = getDropdownHeadClass(params.dropDownHeadStyle) || params.headClass;
                    self.headText = ko.isWriteableObservable(params.headText)
                                    ? params.headText 
                                    : ko.observable(ko.unwrap(params.headText));
                    self.headClickEvent = params.headClickEvent;
                    
                    self.menuItems = params.menuItems;
                    self.menuItemClickEvent = params.menuItemClickEvent;
                    self.menuItemTextAttrName = params.menuItemTextAttrName || "text";
                    
                    self.menuWidth = params.menuWidth;
                    
                    if(ko.unwrap(self.menuItems).length === 1 || ko.unwrap(self.menuItems).length > 1 &&  isEmpty(self.headText()) ){
                         self.headText(ko.unwrap(self.menuItems)[0][self.menuItemTextAttrName]);
                    }
                    
                    self.click = function(data, event){
                        if( !unchangeHeadText ){
                            self.headText(data[self.menuItemTextAttrName]);
                        }
                        if(self.menuItemClickEvent){
                            self.menuItemClickEvent(data);
                        }
                        if(data.click){
                            data.click(data);
                        }
                    };
                    
                    var inDialog = !!$(componentInfo.element).parents(".modal-content").length;
                    var keepOpenOnClick = !!params.keepOpenOnClick;
                    var unchangeHeadText = params.unchangeHeadText;
                    toggleDropdown(componentInfo.element, inDialog, keepOpenOnClick);
                }
                return new DropDown(params, componentInfo);
            }
        },
        template: {element: 'drop-down-template'}
    });
   
    ko.components.register('password-strength', {
        viewModel: function (params) {
            var self = this;
            self.em1Css = params.em1Css || "";
            self.em2Css = params.em2Css || "";
            self.em3Css = params.em3Css || "";
        },
        template: {element: 'password-strength-template'}
    });
    
    ko.components.register('multil-level-menu', {
        viewModel: function (params) {
            var self = this;
            self.multiMenu = ko.observableArray(ko.unwrap(params.storeArray));
            self.chooseMenuId = ko.observable("");
            var observable = null;
            if (ko.isObservable(params.storeArray)) {
                var observable = params.storeArray.subscribe(function(value){//observable change
                    if( self.multiMenu().length !== value.length){
                        self.multiMenu(ko.unwrap(params.storeArray));
                    }
                    var arr = value;
                    for(var i = 0; i < arr.length; i++){
                        var data = arr[i];
                        if(self.multiMenu()[i].select() !== arr[i].select()){
                            if(arr[i].select()){
                                self.initSelect();
                            }
                            self.multiMenu()[i].select(arr[i].select());
                        }
                        for(var j = 0; j < data.array.length; j++){
                            var subData = data.array[j];
                            if(subData.select()){
                                self.multiMenu()[i].array[j].select(true);
                                self.multiMenu()[i].select()&&self.multiMenu()[i].select(true);
                                self.chooseMenuId(self.multiMenu()[i].id);
                            }else{
                                self.multiMenu()[i].array[j].select(false);
                            }
                        }
                        if (self.multiMenu()[i].select()) {
                            self.chooseMenuId(self.multiMenu()[i].id);
                        }
                    }
                });
            }
            self.openMenu = function (data) {
                self.chooseMenuId(data.id);
                data.click(data);
                if(data.select()){
                    if(data.selectedFrist){
                        !(self.isSubSelected(data) && data.selectedFrist && !data.array[0].select()) && data.select(false);
                    }else{
                        !self.isSubSelected(data)&& data.select(false);
                    }
                }else{
                    data.select(true);
                }
            };
            self.selectMenu = function (data, parent) {
                if(!data.select()){
                    var array = parent.array;
                    for (var i = 0; i < array.length; i++) {
                        array[i].select(false);
                    }
                    data.select(true);
                }
                data.click(data);
            };
            
            self.getSubMenuClass = function(data){
                switch(data.type){
                    case 0:
                        return "sidebar-sub2menu";
                        break;
                    case 1:
                        return "sidebar-sub3menu";
                        break;
                    case 2:
                        return "sidebar-sub4menu";
                        break;
                }
                return "";
            };
            self.isOpened = function () {
                for (var i = 0; i < self.multiMenu.length; i++) {
                    if (self.multiMenu[i].select()) {
                        return self.multiMenu[i].array.length;
                    }
                }
                return false;
            };
            self.isSubSelected = function( data){
                var array = data.array;
                for (var i = 0; i < array.length; i++) {
                    if(array[i].select()){
                        return true;
                    }
                }
                return false;
            };
            
            self.initSelect = function(){
                var arr =  self.multiMenu;
                for(var i = 0; i < arr.length; i++){
                    arr[i].select(false);
                    for(var j = 0;j < arr[i].array.length; j++){
                       arr[i].array[j].select(false); 
                    }
                }
            };
            self.observableDispose = function(){
                if(observable){
                    observable.dispose();
                }
            };
            
            self.getSubMenusHeight = function(data){
                var arr = data.array;
                var height = 0;
                for (var i = 0; i < arr.length; i++) {
                    height += arr[i].show ? 40 : 0;
                }
                return height+"px";
            };
            
            self.showDropdownMenu = function(data){
                if(data.array){
                    for (var i =0; i< data.array.length; i++ ){
                        if(data.array[i].show){
                            return true;
                        }
                    }
                }
                return false;
            };
        },
        template: {element: 'multi-level-menu-template'}
    });
    
    ko.components.register('phone-label-list', {
        viewModel: {
            createViewModel: function(params, componentInfo) {
                function phoneLabelList(params, componentInfo){
                    var self = this;
                    self.labelList = ko.observableArray(ko.unwrap(params.data));
                    self.ellipsisFun = params.ellipsisFun;
                    self.isShowEllipsis = ko.observable(false);
                    var subscriptions = new ko.utils.subtrack(componentInfo);
                    subscriptions.push (
                        params.data.subscribe(function (data) {
                           self.labelList(ko.unwrap(data));
                        })
                    );
                    self.labeWidth = function(element){
                        var divs = $(element).children();
                        var showWidth = 10; //省略号的宽度
                        var showIndex = -1;
                        for( var i = 0 ; i < divs.length ; i++ ){
                            showWidth += $(divs[i]).width();
                            if( showWidth > $(element).parent().width() ){
                                showIndex = i-1;
                                break;
                            }
                        }
                        if(showIndex !== -1){
                            self.labelList(ko.unwrap(self.labelList).slice(0,showIndex));
                        }
                        self.isShowEllipsis(!!(self.labelList().length < ko.unwrap(params.data).length));
                    };
                }
                return new phoneLabelList(params, componentInfo);
            }
        },
        template: {element: 'phone-label-list-template'}
    });
       
    ko.components.register('input-word-length', {
        viewModel: function (params) {
            var self = this;
            self.textInput = params.textInput || "";
            self.maxLength = params.maxLength || 255;   
            self.isInputMaxLength = (self.textInput.length >= self.maxLength) ? true : false;
        },
        template: '<span class="inputstrlengthspan" data-bind="text: textInput.length+\' / \'+maxLength, css:{error: isInputMaxLength}"></span>'
    });
    
    
    function TabSelect(params, componentInfo){
        var self = this;
        self.value = ko.observable(ko.unwrap(params.value));
        self.tabs = params.tabs;
        self.viewStyle = params.viewStyle || TabSelect.TAB_STYLE;
        
        if (typeof self.tabs === "function" && !ko.isSubscribable(self.tabs)) {
            self.tabs = self.tabs();
        }
        
        if (self.viewStyle === TabSelect.RADIO_STYLE) {
            self.value.subscribe(function(tabValue){
                if (params.onChange) {
                    params.onChange(tabValue);
                }
            });
        } else {
            self.onChange = function(tab){
                self.value(tab.value);

                if (params.onChange) {
                    params.onChange(tab.value);
                } 
            };
        }
    }
    
    TabSelect.TAB_STYLE = "tab";
    TabSelect.RADIO_STYLE = "radio";
    global.TabSelect = TabSelect;
    
    ko.components.register('tab-select', {
        viewModel: {
            createViewModel: function(params, componentInfo) {
                return new TabSelect(params, componentInfo);
            }
        },
        template: {element: 'tab-select-template'}
    });
    
    ko.components.register('refresh-spin', {
        viewModel: {
            createViewModel: function(params, componentInfo) {
                function RefreshSpin(params, componentInfo){
                    var refresh = params.refresh;
                    var finish = params.finish;
                    
                    this.refreshSpin = function(){
                        if (refresh) {
                            refresh();
                        }
                        var $spin = $(componentInfo.element).find(".fa-refresh");

                        $spin.addClass("fa-spin");
                        var cd = window.setInterval(function(){
                            if(finish === undefined || finish()){
                                $spin.removeClass("fa-spin");
                                window.clearInterval(cd);
                            }
                        },1500);
                    };
                }
                return new RefreshSpin(params, componentInfo);
            }
        },
        template: '<a class="refresh spatial" data-bind="click: $data.refreshSpin">'
                +   '<i class="fa fa-refresh"></i>'
                + '</a>'
    });
    ko.components.register('login-input-box', {
        viewModel: function (params) {
            var self = this;
            self.value = params.value;
            self.isPassword = !!params.isPassword;
            self.callback = params.callback || function(){
                return false;
            };
            self.placeholder = params.accountPrompt || l10n("user.PleaseEnterYourAccount");
            self.mainElement = null;
            self.autofocus = params.autofocus;
            self.hiddenPlaceHolder = ko.observable(self.isPassword);
            var newValueSubscribe = null;
            
            if( ko.isObservable(self.value) &&  !self.isPassword){
                newValueSubscribe = self.value.subscribe(function(newValue){
                    var htmlStartIndex = newValue.indexOf("<");
                    var htmlEndIndex = newValue.lastIndexOf(">");
                    if(htmlStartIndex < htmlEndIndex){
                        var string = newValue.substring(htmlStartIndex-1,htmlEndIndex+1-htmlStartIndex);
                       self.value(newValue.replace(string,""));
                    }
                    if(newValue.replace(/[\r\n]/g,"") !== newValue){
                        newValue = newValue.replace(/[\r\n]/g,"");
                        self.value(newValue);
                        var input =  nextInputFocus(self.mainElement);
                        if(input){
                            input.focus();
                            input.select();
                        }
                    }
                    if(newValue.replace(/\ +/g,"") !== newValue){
                        newValue = newValue.replace(/\ +/g,"") ;
                        self.value(newValue);
                    }
                    if(newValue.replace(/\t/g,"") !== newValue){
                        newValue = newValue.replace(/\t/g,"") ;
                        self.value(newValue);
                        var input =  nextInputFocus(self.mainElement);
                        if(input){
                            input.focus();
                            input.select();
                        }
                    }
                    if(newValue&& self.mainElement){
                        $(self.mainElement).find(".inputclear").removeClass("hidden");
                    }else if(self.mainElement){
                         $(self.mainElement).find(".inputclear").addClass("hidden");
                    }
                });
            }
            
            function nextInputFocus(element){
                var parantElem = element.parentNode;
                var mainElem = element;
                var nextInput = null;
                
                 while (!nextInput&& parantElem) {
                    var startFind = false;
                    var childNodes = parantElem.childNodes;
                    for(var i = 0; i < childNodes.length; i++){
                        var currentElem = childNodes[i];
                        if(nextInput){
                            break;
                        }
                        if(currentElem.isEqualNode(mainElem)){
                            startFind = true;
                        }else if(startFind){
                            var inputs = $(currentElem).find("input");
                            if(inputs.length){
                                for(var j = 0; j < inputs.length; j++){
                                    if($(inputs[j]).css("display") !== "none" && !$(inputs[j]).hasClass("hidden")){
                                        nextInput = inputs[j];
                                        break;
                                    }
                                }
                            }
                        }
                    }
                    mainElem = parantElem;
                    parantElem = parantElem.parentNode;
                }
                return nextInput;
            };
            
            self.dispose = function(){
                if(newValueSubscribe){
                    newValueSubscribe.dispose();
                }
                if(!self.isPassword && RootView.isIE){
                    window.removeEventListener("click",focusSubscribe);
                }
            };
            
            self.clear = function(){
                if( ko.isObservable(self.value)){
                    self.value("");
                }else{
                    self.value = "";
                }
            };
            
            function focusSubscribe(){
                var focus = $(self.mainElement).find(".CodeMirror.CodeMirror-focused").length > 0;
                self.hiddenPlaceHolder(focus);
            }
            self.elementInit = function(element){
                self.mainElement = element;
                if(!self.isPassword && RootView.isIE){
                    window.addEventListener("click",focusSubscribe);
                    var cd  = window.setInterval(function(){
                        focusSubscribe();
                        if(self.hiddenPlaceHolder()){
                            window.setInterval(cd);
                        }
                    },300);
                }
                return true;
            };
            
        },
        template: {element: 'login-input-box-template'}
    });
    ko.components.register('watermark', {
        viewModel: {require: 'tmpls/watermark/watermark.js'}
        ,template: {require: 'text!tmpls/watermark/watermark.html'}
    });
    ko.components.register('homepage', {require: 'tmpls/homepage/homepage.js'});
    
    ko.components.register('operate-tip', {
        viewModel: function (params) {
            var self = this;
            self.left = ko.observable(0);
            self.spanLeft = ko.observable(0);
            var element = ko.unwrap( params.element);
            if (typeof (element) === 'string') {
                element = $(element).length ? $(element)[0] : false; 
            }
            if(!element){//throwing error
                return false;
            }
            self.text = ko.observable(ko.unwrap(params.text));
            self.positionModal = {
                top: ko.observable(),
                left: ko.observable()
            };
            var position = getElementFixedPosition(element);
            var marginRight = window.innerWidth - position.leftLength;
            var arrowMargin = 90;

            if (position.leftLength < arrowMargin) {
                self.left(position.leftLength);
                self.spanLeft(arrowMargin - position.leftLength);
            } else if (marginRight < arrowMargin) {
                self.left(arrowMargin + marginRight);
                self.spanLeft(-marginRight);
            }
            self.positionModal.top( position.topLength - $(element).height()/1.5+ "px");
            self.positionModal.left( position.leftLength + 10+"px");
        },
        template: {element: 'operate-tip-template'}
    });
    
    ko.components.register('description-hide', {
        viewModel: function (params) {
            var self = this;
            self.description = params.description;
            self.descriptionElementCallback = function (element) {
                var shortElement = $(element).find(".short");
                var longElement = $(element).find(".long");
                var moreElement = $(element).find(".more");
                var collectElement = $(element).find(".collect");
                var description = longElement.text();

                if (description.length > 80) {
                    shortElement.text(description.slice(0, 80) + "...");
                    shortElement.removeClass("hidden");
                    moreElement.removeClass("hidden");
                    moreElement.on("click", function () {
                        shortElement.addClass("hidden");
                        moreElement.addClass("hidden");
                        longElement.removeClass("hidden");
                        collectElement.removeClass("hidden");
                    });
                    collectElement.on("click",function(){
                        shortElement.removeClass("hidden");
                        moreElement.removeClass("hidden");
                        longElement.addClass("hidden");
                        collectElement.addClass("hidden");
                    });
                } else {
                    longElement.removeClass("hidden");
                }
                ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                    moreElement.off("click");
                    collectElement.off("click");
                });
            };
            
            
        },
        template: {element: 'description-hide-template'}
    });
    
    ko.components.register('radio-select', {
        viewModel: function (params) {
            var self = this;
            self.radioOptions = params.radioOptions;
            self.checkCallback = params.checkCallback;
            self.selectIndex = 0;
            self.radioElement;
            self.subscribe;
            
            function selectRadio (index) {
                window.setTimeout(function(){
                    $(self.radioElement).find("input")[self.selectIndex].removeAttribute("checked");
                    $(self.radioElement).find("input")[index].setAttribute("checked", "checked");
                     self.selectIndex = index;
                }, 100);
                
            };
            
            self.elementCallback = function (element) {
                self.radioElement = element;
                selectRadio(self.selectIndex);
            };
            
            self.radioClick = function (data,index) {
                //模拟radio选中的js相应
                if(isFunction(self.checkCallback) || ko.isObservable(self.checkCallback)){
                   self.checkCallback(data);
                }
                //选中radio
                selectRadio(index);
            };
            
            if(ko.isObservable(self.checkCallback)){//模仿checked Binding
                self.subscribe = self.checkCallback.subscribe(function(newValue){
                    var radios = $(self.radioElement).find("input");
                    for(var i =0; i< radios.length; i++){
                        if(radios[i].getAttribute("value") === newValue && self.selectIndex !== i){
                            selectRadio(i);
                        }
                    }
                });
            }
            
            self.elementDispose = function(){
                if(self.subscribe){
                    self.subscribe.dispose();
                }
            };
            
        },
        template: {element: 'radio-select-template'}
    });
    
    ko.components.register('node-device-information', {
        viewModel: function (params) {
            var self = this;
            self.nodes = ko.observableArray();
           
            self.nodes.push({name: "节点一",cpu: 0.7, memory: 0.2, systemCapacity: 0.4, networkCapacity: 0.16 ,deviceStatus: false});
            self.nodes.push({name: "节点二",cpu: 0.8, memory: 0.1, systemCapacity: 0.5, networkCapacity: 0.17 ,deviceStatus: false});
            
            self.elementCallback = function (element) {
                
            };
            
            self.elementDispose = function(){
                
            };
            
            
            
        },
        template: {element: 'radio-select-template'}
    });
    
})(this, ko);