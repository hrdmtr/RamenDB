import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between text-center">
        <h1 className="text-4xl font-bold mb-4">
          RamenDB
        </h1>
        <p className="text-xl mb-8">
          ラーメン評価プラットフォーム
        </p>
        <p className="text-gray-600 mb-12">
          信頼できるレビューで見つける、あなたの一杯
        </p>

        <div className="flex gap-4 justify-center">
          <Link
            href="/restaurants"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors text-lg font-medium"
          >
            店舗一覧を見る
          </Link>
          <Link
            href="/about"
            className="bg-gray-200 text-gray-800 px-8 py-3 rounded-lg hover:bg-gray-300 transition-colors text-lg font-medium"
          >
            RamenDBとは
          </Link>
        </div>
      </div>
    </main>
  );
}
