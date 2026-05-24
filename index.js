require('dotenv').config();

console.log("Iniciando Umbra...");

const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ActivityType
} = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ]
});

client.once('clientReady', () => {
  console.log(`🌙 ${client.user.tag} está online!`);

  client.user.setPresence({
    activities: [
      {
        name: 'os benefícios da Noctra Core',
        type: ActivityType.Watching
      }
    ],
    status: 'online'
  });
});

client.on('guildMemberUpdate', async (oldMember, newMember) => {
  const antesBoostava = oldMember.premiumSince;
  const agoraBoosta = newMember.premiumSince;

  const canalBoost = newMember.guild.channels.cache.get(process.env.BOOST_CHANNEL_ID);
  const canalLogs = newMember.guild.channels.cache.get(process.env.LOG_CHANNEL_ID);

  const cargoBooster = newMember.guild.roles.cache.get(process.env.BOOSTER_ROLE_ID);
  const cargoVip = newMember.guild.roles.cache.get(process.env.VIP_ROLE_ID);

  // Quando a pessoa começa a boostar
  if (!antesBoostava && agoraBoosta) {
    if (cargoBooster) await newMember.roles.add(cargoBooster).catch(() => {});
    if (cargoVip) await newMember.roles.add(cargoVip).catch(() => {});

    const embed = new EmbedBuilder()
      .setColor('#8b5cf6')
      .setTitle('☾ A Noctra foi fortalecida')
      .setDescription(
        `${newMember} acabou de impulsionar a **Noctra Core**.\n\n` +
        `A escuridão reconheceu sua contribuição e seus benefícios foram liberados.\n\n` +
        `✦ Cargo Booster Noctra\n` +
        `✦ Cargo VIP Noctra\n` +
        `✦ Acesso a canais especiais\n` +
        `✦ Prioridade em pedidos\n` +
        `✦ Participação em sorteios futuros\n\n` +
        `Obrigada por apoiar a Noctra. 🌙`
      )
      .setThumbnail(newMember.user.displayAvatarURL({ size: 1024 }))
      .setFooter({
        text: 'Umbra • Sistema de Benefícios'
      })
      .setTimestamp();

    if (canalBoost) {
      await canalBoost.send({
        content: `🌙 ${newMember} obrigada pelo boost!`,
        embeds: [embed]
      });
    }

    if (canalLogs) {
      await canalLogs.send({
        content:
          `☾ **Novo boost detectado**\n\n` +
          `✦ Membro: ${newMember}\n` +
          `✦ Cargos entregues: Booster e VIP`
      });
    }

    await newMember.send(
      `☾ A escuridão reconheceu sua contribuição.\n\n` +
      `Obrigada por impulsionar a **Noctra Core**.\n` +
      `Seus benefícios foram liberados no servidor.`
    ).catch(() => {});

    return;
  }

  // Quando a pessoa para de boostar
  if (antesBoostava && !agoraBoosta) {
    if (cargoBooster) await newMember.roles.remove(cargoBooster).catch(() => {});
    if (cargoVip) await newMember.roles.remove(cargoVip).catch(() => {});

    if (canalLogs) {
      await canalLogs.send({
        content:
          `☾ **Boost removido**\n\n` +
          `✦ Membro: ${newMember}\n` +
          `✦ Benefícios removidos: Booster e VIP`
      });
    }

    await newMember.send(
      `☾ Seu boost na **Noctra Core** foi encerrado.\n\n` +
      `Os benefícios de booster foram removidos automaticamente.\n` +
      `Obrigada por ter apoiado a Noctra. 🌙`
    ).catch(() => {});

    return;
  }
});

client.login(process.env.TOKEN);