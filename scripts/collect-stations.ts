#!/usr/bin/env tsx
/**
 * Google Places API を使って神奈川県の駅を収集
 *
 * Usage:
 *   npm run collect-stations
 */

import { Client } from '@googlemaps/google-maps-services-js';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import chalk from 'chalk';

dotenv.config({ path: '.env.local' });

const KANAGAWA_CENTER = {
  lat: 35.4437,
  lng: 139.6380,
};

const SEARCH_RADIUS = 50000; // 50km

interface StationData {
  name: string;
  name_kana: string;
  latitude: number;
  longitude: number;
  address: string;
  railway: string;
  prefecture: string;
  city: string;
}

async function main() {
  console.log(chalk.bold.blue('\n=== 神奈川県の駅データ収集 ===\n'));

  // 環境変数チェック
  const googleApiKey = process.env.GOOGLE_MAPS_API_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!googleApiKey || !supabaseUrl || !supabaseKey) {
    console.error(chalk.red('Missing required environment variables'));
    process.exit(1);
  }

  const googleClient = new Client({});
  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log(chalk.gray('Google Places API で駅を検索中...\n'));

  try {
    // 駅を検索（最大60件 × ページング）
    const allStations: StationData[] = [];
    let pageToken: string | undefined = undefined;
    let pageCount = 0;

    do {
      const response = await googleClient.textSearch({
        params: {
          query: '駅 神奈川県',
          location: KANAGAWA_CENTER,
          radius: SEARCH_RADIUS,
          language: 'ja',
          key: googleApiKey,
          pagetoken: pageToken,
        },
      });

      if (response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
        console.error(chalk.red(`API Error: ${response.data.status}`));
        break;
      }

      pageCount++;
      console.log(chalk.blue(`Page ${pageCount}: ${response.data.results.length} 件取得`));

      for (const place of response.data.results) {
        const name = place.name;
        const lat = place.geometry?.location.lat;
        const lng = place.geometry?.location.lng;
        const address = place.formatted_address || '';

        if (!lat || !lng) continue;

        // 駅名から路線を推測（詳細取得は後で）
        const railway = extractRailway(name);
        const city = extractCity(address);

        allStations.push({
          name: name,
          name_kana: '', // 後で埋める
          latitude: lat,
          longitude: lng,
          address: address,
          railway: railway,
          prefecture: '神奈川県',
          city: city,
        });
      }

      pageToken = response.data.next_page_token;

      // Next page token が必要な場合は待機
      if (pageToken) {
        console.log(chalk.gray('次のページを取得中...'));
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

    } while (pageToken && pageCount < 4); // 最大240件

    console.log(chalk.green(`\n合計 ${allStations.length} 件の駅を取得しました\n`));

    // 既存の駅をチェック
    const { data: existingStations } = await supabase
      .from('stations')
      .select('name, railway');

    const existingSet = new Set(
      existingStations?.map(s => `${s.name}-${s.railway}`) || []
    );

    // 新規駅のみフィルタリング
    const newStations = allStations.filter(
      station => !existingSet.has(`${station.name}-${station.railway}`)
    );

    console.log(chalk.yellow(`既存駅: ${existingStations?.length || 0} 件`));
    console.log(chalk.green(`新規駅: ${newStations.length} 件\n`));

    if (newStations.length === 0) {
      console.log(chalk.yellow('新規駅が見つかりませんでした'));
      return;
    }

    // データベースに挿入
    console.log(chalk.blue('データベースに挿入中...\n'));

    let insertedCount = 0;
    let errorCount = 0;

    for (const station of newStations) {
      const { error } = await supabase
        .from('stations')
        .insert({
          name: station.name,
          prefecture: station.prefecture,
          city: station.city,
          railway: station.railway,
          latitude: station.latitude,
          longitude: station.longitude,
          is_active: true,
        });

      if (error) {
        console.error(chalk.red(`  ❌ ${station.name}: ${error.message}`));
        errorCount++;
      } else {
        console.log(chalk.green(`  ✅ ${station.name} (${station.railway})`));
        insertedCount++;
      }
    }

    console.log(chalk.bold.green(`\n=== 完了 ===`));
    console.log(chalk.green(`✅ 挿入成功: ${insertedCount} 件`));
    if (errorCount > 0) {
      console.log(chalk.red(`❌ エラー: ${errorCount} 件`));
    }
    console.log('');

  } catch (error: any) {
    console.error(chalk.red(`\nエラー: ${error.message}`));
    process.exit(1);
  }
}

/**
 * 駅名から路線名を推測
 */
function extractRailway(stationName: string): string {
  // 駅名に路線情報が含まれている場合
  if (stationName.includes('JR')) return 'JR';
  if (stationName.includes('小田急')) return '小田急線';
  if (stationName.includes('京急')) return '京急線';
  if (stationName.includes('相鉄')) return '相鉄線';
  if (stationName.includes('東急')) return '東急線';
  if (stationName.includes('横浜市営')) return '横浜市営地下鉄';
  if (stationName.includes('江ノ島電鉄')) return '江ノ島電鉄線';

  return '未分類';
}

/**
 * 住所から市区町村を抽出
 */
function extractCity(address: string): string {
  const match = address.match(/神奈川県(.+?[市区町村])/);
  return match ? match[1] : '';
}

main().catch(error => {
  console.error(chalk.red('Fatal error:'), error);
  process.exit(1);
});
