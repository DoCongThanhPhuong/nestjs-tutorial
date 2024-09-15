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
import {
  CreatePermissionDto,
  PermissionResponseDto,
  UpdatePermissionDto,
} from './dto';
import { PermissionsService } from './permissions.service';

@ApiTags('Permissions')
@ApiBearerAuth()
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @ApiOperation({ summary: 'List all permissions' })
  @ApiOkResponse({ type: [PermissionResponseDto] })
  @Get()
  findAll(): Promise<PermissionResponseDto[]> {
    return this.permissionsService.listAllPermissions();
  }

  @ApiOperation({ summary: 'Create new permission' })
  @ApiCreatedResponse({ type: PermissionResponseDto })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() createPermissionDto: CreatePermissionDto,
  ): Promise<PermissionResponseDto> {
    return this.permissionsService.createPermission(createPermissionDto);
  }

  @ApiOperation({ summary: 'Update permission by id' })
  @ApiOkResponse({ type: PermissionResponseDto })
  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ): Promise<PermissionResponseDto> {
    return this.permissionsService.updatePermission(id, updatePermissionDto);
  }

  @ApiOperation({ summary: 'Delete permission by id' })
  @ApiOkResponse()
  @Delete(':id')
  delete(@Param('id') id: number): Promise<void> {
    return this.permissionsService.deletePermission(id);
  }
}
