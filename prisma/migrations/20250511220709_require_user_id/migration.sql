/*
  Warnings:

  - Added the required column `userId` to the `Image` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Tag` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `annotation` DROP FOREIGN KEY `Annotation_imageId_fkey`;

-- DropForeignKey
ALTER TABLE `imagetotag` DROP FOREIGN KEY `ImageToTag_imageId_fkey`;

-- DropForeignKey
ALTER TABLE `imagetotag` DROP FOREIGN KEY `ImageToTag_tagId_fkey`;

-- DropIndex
DROP INDEX `Annotation_imageId_fkey` ON `annotation`;

-- DropIndex
DROP INDEX `ImageToTag_tagId_fkey` ON `imagetotag`;

-- AlterTable
ALTER TABLE `image` ADD COLUMN `userId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `tag` ADD COLUMN `userId` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `Image` ADD CONSTRAINT `Image_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Tag` ADD CONSTRAINT `Tag_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ImageToTag` ADD CONSTRAINT `ImageToTag_imageId_fkey` FOREIGN KEY (`imageId`) REFERENCES `Image`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ImageToTag` ADD CONSTRAINT `ImageToTag_tagId_fkey` FOREIGN KEY (`tagId`) REFERENCES `Tag`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Annotation` ADD CONSTRAINT `Annotation_imageId_fkey` FOREIGN KEY (`imageId`) REFERENCES `Image`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
