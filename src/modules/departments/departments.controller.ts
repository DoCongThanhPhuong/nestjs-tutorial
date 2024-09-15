import { Controller, Get, Param, Patch, Query, Request } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { PaginationResponse, PaginationResponseDto } from 'src/common/dto';
import { CurrentUserId } from 'src/decorators';
import { QueryUserDto, UserItemDto, UserResponseDto } from '../users/dto';
import { UsersService } from '../users/users.service';
import { DepartmentsService } from './departments.service';
import { DepartmentItemDto, DepartmentResponseDto } from './dto';

@ApiTags('Departments')
@ApiBearerAuth()
@Controller('departments')
export class DepartmentsController {
  constructor(
    private readonly departmentsService: DepartmentsService,
    private readonly usersService: UsersService,
  ) {}

  @ApiOperation({ summary: 'List managed departments' })
  @ApiOkResponse({ type: [DepartmentItemDto] })
  @Get()
  listManagedDepartments(
    @CurrentUserId() userId,
  ): Promise<DepartmentItemDto[]> {
    return this.departmentsService.listManagedDepartments(userId);
  }

  @ApiOperation({ summary: 'View a department' })
  @ApiOkResponse({ type: DepartmentResponseDto })
  @Get(':id')
  findOne(
    @Param('id') id: number,
    @CurrentUserId() userId: number,
  ): Promise<DepartmentResponseDto> {
    return this.departmentsService.findDepartmentById(id, userId);
  }

  @ApiOperation({ summary: 'List department employees' })
  @ApiOkResponse({
    type: PaginationResponse(UserItemDto),
  })
  @Get(':departmentId/employees')
  listDepartmentEmployees(
    @Param('departmentId') departmentId: number,
    @Query() query: QueryUserDto,
    @Request() req,
  ): Promise<PaginationResponseDto<UserItemDto>> {
    return this.usersService.listDepartmentEmployees(
      departmentId,
      query,
      req.user,
    );
  }

  @ApiOperation({ summary: 'View employee profile' })
  @ApiOkResponse({ type: UserResponseDto })
  @Get(':departmentId/employees/:employeeId')
  findOneEmployee(
    @Param('departmentId') departmentId: number,
    @Param('employeeId') employeeId: number,
    @CurrentUserId() userId: number,
  ): Promise<UserResponseDto> {
    return this.usersService.managerFindUserById(
      departmentId,
      employeeId,
      userId,
    );
  }

  @ApiOperation({ summary: 'Promote official' })
  @Patch(':departmentId/employees/:employeeId/promote-official')
  promoteToOfficial(
    employeeId: number,
    @CurrentUserId() userId: number,
  ): Promise<void> {
    return this.usersService.promoteToOfficial(employeeId, userId);
  }
}
