/*
 "Important"
 This Bonus is deprecated see V3 for current bonus calculation






    Payment Rules:
    
    If distribuitor has 100 pv
        If direct/sponsored has more than 100pv
            distribuitor will get money compesantion of direct/sponsored
            Compensation follows this table
            { month:2, amount:500 },
            { month:3, amount:400 },
            { month:4, amount:300 }
        else
             If distribuitor has less than 130 pv's
                distribuitor will get 5% of posible 10-99pv from each direct/sponsored (up to 4 maximum)
        	 If distribuitor has more than 130 pv's     
                distribuitor will get 10% of posible 10-99pv from each direct/sponsored (up to 4 maximum)     
    Else
        distribuitor does not qualify for any bonus
             
    End If
                
*/

var BonoPrimerNivel = {
    vars: {
    	
    },
    config: {
        rankPayment: [ //we are keeping this in case minimum pv has to be different on each rank so for know everyone is 100
            {   id: 0, name:"INVALID RANK", requiredPV: 10000000 },
            {   id: 1, name:"REP. MERCADEO", requiredPV: 100 },
            {   id: 2, name:"DISTRIBUIDOR",  requiredPV: 100 },
            {   id: 3, name:"BRONCE", requiredPV: 100 },
            {   id: 4, name:"PLATA", requiredPV: 100 },
            {   id: 5, name:"ORO", requiredPV: 100 },
            {   id: 6, name:"ESMERALDA", requiredPV: 100 },
            {   id: 7, name:"RUBY", requiredPV: 100 },
            {   id: 8, name:"DIAMANTE", requiredPV: 100 },
            {   id: 9, name:"DIAMANTE AZUL", requiredPV: 100 },
            {   id: 10, name:"DIAMANTE NEGRO", requiredPV: 100 },
            {   id: 11, name:"DIAMANTE CORONA", requiredPV: 100 },
            {   id: 12, name:"DIAMANTE TRIPLE CORONA", requiredPV: 100 }
        ],
        MoneyMonthBonus: [ //amount of money to pay from the time the direct/sponsored entered
            { month:2, amount:500 },
            { month:3, amount:400 },
            { month:4, amount:300 } 
        ],
        PvMonthBonus: [ //amount of points payed put most pvs at the top otherwise calculations may fail            
            { month:2, requiredpv:130, payspv:.10 },
            { month:3, requiredpv:130, payspv:.10 },
            { month:4, requiredpv:130, payspv:.10 },
            { month:2, requiredpv:100, payspv:.05 },
            { month:3, requiredpv:100, payspv:.05 },
            { month:4, requiredpv:100, payspv:.05 },
        ],
        limit:4, //limits the total sponsored/directs avaliable for bonus generation
        
        //used for aprox calculation on income
        BuyPV:10,
        SellPV:15.6
    },
    calculate:{
        runReport:function(items) {
            //stores all the persons that won a first level bonus
            var qualify_persons = [];
            //go through the tree to get everyones direct/sponsored
            for(var c=0; c<items.length; c++) {
                var children = [];
                //if distribuitor has the minimun required pv to earn this bonus with consider them
                if(parseInt(items[c].vp) >= BonoPrimerNivel.helpers.getRankRequiredPV(items[c])) {
                    children = BonoPrimerNivel.helpers.getDirectOwned(items[c], items);
                    //for now we are going to assume that everyone is on their 2nd month
                    //if conditions apply distrobuitor should get 500 bonus
                    if(children.length > 0) {
                        //we store the ones that qualify for bonus in payable
                        var payableMoney = [], payablePv = [];
                         //we go thorugh each children
                        for(var i=0; i<children.length; i++) {
                            //if they have more than a 100 points owner gets a $ comission
                            if(parseInt(children[i].vp) >= BonoPrimerNivel.helpers.getRankRequiredPV(children[i])) {
                                //this has to be a direct calculation
                                //from Date() - children[i].CreatedDate; currently we are using 2
                                 
                                var num_month = Utils.getMonthDifference(Utils.makeDateFromISO(children[i].joineddate), new Date());
                                var qualifies_for = BonoPrimerNivel.helpers.getMoneyMonthBonus(num_month);
                                if(typeof qualifies_for !== 'undefined') {
                                    //this is to avoid pollution of global distribuitor data
                                    //if data is required to be global assign PaysMoneyParent directly to children[i]. e.g children[i].PaysMoneyParent
                                    var currentitem = children[i];
                                    currentitem.PaysMoneyParent = qualifies_for.amount;
                                    currentitem.DiffMonth = num_month;
                                    payableMoney.push(currentitem);
                                }   
                            }
                            else //here we pay pvs instead of money
                            {
                                 var num_month = Utils.getMonthDifference(Utils.makeDateFromISO(children[i].joineddate), new Date());
                                 var qualifies_for = BonoPrimerNivel.helpers.getPvMonthBonus(num_month, parseInt(items[c].vp));
                                 if(typeof qualifies_for !== 'undefined') {
                                    var currentitem = children[i];
                                    currentitem.PaysPvParent = Math.round(parseInt(children[i].vp) * qualifies_for.payspv);
                                    currentitem.DiffMonth = num_month;
                                    payablePv.push(currentitem);
                                 }
                            }
                        }
                        //The payment of money takes precedence over paying pv's but total bonus 
                        //generation is limited to BonoPrimerNivel.config.limit
                        
                        var bonusRecord = {
                            winner:undefined,
                            directsCommission:[],
                            directsPV:[],
                            earnedPV:0,
                            commission:0
                        };
                        
                        if(payableMoney.length > 0) { 
                            //we order from paying less to paying more
                            payableMoney.sort(function(a, b) { return a.PaysMoneyParent > b.PaysMoneyParent; });
                            bonusRecord.winner = items[c];
                            bonusRecord.directsCommission = payableMoney.slice(0, BonoPrimerNivel.config.limit);
                            //we add up the commission earned from each person 
                            bonusRecord.commission = bonusRecord.directsCommission.length == 1? bonusRecord.directsCommission[0].PaysMoneyParent : bonusRecord.directsCommission.reduce(function(a, b) { 
                                if(typeof a !== 'number')
                                    return a.PaysMoneyParent + b.PaysMoneyParent; 
                                else
                                    return a + b.PaysMoneyParent; 
                                });
                        }
                        
                        var AvaliableForPVs = BonoPrimerNivel.config.limit - bonusRecord.directsCommission.length;
                        //double protection againts bugs. We dont want any negative numbers
                        AvaliableForPVs = AvaliableForPVs < 0? 0 : AvaliableForPVs;
                        //double protection againsts execeding the quota limit
                        AvaliableForPVs = AvaliableForPVs > BonoPrimerNivel.config.limit? BonoPrimerNivel.config.limit : AvaliableForPVs;
                        if(payablePv.length > 0 && AvaliableForPVs > 0) {
                            //sort ascendent. This way we pay less
                            payablePv.sort(function(a,b) { return a.PaysPvParent > b.PaysPvParent; });
                            bonusRecord.directsPV = payablePv.slice(0, AvaliableForPVs);
                            bonusRecord.earnedPV = bonusRecord.directsPV.length == 1? bonusRecord.directsPV[0].PaysPvParent : bonusRecord.directsPV.reduce(function(a,b) { 
                                if(typeof a !== 'number')
                                    return a.PaysPvParent + b.PaysPvParent;
                                else 
                                    return a + b.PaysPvParent; 
                                });
                        }
                        
                        if(bonusRecord.earnedPV > 0 || bonusRecord.commission > 0) {
                            qualify_persons.push(bonusRecord);
                        }
                    }
                }
            }
            
            //validation of paying money and PV's is complete til here
    	   console.log(qualify_persons);
           //Report specifications
           //get total pv affecting current bonus.
           //get total money generated according to sales
           //get total money to pay in commissions
           //get total paying pv
           //========
           //get a list of the distribuitors who won first level bonus
           //on each distribuitor click report should show direct/sponsored responsible for the bonus
           var sumpv = 0, sumcomm = 0;
           for(var r=0;r<qualify_persons.length; r++) {
                 sumcomm += qualify_persons[r].commission;
                 sumpv += parseInt(qualify_persons[r].winner.vp);
                 qualify_persons[r].directsCommission.forEach(function(i) {
                     sumpv += parseInt(i.vp);
                 });
           }
           
           var first_level_bonus = {};
            first_level_bonus.SellPV = accounting.formatMoney(BonoPrimerNivel.config.SellPV);
            //this gets overall vp
            first_level_bonus.BuyPV = accounting.formatMoney(BonoPrimerNivel.config.BuyPV);
            //first_level_bonus.percentage = (BonoPrimerNivel.config.directPVPayment * 100) + "%";
            first_level_bonus.globalVP = BonoPrimerNivel.helpers.getGlobalVP(items);
            first_level_bonus.globalIncome = accounting.formatMoney(first_level_bonus.globalVP * BonoPrimerNivel.config.SellPV);
            first_level_bonus.PayCommission = accounting.formatMoney(sumcomm);
            //this sets only the vp involved with the bonus
            first_level_bonus.pvOfBonus = sumpv;
            first_level_bonus.directIncome = sumpv * BonoPrimerNivel.config.BuyPV;
            first_level_bonus.directIncome_formated = accounting.formatMoney(sumpv * BonoPrimerNivel.config.BuyPV);
            first_level_bonus.commission_percentage = Math.round((sumcomm / first_level_bonus.directIncome) * 100);
            first_level_bonus.commission_percentage += '%';
            first_level_bonus.members = qualify_persons;
            return first_level_bonus;
           
           /*
            //OLD CODE 
            //de todos los directos patrocinados que encontramos se buscan los puntos y se les saca el 50% y se asigna
            //a paypv
            var sumpvdirecto = 0, sumcomm = 0;
            for(var r=0;r<qualify_persons.length; r++) {
                var paypv = 0;
                for(var c = 0; c < qualify_persons[r].directs.length; c++) {
                    paypv += Math.ceil(parseInt(qualify_persons[r].directs[c].vp) * (BonoPrimerNivel.config.directPVPayment));
                    sumpvdirecto += parseInt(qualify_persons[r].directs[c].vp);

                }
                sumpvdirecto += parseInt(qualify_persons[r].person.vp);
                qualify_persons[r].paypv = paypv;
                qualify_persons[r].amount = (paypv * BonoPrimerNivel.config.BuyPV);
                sumcomm += qualify_persons[r].amount;
                qualify_persons[r].amount_formated = accounting.formatMoney(qualify_persons[r].amount);
            }
            //console.log(sumpvdirecto);
            var first_level_bonus = {};
            first_level_bonus.SellPV = accounting.formatMoney(BonoPrimerNivel.config.SellPV);
            first_level_bonus.BuyPV = accounting.formatMoney(BonoPrimerNivel.config.BuyPV);
            first_level_bonus.percentage = (BonoPrimerNivel.config.directPVPayment * 100) + "%";
            first_level_bonus.globalVP = BonoPrimerNivel.helpers.getGlobalVP(items);
            first_level_bonus.globalIncome = accounting.formatMoney(first_level_bonus.globalVP * BonoPrimerNivel.config.SellPV);
            //incorrect
            //first_level_bonus.directIncome = accounting.formatMoney(sumpvdirecto * BonoPrimerNivel.config.SellPV);
            first_level_bonus.directIncome = (BonoPrimerNivel.helpers.getDirectLineVP(qualify_persons) * BonoPrimerNivel.config.SellPV);
            first_level_bonus.directIncome_formated = accounting.formatMoney(first_level_bonus.directIncome);
            first_level_bonus.commission = accounting.formatMoney(sumcomm);
            first_level_bonus.members = qualify_persons;

            return first_level_bonus;
            
            */
        }
    },
    helpers: {
        getDirectOwned:function(item, items) {
            children = [];
            for(var c=0; c<items.length; c++) {
                if(items[c].sponsor == item.id && items[c].parent == item.id) {
                    children.push(items[c]);
                }
            }
            return children;
        },
        setIconOnItems:function(items, qualifying_members) {
            //set tree icon here.
        },
        getDirectLineVP:function(qualifiers) {
            var arr = [];
            for(var r=0; r<qualifiers.length; r++) {
               if(BonoPrimerNivel.helpers.isIDAllowed(arr, qualifiers[r].person.id) == false) {
                   arr.push({ id:qualifiers[r].person.id, vp:qualifiers[r].person.vp });
               }
                for(var c=0; c<qualifiers[r].directs.length; c++) {
                    if(BonoPrimerNivel.helpers.isIDAllowed(arr, qualifiers[r].directs[c].id) == false) {
                    //if(arr.indexOf({ id:qualifiers[r].directs[c].id, vp:qualifiers[r].directs[c].vp }) < 0) {
                        arr.push({ id:qualifiers[r].directs[c].id, vp:qualifiers[r].directs[c].vp });
                    }
                }
            }
            //console.log(arr);
            var vptotal = 0;
            arr.forEach(function(e) {
                vptotal += parseInt(e.vp);
            });

            return vptotal;

        }, //checks if is already there
        isIDAllowed:function(arr, id) {
            for(var x = 0; x< arr.length; x++) {
                if(arr[x].id == id)
                    return true;
            }
            return false;
        },
        getRankRequiredPV:function(item) {
            for(var i=0;i<BonoPrimerNivel.config.rankPayment.length; i++) {
                if(BonoPrimerNivel.config.rankPayment[i].name == item.rank) {
                    return BonoPrimerNivel.config.rankPayment[i].requiredPV;
                }
            }
            return ResidualBonus.config.rankPayment[0].requiredPV;
        },
        getGlobalVP:function(items) {
            var sum = 0;
            for(var c = 0; c<items.length;c++) {
                sum += parseInt(items[c].vp);
            }
            return sum;
        },
        getMoneyMonthBonus:function(month) {
            var item = undefined;
            BonoPrimerNivel.config.MoneyMonthBonus.forEach(function(i) {
                if(i.month == month) {
                    item = i;
                    return;
                }
            });
            return item;
        },
        getPvMonthBonus:function(month, pv) {
            for(var i = 0; i<BonoPrimerNivel.config.PvMonthBonus.length; i++) {
                if(month == BonoPrimerNivel.config.PvMonthBonus[i].month) {
                    if(pv >= BonoPrimerNivel.config.PvMonthBonus[i].requiredpv) { 
                        return BonoPrimerNivel.config.PvMonthBonus[i];
                    } 
                }
            }
            return undefined;
        }
    }
};

function CalculateFirstLevelBonus() {

    BonoPrimerNivel.calculate.runReport(MLMTree.vars.options.items);
    $(MLMTree.vars.canvas).orgDiagram(  "update", primitives.common.UpdateMode.Refresh);

}