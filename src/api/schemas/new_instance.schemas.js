import Joi from "joi";
import { messages } from "joi-translation-pt-br";

const schema = Joi.object()
  .keys({
    name: Joi.string().min(3).max(60).required().label("Nome"),
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
