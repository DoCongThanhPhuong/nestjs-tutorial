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
import { CreatePermissionDto, UpdatePermissionDto } from './dto';
import { PermissionsService } from './permissions.service';

@ApiTags('permissions')
@ApiBearerAuth()
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @ApiOperation({ summary: 'List all permissions' })
  @Get()
  findAll() {
    return this.permissionsService.listAllPermissions();
  }

  @ApiOperation({ summary: 'Create new permission' })
  @Post()
  create(@Body() createPermissionDto: CreatePermissionDto) {
    return this.permissionsService.createPermission(createPermissionDto);
  }

  @ApiOperation({ summary: 'Update permission by id' })
  @Patch(':id')
  update(
    @Param() id: number,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ) {
    return this.permissionsService.updatePermission(id, updatePermissionDto);
  }

  @ApiOperation({ summary: 'Delete permission by id' })
  @Delete(':id')
  delete(@Param() id: number) {
    return this.permissionsService.deletePermission(id);
  }
}
