/*
 * Tag filtering
 */

var FullTagList = []
var CurrentTagFilter = Set()

var updateTagStrip = function() {

    var cTag = CurrentTagFilter.get()[CurrentTagFilter.size() - 1]

    $.getJSON('t/' + cTag, function(imgs) {
        var items = [];

        $.each(imgs, function(i) {
            //console.log(imgs[i].tags);
            items.push('<a href="' + imgs[i].original + '">' + '<img src="' + imgs[i].thumbnail + '"></img></a>');
        });

        $("#photos").append(items.join(''))
    });

    var iconspan = $('<span/>', {
        class: "cross icon"
    });

    $('<a/>', {
        href: '#',
        title: 'Remove this tag',
        class: 'button',
        text: cTag
    }).prepend(iconspan).appendTo('#tagstrip');

};

var addTag = function(tag) {
    CurrentTagFilter.add(tag)
    updateTagStrip();
};

var removeTag = function(tag) {
    // ... 
    updateTagStrip();
};

var initTags = function(){
// Get all the tags from the server
    $.getJSON('tags', function(tags) {
        var items = [];

        tags.sort(function(a, b) {
            return b.weight - a.weight;
        });

        $.each(tags, function(i) {
            items.push('<li class ="tagname">' + tags[i].name + '</li>');
        });

        fillTagList(items);

    });
};

var fillTagList = function(items){

    $("#taglist").html(items.join(''))

    $('input#search').quicksearch('ul#taglist li');

    $(".tagtr").click(function() {
        var tagname = $('td.tagname', this).html()
        addTag(tagname)
    });

};

var main = function() {

    // Show this div only when there is at least one active ajax query
    $('#loadingdiv').hide()
    .ajaxStart(function() {
        $(this).show();
    }).ajaxStop(function() {
        $(this).hide();
    });

    initTags();

};

$(document).ready(function() {
    main();
});
