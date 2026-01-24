import type { ChatInputCommandInteraction } from "discord.js";

const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("fortune")
    .setDescription("See your fortune."),
  async execute(interaction: ChatInputCommandInteraction) {
    const fortuneStarters = [
      "You will",
      "Very soon, you will",
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
      "The prophecy has foretold that you will",
      "It is written in the stars that you will",
      "The universe has decreed that you will",
      "The gods have spoken and say that you will",
      "You are destined to",
      "Your fate is sealed and you will",
      "The crystal ball reveals that you will",
      "The tarot cards indicate that you will",
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
      "become best friends with",
      "go on a wild adventure with",
      "discover a hidden talent for",
      "fall deeply in love with",
      "have a fierce rivalry with",
      "uncover a dark secret about",
      "embark on a perilous quest with",
      "make a pact with",
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
      "mystical",
      "ancient",
      "forgotten",
      "legendary",
      "mythical",
      "powerful",
      "weak",
      "strong",
      "feeble",
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
      "shitter",
      "dragon",
      "unicorn",
      "mermaid",
      "vampire",
      "werewolf",
      "zombie",
      "alien",
      "robot uprising",
    ];

    const starter = fortuneStarters[selectRandomArrayIndex(fortuneStarters)];
    const action = fortuneActions[selectRandomArrayIndex(fortuneActions)];
    const adjective =
      fortuneAdjectives[selectRandomArrayIndex(fortuneAdjectives)];
    const subject = fortuneSubjects[selectRandomArrayIndex(fortuneSubjects)];

    const aOrAn = () => {
      if (
        adjective[0] === "a" ||
        adjective[0] === "e" ||
        adjective[0] === "i" ||
        adjective[0] === "o" ||
        adjective[0] === "u"
      )
        return "an";
      return "a";
    };

    const sentence = `${starter} ${action} ${aOrAn()} ${adjective} ${subject}`;

    interaction.reply({
      content: sentence,
      allowedMentions: { repliedUser: false },
    });
  },
};

function selectRandomArrayIndex(array: any[]) {
  return Math.floor(Math.random() * array.length);
}
