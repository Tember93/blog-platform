const prisma = require("./prismaClient")
const bcrypt = require("bcrypt")

async function main() {
  // ==========================================
  // 0. 清空旧数据（外键顺序：子表 → 父表）
  // ==========================================
  console.log("清空旧数据...")
  await prisma.comment.deleteMany()
  await prisma.articleTag.deleteMany()
  await prisma.article.deleteMany()
  await prisma.tag.deleteMany()
  await prisma.user.deleteMany()

  // ==========================================
  // 1. 创建用户（密码统一 123456）
  // ==========================================
  const hash = await bcrypt.hash("123456", 10)

  const sunny = await prisma.user.create({
    data: { username: "sunny", email: "sunny@blog.com", passwordHash: hash },
  })
  const zhiyin = await prisma.user.create({
    data: { username: "知隐", email: "zhiyin@blog.com", passwordHash: hash },
  })
  const liuyue = await prisma.user.create({
    data: { username: "六月", email: "liuyue@blog.com", passwordHash: hash },
  })

  console.log("用户已创建: sunny, 知隐, 六月")

  // ==========================================
  // 2. 创建标签（4 个旧 + 3 个新）
  // ==========================================
  const tagMovie = await prisma.tag.create({ data: { name: "影评" } })
  const tagBook = await prisma.tag.create({ data: { name: "书评" } })
  const tagTech = await prisma.tag.create({ data: { name: "计算机" } })
  const tagEssay = await prisma.tag.create({ data: { name: "随笔" } })
  const tagTravel = await prisma.tag.create({ data: { name: "旅行" } })
  const tagFood = await prisma.tag.create({ data: { name: "美食" } })
  const tagGrowth = await prisma.tag.create({ data: { name: "成长" } })

  console.log("标签已创建: 影评, 书评, 计算机, 随笔, 旅行, 美食, 成长")

  // ==========================================
  // 3. 创建文章（12 PUBLISHED + 2 DRAFT），生活/探索主题
  // ==========================================

  // --- 已发布 1/12 ---
  const a1 = await prisma.article.create({
    data: {
      title: "晨跑一年教会我的事",
      content: `
## 从"被迫"到"期待"

一年前的早晨，我在室友的拉扯下第一次出现在操场上。那时的我不知道什么是配速，一双帆布鞋就跑了八百米，肺像被火烧一样。

现在，我的跑鞋磨平了两双。

## 跑步不是自律，是和自己待一会儿

很多人觉得早起跑步是自律。但我想告诉你一个秘密：坚持下来的人不是因为自律，而是因为**跑步的那一段时光是每天唯一完全属于自己的**。

没有消息通知，没有待办列表，只有呼吸和脚步声。这种简单的节奏有一种奇妙的治愈力——它提醒你，你还活着，你的身体还能做很多事。

## 几个实用的入门建议

- 前两周只跑两公里，让身体适应
- 买一双适合自己脚型的跑鞋，这是唯一需要投资的装备
- 不要每天跑，跑一休一，给膝盖恢复的时间
- **忘掉配速**，舒服最重要

一年下来，最大的变化不是瘦了十斤，而是我变得更"耐烦"了。工作上的琐事不再那么容易让我焦躁。可能是因为我知道，没有什么是一个五公里解决不了的。如果有，就十公里。
      `.trim(),
      authorId: sunny.id,
      status: "PUBLISHED",
      createdAt: new Date("2026-05-03T07:30:00"),
      tags: {
        create: [{ tagId: tagGrowth.id }, { tagId: tagEssay.id }],
      },
    },
  })
  console.log(`  [PUBLISHED] ${a1.title}`)

  // --- 已发布 2/12 ---
  const a2 = await prisma.article.create({
    data: {
      title: "在京都迷路才是正经事",
      content: `
## 没有目的地的一天

出发前我花了两天做攻略，把伏见稻荷、清水寺、金阁寺标满了地图。但真正到了京都，导航在窄窄的巷子里彻底失灵了。

然后我就迷路了。**这是我整趟旅行最棒的决定。**

## 迷路发现的东西

穿过一条窄到只能一个人走的石板路，尽头是一间没有招牌的茶室。老奶奶在门前浇花，看到我，招了招手。

我不会日语，她不会中文。但一杯抹茶和一个蜜豆点心，比任何攻略推荐的网红店都让我记忆深刻。

我在她的茶室里坐了一个下午。她的院子里有一棵柿子树，阳光穿过树叶投下来，地上全是碎碎的光斑。

忽然觉得，人之所以喜欢旅行，可能不是因为你去了哪里，而是因为你在陌生的地方**终于可以不做原来的自己**。在那间茶室里，我只是一个喝抹茶的人，不需要想任何待办事项。
      `.trim(),
      authorId: zhiyin.id,
      status: "PUBLISHED",
      createdAt: new Date("2026-05-04T14:20:00"),
      tags: {
        create: [{ tagId: tagTravel.id }, { tagId: tagEssay.id }],
      },
    },
  })
  console.log(`  [PUBLISHED] ${a2.title}`)

  // --- 已发布 3/12 ---
  const a3 = await prisma.article.create({
    data: {
      title: "《活着》——余华笔下的人间烟火",
      content: `
## 一本我不敢重读的小说

余华说："人是为活着本身而活着，而不是为活着之外的任何事物所活着。"

这句话写在序言里，轻飘飘的，但当你翻完最后一页，它突然有了重量。

## 福贵不是悲剧英雄

很多人说《活着》是悲剧。但我读完之后有一种奇怪的感受：**福贵不是悲剧人物，他只是活得太认真了。**

他输掉家产，被抓壮丁，失去亲人，最后只剩一头老牛。但余华用一种近乎淡漠的笔调在写——没有煽情，没有控诉。这种克制的叙述反而让读者心里翻江倒海。

## 最打动我的一段

不是那些命运转折的大场面。

是福贵和家珍老了之后，两个人坐在门槛上晒太阳。不说话，就那样坐着。余华写道："日子比树叶子还稠。"

我合上书想，人这一生里值得羡慕的东西，可能不是财富或声望，而是在某个安静的下午，有一个人愿意和你坐在一起，什么话也不用说。
      `.trim(),
      authorId: sunny.id,
      status: "PUBLISHED",
      createdAt: new Date("2026-05-05T10:45:00"),
      tags: {
        create: [{ tagId: tagBook.id }],
      },
    },
  })
  console.log(`  [PUBLISHED] ${a3.title}`)

  // --- 已发布 4/12 ---
  const a4 = await prisma.article.create({
    data: {
      title: "外婆的糖醋排骨",
      content: `
## 一道菜，一个人，一段时光

外婆走后，我试了很多次糖醋排骨。每次都按照她说的步骤——先焯水，再煎到两面金黄，放糖、醋、酱油——但做出来的味道总是不对。

后来我才明白，那道菜里放了 **"等待"**。

## 那些没有被写进菜谱的东西

外婆做糖醋排骨的时候，从来不急。她从早上就开始准备，排骨要泡在水里半小时去血水。煎的时候火不能大，要一直翻面，让每一面都均匀上色。

我小时候嫌她慢——"为什么不直接用高压锅？"她笑一笑，说："好吃的东西急不来。"

现在我懂了。**她不是在做饭，她是在用做饭的时间和我待在一起。** 她把自己的人生炖进了那锅糖醋排骨里——那种耐心、那种从容、那种对生活的郑重其事。

前几天又做了一次。还是没有外婆的味道。但这次我没有沮丧。我知道那道菜会陪我一辈子，提醒我生活值得认真对待。
      `.trim(),
      authorId: liuyue.id,
      status: "PUBLISHED",
      createdAt: new Date("2026-05-06T08:10:00"),
      tags: {
        create: [{ tagId: tagFood.id }, { tagId: tagEssay.id }],
      },
    },
  })
  console.log(`  [PUBLISHED] ${a4.title}`)

  // --- 已发布 5/12 ---
  const a5 = await prisma.article.create({
    data: {
      title: "为什么要开始写博客",
      content: `
## 起因很偶然

朋友问我："你为什么不把你这些东西写下来？"

"什么东西？"

"就是那些你讲起来停不下来的——跑步的、读的书、做的奇怪梦。"

我一时语塞。因为我从来没觉得这些"东西"值得写下来。

## 写下来，是给以后自己的礼物

后来我读到一句话：*"The faintest ink is more powerful than the strongest memory."*（最淡的墨迹也胜过最强的记忆。）

我突然意识到，我在过去几年里经历了那么多让我感动、让我困惑、让我成长的事情，但我几乎没有留下任何文字记录。它们像沙子一样从指缝里漏掉了。

**写博客不是为了给谁看的。** 是为了五年后的自己，能重新翻到这一页，看到当时在想什么、在意什么、为什么烦恼。

## 如果你也想开始写

不需要什么完美主义。先把第一篇文章写出来，哪怕只有五百字。你先发第一篇，后面的事情自然会发生。
      `.trim(),
      authorId: sunny.id,
      status: "PUBLISHED",
      createdAt: new Date("2026-05-08T16:30:00"),
      tags: {
        create: [{ tagId: tagGrowth.id }, { tagId: tagTech.id }],
      },
    },
  })
  console.log(`  [PUBLISHED] ${a5.title}`)

  // --- 已发布 6/12 ---
  const a6 = await prisma.article.create({
    data: {
      title: "鼓浪屿的猫——一个慢下来的下午",
      content: `
## 被猫劫持的行程

本来计划上午逛完整个岛，中午去龙头路吃鱼丸，下午去看郑成功像。

结果在安海路的一条巷子里，遇到了一只三花猫。

它蜷在一面爬满三角梅的墙上，闭着眼睛，完全不理会世界。我忍不住停下来拍照。拍完之后又觉得，既然都停下来了，不如坐一会儿。

**这一坐就是两个小时。**

## 在不需要做什么的地方

鼓浪屿的猫有一种本地的气质——不急不躁。它们不会像宠物猫一样粘人，也不会像野猫一样警惕。它们只是在这个岛上和人类共同生活着，互不打扰。

我突然很羡慕这种状态。在城市里待久了，总觉得自己必须"在做点什么"。永远有一个待办项，永远有一个目标在前面等着。

但在那只猫面前，我意识到：**什么都不做，也是一种能力。** 而这种能力我已经很久没有用过了。
      `.trim(),
      authorId: zhiyin.id,
      status: "PUBLISHED",
      createdAt: new Date("2026-05-09T11:15:00"),
      tags: {
        create: [{ tagId: tagTravel.id }],
      },
    },
  })
  console.log(`  [PUBLISHED] ${a6.title}`)

  // --- 已发布 7/12 ---
  const a7 = await prisma.article.create({
    data: {
      title: "《驾驶我的车》——沉默比语言更有力",
      content: `
## 村上春树最好的电影改编

滨口龙介的三个小时电影里，有大量时间车里的人都不说话。但我一点都没有感到无聊。

相反，那些沉默是电影里最有力量的部分。

## 车是一个神奇的空间

电影里有一句话让我想了很久：**"只有在开车的时候，人才会说出真话。"**

因为坐在驾驶座上，你不用看对方的脸。因为眼睛要看着路，所以心里的话反而可以出来了。这是一种奇妙的亲密感——两个人并肩坐着，面向同一个方向，而不是面对面。

## 为什么会这么触动我？

因为我想到了自己的那些"车里对话"。和父母、和朋友、和恋人都曾有过——在某些深夜开车的路上，说了平时不会说的话。

第二天天亮，一切恢复正常。但那些深夜车里的话，才是关系里真正的地基。
      `.trim(),
      authorId: sunny.id,
      status: "PUBLISHED",
      createdAt: new Date("2026-05-10T20:45:00"),
      tags: {
        create: [{ tagId: tagMovie.id }],
      },
    },
  })
  console.log(`  [PUBLISHED] ${a7.title}`)

  // --- 已发布 8/12 ---
  const a8 = await prisma.article.create({
    data: {
      title: "手冲咖啡入门：从速溶到单品的距离",
      content: `
## 一杯速溶 vs 一杯手冲

不是要贬低速溶咖啡。它在很多场合——赶时间、办公室、宿舍——都是救星。但如果你从来没有喝过一杯真正的手冲单品，那你可能错过了咖啡世界最有趣的一面。

## 入门需要什么？

不需要三千块的磨豆机。**一百块的手摇磨 + 一个基本的滤杯 + 滤纸，就可以开始了。**

### 推荐的三步走

1. **选豆**：从埃塞俄比亚的耶加雪菲开始，它是新手最容易喝出"水果味"的豆子
2. **研磨**：粗细度像白砂糖颗粒，太细会苦，太粗会淡
3. **冲煮**：水温 90°C 左右，先焖蒸 30 秒，再分两次注水

第一次冲出来的味道可能和你想象的不一样。但当你终于喝到了豆袋上描述的那个"柑橘酸、花香尾韵"的时候，你会笑的。
      `.trim(),
      authorId: liuyue.id,
      status: "PUBLISHED",
      createdAt: new Date("2026-05-11T09:00:00"),
      tags: {
        create: [{ tagId: tagFood.id }, { tagId: tagGrowth.id }],
      },
    },
  })
  console.log(`  [PUBLISHED] ${a8.title}`)

  // --- 已发布 9/12 ---
  const a9 = await prisma.article.create({
    data: {
      title: "我为什么要坚持用 Markdown 写作",
      content: `
## 让写作回归文字本身

我第一次用 Word 写文章的时候，花了二十分钟调字体和行距——还没写一个字。

后来一位程序员朋友给我看了一个叫 Markdown 的东西：用 \`#\` 表示标题，用 \`**\` 表示加粗，用纯文本就能写出排版漂亮的文章。

**我当场就决定以后所有文字都用它写。**

## 几个理由

- **纯文本**：换电脑、换软件、从 Windows 到 Mac 到手机，永远打得开
- **专注内容**：没有格式栏打扰你，你不会写到一半又开始调字体
- **天然适合技术写作**：代码块、引用、链接都极其自然
- **Git 友好**：纯文本可以被版本控制追踪每一处修改

最开始可能有点不习惯——没有可视化编辑器，所有格式都靠简单的符号。但一周之后，你的手会自动打 \`##\` 来开一个新章节，反而会觉得鼠标点来点去很慢。

真正的好工具，是让你忘记它的存在。Markdown 做到了。
      `.trim(),
      authorId: sunny.id,
      status: "PUBLISHED",
      createdAt: new Date("2026-05-12T22:30:00"),
      tags: {
        create: [{ tagId: tagTech.id }, { tagId: tagEssay.id }],
      },
    },
  })
  console.log(`  [PUBLISHED] ${a9.title}`)

  // --- 已发布 10/12 ---
  const a10 = await prisma.article.create({
    data: {
      title: "凌晨三点的菜市场",
      content: `
## 一个城市最早醒来的地方

有一次赶早班火车，凌晨三点路过城东的批发市场。出于好奇走了进去，发现了一个完全陌生的世界。

这里没有白天的喧哗。菜贩们安静地卸货、码菜、喷水。灯光是黄黄的那种，照着翠绿的菜叶，每一捆都像是被精心摆放过。

我买了两根黄瓜带回家，**那是我吃过水分最多的黄瓜。**

## 这个世界有另一种节奏

从那之后我偶尔会去凌晨的菜市场。不是为了买菜，而是为了看看那些在大多数人还在睡觉时就已经开始工作的人。

卖豆腐的大叔说他每天两点起床，已经做了二十一年。我说辛苦，他笑笑："习惯了。而且早上的豆浆最好喝，你们都喝不到。"说这话的时候他很得意。

忽然觉得，我们对"美好生活"的定义太窄了。总是和钱、地位、假期绑在一起。但那个卖豆腐的大叔，在凌晨四点的菜市场，喝着第一碗豆浆的时候，也许是满足的。

**美好不挑剔时间。** 它在任何时刻都可能存在。
      `.trim(),
      authorId: liuyue.id,
      status: "PUBLISHED",
      createdAt: new Date("2026-05-13T03:30:00"),
      tags: {
        create: [{ tagId: tagFood.id }, { tagId: tagEssay.id }],
      },
    },
  })
  console.log(`  [PUBLISHED] ${a10.title}`)

  // --- 已发布 11/12 ---
  const a11 = await prisma.article.create({
    data: {
      title: "《人类简史》——想象力是这个物种的魔法",
      content: `
## 我们凭什么站在食物链顶端？

尤瓦尔·赫拉利给了我们一个意想不到的答案：不是语言，不是工具使用，而是 **"相信虚构事物的能力"**。

## 钱、国家、法律全部是故事

一块美元纸钞不能吃不能穿，为什么大家都愿意用劳动换它？因为我们都相信它的价值——而这个"相信"是集体的、共享的。

同样的逻辑适用于国家、法律、公司。这些并不是物理上存在的东西，而是人类集体想象出来的。赫拉利称之为"共同神话"。

**但正是这些虚构的事物，让陌生人可以大规模合作。** 蚂蚁只能在亲属之间合作，黑猩猩群体不能超过 150 只，而人类可以组织几百万人的国家。

## 读完的感受

这本书让我重新审视了很多"理所当然"的东西。它不是在告诉我们世界是假的，而是在提醒我们：**想象力的边界，就是这个物种可能达到的边界。**

你相信什么，你就为什么样的世界努力。
      `.trim(),
      authorId: zhiyin.id,
      status: "PUBLISHED",
      createdAt: new Date("2026-05-13T15:20:00"),
      tags: {
        create: [{ tagId: tagBook.id }],
      },
    },
  })
  console.log(`  [PUBLISHED] ${a11.title}`)

  // --- 已发布 12/12 ---
  const a12 = await prisma.article.create({
    data: {
      title: "一个人去西藏的七天",
      content: `
## 出发前所有人都说不要去

"你一个人去西藏？你疯了？""高反怎么办？""那边信号不好！"

我差点就没去。后来在一个旅行论坛看到一句话：**"如果你要等所有条件都完美了再出发，那你这辈子哪儿都去不了。"**

第二天我就买了火车票。

## 在那片土地上

到达拉萨的第一天，我确实高反了。头疼，喘不上气。躺在客栈里的时候想，是不是他们说的都对。

但第二天醒来，阳光透过窗帘照进来。我拉开帘子，看到远处的雪山和蓝得不真实的天空。一瞬间所有的不舒服都变得值得。

七天之后我发现，西藏给人的不是"洗涤灵魂"之类夸张的东西。它给你的是一种**比例感**。在城市里你觉得是全世界的问题，在这里看起来不值一提。那些山已经在那里几百万年了，它们什么没见过呢。
      `.trim(),
      authorId: liuyue.id,
      status: "PUBLISHED",
      createdAt: new Date("2026-05-14T06:45:00"),
      tags: {
        create: [{ tagId: tagTravel.id }, { tagId: tagGrowth.id }],
      },
    },
  })
  console.log(`  [PUBLISHED] ${a12.title}`)

  // --- 草稿 1/2 ---
  const a13 = await prisma.article.create({
    data: {
      title: "在杭州喝茶的日子",
      content: `
## 未完待续

去年春天在杭州住了两周，每天去不同的茶室。

龙井村的茶农会在清明前后忙得不可开交。但清明一过，节奏就慢下来了。他们坐在院子里，一杯一杯地泡自己家的茶。

一个老茶农和我说："好茶不怕泡。一泡三泡味道不一样，你要慢慢喝才能喝出来。"

我觉得这句话好像在说很多事情。
      `.trim(),
      authorId: zhiyin.id,
      status: "DRAFT",
      createdAt: new Date("2026-05-13T10:00:00"),
      tags: {
        create: [{ tagId: tagTravel.id }, { tagId: tagFood.id }],
      },
    },
  })
  console.log(`  [DRAFT]     ${a13.title}`)

  // --- 草稿 2/2 ---
  const a14 = await prisma.article.create({
    data: {
      title: "为什么要写年终总结",
      content: `
## 每年十二月的一个习惯

从大学开始，每年十二月我都会给自己写一份"年终总结"。不是写给任何人看的，就是对自己的一个交代。

这部分的写法还在整理中……
      `.trim(),
      authorId: sunny.id,
      status: "DRAFT",
      createdAt: new Date("2026-05-14T08:00:00"),
      tags: {
        create: [{ tagId: tagGrowth.id }],
      },
    },
  })
  console.log(`  [DRAFT]     ${a14.title}`)

  console.log("\n文章已创建: 12 篇已发布 + 2 篇草稿")

  // ==========================================
  // 4. 创建评论（不均匀分布，部分文章无评论）
  // ==========================================

  const commentData = [
    // 文章 1（晨跑）：2 条
    { articleId: a1.id, userId: zhiyin.id, content: "深有同感！跑了半年，最大的变化也是心态上的——以前遇事容易炸，现在会想'先跑完步再说'。" },
    { articleId: a1.id, userId: liuyue.id, content: "买了跑鞋之后第一次出门是最难的。这篇文章推了我一把，明天早上就去。" },

    // 文章 2（京都）：1 条
    { articleId: a2.id, userId: sunny.id, content: "看到柿子树的描写我仿佛也在那个院子里。旅行最妙的就是这种'意外闯入'的时刻。" },

    // 文章 3（活着）：2 条
    { articleId: a3.id, userId: liuyue.id, content: "\"日子比树叶子还稠\"——余华太会写了。好的文学就是用最简单的话说最重的事。" },
    { articleId: a3.id, userId: zhiyin.id, content: "我有一次看到凌晨四点的街道，突然就想起福贵和他的老牛，站在那里愣了很久。" },

    // 文章 4（外婆糖醋排骨）：无评论

    // 文章 5（写博客）：1 条
    { articleId: a5.id, userId: zhiyin.id, content: "\"是为了五年后的自己\"——这句话说服了我。今天就开始写第一篇。" },

    // 文章 6（鼓浪屿猫）：3 条
    { articleId: a6.id, userId: sunny.id, content: "我去鼓浪屿也遇到了那只三花猫！在钢琴博物馆附近，对不对？" },
    { articleId: a6.id, userId: liuyue.id, content: "什么都不做的能力——我们真的需要重新练习这个。" },
    { articleId: a6.id, userId: zhiyin.id, content: "好喜欢这篇文章的节奏，读起来就像那个下午一样慢。" },

    // 文章 7（驾驶我的车）：2 条
    { articleId: a7.id, userId: liuyue.id, content: "车里说的话天亮就忘——太真实了。很多重要的沟通都是在车上发生的。" },
    { articleId: a7.id, userId: zhiyin.id, content: "三个小时的电影居然一点不觉得长，滨口龙介的叙事节奏就是这种静水流深。" },

    // 文章 8（手冲咖啡）：无评论

    // 文章 9（Markdown）：1 条
    { articleId: a9.id, userId: liuyue.id, content: "从 Word 转到 Markdown 确实需要适应一阵子，但一旦习惯了就回不去。Typora 了解一下。" },

    // 文章 10（凌晨菜市场）：3 条
    { articleId: a10.id, userId: zhiyin.id, content: "凌晨的菜市场的氛围写得真好，黄黄的灯光下码得整整齐齐的菜——画面感很强。" },
    { articleId: a10.id, userId: sunny.id, content: "我以后路过菜市场一定会想起这篇文章。第一碗豆浆的幸福，确实是我们买不到的。" },
    { articleId: a10.id, userId: liuyue.id, content: "谢谢大家的喜欢~ 写这篇文章本身也是在凌晨完成的，写完去楼下买了豆浆。" },

    // 文章 11（人类简史）：2 条
    { articleId: a11.id, userId: sunny.id, content: "想象力界定边界——总结得真好。最近越来越觉得'认知'比'技能'重要。" },
    { articleId: a11.id, userId: liuyue.id, content: "推荐配合《未来简史》一起读，两本书连在一起会更宏。" },

    // 文章 12（西藏）：无评论
  ]

  for (const c of commentData) {
    await prisma.comment.create({ data: c })
  }

  const totalComments = commentData.length
  console.log(`\n评论已创建: ${totalComments} 条，分布在 ${new Set(commentData.map((c) => c.articleId)).size} 篇文章\n`)
  console.log("种子数据播种完成！")
  console.log("  种子用户: sunny@blog.com / zhiyin@blog.com / liuyue@blog.com（密码均为 123456）")
}

main()
  .catch((e) => {
    console.error("种子数据插入失败:", e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
