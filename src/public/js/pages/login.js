function athLogin() {
  var email = $("#email").val();
  var password = $("#password").val();
  var data = {
    email: email,
    password: password
  };
  $.ajax({
    url: "/auth/login",
    data: data,
    method: "POST",
    beforeSend: function () {
      Commons.loading.show("Autenticando...");
    }
  }).done(async function (data) {
    if (data.token) {
      // salva o token no cookie
      await $.cookie("tokenApiMultiDevice", data.token, {
        expires: 1, // Expira em 1 dia
        path: "/",  // Disponível em todas as rotas do domínio
        secure: false, // Use se estiver em HTTPS
        sameSite: 'Strict', // Para evitar CSRF (opcional, dependendo da aplicação)
      });
      // salva na sessão
      window.location.href = "/manager";
    } else {
      alert(data.message);
    }
  }).fail(function (response) {
    swal("Erro!", "Erro ao tentar autenticar", "error");
    /* error-message */


    $("#error-message").html(
      "<div class='alert alert-danger' role='alert'>" +
      response.responseJSON.message +
      "</ div>"
    );
  }).always(function () {
    Commons.loading.hide();
  });
}


// se o usuario der enter dentro do input seja id="password" ou id="email" ele chama a função athLogin
$("#password").keypress(function (event) {
  if (event.which == 13) {
    athLogin();
  }
});
$("#email").keypress(function (event) {
  if (event.which == 13) {
    athLogin();
  }
});