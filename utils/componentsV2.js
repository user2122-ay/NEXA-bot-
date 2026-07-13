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

/**
 * Construye un Container para logs: título + lista de campos (nombre: valor),
 * en vez del sistema de "fields" en columnas que tenían los embeds.
 * Pensado para reemplazar el patrón repetido en events/*Log*.js.
 *
 * fields: [{ name: "📢 Canal", value: "#general" }, ...]
 * (los campos con value vacío/null se omiten automáticamente)
 */
export function buildLogContainer({ color, title, fields = [], footer }) {
  const container = new ContainerBuilder();

  const accentColor = hexToInt(color);
  if (accentColor !== null) {
    container.setAccentColor(accentColor);
  }

  const lines = [];
  if (title) lines.push(`### ${title}`);

  for (const field of fields) {
    if (field.value === undefined || field.value === null || field.value === "") continue;
    lines.push(`**${field.name}**\n${field.value}`);
  }

  if (lines.length > 0) {
    container.addTextDisplayComponents((td) => td.setContent(lines.join("\n\n")));
  }

  if (footer) {
    container.addSeparatorComponents((sep) =>
      sep.setSpacing(SeparatorSpacingSize.Small).setDivider(true)
    );
    container.addTextDisplayComponents((td) => td.setContent(`-# ${footer}`));
  }

  return container;
}
