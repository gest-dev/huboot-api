// module imports
const InstancesModel = require("../models/instances.model");
const GroupsModel = require('../models/Groups.model')
const ContactsModel = require('../models/Contacts.model')
const InstanceConfigWebhook = require("../models/InstanceConfigWebhook.model");
const config = require("../../config/config");
const schemaInstanceEventsWebhookEdit = require("../schemas/instance_events_webhook_edit.schemas");

exports.instanceIndex = async (req, res) => {

  let key = req.params.key;
  let InstanceInfo = await InstancesModel.findOne({ key: key });

  if (!InstanceInfo) {
    return res.render('manager/instance/edit-Instance',
      {
        key: key,
        InstanceInfo: false,
        menu: "instance"
      }
    );
  }
  const db = mongoClient.db(config.mongoose.dbName);
  const collections = await db.listCollections({ name: key }).toArray();
  const exists = collections.length > 0;
  // total de grupos e total de contatos
  let groupCount = await GroupsModel.countDocuments({ instance: key });
  let contactCount = await ContactsModel.countDocuments({ instance: key });


  let instanceWp = {
    name: InstanceInfo.name,
    key: InstanceInfo.key,
    token: InstanceInfo.token,
    phoneIdConnected: InstanceInfo.phoneIdConnected,
    createdAt: InstanceInfo.createdAt,
    dashboard: {
      groupCount: groupCount,
      contactCount: contactCount,
      messagesSendCount: InstanceInfo.messagesSendCount,
    },
  };
  if (WhatsAppInstances[InstanceInfo.key]) {
    instanceWp['instance_session'] = await WhatsAppInstances[InstanceInfo.key].getInstanceDetail(InstanceInfo.key)
  } else {
    instanceWp['instance_session'] = null
  }
  // verifica se existe uma sessão anterior
  instanceWp['instance_session_previous'] = exists

  return res.render('manager/instance/edit-Instance',
    {
      key: req.params.key,
      InstanceInfo: instanceWp,
      menu: "instance"
    }
  );
}

//WebSocke
exports.instanceEventsWebSocketIndex = async (req, res) => {

  let key = req.params.key;
  let InstanceInfo = await InstancesModel.findOne({ key: key });

  if (!InstanceInfo) {
    return res.render('manager/instance/events/web-socket/edit-events-web-socket', {
      key: key,
      InstanceInfo: false,
      menu: "web-socket"
    });
  }
  const db = mongoClient.db(config.mongoose.dbName);
  const collections = await db.listCollections({ name: key }).toArray();
  const exists = collections.length > 0;
  // total de grupos e total de contatos
  let groupCount = await GroupsModel.countDocuments({ instance: key });
  let contactCount = await ContactsModel.countDocuments({ instance: key });


  let instanceWp = {
    name: InstanceInfo.name,
    key: InstanceInfo.key,
    token: InstanceInfo.token,
    phoneIdConnected: InstanceInfo.phoneIdConnected,
    createdAt: InstanceInfo.createdAt,
    dashboard: {
      groupCount: groupCount,
      contactCount: contactCount,
      messagesSendCount: InstanceInfo.messagesSendCount,
    },
  };
  if (WhatsAppInstances[InstanceInfo.key]) {
    instanceWp['instance_session'] = await WhatsAppInstances[InstanceInfo.key].getInstanceDetail(InstanceInfo.key)
  } else {
    instanceWp['instance_session'] = null
  }
  // verifica se existe uma sessão anterior
  instanceWp['instance_session_previous'] = exists

  return res.render('manager/instance/events/web-socket/edit-events-web-socket', {
    key: req.params.key,
    InstanceInfo: instanceWp,
    menu: "web-socket"
  });
}

//webhook
exports.instanceEventsWebhookIndex = async (req, res) => {

  let key = req.params.key;
  let InstanceInfo = await InstancesModel.findOne({ key: key });

  if (!InstanceInfo) {
    return res.render('manager/instance/events/webhook/edit-events-webhook', {
      key: key,
      InstanceInfo: false,
      menu: "webhook"
    });
  }

  // total de grupos e total de contatos
  let instanceConfigWebhook = await InstanceConfigWebhook.findOne({ instance: key });

  return res.render('manager/instance/events/webhook/edit-events-webhook', {
    key: key,
    InstanceInfo,
    instanceConfigWebhook,
    menu: "webhook"
  });
}

//instanceEventsWebhookEditIndex
exports.instanceEventsWebhookEdit = async (req, res) => {

  try {

    const { error, value } = schemaInstanceEventsWebhookEdit.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      const firstError = error.details[0].message.replaceAll('"', "");
      const allErrors = {};

      error.details.forEach((detail) => {
        const keyText = detail.path[0];
        const errorMessage = detail.message.replaceAll('"', "");

        if (!allErrors[keyText]) {
          allErrors[keyText] = [];
        }
        allErrors[keyText].push(errorMessage);
      });

      return res.status(422).json({
        message: firstError,
        errors: allErrors,
      });
    }

    const { events, wehbhookBase64, wehbhookStatus, webhookUrl } = req.body;

    let instanceConfigWebhook = await InstanceConfigWebhook.findOne({ instance: req.params.key });

    if (!instanceConfigWebhook) {
      instanceConfigWebhook = new InstanceConfigWebhook({
        instance: req.params.key,
        status: wehbhookStatus,
        url: webhookUrl,
        base64: wehbhookBase64,
        events: events,
      });
    } else {
      instanceConfigWebhook.status = wehbhookStatus;
      instanceConfigWebhook.url = webhookUrl;
      instanceConfigWebhook.base64 = wehbhookBase64;
      instanceConfigWebhook.events = events;
    }

    await instanceConfigWebhook.save();

    return res.status(200).json({
      error: false,
      message: 'success',
    });
  } catch (error) {
    return res.status(422).json({
      message: error.message,
      errors: error.errors,
    });
  }

}