
RankPayment = {
    payLevels: {
         config: [ .25, .05, .05, .05, .10]
    }
}

FastStartBonus = {
    vars: {
        founded:null
    },
    config: {

        Ranks:[
            {   id: 0, name:"INVALID RANK", cost:0, requiredPV: 10000000,  payLevels:RankPayment.payLevels.config  },
            {   id: 1, name:"REP. MERCADEO", cost:400, isSmall:true, requiredPV: 50, payLevels:RankPayment.payLevels.config  },
            {   id: 2, name:"DISTRIBUIDOR", cost:700, isSmall:true, requiredPV: 50, payLevels:RankPayment.payLevels.config  },
            {   id: 3, name:"BRONCE", cost:1700, isSmall:true, requiredPV: 100, payLevels:RankPayment.payLevels.config },
            {   id: 4, name:"PLATA", cost:2800, isSmall:true, requiredPV: 100, payLevels:RankPayment.payLevels.config },
            {   id: 5, name:"ORO", cost:6800, isSmall:false, requiredPV: 100, payLevels:RankPayment.payLevels.config  },
            {   id: 6, name:"ESMERALDA", cost:14000, isSmall:false, requiredPV: 100, payLevels:RankPayment.payLevels.config },
            {   id: 7, name:"RUBY", cost:0, isSmall:false, requiredPV: 100, payLevels:RankPayment.payLevels.config  },
            {   id: 8, name:"DIAMANTE", cost:0, isSmall:false, requiredPV: 100, payLevels:RankPayment.payLevels.config  },
            {   id: 9, name:"DIAMANTE AZUL", cost:0, isSmall:false, requiredPV: 100, payLevels:RankPayment.payLevels.config },
            {   id: 10, name:"DIAMANTE NEGRO", cost:0, isSmall:false, requiredPV: 100, payLevels:RankPayment.payLevels.config  },
            {   id: 11, name:"DIAMANTE CORONA", cost:0, isSmall:false, requiredPV: 100, payLevels:RankPayment.payLevels.config  },
            {   id: 12, name:"DIAMANTE TRIPLE CORONA", cost:0, isSmall:false, requiredPV: 100, payLevels:RankPayment.payLevels.config  }
        ],
        costPV:10,
        SellPV:15.6,
        maxLegPercentage: .45,
        requiredLegs:3,
        maxSmallRankPayment:.50
    },
    calculate: {
        runReport:function(items) {
            FastStartBonus.helpers.setActiveMembers(items);
            FastStartBonus.helpers.findNewRanks(items);
            FastStartBonus.helpers.fitToRankBonus(items);

            var report_data = {};
            report_data.members = FastStartBonus.helpers.setUpReportArrayData(items);

            report_data.global_income = FastStartBonus.helpers.getGlobalRankIncome(items);
            report_data.global_income_formated = accounting.formatMoney(report_data.global_income);

            report_data.global_pay = FastStartBonus.helpers.getTotalPayed(items);
            report_data.global_pay_formated = accounting.formatMoney(report_data.global_pay);

            report_data.global_loss = FastStartBonus.helpers.getTotalNotPayed(items);
            report_data.global_loss_formated = accounting.formatMoney(report_data.global_loss);

            //get 50% of first start bonus money for calculations
            //stakeholder needs to know the difference of new money currently 50%;
            var tmpstart = report_data.global_income * .50;
            var allocatedMoney = report_data.global_pay + report_data.global_loss;
            var difference = tmpstart - allocatedMoney;

            report_data.allocated = difference;
            report_data.allocated_formated = accounting.formatMoney(report_data.allocated);

            return report_data;

        }
    },
    helpers: {

        setUpReportArrayData:function(items) {
            var members = [];
            for(var c=0; c<items.length; c++) {
                if(items[c].fastStartBonus.won.length > 0) {
                    members.push(items[c]);
                }
            }

            return members;
        },
        fitToRankBonus:function(items) { //small ranks are not allowed to earn more than 50% of their current plan
            for(var c=0; c<items.length; c++) {
                if(items[c].fastStartBonus.won.length > 0) {
                    items[c].fastStartBonus.ActualPayment = 0;
                    items[c].fastStartBonus.ActualLoss = 0;
                    var suma = 0;
                    for(var i=0; i<items[c].fastStartBonus.won.length; i++) {
                        suma += items[c].fastStartBonus.won[i];
                    }

                    var RankData = FastStartBonus.helpers.getRankData(items[c].rank);
                    if(RankData.isSmall) {
                        var MaxPayment = RankData.cost * FastStartBonus.config.maxSmallRankPayment;

                        if (suma > MaxPayment) {
                            items[c].fastStartBonus.ActualPayment = MaxPayment;
                            items[c].fastStartBonus.ActualLoss = suma - MaxPayment;
                        }
                        else {
                            items[c].fastStartBonus.ActualPayment = suma;
                            items[c].fastStartBonus.ActualLoss = 0;
                        }
                    }
                    else
                    {
                        items[c].fastStartBonus.ActualPayment = suma;
                        items[c].fastStartBonus.ActualLoss = 0;
                    }
                }
            }
        },
        getGlobalRankIncome:function(items) {
            var income = 0;
            for(var c=0; c<items.length; c++) {
                if (items[c].newrank) {
                    var rankData = FastStartBonus.helpers.getRankData(items[c].rank);
                    income += rankData.cost;
                }
            }
            return income;
        },
        getTotalPayed:function(items) {
            var payedMoney = 0;
            for(var c=0; c<items.length; c++) {
                if (items[c].fastStartBonus.won.length > 0) {
                    payedMoney += items[c].fastStartBonus.ActualPayment;
                }
            }
            return payedMoney;
        },
        getTotalNotPayed:function(items) { //must come after fittorank bonus
            var moneyLost = 0;
            for(var c=0; c<items.length; c++) {
                if (items[c].fastStartBonus.won.length > 0) {
                    moneyLost += items[c].fastStartBonus.ActualLoss;
                }
            }
            return moneyLost;
        },
        findNewRanks:function(items) {
            for(var c=0; c<items.length; c++) {
                if(items[c].newrank) {
                    var rankData = FastStartBonus.helpers.getRankData(items[c].rank);
                    if(rankData.cost > 0) { //if rank qualifies for payment
                        var level = 0;
                        var item = items[c];
                        while (level < rankData.payLevels.length && item.parent != null) {
                            var payBonus = rankData.cost * rankData.payLevels[level];
                            //checar este metodo
                            //FastStartBonus.helpers.AssignMoneyToMember(item, items, payBonus);
                            level++;
                            item = FastStartBonus.helpers.MemeberParent(item, items);
                            item.slot2 = 'images/fast-run.png';
                            item.fastStartBonus.won.push(payBonus);
                            var index = FastStartBonus.helpers.MemberIndexByID(item.id, items);
                            items[index] = item;

                        }
                    }
                }
            }
        },
        setActiveMembers:function(items) {
            for(var c=0; c<items.length; c++) {
                items[c].fastStartBonus = {};
                items[c].fastStartBonus.won = [];
                var rankData = FastStartBonus.helpers.getRankData(items[c].rank);
                if(parseInt(items[c].vp) >= rankData.requiredPV) {
                    items[c].fastStartBonus.qualify = true;
                }
                else {
                    items[c].fastStartBonus.qualify = false;
                }
            }
        },
        getRankData:function(name) {
            for(var r=0; r<FastStartBonus.config.Ranks.length; r++) {
                if(FastStartBonus.config.Ranks[r].name == name) {
                    return FastStartBonus.config.Ranks[r];
                }
            }
            return FastStartBonus.config.Ranks[0];
        },
        AssignMoneyToMember:function(item, items, winnedmoney) {
            for(var c=0; c<items.length; c++) {
                if(items[c].id == item.parent && item.parent != null) {
                    item = items[c];
                    if(items[c].fastStartBonus.qualify) {
                        items[c].fastStartBonus.won.push(winnedmoney);
                    }
                }
            }
        },
        MemeberParent:function(item, items) {
            if(item.parent != null) {
                for (var c = 0; c < items.length; c++) {
                    if (item.parent == items[c].id) {
                        return items[c];
                    }
                }
            }
            return item;
        },
        MemberIndexByID:function(id, items) {
            for (var c = 0; c < items.length; c++) {
                if (id == items[c].id) {
                    return c;
                }
            }
            return -1;
        }
    }
}

function CalculateFastStartBonus() {

    FastStartBonus.calculate.runReport(MLMTree.vars.options.items);
    $(MLMTree.vars.canvas).orgDiagram("update", primitives.common.UpdateMode.Refresh);

}