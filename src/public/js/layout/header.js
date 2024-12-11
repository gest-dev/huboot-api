async function authLogout() {
  let token = await $.cookie("tokenApiMultiDevice");

  $.ajax({
    url: "/auth/logout",
    method: "DELETE",
    headers: {
      "Authorization": "Bearer " + token,
      "Accept": "application/json",
      "Content-Type": "application/json"
    },
    beforeSend: function () {
      Commons.loading.show("Autenticando...");
    }
  }).done(function (data) {
    // Remove o token imediatamente
    //$.removeCookie("tokenApiMultiDevice");
    $.removeCookie('tokenApiMultiDevice', { path: '/' });

    // Redirecionar após a conclusão
    setTimeout(() => {
      Commons.loading.hide();
      window.location.href = "/auth/login";
    }, 500);
  }).fail(function (response) {
    swal("Erro!", "Erro ao tentar sair do sistema", "error");
  }).always(function () {
    Commons.loading.hide();
  });
}
