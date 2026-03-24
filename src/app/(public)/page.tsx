import Link from 'next/link';
import { getPublishedProducts, getProductsByCategory } from '@/features/products/queries';
import { getCategories } from '@/features/categories/queries';
import { ProductGrid } from '@/features/products/components/ProductGrid';
import { PublicNav } from './components/PublicNav';

interface CatalogPageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const { category: categoryId } = await searchParams;

  const [categories, products] = await Promise.all([
    getCategories(),
    categoryId
      ? getProductsByCategory(categoryId)
      : getPublishedProducts(),
  ]);

  return (
    <>
      <PublicNav />

      <main className="max-w-[960px] mx-auto px-4 md:px-8 pb-20">

        {/* ── Mensagem ─────────────────────────────── */}
        <section id="mensagem" className="pt-9 pb-10 border-b border-[#D4C4A8]">
          <h2 className="font-serif font-bold text-[28px] leading-[34px] text-[#B8952E] mb-5">
            Mensagem
          </h2>

          <div className="flex flex-col gap-[14px]">
            <p className="text-[16px] leading-[1.7] text-[#3D4F5F] m-0">
              O nosso Colégio São José, finalmente nasceu e recorre à sua generosidade.
            </p>

            <p className="text-[16px] leading-[1.7] text-[#3D4F5F] m-0">
              Somos como uma grande família: &ldquo;em seus inícios, enfrenta muitos desafios, com
              grandes esforços e gastos, até alcançar a estabilidade, quando os irmãos mais velhos
              já podem ajudar os mais novos.&rdquo; Desde já, agradecemos sua liberalidade, pois dela
              depende o futuro de nossas crianças, o crescimento de nossa Fraternidade e a esperança
              do nosso Brasil.
            </p>

            {/* Blockquote */}
            <div className="rounded-tr-[8px] rounded-br-[8px] py-3 px-5 bg-[#E8EEF4] border-l-[3px] border-l-[#B8952E]">
              <p className="font-serif font-normal italic text-[15px] leading-[1.65] text-[#1E3D59] m-0">
                &ldquo;Há quem dá liberalmente e se torna mais rico; há quem retém mais do que é justo e
                acaba na pobreza.&rdquo;
              </p>
              <cite className="block mt-2 text-[13px] text-[#6B7D8E] not-italic leading-[16px]">
                Provérbios 11:24
              </cite>
            </div>

            <p className="text-[16px] leading-[1.7] text-[#3D4F5F] m-0">
              Aqui encontrarão gastos e objetos concretos que necessitamos. Podem ajudar em
              dinheiro ou com o bem físico.
            </p>

            {/* Assinatura */}
            <div className="pt-[6px]">
              <p className="text-[15px] leading-[18px] text-[#3D4F5F] m-0">
                Muito obrigado — Que Deus os abençoe
              </p>
              <p className="font-serif font-semibold text-[15px] leading-[18px] text-[#1E3D59] mt-1">
                Pe. João Maria Ferreira da Costa, Diretor
              </p>
            </div>
          </div>
        </section>

        {/* ── Produtos ─────────────────────────────── */}
        <section id="doacoes" className="pt-10">
          <div className="flex items-baseline gap-[14px] mb-5">
            <h2 className="font-serif font-bold text-[28px] leading-[34px] text-[#B8952E]">
              Itens para doação
            </h2>
            <span className="text-[13px] text-[#6B7D8E]">
              {products.length}{' '}
              {products.length === 1 ? 'item disponível' : 'itens disponíveis'}
            </span>
          </div>

          {categories.length > 0 && (
            <div className="mb-7">
              <span className="block text-[11px] uppercase tracking-[1.4px] text-[#8A7A5C] mb-3">
                Filtrar por categoria
              </span>
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/#doacoes"
                  className={`rounded-full py-2 px-5 text-[14px] transition-colors cursor-pointer ${
                    !categoryId
                      ? 'bg-[#1E3D59] text-[#F8F6F1]'
                      : 'bg-[#E5DFD4] border border-[#C5A572] text-[#3D4F5F] hover:bg-[#D4C4A8]'
                  }`}
                >
                  Todas
                </Link>
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/?category=${cat.id}#doacoes`}
                    className={`rounded-full py-2 px-5 text-[14px] transition-colors cursor-pointer ${
                      categoryId === cat.id
                        ? 'bg-[#1E3D59] text-[#F8F6F1]'
                        : 'bg-[#E5DFD4] border border-[#C5A572] text-[#3D4F5F] hover:bg-[#D4C4A8]'
                    }`}
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          <ProductGrid
            products={products}
            emptyMessage={
              categoryId
                ? 'Nenhum produto encontrado nesta categoria.'
                : 'Nenhum produto disponível no momento.'
            }
          />
        </section>

        {/* ── Conheça o Colégio ────────────────────── */}
        <section id="colegio" className="mt-12 pt-14 border-t-2 border-[#B8952E]">
          <h2 className="font-serif font-bold text-[30px] leading-[36px] text-[#B8952E] mb-4">
            Conheça o Colégio
          </h2>
          <p className="text-[16px] leading-[1.75] text-[#5A6D7E] max-w-[720px]">
            Conteúdo em breve. Esta seção reunirá informações sobre a história, a missão e o dia a
            dia do Colégio São José.
          </p>
        </section>

      </main>
    </>
  );
}
