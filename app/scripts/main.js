
var ResidualReportData = undefined;
var MentorReportData = undefined;
var FirstLevelReport = undefined;
var rankadvanceData = undefined;
var fastStartBonus = undefined;


$(function() {

    //tests go here

    $('#residualbonusbtn').click(function(e) {
        e.preventDefault();
        ResidualReportData = ResidualBonus.calculate.runReport(MLMTree.vars.options.items);
        var url = $(this).attr('href');
        window.open (url,"Residual Bonus");
    });

    $('#mentorbonusbtn').click(function(e) {
        e.preventDefault();
        MentorReportData = MentorBonus.calculate.runReport(MLMTree.vars.options.items);
        var url = $('#mentorbonusbtn').attr('href');
        window.open(url, "Mentor Bonus");
    });

    $('#firstlevelbtn').click(function(e) {
        e.preventDefault();
        FirstLevelReport = BonoPrimerNivel.calculate.runReport(MLMTree.vars.options.items);
        var url = $('#firstlevelbtn').attr('href');
        window.open(url, "First Level Bonus");
    });

    $('#advancedRankbtn').click(function(e) {
        e.preventDefault();
        rankadvanceData = RankAdvanceBonus.calculate.runReport(MLMTree.vars.options.items);
        var url = $(this).attr('href');
        window.open(url, "Rank advance Bonus");
    });

    $('#Faststartbtn').click(function(e) {
        e.preventDefault();
        fastStartBonus = FastStartBonus.calculate.runReport(MLMTree.vars.options.items);
        var url = $(this).attr('href');
        window.open(url, "Fast start Bonus");
    });

    //param configuration
    $('#paramConfiguration').dialog({
        modal:true,
        autoOpen:false,
        width:"70%",
        buttons:{
            "Apply":function() {
                FormDataBind.BindDataObject($('input', this));
                $( this ).dialog( "close" );
            },
            "Cancel":function() {
                $( this ).dialog( "close" );
            }
        }
    });

    /*IMPORTANT*/
    //setup object to form binder
    //They also have to be binded in VariableDataBind.js in formDataBinder.bind

    $('#conf_residual').click(function(e) {
        e.preventDefault();
        $('#paramConfiguration form').html('');
        FormDataBind.private.createFromSingleton(ResidualBonus.config, '#paramConfiguration form', 'ResidualBonus_config', ['CommisionSetup']);
        FormDataBind.private.createFromArray(ResidualBonus.config.matrix[0].setup, '#paramConfiguration form', "Level Commissions", "ResidualBonus_config_matrix_setup", []);
        FormDataBind.private.createFromArray(ResidualBonus.config.rankPayment, '#paramConfiguration form', "Rank Setup", "ResidualBonus_config_rankPayment", ['name', 'id']);
        $('#paramConfiguration').dialog("open");
    });

    $('#conf_mentor').click(function(e) {
        e.preventDefault();
        $('#paramConfiguration form').html('');
        FormDataBind.private.createFromSingleton(MentorBonus.config, '#paramConfiguration form', 'MentorBonus_config', []);
        FormDataBind.private.createFromArray(MentorBonus.config.qualifyingRanks, '#paramConfiguration form', 'Qualifying Ranks', 'MentorBonus_config_qualifyingRanks', ['id', 'name']);
        $('#paramConfiguration').dialog("open");
    });

    $('#conf_first').click(function(e) {
        e.preventDefault();
        $('#paramConfiguration form').html('');
        FormDataBind.private.createFromSingleton(BonoPrimerNivel.config, '#paramConfiguration form', 'BonoPrimerNivel_config', []);
        FormDataBind.private.createFromArray(BonoPrimerNivel.config.rankPayment, '#paramConfiguration form', 'Ranks', 'BonoPrimerNivel_config_rankPayment', ['id', 'name']);
        FormDataBind.private.createFromArray(BonoPrimerNivel.config.MoneyMonthBonus, '#paramConfiguration form', 'Bonus Cash', 'BonoPrimerNivel_config_MoneyMonthBonus', []);
        FormDataBind.private.createFromArray(BonoPrimerNivel.config.PvMonthBonus, '#paramConfiguration form', 'Bonus PVs', 'BonoPrimerNivel_config_PvMonthBonus', []);


        $('#paramConfiguration').dialog("open");
    });

    $('#conf_upgrade').click(function(e) {
        e.preventDefault();
        $('#paramConfiguration form').html('');
        FormDataBind.private.createFromSingleton(RankAdvanceBonus.config, '#paramConfiguration form', 'RankAdvanceBonus_config', []);
        FormDataBind.private.createFromArray(RankAdvanceBonus.config.Ranks, '#paramConfiguration form', 'Ranks', 'RankAdvanceBonus_config_Ranks', ['id', 'name']);
        $('#paramConfiguration').dialog("open");
    });

    $('#conf_fast').click(function(e) {
        e.preventDefault();
        $('#paramConfiguration form').html('');
        FormDataBind.private.createFromSingleton(FastStartBonus.config, '#paramConfiguration form', 'FastStartBonus_config', []);
        FormDataBind.private.createFromArray(FastStartBonus.config.Ranks, '#paramConfiguration form', 'Ranks', 'FastStartBonus_config_Ranks', ['id', 'name']);
        $('#paramConfiguration').dialog("open");
    });

    //remove after finishing development.
    //ImportStaticJson();

});

//remove after finish testing development features
/*function ImportStaticJson() {
    nodeArray = JSON.parse('[{"id":"100","parent":null,"title":null,"description":null,"image":null,"context":null,"itemTitleColor":"#0000ff","groupTitle":null,"groupTitleColor":"#4169e1","isVisible":true,"hasSelectorCheckbox":0,"hasButtons":0,"itemType":0,"adviserPlacementType":0,"childrenPlacementType":0,"templateName":null,"showCallout":0,"calloutTemplateName":null,"label":null,"showLabel":0,"labelSize":null,"labelOrientation":3,"labelPlacement":0,"sponsor":"","name":"JoseGomez","code":"RV411B1W","rank":"ESMERALDA","photo":"http://res.cloudinary.com/www-habitossaludables-com-mx/image/upload/c_thumb,e_saturation:50,g_face,h_150,w_130/v1/public-profiles/tp5qyzdn65hrmpxlscgv.jpg","personactive":true,"newrank":false,"vp":"1000","vg":"0","slot1":"images/blank.png","slot2":"images/blank.png","slot3":"images/blank.png","edit":"true","isFormValid":true},{"id":"200","parent":"100","title":null,"description":null,"image":null,"context":null,"itemTitleColor":"#ffa500","groupTitle":null,"groupTitleColor":"#4169e1","isVisible":true,"hasSelectorCheckbox":0,"hasButtons":0,"itemType":0,"adviserPlacementType":0,"childrenPlacementType":0,"templateName":null,"showCallout":0,"calloutTemplateName":null,"label":null,"showLabel":0,"labelSize":null,"labelOrientation":3,"labelPlacement":0,"sponsor":"100","name":"NataliaGarcia","code":"UPrwAH9e","rank":"ORO","photo":"http://res.cloudinary.com/www-habitossaludables-com-mx/image/upload/c_thumb,e_saturation:50,g_face,h_150,w_130/v1/public-profiles/g2kay99cu5oqurwunxto.jpg","personactive":true,"newrank":false,"vp":"1000","vg":"0","slot1":"images/blank.png","slot2":"images/blank.png","slot3":"images/blank.png","edit":"true","isFormValid":true}]');
    MLMTree.vars.options.items = nodeArray;
    $(MLMTree.vars.canvas).orgDiagram(MLMTree.vars.options);
    $(MLMTree.vars.canvas).orgDiagram("update", primitives.common.UpdateMode.Refresh);
}*/
