

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

///////////Funções base////////////////
var instanceInitTemp = null;
async function instanceInit(key) {
  let token = await $.cookie("tokenApiMultiDevice");
  await $.ajax({
    url: '/instance/init?key=' + key,
    type: 'GET',
    headers: {
      "Authorization": "Bearer " + token,
      "Accept": "application/json",
      "Content-Type": "application/json"
    },
    beforeSend: function () {

    }
  }).done(function (returnData) {

    instanceInitTemp = returnData.InstanceInfoWp;
  }).fail(function (response) {
    swal("Erro!", response.responseJSON.message, "error")
  }).always(function () {
    //Commons.loading.hide();
  });
  return instanceInitTemp;
}

var instanceQrbase64Temp = null;
async function instanceQrbase64(key) {
  let token = await $.cookie("tokenApiMultiDevice");
  $.ajax({
    url: '/instance/qrbase64?key=' + key,
    type: 'GET',
    headers: {
      "Authorization": "Bearer " + token,
      "Accept": "application/json",
      "Content-Type": "application/json"
    },
    beforeSend: function () {
    }
  }).done(function (returnData) {
    //swal("Sucesso!", "QRCode gerado com sucesso", "success")
    $("#qrcodeSrc").attr("src", returnData.qrcode);
    $("#qrcodeDiv").show();
  }).fail(function (response) {
    swal("Erro!", response.responseJSON.message, "error")
  }).always(function () {
    //Commons.loading.hide();
  });
}

var instanceInfoTemp = null;
async function instanceInfo(key) {
  let token = await $.cookie("tokenApiMultiDevice");

  await $.ajax({
    url: '/instance/info?key=' + key,
    type: 'GET',
    headers: {
      "Authorization": "Bearer " + token,
      "Accept": "application/json",
      "Content-Type": "application/json"
    },
    beforeSend: function () {
    }
  }).done(function (returnData) {
    //swal("Sucesso!", "QRCode gerado com sucesso", "success")
    instanceInfoTemp = returnData.instance_data;
  }).fail(function (response) {
    swal("Erro!", response.responseJSON.message, "error")
  }).always(function () {
    //Commons.loading.hide();
  });
  return instanceInfoTemp;
}

var instanceRestoreTemp = null;
async function instanceRestore(key) {
  let token = await $.cookie("tokenApiMultiDevice");
  await $.ajax({
    url: '/instance/restore?key=' + key,
    type: 'GET',
    headers: {
      "Authorization": "Bearer " + token,
      "Accept": "application/json",
      "Content-Type": "application/json"
    },
    beforeSend: function () {

    }
  }).done(function (returnData) {

    instanceRestoreTemp = returnData.data;
  }).fail(function (response) {
    swal("Erro!", response.responseJSON.message, "error")
  }).always(function () {
    //Commons.loading.hide();
  });
  return instanceRestoreTemp;
}

var instanceLogoutTemp = null;
async function instanceLogout(key) {
  let token = await $.cookie("tokenApiMultiDevice");
  await $.ajax({
    url: '/instance/logout?key=' + key,
    type: 'DELETE',
    headers: {
      "Authorization": "Bearer " + token,
      "Accept": "application/json",
      "Content-Type": "application/json"
    },
    beforeSend: function () {

    }
  }).done(function (returnData) {

    instanceLogoutTemp = !returnData.error;
  }).fail(function (response) {
    instanceLogoutTemp = false;
    swal("Erro!", response.responseJSON.message, "error")
  }).always(function () {
    //Commons.loading.hide();
  });
  return instanceLogoutTemp;
}

var instanceDeleteTemp = null;
async function instanceDelete(key) {
  let token = await $.cookie("tokenApiMultiDevice");
  await $.ajax({
    url: '/instance/delete?key=' + key,
    type: 'DELETE',
    headers: {
      "Authorization": "Bearer " + token,
      "Accept": "application/json",
      "Content-Type": "application/json"
    },
    beforeSend: function () {

    }
  }).done(function (returnData) {
    // se vem error falso então deu certo pode por true
    instanceDeleteTemp = !returnData.error;
  }).fail(function (response) {
    instanceDeleteTemp = false;
    swal("Erro!", response.responseJSON.message, "error")
  }).always(function () {
    //Commons.loading.hide();
  });
  return instanceDeleteTemp;
}

///////////Funções de busca e valdiação ////////////////
/** 
 * Função para pegar o qr code da instância
 * @param {string} key
 * @returns {void}
 * @description Essa função é responsável por pegar o qr code da instância
*/

var intervalVerify = null;
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function getInstanceQr(key) {
  if (intervalVerify) {
    clearInterval(intervalVerify);
  }
  //Commons.loading.show("Carregando instâncias");
  // desativa o botão com id idGetInstanceQr e mostra o span idGetInstanceQrSpinner
  $('#idGetInstanceQr').prop('disabled', true);
  $('#idGetInstanceQrSpinner').show();

  // verificamos se ja existe uma sessão ativa
  let instanceInfoData = await instanceInfo(key);
  if (instanceInfoData.instance_session && instanceInfoData.instance_session.phone_connected) {
    swal("Erro!", "Instância já iniciada", "error")
    $('#idGetInstanceQr').prop('disabled', false);
    $('#idGetInstanceQrSpinner').hide();
    return;
  }
  // Pausa de 2 segundos antes de chamar instanceInit
  await delay(1000);
  let instanceInitTemp = await instanceInit(key);
  if (!instanceInitTemp) {
    swal("Erro!", "Erro ao iniciar instância", "error")
    $('#idGetInstanceQr').prop('disabled', false);
    $('#idGetInstanceQrSpinner').hide();
    return;
  }
  // Pausa de 2 segundos antes de chamar instanceInit
  await delay(1000);
  // // terceiro pegamos o qr code
  await instanceQrbase64(key);

  // setintervalo para verificar se a instância foi iniciada 
  intervalVerify = setInterval(async function () {
    let instanceInfoData = await instanceInfo(key);
    if (instanceInfoData.instance_session && instanceInfoData.instance_session.phone_connected) {
      clearInterval(intervalVerify);
      //faz um relaod na pagina
      location.reload();
    }
  }, 5000);

  $('#idGetInstanceQr').prop('disabled', false);
  $('#idGetInstanceQrSpinner').hide();

}


/** 
 * Função para dar reload na pagina
 * @param {string} key
 * @returns {void}
 */
async function refreshInstance(key) {
  // relaod pagina
  location.reload();
}

//restoreInstance
async function restoreInstanceVerify(key) {
  $('#idRestoreInstance').prop('disabled', true);
  $('#idRestoreInstanceSpinner').show();

  // primeiro vamos iniciar a instância
  let instanceInitTemp = await instanceInit(key);
  if (!instanceInitTemp) {
    swal("Erro!", "Erro ao iniciar instância", "error")
    return;
  }
  await delay(1000);
  // restaurar instância
  let instanceRestoreTemp = await instanceRestore(key);
  if (!instanceRestoreTemp || instanceRestoreTemp.length == 0) {
    swal("Erro!", "Erro ao restaurar instância", "error")
    return;
  }
  await delay(1000);
  $('#idRestoreInstance').prop('disabled', false);
  $('#idRestoreInstanceSpinner').hide();
  refreshInstance(key);
}

//disconnectInstance
async function disconnectInstance(key) {
  $('#idDisconnectInstance').prop('disabled', true);
  $('#idDisconnectInstanceSpinner').show();


  // verificamos se existe uma sessão ativa
  let instanceInfoData = await instanceInfo(key);
  if (!instanceInfoData.instance_session || !instanceInfoData.instance_session.phone_connected) {
    swal("Erro!", "Não existe Instância ativa", "error")
    $('#idGetInstanceQr').prop('disabled', false);
    $('#idGetInstanceQrSpinner').hide();
    return;
  }

  await delay(1000);
  //vamso agora sair da sessão logout instanceLogout()
  let instanceLogoutTemp = await instanceLogout(key);
  if (!instanceLogoutTemp) {
    swal("Erro!", "Erro ao fazer Logout instância", "error")
    return;
  }
  await delay(2000);
  //delete instance chat bd
  let instanceDeleteTemp = await instanceDelete(key);
  if (!instanceDeleteTemp) {
    swal("Erro!", "Erro ao deletar chat histórico de instância", "error")
    return;
  }

  $('#idDisconnectInstance').prop('disabled', false);
  $('#idDisconnectInstanceSpinner').hide();

  refreshInstance(key);
}
