import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';
import 'dotenv/config';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');

  // Create lesson categories
  const faith = await prisma.lessonCategory.upsert({
    where: { slug: 'faith' },
    update: {},
    create: {
      name: 'Faith',
      slug: 'faith',
      description: 'Biblical values, wisdom, and character building',
      iconName: 'Heart',
      color: '#7C3AED',
      sortOrder: 0,
    },
  });

  const language = await prisma.lessonCategory.upsert({
    where: { slug: 'language' },
    update: {},
    create: {
      name: 'Language',
      slug: 'language',
      description: 'Heritage language learning and communication skills',
      iconName: 'Languages',
      color: '#2563EB',
      sortOrder: 1,
    },
  });

  const culture = await prisma.lessonCategory.upsert({
    where: { slug: 'culture' },
    update: {},
    create: {
      name: 'Culture',
      slug: 'culture',
      description: 'Cultural understanding, traditions, and history',
      iconName: 'Globe',
      color: '#D97706',
      sortOrder: 2,
    },
  });

  const digitalWisdom = await prisma.lessonCategory.upsert({
    where: { slug: 'digital-wisdom' },
    update: {},
    create: {
      name: 'Digital Wisdom',
      slug: 'digital-wisdom',
      description: 'Safe technology skills and digital literacy',
      iconName: 'Cpu',
      color: '#059669',
      sortOrder: 3,
    },
  });

  console.log('Created categories:', { faith: faith.id, language: language.id, culture: culture.id, digitalWisdom: digitalWisdom.id });

  // Seed Faith lessons
  const faithLessons = [
    {
      categoryId: faith.id,
      title: 'The Good Samaritan',
      slug: 'the-good-samaritan',
      description: 'Learn about kindness and helping others through the parable of the Good Samaritan.',
      difficulty: 'BEGINNER' as const,
      durationMinutes: 5,
      tokenReward: 10,
      sortOrder: 0,
      isFeatured: true,
      status: 'PUBLISHED' as const,
      content: {
        blocks: [
          { type: 'text', content: 'Jesus told a story about a man who was traveling from Jerusalem to Jericho. Along the way, robbers attacked him, took his belongings, and left him hurt by the road.' },
          { type: 'verse', reference: 'Luke 10:33-34', text: 'But a Samaritan, as he traveled, came where the man was; and when he saw him, he took pity on him. He bandaged his wounds, pouring on oil and wine.' },
          { type: 'text', content: 'The Samaritan helped the stranger even though they were from different backgrounds. He showed that being a good neighbor means helping anyone who needs it.' },
          { type: 'reflection', prompt: 'Can you think of a time when someone was kind to you? How did it make you feel?' },
          { type: 'question', question: 'What did the Good Samaritan do when he found the hurt man?', options: ['Walked past him', 'Helped and cared for him', 'Called for help and left', 'Took his belongings'], correctIndex: 1, explanation: 'The Good Samaritan stopped, bandaged the man\'s wounds, and took care of him.' },
        ],
      },
    },
    {
      categoryId: faith.id,
      title: 'David and Goliath: Courage',
      slug: 'david-and-goliath-courage',
      description: 'Discover how young David found courage to face a giant with faith in God.',
      difficulty: 'BEGINNER' as const,
      durationMinutes: 7,
      tokenReward: 10,
      sortOrder: 1,
      status: 'PUBLISHED' as const,
      content: {
        blocks: [
          { type: 'text', content: 'Long ago, a young shepherd boy named David faced something very scary. A giant warrior named Goliath was threatening his people, and no one was brave enough to fight him.' },
          { type: 'verse', reference: '1 Samuel 17:45', text: 'David said to the Philistine, "You come against me with sword and spear and javelin, but I come against you in the name of the Lord Almighty."' },
          { type: 'text', content: 'David didn\'t have armor or a sword. He had just a sling and five smooth stones. But he had something more powerful — faith and courage.' },
          { type: 'question', question: 'What gave David the courage to face Goliath?', options: ['His armor and weapons', 'His faith in God', 'His big army', 'He wasn\'t really scared'], correctIndex: 1, explanation: 'David trusted God to help him, which gave him the courage to face the giant.' },
          { type: 'reflection', prompt: 'What is something that feels like a "giant" in your life? How can courage help you face it?' },
        ],
      },
    },
    {
      categoryId: faith.id,
      title: 'The Fruit of the Spirit',
      slug: 'fruit-of-the-spirit',
      description: 'Learn about the nine fruits of the Spirit and how to grow them in your life.',
      difficulty: 'INTERMEDIATE' as const,
      durationMinutes: 8,
      tokenReward: 15,
      sortOrder: 2,
      status: 'PUBLISHED' as const,
      content: {
        blocks: [
          { type: 'text', content: 'The Bible teaches us about special qualities that grow in our hearts when we follow God. These are called the "Fruit of the Spirit" — like fruit growing on a tree!' },
          { type: 'verse', reference: 'Galatians 5:22-23', text: 'But the fruit of the Spirit is love, joy, peace, forbearance, kindness, goodness, faithfulness, gentleness and self-control.' },
          { type: 'text', content: 'Let\'s learn what each fruit means:\n• Love — caring for others\n• Joy — happiness that comes from inside\n• Peace — feeling calm even when things are hard\n• Patience — waiting without complaining\n• Kindness — being nice and helpful\n• Goodness — doing what is right\n• Faithfulness — keeping your promises\n• Gentleness — being soft and careful with others\n• Self-control — thinking before you act' },
          { type: 'question', question: 'How many fruits of the Spirit are there?', options: ['7', '8', '9', '12'], correctIndex: 2, explanation: 'There are 9 fruits of the Spirit listed in Galatians 5:22-23.' },
          { type: 'reflection', prompt: 'Which fruit of the Spirit would you most like to grow in your life? Why?' },
        ],
      },
    },
  ];

  // Seed Language lessons
  const languageLessons = [
    {
      categoryId: language.id,
      title: 'Greetings Around the World',
      slug: 'greetings-around-the-world',
      description: 'Learn how people say hello in different languages and cultures.',
      difficulty: 'BEGINNER' as const,
      durationMinutes: 5,
      tokenReward: 10,
      sortOrder: 0,
      isFeatured: true,
      status: 'PUBLISHED' as const,
      content: {
        blocks: [
          { type: 'text', content: 'Did you know that people around the world greet each other in many different ways? Learning to say hello in another language is a wonderful way to show respect and make new friends!' },
          { type: 'vocabulary', word: 'Shalom', translation: 'Hello / Peace', pronunciation: 'shah-LOHM', example: 'In Hebrew, "Shalom" means both hello and peace.' },
          { type: 'vocabulary', word: 'Hola', translation: 'Hello', pronunciation: 'OH-lah', example: 'In Spanish, you greet someone by saying "¡Hola!"' },
          { type: 'vocabulary', word: 'Bonjour', translation: 'Good day / Hello', pronunciation: 'bohn-ZHOOR', example: 'In French, "Bonjour" literally means "good day."' },
          { type: 'vocabulary', word: 'Jambo', translation: 'Hello', pronunciation: 'JAHM-boh', example: 'In Swahili, you can greet someone with "Jambo!"' },
          { type: 'question', question: 'Which greeting means both "hello" and "peace"?', options: ['Hola', 'Shalom', 'Bonjour', 'Jambo'], correctIndex: 1, explanation: 'Shalom is a Hebrew word that means both hello and peace!' },
        ],
      },
    },
    {
      categoryId: language.id,
      title: 'Family Words in Spanish',
      slug: 'family-words-spanish',
      description: 'Learn the Spanish words for family members.',
      difficulty: 'BEGINNER' as const,
      durationMinutes: 6,
      tokenReward: 10,
      sortOrder: 1,
      status: 'PUBLISHED' as const,
      content: {
        blocks: [
          { type: 'text', content: 'Family is so important! Let\'s learn how to talk about our family members in Spanish. The word for family in Spanish is "familia" (fah-MEE-lee-ah).' },
          { type: 'vocabulary', word: 'Mamá', translation: 'Mom', pronunciation: 'mah-MAH', example: 'Mi mamá es muy cariñosa. (My mom is very loving.)' },
          { type: 'vocabulary', word: 'Papá', translation: 'Dad', pronunciation: 'pah-PAH', example: 'Mi papá cocina muy bien. (My dad cooks very well.)' },
          { type: 'vocabulary', word: 'Hermano / Hermana', translation: 'Brother / Sister', pronunciation: 'air-MAH-noh / air-MAH-nah', example: 'Tengo un hermano y una hermana. (I have a brother and a sister.)' },
          { type: 'vocabulary', word: 'Abuelo / Abuela', translation: 'Grandfather / Grandmother', pronunciation: 'ah-BWEH-loh / ah-BWEH-lah', example: 'Mis abuelos viven cerca. (My grandparents live nearby.)' },
          { type: 'question', question: 'How do you say "sister" in Spanish?', options: ['Hermano', 'Hermana', 'Abuela', 'Mamá'], correctIndex: 1, explanation: 'Hermana means sister. Hermano (with an "o") means brother.' },
        ],
      },
    },
  ];

  // Seed Culture lessons
  const cultureLessons = [
    {
      categoryId: culture.id,
      title: 'Celebrations Around the World',
      slug: 'celebrations-around-the-world',
      description: 'Discover how different cultures celebrate special occasions and holidays.',
      difficulty: 'BEGINNER' as const,
      durationMinutes: 6,
      tokenReward: 10,
      sortOrder: 0,
      isFeatured: true,
      status: 'PUBLISHED' as const,
      content: {
        blocks: [
          { type: 'text', content: 'People all around the world have special celebrations! Some celebrate with food, music, dancing, and time with family. Let\'s explore some amazing celebrations from different cultures.' },
          { type: 'text', content: '🎆 Lunar New Year — Celebrated by many Asian cultures with lanterns, dragon dances, and special meals. It\'s a time for family gatherings and new beginnings.' },
          { type: 'text', content: '🕎 Hanukkah — A Jewish celebration lasting eight nights, with candle lighting, special foods like latkes, and games with the dreidel.' },
          { type: 'text', content: '🎄 Christmas — Christians around the world celebrate the birth of Jesus with gifts, songs, nativity scenes, and time together.' },
          { type: 'text', content: '🪔 Diwali — The Hindu festival of lights, celebrated with oil lamps, fireworks, sweets, and prayers for prosperity.' },
          { type: 'question', question: 'Which celebration is known as the "Festival of Lights"?', options: ['Lunar New Year', 'Christmas', 'Diwali', 'Hanukkah'], correctIndex: 2, explanation: 'Diwali is the Hindu festival of lights, celebrated with oil lamps and fireworks. Hanukkah is also sometimes called the Festival of Lights!' },
          { type: 'reflection', prompt: 'What special celebrations does your family have? What makes them meaningful to you?' },
        ],
      },
    },
    {
      categoryId: culture.id,
      title: 'Traditional Foods and Their Stories',
      slug: 'traditional-foods-stories',
      description: 'Learn about foods from different cultures and the stories behind them.',
      difficulty: 'BEGINNER' as const,
      durationMinutes: 5,
      tokenReward: 10,
      sortOrder: 1,
      status: 'PUBLISHED' as const,
      content: {
        blocks: [
          { type: 'text', content: 'Food is one of the most wonderful ways to learn about different cultures! Many dishes have stories and traditions that have been passed down for generations.' },
          { type: 'text', content: '🍞 Challah (Jewish) — This braided bread is eaten on Shabbat (the Sabbath). The braids remind us of the connection between people and God.' },
          { type: 'text', content: '🥟 Dumplings (Chinese) — During Lunar New Year, families make dumplings together. Their shape looks like ancient gold coins, symbolizing good fortune.' },
          { type: 'text', content: '🫓 Injera (Ethiopian) — This spongy flatbread is used as both a plate and utensil! Eating from the same plate of injera brings people together.' },
          { type: 'question', question: 'Why are dumplings special during Lunar New Year?', options: ['They are the fastest to cook', 'They look like gold coins and symbolize fortune', 'They are the oldest Chinese food', 'They can only be made in winter'], correctIndex: 1, explanation: 'Dumplings resemble ancient Chinese gold coins (yuanbao) and symbolize wealth and good fortune for the new year.' },
          { type: 'reflection', prompt: 'Does your family have a special dish that you make together? What story does it tell about your heritage?' },
        ],
      },
    },
  ];

  // Seed Digital Wisdom lessons
  const digitalWisdomLessons = [
    {
      categoryId: digitalWisdom.id,
      title: 'Staying Safe Online',
      slug: 'staying-safe-online',
      description: 'Learn the basics of staying safe when using the internet.',
      difficulty: 'BEGINNER' as const,
      durationMinutes: 5,
      tokenReward: 10,
      sortOrder: 0,
      isFeatured: true,
      status: 'PUBLISHED' as const,
      content: {
        blocks: [
          { type: 'text', content: 'The internet is an amazing tool for learning and connecting with others. But just like in the real world, we need to be smart and safe online!' },
          { type: 'text', content: '🔒 Rule 1: Keep Personal Information Private\nNever share your full name, address, phone number, school name, or passwords with strangers online.' },
          { type: 'text', content: '🤔 Rule 2: Think Before You Click\nIf something looks strange or too good to be true, don\'t click on it! Ask a parent or trusted adult first.' },
          { type: 'text', content: '💬 Rule 3: Be Kind Online\nTreat others the way you want to be treated. Words can hurt even through a screen.' },
          { type: 'text', content: '🗣️ Rule 4: Talk to a Trusted Adult\nIf something online makes you uncomfortable or scared, always tell a parent or trusted adult.' },
          { type: 'question', question: 'What should you do if a stranger online asks for your address?', options: ['Tell them a fake address', 'Give them your address', 'Never share it and tell a trusted adult', 'Ignore the message but don\'t tell anyone'], correctIndex: 2, explanation: 'Never share personal information with strangers online, and always tell a trusted adult if someone asks for it.' },
        ],
      },
    },
    {
      categoryId: digitalWisdom.id,
      title: 'What is a Digital Wallet?',
      slug: 'what-is-digital-wallet',
      description: 'An introduction to digital wallets and how they keep things safe.',
      difficulty: 'INTERMEDIATE' as const,
      durationMinutes: 7,
      tokenReward: 15,
      sortOrder: 1,
      status: 'PUBLISHED' as const,
      content: {
        blocks: [
          { type: 'text', content: 'You probably know what a wallet is — it holds your money, cards, and important things. A digital wallet works the same way, but on a computer or phone!' },
          { type: 'text', content: 'A digital wallet stores things digitally:\n• It can hold digital money (like reward points)\n• It uses special codes called "keys" to keep things safe\n• Only you can access what\'s inside with your password' },
          { type: 'text', content: '🔑 Think of it like a treasure chest with a special key. Your key (password) opens the chest. If someone else gets your key, they could open your chest! That\'s why we keep passwords secret.' },
          { type: 'question', question: 'What keeps a digital wallet safe?', options: ['The color of the wallet', 'A special key or password', 'The size of the screen', 'Having lots of money in it'], correctIndex: 1, explanation: 'Digital wallets use special keys (passwords and cryptographic keys) to keep your digital items safe.' },
          { type: 'text', content: 'In FamilyVine, you earn tokens for completing lessons. These tokens are stored safely, and your parents help manage them. It\'s like having your own digital piggy bank!' },
          { type: 'reflection', prompt: 'Why do you think it\'s important to keep passwords secret? What could happen if someone else knew your password?' },
        ],
      },
    },
  ];

  // Insert all lessons
  const allLessons = [
    ...faithLessons,
    ...languageLessons,
    ...cultureLessons,
    ...digitalWisdomLessons,
  ];

  for (const lesson of allLessons) {
    await prisma.lesson.upsert({
      where: { slug: lesson.slug },
      update: {},
      create: lesson,
    });
  }

  console.log(`Seeded ${allLessons.length} lessons across 4 categories.`);
}

main()
  .then(() => {
    console.log('Seed complete!');
    process.exit(0);
  })
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  });
