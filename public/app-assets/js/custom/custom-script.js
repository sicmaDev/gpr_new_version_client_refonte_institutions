$(document).ready(function () {
    $('textarea[data-limit-rows=true]')
        .on('keypress', function (event) {
            var textarea = $(this),
                text = textarea.val(),
                numberOfLines = (text.match(/\n/g) || []).length + 1,
                maxRows = parseInt(textarea.attr('rows'));

            if (event.which === 13 && numberOfLines === maxRows ) {
                return false;
            }
        });
});