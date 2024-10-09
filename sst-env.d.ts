/* This file is auto-generated by SST. Do not edit. */
/* tslint:disable */
/* eslint-disable */
import "sst"
export {}
import "sst"
declare module "sst" {
  export interface Resource {
    "Api": {
      "type": "sst.aws.ApiGatewayV2"
      "url": string
    }
    "Auth": {
      "publicKey": string
      "type": "sst.aws.Auth"
    }
    "AuthAuthenticator": {
      "name": string
      "type": "sst.aws.Function"
      "url": string
    }
    "DatabaseProvider": {
      "type": "sst.sst.Secret"
      "value": string
    }
    "DatabaseUrl": {
      "type": "sst.sst.Secret"
      "value": string
    }
    "GoogleClientId": {
      "type": "sst.sst.Secret"
      "value": string
    }
    "GoogleClientSecret": {
      "type": "sst.sst.Secret"
      "value": string
    }
    "MainEmail": {
      "sender": string
      "type": "sst.aws.Email"
    }
    "RealtimeServer": {
      "authorizer": string
      "endpoint": string
      "type": "sst.aws.Realtime"
    }
    "SolidStartApp": {
      "type": "sst.aws.SolidStart"
      "url": string
    }
  }
}
