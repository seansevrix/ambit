export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <section className="rounded-3xl border border-white/10 bg-white/5 p-10">
        <h1 className="text-3xl font-semibold tracking-tight text-white">Contact</h1>
        <p className="mt-3 text-sm text-white/70">
          Want to talk? Email your contact address (example: hello@yourdomain.com).
        </p>
        <div className="mt-6 rounded-2xl border border-white/10 bg-[#0B1430]/40 p-5 text-sm text-white/75">
          If you want, we can add a simple contact form next.
        </div>
      </section>
    </div>
  );
}
