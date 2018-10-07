var orgdiagram = null;
var orgdiagram2 = null;

var counter = 0;
var m_timer = null;
var fromValue = null;
var fromChart = null;
var toValue = null;
var toChart = null;
var items = {};

jQuery(document).ready(function () {
    jQuery.ajaxSetup({
        cache: false
    });

    jQuery('#contentpanel').layout(
        {
            center__paneSelector: "#centerpanel"
            , west__size: 200
            , west__paneSelector: "#westpanel"
            , west__resizable: true
            , center__onresize: function () {
            if (orgdiagram != null) {
                ResizePlaceholder();
                jQuery("#orgdiagram").orgDiagram("update", primitives.common.UpdateMode.Refresh);
                //jQuery("#orgdiagram2").orgDiagram("update", primitives.common.UpdateMode.Refresh);
            }
        }
        });

    ResizePlaceholder();
    orgdiagram = SetupWidget(jQuery("#orgdiagram"), "orgdiagram");

});

function SetupWidget(element, name) {
    var result;
    var options = new primitives.orgdiagram.Config();
    var itemsToAdd = [];
    for (var index = 1; index <= 3; index++) {
        id = counter++;
        var newItem = new primitives.orgdiagram.ItemConfig({
            id: id,
            parent: null,
            title: "Title " + id,
            description: "Adviser Description",
            image: "fa fa-user"
        });
        itemsToAdd.push(newItem);
        items[newItem.id] = newItem;

        if (options.cursorItem == null) {
            options.cursorItem = newItem.id;
        }

        for (var index2 = 1; index2 <= 3; index2++) {
            id2 = counter++;
            var newSubItem = new primitives.orgdiagram.ItemConfig({
                id: id2,
                parent: newItem.id,
                title: "Title " + id2,
                description: "Assistant Description",
                image: "fa fa-user"
            });
            itemsToAdd.push(newSubItem);
            items[newSubItem.id] = newSubItem;
        }
    }

    options.items = itemsToAdd;
    options.normalLevelShift = 20;
    options.dotLevelShift = 10;
    options.lineLevelShift = 10;
    options.normalItemsInterval = 20;
    options.dotItemsInterval = 10;
    options.lineItemsInterval = 5;
    options.buttonsPanelSize = 48;

    options.pageFitMode = primitives.common.PageFitMode.Auto;
    options.graphicsType = primitives.common.GraphicsType.Auto;
    options.hasSelectorCheckbox = primitives.common.Enabled.True;
    options.hasButtons = primitives.common.Enabled.True;
    options.templates = [getContactTemplate()];
    options.defaultTemplateName = "contactTemplate";
    options.onItemRender = (name == "orgdiagram") ? onOrgDiagramTemplateRender : onOrgDiagram2TemplateRender;
    options.selectCheckBoxLabel = 'Pinned';

    /* chart uses mouse drag to pan items, disable it in order to avoid conflict with drag & drop */
    options.enablePanning = false;

    result = element.orgDiagram(options);

    element.droppable({
        greedy: true,
        drop: function (event, ui) {
            /* Check drop event cancelation flag
             * This fixes following issues:
             * 1. The same event can be received again by updated chart
             * so you changed hierarchy, updated chart and at the same drop position absolutly
             * irrelevant item receives again drop event, so in order to avoid this use primitives.common.stopPropagation
             * 2. This particlular example has nested drop zones, in order to
             * suppress drop event processing by nested droppable and its parent we have to set "greedy" to false,
             * but it does not work.
             * In this example items can be droped to other items (except immidiate children in order to avoid looping)
             * and to any free space in order to make them rooted.
             * So we need to cancel drop  event in order to avoid double reparenting operation.
             */
            if (!event.cancelBubble) {
                toValue = null;
                toChart = name;

                Reparent(fromChart, fromValue, toChart, toValue);

                primitives.common.stopPropagation(event);
            }
        }
    });

    return result;
}

function getContactTemplate() {
    var result = new primitives.orgdiagram.TemplateConfig();
    result.name = "contactTemplate";

    result.itemSize = new primitives.common.Size(140, 100);
    result.minimizedItemSize = new primitives.common.Size(4, 4);
    result.highlightPadding = new primitives.common.Thickness(2, 2, 2, 2);


    var itemTemplate = jQuery(
        '<div class="bp-item bp-corner-all bt-item-frame">'
        + '<div name="titleBackground" class="bp-item bp-corner-all bp-title-frame" style="top: 2px; left: 2px; width: 136px; height: 20px;">'
        + '<div name="title" class="bp-item bp-title" style="top: 3px; left: 6px; width: 128px; height: 18px;">'
        + '</div>'
        + '</div>'
        + '<div class="bp-item bp-photo-frame" style="text-align: center; padding-top: 4px; top: 26px; left: 2px; width: 50px; height: 50px;">'
        //+ '<img name="photo" style="height:60px; width:50px;" />'
        + '<i class="fa fa-user" style="font-size: 46px;"></i>'
        + '</div>'
        + '<div name="description" class="bp-item" style="top: 26px; left: 56px; width: 82px; height: 52px; font-size: 10px;"></div>'
        + '</div>'
    ).css({
            width: result.itemSize.width + "px",
            height: result.itemSize.height + "px"
        }).addClass("bp-item bp-corner-all bt-item-frame");
    result.itemTemplate = itemTemplate.wrap('<div>').parent().html();

    return result;
}

function onOrgDiagramTemplateRender(event, data) {
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
                    fromValue = parseInt(jQuery(this).attr("data-value"), 10);
                    fromChart = "orgdiagram";
                }
            });
            data.element.droppable({
                /* this option is supposed to suppress event propogation from nested droppable to its parent
                 *  but it does not work
                 */
                greedy: true,
                drop: function (event, ui) {
                    if (!event.cancelBubble) {
                        console.log("Drop accepted!");
                        toValue = parseInt(jQuery(this).attr("data-value"), 10);
                        toChart = "orgdiagram";

                        Reparent(fromChart, fromValue, toChart, toValue);

                        primitives.common.stopPropagation(event);
                    } else {
                        console.log("Drop ignored!");
                    }
                },
                over: function (event, ui) {
                    toValue = parseInt(jQuery(this).attr("data-value"), 10);
                    toChart = "orgdiagram";

                    /* this is needed in order to update highlighted item in chart,
                     * so this creates consistent mouse over feed back
                     */
                    jQuery("#orgdiagram").orgDiagram({ "highlightItem": toValue });
                    jQuery("#orgdiagram").orgDiagram("update", primitives.common.UpdateMode.PositonHighlight);
                },
                accept: function (draggable) {
                    /* be carefull with this event it is called for every available droppable including invisible items on every drag start event.
                     * don't varify parent child relationship between draggable & droppable here it is too expensive.
                     */
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

    RenderField(data, itemConfig);
}



function Reparent(fromChart, value, toChart, toParent) {
    /* following verification needed in order to avoid conflict with jQuery Layout widget */
    if (fromChart != null && value != null && toChart != null) {
        console.log("Reparent fromChart:" + fromChart + ", value:" + value + ", toChart:" + toChart + ", toParent:" + toParent);
        var item = items[value];
        var fromItems = jQuery("#" + fromChart).orgDiagram("option", "items");
        var toItems = jQuery("#" + toChart).orgDiagram("option", "items");
        if (toParent != null) {
            var toParentItem = items[toParent];
            if (!isParentOf(item, toParentItem)) {

                var children = getChildrenForParent(item);
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
        jQuery("#orgdiagram").orgDiagram("update", primitives.common.UpdateMode.Refresh);
    }
}


function getChildrenForParent(parentItem) {
    var children = {};
    for (var id in items) {
        var item = items[id];
        if (children[item.parent] == null) {
            children[item.parent] = [];
        }
        children[item.parent].push(id);
    }
    var newChildren = children[parentItem.id];
    var result = [];
    if (newChildren != null) {
        while (newChildren.length > 0) {
            var tempChildren = [];
            for (var index = 0; index < newChildren.length; index++) {
                var item = items[newChildren[index]];
                result.push(item);
                if (children[item.id] != null) {
                    tempChildren = tempChildren.concat(children[item.id]);
                }
            }
            newChildren = tempChildren;
        }
    }
    return result;
}

function isParentOf(parentItem, childItem) {
    var result = false,
        index,
        len,
        itemConfig;
    if (parentItem.id == childItem.id) {
        result = true;
    } else {
        while (childItem.parent != null) {
            childItem = items[childItem.parent];
            if (childItem.id == parentItem.id) {
                result = true;
                break;
            }
        }
    }
    return result;
};

function RenderField(data, itemConfig) {
    if (data.templateName == "contactTemplate") {
        data.element.find("[name=photo]").attr({ "src": itemConfig.image, "alt": itemConfig.title });
        data.element.find("[name=titleBackground]").css({ "background": itemConfig.itemTitleColor });

        var fields = ["title", "description", "phone", "email"];
        for (var index = 0; index < fields.length; index++) {
            var field = fields[index];

            var element = data.element.find("[name=" + field + "]");
            if (element.text() != itemConfig[field]) {
                element.text(itemConfig[field]);
            }
        }
    }
}

function ResizePlaceholder() {
    var panel = jQuery("#centerpanel");
    var panelSize = new primitives.common.Rect(0, 0, panel.innerWidth(), panel.innerHeight());
    var position = new primitives.common.Rect(0, 0, panelSize.width / 1, panelSize.height);
    position.offset(-2);

    jQuery("#orgdiagram").css(position.getCSS());
}

/*tests*/

var callme = new primitives.orgdiagram.ItemConfig({
    id: Math.random(),
    parent: null,
    title: "Title " + Math.random(),
    description: "Newly Generated",
    image: "fa fa-user"
});