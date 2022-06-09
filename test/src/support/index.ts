import 'regenerator-runtime/runtime';
import { setAuthCommands } from '../api/auth/auth-commands';
import { setProjectCommands } from '../api/project/project-commands';
import { setExpectCommands } from '../api/expect-commands';
import { setRecipientCommands } from '@household/test/api/recipient/recipient-commands';
import { setAccountCommands } from '@household/test/api/account/account-commands';
import { setCategoryCommands } from '@household/test/api/category/category-commands';

setProjectCommands();
setRecipientCommands();
setAccountCommands();
setCategoryCommands();
setAuthCommands();
setExpectCommands();
