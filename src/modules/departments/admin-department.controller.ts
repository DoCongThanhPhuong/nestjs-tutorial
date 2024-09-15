import { Body, Controller, Get, Param, Patch, Post, Put } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserResponseDto } from '../users/dto';
import { UsersService } from '../users/users.service';
import { DepartmentsService } from './departments.service';
import {
  CreateDepartmentDto,
  DepartmentResponseDto,
  UpdateDepartmentDto,
} from './dto';

@ApiTags('admin/departments')
@ApiBearerAuth()
@Controller('admin/departments')
export class AdminDepartmentsController {
  constructor(
    private readonly departmentsService: DepartmentsService,
    private readonly usersService: UsersService,
  ) {}

  @ApiOkResponse({ type: DepartmentResponseDto })
  @Get(':id')
  findOne(@Param('id') id: number): Promise<DepartmentResponseDto> {
    return this.departmentsService.findDepartmentById(id);
  }

  @ApiOkResponse({
    type: [UserResponseDto],
  })
  @Get(':departmentId/users')
  listDepartmentEmployees(
    @Param('departmentId') departmentId: number,
  ): Promise<UserResponseDto[]> {
    return this.usersService.listDepartmentEmployees(departmentId);
  }

  @ApiCreatedResponse({ type: DepartmentResponseDto })
  @Post()
  createDepartment(
    @Body() createDepartmentDto: CreateDepartmentDto,
  ): Promise<DepartmentResponseDto> {
    return this.departmentsService.createDepartment(createDepartmentDto);
  }

  @ApiOkResponse({ type: DepartmentResponseDto })
  @Put(':id')
  updateDepartmentById(
    @Param('id') id: number,
    @Body() updateDepartmentDto: UpdateDepartmentDto,
  ) {
    return this.departmentsService.updateDepartmentById(
      id,
      updateDepartmentDto,
    );
  }

  @ApiOkResponse({ type: [DepartmentResponseDto] })
  @Get()
  listAllDepartments(): Promise<DepartmentResponseDto[]> {
    return this.departmentsService.listAllDepartments();
  }

  @Patch('promote-official')
  promoteToOfficial(employeeId: number): Promise<void> {
    return this.usersService.promoteToOfficial(employeeId);
  }
}
