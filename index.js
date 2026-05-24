require('dotenv').config();

console.log("Iniciando Umbra...");

const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ActivityType,
  SlashCommandBuilder,
  REST,
  Routes,
  PermissionFlagsBits
} = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ]
});

const commands = [
  new SlashCommandBuilder()
    .setName('painel-beneficios')
    .setDescription('Envia o painel de benefícios da Noctra Core')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
  
].map(command => command.toJSON());
client.once('clientReady', async () => {
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

  const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

  try {
    await rest.put(
      Routes.applicationCommands(client.user.id),
      { body: commands }
    );

    console.log('🌙 Comandos da Umbra registrados!');
  } catch (error) {
    console.log('Erro ao registrar comandos:', error);
  }
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
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'painel-beneficios') {
    const embed = new EmbedBuilder()
      .setColor('#8b5cf6')
      .setTitle('☾ Benefícios da Noctra Core')
      .setDescription(
        `Impulsione a **Noctra Core** e ajude nossa comunidade a crescer.\n\n` +
        `Ao apoiar o servidor com boost, você desbloqueia benefícios especiais dentro da comunidade.`
      )
      .addFields(
        {
          name: '✦ Benefícios',
          value:
            `🌙 Cargo especial de Booster\n` +
            `✨ Acesso VIP Noctra\n` +
            `🎁 Participação em sorteios\n` +
            `📖 Prioridade em pedidos\n` +
            `🖤 Acesso a canais exclusivos`,
          inline: false
        },
        {
          name: '☾ Como resgatar',
          value:
            `Após impulsionar o servidor, a **Umbra** libera seus benefícios automaticamente.\n\n` +
            `Caso algo não apareça, abra um ticket para a staff verificar.`,
          inline: false
        }
      )
      .setFooter({
        text: 'Umbra • Sistema de Benefícios da Noctra Core'
      })
      .setTimestamp();

    await interaction.channel.send({
      embeds: [embed]
    });

    await interaction.reply({
      content: 'Painel de benefícios enviado.',
      ephemeral: true
    });
  }
});

client.login(process.env.TOKEN);
