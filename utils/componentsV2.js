import {
  ContainerBuilder,
  SeparatorSpacingSize
} from "discord.js";

/**
 * Convierte un color HEX ("#5865F2") a entero, como lo pide setAccentColor().
 */
export function hexToInt(hex) {
  if (!hex) return null;
  const parsed = parseInt(hex.replace("#", ""), 16);
  return isNaN(parsed) ? null : parsed;
}

/**
 * Construye un Container estilo "embed clásico":
 * - título + descripción, con el "thumbnail" como mini-ícono en la esquina (Section + accessory)
 * - "image" como banner grande abajo (MediaGallery)
 * - footer opcional
 *
 * Todo con sintaxis de "callback" (igual al patrón que confirmamos que sí funciona),
 * en vez de instanciar los builders por fuera y pasarlos ya armados.
 */
export function buildInfoContainer({
  color,
  title,
  description,
  thumbnail,
  image,
  footer
}) {
  const container = new ContainerBuilder();

  const accentColor = hexToInt(color);
  if (accentColor !== null) {
    container.setAccentColor(accentColor);
  }

  // 🏷️ Título + descripción (con mini-ícono en la esquina si hay thumbnail)
  const textParts = [];
  if (title) textParts.push(`### ${title}`);
  if (description) textParts.push(description);
  const textoCompleto = textParts.join("\n\n");

  if (textParts.length > 0) {

    if (thumbnail) {
      container.addSectionComponents((section) =>
        section
          .addTextDisplayComponents((td) => td.setContent(textoCompleto))
          .setThumbnailAccessory((thumb) => thumb.setURL(thumbnail))
      );
    } else {
      container.addTextDisplayComponents((td) => td.setContent(textoCompleto));
    }

  }

  // 🌄 Banner grande (galería)
  if (image) {
    container.addSeparatorComponents((sep) =>
      sep.setSpacing(SeparatorSpacingSize.Small).setDivider(true)
    );

    container.addMediaGalleryComponents((gallery) =>
      gallery.addItems((item) => item.setURL(image))
    );
  }

  // 📝 Footer (subtexto pequeño de Discord)
  if (footer) {
    container.addSeparatorComponents((sep) =>
      sep.setSpacing(SeparatorSpacingSize.Small).setDivider(true)
    );
    container.addTextDisplayComponents((td) => td.setContent(`-# ${footer}`));
  }

  return container;
}
