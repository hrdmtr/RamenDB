-- Sample restaurant data for RamenDB
-- Created: 2025-11-22

-- ============================================================================
-- Insert sample restaurants
-- ============================================================================

-- 1. 横浜家系ラーメン 本牧家（家系）
INSERT INTO restaurants (
    name, name_kana, address, latitude, longitude,
    nearest_station, railway, phone_number, website,
    profile_description
) VALUES (
    '横浜家系ラーメン 本牧家',
    'よこはまいえけいらーめん ほんもくや',
    '東京都品川区西五反田1-20-3',
    35.6262,
    139.7233,
    '五反田',
    'JR山手線',
    '03-1234-5678',
    'https://example.com/honmokuya',
    '横浜発祥の本格家系ラーメン。豚骨醤油の濃厚スープと太麺が特徴。ライス無料サービスあり。'
);

-- 2. 麺屋 二郎 渋谷店（二郎系）
INSERT INTO restaurants (
    name, name_kana, address, latitude, longitude,
    nearest_station, railway, phone_number,
    profile_description
) VALUES (
    '麺屋 二郎 渋谷店',
    'めんや じろう しぶやてん',
    '東京都渋谷区道玄坂2-10-12',
    35.6595,
    139.6982,
    '渋谷',
    'JR山手線',
    '03-2345-6789',
    'ボリューム満点の二郎系ラーメン。野菜マシマシ、ニンニクマシマシのコール可能。男性客に大人気。'
);

-- 3. 味噌の匠（味噌）
INSERT INTO restaurants (
    name, name_kana, address, latitude, longitude,
    nearest_station, railway, phone_number, website,
    profile_description
) VALUES (
    '味噌の匠',
    'みそのたくみ',
    '東京都新宿区西新宿7-10-5',
    35.6938,
    139.6978,
    '新宿',
    'JR山手線',
    '03-3456-7890',
    'https://example.com/misotakumi',
    '北海道産味噌を使った本格味噌ラーメン。バターコーントッピングが人気。女性客も多い。'
);

-- 4. 塩らーめん 清水（塩）
INSERT INTO restaurants (
    name, name_kana, address, latitude, longitude,
    nearest_station, railway, phone_number,
    profile_description
) VALUES (
    '塩らーめん 清水',
    'しおらーめん しみず',
    '東京都中央区銀座4-5-1',
    35.6719,
    139.7648,
    '銀座',
    '東京メトロ銀座線',
    '03-4567-8901',
    'あっさり塩スープが特徴。健康志向の方にもおすすめ。ランチタイムは女性客で賑わう。'
);

-- 5. 麺処 鶏白湯 極（鶏白湯）
INSERT INTO restaurants (
    name, name_kana, address, latitude, longitude,
    nearest_station, railway, phone_number, website, twitter,
    profile_description
) VALUES (
    '麺処 鶏白湯 極',
    'めんどころ とりぱいたん きわみ',
    '東京都港区六本木3-16-35',
    35.6627,
    139.7371,
    '六本木',
    '東京メトロ日比谷線',
    '03-5678-9012',
    'https://example.com/kiwami',
    '@kiwami_ramen',
    '濃厚な鶏白湯スープが自慢。コラーゲンたっぷりで美容にも良い。深夜営業もあり。'
);

-- 6. つけ麺 大勝軒（つけ麺）
INSERT INTO restaurants (
    name, name_kana, address, latitude, longitude,
    nearest_station, railway, phone_number,
    profile_description
) VALUES (
    'つけ麺 大勝軒',
    'つけめん たいしょうけん',
    '東京都豊島区東池袋1-22-5',
    35.7296,
    139.7156,
    '池袋',
    'JR山手線',
    '03-6789-0123',
    '東京つけ麺の老舗。太麺と濃厚魚介豚骨スープの相性抜群。大盛り無料。'
);

-- 7. ラーメン荘 夢を語れ（ラーショ系）
INSERT INTO restaurants (
    name, name_kana, address, latitude, longitude,
    nearest_station, railway, phone_number, twitter, instagram,
    profile_description
) VALUES (
    'ラーメン荘 夢を語れ',
    'らーめんそう ゆめをかたれ',
    '東京都世田谷区三軒茶屋2-13-7',
    35.6433,
    139.6690,
    '三軒茶屋',
    '東急田園都市線',
    '03-7890-1234',
    '@yume_ramen',
    'yume_ramen_official',
    '濃厚豚骨魚介スープのラーショ系。トッピングのバリエーション豊富。若者に人気。'
);

-- 8. 朝ラー 早起き亭（醤油・朝ラー）
INSERT INTO restaurants (
    name, name_kana, address, latitude, longitude,
    nearest_station, railway, phone_number,
    profile_description
) VALUES (
    '朝ラー 早起き亭',
    'あさらー はやおきてい',
    '東京都千代田区丸の内1-9-1',
    35.6812,
    139.7671,
    '東京',
    'JR山手線',
    '03-8901-2345',
    '朝6時から営業。あっさり醤油スープで朝食にぴったり。ビジネスマンに人気。'
);

-- 9. 麺屋 健康一番（野菜系・健康志向）
INSERT INTO restaurants (
    name, name_kana, address, latitude, longitude,
    nearest_station, railway, phone_number, website,
    profile_description
) VALUES (
    '麺屋 健康一番',
    'めんや けんこういちばん',
    '東京都渋谷区恵比寿南1-5-2',
    35.6465,
    139.7106,
    '恵比寿',
    'JR山手線',
    '03-9012-3456',
    'https://example.com/kenkoichiban',
    '野菜たっぷりヘルシーラーメン。低カロリー、塩分控えめ。女性や健康志向の方におすすめ。'
);

-- 10. 中華そば 昭和軒（醤油・中高年向け）
INSERT INTO restaurants (
    name, name_kana, address, latitude, longitude,
    nearest_station, railway, phone_number,
    profile_description
) VALUES (
    '中華そば 昭和軒',
    'ちゅうかそば しょうわけん',
    '東京都台東区浅草1-20-5',
    35.7125,
    139.7967,
    '浅草',
    '東京メトロ銀座線',
    '03-0123-4567',
    '昭和の味を守り続ける老舗。あっさり醤油スープと細麺。落ち着いた雰囲気で中高年層に人気。'
);

-- ============================================================================
-- Link restaurants with categories
-- ============================================================================

-- Get category IDs
DO $$
DECLARE
    cat_iekei UUID;
    cat_jiro UUID;
    cat_miso UUID;
    cat_shio UUID;
    cat_shoyu UUID;
    cat_tonkotsu UUID;
    cat_tsukemen UUID;
    cat_rasho UUID;

    rest_honmokuya UUID;
    rest_jiro UUID;
    rest_miso UUID;
    rest_shio UUID;
    rest_paitan UUID;
    rest_tsukemen UUID;
    rest_rasho UUID;
    rest_morning UUID;
    rest_healthy UUID;
    rest_showa UUID;
BEGIN
    -- Get category IDs
    SELECT id INTO cat_iekei FROM categories WHERE slug = 'iekei';
    SELECT id INTO cat_jiro FROM categories WHERE slug = 'jiro';
    SELECT id INTO cat_miso FROM categories WHERE slug = 'miso';
    SELECT id INTO cat_shio FROM categories WHERE slug = 'shio';
    SELECT id INTO cat_shoyu FROM categories WHERE slug = 'shoyu';
    SELECT id INTO cat_tonkotsu FROM categories WHERE slug = 'tonkotsu';
    SELECT id INTO cat_tsukemen FROM categories WHERE slug = 'tsukemen';
    SELECT id INTO cat_rasho FROM categories WHERE slug = 'rasho';

    -- Get restaurant IDs
    SELECT id INTO rest_honmokuya FROM restaurants WHERE name = '横浜家系ラーメン 本牧家';
    SELECT id INTO rest_jiro FROM restaurants WHERE name = '麺屋 二郎 渋谷店';
    SELECT id INTO rest_miso FROM restaurants WHERE name = '味噌の匠';
    SELECT id INTO rest_shio FROM restaurants WHERE name = '塩らーめん 清水';
    SELECT id INTO rest_paitan FROM restaurants WHERE name = '麺処 鶏白湯 極';
    SELECT id INTO rest_tsukemen FROM restaurants WHERE name = 'つけ麺 大勝軒';
    SELECT id INTO rest_rasho FROM restaurants WHERE name = 'ラーメン荘 夢を語れ';
    SELECT id INTO rest_morning FROM restaurants WHERE name = '朝ラー 早起き亭';
    SELECT id INTO rest_healthy FROM restaurants WHERE name = '麺屋 健康一番';
    SELECT id INTO rest_showa FROM restaurants WHERE name = '中華そば 昭和軒';

    -- Link restaurants to categories
    -- 本牧家: 家系 + 豚骨
    INSERT INTO restaurant_categories (restaurant_id, category_id) VALUES (rest_honmokuya, cat_iekei);
    INSERT INTO restaurant_categories (restaurant_id, category_id) VALUES (rest_honmokuya, cat_tonkotsu);

    -- 二郎: 二郎系
    INSERT INTO restaurant_categories (restaurant_id, category_id) VALUES (rest_jiro, cat_jiro);

    -- 味噌の匠: 味噌
    INSERT INTO restaurant_categories (restaurant_id, category_id) VALUES (rest_miso, cat_miso);

    -- 塩らーめん 清水: 塩
    INSERT INTO restaurant_categories (restaurant_id, category_id) VALUES (rest_shio, cat_shio);

    -- 鶏白湯 極: 醤油
    INSERT INTO restaurant_categories (restaurant_id, category_id) VALUES (rest_paitan, cat_shoyu);

    -- つけ麺 大勝軒: つけ麺
    INSERT INTO restaurant_categories (restaurant_id, category_id) VALUES (rest_tsukemen, cat_tsukemen);

    -- ラーメン荘: ラーショ系
    INSERT INTO restaurant_categories (restaurant_id, category_id) VALUES (rest_rasho, cat_rasho);

    -- 朝ラー 早起き亭: 醤油
    INSERT INTO restaurant_categories (restaurant_id, category_id) VALUES (rest_morning, cat_shoyu);

    -- 麺屋 健康一番: 醤油
    INSERT INTO restaurant_categories (restaurant_id, category_id) VALUES (rest_healthy, cat_shoyu);

    -- 中華そば 昭和軒: 醤油
    INSERT INTO restaurant_categories (restaurant_id, category_id) VALUES (rest_showa, cat_shoyu);
END $$;

-- ============================================================================
-- Link restaurants with tags
-- ============================================================================

DO $$
DECLARE
    tag_morning UUID;
    tag_healthy UUID;
    tag_senior UUID;
    tag_female UUID;
    tag_parking UUID;
    tag_late_night UUID;
    tag_family UUID;

    rest_honmokuya UUID;
    rest_jiro UUID;
    rest_miso UUID;
    rest_shio UUID;
    rest_paitan UUID;
    rest_tsukemen UUID;
    rest_rasho UUID;
    rest_morning UUID;
    rest_healthy UUID;
    rest_showa UUID;
BEGIN
    -- Get tag IDs
    SELECT id INTO tag_morning FROM tags WHERE slug = 'morning';
    SELECT id INTO tag_healthy FROM tags WHERE slug = 'healthy';
    SELECT id INTO tag_senior FROM tags WHERE slug = 'senior-friendly';
    SELECT id INTO tag_female FROM tags WHERE slug = 'female-friendly';
    SELECT id INTO tag_parking FROM tags WHERE slug = 'parking';
    SELECT id INTO tag_late_night FROM tags WHERE slug = 'late-night';
    SELECT id INTO tag_family FROM tags WHERE slug = 'family-friendly';

    -- Get restaurant IDs
    SELECT id INTO rest_honmokuya FROM restaurants WHERE name = '横浜家系ラーメン 本牧家';
    SELECT id INTO rest_jiro FROM restaurants WHERE name = '麺屋 二郎 渋谷店';
    SELECT id INTO rest_miso FROM restaurants WHERE name = '味噌の匠';
    SELECT id INTO rest_shio FROM restaurants WHERE name = '塩らーめん 清水';
    SELECT id INTO rest_paitan FROM restaurants WHERE name = '麺処 鶏白湯 極';
    SELECT id INTO rest_tsukemen FROM restaurants WHERE name = 'つけ麺 大勝軒';
    SELECT id INTO rest_rasho FROM restaurants WHERE name = 'ラーメン荘 夢を語れ';
    SELECT id INTO rest_morning FROM restaurants WHERE name = '朝ラー 早起き亭';
    SELECT id INTO rest_healthy FROM restaurants WHERE name = '麺屋 健康一番';
    SELECT id INTO rest_showa FROM restaurants WHERE name = '中華そば 昭和軒';

    -- Link restaurants to tags
    -- 本牧家: 駐車場あり、子連れOK
    INSERT INTO restaurant_tags (restaurant_id, tag_id) VALUES (rest_honmokuya, tag_parking);
    INSERT INTO restaurant_tags (restaurant_id, tag_id) VALUES (rest_honmokuya, tag_family);

    -- 二郎: (特になし - ボリューム重視の男性向け)

    -- 味噌の匠: 女性向け、子連れOK
    INSERT INTO restaurant_tags (restaurant_id, tag_id) VALUES (rest_miso, tag_female);
    INSERT INTO restaurant_tags (restaurant_id, tag_id) VALUES (rest_miso, tag_family);

    -- 塩らーめん 清水: 健康志向、女性向け
    INSERT INTO restaurant_tags (restaurant_id, tag_id) VALUES (rest_shio, tag_healthy);
    INSERT INTO restaurant_tags (restaurant_id, tag_id) VALUES (rest_shio, tag_female);

    -- 鶏白湯 極: 深夜営業、女性向け
    INSERT INTO restaurant_tags (restaurant_id, tag_id) VALUES (rest_paitan, tag_late_night);
    INSERT INTO restaurant_tags (restaurant_id, tag_id) VALUES (rest_paitan, tag_female);

    -- つけ麺 大勝軒: 駐車場あり
    INSERT INTO restaurant_tags (restaurant_id, tag_id) VALUES (rest_tsukemen, tag_parking);

    -- ラーメン荘: (特になし - 若者向け濃厚系)

    -- 朝ラー 早起き亭: 朝ラー
    INSERT INTO restaurant_tags (restaurant_id, tag_id) VALUES (rest_morning, tag_morning);

    -- 麺屋 健康一番: 健康志向、女性向け
    INSERT INTO restaurant_tags (restaurant_id, tag_id) VALUES (rest_healthy, tag_healthy);
    INSERT INTO restaurant_tags (restaurant_id, tag_id) VALUES (rest_healthy, tag_female);

    -- 中華そば 昭和軒: 中高年向け
    INSERT INTO restaurant_tags (restaurant_id, tag_id) VALUES (rest_showa, tag_senior);
END $$;

-- ============================================================================
-- Add business hours (sample for a few restaurants)
-- ============================================================================

DO $$
DECLARE
    rest_honmokuya UUID;
    rest_jiro UUID;
    rest_morning UUID;
    rest_paitan UUID;
BEGIN
    -- Get restaurant IDs
    SELECT id INTO rest_honmokuya FROM restaurants WHERE name = '横浜家系ラーメン 本牧家';
    SELECT id INTO rest_jiro FROM restaurants WHERE name = '麺屋 二郎 渋谷店';
    SELECT id INTO rest_morning FROM restaurants WHERE name = '朝ラー 早起き亭';
    SELECT id INTO rest_paitan FROM restaurants WHERE name = '麺処 鶏白湯 極';

    -- 本牧家: 11:00-23:00 (月-土), 11:00-21:00 (日), 定休日なし
    INSERT INTO business_hours (restaurant_id, day_of_week, open_time, close_time, is_closed) VALUES
        (rest_honmokuya, 0, '11:00', '21:00', FALSE), -- 日
        (rest_honmokuya, 1, '11:00', '23:00', FALSE), -- 月
        (rest_honmokuya, 2, '11:00', '23:00', FALSE), -- 火
        (rest_honmokuya, 3, '11:00', '23:00', FALSE), -- 水
        (rest_honmokuya, 4, '11:00', '23:00', FALSE), -- 木
        (rest_honmokuya, 5, '11:00', '23:00', FALSE), -- 金
        (rest_honmokuya, 6, '11:00', '23:00', FALSE); -- 土

    -- 二郎: 11:00-15:00, 18:00-22:00 (月-土), 日曜定休
    INSERT INTO business_hours (restaurant_id, day_of_week, open_time, close_time, is_closed) VALUES
        (rest_jiro, 0, NULL, NULL, TRUE), -- 日曜定休
        (rest_jiro, 1, '11:00', '15:00', FALSE),
        (rest_jiro, 1, '18:00', '22:00', FALSE),
        (rest_jiro, 2, '11:00', '15:00', FALSE),
        (rest_jiro, 2, '18:00', '22:00', FALSE),
        (rest_jiro, 3, '11:00', '15:00', FALSE),
        (rest_jiro, 3, '18:00', '22:00', FALSE),
        (rest_jiro, 4, '11:00', '15:00', FALSE),
        (rest_jiro, 4, '18:00', '22:00', FALSE),
        (rest_jiro, 5, '11:00', '15:00', FALSE),
        (rest_jiro, 5, '18:00', '22:00', FALSE),
        (rest_jiro, 6, '11:00', '15:00', FALSE),
        (rest_jiro, 6, '18:00', '22:00', FALSE);

    -- 朝ラー 早起き亭: 6:00-12:00 (月-金), 定休日: 土日
    INSERT INTO business_hours (restaurant_id, day_of_week, open_time, close_time, is_closed) VALUES
        (rest_morning, 0, NULL, NULL, TRUE), -- 日曜定休
        (rest_morning, 1, '06:00', '12:00', FALSE),
        (rest_morning, 2, '06:00', '12:00', FALSE),
        (rest_morning, 3, '06:00', '12:00', FALSE),
        (rest_morning, 4, '06:00', '12:00', FALSE),
        (rest_morning, 5, '06:00', '12:00', FALSE),
        (rest_morning, 6, NULL, NULL, TRUE); -- 土曜定休

    -- 鶏白湯 極: 11:00-翌3:00 (毎日営業)
    INSERT INTO business_hours (restaurant_id, day_of_week, open_time, close_time, is_closed) VALUES
        (rest_paitan, 0, '11:00', '03:00', FALSE),
        (rest_paitan, 1, '11:00', '03:00', FALSE),
        (rest_paitan, 2, '11:00', '03:00', FALSE),
        (rest_paitan, 3, '11:00', '03:00', FALSE),
        (rest_paitan, 4, '11:00', '03:00', FALSE),
        (rest_paitan, 5, '11:00', '03:00', FALSE),
        (rest_paitan, 6, '11:00', '03:00', FALSE);
END $$;
