import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateEnities1729630662503 implements MigrationInterface {
    name = 'UpdateEnities1729630662503'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`permissions\` DROP COLUMN \`description\``);
        await queryRunner.query(`ALTER TABLE \`form_types\` ADD UNIQUE INDEX \`IDX_90b941a6ba702063a5759bc2ca\` (\`name\`)`);
        await queryRunner.query(`ALTER TABLE \`permissions\` ADD UNIQUE INDEX \`IDX_48ce552495d14eae9b187bb671\` (\`name\`)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`permissions\` DROP INDEX \`IDX_48ce552495d14eae9b187bb671\``);
        await queryRunner.query(`ALTER TABLE \`form_types\` DROP INDEX \`IDX_90b941a6ba702063a5759bc2ca\``);
        await queryRunner.query(`ALTER TABLE \`permissions\` ADD \`description\` varchar(255) NOT NULL`);
    }

}
