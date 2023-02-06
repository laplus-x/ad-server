module.exports = {
  api_server_port: 5000,
  api_server_domain: "http://localhost:5000",
  api_server_secret: "",
  
  user_auth_domain: "http://localhost:4000",
  
  dbhost: "localhost:27017",
  dboptions: {
    user: '',
    pass: '',
    authSource: 'admin',
  },
  REDIS_CLUSTER: [
    {
      host: "localhost",
      port: 7000,
    },
    {
      host: "localhost",
      port: 7001,
    },
    {
      host: "localhost",
      port: 7002,
    },
  ],
  REDIS_CLUSTER_OPTIONS: {
    scaleReads: "all",
    showFriendlyErrorStack: true,
  },
  sessionSecret: "",
  cookieSecret: "",
};
