import 'regenerator-runtime/runtime';
import { setAuthCommands } from '../api/auth/auth-commands';
import { setProjectCommands } from '../api/project/project-commands';
import { setExpectCommands } from '../api/expect-commands';
import { setRecipientCommands } from '@household/test/api/recipient/recipient-commands';
import { setAccountCommands } from '@household/test/api/account/account-commands';
import { setCategoryCommands } from '@household/test/api/category/category-commands';
import { setTransactionCommands } from '@household/test/api/transaction/transaction-commands';
import { setProductCommands } from '@household/test/api/product/product-commands';

setProjectCommands();
setProductCommands();
setRecipientCommands();
setAccountCommands();
setCategoryCommands();
setTransactionCommands();
setAuthCommands();
setExpectCommands();
