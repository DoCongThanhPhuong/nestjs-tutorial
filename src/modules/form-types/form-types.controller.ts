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
  CreateFormTypeDto,
  FormTypeResponseDto,
  UpdateFormTypeDto,
} from './dto';
import { FormTypesService } from './form-types.service';

@ApiTags('Form types')
@ApiBearerAuth()
@Controller('form-types')
export class FormTypesController {
  constructor(private readonly formTypesService: FormTypesService) {}

  @ApiOperation({ summary: 'Create a form type' })
  @ApiCreatedResponse({ type: FormTypeResponseDto })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() createFormTypeDto: CreateFormTypeDto,
  ): Promise<FormTypeResponseDto> {
    return this.formTypesService.create(createFormTypeDto);
  }

  @ApiOperation({ summary: 'List all form types' })
  @ApiOkResponse({ type: [FormTypeResponseDto] })
  @Get()
  findAll(): Promise<FormTypeResponseDto[]> {
    return this.formTypesService.findAll();
  }

  @ApiOperation({ summary: 'Update form type' })
  @ApiOkResponse({ type: FormTypeResponseDto })
  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() updateFormTypeDto: UpdateFormTypeDto,
  ): Promise<FormTypeResponseDto> {
    return this.formTypesService.update(id, updateFormTypeDto);
  }

  @ApiOperation({ summary: 'Delete form type' })
  @ApiOkResponse()
  @Delete(':id')
  remove(@Param('id') id: number): Promise<void> {
    return this.formTypesService.remove(id);
  }
}
