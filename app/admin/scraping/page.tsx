'use client';

import { useEffect, useState } from 'react';

interface JobStats {
  total: number;
  pending: number;
  running: number;
  completed: number;
  failed: number;
}

interface TotalStats {
  totalNew: number;
  totalUpdated: number;
}

interface RecentJob {
  id: string;
  status: string;
  query: string;
  restaurants_found: number;
  restaurants_new: number;
  restaurants_updated: number;
  created_at: string;
  completed_at: string | null;
  station: {
    name: string;
    railway: string;
  };
}

interface Stats {
  jobs: JobStats;
  totals: TotalStats;
  recentJobs: RecentJob[];
}

export default function ScrapingStatusPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/scraping/stats');
      const data = await response.json();

      if (data.success) {
        setStats(data.stats);
        setError(null);
      } else {
        setError(data.error || 'データの取得に失敗しました');
      }
    } catch (err: any) {
      setError(`エラー: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">スクレイピング状況</h1>
        <p className="text-sm sm:text-base">読み込み中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">スクレイピング状況</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded text-sm sm:text-base">
          {error}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">スクレイピング状況</h1>
        <p className="text-sm sm:text-base">データがありません</p>
      </div>
    );
  }

  const { jobs, totals, recentJobs } = stats;

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">スクレイピング状況</h1>
        <button
          onClick={fetchStats}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 whitespace-nowrap"
        >
          🔄 更新
        </button>
      </div>

      {/* Job Status Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div className="bg-gray-100 p-3 sm:p-4 rounded-lg">
          <div className="text-xs sm:text-sm text-gray-600">総ジョブ数</div>
          <div className="text-2xl sm:text-3xl font-bold">{jobs.total}</div>
        </div>
        <div className="bg-yellow-100 p-3 sm:p-4 rounded-lg">
          <div className="text-xs sm:text-sm text-gray-600">待機中</div>
          <div className="text-2xl sm:text-3xl font-bold text-yellow-700">{jobs.pending}</div>
        </div>
        <div className="bg-blue-100 p-3 sm:p-4 rounded-lg">
          <div className="text-xs sm:text-sm text-gray-600">実行中</div>
          <div className="text-2xl sm:text-3xl font-bold text-blue-700">{jobs.running}</div>
        </div>
        <div className="bg-green-100 p-3 sm:p-4 rounded-lg">
          <div className="text-xs sm:text-sm text-gray-600">完了</div>
          <div className="text-2xl sm:text-3xl font-bold text-green-700">{jobs.completed}</div>
        </div>
        <div className="bg-red-100 p-3 sm:p-4 rounded-lg col-span-2 sm:col-span-1">
          <div className="text-xs sm:text-sm text-gray-600">失敗</div>
          <div className="text-2xl sm:text-3xl font-bold text-red-700">{jobs.failed}</div>
        </div>
      </div>

      {/* Restaurant Stats */}
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow mb-6 sm:mb-8">
        <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">🏪 収集済み店舗数</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          <div className="border-l-4 border-green-500 pl-3 sm:pl-4">
            <div className="text-xs sm:text-sm text-gray-600">新規登録</div>
            <div className="text-xl sm:text-2xl font-bold text-green-700">{totals.totalNew} 店舗</div>
          </div>
          <div className="border-l-4 border-yellow-500 pl-3 sm:pl-4">
            <div className="text-xs sm:text-sm text-gray-600">更新</div>
            <div className="text-xl sm:text-2xl font-bold text-yellow-700">{totals.totalUpdated} 店舗</div>
          </div>
        </div>
      </div>

      {/* Recent Jobs */}
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
        <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">📋 最近のジョブ</h2>
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <div className="inline-block min-w-full align-middle">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 sm:px-4 py-2 text-left text-xs sm:text-sm font-semibold text-gray-700 whitespace-nowrap">駅</th>
                  <th className="px-3 sm:px-4 py-2 text-left text-xs sm:text-sm font-semibold text-gray-700 whitespace-nowrap">キーワード</th>
                  <th className="px-3 sm:px-4 py-2 text-left text-xs sm:text-sm font-semibold text-gray-700 whitespace-nowrap">ステータス</th>
                  <th className="px-3 sm:px-4 py-2 text-right text-xs sm:text-sm font-semibold text-gray-700 whitespace-nowrap">発見</th>
                  <th className="px-3 sm:px-4 py-2 text-right text-xs sm:text-sm font-semibold text-gray-700 whitespace-nowrap">新規</th>
                  <th className="px-3 sm:px-4 py-2 text-right text-xs sm:text-sm font-semibold text-gray-700 whitespace-nowrap">更新</th>
                  <th className="px-3 sm:px-4 py-2 text-left text-xs sm:text-sm font-semibold text-gray-700 whitespace-nowrap">実行日時</th>
                </tr>
              </thead>
              <tbody>
                {recentJobs.map((job) => (
                  <tr key={job.id} className="border-t hover:bg-gray-50">
                    <td className="px-3 sm:px-4 py-2">
                      <div className="text-xs sm:text-sm font-medium text-gray-900 whitespace-nowrap">{job.station.name}</div>
                      <div className="text-xs text-gray-600 whitespace-nowrap">{job.station.railway}</div>
                    </td>
                    <td className="px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-900 whitespace-nowrap">{job.query}</td>
                    <td className="px-3 sm:px-4 py-2">
                      {job.status === 'completed' && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs whitespace-nowrap">
                          ✅ 完了
                        </span>
                      )}
                      {job.status === 'running' && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs whitespace-nowrap">
                          ⏳ 実行中
                        </span>
                      )}
                      {job.status === 'pending' && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs whitespace-nowrap">
                          ⏸️ 待機中
                        </span>
                      )}
                      {job.status === 'failed' && (
                        <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs whitespace-nowrap">
                          ❌ 失敗
                        </span>
                      )}
                    </td>
                    <td className="px-3 sm:px-4 py-2 text-right text-xs sm:text-sm text-gray-900 font-medium whitespace-nowrap">{job.restaurants_found}</td>
                    <td className="px-3 sm:px-4 py-2 text-right text-xs sm:text-sm text-green-700 font-medium whitespace-nowrap">
                      {job.restaurants_new}
                    </td>
                    <td className="px-3 sm:px-4 py-2 text-right text-xs sm:text-sm text-yellow-700 font-medium whitespace-nowrap">
                      {job.restaurants_updated}
                    </td>
                    <td className="px-3 sm:px-4 py-2 text-xs text-gray-700 whitespace-nowrap">
                      {job.completed_at
                        ? new Date(job.completed_at).toLocaleString('ja-JP')
                        : new Date(job.created_at).toLocaleString('ja-JP')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="mt-4 text-xs sm:text-sm text-gray-500 text-center">
        自動更新: 30秒ごと
      </div>
    </div>
  );
}
