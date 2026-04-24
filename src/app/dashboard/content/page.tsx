import { BrandStoryEditor } from "@/components/dashboard/brand-story-editor";

export default function DashboardContentPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white">Editor &quot;Quem somos&quot; e conteúdo</h2>
        <p className="mt-1 text-sm text-zinc-400">
          Atualize a narrativa da marca, fotos da oficina e do equipamento (impressão 3D, laser), reforçando confiança
          para o público EUA. O rascunho fica no browser até ligar à página pública ou a um CMS.
        </p>
      </div>
      <BrandStoryEditor />
    </div>
  );
}
