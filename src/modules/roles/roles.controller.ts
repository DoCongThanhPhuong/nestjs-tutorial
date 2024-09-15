import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateRoleDto } from './dto';
import { RolesService } from './roles.service';

@ApiTags('roles')
@ApiBearerAuth()
@Controller('roles')
export class RolesController {
  constructor(private rolesService: RolesService) {}
  @Post()
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.createRole(createRoleDto);
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.rolesService.findRoleById(id);
  }

  @Get()
  findAll() {
    return this.rolesService.listAllRoles();
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() updateRoleDto: CreateRoleDto) {
    return this.rolesService.updateRole(id, updateRoleDto);
  }

  @Delete(':id')
  removeById(@Param('id') id: number) {
    return this.rolesService.deleteRole(id);
  }
}
