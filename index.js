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
    ),

  new SlashCommandBuilder()
    .setName('teste-boost')
    .setDescription('Testa o sistema de boost da Umbra')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  new SlashCommandBuilder()
    .setName('remover-teste-boost')
    .setDescription('Remove os cargos de teste de boost')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)

].map(command => command.toJSON());

client.once('clientReady', async () => {
  console.log(`🌙 ${client.user.tag} está online!`);

const status = [
  'os boosts da Noctra',
  'o Booster Plus',
  'os benefícios dos apoiadores',
  'a energia da comunidade'
];

let statusIndex = 0;

setInterval(() => {
  client.user.setPresence({
    activities: [
      {
        name: status[statusIndex],
        type: ActivityType.Watching
      }
    ],
    status: 'online'
  });

  statusIndex = (statusIndex + 1) % status.length;
}, 30000);

  const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

  try {
    await rest.put(
      Routes.applicationGuildCommands(client.user.id, process.env.GUILD_ID),
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
  const cargoApoiador = newMember.guild.roles.cache.get(process.env.APOIADOR_ROLE_ID);
  const cargoBoosterPlus = newMember.guild.roles.cache.get(process.env.BOOSTER_PLUS_ROLE_ID);
  if (!antesBoostava && agoraBoosta) {
    if (cargoBooster) await newMember.roles.add(cargoBooster).catch(() => {});
    if (cargoVip) await newMember.roles.add(cargoVip).catch(() => {});
    if (cargoApoiador) await newMember.roles.add(cargoApoiador).catch(() => {});
    if (cargoBoosterPlus && newMember.guild.premiumSubscriptionCount >= 2) {
  await newMember.roles.add(cargoBoosterPlus).catch(() => {});
}

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
      .addFields({
        name: '✦ Benefícios liberados',
        value:
          `${cargoBooster ? cargoBooster : 'Cargo Booster Noctra'}\n` +
          `${cargoVip ? cargoVip : 'Cargo VIP Noctra'}\n` +
          `Acesso a canais especiais\n` +
          `Prioridade em pedidos\n` +
          `Participação em sorteios futuros`,
        inline: false
      })
      .setThumbnail(newMember.user.displayAvatarURL({ size: 1024 }))
      .setFooter({ text: 'Umbra • Sistema de Benefícios' })
      .setTimestamp();

    if (canalBoost) {
      await canalBoost.send({
        content: `🌙 ${newMember}, obrigada pelo boost!`,
        embeds: [embed]
      });
    }

    if (canalLogs) {
      await canalLogs.send({
        embeds: [
          new EmbedBuilder()
            .setColor('#22c55e')
            .setTitle('☾ Novo boost detectado')
.setDescription(
  `✦ Membro: ${newMember}\n` +
  `✦ ID: ${newMember.id}\n` +
  `✦ Usuário: ${newMember.user.tag}\n` +
  `✦ Boost detectado com sucesso\n` +
  `✦ Cargos entregues: Booster, Booster Plus e VIP`
)
.setThumbnail(newMember.user.displayAvatarURL({ size: 1024 }))
.setFooter({ text: 'Umbra • Logs de Boost' })
            .setTimestamp()
        ]
      });
    }

await newMember.send({
  embeds: [
    new EmbedBuilder()
      .setColor('#8b5cf6')
      .setTitle('☾ Obrigada por impulsionar a Noctra Core')
      .setDescription(
        `Seu apoio fortalece a comunidade e ajuda a Noctra a continuar crescendo.\n\n` +
        `A Umbra liberou seus benefícios automaticamente.`
      )
      .addFields({
        name: '✦ Benefícios liberados',
        value:
          `🌙 Cargo Booster\n` +
           `🌑 Booster Plus\n` +
          `✨ Cargo VIP\n` +
          `🎁 Participação em sorteios\n` +
          `📖 Prioridade em pedidos`
      })
      .setThumbnail(newMember.user.displayAvatarURL({ size: 1024 }))
      .setImage(process.env.UMBRA_BANNER)
      .setFooter({ text: 'Umbra • Sistema de Benefícios' })
      .setTimestamp()
  ]
}).catch(() => {});

    return;
  }

  if (antesBoostava && !agoraBoosta) {
    if (cargoBooster) await newMember.roles.remove(cargoBooster).catch(() => {});
    if (cargoVip) await newMember.roles.remove(cargoVip).catch(() => {});
    if (cargoApoiador) await newMember.roles.remove(cargoApoiador).catch(() => {});

    if (canalLogs) {
      await canalLogs.send({
        embeds: [
          new EmbedBuilder()
            .setColor('#ef4444')
            .setTitle('☾ Boost encerrado')
.setDescription(
  `✦ Membro: ${newMember}\n` +
  `✦ ID: ${newMember.id}\n` +
  `✦ Usuário: ${newMember.user.tag}\n` +
  `✦ Boost encerrado\n` +
  `✦ Benefícios removidos: Booster, Booster Plus e VIP`
)
.setThumbnail(newMember.user.displayAvatarURL({ size: 1024 }))
.setFooter({ text: 'Umbra • Logs de Boost' })
            .setTimestamp()
        ]
      });
    }
if (cargoBoosterPlus) await newMember.roles.remove(cargoBoosterPlus).catch(() => {});

await newMember.send({
  embeds: [
    new EmbedBuilder()
      .setColor('#ef4444')
      .setTitle('☾ Boost encerrado')
      .setDescription(
        `Seu boost não está mais ativo.\n\n` +
        `Os benefícios foram removidos automaticamente pela Umbra.`
      )
      .addFields({
        name: '✦ Benefícios removidos',
        value:
          `🌙 Cargo Booster\n` +
          `🌑 Booster Plus\n` +
          `✨ Cargo VIP`
      })
      .setThumbnail(newMember.user.displayAvatarURL({ size: 1024 }))
      .setImage(process.env.UMBRA_BANNER)
      .setFooter({ text: 'Umbra • Sistema de Benefícios' })
      .setTimestamp()
  ]
}).catch(() => {});
    return;
  }
});
client.on('interactionCreate', async (interaction) => {
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
          `Se os cargos não aparecerem, abra um ticket para a staff verificar.`,
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
if (interaction.customId === 'ticket_booster') {
  const cargoStaffId = process.env.STAFF_ROLE_ID;

  const canal = await interaction.guild.channels.create({
    name: `booster-${interaction.user.username}`,
    type: ChannelType.GuildText,
    permissionOverwrites: [
      {
        id: interaction.guild.id,
        deny: ['ViewChannel']
      },
      {
        id: interaction.user.id,
        allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory']
      },
      {
        id: cargoStaffId,
        allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory']
      }
    ]
  });

  await canal.send({
    embeds: [
      new EmbedBuilder()
        .setColor('#8b5cf6')
        .setTitle('🎫 Ticket Booster')
        .setDescription(
          `${interaction.user}, bem-vindo ao seu ticket.\n\n` +
          `Explique qual benefício deseja solicitar para a **Equipe Noctra**.`
        )
        .setFooter({ text: 'Umbra • Atendimento Booster' })
        .setTimestamp()
    ]
  });

  await interaction.reply({
    content: `Seu ticket foi criado: ${canal}`,
    ephemeral: true
  });
}
    return;
  }

  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'teste-boost') {
    const membro = interaction.member;

    const canalBoost = interaction.guild.channels.cache.get(process.env.BOOST_CHANNEL_ID);
    const canalLogs = interaction.guild.channels.cache.get(process.env.LOG_CHANNEL_ID);

    const cargoBooster = interaction.guild.roles.cache.get(process.env.BOOSTER_ROLE_ID);
    const cargoVip = interaction.guild.roles.cache.get(process.env.VIP_ROLE_ID);
    const cargoApoiador = interaction.guild.roles.cache.get(process.env.APOIADOR_ROLE_ID);
    const cargoBoosterPlus = interaction.guild.roles.cache.get(process.env.BOOSTER_PLUS_ROLE_ID);

    if (cargoBooster) await membro.roles.add(cargoBooster).catch(() => {});
    if (cargoVip) await membro.roles.add(cargoVip).catch(() => {});
    if (cargoApoiador) await membro.roles.add(cargoApoiador).catch(() => {});
    if (cargoBoosterPlus) await membro.roles.add(cargoBoosterPlus).catch(() => {});

const embedTeste = new EmbedBuilder()
  .setColor('#8b5cf6')
  .setTitle('☾ Teste de Boost realizado')
  .setDescription(
    `${membro} simulou um boost na **Noctra Core**.\n\n` +
    `A Umbra entregou os benefícios de teste com sucesso.`
  )
  .addFields({
    name: '✦ Cargos entregues',
    value:
      `${cargoBooster ? cargoBooster : 'Booster não encontrado'}\n` +
      `${cargoBoosterPlus ? cargoBoosterPlus : 'Booster Plus não encontrado'}\n` +
      `${cargoVip ? cargoVip : 'VIP não encontrado'}\n` +
      `${cargoApoiador ? cargoApoiador : 'Apoiador VIP não encontrado'}`,
    inline: false
  })
  .setThumbnail(interaction.user.displayAvatarURL({ size: 1024 }))
  .setFooter({ text: 'Umbra • Teste do Sistema de Boost' })
  .setTimestamp();

if (canalBoost) {
  await canalBoost.send({
    content: `🌙 Teste de boost realizado por ${membro}.`,
    embeds: [embedTeste]
  });
}

if (canalLogs) {
  await canalLogs.send({
    embeds: [
      new EmbedBuilder()
        .setColor('#22c55e')
        .setTitle('☾ Log de teste de boost')
        .setDescription(
          `Um teste de boost foi executado.\n\n` +
          `✦ Membro: ${membro}\n` +
          `✦ Resultado: cargos entregues\n` +
          `✦ Sistema: Umbra Boost`
        )
        .setThumbnail(interaction.user.displayAvatarURL({ size: 1024 }))
        .setFooter({ text: 'Umbra • Logs de Teste' })
        .setTimestamp()
    ]
  });
}

await interaction.reply({
  content: '☾ Teste de boost concluído. Verifique os cargos, o canal de boost e o canal de logs.',
  ephemeral: true
});

return;
}
if (interaction.commandName === 'remover-teste-boost') {
  const membro = interaction.member;

  const canalLogs = interaction.guild.channels.cache.get(process.env.LOG_CHANNEL_ID);

  const cargoBooster = interaction.guild.roles.cache.get(process.env.BOOSTER_ROLE_ID);
  const cargoVip = interaction.guild.roles.cache.get(process.env.VIP_ROLE_ID);
  const cargoApoiador = interaction.guild.roles.cache.get(process.env.APOIADOR_ROLE_ID);
  const cargoBoosterPlus = interaction.guild.roles.cache.get(process.env.BOOSTER_PLUS_ROLE_ID);

  if (cargoBooster) await membro.roles.remove(cargoBooster).catch(() => {});
  if (cargoVip) await membro.roles.remove(cargoVip).catch(() => {});
  if (cargoApoiador) await membro.roles.remove(cargoApoiador).catch(() => {});
  if (cargoBoosterPlus) await membro.roles.remove(cargoBoosterPlus).catch(() => {});

  if (canalLogs) {
    await canalLogs.send({
      embeds: [
        new EmbedBuilder()
          .setColor('#ef4444')
          .setTitle('☾ Teste de remoção de boost')
          .setDescription(
            `Os cargos de teste foram removidos.\n\n` +
            `✦ Membro: ${membro}\n` +
            `✦ Removidos: Booster, Booster Plus e VIP`
          )
          .setThumbnail(interaction.user.displayAvatarURL({ size: 1024 }))
          .setFooter({ text: 'Umbra • Logs de Teste' })
          .setTimestamp()
      ]
    });
  }

  await interaction.reply({
    content: '☾ Cargos de teste removidos com sucesso.',
    ephemeral: true
  });

  return;
}

  if (interaction.commandName === 'painel-beneficios') {
    const boostersAtivos = interaction.guild.members.cache.filter(
  member => member.premiumSince
).size;
    const canalEscolhido = interaction.options.getChannel('canal') || interaction.channel;
    const totalBoosts = interaction.guild.premiumSubscriptionCount || 0;
const nivelBoost = interaction.guild.premiumTier || 0;

    const embed = new EmbedBuilder()
      .setColor('#8b5cf6')
      .setTitle('☾ Benefícios da Noctra Core')
      .setDescription(
        `Impulsione a **Noctra Core** e desbloqueie benefícios especiais dentro da comunidade.`
      )
      .addFields(
        {
          name: '✦ Benefícios',
          value:
            `🌙 Cargo especial de Booster\n` +
            `🌑 Booster Plus\n` +
            `✨ Acesso VIP Noctra\n` +
            `🎁 Participação em sorteios\n` +
            `📖 Prioridade em pedidos`,
          inline: false
        },
        {
          name: '☾ Como funciona',
          value:
            `Depois de impulsionar o servidor, a **Umbra** entrega seus benefícios automaticamente.`,
          inline: false
        },
{
  name: '📊 Status Atual do Servidor',
  value:
    `🚀 Boosts ativos: **${totalBoosts}**\n` +
    `⭐ Nível do servidor: **${nivelBoost}**\n` +
    `👥 Boosters ativos: **${boostersAtivos}**`,
  inline: false
}
      )
.setImage(process.env.UMBRA_BANNER)
.setFooter({ text: 'Umbra • Sistema de Benefícios da Noctra Core' })
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
    .setStyle(ButtonStyle.Secondary),

  new ButtonBuilder()
    .setCustomId('ticket_booster')
    .setLabel('Ticket Booster')
    .setEmoji('🎫')
    .setStyle(ButtonStyle.Success)
);
      
    await canalEscolhido.send({
      embeds: [embed],
      components: [botoes]
    });
    const canalLogs = interaction.guild.channels.cache.get(process.env.LOG_CHANNEL_ID);

if (canalLogs) {
  await canalLogs.send({
    embeds: [
      new EmbedBuilder()
        .setColor('#8b5cf6')
        .setTitle('☾ Painel de benefícios enviado')
        .setDescription(
          `✦ Enviado por: ${interaction.user}\n` +
          `✦ Canal: ${canalEscolhido}\n` +
          `✦ Sistema: Benefícios Umbra`
        )
        .setThumbnail(interaction.user.displayAvatarURL({ size: 1024 }))
        .setTimestamp()
    ]
  });
}
    await interaction.reply({
      content: `Painel de benefícios enviado em ${canalEscolhido}.`,
      ephemeral: true
    });
  }
});

client.login(process.env.TOKEN);
