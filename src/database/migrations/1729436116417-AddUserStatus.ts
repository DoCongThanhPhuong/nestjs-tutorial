import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserStatus1729436116417 implements MigrationInterface {
    name = 'AddUserStatus1729436116417'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`deleted_at\` \`status\` datetime(6) NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`status\``);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`status\` enum ('ACTIVE', 'ARCHIVED') NOT NULL DEFAULT 'ACTIVE'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`status\``);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`status\` datetime(6) NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`status\` \`deleted_at\` datetime(6) NULL`);
    }

}
