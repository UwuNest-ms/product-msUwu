import { Injectable, OnModuleInit,Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaClient } from 'generated/prisma';
import { PaginationDto } from 'src/common';

@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {

  private readonly logger = new Logger('ProductsService');

  onModuleInit() {
    this.$connect();
    this.logger.log('Database conected')
  }
  create(createProductDto: CreateProductDto) {
    return this.product.create({
      data: createProductDto
    })
  }

  async findAll(paginationDto : PaginationDto) {

    const {page, limit } = paginationDto;

    const totalPages = await this.product.count({where : {available : true}});

    return {
      data: await this.product.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where: {
        available:true
      }
    }),
    meta: {
      total : totalPages ,
      page : page
    }
    }
  }

  async findOne(id: number) {
   
    //const product = await this.product.findFirst({
    //  where: {id: id}
    //});

    const product = await this.product.findFirst({
      where: {id: id , available : true}
    });

    if (!product){
      throw new NotFoundException(`No se ha encontrado el producto con ID: ${id}`)
    }
    return product
 
}

  async update(id: number, updateProductDto: UpdateProductDto) {
    const {id:_, ...data } = updateProductDto;

    await this.findOne(id);

    return await this.product.update({
      where: { id },
      data: data,
    });
}


  async remove(id: number) {
    //HARD DELETE
    await this.findOne(id);
//
    //return await this.product.delete({
    //  where: { id }
    //});
    //END HARD DELETE
      const product = await this.product.update({
      where: { id },
      data: {
        available : false
      }
    });
    return product

  }
}
