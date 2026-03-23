import Image from 'next/image';
import { ThemeToggle } from '@/components/theme-toggle';

export function PublicNav() {
  return (
    <nav className="sticky top-0 z-50 bg-background border-b-2 border-[#B8952E]">
      <div className="max-w-[960px] mx-auto px-4 md:px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-[14px]">
          <Image
            src="/logo.png"
            alt="Colégio São José"
            width={46}
            height={46}
            className="rounded-full"
          />
          <span className="font-serif font-bold text-[20px] leading-6 text-[#1E3D59]">
            Colégio São José
          </span>
        </div>

        <div className="flex items-center gap-1">
          <a
            href="#mensagem"
            className="px-4 py-2 rounded-full text-[13px] text-[#5A6D7E] hover:text-[#1E3D59] hover:bg-[#1E3D5914] transition-colors cursor-pointer"
          >
            Mensagem
          </a>
          <a
            href="#produtos"
            className="px-4 py-2 rounded-full text-[13px] text-[#5A6D7E] hover:text-[#1E3D59] hover:bg-[#1E3D5914] transition-colors cursor-pointer"
          >
            Produtos
          </a>
          <a
            href="#colegio"
            className="px-4 py-2 rounded-full text-[13px] text-[#5A6D7E] hover:text-[#1E3D59] hover:bg-[#1E3D5914] transition-colors cursor-pointer"
          >
            Conheça o Colégio
          </a>
          <ThemeToggle className="ml-2 w-10 h-10 border-[1.5px] border-[#C5A572] rounded-lg" />
        </div>
      </div>
    </nav>
  );
}
