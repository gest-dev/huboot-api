import jwt from "jsonwebtoken";
import config from '../../config/config.js';
class AuthAccessToken {
  static generateAccessTokenAuth = async (userData) => {

    const secret = config.auth.SECRET;
    const token = jwt.sign(
      {
        id: userData._id,
      },
      secret,
      { expiresIn: "30d" }
    );
    return token;
  };

  static generateAccessTokenInstance = async (instance) => {

    const secret = config.auth.SECRET;
    const token = jwt.sign(
      {
        key: instance.key,
      },
      secret,
      { expiresIn: "3000d" } // 3000 days total em anos 8.21 anos
    );
    return token;
  };
}

export default AuthAccessToken;
