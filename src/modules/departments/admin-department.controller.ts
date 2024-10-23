import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { PaginationResponse, PaginationResponseDto } from 'src/common/dto';
import { QueryUserDto, UserItemDto } from '../users/dto';
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

  @ApiOperation({ summary: 'Create new department' })
  @ApiCreatedResponse({ type: DepartmentResponseDto })
  @Post()
  createDepartment(
    @Body() createDepartmentDto: CreateDepartmentDto,
  ): Promise<DepartmentResponseDto> {
    return this.departmentsService.createDepartment(createDepartmentDto);
  }

  @ApiOperation({ summary: 'List all departments' })
  @ApiOkResponse({ type: [DepartmentResponseDto] })
  @Get()
  listAll(): Promise<DepartmentResponseDto[]> {
    return this.departmentsService.listAllDepartments();
  }

  @ApiOperation({ summary: 'View department details' })
  @ApiOkResponse({ type: DepartmentResponseDto })
  @Get(':id')
  findOne(@Param('id') id: number): Promise<DepartmentResponseDto> {
    return this.departmentsService.findDepartmentById(id);
  }

  @ApiOperation({ summary: 'Update department' })
  @ApiOkResponse({ type: DepartmentResponseDto })
  @Patch(':id')
  updateById(
    @Param('id') id: number,
    @Body() updateDepartmentDto: UpdateDepartmentDto,
  ) {
    return this.departmentsService.updateDepartmentById(
      id,
      updateDepartmentDto,
    );
  }

  @ApiOperation({ summary: 'Delete department' })
  @ApiOkResponse({ type: DepartmentResponseDto })
  @Delete(':id')
  deleteById(@Param('id') id: number) {
    return this.departmentsService.deleteDepartmentById(id);
  }

  @ApiOperation({ summary: 'List department employees' })
  @ApiOkResponse({
    type: PaginationResponse(UserItemDto),
  })
  @Get(':departmentId/employees')
  listDepartmentEmployees(
    @Param('departmentId') departmentId: number,
    @Query() query: QueryUserDto,
  ): Promise<PaginationResponseDto<UserItemDto>> {
    return this.usersService.listDepartmentEmployees(departmentId, query);
  }
}
