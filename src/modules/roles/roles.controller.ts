import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateRoleDto } from './dto';
import { RolesService } from './roles.service';

@ApiTags('roles')
@ApiBearerAuth()
@Controller('roles')
export class RolesController {
  constructor(private rolesService: RolesService) {}

  @ApiOperation({ summary: 'Create new role' })
  @Post()
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.createRole(createRoleDto);
  }

  @ApiOperation({ summary: 'List all role' })
  @Get()
  findAll() {
    return this.rolesService.listAllRoles();
  }

  @ApiOperation({ summary: 'View role details' })
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.rolesService.findRoleById(id);
  }

  @ApiOperation({ summary: 'Update role by id' })
  @Patch(':id')
  update(@Param('id') id: number, @Body() updateRoleDto: CreateRoleDto) {
    return this.rolesService.updateRole(id, updateRoleDto);
  }

  @ApiOperation({ summary: 'Delete role by id' })
  @Delete(':id')
  removeById(@Param('id') id: number) {
    return this.rolesService.deleteRole(id);
  }
}
