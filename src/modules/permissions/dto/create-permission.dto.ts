import { EMethod } from 'src/constants';

export class CreatePermissionDto {
  name?: string;
  description?: string;
  method?: EMethod;
  path?: string;
}
