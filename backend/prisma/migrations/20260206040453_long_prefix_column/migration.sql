-- AlterTable
ALTER TABLE `subnets` MODIFY `cidr` VARCHAR(18) NOT NULL;

-- AlterTable
ALTER TABLE `virtual_networks` MODIFY `cidr` VARCHAR(18) NOT NULL;
