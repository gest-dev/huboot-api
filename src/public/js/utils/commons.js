$(document).ready(function () {
    Commons = {
        loadingOverlay: $('#loading-overlay'),
        loading: {
            // https://www.jqueryscript.net/loading/Fullscreen-Loading-Modal-Indicator-Plugin-For-jQuery-loadingModal.html --}}
            show: function (_text, _animation, _backgroundColor) {
                // remove style display none se existir
                Commons.loadingOverlay.removeAttr('style');
            },
            hide: function () {
                // adiciona display none
                Commons.loadingOverlay.css('display', 'none');
            }
        },
    };
});

function toastAlert(message) {
    // Mostrar o Toast
    const toastElement = document.getElementById('toast-success-general');
    const toast = new bootstrap.Toast(toastElement);

    // Alterar a mensagem do Toast
    const toastMessageElement = document.getElementById('toast-message');
    toastMessageElement.innerHTML = message;

    // Mostrar o Toast
    toast.show();
}