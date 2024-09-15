import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UpdatePermissionDto } from './dto';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { PermissionsService } from './permissions.service';

@ApiTags('permissions')
@ApiBearerAuth()
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get()
  findAll() {
    return this.permissionsService.listAllPermissions();
  }

  @Post()
  create(@Body() createPermissionDto: CreatePermissionDto) {
    return this.permissionsService.createPermission(createPermissionDto);
  }

  @Post(':id')
  update(
    @Param() id: number,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ) {
    return this.permissionsService.updatePermission(id, updatePermissionDto);
  }

  @Delete(':id')
  delete(@Param() id: number) {
    return this.permissionsService.deletePermission(id);
  }
}
