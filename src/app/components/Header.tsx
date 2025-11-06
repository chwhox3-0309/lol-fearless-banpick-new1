import Link from 'next/link';

const Header = () => {
  return (
    <header className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex items-center">
        <h1 className="text-xl font-bold mr-8">강한 라이즈</h1>
        <nav>
          <Link href="/" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700">
            LOL
          </Link>
          <Link href="/wos" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700">
            WOS
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
