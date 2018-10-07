/**
 * Created by ricardoibarra on 10/1/14.
 */

var Utils = {
    isFunction:function(functionToTry) {
        var getType = {};
        return functionToTry && getType.toString.call(functionToTry) === '[object Function]';
    },
    Execute:function(functionToTry) {
        if(Utils.isFunction(functionToTry) == true) {
            return functionToTry();
        }
    },
    randomString:function() {
        var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
        var string_length = 8;
        var randomstring = '';
        for (var i=0; i<string_length; i++) {
            var rnum = Math.floor(Math.random() * chars.length);
            randomstring += chars.substring(rnum,rnum+1);
        }
        return randomstring;
    },
    ExecFunctionByName:function(functionName, context, args) {
        var args = [].slice.call(arguments).splice(2);
        var namespaces = functionName.split(".");
        var func = namespaces.pop();
        for(var i = 0; i < namespaces.length; i++) {
            context = context[namespaces[i]];
        }
        return context[func].apply(this, args);
    },
    GetFile:{
       ReadText:function(controlid, updateProgress, loaded, errorHandler) {
           var file = document.getElementById(controlid).files[0];
           if(file){
                //Utils.GetFile.private.getAsText(file);
               var reader = new FileReader();
               // Read file into memory as UTF-16
               reader.readAsText(file, "UTF-8");
               // Handle progress, success, and errors
               reader.onprogress = updateProgress;
               reader.onload = loaded;
               reader.onerror = errorHandler;
           }
       }
    },
    isNumber:function(n) {
            var numStr = /^\d+$/;
            return numStr.test(n.toString());
    },
    isArray:function(obj) {
        if( Object.prototype.toString.call(obj) === '[object Array]' ) {
            return true;
        }

        return false;
    },
    isDate:function(d) {
        return Object.prototype.toString.call(d) === '[object Date]';  
    },
    makeDateFromISO:function(d) {
        if(/^\d{4}-\d{2}-\d{2}$/.test(d)) {
            var date = Date.parse(d);
            if (isNaN(date))
                return undefined;
            return  new Date(d);
        }
    return undefined;
    },
    getMonthDifference:function(d1, d2) {
        if(Utils.isDate(d1) === false || Utils.isDate(d2) === false) {
            return 0;
        }
        var m1;
        m1 = (d2.getFullYear() - d1.getFullYear()) * 12;
        m1 -= d1.getMonth() + 1;
        m1 += d2.getMonth();
        return m1 <= 0 ? 0 : m1;  
    },
    isValidJSON:function(text) {
        if (/^[\],:{}\s]*$/.test(text.replace(/\\["\\\/bfnrtu]/g, '@').
                replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
                replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

            return true;

        }
        return false;
    },
    ShowMessage:function(title, text, type) {
        new PNotify({
            title: title,
            text: text,
            type: type,
            buttons: {
                closer: true
            },
            delay:4000
        });
    },
    getUrlParameter:function(sParam)
    {
        var sPageURL = window.location.search.substring(1);
        var sURLVariables = sPageURL.split('&');
        for (var i = 0; i < sURLVariables.length; i++)
        {
            var sParameterName = sURLVariables[i].split('=');
            if (sParameterName[0] == sParam)
            {
                return sParameterName[1];
            }
        }
    }
};
