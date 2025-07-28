import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { User } from '../common/data-entities/user';
import { UserRepository } from './user-repository.interface';

@Injectable()
export class MysqlUserRepository implements UserRepository {
    constructor(
        @InjectRepository(User)
        private readonly repository: Repository<User>,
    ) {}

    async findByEmail(email: string): Promise<User | null> {
        return await this.repository.findOne({ where: { email } });
    }

    async findOne(id: string): Promise<User | null> {
        return await this.repository.findOne({ where: { id } });
    }

    async create(user: Partial<User>, entityManager?: EntityManager): Promise<User> {
        const repo = entityManager ? entityManager.getRepository(User) : this.repository;
        const newUser = repo.create(user);
        return await repo.save(newUser);
    }

    async update(id: string, user: Partial<User>): Promise<User | null> {
        await this.repository.update(id, user);
        return await this.findOne(id);
    }
}
