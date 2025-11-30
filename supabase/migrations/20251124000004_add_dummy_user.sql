-- ダミーユーザーの作成（テスト用）

-- ダミーユーザーを挿入（認証機能実装まで使用）
INSERT INTO users (id, username, email, display_name)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'dummy_user',
  'dummy@example.com',
  'ゲストユーザー'
) ON CONFLICT (id) DO NOTHING;

COMMENT ON TABLE users IS 'ユーザー情報テーブル（将来的にSupabase Authと連携）';
