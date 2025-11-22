-- Sample users and reviews data for RamenDB
-- Created: 2025-11-22

-- ============================================================================
-- Insert sample users
-- ============================================================================

INSERT INTO users (username, email, display_name, reviewer_score) VALUES
    ('ramen_lover_tokyo', 'ramen.lover@example.com', 'ラーメン太郎', 0.85),
    ('noodle_master', 'noodle.master@example.com', '麺マスター', 0.92),
    ('tokyo_foodie', 'tokyo.foodie@example.com', '東京グルメ', 0.78),
    ('ramen_otaku', 'ramen.otaku@example.com', 'ラーメンオタク', 0.88),
    ('food_explorer', 'food.explorer@example.com', 'フードエクスプローラー', 0.75);

-- ============================================================================
-- Insert sample reviews
-- ============================================================================

DO $$
DECLARE
    user1 UUID;
    user2 UUID;
    user3 UUID;
    user4 UUID;
    user5 UUID;

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
    -- Get user IDs
    SELECT id INTO user1 FROM users WHERE username = 'ramen_lover_tokyo';
    SELECT id INTO user2 FROM users WHERE username = 'noodle_master';
    SELECT id INTO user3 FROM users WHERE username = 'tokyo_foodie';
    SELECT id INTO user4 FROM users WHERE username = 'ramen_otaku';
    SELECT id INTO user5 FROM users WHERE username = 'food_explorer';

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

    -- 本牧家のレビュー
    INSERT INTO reviews (restaurant_id, user_id, score, comment, visit_date) VALUES
        (rest_honmokuya, user1, 8.5, '濃厚な豚骨醤油スープが最高！太麺との相性も抜群です。ライス無料サービスも嬉しい。五反田駅から近くてアクセスも良好。', '2025-11-15'),
        (rest_honmokuya, user2, 9.0, '家系ラーメンの中でも特に完成度が高い。スープの濃さ、麺の硬さ、油の量を調整できるのが良い。ネギ多めがおすすめ。', '2025-11-10'),
        (rest_honmokuya, user3, 7.5, '美味しいけど、ちょっと塩辛い。でもライスと一緒に食べると丁度いい。店内は清潔で雰囲気も良い。', '2025-11-08');

    -- 二郎のレビュー
    INSERT INTO reviews (restaurant_id, user_id, score, comment, visit_date) VALUES
        (rest_jiro, user1, 9.2, 'ボリューム満点！野菜マシマシで注文したら山盛りの野菜が。ニンニクマシマシも忘れずに。男性なら大満足間違いなし。', '2025-11-18'),
        (rest_jiro, user4, 8.8, '二郎系の中でもトップクラス。豚も分厚くて食べ応えあり。ただし休日は行列必至。平日の昼がおすすめ。', '2025-11-12'),
        (rest_jiro, user5, 7.0, 'ボリュームはすごいけど、女性には多すぎるかも。味は濃いめで好みが分かれそう。', '2025-11-05');

    -- 味噌の匠のレビュー
    INSERT INTO reviews (restaurant_id, user_id, score, comment, visit_date) VALUES
        (rest_miso, user2, 8.7, '北海道産味噌を使った本格派。バターコーンが絶品。女性客も多く、落ち着いた雰囲気で食べやすい。', '2025-11-16'),
        (rest_miso, user3, 8.3, '味噌ラーメン好きなら必食。スープが濃厚でコクがある。新宿駅から近いのも便利。', '2025-11-14'),
        (rest_miso, user5, 8.5, 'バターコーンをトッピングして正解。まろやかで優しい味わい。子連れでも入りやすい雰囲気。', '2025-11-09');

    -- 塩らーめん 清水のレビュー
    INSERT INTO reviews (restaurant_id, user_id, score, comment, visit_date) VALUES
        (rest_shio, user3, 8.0, 'あっさりしていて食べやすい。健康志向の方におすすめ。銀座という立地も良い。', '2025-11-17'),
        (rest_shio, user5, 8.2, '透明なスープが美しい。塩ラーメンの概念が変わった。女性に人気なのも納得。', '2025-11-11');

    -- 鶏白湯 極のレビュー
    INSERT INTO reviews (restaurant_id, user_id, score, comment, visit_date) VALUES
        (rest_paitan, user1, 8.6, '濃厚な鶏白湯スープ。コラーゲンたっぷりで美容にも良さそう。深夜営業が嬉しい。', '2025-11-19'),
        (rest_paitan, user2, 9.1, '鶏白湯ラーメンの最高峰。クリーミーでまろやか。六本木という立地で深夜まで営業しているのが最高。', '2025-11-13'),
        (rest_paitan, user4, 8.4, 'スープが濃厚で旨味がすごい。麺もスープによく絡む。ただし値段は少し高め。', '2025-11-07');

    -- つけ麺 大勝軒のレビュー
    INSERT INTO reviews (restaurant_id, user_id, score, comment, visit_date) VALUES
        (rest_tsukemen, user2, 9.3, 'つけ麺の元祖。太麺と濃厚魚介豚骨スープの相性が完璧。大盛り無料も嬉しい。', '2025-11-20'),
        (rest_tsukemen, user4, 8.9, '東京つけ麺の老舗。安定の美味しさ。スープ割りも忘れずに。', '2025-11-15');

    -- ラーメン荘のレビュー
    INSERT INTO reviews (restaurant_id, user_id, score, comment, visit_date) VALUES
        (rest_rasho, user1, 8.8, '濃厚豚骨魚介スープが病みつきになる。トッピングの種類が豊富で毎回違う味を楽しめる。', '2025-11-18'),
        (rest_rasho, user4, 9.0, 'ラーショ系の決定版。麺の量も調整できて便利。三軒茶屋まで行く価値あり。', '2025-11-10');

    -- 朝ラー 早起き亭のレビュー
    INSERT INTO reviews (restaurant_id, user_id, score, comment, visit_date) VALUES
        (rest_morning, user3, 7.8, '朝6時から営業しているのが素晴らしい。あっさり醤油で朝食にぴったり。', '2025-11-19'),
        (rest_morning, user5, 7.5, '朝のラーメンは格別。東京駅近くでビジネスマンに人気なのも納得。', '2025-11-12');

    -- 麺屋 健康一番のレビュー
    INSERT INTO reviews (restaurant_id, user_id, score, comment, visit_date) VALUES
        (rest_healthy, user3, 8.1, '野菜たっぷりでヘルシー。罪悪感なく食べられる。女性におすすめ。', '2025-11-16'),
        (rest_healthy, user5, 8.3, '低カロリーで塩分控えめ。それでも美味しいのが凄い。恵比寿の隠れた名店。', '2025-11-14');

    -- 中華そば 昭和軒のレビュー
    INSERT INTO reviews (restaurant_id, user_id, score, comment, visit_date) VALUES
        (rest_showa, user2, 8.4, '昭和の味を守り続ける老舗。懐かしい味わい。浅草観光のついでに是非。', '2025-11-17'),
        (rest_showa, user4, 8.0, 'あっさり醤油と細麺が懐かしい。落ち着いた雰囲気で中高年層に人気。', '2025-11-11');
END $$;
