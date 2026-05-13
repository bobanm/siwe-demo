import { BaseEntity, Column, Entity, PrimaryColumn } from 'typeorm'

@Entity()
export class Account extends BaseEntity {
	@PrimaryColumn()
	address!: string

	@Column({ nullable: true, unique: true })
	username!: string

	@Column({ nullable: true })
	bio!: string

	static async findOrCreate(address: string): Promise<Account> {

		let account = await Account.findOneBy({ address })

		if (!account) {
			account = new Account()
			account.address = address
			await account.save()
		}

		return account
	}
}
