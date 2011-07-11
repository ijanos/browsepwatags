// Global variables
var CurrentTagFilter = []

var updateTagStrip = function() {

    var cTag = CurrentTagFilter[CurrentTagFilter.length - 1];

    $.getJSON('t/' + cTag, function(imgs) {
        var items = [];

        $.each(imgs, function(i) {
            console.log(imgs[i].tags);
            items.push('<a href="' + imgs[i].original + '">' + '<img src="' + imgs[i].thumbnail + '"></img></a>');
        });

        $("#photos").append(items.join(''))
    });

    $("#tagstrip").append('<a href="#" class="button"><span class="tag icon"></span>' + cTag + '</a>');

};

var addTag = function(tag) {
    CurrentTagFilter.push(tag)
    updateTagStrip();
};


var main = function() {

    $('#loadingdiv').hide() // hide it initially
    .ajaxStart(function() {
        $(this).show();
    }).ajaxStop(function() {
        $(this).hide();
    });


    $.getJSON('tags', function(tags) {
        var items = [];

        tags.sort(function(a, b) {
            return b.weight - a.weight;
        });

        $.each(tags, function(i) {
            items.push('<tr class="tagtr"><td class ="tagname">' + tags[i].name + '</td><td>' + tags[i].weight + '</td></tr>');
        });

        $("#tagtable").html(items.join(''))

        $('input#search').quicksearch('table#tagtable tr');

        $(".tagtr").click(function() {
            var tagname = $('td.tagname', this).html()
            addTag(tagname)
        });
    });

};

$(document).ready(function() {
    main();
});
