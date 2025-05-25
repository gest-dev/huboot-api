$("#show-modal_new_instance").on('click', function () {
  $("#modal_new_instance").modal('show');
});

$("#modal_btn_new_instance").on('click', async function () {
  var name = $("#instanceName").val();
  let token = await $.cookie("tokenApiMultiDevice");
  $.ajax({
    url: '/instance/new',
    type: 'POST',
    headers: {
      "Authorization": "Bearer " + token
    },
    data: {
      name: name,
    },
    beforeSend: function () {
      Commons.loading.show("Criando instância");
    }
  }).done(async function (data) {
    listInstances();
    swal("Sucesso!", "Instância criada com sucesso", "success");
    $("#modal_new_instance").modal('hide');
    $("#instanceName").val("");
  }).fail(function (response) {
    swal("Erro!", response.responseJSON.message, "error")

  }).always(function () {
    Commons.loading.hide();
  });
})

// deletar instance de forma permanente e global (primeiro pergunta se tem certeza e avisa que vai limpar a instancias do banco de dados)
function deleteInstance(key, name) {
  swal({
    title: "Você tem certeza?",
    text: `Uma vez deletado, você não poderá recuperar a instância ${name}`,
    type: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#6C757D',
    cancelButtonText: 'Cancelar!',
    confirmButtonText: 'Remover!',
    reverseButtons: true, // Inverte a ordem dos botões
  })
    .then(async (result) => {
      if (result.value) {
        let token = await $.cookie("tokenApiMultiDevice");
        $.ajax({
          url: '/instance/delete/general?key=' + key,
          type: 'DELETE',
          headers: {
            "Authorization": "Bearer " + token,
            "Accept": "application/json",
            "Content-Type": "application/json"
          },
          beforeSend: function () {
            Commons.loading.show("Deletando instância");
          }
        })
          .done(function (returnData) {
            // se vem error falso então deu certo pode por true
            swal("Sucesso!", "Instância deletada com sucesso", "success");
            listInstances();
            Commons.loading.hide();
          }).fail(function (response) {
            swal("Erro!", response.responseJSON.message, "error")
          }).always(function () {
            Commons.loading.hide();
          });
      }
    });
}


/* lista todas instances */
async function listInstances() {
  let token = await $.cookie("tokenApiMultiDevice");
  $("#instances_list").html("");
  $.ajax({
    url: '/instance/list',
    type: 'GET',
    headers: {
      "Authorization": "Bearer " + token,
      "Accept": "application/json",
      "Content-Type": "application/json"
    },
    beforeSend: function () {
      Commons.loading.show("Carregando instâncias");
    }
  }).done(function (returnData) {
    $("#amount_instance").html(returnData.data.length);
    if (returnData.data.length == 0) {
      $("#instances_list").append(`
        <div class="col-12">
          <div class="card ml-1 mr-1 shadow-warning">
            <div class="card-header p-3 mb-0">
              <p class="mt-1 mb-0 text-center h5 text-white">Nenhuma instância encontrada</p>
            </div>
          </div>
        </div>
      `)
    } else {
      returnData.data.forEach(function (instance) {
        let instance_session = '';
        if (instance.instance_session && instance.instance_session.phone_connected) {
          instance_session = `<span class="badge bg-success fs-7 text-white ">Conectado</span>`;
        } else {
          instance_session = `<span class="badge bg-warning fs-7 text-white ">Desconectado</span>`;
        }
        let html_instances_list = `
          <div class="col-12 col-md-6 col-lg-6 col-xl-6 py-1">
            <div class="card ml-1 mr-1 shadow-success">
              <div class="card-header p-1 px-3 mb-0">
                 <p class="mt-1 mb-0 float-start">${instance_session}</p>
                <a href="/manager/instance/${instance.key}" class="float-end text-decoration-none text-white">
                  <i class="bi bi-gear cursor-pointer fs-5"></i>
                </a>
                <span class="me-4 float-end text-decoration-none text-danger" onclick="deleteInstance('${instance.key}','${instance.name}')">
                  <i class="bi bi-trash cursor-pointer fs-5"></i>
                </span>
              </div>
              <div class="card-body mt-0 px-2 pb-2">
                <div class="mt-0 mb-0 p-0 d-flex justify-content-center">
                  <strong class="h4 text-white ">${instance.name}</strong>
                </div>
                  <hr class="bg-white">
                <div class="row">
                  <div class="col-9">
                      <div class="text-white me-2 fs-7"> 
                        <strong>Telefone: <b>${instance?.instance_session?.user?.id ? instance.instance_session.user.id : ''}</b></strong><br> 
                        <strong>Última sincronização: <b> ${instance?.instance_session?.last_sync ? instance.instance_session.last_sync : ''}</b></strong> <br> 
                        <strong>Uptime: <b>${instance?.instance_session?.uptime ? instance.instance_session.uptime : ''}</b></strong>
                      </div>
                  </div>
                  <div class="col-3">
                  `;

        if (instance?.instance_session && instance.instance_session?.user && instance.instance_session.user?.profile_img) {
          html_instances_list += `
                    <span class="b-avatar rounded mb-2 text-end" style="width: 70px; height: 70px;">
                      <span class="b-avatar-img">
                        <img src="${instance.instance_session.user?.profile_img}" class="rounded shadow-success" alt="avatar" style="width: 70px; height: 70px;">
                      </span>
                    </span>
                    `;
        }

        html_instances_list += `
                  </div>                  
                </div>  
                <div class="mt-2">
                  <strong class="text-white me-2 fs-7">Key:</strong>
                  <div class="input-group">
                    <input class="form-control form-control-default bg-transparent input-text-dark" 
                          id="key-instance-${instance.key}" type="password" value="${instance.key}">
                    <span class="input-group-text cursor-pointer toggle-key-instance" data-key="${instance.key}">
                      <i class="bi bi-eye-slash"></i>
                    </span>
                     <span class="input-group-text cursor-pointer toggle-key-copy" data-key="${instance.key}">
                      <i class="bi bi-copy"></i>
                    </span>
                  </div>
                </div>
                
                <div class="mt-2">
                  <strong class="text-white me-2 fs-7">Token:</strong>
                  <div class="input-group">
                    <input class="form-control form-control-default bg-transparent input-text-dark" 
                          id="token-${instance.key}" type="password" value="${instance.token}">
                    <span class="input-group-text cursor-pointer toggle-token" data-key="${instance.key}">
                      <i class="bi bi-eye-slash"></i>
                    </span>
                    <span class="input-group-text cursor-pointer toggle-token-copy" data-key="${instance.key}">
                      <i class="bi bi-copy"></i>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `;
        $("#instances_list").append(
          html_instances_list
        );
      }
      )
    }

  }
  ).fail(function (response) {
    swal("Erro!", response.responseJSON.message, "error")
  }).always(function () {
    Commons.loading.hide();
  });
}

$(document).ready(function () {
  // Delegando o evento ao `document`
  $(document).on('click', '.toggle-token', function () {

    const instanceKey = $(this).data('key');
    // alterar o type para text ou password conforme o estado atual
    if ($(`#token-${instanceKey}`).attr('type') == 'text') {
      $(`#token-${instanceKey}`).attr('type', 'password');
      $(this).html('<i class="bi bi-eye-slash"></i>');
    } else {
      $(`#token-${instanceKey}`).attr('type', 'text');
      $(this).html('<i class="bi bi-eye"></i>');
    }
  });

  $(document).on('click', '.toggle-key-instance', function () {

    const instanceKey = $(this).data('key');
    // alterar o type para text ou password conforme o estado atual
    if ($(`#key-instance-${instanceKey}`).attr('type') == 'text') {
      $(`#key-instance-${instanceKey}`).attr('type', 'password');
      $(this).html('<i class="bi bi-eye-slash"></i>');
    } else {
      $(`#key-instance-${instanceKey}`).attr('type', 'text');
      $(this).html('<i class="bi bi-eye"></i>');
    }
  });

  // toggle-key-copy
  $(document).on('click', '.toggle-key-copy', function () {
    const instanceKey = $(this).data('key');
    const copyText = $(`#key-instance-${instanceKey}`).val();

    // Cria um elemento textarea temporário
    const tempTextArea = document.createElement('textarea');
    tempTextArea.value = copyText;
    document.body.appendChild(tempTextArea);

    // Seleciona e copia o texto
    tempTextArea.select();
    tempTextArea.setSelectionRange(0, 99999);
    document.execCommand('copy');

    // Remove o elemento temporário
    document.body.removeChild(tempTextArea);

    toastAlert("Key copiada com sucesso");
  });

  // toggle-token-copy
  $(document).on('click', '.toggle-token-copy', function () {
    const instanceKey = $(this).data('key');
    const copyText = $(`#token-${instanceKey}`).val();

    // Cria um elemento textarea temporário
    const tempTextArea = document.createElement('textarea');
    tempTextArea.value = copyText;
    document.body.appendChild(tempTextArea);

    // Seleciona e copia o texto
    tempTextArea.select();
    tempTextArea.setSelectionRange(0, 99999);
    document.execCommand('copy');

    // Remove o elemento temporário
    document.body.removeChild(tempTextArea);

    toastAlert("token copiada com sucesso");
  });

});

setTimeout(listInstances, 200); // 1s