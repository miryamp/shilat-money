export interface TransactionalDataSource {
    transaction<T>(runInTransaction: (manager: any) => Promise<T>): Promise<T>;
}
