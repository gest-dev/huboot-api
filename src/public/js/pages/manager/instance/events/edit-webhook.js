

$(document).ready(function () {
  //webhookEditSave
  $(document).on('click', '#webhookEditSave', async function () {
    const instanceKey = $(this).data('key');
    const wehbhookStatus = $('#wehbhookStatus').is(':checked');
    const wehbhookBase64 = $('#wehbhookBase64').is(':checked');
    const webhookUrl = $('#webhookUrl').val();

    const events = $('#webhookEventsForm input[type="checkbox"]:checked')
      .map(function () {
        return this.value;
      }).get();

    const webhookEditData = {
      wehbhookStatus: wehbhookStatus,
      wehbhookBase64: wehbhookBase64,
      webhookUrl: webhookUrl,
      events: events,
    };

    let token = await $.cookie("tokenApiMultiDevice");
    await $.ajax({
      url: `/manager/instance/${instanceKey}/events/webhook/edit`,
      method: 'PATCH',
      headers: {
        "Authorization": "Bearer " + token,
        "Accept": "application/json",
        "Content-Type": "application/json"
      },
      data: JSON.stringify(webhookEditData),
      beforeSend: function () {
        Commons.loading.show("Autenticando...");
      },
    }).done(async function (data) {
      // sucesso swal
      swal("Sucesso!", "Webhook editado com sucesso", "success");
    }).fail(function (response) {
      swal("Erro!", response.responseJSON.message, "error")
    }).always(function () {
      Commons.loading.hide();
    });

  });



  $(document).on('click', '#webhookEventsFormMarkAll', async function () {
    // vai em todos os checkbox e marca todos #webhookEventsForm input[type="checkbox"]
    $('#webhookEventsForm input[type="checkbox"]').prop('checked', true);
  });

  $(document).on('click', '#webhookEventsFormUnmarkAll', async function () {
    // vai em todos os checkbox e marca todos #webhookEventsForm input[type="checkbox"]
    $('#webhookEventsForm input[type="checkbox"]').prop('checked', false);
  });
});



