import Image from "next/image";
import Link from "next/link";

const officialWebsiteUrl = process.env.NEXT_PUBLIC_SORSOGON_WEBSITE_URL ?? "";

function DocumentIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-7 w-7"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.5 3.5h7L18 8v12.5H6.5A1.5 1.5 0 0 1 5 19V5a1.5 1.5 0 0 1 1.5-1.5Z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 3.5V8H18" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.5 12h6.5M8.5 15.5h6.5M8.5 19h4"
      />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-7 w-7"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3 20 6v5.5c0 4.7-3.1 7.9-8 9.5-4.9-1.6-8-4.8-8-9.5V6l8-3Z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m8.5 12 2.2 2.2 4.8-5"
      />
    </svg>
  );
}

function PeopleIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-7 w-7"
      aria-hidden="true"
    >
      <circle cx="9" cy="8" r="3" />
      <circle cx="17" cy="9" r="2.5" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.5 19c.5-3.2 2.4-5 5.5-5s5 1.8 5.5 5"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14.5 15c.7-.5 1.5-.8 2.5-.8 2.2 0 3.6 1.3 4 3.8"
      />
    </svg>
  );
}

function BuildingIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-7 w-7"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 21h16M5.5 21V9.5L12 5l6.5 4.5V21"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 9.5h18M8 13h1M8 16h1M15 13h1M15 16h1"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 21v-4h4v4" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 10h12M11 5l5 5-5 5"
      />
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11 4h5v5M16 4l-7 7"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 11.5V15a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h3.5"
      />
    </svg>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* =====================================================
          HEADER
      ====================================================== */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex min-h-22 max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">
          {/* Branding */}
          <Link href="/" className="flex min-w-0 items-center gap-3 sm:gap-4">
            <Image
              src="/sorsogon-logo.png"
              alt="Province of Sorsogon Official Seal"
              width={70}
              height={70}
              priority
              className="h-12 w-12 shrink-0 object-contain sm:h-14 sm:w-14"
            />

            <div className="min-w-0 border-l border-slate-300 pl-3 sm:pl-4">
              <p className="truncate text-sm font-bold tracking-tight text-blue-950 sm:text-xl">
                Sorsogon Province Procurement
              </p>

              <p className="text-[10px] leading-4 text-slate-500 sm:text-sm">
                Official Procurement Information Website
              </p>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="ml-4 flex shrink-0 items-center gap-1 sm:gap-4">
            <Link
              href="/procurements"
              className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-blue-950 transition hover:bg-slate-100 sm:inline-flex"
            >
              Procurements
            </Link>

            <Link
              href="/login"
              className="rounded-lg bg-blue-800 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:px-5"
            >
              Login
            </Link>
          </nav>
        </div>
      </header>

      {/* =====================================================
          HERO
      ====================================================== */}
      <section className="relative overflow-hidden">
        {/* Capitol background */}
        <Image
          src="/capitol.png"
          alt="Provincial Capitol of Sorsogon"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />

        {/* Main overlay */}
        <div className="absolute inset-0 bg-blue-950/55" />

        {/* Subtle bottom gradient */}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-linear-to-t from-blue-950/35 to-transparent" />

        <div className="relative mx-auto flex min-h-140 max-w-7xl items-center justify-center px-5 py-20 sm:min-h-150 sm:px-6 lg:px-8">
          <div className="w-full max-w-5xl text-center text-white">
            {/* Province label */}
            <div className="flex items-center justify-center gap-4">
              <span className="hidden h-px w-16 bg-white/70 sm:block" />

              <p className="text-xs font-bold uppercase tracking-[0.28em] text-white sm:text-sm">
                Province of Sorsogon
              </p>

              <span className="hidden h-px w-16 bg-white/70 sm:block" />
            </div>

            {/* Main title */}
            <h1 className="mt-5 text-4xl font-bold tracking-tight drop-shadow-lg sm:text-5xl lg:text-6xl">
              Sorsogon Province Procurement
            </h1>

            {/* Subtitle */}
            <p className="mt-5 text-xl font-medium text-white drop-shadow sm:text-2xl">
              Official Procurement Information Website
            </p>

            {/* Description */}
            <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-white/90 drop-shadow sm:text-base sm:leading-8">
              Transparent and accessible procurement information for the people
              of Sorsogon.
            </p>

            {/* Main CTA */}
            <div className="mt-8">
              <Link
                href="/procurements"
                className="inline-flex items-center gap-3 rounded-full border border-white/70 bg-white/10 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white hover:text-blue-900 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-900"
              >
                <span>View Public Procurements</span>

                <ArrowIcon />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          INFORMATION STRIP
      ====================================================== */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl divide-y divide-slate-200 px-5 sm:grid-cols-2 sm:divide-x sm:divide-y-0 sm:px-6 lg:grid-cols-4 lg:px-8">
          {/* Transparency */}
          <div className="flex items-center gap-4 px-2 py-6 sm:px-5 lg:py-7">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-800">
              <DocumentIcon />
            </div>

            <div>
              <h2 className="text-sm font-bold text-blue-900">Transparency</h2>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Open and accessible procurement information.
              </p>
            </div>
          </div>

          {/* Accountability */}
          <div className="flex items-center gap-4 px-2 py-6 sm:px-5 lg:py-7">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-800">
              <ShieldIcon />
            </div>

            <div>
              <h2 className="text-sm font-bold text-blue-900">
                Accountability
              </h2>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Supporting responsible procurement processes.
              </p>
            </div>
          </div>

          {/* Public Service */}
          <div className="flex items-center gap-4 px-2 py-6 sm:px-5 lg:py-7">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-800">
              <PeopleIcon />
            </div>

            <div>
              <h2 className="text-sm font-bold text-blue-900">
                Public Service
              </h2>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Procurement information accessible to the public.
              </p>
            </div>
          </div>

          {/* Sorsogon Province */}
          <div className="flex items-center gap-4 px-2 py-6 sm:px-5 lg:py-7">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-800">
              <BuildingIcon />
            </div>

            <div>
              <h2 className="text-sm font-bold text-blue-900">
                Sorsogon Province
              </h2>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Serving the people of Sorsogon.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          PUBLIC PROCUREMENT SECTION
      ====================================================== */}
      <section className="bg-slate-50">
        <div className="mx-auto max-w-4xl px-5 py-16 text-center sm:px-6 lg:py-20">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-800">
            Public Procurement Portal
          </p>

          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Explore Procurement Information
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600">
            Browse available procurement requests and view publicly accessible
            information about their progress.
          </p>

          <div className="mt-7">
            <Link
              href="/procurements"
              className="group inline-flex items-center gap-2 text-sm font-semibold text-blue-800 transition hover:text-blue-950 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-4"
            >
              <span className="border-b border-blue-300 pb-1 transition group-hover:border-blue-800">
                Browse Procurements
              </span>

              <span className="transition-transform duration-200 group-hover:translate-x-1">
                <ArrowIcon />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* =====================================================
          FOOTER
      ====================================================== */}
      <footer className="bg-blue-950 text-white">
        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
            {/* Official website */}
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-blue-100">
                <ExternalLinkIcon />
              </div>

              <div>
                <p className="text-sm font-medium leading-6 text-blue-100">
                  For more information about the Province of Sorsogon, please
                  visit the official website.
                </p>

                {officialWebsiteUrl && (
                  <a
                    href={officialWebsiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-flex items-center gap-1.5 text-sm font-bold text-white underline decoration-white/50 underline-offset-4 transition hover:text-blue-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-950"
                  >
                    Official Sorsogon Province Website
                    <ExternalLinkIcon />
                  </a>
                )}
              </div>
            </div>

            {/* Province branding */}
            <div className="flex items-center gap-3 border-t border-white/15 pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
              <Image
                src="/sorsogon-logo.png"
                alt="Province of Sorsogon Official Seal"
                width={44}
                height={44}
                className="h-10 w-10 object-contain"
              />

              <div>
                <p className="text-sm font-semibold">Province of Sorsogon</p>

                <p className="mt-0.5 text-xs text-blue-200">
                  © 2026. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
