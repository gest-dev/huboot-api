// module imports
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { addMinutes } = require('date-fns');
// schemas
const schemaLogin = require("../schemas/login.schemas");
const schemaRegister = require("../schemas/registrer.schemas");

// models
const User = require("../models/User.model");
const InvalidToken = require("../models/InvalidToken.model");
// class
const AuthAccessToken = require('../class/authAccessToken')

exports.loginIndex = async (req, res) => {
  // veririca se existe token no cookie se exisitr joga para a tela de dashboard
  if (req?.cookies?.tokenApiMultiDevice) {
    return res.redirect('/manager');
  }
  const users = await User.find();
  if (users.length == 0) {
    return res.redirect('/auth/register');
  } else {
    return res.render('auth/login', { error: req.flash('error'), success: req.flash('success') });
  }

}
exports.login = async (req, res) => {
  try {

    const { error, value } = schemaLogin.validate(req.body, {
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

    const { email, password, securityCode } = req.body;

    // check if user exists
    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(404).json(
        {
          message: "E-mail e/ou senha inválido(s).",
          errors: {
            email: ["E-mail e/ou senha inválido(s)."],
          },
        }
      );
    }


    if (user.blockAccess) {
      return res.status(404).json(
        {
          message: "Usuário bloqueado.",
          errors: {
            email: ["Usuário bloqueado."],
          },
        }
      );
    }

    // check if password match
    const checkPassword = await bcrypt.compare(password, user.password);

    if (!checkPassword) {
      return res
        .status(422)
        .json({
          message: "E-mail e/ou senha inválido(s).",
          errors: {
            email: ["E-mail e/ou senha inválido(s)."],
          },
        });

    }

    // criar token
    let token = await AuthAccessToken.generateAccessTokenAuth(user);

    user.lastAuthToken = token;
    user.lastAuthDate = new Date();

    const timeLimitLogin = 15;
    const currentDate = new Date();
    const fifteenMinutesLater = addMinutes(currentDate, timeLimitLogin);
    user.lastAccessAt = fifteenMinutesLater;

    await user.save();
    res.status(200).json({
      message: "Autenticação realizada com sucesso!",
      token,
    });
  } catch (error) {

    res.status(422).json({
      message: "E-mail e/ou senha inválido(s).",
      errors: {
        email: ["E-mail e/ou senha inválido(s)."],
      },
    });
  }
};

exports.logout = async (req, res) => {
  try {
    // Invalidating token
    const blackList = new InvalidToken({
      token: req.token,
    })
    blackList.save();

    res.status(200).json({
      message: "Logout realizado com sucesso!",
    });
  } catch (error) {
    res.status(422).json({
      message: "Erro ao tentar sair do sistema.",
    });
  }
};

exports.registerIndex = async (req, res) => {
  // AUTH_REGISTER_MORE
  const users = await User.find();
  if (process.env.AUTH_REGISTER_MORE == 'true' || users.length == 0) {
    return res.render('auth/register', { error: req.flash('error'), success: req.flash('success') });
  } else {
    if (users.length > 0) {
      return res.redirect('/auth/login');
    }
  }

}
exports.register = async (req, res) => {
  try {

    const { error, value } = schemaRegister.validate(req.body, {
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

    // AUTH_REGISTER_MORE
    if (process.env.AUTH_REGISTER_MORE == 'false') {
      // verifica se ja existe algum suauario e se existir não permite cadastrar novos
      const users = await User.find();
      if (users.length > 0) {
        return res.status(404).json(
          {
            message: "Não é permitido cadastrar novos usuários.",
            errors: {
              email: ["Não é permitido cadastrar novos usuários."],
            },
          }
        );
      }
    }
    const { fullname, email, password } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email: email });
    if (userExists) {
      return res.status(404).json(
        {
          message: "E-mail já cadastrado.",
          errors: {
            email: ["E-mail já cadastrado."],
          },
        }
      );
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    const timeLimitLogin = 15;
    const currentDate = new Date();
    const fifteenMinutesLater = addMinutes(currentDate, timeLimitLogin);


    const user = new User({
      fullname,
      email,
      status: "active",
      avatar: null,
      blockAccess: false,
      password: passwordHash,
      lastAccessAt: fifteenMinutesLater,
      lastAuthDate: currentDate,
    });
    await user.save();
    const savedUser = await User.findOne({ email: email });
    let token = await AuthAccessToken.generateAccessTokenAuth(savedUser);

    savedUser.lastAuthToken = token;
    await savedUser.save();

    res.status(201).json({
      message: "Usuário criado com sucesso!",
      token
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Houve um erro no servidor, tente novamente mais tarde!",
    });
  }
};

