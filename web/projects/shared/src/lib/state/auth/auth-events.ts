import { UserType } from '@household/shared/enums';
import { Api } from '@household/shared/types/api';
import { Requests } from '@household/shared/types/requests';
import { Responses } from '@household/shared/types/responses';
import { type } from '@ngrx/signals';
import { eventGroup } from '@ngrx/signals/events';

export const authEvents = eventGroup({
  source: 'Auth',
  events: {
    logInInitiated: type<Requests.Login & {
      requiredUserType?: UserType;
    }>(),
    tokensRetrieved: type<Responses.Login>(),
    logInCompleted: type<Responses.Login & {
      userTypes: UserType[]
    }>(),
    confirmUserInitiated: type<Requests.ConfirmUser & Api.User.Email>(),
    confirmUserCompleted: type<void>(),
    logOut: type<void>(),
  },
});

export const authApiEvents = eventGroup({
  source: 'Auth API',
  events: {
    refreshTokenInitiated: type<void>(),
  },
});
