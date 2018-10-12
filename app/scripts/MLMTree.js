/**
 * Created by ricardoibarra on 10/1/14.
 */

//depends on primitives.min.js

var MLMTree = {
        vars: {
            options: undefined,
            form:'#nodeForm',
            editForm:'#nodeModalForm',
            addBtn: '#btnAdd',
            clrBtn: '#btnClear',
            btnQuickAdd:'#btnQuickAdd',
            canvas: '#basicdiagram',
            orgFit:'#orgFit',
            //image upload presets to cloudinary
            iconImage:"images/user.jpg",
            thumbImg: '.personPhoto',
            Clickupload:'.newImage',
            ClickDImage:'.defaultImage',
            uploadImg:".uploadControl",
            cloud_name: "www-habitossaludables-com-mx",
            preset:'wjckss4q',
            progressControl:'.imageProgress',
            uploadingGif: '../images/loading.gif',
            imageInput: '[name=photo]',
            //end image upload
            downloadbtn:"#exportbtn",
            jsonFileName:"mlmsnetwork.txt",
            importbtn: '#importbtn',
            importctrl:'treeimport', //required without # for upload function that does not use jquery
            editNode:'#NodeEdit',
            tmpid:null,
            tmpindex:null
        },
        init:function() {
            $(this.vars.addBtn).click(function(e) {
                e.preventDefault();
                result = MLMTree.AddNode(MLMTree.private.development.getForm(MLMTree.vars.form));
                if(result) {
                    MLMTree.private.development.clearForm();
                    MLMTree.private.development.ClearFormImages();
                }
            });

            $(MLMTree.vars.orgFit).click(function(e) {
                MLMTree.private.visual.FitToPage($(this).prop('checked'));
            });

            $(MLMTree.vars.btnQuickAdd).click(function(e) {
                e.preventDefault();
                $(MLMTree.vars.addBtn).click();
            });

            $(this.vars.clrBtn).click(function(e) {
                e.preventDefault();
                MLMTree.private.development.clearForm();
                MLMTree.private.development.ClearFormImages();
            });

            $(this.vars.downloadbtn).click(function(e) {
                e.preventDefault();
                MLMTree.private.development.download(MLMTree.vars.jsonFileName);
            });

            $(this.vars.importbtn).click(function(e) {
                e.preventDefault();
                $('#'+MLMTree.vars.importctrl).click();
            });

            $('#'+this.vars.importctrl).change(function() {
                MLMTree.private.development.import.GetFile(MLMTree.vars.importctrl);
            });

            $(MLMTree.vars.editNode).dialog({
                modal:true,
                autoOpen:false,
                buttons:{
                    "Save":function() {
                        if(MLMTree.private.development.saveNodeChanges()) {
                            MLMTree.private.development.clearForm();
                            MLMTree.private.development.ClearFormImages();
                            $(this).dialog("close");

                        }
                    },
                    "Cancel":function() {
                        MLMTree.private.development.ClearFormImages();
                        $( this ).dialog( "close" );
                    }
                }
            });

            //init clodinary object click
            $(MLMTree.vars.Clickupload).click(function(e) {
                e.preventDefault();
                $(MLMTree.vars.uploadImg + ' input').click();
            });

            $(MLMTree.vars.ClickDImage).click(function(e) {
                e.preventDefault();
                MLMTree.private.development.ClearFormImages();
            });

            $(MLMTree.vars.uploadImg).append($.cloudinary.unsigned_upload_tag(MLMTree.vars.preset,
                {cloud_name: MLMTree.vars.cloud_name })
                .bind('cloudinarystart', MLMTree.private.development.helpers.ImageUploadStart)
                .bind('cloudinarydone', MLMTree.private.development.helpers.ImageUploadComplete)
                .bind('cloudinaryprogress', MLMTree.private.development.helpers.ImageUploadProgress));

            //required buttons
            var buttons = [];
            buttons.push(new primitives.orgdiagram.ButtonConfig("UnParentNode", "ui-icon-eject", "Unparent"));
            buttons.push(new primitives.orgdiagram.ButtonConfig("RemoveNode", "ui-icon-close", "Delete"));
            buttons.push(new primitives.orgdiagram.ButtonConfig("updateNodeModal", "ui-icon-pencil", "Edit"));
            buttons.push(new primitives.orgdiagram.ButtonConfig("AddSubNode", "ui-icon-person", "Add under"));

            MLMTree.vars.options = new primitives.orgdiagram.Config();

            //test line may require delete
            //jQuery(MLMTree.vars.canvas).bpConnector(CreateLine());
            //jQuery(MLMTree.vars.canvas).bpConnector(CreateLine());


            MLMTree.vars.options.items = [];
            MLMTree.vars.options.cursorItem = 0;

            //not working
            //MLMTree.vars.options.buttonsSize =new primitives.common.Size(32, 32);
            MLMTree.vars.options.buttons = buttons;
            MLMTree.vars.options.hasButtons = primitives.common.Enabled.Auto;
            MLMTree.vars.options.hasSelectorCheckbox = primitives.common.Enabled.True;

            //init annotations array
            MLMTree.vars.options.annotations = [];

            //El template es necesario para la inicializacion de eventos onItemRender
            MLMTree.vars.options.templates = [MLMTree.private.development.getNodeTemplate()];
            MLMTree.vars.options.defaultTemplateName = "contactTemplate";
            MLMTree.vars.options.onItemRender =  MLMTree.private.development.onItemRender;
            //Se dispara on user click
            MLMTree.vars.options.onCursorChanged = MLMTree.private.development.onCursorChanged;

            MLMTree.vars.options.onButtonClick = MLMTree.private.development.helpers.SetNodeButtonAction;

            MLMTree.vars.options.hasSelectorCheckbox = primitives.common.Enabled.False


            MLMTree.vars.options.enablePanning = false;

            $(MLMTree.vars.canvas).orgDiagram(MLMTree.vars.options);

            $(MLMTree.vars.canvas).droppable({
                greedy: true,
                drop: function (event, ui) {
                   //implement drop cancelation if necessary here
                }
            });
        },
        AddNode:function(data) {
            return MLMTree.private.development.addNode(data);
        },
        private: {
            visual: {
                FitToPage:function(option) {
                    MLMTree.vars.options.pageFitMode = option == true? 1 : 0;
                    $(MLMTree.vars.canvas).orgDiagram(MLMTree.vars.options);
                    $(MLMTree.vars.canvas).orgDiagram("update", primitives.common.UpdateMode.Refresh);
                }
            },
            development: {
                download:function(FileName) {
                    var blob = new Blob([MLMTree.private.development.getJsonData()], {type: "text/plain;charset=utf-8"});
                    saveAs(blob, FileName);
                },
                getJsonData:function() {
                  return JSON.stringify(MLMTree.vars.options.items);
                },
                import: {
                    GetFile:function(ctrl) {
                       Utils.GetFile.ReadText(ctrl,
                           MLMTree.private.development.import.private.updateProgress,
                           MLMTree.private.development.import.private.loaded,
                           MLMTree.private.development.import.private.errorHandler
                       );
                    },
                    private: {
                        updateProgress:function(evt) {
                            if (evt.lengthComputable) {
                                // evt.loaded and evt.total are ProgressEvent properties
                                var loaded = (evt.loaded / evt.total);
                                if (loaded < 1) {
                                    // sample code Increase the prog bar length
                                    // style.width = (loaded * 200) + "px";
                                }
                            }
                        },
                        loaded:function(evt) {
                            var fileString = evt.target.result;
                            if (Utils.isValidJSON(fileString)) {
                                nodeArray = JSON.parse(fileString);
                                MLMTree.vars.options.items = nodeArray;
                                $(MLMTree.vars.canvas).orgDiagram(MLMTree.vars.options);
                                $(MLMTree.vars.canvas).orgDiagram("update", primitives.common.UpdateMode.Refresh);
                            }
                            else {
                                console.log('invalid json');
                            }
                        },
                        errorHandler:function(evt) {
                            if(evt.target.error.name == "NotReadableError") {
                                // The file could not be read
                            }
                        }
                    }
                },
                getForm:function(frm) {
                    return $(frm).serializeObject();
                },
                clearForm:function() {
                    $('input', MLMTree.vars.form).val('');

                },
                ClearFormImages:function() {
                    $('img',  MLMTree.vars.form).attr('src',MLMTree.vars.iconImage);
                    $(MLMTree.vars.imageInput).val(MLMTree.vars.iconImage);

                    $('img',  MLMTree.vars.editForm).attr('src',MLMTree.vars.iconImage);
                    $(MLMTree.vars.imageInput).val(MLMTree.vars.iconImage);
                },
                generateNode:function(data) {

                 return new primitives.orgdiagram.ItemConfig(
                      {
                          id: data.id,
                          parent: data.parent,
                          sponsor:data.sponsor,
                          name: data.name,
                          joineddate:data.joineddate,
                          code: data.id,
                          rank: data.rank,
                          photo: data.photo,
                          personactive:data.personactive,
                          itemTitleColor: data.personactive == true? primitives.common.Colors.Blue : primitives.common.Colors.Gray,
                          newrank:data.newrank,
                          vp:data.vp,
                          vg:data.vg,
                          slot1:'images/blank.png',
                          slot2:'images/blank.png',
                          slot3:'images/blank.png'
                      });
                },
                addNode:function(data) {
                    data = MLMTree.private.development.helpers.sanitize.validate(data);
                    if (data.isFormValid) {
                        MLMTree.vars.options.items.push(
                            MLMTree.private.development.generateNode(data)
                        );

                        $(MLMTree.vars.canvas).orgDiagram(MLMTree.vars.options);
                        $(MLMTree.vars.canvas).orgDiagram("update", primitives.common.UpdateMode.Refresh);
                        return true;
                    }

                    return false;
                },
                onItemRender:function(event, data) {

                    switch (data.renderingMode) {
                        case primitives.common.RenderingMode.Create:
                            data.element.draggable({
                                revert: "invalid",
                                containment: "document",
                                appendTo: "body",
                                helper: "clone",
                                cursor: "move",
                                "zIndex": 10000,
                                delay: 300,
                                distance: 10,
                                start: function (event, ui) {
                                    MLMTree.vars.fromValue = MLMTree.private.development.helpers.FindIndexById(jQuery(this).attr("data-value"));
                                }
                            });
                            data.element.droppable({
                                /* this option is supposed to suppress event propagation from nested droppable to its parent
                                 *  but it does not work
                                 */
                                greedy: true,
                                drop: function (event, ui) {
                                    if (!event.cancelBubble) {
                                        toValue = jQuery(this).attr("data-value");
                                        MLMTree.private.development.ReparentNode(MLMTree.vars.fromValue, toValue);
                                        primitives.common.stopPropagation(event);

                                    } else {
                                        console.log("Drop ignored!");
                                    }
                                },
                                over: function (event, ui) {
                                    toValue = parseInt(jQuery(this).attr("data-value"), 10);
                                    jQuery(MLMTree.vars.canvas).orgDiagram({ "highlightItem": toValue });
                                    jQuery(MLMTree.vars.canvas).orgDiagram("update", primitives.common.UpdateMode.PositonHighlight);
                                },
                                accept: function (draggable) {
                                    return (jQuery(this).css("visibility") == "visible");
                                }
                            });
                            /* Initialize widgets here */
                            break;
                        case primitives.common.RenderingMode.Update:
                            /* Update widgets here */
                            break;
                    }

                    var itemConfig = data.context;

                    /* Set item id as custom data attribute here */
                    data.element.attr("data-value", itemConfig.id);

                    MLMTree.private.development.helpers.RenderField(data, itemConfig);
                },
                getNodeTemplate:function() {
                    var result = new primitives.orgdiagram.TemplateConfig();
                    result.name = "contactTemplate";

                    result.itemSize = new primitives.common.Size(140, 180);
                    result.minimizedItemSize = new primitives.common.Size(4, 4);
                    result.highlightPadding = new primitives.common.Thickness(2, 2, 2, 2);


                    var itemTemplate = jQuery(`
                        <div class="bp-item bp-corner-all bt-item-frame">
                          <div name="titleBackground" class="bp-item bp-corner-all bp-title-frame" style="top: 2px; left: 2px; width: 136px; height: 20px;">
                            <div name="name" class="bp-item bp-title" style="top: 3px; left: 6px; width: 128px; height: 18px;"></div>
                            <img name="slot3" style="height:16px; width:16px; position:absolute; right:0; top:0" src="images/blank.png"/>
                          </div>
                        <div class="bp-item bp-photo-frame" style="text-align: center; padding-top: 0px; top: 26px; left: 2px; width: 50px; height: 200px;">
                          <img name="photo" style="height:60px; width:50px;" />
                          <img name="slot1" style="height:50px; width:50px;" src="images/blank.png"/>
                          <img name="slot2" style="height:50px; width:50px;" src="images/blank.png"  />
                        </div>
                        <div class="bp-item" style="top: 26px; left: 56px; width: 82px; height: 140px; font-size: 10px;">
                        <span name="rank"></span>
                        <br/>
                        <div><strong>Code: </strong><span name="id"></span></div>
                            <div>Leg: <span name="leg"></span></div>
                            <div>Represents: <span name="percentage"></span>%</div>
                            <div>VP: <span name="vp"></span></div>
                            <div>VG: <span name="vg"></span></div>
                            <div style=" display: block; width:100%; height:2px; text-align: center">
                            <div style="width:90%; height:1px; margin:0 auto; display:block; border-top:solid 1px #ccc;"></div>
                        </div>
                        <div><strong style="color:darkgreen">Pays: </strong><i name="rankDepth">n/a</i> Levels </div>
                        <div><strong>Req. PV's: </strong> <span name="rankRequiredPV"></span></div>
                        <div>Qualifies: <span name="qualify"></span></div>
                        <!--div>Paying-PV: <span name="payingpv"></span></div-->
                        <div>Won: <span name="formatedCommission"></span></div>
                        </div>
                        </div>
                    `).css({
                            width: `${result.itemSize.width}px`,
                            height: `${result.itemSize.height}px`
                        }).addClass("bp-item bp-corner-all bt-item-frame");

                    result.itemTemplate = itemTemplate.wrap('<div>').parent().html();

                    return result;
                },
                ReparentNode:function(value, toParent) {
                    item = MLMTree.vars.options.items[value];
                    var fromItems = jQuery(MLMTree.vars.canvas).orgDiagram("option", "items");
                    var toItems = jQuery(MLMTree.vars.canvas).orgDiagram("option", "items");
                    if (toParent != null) {
                            var toParentItem = MLMTree.vars.options.items[MLMTree.private.development.helpers.FindIndexById(toParent)];
                            if (!MLMTree.private.development.helpers.isParentOf(item, toParentItem)) {

                                var children = MLMTree.private.development.helpers.getChildrenForParent(item);
                                children.push(item);
                                for (var index = 0; index < children.length; index++) {
                                    var child = children[index];
                                    fromItems.splice(primitives.common.indexOf(fromItems, child), 1);
                                    toItems.push(child);
                                }
                                item.parent = toParent;
                            } else {
                                console.log("Droped to own child!");
                            }
                    } else {
                            var children = getChildrenForParent(item);
                            children.push(item);
                            for (var index = 0; index < children.length; index++) {
                                var child = children[index];
                                fromItems.splice(primitives.common.indexOf(fromItems, child), 1);
                                toItems.push(child);
                            }
                            item.parent = null;
                    }

                    jQuery(MLMTree.vars.canvas).orgDiagram("update", primitives.common.UpdateMode.Refresh);

                },
                UnParentNode:function(e, data) {

                    item = MLMTree.vars.options.items[MLMTree.private.development.helpers.FindIndexById(data.context.id)];
                    item.parent = null;
                    jQuery(MLMTree.vars.canvas).orgDiagram("update", primitives.common.UpdateMode.Refresh);
                },
                AddSubNode:function(e, data) {
                    person = MLMTree.private.development.getForm(MLMTree.vars.form);
                    person.parent = data.context.id;
                    MLMTree.AddNode(person);
                },
                RemoveNode:function(e, data) {
                    //compression option must be taken into account
                    //currently this method
                    removedItem = MLMTree.private.development.helpers.FindNodeById(data.context.id);
                    children = MLMTree.private.development.helpers.getChildrenForParent(removedItem);

                    for(var indx=0;indx<children.length; indx++) {
                        children[indx].parent = data.context.parent;
                    }
                    MLMTree.vars.options.items.splice(MLMTree.private.development.helpers.FindIndexById(data.context.id), 1);
                    jQuery(MLMTree.vars.canvas).orgDiagram("update", primitives.common.UpdateMode.Refresh);
                },
                updateNodeModal:function(e, data) {
                    //set id and index (primary key) in memory.
                    MLMTree.vars.tmpid = data.context.id;
                    MLMTree.vars.tmpindex = MLMTree.private.development.helpers.FindIndexById(data.context.id);

                    MLMTree.private.development.helpers.AutoFillForm(MLMTree.vars.editNode, data.context);
                    $(MLMTree.vars.editNode).dialog("open");
                },
                saveNodeChanges:function() {

                    newValues = MLMTree.private.development.getForm(MLMTree.vars.editForm);
                    //console.log(newValues);
                    newValues = MLMTree.private.development.helpers.sanitize.validate(newValues);


                    if(newValues.isFormValid) {
                        //get index of position to change
                        index = MLMTree.vars.tmpindex;
                        //MLMTree.private.development.helpers.FindIndexById(MLMTree.vars.tmpid);

                        for (var p in newValues) {
                            if (newValues.hasOwnProperty(p)) {
                                MLMTree.vars.options.items[index][p] = newValues[p];
                            }
                        }

                        if (MLMTree.vars.options.items[index]['id'] != MLMTree.vars.tmpid) {
                            MLMTree.private.development.helpers.switchNodeParent(MLMTree.vars.tmpid, MLMTree.vars.options.items[index]['id']);
                        }

                        /*MLMTree.private.development.clearForm();
                         MLMTree.private.development.ClearFormImages();*/

                        $(MLMTree.vars.canvas).orgDiagram(MLMTree.vars.options.items);
                        jQuery(MLMTree.vars.canvas).orgDiagram("update", primitives.common.UpdateMode.Refresh);

                        return true;
                    }

                    return false;

                },
                onCursorChanged:function(e, data) {
                    var pos = MLMTree.private.development.helpers.FindIndexById(data.context.id);
                    for(var i=0;i<MLMTree.vars.options.items.length; i++) {
                            if (MLMTree.vars.options.items[i]['sponsor'] == data.context.id) {
                                MLMTree.vars.options.items[i].itemTitleColor = primitives.common.Colors.Green;
                                //draw line has problems with too many
                                //MLMTree.vars.options.annotations.push(MLMTree.private.development.helpers.CreateNodeConnector(data.context.id, MLMTree.vars.options.items[i].id));
                            }
                        else
                            {
                                if(MLMTree.vars.options.items[i].personactive)
                                    MLMTree.vars.options.items[i].itemTitleColor = primitives.common.Colors.Blue;
                                else
                                    MLMTree.vars.options.items[i].itemTitleColor = primitives.common.Colors.Gray;
                            }
                    }
                    //selected node title changes color
                    MLMTree.vars.options.items[pos].itemTitleColor= primitives.common.Colors.Orange;
                    jQuery(MLMTree.vars.canvas).orgDiagram("update", primitives.common.UpdateMode.Refresh);

                },
                helpers: {

                    sanitize: {
                        validate:function(data) {

                            //console.log(data);
                            //shared validation or sanitize goes here.
                            if(data.hasOwnProperty('personactive') == false) {
                                data.personactive = false;
                            }
                            else {
                                data.personactive = true;
                            }

                            if(data.hasOwnProperty('newrank') == false) {
                                data.newrank = false;
                            }
                            else
                            {
                                data.newrank = true;
                            }
                            /*else {
                                if(data.newrank == "true")
                                    data.newrank = true;
                                if(data.newrank == "false")
                                    data.newrank = false;
                            }*/

                            //if an invalid date is provided we get the current date
                            if(typeof Utils.makeDateFromISO(data.joineddate) === 'undefined') {
                                var tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
                                data.joineddate = (new Date(Date.now() - tzoffset)).toISOString().slice(0,-1);
                                data.joineddate = data.joineddate.substr(0, 10);
                            }

                            if(Utils.isNumber(data.vp) == false) {
                                data.vp = 0;
                            }

                            if(Utils.isNumber(data.vg) == false) {
                                data.vg = 0;
                            }


                            if(data.hasOwnProperty('edit'))
                                return MLMTree.private.development.helpers.sanitize.updateNode(data);
                            return MLMTree.private.development.helpers.sanitize.newNode(data);
                        },
                        newNode:function(data) {
                            data.isFormValid = true;

                            if(data.id.toString() == '') {
                                data.id = Utils.randomString();
                            }
                            if(data.parent.toString() == '' || data.parent == undefined) {
                                data.parent = null;
                            }
                            if(data.name.toString() == '' || data.name == undefined) {
                                data.name = JsonPeople[(Math.floor(Math.random() * (100 - 1)) + 1)].name;
                            }

                            if(MLMTree.private.development.helpers.FindIndexById(data.id) > -1) {
                                Utils.ShowMessage('Error', 'Person code is already assigned to another user, please change and try again', 'error');
                                data.isFormValid = false;
                            }

                            if (data.parent == data.id) {
                                Utils.ShowMessage('Error', 'Person can not be under it self', 'error');
                                data.isFormValid = false;
                            }

                            if (data.sponsor == data.id) {
                                Utils.ShowMessage('Error', 'Person can not be its own sponsor', 'error');
                                data.isFormValid = false;
                            }


                            return data;
                        },
                        updateNode:function(data) {
                            data.isFormValid = true;

                            if(data.id.toString() == '') {
                                Utils.ShowMessage('Error', 'Person code cannot be empty. Please assign a valid code', 'error');
                                data.isFormValid = false;
                            }

                            if(data.name.toString() == '') {
                                Utils.ShowMessage('Error', 'Person Name is invalid please enter a valid name.', 'error');
                                data.isFormValid = false;
                            }

                            if(data.parent.toString() != '') {
                                if (MLMTree.private.development.helpers.nodeExists('id', data.parent) == false) {
                                    Utils.ShowMessage('Error', 'Reference person code (parent position) does not exist. Try an existing parent person code. ', 'error')
                                    data.isFormValid = false;
                                }

                                if(data.parent == data.id) {
                                    Utils.ShowMessage('Error', 'Person cannot be under it self. ', 'error')
                                    data.isFormValid = false;
                                }

                            }
                            else {
                                data.parent = null;
                            }

                            if(data.sponsor.toString() != '') {
                                if (MLMTree.private.development.helpers.FindIndexById(data.sponsor) < 0) {
                                    Utils.ShowMessage('Error', 'Sponsor code does not exist. Leave empty or input a valid sponsor code', 'error');
                                    data.isFormValid = false;
                                }

                                if(data.sponsor == data.id) {
                                    Utils.ShowMessage('Error', 'Person cannot be its own sponsor', 'error');
                                    data.isFormValid = false;
                                }
                            }



                            if(MLMTree.vars.tmpid != data.id) {
                                index = MLMTree.private.development.helpers.FindIndexById(MLMTree.vars.tmpid);
                                index_repeated = MLMTree.private.development.helpers.FindIndexById(data.id);
                                if(index_repeated >= 0) {
                                    if (index != index_repeated) {
                                        Utils.ShowMessage('Error', 'Entered person code already belongs to another person. Code has to be unique', 'error');
                                        data.isFormValid = false;
                                    }
                                }
                            }

                            return data;
                        }
                    },
                    AutoFillForm:function(container, data) {
                        for (var p in data) {
                            if (data.hasOwnProperty(p)) {
                                if($(container + ' [name=' + p +']').is(':input')) {
                                    $(container + ' [name=' + p + ']').val(data[p]);
                                }
                                if($(container + ' [name=' + p +']').is(':checkbox')) {
                                    $(container + ' [name=' + p +']').prop('checked', data[p]);
                                }
                            }
                        }
                        //thumbnail has to be hardcoded because is not a standard input
                        $(MLMTree.vars.thumbImg).attr('src', data['photo'].toString());
                    },
                    RenderField:function(data, itemConfig) {
                        if (data.templateName == "contactTemplate") {
                            data.element.find("[name=photo]").attr({ "src": itemConfig.photo, "alt": itemConfig.name });
                            data.element.find("[name=titleBackground]").css({ "background": itemConfig.itemTitleColor });

                            if(itemConfig.hasOwnProperty("slot1")) {
                                data.element.find("[name=slot1]").attr({ "src": itemConfig.slot1, "alt": itemConfig.name });
                            }

                            if(itemConfig.hasOwnProperty("slot2")) {
                                data.element.find("[name=slot2]").attr({ "src": itemConfig.slot2, "alt": itemConfig.name });
                            }

                            if(itemConfig.hasOwnProperty("slot3")) {
                                data.element.find("[name=slot3]").attr({ "src": itemConfig.slot3, "alt": itemConfig.name });
                            }

                            var fields = [
                                "name",
                                "rank",
                                "sponsor",
                                "parent",
                                "photo",
                                "id",
                                "joineddate",
                                "vp",
                                "vg",
                                "leg",
                                "percentage",
                                "rankDepth",
                                "rankRequiredPV",
                                "qualify",
                                "formatedCommission",
                                "payingpv",
                                "newrank"
                            ];
                            for (var index = 0; index < fields.length; index++) {
                                var field = fields[index];

                                var element = data.element.find("[name=" + field + "]");
                                if (element.text() != itemConfig[field]) {
                                    element.text(itemConfig[field]);
                                }
                            }
                        }
                    },
                    isParentOf:function(parentItem, childItem) {
                        var result = false;

                        if (parentItem.id == childItem.id) {
                            result = true;
                        } else {
                            while (childItem.parent != null) {
                                childItem = MLMTree.vars.options.items[MLMTree.private.development.helpers.FindIndexById(childItem.parent)];
                                if (childItem.id == parentItem.id) {
                                    result = true;
                                    break;
                                }
                            }
                        }
                        return result;
                    },
                    getChildrenForParent:function(parentItem) { //needed for drag and drop
                        var children = {};
                        for (var id in MLMTree.vars.options.items) {
                            var item = MLMTree.vars.options.items[id];
                            if (children[MLMTree.private.development.helpers.FindIndexById(item.parent)] == null) {
                                children[MLMTree.private.development.helpers.FindIndexById(item.parent)] = [];
                            }
                            children[MLMTree.private.development.helpers.FindIndexById(item.parent)].push(id);
                        }
                        var newChildren = children[MLMTree.private.development.helpers.FindIndexById(parentItem.id)];
                        var result = [];
                        if (newChildren != null) {
                            while (newChildren.length > 0) {
                                var tempChildren = [];
                                for (var index = 0; index < newChildren.length; index++) {
                                    var item = MLMTree.vars.options.items[newChildren[index]];
                                    result.push(item);
                                    if (children[MLMTree.private.development.helpers.FindIndexById(item.id)] != null) {
                                        tempChildren = tempChildren.concat(children[MLMTree.private.development.helpers.FindIndexById(item.id)]);
                                    }
                                }
                                newChildren = tempChildren;
                            }
                        }
                        return result;
                    },
                    switchNodeParent:function(oldParent, newParent) {
                        changed = 0;
                        for (var i=0; i< MLMTree.vars.options.items.length; i++) {
                            if (MLMTree.vars.options.items[i].parent == oldParent) {
                                MLMTree.vars.options.items[i].parent = newParent;
                                changed++;
                            }
                        }
                        return changed;
                    },
                    FindIndexById:function (id) {
                        for(var i = 0; i < MLMTree.vars.options.items.length; i += 1) {
                            if(MLMTree.vars.options.items[i]['id'] == id) {
                                return i;
                            }
                        }
                        return -1;
                    },
                    FindNodeById:function(id) {
                        for(var i = 0; i < MLMTree.vars.options.items.length; i += 1) {
                            if(MLMTree.vars.options.items[i]['id'] == id) {
                                return MLMTree.vars.options.items[i];
                            }
                        }
                        return null;
                    },
                    nodeExists:function(field, value) {
                        for(var i =0; i < MLMTree.vars.options.items.length; i++) {
                            if (MLMTree.vars.options.items[i][field] == value) {
                                return true;
                            }
                        }

                        return false;
                    },
                    SetNodeButtonAction:function(e, data) {
                        Utils.ExecFunctionByName('MLMTree.private.development.' + data.name, window, e, data);
                    },
                    CreateNodeConnector:function(from, to) {
                        return new primitives.orgdiagram.ConnectorAnnotationConfig({
                            fromItem: from,
                            toItem: to,
                            label: "1",
                            labelSize: new primitives.common.Size(80, 30),
                            connectorShapeType: primitives.common.ConnectorShapeType.OneWay,
                            color: primitives.common.Colors.Green,
                            offset: 0,
                            lineWidth: 2,
                            lineType: primitives.common.LineType.Dashed,
                            selectItems: false
                        });
                    },
                    ImageUploadStart:function(e, data) {
                        $(MLMTree.vars.progressControl).html('0%');
                        $(MLMTree.vars.thumbImg).attr('src', MLMTree.vars.uploadingGif);
                    },
                    ImageUploadComplete:function(e, data) {
                        url = $.cloudinary.url(data.result.public_id, {
                            format: 'jpg', width: 130, height: 150, cloud_name: MLMTree.vars.cloud_name,
                            crop: 'thumb', gravity: 'face', effect: 'saturation:50'
                        });
                        $(MLMTree.vars.imageInput).val(url);
                        $(MLMTree.vars.thumbImg).attr('src', url);

                        $(MLMTree.vars.progressControl).html('done');
                        setTimeout(function() {
                            $(MLMTree.vars.progressControl).html('');
                        }, 2000);

                    },
                    ImageUploadProgress:function(e, data) {
                        $(MLMTree.vars.progressControl).html(Math.round((data.loaded * 100.0) / data.total) + '%');
                    },
                    JSONReplacer:function(key, value){
                        console.log(key + " " + value);
                    }
                }
            }
        }
}

$(function() {
    MLMTree.init();
});
