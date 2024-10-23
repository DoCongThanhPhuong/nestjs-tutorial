import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateUserCode1729629910852 implements MigrationInterface {
    name = 'UpdateUserCode1729629910852'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`code\` \`code\` varchar(255) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`code\` \`code\` varchar(255) NOT NULL`);
    }

}
