export function Footer() {
  return (
    <footer className="border-t">
      <div className="mx-auto max-w-7xl px-4 py-4">
        <p className="text-center text-sm text-gray-600">
          Created by{' '}
          <a
            href="https://github.com/sushil-kamble"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium hover:underline"
          >
            sushil-kamble
          </a>{' '}
          © {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}
