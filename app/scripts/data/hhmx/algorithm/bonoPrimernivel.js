

BonoPrimerNivel = {
    vars: {

    },
    config: {
        rankPayment: [
            {   id: 0, name:"INVALID RANK", requiredPV: 10000000 },
            {   id: 1, name:"REP. MERCADEO", requiredPV: 50 },
            {   id: 2, name:"DISTRIBUIDOR",  requiredPV: 50 },
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
        directPVPayment:.5,
        BuyPV:10,
        SellPV:15.6
    },
    calculate:{
        runReport:function(items) {
            var qualify_persons = [];
            //recorremos todo el arbol para buscar los directos-mayores (patrocinados y directos) de cada quien
            for(var c=0; c<items.length; c++) {
                var children = [];
                if(parseInt(items[c].vp) >= BonoPrimerNivel.helpers.getRankRequiredPV(items[c])) {
                    children = BonoPrimerNivel.helpers.getDirectOwned(items[c], items);
                    if (children.length > 0) {
                        var payable = [];
                        for(var i =0; i<children.length; i++) {
                            if(parseInt(children[i].vp) >= BonoPrimerNivel.helpers.getRankRequiredPV(children[i])) {
                                payable.push(children[i]);
                            }
                        }
                        if(payable.length > 0) {
                            items[c].slot2 = 'images/hand-to-hand.png';
                            qualify_persons.push({
                                person:items[c],
                                directs:payable,
                                paypv:0,
                                amount:0
                            });
                        }
                    }
                }
            }

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
        }
    }
};

function CalculateFirstLevelBonus() {

    BonoPrimerNivel.calculate.runReport(MLMTree.vars.options.items);
    $(MLMTree.vars.canvas).orgDiagram(  "update", primitives.common.UpdateMode.Refresh);

}