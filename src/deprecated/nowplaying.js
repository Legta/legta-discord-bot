const {SlashCommandBuilder, PresenceManager} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('nowplaying')
    .setDescription('Display the song you are currently listening to on Spotify if it shows in your status')
    .addStringOption(option => 
        option.setName('user')
        .setDescription('Specify a user to see what they are listening to.')
        .setRequired(false)),

    async execute (interaction) {
        const specifiedUser = interaction.options.getString('user');
        const commandUserMember = interaction.member;

        if (specifiedUser) {
            const membersList = await interaction.guild.members.fetch(); //fetches a collection of all server members
            const filteredMembers = membersList.filter(member => !member.user.bot) //filters out bots from members collection 
            const idAfterFilter = filteredMembers.find(member => member.user.username.toLowerCase().includes(specifiedUser) || member.user.globalName.toLowerCase().includes(specifiedUser) || (member.nickname !== null && member.nickname.toLowerCase().includes(specifiedUser))) //finds the user in the collection
            const matchId = idAfterFilter !== undefined?  idAfterFilter.user.id : undefined
            if (matchId !== undefined) {
                const matchedUser = await interaction.guild.members.fetch({user: matchId});
                if (matchedUser.user.bot) return interaction.reply({content: `${matchedUser.user.username} is a bot!`, ephemeral: true}); //if user is a bot, return
                if (!matchedUser.presence) return interaction.reply({content: `${matchedUser.user.globalName} is not listening to Spotify!`, ephemeral: true}); //if presence is null, return
                if (matchedUser.presence.status === 'offline') return interaction.reply({content: `${matchedUser.user.globalName} is not listening to Spotify!`, ephemeral: true});; //if presence is offline for some reason, return
                const spotifyActivityIndex = matchedUser.presence.activities.findIndex(el => el.name === 'Spotify');
                return spotifyActivityIndex !== -1 ? interaction.reply({content:`${matchedUser.user.globalName} is listening to: \n 🎶${matchedUser.presence.activities[spotifyActivityIndex].details} by ${matchedUser.presence.activities[spotifyActivityIndex].state} on album ${matchedUser.presence.activities[spotifyActivityIndex].assets.largeText}🎶\n Check it out on Spotify: https://open.spotify.com/track/${matchedUser.presence.activities[spotifyActivityIndex].syncId}`}) : interaction.reply({content: `${matchedUser.user.globalName} is not listening to Spotify!`, ephemeral: true});
            } 
            else return interaction.reply({content: 'No user found', ephemeral:true});
        }
        if (interaction.user.bot) return interaction.reply({content: `You are a bot, you should not be seeing this message!`, ephemeral: true}); //if user is a bot, return
        if (!commandUserMember.presence) return interaction.reply({content: `You are offline! Can't see what you're playing`, ephemeral: true}); //if presence is null, return
        if (commandUserMember.presence.status === 'offline') return interaction.reply({content: `You are offline! Can't see what you're playing`, ephemeral: true}); //if presence is offline for some reason, return
        const spotifyActivityIndex = commandUserMember.presence.activities.findIndex(el => el.name === 'Spotify');
        return spotifyActivityIndex !== -1 ? interaction.reply({content:`${commandUserMember.user.globalName} is listening to: \n 🎶${commandUserMember.presence.activities[spotifyActivityIndex].details} by ${commandUserMember.presence.activities[spotifyActivityIndex].state} on album ${commandUserMember.presence.activities[spotifyActivityIndex].assets.largeText}🎶\n Check it out on Spotify: https://open.spotify.com/track/${commandUserMember.presence.activities[spotifyActivityIndex].syncId}`}) : interaction.reply({content: `You are not listening to Spotify!`, ephemeral: true});
    }
}