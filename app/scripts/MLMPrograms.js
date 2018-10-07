

MLMPrograms = {
    vars: {

        dropdown:"rank",
        plans:undefined //used for cached
    },
    init:function() {
        MLMPrograms.FillPlanDDL();
    },
    FillPlanDDL:function() {
        MLMPrograms.private.development.getPlanList(function(data) {
            MLMPrograms.private.visual.FillDropDown(MLMPrograms.vars.dropdown, data);
        }, false);
    },
    private: {
        visual:{
            FillDropDown:function(htmlobject, data) {

                obj = $("select[name=" + htmlobject + "]");
                obj.html('');
                //console.log(data);
                /*$.each(data.plans, function(i, item) {
                    //$(htmlobject).append('<option value="' + item.name + '">' + item.name + '</option>');
                    obj.append('<option value="' + item.name + '">' + item.name + '</option>');

                });*/
                for(var c=0; c<data.length; c++) {
                    obj.append('<option value="' + data[c].name + '">' + data[c].name + '</option>');
                }
            }
        },
        development:{
            getPlanList:function(callback, invalidateCache) {
                if (MLMPrograms.vars.plans == undefined || invalidateCache == true) {

                    return Utils.Execute(callback(HSMX.plans));
                    /*$.getJSON(MLMPrograms.vars.datasource, undefined, function (data) {
                        return Utils.Execute(callback(data));
                    });*/
                }
                else {
                    console.log('From memory');
                    return Utils.Execute(callback(MLMPrograms.vars.plans));
                }
            },
            getPlanByName:function(name) {
                //this method is not working for some reason.
                //parece que necesita un callback como segundo ardumento
                var found;
                MLMPrograms.private.development.getPlanList(function(data) {


                   /*$.each(data, function(i, item) {
                        //console.log(item.plan.name + '=' + name);
                        if(item.plan.name === name) {

                            found = item;
                        }
                    });*/

                    for(var c=0;c<data.length; c++) {
                        //console.log(data[c].plan.name);
                        if(data[c].plan.name === name) {
                            console.log('Lo encontre')
                            found = data[c].plan;
                        }
                    }

                }, false);


            }
        }
    }
}

$(function() {
    MLMPrograms.init();
});
