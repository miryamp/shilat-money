import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from '../common/data-entities/category';
import { MysqlCategoryRepository } from './mysql-category.repository';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { CATEGORY_REPOSITORY } from './category-repository.interface';

@Module({
    imports: [
        TypeOrmModule.forFeature([Category])
    ],
    controllers: [CategoryController],
    providers: [
        CategoryService,
        {
            provide: CATEGORY_REPOSITORY,
            useClass: MysqlCategoryRepository
        }
    ],
    exports: [CategoryService, CATEGORY_REPOSITORY]
})
export class CategoryModule {}
