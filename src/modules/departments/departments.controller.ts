import { Controller, Get, Param, Patch, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUserId } from 'src/decorators';
import { UserResponseDto } from '../users/dto';
import { UsersService } from '../users/users.service';
import { DepartmentsService } from './departments.service';
import { DepartmentResponseDto } from './dto';

@ApiTags('departments')
@ApiBearerAuth()
@Controller('departments')
export class DepartmentsController {
  constructor(
    private readonly departmentsService: DepartmentsService,
    private readonly usersService: UsersService,
  ) {}

  @ApiOkResponse({ type: [DepartmentResponseDto] })
  @Get()
  listDepartments(@Request() req) {
    return this.departmentsService.listDepartments(req.user);
  }

  @ApiOkResponse({
    type: [UserResponseDto],
  })
  @Get(':departmentId/users')
  listDepartmentEmployees(
    @Param('departmentId') departmentId: number,
    @Request() req,
  ): Promise<UserResponseDto[]> {
    return this.usersService.listDepartmentEmployees(departmentId, req.user);
  }

  @ApiOkResponse({
    type: [UserResponseDto],
  })
  @Get(':departmentId/users/:employeeId')
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

  @Patch(':departmentId/users/:employeeId/promote-official')
  promoteToOfficial(
    employeeId: number,
    @CurrentUserId() userId: number,
  ): Promise<void> {
    return this.usersService.promoteToOfficial(employeeId, userId);
  }
}
