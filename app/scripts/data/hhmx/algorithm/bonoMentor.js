
//requires accounting method formatMoney for currency formating

MentorBonus = {
    vars: {
        founded:null
    },
    config: {
        qualifyingRanks:[
            {   id: 5, name:"ORO", requiredPV: 100 },
            {   id: 6, name:"ESMERALDA", requiredPV: 100 },
            {   id: 7, name:"RUBY", requiredPV: 100 },
            {   id: 8, name:"DIAMANTE", requiredPV: 100 },
            {   id: 9, name:"DIAMANTE AZUL", requiredPV: 100 },
            {   id: 10, name:"DIAMANTE NEGRO", requiredPV: 100 },
            {   id: 11, name:"DIAMANTE CORONA", requiredPV: 100 },
            {   id: 12, name:"DIAMANTE TRIPLE CORONA", requiredPV: 100 }
        ],
        costPV:10,
        SellPV:15.6,
        globalPayPercentage:.01
        //pays once percente of global sales
    },
    calculate: {
        runReport:function(items) {
            for(var c=0;c<items.length;c++) {
                MentorBonus.helpers.setRankQualify(items[c]);
            }

            var itemArray = ResidualBonus.helpers.sanitizeTree(
                ResidualBonus.helpers.CreateTreeFromArray(items));

            //set amount of mentor legs
            var qualify_mentor = {};
            qualify_mentor.GlobalVP = 0;
            qualify_mentor.members = [];
            for(var c = 0; c<items.length; c++) {
                MentorBonus.vars.founded = null;
                if(items[c].qualifyMentor == "YES") {
                    items[c].MentorLegs = 0;
                    MentorBonus.helpers.GetNodesById(itemArray, items[c].id);
                    if(MentorBonus.vars.founded !== null) {
                        MentorBonus.helpers.FindMentorLegs(MentorBonus.vars.founded);
                        items[c].MentorLegs = MentorBonus.vars.founded.MentorLegs;
                        items[c].PayMentorLegs = Math.floor(items[c].MentorLegs / 2);
                        if(items[c].PayMentorLegs > 0) {
                            qualify_mentor.members.push(items[c]);
                        }
                    }
                }
            }
            var GlobalVP = 0;
            for(var c = 0; c<items.length; c++) {
                if(Utils.isNumber(items[c].vp)) {
                    GlobalVP += parseInt(items[c].vp);
                }
            }

            qualify_mentor.GlobalVP = GlobalVP;
            qualify_mentor.GlobalIncome = GlobalVP * MentorBonus.config.SellPV;
            qualify_mentor.GlobalIncome_formated = accounting.formatMoney(qualify_mentor.GlobalIncome);
            qualify_mentor.global_percentage = qualify_mentor.GlobalIncome * MentorBonus.config.globalPayPercentage;
            qualify_mentor.global_percentage_formated =  accounting.formatMoney(qualify_mentor.global_percentage);
            qualify_mentor.global_percentage_divided = 0;
            qualify_mentor.percentage = (MentorBonus.config.globalPayPercentage * 100) + '%';


            if(qualify_mentor.members.length > 0) {
                qualify_mentor.global_percentage_divided = qualify_mentor.global_percentage / qualify_mentor.members.length;
                qualify_mentor.global_percentage_divided_formated = accounting.formatMoney(qualify_mentor.global_percentage_divided);
                MentorBonus.helpers.mapVisual(items, qualify_mentor);
            }

            return qualify_mentor;
        }
    },
    helpers: {
        mapVisual:function(items, qualify_mentor) {
            for(var r = 0; r < qualify_mentor.members.length; r++) {
                for (var c = 0; c < items.length; c++) {
                    if(items[c].id == qualify_mentor.members[r].id) {
                        items[c].slot1 = 'images/mentor.png'
                    }
                }
            }
        },
        CreateTreeFromArray:function(nodes) {
            var map = {}, node, roots = [];

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
        //unicamente deben entrar los nodos de rango que califica
        FindMentorLegs:function(item) {
            item.MentorLegs = 0;
            item.children.forEach(function(i) {
                if(i.sponsor == item.id) {
                    var correct = 0;
                    i.children.forEach(function(e) {
                        if(e.sponsor == i.id) {
                            correct += 1;
                        }
                    });

                    if(correct >= 2) {
                        item.MentorLegs += 1;
                    }
                }
            });

            //only pair legs are paid
            //parece que no se requiere al final
            //item.MentorLegs = Math.floor(item.MentorLegs / 2);

        },
        CalculateEarnedCommissions:function(item, GlobalPV) {
            commission = 0;
            formatedCommission = "$ 0";
            if(item.qualifyMentor == "YES") {
                item.bonusMentorCommission = GlobalPV * MentorBonus.config.globalPayPercentage;
            }
        },
        setRankQualify:function(item) {
            item.qualifyMentor = "NO";
            var RankData = MentorBonus.helpers.getRankDataByName(item.rank);
            if(RankData != null) {
                for (var c = 0; c < MentorBonus.config.qualifyingRanks.length; c++) {
                    if (item.rank == MentorBonus.config.qualifyingRanks[c].name && item.vp >= RankData.requiredPV) {
                        item.qualifyMentor = "YES";
                    }
                }
            }
        },
        GetNodesById:function(item, id) {

            //agregar condicion de solo seguir si no se ha encontrado
            if (item.children && MentorBonus.vars.founded == null) {
                item.children.forEach(function (d) {
                    MentorBonus.helpers.GetNodesById(d, id);
                });
            }

            if (item.id == id) {
                MentorBonus.vars.founded = item;
            }

        },
        sanitizeTree:function(ArrayItems) {
            if(Utils.isArray(ArrayItems))
                ArrayItems = ArrayItems[0];
            return ArrayItems;
        },
        getRankDataByName:function(name) {
            var rankData = null;
            for(var r=0; r<MentorBonus.config.qualifyingRanks.length; r++) {
                if(MentorBonus.config.qualifyingRanks[r].name == name) {
                    rankData = MentorBonus.config.qualifyingRanks[r];
                }
            }
            return rankData;
        }
    }
}

function CalculateMentorBonus() {
    MentorBonus.calculate.runReport(MLMTree.vars.options.items);
    $(MLMTree.vars.canvas).orgDiagram("update", primitives.common.UpdateMode.Refresh);
}

