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
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType
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
    .addChannelOption(option =>
      option
        .setName('canal')
        .setDescription('Canal onde o painel será enviado')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(false)
    )
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

  if (!antesBoostava && agoraBoosta) {
    if (cargoBooster) await newMember.roles.add(cargoBooster).catch(() => {});
    if (cargoVip) await newMember.roles.add(cargoVip).catch(() => {});

    const embed = new EmbedBuilder()
      .setColor('#8b5cf6')
      .setAuthor({
        name: 'Novo Boost na Noctra Core',
        iconURL: newMember.user.displayAvatarURL({ size: 1024 })
      })
      .setTitle('☾ A Noctra foi fortalecida')
      .setDescription(
        `${newMember} impulsionou a **Noctra Core**.\n\n` +
        `A Umbra reconheceu sua contribuição e liberou seus benefícios especiais.`
      )
      .addFields(
        {
          name: '✦ Benefícios liberados',
          value:
            `${cargoBooster ? `${cargoBooster}` : 'Cargo Booster Noctra'}\n` +
            `${cargoVip ? `${cargoVip}` : 'Cargo VIP Noctra'}\n` +
            `Acesso a canais especiais\n` +
            `Prioridade em pedidos\n` +
            `Participação em sorteios futuros`,
          inline: false
        }
      )
      .setThumbnail(newMember.user.displayAvatarURL({ size: 1024 }))
      .setFooter({
        text: 'Umbra • Sistema de Benefícios'
      })
      .setTimestamp();

    if (canalBoost) {
      await canalBoost.send({
        content: `🌙 ${newMember}, obrigada pelo boost!`,
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
  if (interaction.isChatInputCommand()) {
    if (interaction.commandName === 'painel-beneficios') {
      const canalEscolhido = interaction.options.getChannel('canal') || interaction.channel;

      const cargoBooster = interaction.guild.roles.cache.get(process.env.BOOSTER_ROLE_ID);
      const cargoVip = interaction.guild.roles.cache.get(process.env.VIP_ROLE_ID);

      const embed = new EmbedBuilder()
        .setColor('#8b5cf6')
        .setTitle('☾ Benefícios da Noctra Core')
        .setDescription(
          `Impulsione a **Noctra Core** e ajude nossa comunidade a crescer.\n\n` +
          `Quem apoia o servidor recebe benefícios especiais, cargos exclusivos e acesso a vantagens dentro da comunidade.`
        )
        .addFields(
          {
            name: '✦ Benefícios de Booster',
            value:
              `🌙 ${cargoBooster ? `${cargoBooster}` : 'Cargo especial de Booster'}\n` +
              `✨ ${cargoVip ? `${cargoVip}` : 'Acesso VIP Noctra'}\n` +
              `🎁 Participação em sorteios\n` +
              `📖 Prioridade em pedidos\n` +
              `🖤 Acesso a canais exclusivos`,
            inline: false
          },
          {
            name: '☾ Como funciona',
            value:
              `Depois de impulsionar o servidor, a **Umbra** entrega seus benefícios automaticamente.\n\n` +
              `Se algo não aparecer, abra um ticket para a staff verificar.`,
            inline: false
          },
          {
            name: '✦ Observação',
            value:
              `Os benefícios ficam ativos enquanto o boost estiver ativo no servidor.`,
            inline: false
          }
        )
        .setFooter({
          text: 'Umbra • Sistema de Benefícios da Noctra Core'
        })
        .setTimestamp();

      const botoes = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('beneficios_ver')
          .setLabel('Ver benefícios')
          .setEmoji('🌙')
          .setStyle(ButtonStyle.Secondary),

        new ButtonBuilder()
          .setCustomId('beneficios_resgatar')
          .setLabel('Como resgatar')
          .setEmoji('✨')
          .setStyle(ButtonStyle.Primary),

        new ButtonBuilder()
          .setCustomId('beneficios_duvidas')
          .setLabel('Dúvidas')
          .setEmoji('🖤')
          .setStyle(ButtonStyle.Secondary)
      );

      await canalEscolhido.send({
        embeds: [embed],
        components: [botoes]
      });

      await interaction.reply({
        content: `Painel de benefícios enviado em ${canalEscolhido}.`,
        ephemeral: true
      });
    }
  }

  if (interaction.isButton()) {
    if (interaction.customId === 'beneficios_ver') {
      await interaction.reply({
        content:
          `☾ **Benefícios de Booster da Noctra Core**\n\n` +
          `🌙 Cargo especial de Booster\n` +
          `✨ Cargo VIP Noctra\n` +
          `🎁 Sorteios futuros\n` +
          `📖 Prioridade em pedidos\n` +
          `🖤 Canais exclusivos`,
        ephemeral: true
      });
    }

    if (interaction.customId === 'beneficios_resgatar') {
      await interaction.reply({
        content:
          `☾ Após impulsionar o servidor, a **Umbra** tenta entregar seus cargos automaticamente.\n\n` +
          `Se os cargos não aparecerem, abra um ticket e envie um print do boost para a staff verificar.`,
        ephemeral: true
      });
    }

    if (interaction.customId === 'beneficios_duvidas') {
      await interaction.reply({
        content:
          `☾ Caso tenha dúvidas sobre os benefícios, fale com a staff ou abra um ticket no servidor.`,
        ephemeral: true
      });
    }
  }
});

client.login(process.env.TOKEN);
