import Image from "next/image";
import Link from "next/link";
import { ETOWER, ETOWER_LOGO } from "@/lib/demo-data";

export function EtowerFooter() {
  return (
    <footer
      id="contact"
      className="etower-footer text-white py-16 px-4 sm:px-6 scroll-mt-20"
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between gap-10">
          <div>
            <Image
              src={ETOWER_LOGO}
              alt="eTower"
              width={140}
              height={36}
              className="h-9 w-auto object-contain brightness-0 invert"
            />
            <p className="mt-4 text-sm text-white/60 max-w-xs leading-relaxed">
              Babson&apos;s premier entrepreneurial living community fostering innovation
              and collaboration.
            </p>
          </div>
          <div className="flex flex-wrap gap-12 sm:gap-16">
            <div>
              <p className="text-sm font-semibold mb-4 text-[#00ff41]">Quick Links</p>
              <ul className="space-y-2 text-sm text-white/60">
                <li><Link href="/#residents" className="transition-colors">Current Residents</Link></li>
                <li><Link href="/#alumni" className="transition-colors">Alumni Network</Link></li>
                <li><Link href="/our-story" className="transition-colors">Our Story</Link></li>
                <li><Link href="/startups" className="transition-colors">Startups</Link></li>
              </ul>
            </div>
            <div>
              <p className="text-sm font-semibold mb-4 text-[#00ff41]">Get Involved</p>
              <ul className="space-y-2 text-sm text-white/60">
                <li><Link href="/#join" className="transition-colors">Join eTower</Link></li>
                <li><a href={`mailto:${ETOWER.email}`} className="transition-colors">Contact Us</a></li>
              </ul>
            </div>
            <div>
              <p className="text-sm font-semibold mb-4 text-[#00ff41]">Contact</p>
              <ul className="space-y-2 text-sm text-white/60">
                <li>
                  <a href={`mailto:${ETOWER.email}`} className="transition-colors">
                    {ETOWER.email}
                  </a>
                </li>
                <li>Babson College, Wellesley, MA</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-[rgba(0,255,65,0.3)] flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-white/40">
          <p>© {new Date().getFullYear()} eTower. All rights reserved.</p>
          <div className="flex gap-6">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
