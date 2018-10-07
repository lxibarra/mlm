//depends on residual bonus class to avoid code duplication

RankAdvanceBonus = {
    vars: {
        founded:null
    },
    config: {
        Ranks:[
            {   id: 0, name:"INVALID RANK", requiredPV: 10000000,  gainedwith:0, sponsoredactive:0, paysMoney:0, grantPV:0  },
            {   id: 1, name:"REP. MERCADEO", requiredPV: 50, gainedwith:0, sponsoredactive:0, paysMoney:0, grantPV:0  },
            {   id: 2, name:"DISTRIBUIDOR", requiredPV: 50, gainedwith:0, sponsoredactive:0, paysMoney:0, grantPV:0  },
            {   id: 3, name:"BRONCE", requiredPV: 100, gainedwith:2000, sponsoredactive:4, paysMoney:2000, grantPV:100  },
            {   id: 4, name:"PLATA", requiredPV: 100, gainedwith:5000, sponsoredactive:6, paysMoney:5000, grantPV:100  },
            {   id: 5, name:"ORO", requiredPV: 100, gainedwith:10000, sponsoredactive:8, paysMoney:10000, grantPV:100  },
            {   id: 6, name:"ESMERALDA", requiredPV: 100, gainedwith:25000, sponsoredactive:10, paysMoney:25000, grantPV:100  },
            {   id: 7, name:"RUBY", requiredPV: 100, gainedwith:50000, sponsoredactive:12, paysMoney:50000, grantPV:100  },
            {   id: 8, name:"DIAMANTE", requiredPV: 100, gainedwith:100000, sponsoredactive:12, paysMoney:100000, grantPV:100  },
            {   id: 9, name:"DIAMANTE AZUL", requiredPV: 100, gainedwith:250000, sponsoredactive:14, paysMoney:250000, grantPV:100  },
            {   id: 10, name:"DIAMANTE NEGRO", requiredPV: 100, gainedwith:500000, sponsoredactive:16, paysMoney:500000, grantPV:100  },
            {   id: 11, name:"DIAMANTE CORONA", requiredPV: 100, gainedwith:1000000, sponsoredactive:18, paysMoney:1000000, grantPV:100  },
            {   id: 12, name:"DIAMANTE TRIPLE CORONA", requiredPV: 100, gainedwith:2500000, sponsoredactive:20, paysMoney:2500000, grantPV:100  }
        ],
        costPV:10,
        SellPV:15.6,
        maxLegPercentage: .45,
        requiredLegs:3
    },
    calculate:{
        runReport:function(items) {

            //reuses residual bonus calculations
            ResidualBonus.calculate.runReport(items);

            RankAdvanceBonus.helpers.AddPVForRankPurchase(items);

            for(var c=0; c< items.length; c++) {
                RankAdvanceBonus.helpers.setLegPercentage(items[c], items);
            }

            //se establece la cantidad de patrocinados activos
            RankAdvanceBonus.helpers.setQualifyingSponsored(items);
            //solamente los que tienen 3 piernas pueden calificar para este bono
            RankAdvanceBonus.helpers.setAdvanceRankVG(items);
            //Establecer rangos ganados
            RankAdvanceBonus.helpers.setWinnedRanks(items);
            //obtener el total a pagar a cada uno de los que traspasaron el rango
            RankAdvanceBonus.helpers.setWinnedMoney(items);


            //

            advanceRank_data = {};
            advanceRank_data.GlobalVP = RankAdvanceBonus.helpers.setGlobalVP(items);
            advanceRank_data.GlobalIncome = advanceRank_data.GlobalVP * RankAdvanceBonus.config.SellPV;
            advanceRank_data.GlobalIncome_formated = accounting.formatMoney(advanceRank_data.GlobalIncome);
            advanceRank_data.total_pay_commission = RankAdvanceBonus.helpers.getWinnedCommission(items);
            advanceRank_data.total_pay_commission_formated = accounting.formatMoney(advanceRank_data.total_pay_commission);
            advanceRank_data.members = RankAdvanceBonus.helpers.getQualifyingMembers(items);
            advanceRank_data.SellPV = RankAdvanceBonus.config.SellPV;
            advanceRank_data.CostPV = RankAdvanceBonus.config.costPV;
            advanceRank_data.requiredLegs = RankAdvanceBonus.config.requiredLegs;
            advanceRank_data.maxLegPercentage = (RankAdvanceBonus.config.maxLegPercentage * 100);


            return advanceRank_data;

        }
    },
    helpers: {
        //revisar este metodo
        AddPVForRankPurchase:function(items) {
            for(var c=0; c < items.length; c++) {
                items[c].RankPV = 0;
                if(items[c].newrank) {
                    for (var i = 0; i < RankAdvanceBonus.config.Ranks.length; i++) {
                        if (items[c].rank == RankAdvanceBonus.config.Ranks[i].name) {
                            items[c].RankPV = RankAdvanceBonus.config.Ranks[i].grantPV;
                        }
                    }
                }
            }
        },
        getQualifyingMembers:function(items) {
            var members = [];
            for(var c=0; c < items.length; c++) {
                if(items[c].hasOwnProperty('winnedRanks')) {
                    if (items[c].winnedRanks.length > 0) {
                        members.push(items[c]);
                    }
                }
            }
            return members;
        },
        getWinnedCommission:function(items) {
            var sumoney = 0;
            for(var c=0; c < items.length; c++) {
                if(items[c].hasOwnProperty('winnedRanks')) {
                    if (items[c].winnedRanks.length > 0) {
                        for (var i = 0; i < items[c].winnedRanks.length; i++) {
                            sumoney += items[c].winnedRanks[i].paysMoney;
                        }
                    }
                }
            }
            return sumoney;
        },
        setWinnedMoney:function(items) {
            //requires prior execution of setWinnedRanks
            for(var c=0; c < items.length; c++) {
                var sumoney = 0;
                if(items[c].hasOwnProperty('winnedRanks')) {
                    if (items[c].winnedRanks.length > 0) {
                        for (var i = 0; i < items[c].winnedRanks.length; i++) {
                            sumoney += items[c].winnedRanks[i].paysMoney;
                        }
                    }
                    items[c].RankAdvancedBonus = sumoney;
                }
            }
        },
        setWinnedRanks:function(items) {
            //requires prior execution of setAdvanceRankVG and setQualifyingSponsored
            for(var c=0; c < items.length; c++) {
                if(items[c].RankAdvanceVG > 0) {
                    items[c].winnedRanks = [];
                    for (var i = 0; i<RankAdvanceBonus.config.Ranks.length; i++) {
                        if (RankAdvanceBonus.config.Ranks[i].gainedwith > 0) {
                            if(items[c].RankAdvanceVG > RankAdvanceBonus.config.Ranks[i].gainedwith && items[c].sponsored.length >= RankAdvanceBonus.config.Ranks[i].sponsoredactive) {
                                items[c].winnedRanks.push(RankAdvanceBonus.config.Ranks[i]);
                                items[c].slot3 = 'images/upgrade.png';
                            }
                        }
                    }
                }
            }
        },
        setQualifyingSponsored:function(items) {
            for(var c=0; c < items.length; c++) {
                items[c].sponsored = [];
                for(var i=0; i < items.length; i++) {
                    if(items[i].sponsor == items[c].id) {
                        if(items[i].qualify == "YES")
                            items[c].sponsored.push(items[i]);
                    }
                }
            }
        },
        setAdvanceRankVG:function(items) {
            for(var c=0; c < items.length; c++) {
                items[c].RankAdvanceVG = 0;
                if(items[c].children.length >= RankAdvanceBonus.config.requiredLegs) {
                    for(var i = 0; i<items[c].children.length; i++) {
                        items[c].RankAdvanceVG += items[c].children[i].RankAdvance;
                    }
                }
            }
        },
        setLegPercentage:function(parent, nodeCollection) {
            var direct_leg = [];

            for(var c=0; c< nodeCollection.length; c++) {
                if(nodeCollection[c].parent == parent.id) {
                    //for precautions only
                    if (Utils.isNumber(nodeCollection[c].vg)) {

                        //sumar los vp de obtener el rango cuando es nuevo
                        nodeCollection[c].leg = parseInt(nodeCollection[c].vg) + parseInt(nodeCollection[c].vp) + parseInt(nodeCollection[c].RankPV);

                        var percentage = (nodeCollection[c].leg / parent.vg);

                        nodeCollection[c].percentage = Math.round((nodeCollection[c].leg / parent.vg) * 100);
                        if(isNaN(nodeCollection[c].percentage)) {
                            nodeCollection[c].percentage = 0;
                        }
                        //rank advance son los puntos maximos que se tomaran en cuenta para
                        //ver si brinca de rango.

                        if(percentage > ResidualBonus.config.maxLegPercentage) {
                            rankAdvance =  Math.round(parent.vg * ResidualBonus.config.maxLegPercentage);
                            nodeCollection[c].RankAdvance = rankAdvance;
                        }
                        else //el rank advance debe ser para el padre no para el current pero se deben sumar
                        {    //se debe asumir que el rankadvace siempre es informacion para el padre directo
                            //los vg normal
                            nodeCollection[c].RankAdvance = nodeCollection[c].leg;
                        }
                    }//the following line may cause damage test is needed
                    else {
                        nodeCollection[c].percentage = 0;
                        nodeCollection[c].vg = 0;
                    }
                }
            }
        },
        setGlobalVP:function(items) {
            var GlobalVP = 0;
            for(var c = 0; c<items.length; c++) {
                if(Utils.isNumber(items[c].vp)) {
                    GlobalVP += parseInt(items[c].vp);
                }
            }
            return GlobalVP;
        }

    }
}

function CalculateRankAdvancedBonus() {
    RankAdvanceBonus.calculate.runReport(MLMTree.vars.options.items);
    $(MLMTree.vars.canvas).orgDiagram(  "update", primitives.common.UpdateMode.Refresh);
}
