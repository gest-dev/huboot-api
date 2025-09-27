import Joi from "joi";
import { messages } from "joi-translation-pt-br";

const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

const schema = Joi.object()
  .keys({
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
  );

export default schema;
