import { MigrationInterface, QueryRunner } from "typeorm";

export class UserCode1729629211608 implements MigrationInterface {
    name = 'UserCode1729629211608'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_ffb59a0da5cc0c1a4919323a1e\` ON \`departments\``);
        await queryRunner.query(`ALTER TABLE \`departments\` DROP COLUMN \`prefix\``);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`code\` \`code\` varchar(255) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`code\` \`code\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`departments\` ADD \`prefix\` varchar(255) NOT NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_ffb59a0da5cc0c1a4919323a1e\` ON \`departments\` (\`prefix\`)`);
    }

}
