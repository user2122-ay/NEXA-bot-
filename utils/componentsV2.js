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
 * Construye un Container estilo "embed clásico": título + descripción,
 * imagen(es) en una galería, y footer opcional.
 *
 * NOTA: se eliminó el combo SectionBuilder + ThumbnailBuilder (mini-icono al
 * lado del texto) porque no renderizaba la imagen de forma confiable.
 * Ahora "thumbnail" e "image" se muestran juntos en la misma galería de medios,
 * que es el patrón confirmado que sí funciona.
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

  // 🏷️ Título + descripción
  const textParts = [];
  if (title) textParts.push(`### ${title}`);
  if (description) textParts.push(description);

  if (textParts.length > 0) {
    container.addTextDisplayComponents(td =>
      td.setContent(textParts.join("\n\n"))
    );
  }

  // 🖼️ Galería de imágenes (thumbnail + image juntos, en ese orden)
  const galeria = [thumbnail, image].filter(Boolean);

  if (galeria.length > 0) {
    container.addSeparatorComponents(sep =>
      sep.setSpacing(SeparatorSpacingSize.Small).setDivider(true)
    );

    container.addMediaGalleryComponents(gallery => {
      for (const url of galeria) {
        gallery.addItems(item => item.setURL(url));
      }
      return gallery;
    });
  }

  // 📝 Footer (subtexto pequeño de Discord)
  if (footer) {
    container.addSeparatorComponents(sep =>
      sep.setSpacing(SeparatorSpacingSize.Small).setDivider(true)
    );
    container.addTextDisplayComponents(td =>
      td.setContent(`-# ${footer}`)
    );
  }

  return container;
}
