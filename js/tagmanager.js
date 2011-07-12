/*
 * Tag management
 */

var TagList = function(){

    var taglistid = "#taglist" //FIXME hardwired id
    var taglist = [];

    var addToTagstrip = function(tag){

        var iconspan = document.createElement('span');
        iconspan.className = "cross icon";

        var f = function(){
            // TODO remove tag filter
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
        $.getJSON('t/' + tag, function(imgs) {
            var items = [];

            $.each(imgs, function() {
                //console.log(imgs[i].tags);
                items.push('<a href="' + this.original + '">' + '<img src="' + this.thumbnail + '"></img></a>');
            });

            $("#photos").append(items.join(''))
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

        $(".tagentry").click(function() {
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

            taglist = $.map(tags, function(tag){
                return tag.name
            });

            fillTagList(tags);
        });

    };

    return{
        init: init,
    }
};


var main = function() {

    // Show this div only when there is at least one active ajax query
    $('#loadingdiv').hide()
    .ajaxStart(function() {
        $(this).show();
    }).ajaxStop(function() {
        $(this).hide();
    });

    var TL = TagList();
    TL.init();

};

$(document).ready(function() {
    main();
});
