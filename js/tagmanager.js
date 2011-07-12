/*
 * Tag management
 */

var TagList = function(){

    var taglistid = "#taglist" //FIXME hardwired id
    var filterList = []


    var removeTag = function(tag){
        var idx = filterList.indexOf(tag);
        if (idx != -1) filterList.splice(idx, 1);
        if (filterList.length > 0)
        {
            reloadPhotos();
        }
        else
        {
            $("#photos").empty();
            showAll();
        }
    }

    var addToTagstrip = function(tag){

        var iconspan = document.createElement('span');
        iconspan.className = "cross icon";

        var f = function(){
            removeTag($(this).text());
            $(this).remove();
        }

        $('<a/>', {
            title: 'Remove this tag',
            class: 'button',
            text: tag
        }).prepend(iconspan)
          .click(f)
          .appendTo('#tagstrip');
    };

    var hideAllBut = function(tags){
        $("li.tagentry").hide(); // hide all
        $.each(tags, function(){
            //then show only the availables
            $("li:contains(" + this + ")").show();
        });
    };

    var loadPhotos = function(tag){
        filterList.push(tag)
        reloadPhotos();
    };

    var reloadPhotos = function(){
        tags = filterList.join(',')

        $.getJSON('t/' + tags, function(imgs) {
            var items = [];
            var newFilter = Set()

            $.each(imgs, function() {
                newFilter.add(this.tags)
                items.push('<a href="' + this.original + '">' + '<img src="' + this.thumbnail + '"></img></a>');
            });

            $('input#search').val(''); // empty the search box
            newFilter.del(tags);
            hideAllBut(newFilter.get())

            $("#photos").empty();
            $("#photos").append(items.join(''));
        });
    };

    var showAll = function(){
        $("li.tagentry").show();
    };

    var fillTagList = function(items){
        $.each(items, function() {
            $('<li/>',{
                class: "tagentry",
                text: this.name
            }).appendTo(taglistid);
        });

        //FIXME this will search hidden entries too
        $('input#search').quicksearch('ul#taglist li')

        $("#taglist li.tagentry").click(function() {
            var tagname = $(this).html();
            loadPhotos(tagname);
            addToTagstrip(tagname); 
        });

    };

    var init = function(){
    // Get all the tags from the server
        $.getJSON('tags', function(tags) {
            var items = [];

            tags.sort(function(a, b) {
                return b.weight - a.weight;
            });

            fillTagList(tags);
        });

    };

    return{
        init: init,
    }
};

    var TL = TagList();

var main = function() {

    // Show this div only when there is at least one active ajax query
    $('#loadingdiv').hide()
    .ajaxStart(function() {
        $(this).show();
    }).ajaxStop(function() {
        $(this).hide();
    });

    TL.init();

};

$(document).ready(function() {
    main();
});
