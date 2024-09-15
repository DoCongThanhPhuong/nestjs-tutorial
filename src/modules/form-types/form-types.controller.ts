import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateFormTypeDto, UpdateFormTypeDto } from './dto';
import { FormTypesService } from './form-types.service';

@ApiTags('form-types')
@Controller('form-types')
export class FormTypesController {
  constructor(private readonly formTypesService: FormTypesService) {}

  @Post()
  create(@Body() createFormTypeDto: CreateFormTypeDto) {
    return this.formTypesService.create(createFormTypeDto);
  }

  @Get()
  findAll() {
    return this.formTypesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.formTypesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() updateFormTypeDto: UpdateFormTypeDto,
  ) {
    return this.formTypesService.update(id, updateFormTypeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.formTypesService.remove(id);
  }
}
