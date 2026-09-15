import { Api } from '@household/shared/types/api';

export namespace Requests {
  export type Account = Api.Account.Base;
  export type Project = Api.Project.Base;
  export type Recipient = Api.Recipient.Base;
  export type Category = Api.Category.Base & Api.Category.ParentCategoryId;
  export type Product = Api.Product.Base;
  export type File = Api.File.Base;
  export type Setting = Api.Setting.Value;
  export type User = Api.User.Email;
  export type Login = Api.User.Email & Api.Auth.Password & Partial<Api.Auth.RequiredUserType>;
  export type ForgotPassword = Api.User.Email;
  export type ConfirmForgotPassword = Api.Auth.Password & Api.Auth.ConfirmationCode;
  export type ConfirmUser = Api.Auth.Password & Api.Auth.TemporaryPassword;
  export type RefreshToken = Api.Auth.RefreshToken;
}
