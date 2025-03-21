// jQuery Plugin Enlarge on Hover
(function($) {
    $.fn.enlargeEmoji = function(options) {
        const settings = $.extend({
            scale: 2 // double size
        }, options);

        return this.each(function() {
            const $item = $(this);
            const $img = $item.find('img');

            $item.on('mouseenter', function() {
                $img.css({
                    width: 40 * settings.scale + 'px',
                    height: 40 * settings.scale + 'px'
                });
            });

            $item.on('mouseleave', function() {
                $img.css({
                    width: '40px',
                    height: '40px'
                });
            });
        });
    };
})(jQuery);

$(document).ready(function() {
    $('button').click(function() {
        $.ajax({
            url: 'emojis.json', //link toJSON
            method: 'GET', //Getting JSON 
            dataType: 'json', //Parse JSON?
            success: function(data) { //did it work?
                if (!data || $.isEmptyObject(data)) {
                    $('.emoji-list').append('<li>No emoji data available.</li>');//No it didn't so get this message
                    return;
                }

                $('.emoji-list').empty(); 
                $.each(data, function(emojiName, emojiUrl) {
                    const emojiHtml = `
                        <li class="emoji-item">
                            <img src="${emojiUrl}" alt="${emojiName}">
                            <p class="emoji-name">${emojiName}</p>
                        </li>
                    `;
                    $('.emoji-list').append(emojiHtml);
                });

                $('.emoji-item').enlargeEmoji({ scale: 2 });
            },
            error: function(xhr, status, error) {//error checks
                $('.emoji-list').append('<li>Failed to load emojis: ' + error + '</li>');
            }
        });
    });
});