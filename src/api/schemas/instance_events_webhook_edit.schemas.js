import Joi from "joi";
import { messages } from "joi-translation-pt-br";

const schema = Joi.object()
  .keys({
    events: Joi.array().items(Joi.string().min(3).max(60)).required().label("Eventos"),
    // webhookBase64 boolean
    wehbhookBase64: Joi.boolean().required().label("Webhook Base64"),
    webhookUrl: Joi.string().uri({
      scheme: ['http', 'https'], // aceita apenas esses esquemas
      allowRelative: false,      // não permite URLs relativas
      relativeOnly: false,
    }).min(3).max(200).required().label("URL da Webhook"),
    wehbhookStatus: Joi.boolean().required().label("Status"),
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
