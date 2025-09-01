import Joi from "joi";
import { messages } from "joi-translation-pt-br";

const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

const schema = Joi.object()
  .keys({
    fullname: Joi.string().min(6).max(50).required().label("Nome"),
    email: Joi.string()
      .email({ minDomainSegments: 2, tlds: true })
      .required()
      .pattern(emailPattern)
      .label("Email")
      .messages({
        "string.pattern.base":
          "{{#label}} com valor {:[.]} não confere com o padrão requerido.",
      }),
    password: Joi.string().min(6).max(80).required().label("Senha"),
    passwordConfirm: Joi.any()
      .when("password", {
        is: Joi.exist(),
        then: Joi.string()
          .valid(Joi.ref("password"))
          .required()
          .label("Confirmação da senha"),
      })
      .label("Confirmação da senha")
      .messages({ "any.only": "{{#label}} deve ser igual a senha." }),
  })
  .options(
    { messages },
    {
      errors: {
        wrap: {
          label: "",
        },
      },
    }
  )
  .with("password", "passwordConfirm");

export default schema;
