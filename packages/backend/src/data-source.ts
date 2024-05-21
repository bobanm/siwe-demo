import os from 'os'
import path from 'path'
import 'reflect-metadata'
import { DataSource } from 'typeorm'
import { Account } from './entities/account'

export const dataSource = new DataSource({
    type: 'sqlite',
    database: path.join(os.homedir(), 'siwe', 'siwe.sqlite'),
    entities: [Account],
    synchronize: true,
    logging: false,
})
