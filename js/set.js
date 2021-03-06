/*
A simple JavaScipt Set data structure
*/

var Set = function() {

    var set = [];

    function unique(item) {
        for (var i = 0; i < set.length; i++)
        {
            if (set[i] === item) return false;
        }
        return true;
    }

    function del(item) {
        if ($.isArray(item))
        {
            $.each(item, function(i) {
                var idx = set.indexOf(item[i]);
                if (idx != -1) set.splice(idx, 1);
            });
        }
        else
        {
            var idx = set.indexOf(item);
            if (idx != -1) set.splice(idx, 1);
        }
    }

    function isEmpty() {
        return set.length === 0;
    }

    function add(item) {
        if ($.isArray(item)) // If the item is an array iterate it
        {
            for (var i = 0; i < item.length; i++)
            {
                if (unique(item[i])) set.push(item[i]);
            }
        }
        else
        {
            if (unique(item)) set.push(item);
        }
    }

    function get() {
        return set;
    }

    function size() {
        return set.length;
    }

    // "Export" the public functions
    return {
        add: add,
        get: get,
        del: del,
        isEmpty: isEmpty,
        size: size
    };
};
