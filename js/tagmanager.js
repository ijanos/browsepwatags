/*
 * Tag management
 */

var TagList = function () {

    var taglistid = "#taglist"; //FIXME hardwired id
    var filterList = [];
    var QS; //quicksearch object


    var removeTag = function (tag) {
        var idx = filterList.indexOf(tag);
        if (idx !== -1) filterList.splice(idx, 1);
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

    var addToTagstrip = function (tag) {

        var iconspan = document.createElement('span');
        iconspan.className = "cross icon";

        var f = function () {
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

    var hideAllBut = function (tags) {
        $("li.tagentry").removeClass("searchable").hide(); // hide all
        $.each(tags, function () {
            //then show only the availables
            $("li:contains(" + this + ")").addClass("searchable").show();

        });
    };

    var loadPhotos = function (tag) {
        filterList.push(tag)
        reloadPhotos();
    };

    var reloadPhotos = function () {
        var tags = filterList.join(',');

        $.getJSON('t/' + tags, function (imgs) {
            var newFilter = Set();
            var images = [];

            $("#photos").empty();

            $.each(imgs, function () {
                newFilter.add(this.tags);

                var img = document.createElement('img');
                img.src    = this.thumbnail.url;
                img.width  = this.thumbnail.width;
                img.height = this.thumbnail.height;
                img.className  = "gallery"

                var link = document.createElement('a');
                link.href = this.original;
                link.className = "gallery"
                link.rel = "group"
                link.appendChild(img);

                images.push(link);

            });
            $("#photos").append(images)

            $('input#search').val(''); // empty the search box
            newFilter.del(filterList);
            hideAllBut(newFilter.get());
            QS.cache(); //refresh quicksearch cache
            $(".searchable").attr('style',''); // XXX quicksearch hack, show all searchable element
            $("a.gallery").fancybox({
                'padding': 5,
                'margin': 15,
                'hideOnContentClick': true,
                'showCloseButton': false,
                'transitionIn': 'none',
                'transitionOut': 'none',
                'changeFade': 0
            });

        });
    };

    var showAll = function () {
        $("li.tagentry").addClass("searchable").show();
        QS.cache(); //refresh quicksearch cache
        $(".searchable").attr('style',''); // XXX quicksearch hack, show all searchable element
    };

    var fillTagList = function (items) {
        $.each(items, function () {
            $('<li/>',{
                class: "tagentry searchable",
                text: this.name
            }).appendTo(taglistid);
        });

        QS = $('input#search').quicksearch('ul#taglist li.searchable')

        $("#taglist li.tagentry").click(function () {
            var tagname = $(this).html();
            loadPhotos(tagname);
            addToTagstrip(tagname); 
        });

    };

    var init = function () {
    // Get all the tags from the server
        $.getJSON('tags', function (tags) {
            var items = [];

            tags.sort(function (a, b) {
                return b.weight - a.weight;
            });

            fillTagList(tags);
        });

    };

    return {
        init: init
    }
};

    var TL = TagList();

var main = function () {

    // Show this div only when there is at least one active ajax query
    $('#loadingdiv').hide()
    .ajaxStart(function () {
        $(this).show();
    }).ajaxStop(function () {
        $(this).hide();
    });

    TL.init();

};

$(document).ready(function () {
    main();
});
