import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Responses } from '@household/shared/types/responses';
import { default as project } from '@household/test/schemas/project-response';

const schema: StrictJSONSchema7<Responses.Project[]> = {
  type: 'array',
  items: project,
};

export default schema;
