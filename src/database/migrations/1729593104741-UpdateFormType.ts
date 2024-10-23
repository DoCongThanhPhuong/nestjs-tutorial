import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateFormType1729593104741 implements MigrationInterface {
    name = 'UpdateFormType1729593104741'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`form_types\` DROP COLUMN \`description\``);
        await queryRunner.query(`ALTER TABLE \`departments\` ADD UNIQUE INDEX \`IDX_8681da666ad9699d568b3e9106\` (\`name\`)`);
        await queryRunner.query(`ALTER TABLE \`departments\` ADD UNIQUE INDEX \`IDX_ffb59a0da5cc0c1a4919323a1e\` (\`prefix\`)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`departments\` DROP INDEX \`IDX_ffb59a0da5cc0c1a4919323a1e\``);
        await queryRunner.query(`ALTER TABLE \`departments\` DROP INDEX \`IDX_8681da666ad9699d568b3e9106\``);
        await queryRunner.query(`ALTER TABLE \`form_types\` ADD \`description\` text NULL`);
    }

}
