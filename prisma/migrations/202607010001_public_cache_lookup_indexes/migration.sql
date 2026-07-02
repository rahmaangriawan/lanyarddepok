CREATE INDEX `Category_type_name_idx` ON `Category`(`type`, `name`);
CREATE INDEX `Post_published_slug_idx` ON `Post`(`published`, `slug`);
CREATE INDEX `Page_published_slug_idx` ON `Page`(`published`, `slug`);
CREATE INDEX `CityPage_published_slug_idx` ON `CityPage`(`published`, `slug`);
