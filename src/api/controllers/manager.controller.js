// module imports
const InstancesModel = require("../models/instances.model");
const GroupsModel = require('../models/Groups.model')
const ContactsModel = require('../models/Contacts.model')
const config = require("../../config/config");

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

  return res.render('manager/instance/events/webhook/edit-events-webhook', {
    key: req.params.key,
    InstanceInfo: instanceWp,
    menu: "webhook"

  });
}