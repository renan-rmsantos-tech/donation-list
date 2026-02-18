import { getPixSettings } from '@/features/pix/queries';
import { PixSettingsForm } from '@/features/pix/components/PixSettingsForm';
import { getPublicUrl } from '@/lib/storage/supabase';

export default async function PixPage() {
  const pixSettings = await getPixSettings();

  const qrCodeImageUrl =
    pixSettings?.qrCodeImagePath
      ? getPublicUrl('pix-qr', pixSettings.qrCodeImagePath)
      : null;

  return (
    <div>
      <PixSettingsForm
        copiaEColaCode={pixSettings?.copiaEColaCode ?? null}
        qrCodeImagePath={pixSettings?.qrCodeImagePath ?? null}
        qrCodeImageUrl={qrCodeImageUrl}
      />
    </div>
  );
}
