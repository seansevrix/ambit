import Image from "next/image";

type ProofSectionProps = {
  /** Put this section below the signup area when true */
  belowSignup?: boolean;
};

export default function ProofSection({ belowSignup }: ProofSectionProps) {
  return (
    <div className={`mx-auto max-w-6xl ${belowSignup ? "mt-8 sm:mt-10" : "mt-10 sm:mt-12"}`}>
      {/* Header */}
      <div className="mb-5 sm:mb-7">
        <h2 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
          Proof, not promises.
        </h2>

        <p className="mt-2 max-w-3xl text-sm text-white/70">
          Illustrative examples of what “matched opportunities + faster response” can do. Results vary by trade,
          service area, and bid volume.
        </p>

        <p className="mt-2 text-sm font-semibold text-white/80">
          Results for: Mid-sized Electrical Contractor (5–10 employees) in Dallas, TX.
        </p>
      </div>

      {/* Image */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-[0_0_0_1px_rgba(255,255,255,0.03)_inset]">
        <div className="p-4 sm:p-5">
          <div className="relative w-full overflow-hidden rounded-xl border border-white/10 bg-[#0B1430]/30">
            {/* Keep this aspect ratio so it always looks clean */}
            <div className="relative aspect-[16/9] w-full">
              <Image
                // ✅ use the new clean image (no querystring)
                src="/proof/ambit-tiles.jpg"
                alt="AMBIT performance tiles (illustrative)"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 70vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="mt-5 flex justify-end">
        <a
          href="/get-started"
          className="inline-flex items-center justify-center rounded-xl bg-[#1A4FA3] px-5 py-3 text-sm font-semibold text-white hover:bg-[#15428B]"
        >
          See results for your trade →
        </a>
      </div>
    </div>
  );
}
