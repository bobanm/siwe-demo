import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
export class Post extends BaseEntity {
	@PrimaryGeneratedColumn()
	id!: number

	@Column()
	address!: string

	@Column()
	timestamp!: number

	@Column()
	content!: string
}
