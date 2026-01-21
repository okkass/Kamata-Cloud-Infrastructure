-- virtual_machines テーブルの AUTO_INCREMENT を 1000 に設定する
-- 既存のレコードはすべて消し去る
DELETE FROM `virtual_machines`;
ALTER TABLE `virtual_machines` AUTO_INCREMENT = 1000;
-- images テーブルの AUTO_INCREMENT を 100 に設定する
-- 既存のレコードはすべて消し去る
DELETE FROM `images`;
ALTER TABLE `images` AUTO_INCREMENT = 100;