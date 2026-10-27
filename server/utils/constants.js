module.exports = {
  MongoIDPattern: /^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i,
  ROLES: Object.freeze({
    ADMIN: "ADMIN",
    FREELANCER:"FREELANCER",
    OWNER:"OWNER"
  }),
};
