const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const jwt = require("express-jwt");
const jsonwebtoken = require("jsonwebtoken")
const jwksRsa = require("jwks-rsa");
const { requiresAuth, auth } = require("express-openid-connect");
const authConfig = require("./src/auth_config.json");

const app = express();
// const token = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IkpQVWVOOVJrXzRncHlSbHZDd205dCJ9.eyJuaWNrbmFtZSI6ImlraHNhbiIsIm5hbWUiOiJpa2hzYW5Ad2FsbGV4dGVjaC5jb20iLCJwaWN0dXJlIjoiaHR0cHM6Ly9zLmdyYXZhdGFyLmNvbS9hdmF0YXIvZTA4MWE1ZjMwMWRkY2RlYmM3ZTYwZDM3ZmEwZDA1NDI_cz00ODAmcj1wZyZkPWh0dHBzJTNBJTJGJTJGY2RuLmF1dGgwLmNvbSUyRmF2YXRhcnMlMkZpay5wbmciLCJ1cGRhdGVkX2F0IjoiMjAyMi0xMS0wN1QwNzo0ODoxMi4yMTZaIiwiZW1haWwiOiJpa2hzYW5Ad2FsbGV4dGVjaC5jb20iLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsImlzcyI6Imh0dHBzOi8vcm5kLXdhbGxleC51cy5hdXRoMC5jb20vIiwic3ViIjoiYXV0aDB8NjM2MzFiZTYyZjk4ZGE0NWM5YmU4MjRiIiwiYXVkIjoiMHJRalVXV21Vb25JN2M5WnN5bVB0NXRpNXZ3OUZzZjMiLCJpYXQiOjE2Njc4MDczMDAsImV4cCI6MTY2Nzg0MzMwMCwic2lkIjoiSFgyWmluakYteUg5SGU1TXI0WTRHaHcwUFB1QWV5ZTYiLCJub25jZSI6IlJUSjZaRFZtWkg1NGMzcGxSMU13UkZoQ2EyWitla2wrTVMxaU9IZHlTMjB6YWtOcFZtWkpVbGROTmc9PSJ9.sffHK2aUVsGq3MqDDj_i-XS2yqgK6jIO_5iX9sti8QFrtzCqhJHI4Zw78Sk-bmBASxozBehOJRh3g8cRiZ_0K36JddWbcaDMnOfXuSvnZIW-rqVH9njZB_BWExskzY1X3E8zH6ZNbmX4NV9J3R5Y5VRkyBKEAYQBwWnXbAH8K2G1NzGX_7NBOBGWlKWYHFOIgM1oOgNpaGCuBYzyi9WBEZITgyUfV5VWCjFVEgZshY4fpfdGmPNMkfyqfijxt9WKhbisH18AMmiTs_ucYmr7cBjzuLlQUGEp_ugWzHhLQrnE3JzOU44RqHzWo-E7JxTjaS6Lgpd3s_0HeRhr6dbChA';
// const clientJWT = jwksRsa({
//   cache: true,
//   rateLimit: true,
//   jwksRequestsPerMinute: 5,
//   jwksUri: `https://${authConfig.domain}/.well-known/jwks.json`,
// });
// clientJWT.getSigningKey('JPUeN9Rk_4gpyRlvCwm9t', (err, key ) => {
//   console.log("🚀 ~ file: api-server.js ~ line 19 ~ clientJWT.getSigningKey ~ key", key)
//   let verify = jsonwebtoken.verify(token, key.publicKey);
//   console.log("🚀 ~ file: api-server.js ~ line 21 ~ clientJWT.getSigningKey ~ verify", verify)
// });


const port = process.env.API_PORT || 3001;
console.log("🚀 ~ file: api-server.js ~ line 12 ~ port", port);
const appPort = process.env.SERVER_PORT || 3000;
const appOrigin = authConfig.appOrigin || `http://localhost:${appPort}`;

if (
  !authConfig.domain ||
  !authConfig.audience
  // || authConfig.audience === "http://localhost:3001/api/external"
) {
  console.log(
    "Exiting: Please make sure that auth_config.json is in place and populated with valid domain and audience values"
  );

  process.exit();
}

app.use(morgan("dev"));
app.use(helmet());
app.use(cors({ origin: appOrigin }));

const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${authConfig.domain}/.well-known/jwks.json`,
  }),

  audience: authConfig.audience,
  issuer: `https://${authConfig.domain}/`,
  algorithms: ["RS256"],
});

app.get("/api/external", checkJwt, (req, res) => {
  console.log(req, '%o');
  res.send({
    msg: "Your access token was successfully validated!",
  });
});

app.use(
  auth({
    secret: 'ef523914ca0d7ca81fde371862d580c4671f17fe7ac3ccc0e3ebacbdafcb21f2',
    issuerBaseURL: `https://${authConfig.domain}/`,
    baseURL: 'http://localhost:3001',
    clientID: authConfig.clientId,
  })
);

app.get("/profile", requiresAuth(), (req, res) => {
  res.send(JSON.stringify(req.oidc.user));
});

app.listen(port, () => console.log(`API Server listening on port ${port}`));
