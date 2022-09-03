const PROXY_CONFIG = [
  {
    context: [
      "/authnz-service",
      "/creation-service",
      "/rendering-service",
      "/messaging-service",
      "/automation-service",
      "/workflow-service",
    ],
    target: "https://india.yoroflow.com/",
    secure: true,
    changeOrigin: true,
    logLevel: "info",
    bypass: function (req, res, proxyOptions) {
      req.headers["origin"] = "https://india.yoroflow.com/";
    },
  }
];

module.exports = PROXY_CONFIG;