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
        const specifiedUser = interaction.options.getString('user')

        if (specifiedUser) {
            const membersList = await interaction.guild.members.fetch({query: specifiedUser});
            const matchId = Array.from(membersList).length > 0? Array.from(membersList)[0][0] : null;
            if (matchId) {
                const matchedUser = await interaction.guild.members.fetch({user: matchId});
                // console.log(matchedUser.presence.activities);
                if (matchedUser.presence.activities.length > 0) {
                    const spotifyActivityIndex = matchedUser.presence.activities.findIndex(el => el.name === 'Spotify');
                    return interaction.reply({content:`${matchedUser.user.globalName} is listening to: \n 🎶${matchedUser.presence.activities[spotifyActivityIndex].details} by ${matchedUser.presence.activities[spotifyActivityIndex].state} on album ${matchedUser.presence.activities[spotifyActivityIndex].assets.largeText}🎶\n Check it out on Spotify: https://open.spotify.com/track/${matchedUser.presence.activities[spotifyActivityIndex].syncId}`})
                } else return interaction.reply({content: `${matchedUser.user.globalName} is not listening to Spotify!`, ephemeral: true})
                // interaction.reply(`<@${matchId}>`) 
            } 
            else return interaction.reply({content: 'No user found', ephemeral:true});
        }
        if (interaction.member.presence.activities.length > 0) {
            const spotifyActivityIndex = interaction.member.presence.activities.findIndex(el => el.name === 'Spotify');
            interaction.reply({content:`Now playing: \n🎶${interaction.member.presence.activities[spotifyActivityIndex].details} by ${interaction.member.presence.activities[spotifyActivityIndex].state} on album ${interaction.member.presence.activities[spotifyActivityIndex].assets.largeText}🎶\n Check it out on Spotify: https://open.spotify.com/track/${interaction.member.presence.activities[spotifyActivityIndex].syncId}`})
        } else interaction.reply({content: 'No Spotify song playing!', ephemeral: true})
    }
}