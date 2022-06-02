import 'regenerator-runtime/runtime';
import { setAuthCommands } from '../api/auth/auth-commands';
// import { setMatchCommands } from '../api/match/match-commands';
import { setProjectCommands } from '../api/project/project-commands';
// import { setTournamentCommands } from '../api/tournament/tournament-commands';
// import { setCommonCommands } from '../api/common-commands';
import { setExpectCommands } from '../api/expect-commands';
// import { setBettingCommands } from '../api/betting/betting-commands';

setProjectCommands();
setAuthCommands();
// setMatchCommands();
// setTeamCommands();
// setTournamentCommands();
// setCommonCommands();
setExpectCommands();
// setBettingCommands();
