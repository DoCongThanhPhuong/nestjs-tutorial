import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateDatabase1731725573240 implements MigrationInterface {
    name = 'CreateDatabase1731725573240'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`departments\` (\`id\` bigint NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`manager_id\` bigint NULL, \`director_id\` bigint NULL, UNIQUE INDEX \`IDX_8681da666ad9699d568b3e9106\` (\`name\`), UNIQUE INDEX \`REL_ef8a4fb89ff96bbe98f1798798\` (\`manager_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`form_types\` (\`id\` bigint NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`scope\` enum ('all', 'probation', 'permanent') NOT NULL DEFAULT 'all', UNIQUE INDEX \`IDX_90b941a6ba702063a5759bc2ca\` (\`name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`fields\` (\`id\` int NOT NULL AUTO_INCREMENT, \`label\` varchar(255) NOT NULL, \`type\` enum ('number', 'text', 'date', 'upload', 'select', 'checkbox', 'radio') NOT NULL, \`required\` tinyint NOT NULL DEFAULT 1, \`options\` text NULL, \`form_id\` bigint NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`field_values\` (\`submission_id\` bigint NOT NULL, \`field_id\` int NOT NULL, \`value\` text NOT NULL, PRIMARY KEY (\`submission_id\`, \`field_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`submissions\` (\`id\` bigint NOT NULL AUTO_INCREMENT, \`status\` enum ('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending', \`rejection_reason\` text NULL, \`submitted_at\` datetime NULL, \`form_id\` bigint NOT NULL, \`employee_id\` bigint NOT NULL, \`manager_id\` bigint NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`forms\` (\`id\` bigint NOT NULL AUTO_INCREMENT, \`title\` varchar(255) NOT NULL, \`description\` text NULL, \`form_type_id\` bigint NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`creator_id\` bigint NOT NULL, \`published_at\` datetime NULL, \`is_published\` tinyint NOT NULL DEFAULT 0, \`closed_at\` datetime NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`permissions\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`method\` enum ('POST', 'GET', 'PUT', 'PATCH', 'DELETE') NOT NULL, \`path\` varchar(255) NOT NULL, UNIQUE INDEX \`IDX_48ce552495d14eae9b187bb671\` (\`name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`role_permission\` (\`role_id\` int NOT NULL, \`permission_id\` int NOT NULL, PRIMARY KEY (\`role_id\`, \`permission_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`roles\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`description\` text NULL, UNIQUE INDEX \`IDX_648e3f5447f725579d7d4ffdfb\` (\`name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`users\` (\`id\` bigint NOT NULL AUTO_INCREMENT, \`code\` varchar(255) NULL, \`firstname\` varchar(255) NOT NULL, \`lastname\` varchar(255) NOT NULL, \`email\` varchar(255) NOT NULL, \`password\` varchar(255) NOT NULL, \`phone\` varchar(255) NULL, \`avatar\` varchar(255) NULL, \`gender\` enum ('male', 'female', 'other') NOT NULL, \`birthday\` datetime NULL, \`hicn\` varchar(255) NULL, \`address\` varchar(255) NULL, \`citizen_id\` varchar(255) NULL, \`job_title\` varchar(255) NULL, \`is_official\` tinyint NOT NULL DEFAULT 0, \`department_id\` bigint NULL, \`role_id\` int NOT NULL, \`status\` enum ('ACTIVE', 'ARCHIVED') NOT NULL DEFAULT 'ACTIVE', \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_1f7a2b11e29b1422a2622beab3\` (\`code\`), UNIQUE INDEX \`IDX_97672ac88f789774dd47f7c8be\` (\`email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`departments\` ADD CONSTRAINT \`FK_ef8a4fb89ff96bbe98f1798798c\` FOREIGN KEY (\`manager_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`departments\` ADD CONSTRAINT \`FK_f148a13254bd0be1247fda9da34\` FOREIGN KEY (\`director_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`fields\` ADD CONSTRAINT \`FK_1b10aa5577f9c30e6b475410416\` FOREIGN KEY (\`form_id\`) REFERENCES \`forms\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`field_values\` ADD CONSTRAINT \`FK_65e5e591120e39a87887bd2d354\` FOREIGN KEY (\`submission_id\`) REFERENCES \`submissions\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`field_values\` ADD CONSTRAINT \`FK_79ff3d55c6579e2aa087053b893\` FOREIGN KEY (\`field_id\`) REFERENCES \`fields\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`submissions\` ADD CONSTRAINT \`FK_fefad2556c1cbfffdd2cc3a3c79\` FOREIGN KEY (\`employee_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`submissions\` ADD CONSTRAINT \`FK_38e0ee6502efb7a632df1765823\` FOREIGN KEY (\`manager_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`submissions\` ADD CONSTRAINT \`FK_82318f9579f8f3df8480d46990f\` FOREIGN KEY (\`form_id\`) REFERENCES \`forms\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`forms\` ADD CONSTRAINT \`FK_0301e81e961309cda6713313c3c\` FOREIGN KEY (\`form_type_id\`) REFERENCES \`form_types\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`forms\` ADD CONSTRAINT \`FK_d8aaeafe7ee26e56ee26370b672\` FOREIGN KEY (\`creator_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`role_permission\` ADD CONSTRAINT \`FK_3d0a7155eafd75ddba5a7013368\` FOREIGN KEY (\`role_id\`) REFERENCES \`roles\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`role_permission\` ADD CONSTRAINT \`FK_e3a3ba47b7ca00fd23be4ebd6cf\` FOREIGN KEY (\`permission_id\`) REFERENCES \`permissions\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD CONSTRAINT \`FK_0921d1972cf861d568f5271cd85\` FOREIGN KEY (\`department_id\`) REFERENCES \`departments\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD CONSTRAINT \`FK_a2cecd1a3531c0b041e29ba46e1\` FOREIGN KEY (\`role_id\`) REFERENCES \`roles\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` DROP FOREIGN KEY \`FK_a2cecd1a3531c0b041e29ba46e1\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP FOREIGN KEY \`FK_0921d1972cf861d568f5271cd85\``);
        await queryRunner.query(`ALTER TABLE \`role_permission\` DROP FOREIGN KEY \`FK_e3a3ba47b7ca00fd23be4ebd6cf\``);
        await queryRunner.query(`ALTER TABLE \`role_permission\` DROP FOREIGN KEY \`FK_3d0a7155eafd75ddba5a7013368\``);
        await queryRunner.query(`ALTER TABLE \`forms\` DROP FOREIGN KEY \`FK_d8aaeafe7ee26e56ee26370b672\``);
        await queryRunner.query(`ALTER TABLE \`forms\` DROP FOREIGN KEY \`FK_0301e81e961309cda6713313c3c\``);
        await queryRunner.query(`ALTER TABLE \`submissions\` DROP FOREIGN KEY \`FK_82318f9579f8f3df8480d46990f\``);
        await queryRunner.query(`ALTER TABLE \`submissions\` DROP FOREIGN KEY \`FK_38e0ee6502efb7a632df1765823\``);
        await queryRunner.query(`ALTER TABLE \`submissions\` DROP FOREIGN KEY \`FK_fefad2556c1cbfffdd2cc3a3c79\``);
        await queryRunner.query(`ALTER TABLE \`field_values\` DROP FOREIGN KEY \`FK_79ff3d55c6579e2aa087053b893\``);
        await queryRunner.query(`ALTER TABLE \`field_values\` DROP FOREIGN KEY \`FK_65e5e591120e39a87887bd2d354\``);
        await queryRunner.query(`ALTER TABLE \`fields\` DROP FOREIGN KEY \`FK_1b10aa5577f9c30e6b475410416\``);
        await queryRunner.query(`ALTER TABLE \`departments\` DROP FOREIGN KEY \`FK_f148a13254bd0be1247fda9da34\``);
        await queryRunner.query(`ALTER TABLE \`departments\` DROP FOREIGN KEY \`FK_ef8a4fb89ff96bbe98f1798798c\``);
        await queryRunner.query(`DROP INDEX \`IDX_97672ac88f789774dd47f7c8be\` ON \`users\``);
        await queryRunner.query(`DROP INDEX \`IDX_1f7a2b11e29b1422a2622beab3\` ON \`users\``);
        await queryRunner.query(`DROP TABLE \`users\``);
        await queryRunner.query(`DROP INDEX \`IDX_648e3f5447f725579d7d4ffdfb\` ON \`roles\``);
        await queryRunner.query(`DROP TABLE \`roles\``);
        await queryRunner.query(`DROP TABLE \`role_permission\``);
        await queryRunner.query(`DROP INDEX \`IDX_48ce552495d14eae9b187bb671\` ON \`permissions\``);
        await queryRunner.query(`DROP TABLE \`permissions\``);
        await queryRunner.query(`DROP TABLE \`forms\``);
        await queryRunner.query(`DROP TABLE \`submissions\``);
        await queryRunner.query(`DROP TABLE \`field_values\``);
        await queryRunner.query(`DROP TABLE \`fields\``);
        await queryRunner.query(`DROP INDEX \`IDX_90b941a6ba702063a5759bc2ca\` ON \`form_types\``);
        await queryRunner.query(`DROP TABLE \`form_types\``);
        await queryRunner.query(`DROP INDEX \`REL_ef8a4fb89ff96bbe98f1798798\` ON \`departments\``);
        await queryRunner.query(`DROP INDEX \`IDX_8681da666ad9699d568b3e9106\` ON \`departments\``);
        await queryRunner.query(`DROP TABLE \`departments\``);
    }

}
