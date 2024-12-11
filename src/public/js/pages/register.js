function athRegister() {
  let fullname = $("#fullname").val();
  let email = $("#email").val();
  let password = $("#password").val();
  let passwordConfirm = $("#passwordConfirm").val();

  let data = {
    fullname: fullname,
    email: email,
    password: password,
    passwordConfirm: passwordConfirm
  };
  $.ajax({
    url: "/auth/register",
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
    swal(
      "Erro!",
      response.responseJSON.message,
      "error"
    );
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