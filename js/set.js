/*
A simple JavaScipt Set data structure
*/

var Set = function(){
    var set = []

    function unique(item){
        for(var i=0; i<set.length; i++)
        {
            if (set[i] === item) return false;
        }
        return true;
    }

    function add(item){
        if (item.length)
        {
            for(var i=0; i<item.length; i++)
            {
                if (unique(item[i])) set.push(item[i])
            }
        }
        else
        {
            if (unique(item)) set.push(item[i])
        }
    }

    function get(){
        return set;
    }

    return {
        add: add,
        get: get
    }
};
