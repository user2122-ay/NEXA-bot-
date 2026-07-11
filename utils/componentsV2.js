import {
  ContainerBuilder,
  SeparatorSpacingSize,
  MessageFlags
} from "discord.js";

// 🔧 Convierte un color HEX ("#5865F2") a entero, que es lo que pide setAccentColor
export function hexToInt(hex) {
  if (!hex) return null;
  return parseInt(hex.replace("#", ""), 16);
}

// 🏳️ Flag necesaria para poder enviar componentes V2 (Contenedores, TextDisplay, etc.)
export const V2_FLAGS = MessageFlags.IsComponentsV2;

/**
 * Construye un Container genérico tipo "info card":
 * título + descripción (opcionalmente junto a un thumbnail), imagen grande abajo, y footer.
 *
 * Reemplaza al patrón viejo de EmbedBuilder que se repetía en welcome/goodbye/embed/logs.
 */
export function buildInfoContainer({
  title,
  description,
  color,
  imageUrl,
  thumbnailUrl,
  footerText
} = {}) {

  const container = new ContainerBuilder();

  if (color) {
    container.setAccentColor(hexToInt(color));
  }

  // 📝 Texto principal (título en negrita + descripción)
  const textParts = [];
  if (title) textParts.push(`## ${title}`);
  if (description) textParts.push(description);

  if (textParts.length > 0) {

    if (thumbnailUrl) {
      // Si hay thumbnail, va en una Section con el texto al lado
      container.addSectionComponents(
        section => section
          .addTextDisplayComponents(
            td => td.setContent(textParts.join("\n\n"))
          )
          .setThumbnailAccessory(
            thumb => thumb.setURL(thumbnailUrl)
          )
      );
    } else {
      container.addTextDisplayComponents(
        td => td.setContent(textParts.join("\n\n"))
      );
    }
  }

  // 🌄 Imagen grande (media gallery)
  if (imageUrl) {
    container.addSeparatorComponents(
      sep => sep.setSpacing(SeparatorSpacingSize.Small)
    );

    container.addMediaGalleryComponents(
      gallery => gallery.addItems(
        item => item.setURL(imageUrl)
      )
    );
  }

  // 📌 Footer (texto pequeño con separador arriba)
  if (footerText) {
    container.addSeparatorComponents(
      sep => sep.setSpacing(SeparatorSpacingSize.Small).setDivider(true)
    );

    container.addTextDisplayComponents(
      td => td.setContent(`-# ${footerText}`)
    );
  }

  return container;
}

