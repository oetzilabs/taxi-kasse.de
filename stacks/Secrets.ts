export const secret = {
  SECRET_DATABASE_URL: new sst.Secret("DatabaseUrl"),
  SECRET_DATABASE_PROVIDER: new sst.Secret("DatabaseProvider"),
  SECRET_GOOGLE_CLIENT_ID: new sst.Secret("GoogleClientId"),
  SECRET_GOOGLE_CLIENT_SECRET: new sst.Secret("GoogleClientSecret"),
  MAIL_USERNAME: new sst.Secret("MailUsername"),
  MAIL_PASSWORD: new sst.Secret("MailPassword"),
};

export const allSecrets = Object.values(secret);
