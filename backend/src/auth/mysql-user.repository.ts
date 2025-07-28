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

    async findByEmail(email: string, entityManager?: EntityManager): Promise<User | null> {
        const repo = entityManager ? entityManager.getRepository(User) : this.repository;
        return await repo.findOne({ 
            where: { email },
            relations: ['household']
        });
    }

    async findByHouseholdId(householdId: string, entityManager?: EntityManager): Promise<User[]> {
        const repo = entityManager ? entityManager.getRepository(User) : this.repository;
        return await repo.find({ where: { householdId } });
    }

    async findOne(id: string, entityManager?: EntityManager): Promise<User | null> {
        const repo = entityManager ? entityManager.getRepository(User) : this.repository;
        return await repo.findOne({ 
            where: { id },
            relations: ['household']
        });
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
