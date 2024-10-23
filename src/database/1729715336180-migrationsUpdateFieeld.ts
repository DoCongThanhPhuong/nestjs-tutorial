import { MigrationInterface, QueryRunner } from "typeorm";

export class MigrationsUpdateFieeld1729715336180 implements MigrationInterface {
    name = 'MigrationsUpdateFieeld1729715336180'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`is_offical\` \`is_official\` tinyint NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`is_official\` \`is_official\` tinyint NOT NULL DEFAULT 1`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`is_official\` \`is_official\` tinyint NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`is_official\` \`is_offical\` tinyint NOT NULL DEFAULT '0'`);
    }

}
