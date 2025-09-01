import GroupsModel from '../models/Groups.model.js';

async function create(req, res) {
    const data = await WhatsAppInstances[req.query.key].createNewGroup(
        req.body.name,
        req.body.users
    )
    return res.status(201).json({ error: false, data: data })
}

async function addNewParticipant(req, res) {

    const data = await WhatsAppInstances[req.query.key].addNewParticipant(
        req.body.id,
        req.body.users
    )
    return res.status(201).json({ error: false, data: data })
}

async function makeAdmin(req, res) {
    const data = await WhatsAppInstances[req.query.key].makeAdmin(
        req.body.id,
        req.body.users
    )
    return res.status(201).json({ error: false, data: data })
}

async function demoteAdmin(req, res) {
    const data = await WhatsAppInstances[req.query.key].demoteAdmin(
        req.body.id,
        req.body.users
    )
    return res.status(201).json({ error: false, data: data })
}

async function listAll(req, res) {
    const data = await WhatsAppInstances[req.query.key].getAllGroups(
        req.query.key
    )
    return res.status(201).json({ error: false, data: data })
}

async function leaveGroup(req, res) {
    const data = await WhatsAppInstances[req.query.key].leaveGroup(req.query.id)
    return res.status(201).json({ error: false, data: data })
}

async function getInviteCodeGroup(req, res) {
    const data = await WhatsAppInstances[req.query.key].getInviteCodeGroup(
        req.query.id
    )
    return res
        .status(201)
        .json({ error: false, link: 'https://chat.whatsapp.com/' + data })
}

async function getInstanceInviteCodeGroup(req, res) {
    const data = await WhatsAppInstances[
        req.query.key
    ].getInstanceInviteCodeGroup(req.query.id)
    return res
        .status(201)
        .json({ error: false, link: 'https://chat.whatsapp.com/' + data })
}

async function getAllGroups(req, res) {
    const instance = WhatsAppInstances[req.query.key]
    let data
    try {
        data = await instance.groupFetchAllParticipating()
    } catch (error) {
        data = {}
    }
    return res.json({
        error: false,
        message: 'Instance fetched successfully',
        instance_data: data,
    })
}

async function getAllGroupsDatabase(req, res) {
    const instance = req.query?.key
    let data = []
    try {
        data = await GroupsModel.find({ instance: instance })
    } catch (error) {
        data = []
    }
    return res.json({
        error: false,
        message: 'Instance fetched successfully',
        groupsDatabase: data,
    })
}

async function groupParticipantsUpdate(req, res) {
    const data = await WhatsAppInstances[req.query.key].groupParticipantsUpdate(
        req.body.id,
        req.body.users,
        req.body.action
    )
    return res.status(201).json({ error: false, data: data })
}

async function groupSettingUpdate(req, res) {
    const data = await WhatsAppInstances[req.query.key].groupSettingUpdate(
        req.body.id,
        req.body.action
    )
    return res.status(201).json({ error: false, data: data })
}

async function groupUpdateSubject(req, res) {
    const data = await WhatsAppInstances[req.query.key].groupUpdateSubject(
        req.body.id,
        req.body.subject
    )
    return res.status(201).json({ error: false, data: data })
}

async function groupUpdateDescription(req, res) {
    const data = await WhatsAppInstances[req.query.key].groupUpdateDescription(
        req.body.id,
        req.body.description
    )
    return res.status(201).json({ error: false, data: data })
}

async function groupInviteInfo(req, res) {
    const data = await WhatsAppInstances[req.query.key].groupGetInviteInfo(
        req.body.code
    )
    return res.status(201).json({ error: false, data: data })
}

async function groupJoin(req, res) {
    const data = await WhatsAppInstances[req.query.key].groupAcceptInvite(
        req.body.code
    )
    return res.status(201).json({ error: false, data: data })
}

export default {
    create,
    addNewParticipant,
    makeAdmin,
    demoteAdmin,
    listAll,
    leaveGroup,
    getInviteCodeGroup,
    getInstanceInviteCodeGroup,
    getAllGroups,
    getAllGroupsDatabase,
    groupParticipantsUpdate,
    groupSettingUpdate,
    groupUpdateSubject,
    groupUpdateDescription,
    groupInviteInfo,
    groupJoin
}