
/* Form and stringname allows databinding*/
var formDataBinder = {
    bind:[
        //include here javascript variable object and stringname to allow binding
        //residual params
        { _object:ResidualBonus.config, group:'ResidualBonus_config', isArray:false },
        { _object:ResidualBonus.config.matrix[0].setup, group:'ResidualBonus_config_matrix_setup', isArray:true },
        { _object:ResidualBonus.config.rankPayment, group:'ResidualBonus_config_rankPayment', isArray:true },

        //mentor params
        { _object:MentorBonus.config, group:'MentorBonus_config', isArray:false },
        { _object:MentorBonus.config.qualifyingRanks, group:'MentorBonus_config_qualifyingRanks', isArray:true },
        //First Level
        { _object:BonoPrimerNivel.config, group:'BonoPrimerNivel_config', isArray:false },
        { _object:BonoPrimerNivel.config.rankPayment, group:'BonoPrimerNivel_config_rankPayment', isArray:true },
        { _object:BonoPrimerNivel.config.MoneyMonthBonus, group:'BonoPrimerNivel_config_MoneyMonthBonus', isArray:true },
        { _object:BonoPrimerNivel.config.PvMonthBonus, group:'BonoPrimerNivel_config_PvMonthBonus', isArray:true },
        //RankUpgrade
        { _object:RankAdvanceBonus.config, group:'RankAdvanceBonus_config', isArray:false },
        { _object:RankAdvanceBonus.config.Ranks, group:'RankAdvanceBonus_config_Ranks', isArray:true },
        //Fast Start
        { _object:FastStartBonus.config, group:'FastStartBonus_config', isArray:false },
        { _object:FastStartBonus.config.Ranks, group:'FastStartBonus_config_Ranks', isArray:true },
        { _object:FastStartBonus.config.MoneyMonthBonus, group:'FastStartBonus_config_MoneyMonthBonus', isArray:true },
        { _object:FastStartBonus.config.PvMonthBonus, group:'FastStartBonus_config_PvMonthBonus', isArray:true }
    ]
};


FormDataBind = {
    BindDataObject:function(elements) {
        $(elements).each(function(index, input) {
            var group = $(input).attr('data-data');
            var type = $(input).attr('data-value');
            var name = $(input).attr('name');
            if(type == "singleton") { //working for singleton
                var obj = FormDataBind.SearchByGroup(group);
                obj._object[name] = FormDataBind.private.setCorrectDataType($(input).val());
            }
            if(type == "array") {
                var obj = FormDataBind.SearchByGroup(group);
                var row = $(input).attr('data-row');
                obj._object[row][name] = FormDataBind.private.setCorrectDataType($(input).val());
            }
        });
    },
    SearchByObject:function(obj) {
        var result = null;
        formDataBinder.bind.forEach(function(item, index, array) {
            if (item._object == obj) {
                result = item;
            }
        });

        return result;
    },
    SearchByGroup:function(groupname) {
        var result = null;
        formDataBinder.bind.forEach(function(item, index, array) {
            if (item.group == groupname) {
                result = item;
            }
        });
        return result;
    },
    private: {
        createFromArray:function(namevar, webcontrolID, groupTitle, groupvar, readOnlyFields) {
            //considering namevar is an array
            var holder = $('<div class="form-group" />');
            holder.append('<label>' + groupTitle + '</label>');
            var table = $('<table class="table" />');
            var num = 0;
            namevar.forEach(function(element, index, array) {
                var props = Object.getOwnPropertyNames(element);
                //console.log(props);
                var tr = $('<tr />');
                var tdn = $('<td />');
                tdn.append(num);
                tr.append(tdn);
                for(var f=0; f<props.length; f++) {
                    var td = $('<td />');
                    td.append('<label>' + props[f] + ': </label>');
                    if(FormDataBind.private.IsReadOnly(props[f], readOnlyFields))
                        td.append('<input type="text" disabled="disabled" name="' + props[f] + '" data-row="' + num +'" data-value="array" data-data="' + groupvar + '" value="'+ element[props[f]] + '">');
                    else
                        td.append('<input type="text" name="' + props[f] + '" data-row="' + num +'" data-value="array" data-data="' + groupvar + '" value="'+ element[props[f]] + '">');
                    tr.append(td);
                }
                num++;

                table.append(tr);
            });
            holder.append(table);
            $(webcontrolID).append(holder);

        },
        createFromSingleton:function(namevar, webcontrolID, groupvar, readOnlyFields) {
            var props = Object.getOwnPropertyNames(namevar);

            for(var c=0; c< props.length; c++) {
                if(!Utils.isArray(namevar[props[c]])) {
                    var div = $('<div class="form-group" />');
                    div.append('<label for="' + props[c] + '">' + props[c] + '</label>');
                    if(FormDataBind.private.IsReadOnly(props[c], readOnlyFields))
                        div.append('<input type="input" disabled="disabled" name="' + props[c] + '" data-value="singleton"  data-data="' + groupvar + '" class="form-control input-sm" value="' + namevar[props[c]] + '">');
                    else
                        div.append('<input type="input" name="' + props[c] + '" data-value="singleton"  data-data="' + groupvar + '" class="form-control input-sm" value="' + namevar[props[c]] + '">');
                    $(webcontrolID).append(div.html());
                }
            }
        },
        IsReadOnly:function(field, collection) {
            var found = false;
            for(var c=0; c<collection.length; c++) {
                if(field == collection[c]) {
                    found = true;
                }
            }
            return found;
        },
        setCorrectDataType:function(stringVal) {
            //tries to verify data type and convert it
            var float = new RegExp(/^\d+\.?\d+$/);
            var integer = new RegExp(/^\d+$/);
            var stringArray = new RegExp(/(?:'[^']*')|(?:[^, ]+)/g);


            if(float.test(stringVal))
                return parseFloat(stringVal);

            if(integer.test(stringVal))
                return parseInt(stringVal);

            if(stringVal == 'true')
                return true;
            if(stringVal == 'false')
                return false;

            if(stringArray.test(stringVal)) {
                var items = stringVal.split(",");
                for(var c=0; c< items.length; c++) {
                    if(float.test(items[c]))
                        items[c] = parseFloat(items[c]);
                    else if(integer.test(items[c])) {
                        items[c] = parseInt(items[c]);
                    }
                }

                return items;
            }



            return stringVal;

        }
    }
}