import os from 'os'
import path from 'path'
import 'reflect-metadata'
import { DataSource } from 'typeorm'
import { Account } from './entities/account'
import { Post } from './entities/post'

export const dataSource = new DataSource({
    type: 'sqlite',
    database: path.join(os.homedir(), 'siwe', 'siwe.sqlite'),
    entities: [Account, Post],
    synchronize: true,
    logging: false,
})
