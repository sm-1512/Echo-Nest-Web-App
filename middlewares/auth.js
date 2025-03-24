import { validateToken } from "../services/authentication.js";

function checkForAuthenticationCookie(cookieName) {
  return (req, res, next) => {
    const tokenCookieValue = req.cookies[cookieName];
    if (!tokenCookieValue) {
      return next();
    }

    try {
      const userPayLoad = validateToken(tokenCookieValue);
      req.user = userPayLoad;
    } catch (error) {}
    return next();
  };
}

export {
    checkForAuthenticationCookie,
}