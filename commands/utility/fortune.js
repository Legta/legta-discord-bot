const {SlashCommandBuilder} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder().setName("fortune").setDescription("See your fortune."),
    async execute(interaction) {

        const fortuneStarters = [
            "You will",
            "You want to",
            "You feel like you need to",
            "Your friend will",
            "Today, you will",
            "Tomorrow, you will",
            "In the near future, you will",
            "God says",
            "You will witness Swadley",
            "You will witness Dubby",
            "You will witness Joy",
            "You will witness Keith",
            "You will witness Legta",
            "You will witness Rubi",
            "Nigga, please",
            "There is no time to explain, you have to",
            "Dubby will",
            "Swadley FINALLY gets to",
        ];
        const fortuneActions = [
            "meet",
            "kill",
            "kiss",
            "eat",
            "love",
            "hate",
            "learn about",
            "forget about",
            "rimjob",
            "flicker goon with",
            "frot with",
            "get cucked by",
            "get destroyed by",
            "get",
            "get pegged by",
            "get struck by",
            "play Brawlhalla with",
            "wrestle with",
            "have hot sweaty dirty sex with",
            "get killed by",
            "get diarrhea caused by eating",
        ];
        const fortuneAdjectives = [
            "dark",
            "nice",
            "ugly",
            "black",
            "beautiful",
            "strange",
            "funny",
            "sad",
            "cummy",
            "autistic",
            "cute",
            "kawaii",
            "peruvian",
            "bolivian",
            "american",
            "sexual",
            "sexy",
            "drooling",
            "white",
            "finger lickin' good",
            "supreme",
            "sudden",
            "mystical"
        ];
        const fortuneSubjects = [
            "man",
            "girl",
            "fish",
            "lightning",
            "dwarf",
            "cum",
            "Legta",
            "Zettyns",
            "robot",
            "ghost",
            "Keith",
            "Seikuz",
            "Dubby",
            "femboy",
            "femgirl",
            "furry",
            "motherfucker",
            "cuck",
            "bitch",
            "mf",
            "Swadley",
            "midget",
            "job",
            "urge to shit",
            "five guys",
            "Pikachu",
            "Fortnite",
            "fucker",
            "shitter"
        ];

        const starter = fortuneStarters[selectRandomArrayIndex(fortuneStarters)];
        const action = fortuneActions[selectRandomArrayIndex(fortuneActions)];
        const adjective = fortuneAdjectives[selectRandomArrayIndex(fortuneAdjectives)];
        const subject = fortuneSubjects[selectRandomArrayIndex(fortuneSubjects)];

        const aOrAn = () => {
            if (adjective[0] === "a" || adjective[0] === "e" || adjective[0] === "i" || adjective[0] === "o" || adjective[0] === "u") return "an";
            return "a";
        }

        const sentence = `${starter} ${action} ${aOrAn()} ${adjective} ${subject}`;

        interaction.reply({
            content: sentence,
            allowedMentions: {repliedUser: false}
        })

    }
}

function selectRandomArrayIndex (array) {
    return Math.floor(Math.random() * array.length);
}