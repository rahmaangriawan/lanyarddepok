CREATE TABLE IF NOT EXISTS `media` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `filename` VARCHAR(191) NOT NULL,
  `filepath` VARCHAR(191) NOT NULL,
  `mimetype` VARCHAR(191) NOT NULL,
  `size` INTEGER NOT NULL,
  `url` VARCHAR(191) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `Media_mimetype_createdAt_idx` (`mimetype`, `createdAt`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
