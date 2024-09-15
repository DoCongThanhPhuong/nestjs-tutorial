import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CreateRoleDto, RoleItemDto, RoleResponseDto } from './dto';
import { RolesService } from './roles.service';

@ApiTags('Roles')
@ApiBearerAuth()
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @ApiOperation({ summary: 'Create new role' })
  @ApiCreatedResponse({ type: RoleResponseDto })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createRoleDto: CreateRoleDto): Promise<RoleResponseDto> {
    return this.rolesService.createRole(createRoleDto);
  }

  @ApiOperation({ summary: 'List all roles' })
  @ApiOkResponse({ type: [RoleItemDto] })
  @Get()
  findAll(): Promise<RoleItemDto[]> {
    return this.rolesService.listAllRoles();
  }

  @ApiOperation({ summary: 'View role details' })
  @ApiOkResponse({ type: RoleResponseDto })
  @Get(':id')
  findOne(@Param('id') id: number): Promise<RoleResponseDto> {
    return this.rolesService.findRoleByIdWithCache(id);
  }

  @ApiOperation({ summary: 'Update role by id' })
  @ApiOkResponse({ type: RoleResponseDto })
  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() updateRoleDto: CreateRoleDto,
  ): Promise<RoleResponseDto> {
    return this.rolesService.updateRole(id, updateRoleDto);
  }

  @ApiOperation({ summary: 'Delete role by id' })
  @ApiOkResponse()
  @Delete(':id')
  removeById(@Param('id') id: number): Promise<void> {
    return this.rolesService.deleteRole(id);
  }
}
