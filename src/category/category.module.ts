import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from '../common/data-entities/category';
import { MysqlCategoryRepository } from './mysql-category.repository';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';

@Module({
    imports: [
        TypeOrmModule.forFeature([Category])
    ],
    controllers: [CategoryController],
    providers: [
        CategoryService,
        {
            provide: 'CategoryRepository',
            useClass: MysqlCategoryRepository
        }
    ],
    exports: [CategoryService]
})
export class CategoryModule {}
