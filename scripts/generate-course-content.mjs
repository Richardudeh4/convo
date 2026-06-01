/**
 * Generates assets/data/course_content.json with alternate question content.
 * Structure matches the original course layout; only question payloads differ.
 */
import { writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outPath = join(__dirname, "../assets/data/course_content.json");

const word = (hanzi, pinyin, english) => ({ hanzi, pinyin, english });

const mandarinFull = (hanzi, pinyin, words, breakdown) => ({
  hanzi,
  pinyin,
  words,
  breakdown,
});

const opt = (id, english, hanzi, pinyin, words, breakdown) => ({
  id,
  english,
  mandarin: mandarinFull(hanzi, pinyin, words, breakdown),
});

const single = (id, hanzi, pinyin, english, words, breakdown) => ({
  id,
  type: "single_response",
  mandarin: { hanzi, pinyin },
  options: [opt(1, english, hanzi, pinyin, words, breakdown)],
});

const listen = (id, hanzi, pinyin, words, breakdown, choices, correctId) => ({
  id,
  type: "listening_mc",
  mandarin: mandarinFull(hanzi, pinyin, words, breakdown),
  options: choices.map((english, i) => ({ id: i + 1, english })),
  correctOptionId: correctId,
});

const mc = (id, hanzi, pinyin, options, correctId) => ({
  id,
  type: "multiple_choice",
  mandarin: { hanzi, pinyin },
  options,
  correctOptionId: correctId,
});

const stubQ = (id, hanzi, pinyin, english, words, breakdown) => ({
  id,
  type: "single_response",
  mandarin: mandarinFull(hanzi, pinyin, words, breakdown),
  options: [opt(1, english, hanzi, pinyin, words, breakdown)],
});

const lesson = (id, title, icon, questions) => ({
  id,
  title,
  icon,
  completionCount: 0,
  questions,
});

const review = (id, title, questions) => ({
  id,
  title,
  icon: "flash",
  completionCount: 0,
  questions,
});

// ─── Chapter 1: Greetings & Basics ───────────────────────────────────────────
const ch1Lessons = [
  lesson("1-1", "Saying Hello", "chatbubbles-outline", [
    single(101, "您好", "Nín hǎo", "Hello (formal)", [word("您", "nín", "you (polite)"), word("好", "hǎo", "good")], "Polite hello for elders or strangers."),
    listen(102, "拜拜", "Bàibai", [word("拜拜", "bàibai", "bye-bye")], "Casual farewell.", ["Good morning", "Bye-bye", "Thank you"], 2),
    mc(103, "喂", "Wéi", [
      opt(1, "Hello (on the phone)", "喂", "Wéi", [word("喂", "wéi", "hello (phone)")], "Answer when the phone rings."),
      opt(2, "Excuse me", "劳驾", "Láojià", [word("劳驾", "láojià", "excuse me")], "Get someone's attention politely."),
      opt(3, "Goodbye", "再见", "Zàijiàn", [word("再", "zài", "again"), word("见", "jiàn", "see")], "Standard goodbye."),
    ], 1),
    mc(104, "中午好", "Zhōngwǔ hǎo", [
      opt(1, "Good afternoon", "中午好", "Zhōngwǔ hǎo", [word("中午", "zhōngwǔ", "noon"), word("好", "hǎo", "good")], "Greeting around midday."),
      opt(2, "Good night", "晚安", "Wǎn'ān", [word("晚", "wǎn", "night"), word("安", "ān", "peace")], "Before sleep."),
      opt(3, "Good morning", "早上好", "Zǎoshang hǎo", [word("早上", "zǎoshang", "morning"), word("好", "hǎo", "good")], "Morning greeting."),
    ], 1),
    listen(105, "明天见", "Míngtiān jiàn", [word("明天", "míngtiān", "tomorrow"), word("见", "jiàn", "see")], "See you tomorrow.", ["See you later", "See you tomorrow", "Good night"], 2),
  ]),
  lesson("1-2", "How are you?", "happy-outline", [
    single(201, "最近怎么样？", "Zuìjìn zěnmeyàng?", "How have you been lately?", [word("最近", "zuìjìn", "recently"), word("怎么样", "zěnmeyàng", "how")], "Casual check-in."),
    mc(202, "还行", "Hái xíng", [
      opt(1, "I'm okay / not bad", "还行", "Hái xíng", [word("还", "hái", "fairly"), word("行", "xíng", "okay")], "Neutral-positive reply."),
      opt(2, "I'm terrible", "很糟糕", "Hěn zāogāo", [word("很", "hěn", "very"), word("糟糕", "zāogāo", "terrible")], "Very bad."),
      opt(3, "I'm excellent", "非常好", "Fēicháng hǎo", [word("非常", "fēicháng", "very"), word("好", "hǎo", "good")], "Excellent."),
    ], 1),
    listen(203, "一般般", "Yìbānbān", [word("一般般", "yìbānbān", "so-so")], "Means average or so-so.", ["So-so", "Very well", "Not at all"], 1),
    single(204, "你呢？", "Nǐ ne?", "And you?", [word("你", "nǐ", "you"), word("呢", "ne", "and you?")], "Returns the question."),
    mc(205, "累死了", "Lèi sǐ le", [
      opt(1, "I'm exhausted", "累死了", "Lèi sǐ le", [word("累", "lèi", "tired"), word("死了", "sǐ le", "extremely")], "Colloquial: tired to death."),
      opt(2, "I'm hungry", "饿了", "È le", [word("饿", "è", "hungry"), word("了", "le", "particle")], "I'm hungry."),
      opt(3, "I'm happy", "很高兴", "Hěn gāoxìng", [word("很", "hěn", "very"), word("高兴", "gāoxìng", "happy")], "Very happy."),
    ], 1),
  ]),
  lesson("1-3", "Polite Expressions", "chatbox-ellipses-outline", [
    single(301, "多谢", "Duōxiè", "Thank you (formal)", [word("多谢", "duōxiè", "many thanks")], "Slightly more formal than 谢谢."),
    single(302, "不用谢", "Búyòng xiè", "You're welcome", [word("不", "bù", "not"), word("用", "yòng", "need"), word("谢", "xiè", "thanks")], "No need to thank me."),
    listen(303, "抱歉", "Bàoqiàn", [word("抱歉", "bàoqiàn", "sorry")], "Polite apology.", ["Sorry", "Excuse me", "Forgive me"], 1),
    mc(304, "麻烦你", "Máfan nǐ", [
      opt(1, "Sorry to trouble you", "麻烦你", "Máfan nǐ", [word("麻烦", "máfan", "trouble"), word("你", "nǐ", "you")], "Polite request opener."),
      opt(2, "Please", "请", "Qǐng", [word("请", "qǐng", "please")], "Please."),
      opt(3, "Thank you", "谢谢", "Xièxie", [word("谢谢", "xièxie", "thanks")], "Thanks."),
    ], 1),
    single(305, "没事", "Méishì", "It's fine / no problem", [word("没", "méi", "no"), word("事", "shì", "matter")], "Casual response to thanks or apology."),
    listen(306, "打扰一下", "Dǎrǎo yíxià", [word("打扰", "dǎrǎo", "disturb"), word("一下", "yíxià", "a moment")], "Excuse me for interrupting.", ["Excuse me", "I'm very sorry", "Goodbye"], 1),
  ]),
  lesson("1-4", "Introductions", "person-outline", [
    single(401, "请问您贵姓？", "Qǐngwèn nín guìxìng?", "May I ask your surname?", [word("请问", "qǐngwèn", "may I ask"), word("您", "nín", "you"), word("贵姓", "guìxìng", "honorable surname")], "Formal way to ask surname."),
    mc(402, "我是王芳", "Wǒ shì Wáng Fāng", [
      opt(1, "I am Wang Fang", "我是王芳", "Wǒ shì Wáng Fāng", [word("我", "wǒ", "I"), word("是", "shì", "am"), word("王芳", "Wáng Fāng", "Wang Fang")], "Introduce with 是."),
      opt(2, "My name is Wang Fang", "我叫王芳", "Wǒ jiào Wáng Fāng", [word("叫", "jiào", "called"), word("王芳", "Wáng Fāng", "Wang Fang")], "Introduce with 叫."),
      opt(3, "She is Wang Fang", "她是王芳", "Tā shì Wáng Fāng", [word("她", "tā", "she"), word("是", "shì", "is")], "Third person."),
    ], 1),
    listen(403, "很高兴认识你", "Hěn gāoxìng rènshi nǐ", [word("很", "hěn", "very"), word("高兴", "gāoxìng", "happy"), word("认识", "rènshi", "know"), word("你", "nǐ", "you")], "Nice to meet you.", ["Nice to meet you", "Goodbye", "How are you"], 1),
    mc(404, "你从哪儿来？", "Nǐ cóng nǎr lái?", [
      opt(1, "Where are you from?", "你从哪儿来？", "Nǐ cóng nǎr lái?", [word("你", "nǐ", "you"), word("从", "cóng", "from"), word("哪儿", "nǎr", "where"), word("来", "lái", "come")], "Ask origin."),
      opt(2, "What's your nationality?", "你是哪国人？", "Nǐ shì nǎ guó rén?", [word("哪国", "nǎ guó", "which country"), word("人", "rén", "person")], "Ask nationality."),
      opt(3, "Where are you going?", "你去哪儿？", "Nǐ qù nǎr?", [word("去", "qù", "go"), word("哪儿", "nǎr", "where")], "Ask destination."),
    ], 1),
    single(405, "我是英国人", "Wǒ shì Yīngguó rén", "I'm British", [word("我", "wǒ", "I"), word("英国", "Yīngguó", "Britain"), word("人", "rén", "person")], "Country + 人 = nationality."),
  ]),
  lesson("1-5", "Yes & No", "checkmark-circle-outline", [
    mc(501, "有", "Yǒu", [
      opt(1, "Yes / to have", "有", "Yǒu", [word("有", "yǒu", "have/yes")], "Affirmative or possession."),
      opt(2, "No / don't have", "没有", "Méiyǒu", [word("没", "méi", "not"), word("有", "yǒu", "have")], "Negative."),
      opt(3, "Maybe", "也许", "Yěxǔ", [word("也许", "yěxǔ", "maybe")], "Perhaps."),
    ], 1),
    single(502, "没错", "Méi cuò", "That's right", [word("没", "méi", "not"), word("错", "cuò", "wrong")], "Literally 'not wrong'."),
    listen(503, "不行", "Bù xíng", [word("不", "bù", "not"), word("行", "xíng", "okay")], "Refusal: won't work.", ["No way / can't", "Correct", "Maybe"], 1),
    mc(504, "可以", "Kěyǐ", [
      opt(1, "Okay / can do", "可以", "Kěyǐ", [word("可以", "kěyǐ", "can/okay")], "Permission or agreement."),
      opt(2, "Must", "必须", "Bìxū", [word("必须", "bìxū", "must")], "Obligation."),
      opt(3, "Cannot", "不能", "Bù néng", [word("不能", "bù néng", "cannot")], "Not allowed."),
    ], 1),
    listen(505, "没有", "Méiyǒu", [word("没", "méi", "not"), word("有", "yǒu", "have")], "Don't have / no.", ["No / don't have", "Yes", "Maybe"], 1),
  ]),
  lesson("1-6", "Question Words", "help-circle-outline", [
    single(601, "哪儿？", "Nǎr?", "Where?", [word("哪儿", "nǎr", "where")], "Colloquial 'where'."),
    mc(602, "什么时候？", "Shénme shíhou?", [
      opt(1, "When?", "什么时候？", "Shénme shíhou?", [word("什么", "shénme", "what"), word("时候", "shíhou", "time")], "Ask time."),
      opt(2, "Who?", "谁？", "Shéi?", [word("谁", "shéi", "who")], "Ask person."),
      opt(3, "What?", "什么？", "Shénme?", [word("什么", "shénme", "what")], "Ask thing."),
    ], 1),
    listen(603, "这儿", "Zhèr", [word("这儿", "zhèr", "here")], "Here (place).", ["Here", "Where?", "There"], 1),
    mc(604, "因为", "Yīnwèi", [
      opt(1, "Because", "因为", "Yīnwèi", [word("因为", "yīnwèi", "because")], "Gives a reason."),
      opt(2, "Why?", "为什么？", "Wèishénme?", [word("为什么", "wèishénme", "why")], "Ask reason."),
      opt(3, "So", "所以", "Suǒyǐ", [word("所以", "suǒyǐ", "so")], "Therefore."),
    ], 1),
    single(605, "怎么样？", "Zěnmeyàng?", "How is it?", [word("怎么样", "zěnmeyàng", "how")], "Ask opinion or condition."),
    listen(606, "几个？", "Jǐ ge?", [word("几", "jǐ", "how many"), word("个", "ge", "measure word")], "How many (countable)?", ["How many?", "How much?", "A lot"], 1),
  ]),
  lesson("1-7", "Simple Sentences", "create-outline", [
    mc(1701, "她是医生", "Tā shì yīshēng", [
      opt(1, "She is a doctor", "她是医生", "Tā shì yīshēng", [word("她", "tā", "she"), word("是", "shì", "is"), word("医生", "yīshēng", "doctor")], "She is a doctor."),
      opt(2, "He is a doctor", "他是医生", "Tā shì yīshēng", [word("他", "tā", "he")], "He is a doctor."),
      opt(3, "She is a nurse", "她是护士", "Tā shì hùshi", [word("护士", "hùshi", "nurse")], "She is a nurse."),
    ], 1),
    mc(1702, "请进", "Qǐng jìn", [
      opt(1, "Please come in", "请进", "Qǐng jìn", [word("请", "qǐng", "please"), word("进", "jìn", "enter")], "Invite someone in."),
      opt(2, "Please sit", "请坐", "Qǐng zuò", [word("坐", "zuò", "sit")], "Please sit."),
      opt(3, "Please wait", "请等", "Qǐng děng", [word("等", "děng", "wait")], "Please wait."),
    ], 1),
    listen(1703, "你是学生吗？", "Nǐ shì xuésheng ma?", [word("你", "nǐ", "you"), word("是", "shì", "are"), word("学生", "xuésheng", "student"), word("吗", "ma", "?")], "Are you a student?", ["Are you a student?", "Are you a teacher?", "Is he a student?"], 1),
  ]),
];

const ch1Review = review("review-1", "Review: Greetings & Basics", [
  mc(1901, "您好", "Nín hǎo", [
    opt(1, "Hello (formal)", "您好", "Nín hǎo", [word("您", "nín", "you"), word("好", "hǎo", "good")], "Formal hello."),
    opt(2, "Goodbye", "再见", "Zàijiàn", [word("再", "zài", "again"), word("见", "jiàn", "see")], "Goodbye."),
    opt(3, "Thanks", "谢谢", "Xièxie", [word("谢谢", "xièxie", "thanks")], "Thank you."),
  ], 1),
  listen(1902, "不用谢", "Búyòng xiè", [word("不", "bù", "not"), word("用", "yòng", "need"), word("谢", "xiè", "thanks")], "You're welcome.", ["You're welcome", "Thank you", "Sorry"], 1),
  mc(1903, "拜拜", "Bàibai", [
    opt(1, "Bye-bye", "拜拜", "Bàibai", [word("拜拜", "bàibai", "bye")], "Casual bye."),
    opt(2, "Hello", "你好", "Nǐ hǎo", [word("你", "nǐ", "you"), word("好", "hǎo", "good")], "Hello."),
    opt(3, "Please", "请", "Qǐng", [word("请", "qǐng", "please")], "Please."),
  ], 1),
  single(1904, "抱歉", "Bàoqiàn", "Sorry", [word("抱歉", "bàoqiàn", "sorry")], "Apology."),
  listen(1905, "最近怎么样？", "Zuìjìn zěnmeyàng?", [word("最近", "zuìjìn", "recently"), word("怎么样", "zěnmeyàng", "how")], "How have you been?", ["How have you been?", "What's your name?", "Where are you from?"], 1),
  mc(1906, "哪儿？", "Nǎr?", [
    opt(1, "Where?", "哪儿？", "Nǎr?", [word("哪儿", "nǎr", "where")], "Where."),
    opt(1, "When?", "什么时候？", "Shénme shíhou?", [word("时候", "shíhou", "time")], "When."),
    opt(3, "Who?", "谁？", "Shéi?", [word("谁", "shéi", "who")], "Who."),
  ].map((o, i) => ({ ...o, id: i + 1 })), 1),
  single(1907, "还行", "Hái xíng", "I'm okay", [word("还", "hái", "fairly"), word("行", "xíng", "okay")], "Not bad."),
  listen(1908, "没事", "Méishì", [word("没", "méi", "no"), word("事", "shì", "matter")], "No problem.", ["No problem", "Sorry", "Thanks"], 1),
  mc(1909, "没错", "Méi cuò", [
    opt(1, "That's right", "没错", "Méi cuò", [word("错", "cuò", "wrong")], "Correct."),
    opt(2, "Wrong", "不对", "Bú duì", [word("不", "bù", "not"), word("对", "duì", "correct")], "Incorrect."),
    opt(3, "Maybe", "也许", "Yěxǔ", [word("也许", "yěxǔ", "maybe")], "Perhaps."),
  ], 1),
  single(1910, "麻烦你", "Máfan nǐ", "Sorry to trouble you", [word("麻烦", "máfan", "trouble"), word("你", "nǐ", "you")], "Polite phrase."),
]);

// Fix review 1906 duplicate ids - rebuild that question properly
ch1Review.questions[5] = mc(1906, "哪儿？", "Nǎr?", [
  opt(1, "Where?", "哪儿？", "Nǎr?", [word("哪儿", "nǎr", "where")], "Where."),
  opt(2, "When?", "什么时候？", "Shénme shíhou?", [word("时候", "shíhou", "time")], "When."),
  opt(3, "Who?", "谁？", "Shéi?", [word("谁", "shéi", "who")], "Who."),
], 1);

// ─── Chapter 2: Numbers & Time ─────────────────────────────────────────────────
const ch2Lessons = [
  lesson("2-1", "Numbers 1-10", "calculator-outline", [
    single(2101, "零", "Líng", "Zero", [word("零", "líng", "zero")], "Zero, used in phones and scores."),
    single(2102, "一", "Yī", "One", [word("一", "yī", "one")], "The number one."),
    single(2103, "二", "Èr", "Two", [word("二", "èr", "two")], "The number two."),
    single(2104, "三", "Sān", "Three", [word("三", "sān", "three")], "The number three."),
    listen(2105, "六", "Liù", [word("六", "liù", "six")], "The number six.", ["Six", "Five", "Seven"], 1),
    single(2106, "七", "Qī", "Seven", [word("七", "qī", "seven")], "The number seven."),
    single(2107, "八", "Bā", "Eight", [word("八", "bā", "eight")], "Lucky number eight."),
    single(2108, "九", "Jiǔ", "Nine", [word("九", "jiǔ", "nine")], "The number nine."),
    listen(2109, "十", "Shí", [word("十", "shí", "ten")], "The number ten.", ["Ten", "Nine", "Eight"], 1),
    single(2110, "两", "Liǎng", "Two (measure)", [word("两", "liǎng", "two")], "Used before measure words, not 二."),
    listen(2111, "四", "Sì", [word("四", "sì", "four")], "The number four.", ["Four", "Ten", "Six"], 1),
  ]),
  lesson("2-2", "Numbers 11-99", "keypad-outline", [
    mc(2201, "十二", "Shí'èr", [
      opt(1, "Twelve", "十二", "Shí'èr", [word("十", "shí", "ten"), word("二", "èr", "two")], "Ten-two."),
      opt(2, "Twenty", "二十", "Èrshí", [word("二", "èr", "two"), word("十", "shí", "ten")], "Two-ten."),
      opt(3, "Twenty-two", "二十二", "Èrshí'èr", [word("二", "èr", "two"), word("十", "shí", "ten")], "Two-ten-two."),
    ], 1),
    listen(2202, "十八", "Shíbā", [word("十", "shí", "ten"), word("八", "bā", "eight")], "Eighteen.", ["Eighteen", "Eighty", "Eight"], 1),
    single(2203, "二十", "Èrshí", "Twenty", [word("二", "èr", "two"), word("十", "shí", "ten")], "Two tens."),
    mc(2204, "三十", "Sānshí", [
      opt(1, "Thirty", "三十", "Sānshí", [word("三", "sān", "three"), word("十", "shí", "ten")], "Three-ten."),
      opt(2, "Thirteen", "十三", "Shísān", [word("十", "shí", "ten"), word("三", "sān", "three")], "Ten-three."),
      opt(3, "Three hundred", "三百", "Sānbǎi", [word("百", "bǎi", "hundred")], "Three hundred."),
    ], 1),
    single(2205, "四十", "Sìshí", "Forty", [word("四", "sì", "four"), word("十", "shí", "ten")], "Four-ten."),
    listen(2206, "五十六", "Wǔshíliù", [word("五", "wǔ", "five"), word("十", "shí", "ten"), word("六", "liù", "six")], "Fifty-six.", ["Fifty-six", "Sixty-five", "Fifteen"], 1),
    mc(2207, "六十", "Liùshí", [
      opt(1, "Sixty", "六十", "Liùshí", [word("六", "liù", "six"), word("十", "shí", "ten")], "Six-ten."),
      opt(2, "Sixteen", "十六", "Shíliù", [word("十", "shí", "ten"), word("六", "liù", "six")], "Ten-six."),
      opt(3, "Six", "六", "Liù", [word("六", "liù", "six")], "Six."),
    ], 1),
    single(2208, "七十", "Qīshí", "Seventy", [word("七", "qī", "seven"), word("十", "shí", "ten")], "Seven-ten."),
    listen(2209, "九十九", "Jiǔshíjiǔ", [word("九", "jiǔ", "nine"), word("十", "shí", "ten")], "Ninety-nine.", ["Ninety-nine", "Nineteen", "Ninety"], 1),
    mc(2210, "一百", "Yìbǎi", [
      opt(1, "One hundred", "一百", "Yìbǎi", [word("一", "yī", "one"), word("百", "bǎi", "hundred")], "One hundred."),
      opt(2, "One thousand", "一千", "Yìqiān", [word("千", "qiān", "thousand")], "One thousand."),
      opt(3, "Ten", "十", "Shí", [word("十", "shí", "ten")], "Ten."),
    ], 1),
    single(2211, "半", "Bàn", "Half", [word("半", "bàn", "half")], "Used in time and amounts."),
  ]),
  lesson("2-3", "Days of the Week", "calendar-number-outline", [
    single(2301, "星期天", "Xīngqītiān", "Sunday", [word("星期", "xīngqī", "week"), word("天", "tiān", "day")], "Sunday."),
    single(2302, "星期一", "Xīngqī yī", "Monday", [word("星期", "xīngqī", "week"), word("一", "yī", "one")], "Monday."),
    listen(2303, "星期五", "Xīngqī wǔ", [word("星期", "xīngqī", "week"), word("五", "wǔ", "five")], "Friday.", ["Friday", "Thursday", "Saturday"], 1),
    single(2304, "星期二", "Xīngqī èr", "Tuesday", [word("二", "èr", "two")], "Tuesday."),
    single(2305, "星期三", "Xīngqī sān", "Wednesday", [word("三", "sān", "three")], "Wednesday."),
    listen(2306, "星期四", "Xīngqī sì", [word("四", "sì", "four")], "Thursday.", ["Thursday", "Tuesday", "Sunday"], 1),
    mc(2307, "星期六", "Xīngqī liù", [
      opt(1, "Saturday", "星期六", "Xīngqī liù", [word("六", "liù", "six")], "Saturday."),
      opt(2, "Sunday", "星期天", "Xīngqītiān", [word("天", "tiān", "day")], "Sunday."),
      opt(3, "Monday", "星期一", "Xīngqī yī", [word("一", "yī", "one")], "Monday."),
    ], 1),
    single(2308, "哪天？", "Nǎ tiān?", "Which day?", [word("哪", "nǎ", "which"), word("天", "tiān", "day")], "Ask which day."),
  ]),
  lesson("2-4", "Telling Time (Hours)", "time-outline", [
    single(2401, "三点", "Sān diǎn", "3 o'clock", [word("三", "sān", "three"), word("点", "diǎn", "o'clock")], "Three o'clock."),
    single(2402, "四点", "Sì diǎn", "4 o'clock", [word("四", "sì", "four"), word("点", "diǎn", "o'clock")], "Four o'clock."),
    listen(2403, "几点了？", "Jǐ diǎn le?", [word("几", "jǐ", "what"), word("点", "diǎn", "o'clock"), word("了", "le", "particle")], "What time is it?", ["What time is it?", "What day is it?", "Where is it?"], 1),
    mc(2404, "四点一刻", "Sì diǎn yí kè", [
      opt(1, "4:15", "四点一刻", "Sì diǎn yí kè", [word("刻", "kè", "quarter")], "Quarter past four."),
      opt(2, "4:30", "四点半", "Sì diǎn bàn", [word("半", "bàn", "half")], "Half past four."),
      opt(3, "4:45", "四点三刻", "Sì diǎn sān kè", [word("三", "sān", "three")], "Quarter to five."),
    ], 1),
    single(2405, "七点二十分", "Qī diǎn èrshí fēn", "7:20", [word("七", "qī", "seven"), word("二十", "èrshí", "twenty"), word("分", "fēn", "minute")], "Hour + minutes + 分."),
    listen(2406, "九点半", "Jiǔ diǎn bàn", [word("九", "jiǔ", "nine"), word("半", "bàn", "half")], "Half past nine.", ["9:30", "9:15", "8:30"], 1),
    mc(2407, "十一点四十五分", "Shíyī diǎn sìshíwǔ fēn", [
      opt(1, "11:45", "十一点四十五分", "Shíyī diǎn sìshíwǔ fēn", [word("四十五", "sìshíwǔ", "forty-five")], "Eleven forty-five."),
      opt(2, "11:15", "十一点十五分", "Shíyī diǎn shíwǔ fēn", [word("十五", "shíwǔ", "fifteen")], "Eleven fifteen."),
      opt(3, "10:45", "十点四十五分", "Shí diǎn sìshíwǔ fēn", [word("十", "shí", "ten")], "Ten forty-five."),
    ], 1),
    listen(2408, "差五分八点", "Chà wǔ fēn bā diǎn", [word("差", "chà", "lack"), word("五", "wǔ", "five"), word("分", "fēn", "minute")], "Ten to eight = 7:55.", ["7:55", "8:05", "7:05"], 1),
    single(2409, "整", "Zhěng", "Exactly (on the hour)", [word("整", "zhěng", "exact")], "On the dot."),
  ]),
  lesson("2-5", "Months & Dates", "calendar-outline", [
    single(2501, "四月", "Sì yuè", "April", [word("四", "sì", "four"), word("月", "yuè", "month")], "Fourth month."),
    listen(2502, "七月", "Qī yuè", [word("七", "qī", "seven"), word("月", "yuè", "month")], "July.", ["July", "June", "August"], 1),
    single(2503, "九月", "Jiǔ yuè", "September", [word("九", "jiǔ", "nine"), word("月", "yuè", "month")], "Ninth month."),
    single(2504, "一月", "Yī yuè", "January", [word("一", "yī", "one"), word("月", "yuè", "month")], "First month."),
    single(2505, "十二月", "Shí'èr yuè", "December", [word("十二", "shí'èr", "twelve"), word("月", "yuè", "month")], "Twelfth month."),
    listen(2506, "三月", "Sān yuè", [word("三", "sān", "three")], "March.", ["March", "May", "February"], 1),
    single(2507, "六月", "Liù yuè", "June", [word("六", "liù", "six"), word("月", "yuè", "month")], "Sixth month."),
    mc(2508, "八月", "Bā yuè", [
      opt(1, "August", "八月", "Bā yuè", [word("八", "bā", "eight")], "Eighth month."),
      opt(2, "October", "十月", "Shí yuè", [word("十", "shí", "ten")], "Tenth month."),
      opt(3, "April", "四月", "Sì yuè", [word("四", "sì", "four")], "Fourth month."),
    ], 1),
    listen(2509, "十一月", "Shíyī yuè", [word("十一", "shíyī", "eleven")], "November.", ["November", "December", "January"], 1),
    mc(2510, "五月二十号", "Wǔ yuè èrshí hào", [
      opt(1, "May 20th", "五月二十号", "Wǔ yuè èrshí hào", [word("二十", "èrshí", "twenty"), word("号", "hào", "day")], "Month + day + 号."),
      opt(2, "May 2nd", "五月二号", "Wǔ yuè èr hào", [word("二", "èr", "two")], "May 2."),
      opt(3, "February 20th", "二月二十号", "Èr yuè èrshí hào", [word("二", "èr", "two")], "Feb 20."),
    ], 1),
    single(2511, "你的生日是哪天？", "Nǐ de shēngrì shì nǎ tiān?", "When is your birthday?", [word("生日", "shēngrì", "birthday"), word("哪天", "nǎ tiān", "which day")], "Ask birthday."),
    listen(2512, "年", "Nián", [word("年", "nián", "year")], "Year.", ["Year", "Month", "Day"], 1),
  ]),
  lesson("2-6", "Time Expressions", "hourglass-outline", [
    mc(2601, "后天", "Hòutiān", [
      opt(1, "The day after tomorrow", "后天", "Hòutiān", [word("后", "hòu", "after"), word("天", "tiān", "day")], "Day after tomorrow."),
      opt(2, "Yesterday", "昨天", "Zuótiān", [word("昨", "zuó", "yesterday")], "Yesterday."),
      opt(3, "Today", "今天", "Jīntiān", [word("今", "jīn", "today")], "Today."),
    ], 1),
    listen(2602, "前天", "Qiántiān", [word("前", "qián", "before"), word("天", "tiān", "day")], "Day before yesterday.", ["Day before yesterday", "Tomorrow", "Today"], 1),
    single(2603, "刚才", "Gāngcái", "Just now", [word("刚才", "gāngcái", "just now")], "A moment ago."),
    mc(2604, "一会儿", "Yíhuìr", [
      opt(1, "In a moment / a while", "一会儿", "Yíhuìr", [word("一会儿", "yíhuìr", "a while")], "Shortly."),
      opt(2, "Always", "总是", "Zǒngshì", [word("总是", "zǒngshì", "always")], "Always."),
      opt(3, "Never", "从不", "Cóng bù", [word("从不", "cóng bù", "never")], "Never."),
    ], 1),
    listen(2605, "早上", "Zǎoshang", [word("早", "zǎo", "early"), word("上", "shang", "on")], "Early morning.", ["Early morning", "Evening", "Noon"], 1),
    mc(2606, "傍晚", "Bàngwǎn", [
      opt(1, "Dusk / early evening", "傍晚", "Bàngwǎn", [word("傍", "bàng", "near"), word("晚", "wǎn", "evening")], "Around sunset."),
      opt(2, "Noon", "中午", "Zhōngwǔ", [word("中午", "zhōngwǔ", "noon")], "Midday."),
      opt(3, "Midnight", "半夜", "Bànyè", [word("半", "bàn", "half"), word("夜", "yè", "night")], "Midnight."),
    ], 1),
    single(2607, "深夜", "Shēnyè", "Late at night", [word("深", "shēn", "deep"), word("夜", "yè", "night")], "Deep night."),
    listen(2608, "凌晨", "Língchén", [word("凌", "líng", "approach"), word("晨", "chén", "dawn")], "Before dawn.", ["Before dawn", "Afternoon", "Evening"], 1),
    mc(2609, "上个星期", "Shàng ge xīngqī", [
      opt(1, "Last week", "上个星期", "Shàng ge xīngqī", [word("上", "shàng", "last"), word("星期", "xīngqī", "week")], "Previous week."),
      opt(2, "Next week", "下个星期", "Xià ge xīngqī", [word("下", "xià", "next")], "Next week."),
      opt(3, "This week", "这个星期", "Zhège xīngqī", [word("这", "zhè", "this")], "This week."),
    ], 1),
    listen(2610, "下个月", "Xià ge yuè", [word("下", "xià", "next"), word("月", "yuè", "month")], "Next month.", ["Next month", "Last month", "This month"], 1),
    single(2611, "去年", "Qùnián", "Last year", [word("去", "qù", "past"), word("年", "nián", "year")], "Previous year."),
  ]),
  lesson("2-7", "Using Time", "create-outline", [
    mc(2701, "明天星期二", "Míngtiān xīngqī'èr", [
      opt(1, "Tomorrow is Tuesday", "明天星期二", "Míngtiān xīngqī'èr", [word("明天", "míngtiān", "tomorrow"), word("星期二", "xīngqī'èr", "Tuesday")], "Tomorrow Tuesday."),
      opt(2, "Today is Tuesday", "今天星期二", "Jīntiān xīngqī'èr", [word("今天", "jīntiān", "today")], "Today Tuesday."),
      opt(3, "Tomorrow is Wednesday", "明天星期三", "Míngtiān xīngqī sān", [word("三", "sān", "three")], "Tomorrow Wednesday."),
    ], 1),
    mc(2702, "我七点吃早饭", "Wǒ qī diǎn chī zǎofàn", [
      opt(1, "I eat breakfast at 7", "我七点吃早饭", "Wǒ qī diǎn chī zǎofàn", [word("七点", "qī diǎn", "7 o'clock"), word("早饭", "zǎofàn", "breakfast")], "Time before verb."),
      opt(2, "I eat lunch at 7", "我七点吃午饭", "Wǒ qī diǎn chī wǔfàn", [word("午饭", "wǔfàn", "lunch")], "Lunch at 7."),
      opt(3, "He eats at 7", "他七点吃早饭", "Tā qī diǎn chī zǎofàn", [word("他", "tā", "he")], "He eats."),
    ], 1),
    mc(2703, "会议十点开始", "Huìyì shí diǎn kāishǐ", [
      opt(1, "The meeting starts at 10", "会议十点开始", "Huìyì shí diǎn kāishǐ", [word("会议", "huìyì", "meeting"), word("开始", "kāishǐ", "start")], "Meeting starts at ten."),
      opt(2, "The meeting ends at 10", "会议十点结束", "Huìyì shí diǎn jiéshù", [word("结束", "jiéshù", "end")], "Ends at ten."),
      opt(3, "The meeting is at 9", "会议九点开始", "Huìyì jiǔ diǎn kāishǐ", [word("九", "jiǔ", "nine")], "Starts at nine."),
    ], 1),
  ]),
];

const ch2Review = review("review-2", "Review: Numbers & Time", [
  single(2901, "五", "Wǔ", "Five", [word("五", "wǔ", "five")], "Five."),
  listen(2902, "八", "Bā", [word("八", "bā", "eight")], "Eight.", ["Eight", "Six", "Nine"], 1),
  mc(2903, "四十二", "Sìshí'èr", [
    opt(1, "Forty-two", "四十二", "Sìshí'èr", [word("四", "sì", "four"), word("十", "shí", "ten"), word("二", "èr", "two")], "Four-ten-two."),
    opt(2, "Twenty-four", "二十四", "Èrshísì", [word("二", "èr", "two")], "Two-ten-four."),
    opt(3, "Fourteen", "十四", "Shísì", [word("十", "shí", "ten")], "Ten-four."),
  ], 1),
  single(2904, "星期三", "Xīngqī sān", "Wednesday", [word("三", "sān", "three")], "Wednesday."),
  listen(2905, "星期天", "Xīngqītiān", [word("天", "tiān", "day")], "Sunday.", ["Sunday", "Saturday", "Monday"], 1),
  mc(2906, "三点", "Sān diǎn", [
    opt(1, "3 o'clock", "三点", "Sān diǎn", [word("三", "sān", "three"), word("点", "diǎn", "o'clock")], "Three o'clock."),
    opt(2, "3:30", "三点半", "Sān diǎn bàn", [word("半", "bàn", "half")], "Half past three."),
    opt(3, "13 o'clock", "十三点", "Shísān diǎn", [word("十三", "shísān", "thirteen")], "13:00 (24h)."),
  ], 1),
  single(2907, "九点一刻", "Jiǔ diǎn yí kè", "9:15", [word("刻", "kè", "quarter")], "Quarter past nine."),
  listen(2908, "二月", "Èr yuè", [word("二", "èr", "two"), word("月", "yuè", "month")], "February.", ["February", "December", "August"], 1),
  mc(2909, "昨天", "Zuótiān", [
    opt(1, "Yesterday", "昨天", "Zuótiān", [word("昨", "zuó", "yesterday")], "Yesterday."),
    opt(2, "Tomorrow", "明天", "Míngtiān", [word("明", "míng", "next")], "Tomorrow."),
    opt(3, "Today", "今天", "Jīntiān", [word("今", "jīn", "today")], "Today."),
  ], 1),
  single(2910, "凌晨", "Língchén", "Before dawn", [word("凌晨", "língchén", "before dawn")], "Early morning hours."),
  listen(2911, "早上", "Zǎoshang", [word("早", "zǎo", "early")], "Morning.", ["Morning", "Afternoon", "Night"], 1),
  mc(2912, "明年", "Míngnián", [
    opt(1, "Next year", "明年", "Míngnián", [word("明", "míng", "next"), word("年", "nián", "year")], "Next year."),
    opt(2, "Last year", "去年", "Qùnián", [word("去", "qù", "past")], "Last year."),
    opt(3, "This year", "今年", "Jīnnián", [word("今", "jīn", "this")], "This year."),
  ], 1),
]);

// ─── Chapters 3–12: stub lessons (1 question each) ─────────────────────────────
const stubChapter = (id, title, lessons, reviewQ) => ({
  id,
  title,
  lessons: lessons.map(([lid, ltitle, icon, q]) => lesson(lid, ltitle, icon, [q])),
  review: review(reviewQ[0], reviewQ[1], [reviewQ[2]]),
});

const ch3 = stubChapter(3, "Family & People", [
  ["3-1", "Family Members", "people-outline", stubQ(3101, "奶奶", "Nǎinai", "Grandmother (dad's side)", [word("奶奶", "nǎinai", "paternal grandma")], "Father's mother.")],
  ["3-2", "Immediate Family", "woman-outline", stubQ(3201, "妹妹", "Mèimei", "Younger sister", [word("妹妹", "mèimei", "younger sister")], "Younger sister.")],
  ["3-3", "Siblings", "accessibility-outline", stubQ(3301, "弟弟", "Dìdi", "Younger brother", [word("弟弟", "dìdi", "younger brother")], "Younger brother.")],
  ["3-4", "Extended Family", "git-network-outline", stubQ(3401, "外婆", "Wàipó", "Grandmother (mom's side)", [word("外婆", "wàipó", "maternal grandma")], "Mother's mother.")],
  ["3-5", "Occupations", "briefcase-outline", stubQ(3501, "学生", "Xuésheng", "Student", [word("学生", "xuésheng", "student")], "Student.")],
  ["3-6", "Describing People", "body-outline", stubQ(3601, "聪明", "Cōngming", "Smart", [word("聪明", "cōngming", "clever")], "Intelligent.")],
], ["review-3", "Review: Family & People", stubQ(3901, "姐姐", "Jiějie", "Older sister", [word("姐姐", "jiějie", "older sister")], "Older sister.")]);

const ch4 = stubChapter(4, "Food & Drink", [
  ["4-1", "Basic Foods", "restaurant-outline", stubQ(4101, "面条", "Miàntiáo", "Noodles", [word("面条", "miàntiáo", "noodles")], "Noodles.")],
  ["4-2", "Drinks", "beer-outline", stubQ(4201, "咖啡", "Kāfēi", "Coffee", [word("咖啡", "kāfēi", "coffee")], "Coffee.")],
  ["4-3", "Fruits", "nutrition-outline", stubQ(4301, "橙子", "Chéngzi", "Orange", [word("橙子", "chéngzi", "orange")], "Orange fruit.")],
  ["4-4", "Vegetables", "leaf-outline", stubQ(4401, "西红柿", "Xīhóngshì", "Tomato", [word("西红柿", "xīhóngshì", "tomato")], "Tomato.")],
  ["4-5", "Ordering Food", "fast-food-outline", stubQ(4501, "请来", "Qǐng lái", "Please bring...", [word("请", "qǐng", "please"), word("来", "lái", "bring")], "Polite order.")],
  ["4-6", "Tastes", "flame-outline", stubQ(4601, "辣", "Là", "Spicy", [word("辣", "là", "spicy")], "Spicy/hot.")],
], ["review-4", "Review: Food & Drink", stubQ(4901, "茶", "Chá", "Tea", [word("茶", "chá", "tea")], "Tea.")]);

const ch5 = stubChapter(5, "Hobbies & Activities", [
  ["5-1", "Common Hobbies", "musical-notes-outline", stubQ(5101, "画画", "Huàhuà", "Drawing", [word("画", "huà", "draw")], "To draw/paint.")],
  ["5-2", "Sports", "basketball-outline", stubQ(5201, "游泳", "Yóuyǒng", "Swimming", [word("游泳", "yóuyǒng", "swim")], "Swimming.")],
  ["5-3", "Music & Movies", "film-outline", stubQ(5301, "看电影", "Kàn diànyǐng", "Watch movies", [word("电影", "diànyǐng", "movie")], "Watch films.")],
  ["5-4", "Daily Routine", "bed-outline", stubQ(5401, "睡觉", "Shuìjiào", "Sleep", [word("睡觉", "shuìjiào", "sleep")], "Go to sleep.")],
  ["5-5", "Technology", "phone-portrait-outline", stubQ(5501, "电脑", "Diànnǎo", "Computer", [word("电脑", "diànnǎo", "computer")], "Computer.")],
  ["5-6", "Weekends", "flash", stubQ(5601, "逛街", "Guàngjiē", "Go shopping", [word("逛", "guàng", "stroll"), word("街", "jiē", "street")], "Shop around.")],
], ["review-5", "Review: Hobbies", stubQ(5901, "跑步", "Pǎobù", "Running", [word("跑步", "pǎobù", "run")], "Jogging.")]);

const ch6 = stubChapter(6, "Travel & Places", [
  ["6-1", "Transportation", "bus-outline", stubQ(6101, "地铁", "Dìtiě", "Subway", [word("地铁", "dìtiě", "metro")], "Subway.")],
  ["6-2", "Directions", "compass-outline", stubQ(6201, "右边", "Yòubian", "Right side", [word("右", "yòu", "right"), word("边", "bian", "side")], "Right.")],
  ["6-3", "Places in Town", "business-outline", stubQ(6301, "医院", "Yīyuàn", "Hospital", [word("医院", "yīyuàn", "hospital")], "Hospital.")],
  ["6-4", "Countries", "globe-outline", stubQ(6401, "日本", "Rìběn", "Japan", [word("日本", "Rìběn", "Japan")], "Japan.")],
  ["6-5", "Asking the Way", "map-outline", stubQ(6501, "在哪儿？", "Zài nǎr?", "Where is it?", [word("在", "zài", "at"), word("哪儿", "nǎr", "where")], "Where?")],
  ["6-6", "Buying Tickets", "ticket-outline", stubQ(6601, "一张票", "Yì zhāng piào", "One ticket", [word("张", "zhāng", "sheet MW"), word("票", "piào", "ticket")], "One ticket.")],
], ["review-6", "Review: Travel", stubQ(6901, "出租车", "Chūzūchē", "Taxi", [word("出租车", "chūzūchē", "taxi")], "Taxi.")]);

const ch7 = stubChapter(7, "Shopping & Money", [
  ["7-1", "Currency (RMB)", "cash-outline", stubQ(7101, "块", "Kuài", "Yuan (colloquial)", [word("块", "kuài", "yuan")], "Colloquial for RMB.")],
  ["7-2", "Asking Price", "pricetag-outline", stubQ(7201, "这个多少钱？", "Zhège duōshao qián?", "How much is this?", [word("多少", "duōshao", "how much"), word("钱", "qián", "money")], "Ask price.")],
  ["7-3", "Clothing", "shirt-outline", stubQ(7301, "裤子", "Kùzi", "Pants", [word("裤子", "kùzi", "pants")], "Trousers.")],
  ["7-4", "Colors", "color-palette-outline", stubQ(7401, "蓝色", "Lánsè", "Blue", [word("蓝", "lán", "blue"), word("色", "sè", "color")], "Blue.")],
  ["7-5", "Bargaining", "trending-down-outline", stubQ(7501, "便宜一点", "Piányi yìdiǎn", "A little cheaper", [word("便宜", "piányi", "cheap")], "Bargain.")],
  ["7-6", "Sizes", "resize-outline", stubQ(7601, "小", "Xiǎo", "Small", [word("小", "xiǎo", "small")], "Small size.")],
], ["review-7", "Review: Shopping", stubQ(7901, "太贵了", "Tài guì le", "Too expensive", [word("贵", "guì", "expensive")], "Too pricey.")]);

const ch8 = stubChapter(8, "School & Work", [
  ["8-1", "Subjects", "book-outline", stubQ(8101, "数学", "Shùxué", "Mathematics", [word("数学", "shùxué", "math")], "Math.")],
  ["8-2", "Office Items", "desktop-outline", stubQ(8201, "打印机", "Dǎyìnjī", "Printer", [word("打印机", "dǎyìnjī", "printer")], "Printer.")],
  ["8-3", "In the Classroom", "easel-outline", stubQ(8301, "教室", "Jiàoshì", "Classroom", [word("教室", "jiàoshì", "classroom")], "Classroom.")],
  ["8-4", "Jobs", "construct-outline", stubQ(8401, "经理", "Jīnglǐ", "Manager", [word("经理", "jīnglǐ", "manager")], "Manager.")],
  ["8-5", "Time Management", "alarm-outline", stubQ(8501, "加班", "Jiābān", "Work overtime", [word("加班", "jiābān", "overtime")], "Overtime.")],
  ["8-6", "Testing", "document-text-outline", stubQ(8601, "作业", "Zuòyè", "Homework", [word("作业", "zuòyè", "homework")], "Homework.")],
], ["review-8", "Review: School", stubQ(8901, "办公室", "Bàngōngshì", "Office", [word("办公室", "bàngōngshì", "office")], "Office.")]);

const ch9 = stubChapter(9, "Health & Body", [
  ["9-1", "Body Parts", "hand-left-outline", stubQ(9101, "头", "Tóu", "Head", [word("头", "tóu", "head")], "Head.")],
  ["9-2", "Feeling Sick", "thermometer-outline", stubQ(9201, "发烧", "Fāshāo", "Have a fever", [word("发烧", "fāshāo", "fever")], "Fever.")],
  ["9-3", "At the Doctor", "medkit-outline", stubQ(9301, "护士", "Hùshi", "Nurse", [word("护士", "hùshi", "nurse")], "Nurse.")],
  ["9-4", "Medicine", "flask-outline", stubQ(9401, "感冒药", "Gǎnmào yào", "Cold medicine", [word("感冒", "gǎnmào", "cold")], "Cold meds.")],
  ["9-5", "Feelings", "sad-outline", stubQ(9501, "头疼", "Tóuténg", "Headache", [word("头疼", "tóuténg", "headache")], "Head hurts.")],
  ["9-6", "Fitness", "bicycle-outline", stubQ(9601, "健康", "Jiànkāng", "Healthy", [word("健康", "jiànkāng", "health")], "Healthy.")],
], ["review-9", "Review: Health", stubQ(9901, "看病", "Kànbìng", "See a doctor", [word("看病", "kànbìng", "see doctor")], "Medical visit.")]);

const ch10 = stubChapter(10, "Nature & Weather", [
  ["10-1", "Basic Weather", "sunny-outline", stubQ(10101, "晴天", "Qíngtiān", "Sunny day", [word("晴", "qíng", "clear"), word("天", "tiān", "day")], "Clear weather.")],
  ["10-2", "Rain & Snow", "rainy-outline", stubQ(10201, "下雪", "Xià xuě", "Snowing", [word("雪", "xuě", "snow")], "Snow falls.")],
  ["10-3", "Seasons", "snow-outline", stubQ(10301, "春天", "Chūntiān", "Spring", [word("春", "chūn", "spring")], "Spring season.")],
  ["10-4", "Animals", "paw-outline", stubQ(10401, "猫", "Māo", "Cat", [word("猫", "māo", "cat")], "Cat.")],
  ["10-5", "Landscape", "image-outline", stubQ(10501, "河", "Hé", "River", [word("河", "hé", "river")], "River.")],
  ["10-6", "Temperature", "thermometer-outline", stubQ(10601, "冷", "Lěng", "Cold", [word("冷", "lěng", "cold")], "Cold.")],
], ["review-10", "Review: Nature", stubQ(10901, "刮风", "Guā fēng", "Windy", [word("风", "fēng", "wind")], "Wind blows.")]);

const ch11 = stubChapter(11, "Home & Living", [
  ["11-1", "Rooms", "home-outline", stubQ(11101, "厨房", "Chúfáng", "Kitchen", [word("厨房", "chúfáng", "kitchen")], "Kitchen.")],
  ["11-2", "Furniture", "file-tray-stacked-outline", stubQ(11201, "椅子", "Yǐzi", "Chair", [word("椅子", "yǐzi", "chair")], "Chair.")],
  ["11-3", "Appliances", "radio-outline", stubQ(11301, "冰箱", "Bīngxiāng", "Refrigerator", [word("冰箱", "bīngxiāng", "fridge")], "Fridge.")],
  ["11-4", "Daily Chores", "trash-outline", stubQ(11401, "打扫", "Dǎsǎo", "Clean up", [word("打扫", "dǎsǎo", "clean")], "To clean.")],
  ["11-5", "Renting", "key-outline", stubQ(11501, "房租", "Fángzū", "Rent", [word("房租", "fángzū", "rent")], "House rent.")],
  ["11-6", "In the Neighborhood", "storefront-outline", stubQ(11601, "银行", "Yínháng", "Bank", [word("银行", "yínháng", "bank")], "Bank.")],
], ["review-11", "Review: Home", stubQ(11901, "卫生间", "Wèishēngjiān", "Bathroom", [word("卫生间", "wèishēngjiān", "bathroom")], "Restroom.")]);

const ch12 = stubChapter(12, "Emergencies", [
  ["12-1", "Asking for Help", "megaphone-outline", stubQ(12101, "帮帮我", "Bāngbang wǒ", "Help me", [word("帮", "bāng", "help")], "Urgent help.")],
  ["12-2", "Lost Property", "wallet-outline", stubQ(12201, "钱包丢了", "Qiánbāo diū le", "Lost my wallet", [word("钱包", "qiánbāo", "wallet")], "Wallet lost.")],
  ["12-3", "Getting Lost", "navigate-outline", stubQ(12301, "我迷路了", "Wǒ mílù le", "I'm lost", [word("迷路", "mílù", "lost")], "Lost way.")],
  ["12-4", "Police", "shield-outline", stubQ(12401, "报警", "Bàojǐng", "Call police", [word("报警", "bàojǐng", "call police")], "Report to police.")],
  ["12-5", "Hospital", "bandage-outline", stubQ(12501, "急救", "Jíjiù", "Emergency care", [word("急救", "jíjiù", "first aid")], "Emergency.")],
  ["12-6", "Embassy", "flag-outline", stubQ(12601, "护照", "Hùzhào", "Passport", [word("护照", "hùzhào", "passport")], "Passport.")],
], ["review-12", "Review: Emergencies", stubQ(12901, "火警", "Huǒjǐng", "Fire alarm", [word("火", "huǒ", "fire"), word("警", "jǐng", "alarm")], "Fire emergency.")]);

// ─── Scenarios (unchanged) ─────────────────────────────────────────────────────
const scenarios = [
  {
    id: "1",
    title: "Ordering Street Food",
    icon: "fast-food",
    isFree: true,
    description: "You are exploring a bustling night market and smell delicious dumplings.",
    goal: "Buy dumplings",
    tasks: ["Ask what fillings they have", "Ask for spicy sauce", "Pay with cash"],
    difficulty: "Beginner",
    phrasebook: [
      { hanzi: "请问，有什么馅儿的饺子？", pinyin: "Qǐngwèn, yǒu shénme xiànr de jiǎozi?", english: "Excuse me, what fillings do the dumplings have?" },
      { hanzi: "我想要一份饺子。", pinyin: "Wǒ xiǎng yào yí fèn jiǎozi.", english: "I'd like one portion of dumplings." },
      { hanzi: "我要猪肉白菜馅。", pinyin: "Wǒ yào zhūròu báicài xiàn.", english: "I want pork and cabbage filling." },
      { hanzi: "可以加辣吗？", pinyin: "Kěyǐ jiā là ma?", english: "Can you add spicy sauce?" },
      { hanzi: "不要太辣。", pinyin: "Bú yào tài là.", english: "Not too spicy, please." },
      { hanzi: "在这儿吃。", pinyin: "Zài zhèr chī.", english: "I'll eat here." },
      { hanzi: "我要打包。", pinyin: "Wǒ yào dǎbāo.", english: "I want it to go." },
      { hanzi: "一共多少钱？", pinyin: "Yígòng duōshao qián?", english: "How much is it in total?" },
      { hanzi: "可以便宜一点吗？", pinyin: "Kěyǐ piányi yìdiǎn ma?", english: "Can it be a little cheaper?" },
      { hanzi: "我用现金。", pinyin: "Wǒ yòng xiànjīn.", english: "I'll pay with cash." },
    ],
  },
  {
    id: "2",
    title: "Checking into a Hotel",
    icon: "bed",
    isFree: false,
    description: "You have just arrived at your hotel after a long flight.",
    goal: "Check in",
    tasks: ["State your name", "Ask about breakfast", "Ask for Wi-Fi"],
    difficulty: "Beginner",
  },
  {
    id: "3",
    title: "Shopping for Souvenirs",
    icon: "gift",
    isFree: false,
    description: "You are in a local gift shop looking for a present.",
    goal: "Buy a gift",
    tasks: ["Ask for a recommendation", "Ask for gift wrap", "Ask for price"],
    difficulty: "Intermediate",
  },
  {
    id: "4",
    title: "Asking for Directions",
    icon: "map",
    isFree: false,
    description: "You are lost in the city center.",
    goal: "Find the subway",
    tasks: ["Excuse yourself", "Ask where subway is", "Ask how far"],
    difficulty: "Beginner",
  },
];

const courseContent = {
  chapters: [
    { id: 1, title: "Greetings & Basics", lessons: ch1Lessons, review: ch1Review },
    { id: 2, title: "Numbers & Time", lessons: ch2Lessons, review: ch2Review },
    ch3,
    ch4,
    ch5,
    ch6,
    ch7,
    ch8,
    ch9,
    ch10,
    ch11,
    ch12,
  ],
  scenarios,
};

writeFileSync(outPath, JSON.stringify(courseContent, null, 2) + "\n", "utf8");

const qCount = courseContent.chapters.reduce(
  (n, ch) =>
    n +
    ch.lessons.reduce((ln, l) => ln + l.questions.length, 0) +
    ch.review.questions.length,
  0,
);
console.log(`Wrote ${outPath}`);
console.log(`Chapters: ${courseContent.chapters.length}, Questions: ${qCount}, Scenarios: ${scenarios.length}`);
