/**
 * Created by ricardoibarra on 9/30/14.
 */

//requires utilities.js
//to get the information about the commissions simply reference Commissions.vars.items

Commissions = {
    vars: {
        container:'#commissionHolder',
        items: [],
        itemHolder:'.form-group',
        idPrefix: 'ptr',
        templateList: '../templates/commission-row.html'
    },
    AddEmpty:function() {
        this.wrapper.newCommisionSlot('');
    },
    Update:function(obj) {
        this.private.development.updateArrayValue(obj);
    },
    Remove:function(obj) {
            Commissions.private.visual.FadeOut(obj,
                function() {
                    Commissions.private.development.FillItems(obj)
                }
            );
    },
    private: {
        visual:{
            FadeOut:function(obj, callback) {
                $(obj).closest(Commissions.vars.itemHolder).slideUp(500, function() {
                    Utils.Execute(callback);
                });
            }

        },
        development: {
            loadTemplate: function (data) {
                $(Commissions.vars.container).loadTemplate(
                    Commissions.vars.templateList,
                    data,
                    {
                        append: true,
                        overwriteCache: false
                    });
            },
            FillItems:function(obj) {
                position = $(obj).closest(Commissions.vars.itemHolder).index();
                Commissions.vars.items.splice(position, 1);
                $(Commissions.vars.container).html('');
                for(var c=0;c<Commissions.vars.items.length;c++) {
                    Commissions.vars.items[c].number = c;
                    Commissions.vars.items[c].elementid = Commissions.vars.idPrefix + c;
                    Commissions.private.development.loadTemplate(Commissions.vars.items[c]);
                }
            },
            updateArrayValue:function(obj) {
                position = $(obj).closest(Commissions.vars.itemHolder).index();
                Commissions.vars.items[position].percentage = $(obj).val();
            },
            helpers:{
                EmptyTemplateData:function(arr) {
                    return {
                        elementid:Commissions.vars.idPrefix + arr.length,
                        percentage:'',
                        number:arr.length
                    }
                }
            }
        }
    },
    wrapper: {
        newCommisionSlot:function(val) {

            data = Commissions.private.development.helpers.EmptyTemplateData(Commissions.vars.items);
            Commissions.vars.items.push(data);
            Commissions.private.development.loadTemplate(data);
        }
    }
}