// app/not-found.tsx
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-primary text-white">
      <div className="text-center">
        <h1 className="text-6xl font-extrabold mb-4">404</h1>
        <p className="text-xl mb-6">A página que você está procurando não existe.</p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-white text-primary rounded-full text-lg font-semibold hover:bg-gray-200 transition duration-300"
        >
          Voltar para a Home
        </Link>
      </div>
    </div>
  );
}
