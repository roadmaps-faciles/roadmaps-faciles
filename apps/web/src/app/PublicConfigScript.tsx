import Script from "next/script";

import { getPublicEnv } from "@/config";

// Injecte les variables publiques runtime dans window.__PUBLIC_CONFIG__ AVANT l'hydratation Next
// (strategy beforeInteractive, comme ThemeScript). Permet à config.ts de les lire côté navigateur
// au runtime (lecture isomorphique), donc l'image prébuildée sert n'importe quel domaine/branding
// sans rebuild. Échappement de < > & : la valeur vient de l'environnement, on ferme la porte à toute
// injection dans le script inline.
export const PublicConfigScript = () => {
  const json = JSON.stringify(getPublicEnv())
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");

  return (
    <Script id="public-config" strategy="beforeInteractive">
      {`window.__PUBLIC_CONFIG__=${json}`}
    </Script>
  );
};
