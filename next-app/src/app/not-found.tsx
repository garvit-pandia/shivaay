import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center bg-white px-4">
      <h1 className="font-serif text-6xl lg:text-8xl font-normal text-ink mb-4">404</h1>
      <div className="w-12 h-0.5 bg-teal mb-6" />
      <p className="text-ink-dim mb-8 text-lg">Page not found</p>
      <Link href="/" className="btn-primary px-6 py-3 text-base font-semibold no-underline">
        Back to Home
      </Link>
    </div>
  );
}
