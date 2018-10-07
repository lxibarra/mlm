/**
 * Created by ricardoibarra on 10/14/14.
 */



ResidualBonus = {

    vars: {
        founded:null, //always return to null when begining a new search
        result: [], //store person name, level, maximum depth and payment
        tmpdepth:0, //temporary value to store the max depth
        tmparray:[]
    },
    config:{
        matrix:[
            { //each setup is a configuration
                setup: [ //each array position represents a level of depth
                    {commission: .00},
                    {commission: .05},
                    {commission: .05},
                    {commission: .05},
                    {commission: .05},
                    {commission: .05},
                    {commission: .05},
                    {commission: .05},
                    {commission: .05},
                    {commission: .05},
                    {commission: .05},
                    {commission: .05},
                    {commission: .05}
                ]
            },
            {
                setup: [ //create additional setups to test different commissions
                    {commission: .00},
                    {commission: .10},
                    {commission: .10},
                    {commission: .10},
                    {commission: .10},
                    {commission: .10},
                    {commission: .10},
                    {commission: .10},
                    {commission: .10},
                    {commission: .10},
                    {commission: .10},
                    {commission: .10},
                    {commission: .10}
                ]
            }
        ]
        ,//default commission setup
        CommisionSetup:0, //indicates which commission setup to use
        rankPayment: [
            {   id: 0, name:"INVALID RANK", depth: 0, requiredPV: 10000000, requiredVG:10000000, Min:100000, equalcheck:0 },
            {   id: 1, name:"REP. MERCADEO", depth: 2, requiredPV: 50, requiredVG:50, Min:1, equalcheck:0  },
            {   id: 2, name:"DISTRIBUIDOR", depth: 3, requiredPV: 50, requiredVG:50, Min:1, equalcheck:0 },
            {   id: 3, name:"BRONCE", depth: 4, requiredPV: 100, requiredVG:2000, Min:3, equalcheck:0 },
            {   id: 4, name:"PLATA", depth: 5, requiredPV: 100, requiredVG:5000, Min:3, equalcheck:0 },
            {   id: 5, name:"ORO", depth: 6, requiredPV: 100, requiredVG:10000, Min:3, equalcheck:.50 },
            {   id: 6, name:"ESMERALDA", depth: 7, requiredPV: 100, requiredVG:25000, Min:4, equalcheck:.60 },
            {   id: 7, name:"RUBY", depth: 8, requiredPV: 100, requiredVG:50000, Min:4, equalcheck:.70 },
            {   id: 8, name:"DIAMANTE", depth: 9, requiredPV: 100, requiredVG:100000, Min:8, equalcheck:.80 },
            {   id: 9, name:"DIAMANTE AZUL", depth: 10, requiredPV: 100, requiredVG:250000, Min:8, equalcheck:.90 },
            {   id: 10, name:"DIAMANTE NEGRO", depth: 10, requiredPV: 100, requiredVG:500000, Min:10, equalcheck:1 },
            {   id: 11, name:"DIAMANTE CORONA", depth: 10, requiredPV: 100, requiredVG:1000000, Min:12, equalcheck:1 },
            {   id: 12, name:"DIAMANTE TRIPLE CORONA", depth: 10, requiredPV: 100, requiredVG:2500000, Min:16, equalcheck:1 }
        ],
        CostPV: 10,
        SellPV: 15.6,
        //maxLegPercentage: .45,
        EnableVGRestriction:true,
        EqualCheckEnabled:true,
        EqualCheckPercentage:.20

    },
    calculate: {
        runReport: function (items) {

            var residual_bonus = {};
            //set rank details
            ResidualBonus.helpers.setRankDetails(items);

            var itemArray = ResidualBonus.helpers.sanitizeTree(
                ResidualBonus.helpers.CreateTreeFromArray(items));

            var total_vp = 0, payable_vg = 0;
            for(var c=0;c<items.length;c++) {

                ResidualBonus.vars.founded = null;
                var current = items[c].id;
                ResidualBonus.helpers.GetNodesById(itemArray, current);
                var vg = 0;

                var depth = 0;

                if(ResidualBonus.vars.founded != null) {
                    depth = 0;
                    vg = ResidualBonus.helpers.GetVGPerNode(ResidualBonus.vars.founded, vg, depth, items[c].rankDepth);

                }

                items[c].payingpv = vg;
                items[c].vg = vg;

                depth = 0;
                if(ResidualBonus.vars.founded != null) {

                    //establece las cantidades por niveles de profundidad en el arreglo temporal
                    ResidualBonus.helpers.getCommissionByLevel(ResidualBonus.vars.founded, depth);
                    items[c].residual = ResidualBonus.helpers.groupPVByLevel(ResidualBonus.vars.tmparray, items[c].rankDepth);
                    ResidualBonus.helpers.CalculateEarnedCommissions(items[c]);
                    ResidualBonus.vars.tmparray = [];

                }

                total_vp += parseInt(items[c].vp);
                console.log(items);
                if(ResidualBonus.config.EqualCheckEnabled) {
                    ResidualBonus.helpers.CalculateEqualBonus(items[c], items, ResidualBonus.config.EqualCheckPercentage, ResidualBonus.config.CostPV);
                    items[c].EqualBonus.FormatedBonus = accounting.formatMoney( items[c].EqualBonus.Bonus);
                }
                else {
                    items[c].EqualBonus = {
                        directs:[],
                        bonus:0,
                        FormatedBonus:'N/A'
                    }
                }

            }



            residual_bonus.members = items;
            residual_bonus.total_vp = total_vp;
            residual_bonus.total_income = residual_bonus.total_vp * ResidualBonus.config.SellPV;
            residual_bonus.total_income_formated = accounting.formatMoney(residual_bonus.total_income);
            //requires prior calculation of GetVGPerNode
            residual_bonus.total_payable_vg = ResidualBonus.helpers.sumPayableVG(items);
            residual_bonus.total_pay_commission = residual_bonus.total_payable_vg * ResidualBonus.config.CostPV;
            residual_bonus.total_pay_commission += ResidualBonus.helpers.sumPayableBonus(items);
            residual_bonus.total_pay_commission_formated =  accounting.formatMoney(residual_bonus.total_pay_commission);

            residual_bonus.CostPV = ResidualBonus.config.CostPV;
            residual_bonus.SellPV = ResidualBonus.config.SellPV;


            return residual_bonus;
        }
    },
    helpers:{
        setRankDetails:function(items) {
            for(var c=0;c<items.length;c++) {
                ResidualBonus.helpers.getRankDetails(items[c]);
                if(items[c].vp >= items[c].rankRequiredPV) {
                    items[c].qualify = "YES";
                }
                else
                {
                    items[c].qualify = "NO";
                }
            }
        },
        getRankDetails:function(item) {
            for(var i=0;i<ResidualBonus.config.rankPayment.length; i++) {
                if(ResidualBonus.config.rankPayment[i].name == item.rank) {
                    item.rankDepth = ResidualBonus.config.rankPayment[i].depth;
                    item.rankRequiredPV = ResidualBonus.config.rankPayment[i].requiredPV;
                    return true;
                }
            }

            item.rankDepth = ResidualBonus.config.rankPayment[0].depth;
            item.rankRequiredPV = ResidualBonus.config.rankPayment[0].requiredPV;

            return false;
        },
        getRankData:function(rankName) {
            var rankData = null;
            for(var i=0;i<ResidualBonus.config.rankPayment.length; i++) {
                if(ResidualBonus.config.rankPayment[i].name == rankName) {
                    rankData = ResidualBonus.config.rankPayment[i];
                }
            }

            return rankData;
        },
        getRankByVG:function(vg) {
            var rankData = null;
            for(var i = ResidualBonus.config.rankPayment.length; i>0; i--) {
                if(vg >= ResidualBonus.config.rankPayment[i-1].requiredVG) {
                    //console.log('Entre: ' + vg + ': ' + ResidualBonus.config.rankPayment[i-1].requiredVG);
                    rankData = ResidualBonus.config.rankPayment[i-1];
                    break;
                }
            }

            return rankData;
        },
        CreateTreeFromArray:function(nodes) {
            var map = {}, node, roots = [];

            //Podria ser que al cambiar el algoritmo de creacion del arbol
            //fallen los calculos globales. De haber bugs regresar aqui a revisar
            /*
            for (var i = 0; i < nodes.length; i += 1) {
                node = nodes[i];
                node.children = [];
                map[node.id] = i; // use map to look-up the parents
                //Cuando el orden del parent y la secuencia de orden no coicide marca error.
                if (node.parent !== null) {
                    nodes[map[node.parent]].children.push(node);
                } else {
                    roots.push(node);
                }
            }

            //return roots;*/
            //===============================================

            /*
            Se implemento el siguiente algoritmo para evitar errores al reordenar el arbol via drag and drop.
            La situacion se da al querer poner un parent de un nodo que aun no existe en el arreglo map.
            por default se entiende que al agregar un nodo al map el parent de este ya existe en map y en el reordenamiento
            */
            for (var i = 0; i < nodes.length; i += 1) {
                node = nodes[i];
                node.children = [];
                map[node.id] = i;
            }

            for (var i = 0; i < nodes.length; i += 1) {
                node = nodes[i];
                if (node.parent !== null) {
                    nodes[map[node.parent]].children.push(node);
                } else {
                    roots.push(node);
                }
            }


            return nodes;


        },
        GetNodesById:function(item, id) {

            //agregar condicion de solo seguir si no se ha encontrado
            if (item.children && ResidualBonus.vars.founded == null) {
                item.children.forEach(function (d) {
                    ResidualBonus.helpers.GetNodesById(d, id);
                });
            }

            if (item.id == id) {
                ResidualBonus.vars.founded = item;
            }

        },
        GetVGPerNode:function(item, vg, depth, maxAllowed) {
            //vg = vg + parseInt(item.vg);
            depth = depth + 1;
            if (item.children) {
                item.children.forEach(function (d) {
                    //vg = vg + parseInt(d.vp);
                    if(depth <= maxAllowed) {
                        vg = vg + parseInt(d.vp);
                        vg = ResidualBonus.helpers.GetVGPerNode(d, vg, depth, maxAllowed);

                    }
                });
            }
            depth = depth - 1;
            return vg;
        },
        getCommissionByLevel:function(item, depth) {
            depth = depth + 1;
            item.children.forEach(function(d) {
                ResidualBonus.helpers.getCommissionByLevel(d, depth);
                    ResidualBonus.vars.tmparray.push({
                            pv: parseInt(d.vp),
                            level: depth
                        });
            });
        },
        groupPVByLevel:function(pvArray, maxDepth) {
            var mappv = [];
            for(var r=1; r <= maxDepth; r++) {
                mappv.push({
                    level:r,
                    pv:0,
                    commission:parseFloat(ResidualBonus.config.matrix[ResidualBonus.config.CommisionSetup].setup[r].commission),
                    amount:0,
                    payable_vg:0
                });
                for(var c = 0; c < pvArray.length; c++) {
                    if(pvArray[c].level == r) {
                        mappv[r-1].pv = mappv[r-1].pv + pvArray[c].pv;
                    }
                }
            }

            return mappv;
        },
        CalculateEarnedCommissions:function(item) {
            commission = 0;
            formatedCommission = "$ 0";
            if(item.qualify == "YES") {

                var MaxLevels = item.residual.length;
                //restricts max payable bonus by vg
                if(ResidualBonus.config.EnableVGRestriction)
                    MaxLevels = ResidualBonus.helpers.setMaxPaymentDepthByVG(item);

                for(var r =0; r<MaxLevels; r++) {
                    item.residual[r].payable_vg = Math.ceil((item.residual[r].pv * item.residual[r].commission));
                    item.residual[r].amount = (parseInt((item.residual[r].pv * item.residual[r].commission)) * ResidualBonus.config.CostPV);
                    commission = commission + item.residual[r].amount;
                    formatedCommission = accounting.formatMoney(commission);
                }
            }

            item.commission = commission;
            item.formatedCommission = formatedCommission;
        },

        CalculateEqualBonus:function(item, collection, percentage, costpv) {
            //CalculateEarnedCommissions must be called first
            //must be directly under and also be sponsored by direct parent
            var children = ResidualBonus.helpers.getDirectOwned(item, collection);
            //la propiedad es commission para obtener lo ganado de cada quien.

            var EqualBonus = {
                directs:children,
                Bonus:0
            };


            for(var c = 0; c<children.length; c++) {

                //asi paga dinero
                //EqualBonus.Bonus += children[c].commission * percentage;
                //obtiene el % de puntos del directo
                EqualBonus.Bonus += children[c].commission  * percentage;
            }

            if(EqualBonus.Bonus > 0) {
                var equalCheckPercentage = ResidualBonus.helpers.getRankData(item.rank).equalcheck;
                EqualBonus.Bonus = EqualBonus.Bonus * equalCheckPercentage;
            }

            item.EqualBonus = EqualBonus;

        },
        sumPayableVG:function(items) {
            var total_payable_vg = 0;
            for(var c=0; c<items.length;c++) {
                if(items[c].qualify == "YES") {
                    for(var r =0; r<items[c].residual.length; r++) {
                        total_payable_vg += items[c].residual[r].payable_vg;
                    }
                }
            }

            return total_payable_vg;
        },
        sumPayableBonus:function(items) {
            var total_payable_bonus = 0;
            for(var c=0; c<items.length;c++) {
                total_payable_bonus += items[c].EqualBonus.Bonus;
            }
            return total_payable_bonus;
        },
        setMaxPaymentDepthByVG:function(item) {
            //logica para el manejo de niveles por rangos y puntos globales unicamente
            var currentRank = ResidualBonus.helpers.getRankData(item.rank);
            //item.vg = parseInt(item.vg);

            if(item.vg >= currentRank.requiredVG)
                return item.rankDepth;
            //si los puntos son menos hay que ver en cual de ellos encaja.

            var FittedRank = ResidualBonus.helpers.getRankByVG(item.vg);

            if(FittedRank == null)
                return 0; //we must make sure at least finds one otherwise is an error and nothign will be payed

            //we always pay the less levels posible;
            var depthToPay = FittedRank.depth<currentRank.depth? FittedRank.depth : currentRank.depth;
            //==================

            return depthToPay;
        },
        getDirectOwned:function(item, items) {
            children = [];
            for(var c=0; c<items.length; c++) {
                if(items[c].sponsor == item.id && items[c].parent == item.id) {
                    children.push(items[c]);
                }
            }
            return children;
        },
        sanitizeTree:function(ArrayItems) {
            if(Utils.isArray(ArrayItems))
                ArrayItems = ArrayItems[0];
            return ArrayItems;
        }, //not in used but is saved for later reference
        setLegPercentage:function(parent, nodeCollection) {
            var direct_leg = [];

            for(var c=0; c< nodeCollection.length; c++) {
                if(nodeCollection[c].parent == parent.id) {
                    //for precautions only
                    if (Utils.isNumber(nodeCollection[c].vg)) {


                        nodeCollection[c].leg = parseInt(nodeCollection[c].vg) + parseInt(nodeCollection[c].vp);

                        var percentage = (nodeCollection[c].leg / parent.vg);

                        nodeCollection[c].percentage = Math.round((nodeCollection[c].leg / parent.vg) * 100);

                        if(percentage > ResidualBonus.config.maxLegPercentage) {
                            payablepvs =  Math.round(parent.vg * ResidualBonus.config.maxLegPercentage);
                            nodeCollection[c].payingpv = payablepvs;
                        }
                    }
                }
            }
        }
    }
}


function CalculaBonoResidual () {

    ResidualBonus.calculate.runReport(MLMTree.vars.options.items);
    $(MLMTree.vars.canvas).orgDiagram(  "update", primitives.common.UpdateMode.Refresh);


}
