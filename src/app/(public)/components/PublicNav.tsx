import Image from 'next/image';
import { ThemeToggle } from '@/components/theme-toggle';
import { PublicNavLinks } from './PublicNavLinks';

export function PublicNav() {
  return (
    <nav className="sticky top-0 z-50 bg-background border-b-2 border-[#B8952E]">
      <div className="max-w-[960px] mx-auto px-4 md:px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-[14px]">
          <Image
            src="/logo.png"
            alt="Colégio São José"
            width={140}
            height={140}
            className="rounded-full w-[140px] h-[140px] object-cover flex-shrink-0"
          />
          <span className="font-serif font-bold text-[35px] leading-[42px] text-[#1E3D59]">
            Colégio São José
          </span>
        </div>

        <div className="flex items-center gap-1">
          <PublicNavLinks />
          <ThemeToggle className="ml-2 w-10 h-10 border-[1.5px] border-[#C5A572] rounded-lg" />
        </div>
      </div>
    </nav>
  );
}
