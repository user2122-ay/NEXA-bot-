import ReactionRole
from "../models/ReactionRole.js";

export default {

  name: "messageReactionAdd",

  async execute(
    reaction,
    user
  ) {

    try {

      if (user.bot) return;

      if (reaction.partial)
        await reaction.fetch();

      const data =
        await ReactionRole.findOne({

          guildId:
            reaction.message.guild.id,

          messageId:
            reaction.message.id,

          emoji:
            reaction.emoji.name

        });

      if (!data) return;

      const member =
        await reaction.message.guild.members.fetch(
          user.id
        );

      await member.roles.add(
        data.roleId
      );

    } catch (error) {

      console.error(
        "REACTION ROLE ADD:",
        error
      );

    }

  }

};
