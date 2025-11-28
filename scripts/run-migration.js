/**
 * Supabaseマイグレーション実行スクリプト
 *
 * 使い方:
 * node scripts/run-migration.js supabase/migrations/20251128000001_add_anonymous_users.sql
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  // 引数からマイグレーションファイルを取得
  const migrationFile = process.argv[2];

  if (!migrationFile) {
    console.error('使い方: node scripts/run-migration.js <migration-file>');
    process.exit(1);
  }

  // ファイルの存在チェック
  const filePath = path.join(process.cwd(), migrationFile);
  if (!fs.existsSync(filePath)) {
    console.error(`ファイルが見つかりません: ${filePath}`);
    process.exit(1);
  }

  // 環境変数チェック
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('環境変数が設定されていません。.env.local を確認してください。');
    process.exit(1);
  }

  // Supabaseクライアントを作成（Service Role Key使用）
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  // SQLファイルを読み込み
  const sql = fs.readFileSync(filePath, 'utf8');

  console.log('='.repeat(80));
  console.log('Supabaseマイグレーション実行');
  console.log('='.repeat(80));
  console.log(`ファイル: ${migrationFile}`);
  console.log('プロジェクト:', supabaseUrl);
  console.log('');

  try {
    console.log('マイグレーション実行中...');

    // SQLを実行
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      // exec_sql 関数が存在しない場合は、代替手段を表示
      if (error.message.includes('function') && error.message.includes('does not exist')) {
        console.log('');
        console.log('⚠️  直接SQL実行機能が利用できません。');
        console.log('以下のSQLをSupabaseダッシュボード（SQL Editor）で実行してください:');
        console.log('https://supabase.com/dashboard/project/rvrmhcvjhoifmjlaypvn/sql/new');
        console.log('');
        console.log('='.repeat(80));
        console.log(sql);
        console.log('='.repeat(80));
      } else {
        throw error;
      }
    } else {
      console.log('');
      console.log('✅ マイグレーション完了');
      console.log('');
    }
  } catch (error) {
    console.error('');
    console.error('❌ エラー:', error.message);
    console.error('');
    console.log('以下のSQLを手動で実行してください:');
    console.log('https://supabase.com/dashboard/project/rvrmhcvjhoifmjlaypvn/sql/new');
    console.log('');
    console.log('='.repeat(80));
    console.log(sql);
    console.log('='.repeat(80));
    process.exit(1);
  }
}

runMigration().catch((error) => {
  console.error('エラー:', error);
  process.exit(1);
});
