import { Controller } from '@nestjs/common';
import { RolesService } from './roles.service';

@Controller({ path: 'roles', version: '1' })
export class RolesController {
  constructor(private rolesService: RolesService) {}
}
