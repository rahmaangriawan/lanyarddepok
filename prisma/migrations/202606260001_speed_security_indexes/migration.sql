ALTER TABLE `Product`
  ADD COLUMN `name` VARCHAR(191) NULL,
  ADD COLUMN `slug` VARCHAR(191) NULL,
  ADD COLUMN `specs` TEXT NULL,
  ADD COLUMN `accessories` TEXT NULL,
  ADD COLUMN `basePrice` VARCHAR(191) NULL,
  ADD COLUMN `minOrder` VARCHAR(191) NULL,
  ADD COLUMN `shortDescription` TEXT NULL,
  ADD COLUMN `sheetStatus` VARCHAR(191) NULL,
  ADD COLUMN `sites` VARCHAR(191) NULL,
  ADD COLUMN `sortOrder` INTEGER NULL;

CREATE UNIQUE INDEX `Product_slug_key` ON `Product`(`slug`);
CREATE INDEX `Order_userId_createdAt_idx` ON `Order`(`userId`, `createdAt`);
CREATE INDEX `Order_status_createdAt_idx` ON `Order`(`status`, `createdAt`);
CREATE INDEX `Inquiry_createdAt_idx` ON `Inquiry`(`createdAt`);
CREATE INDEX `Category_type_slug_idx` ON `Category`(`type`, `slug`);
CREATE INDEX `Post_categoryId_published_createdAt_idx` ON `Post`(`categoryId`, `published`, `createdAt`);
CREATE INDEX `Page_published_createdAt_idx` ON `Page`(`published`, `createdAt`);
CREATE INDEX `Media_mimetype_createdAt_idx` ON `Media`(`mimetype`, `createdAt`);
CREATE INDEX `Product_categoryId_published_createdAt_idx` ON `Product`(`categoryId`, `published`, `createdAt`);
CREATE INDEX `Product_published_sortOrder_createdAt_idx` ON `Product`(`published`, `sortOrder`, `createdAt`);
CREATE INDEX `Portfolio_createdAt_idx` ON `Portfolio`(`createdAt`);
CREATE INDEX `Comment_postId_approved_createdAt_idx` ON `Comment`(`postId`, `approved`, `createdAt`);
CREATE INDEX `CityPage_published_createdAt_idx` ON `CityPage`(`published`, `createdAt`);
CREATE INDEX `CityPage_parentId_published_createdAt_idx` ON `CityPage`(`parentId`, `published`, `createdAt`);
