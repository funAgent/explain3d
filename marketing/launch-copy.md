# Explain3D 发布文案包

产品名：Explain3D by funAgent / 立体讲解工坊。

主张：让 AI 把一个原理，做成可以亲手探索的 3D 作品。

官网：https://explain.funagent.app
源码：https://github.com/funAgent/explain3d

以下是可直接编辑使用的草稿。发布前以实际线上版本核对链接与能力。尚未代发到社交账号。

## 小红书：效果向

标题：我把“看不懂的原理图”做成了能玩的3D

正文：

行星齿轮为什么能减速？以前看一张图，总觉得自己好像懂了。

这次我把它做成了一个可以操作的网页：转一下视角，拆开零件，改变输入转速，再看输入四圈怎样换成输出一圈。

按下播放，两边的配置会慢慢退开，只留下中间的机构。十秒之后，界面回来，你可以自己继续拆。

我把这套方法整理成了 Explain3D：十个可运行模板、对应提示词，还有一个让 Agent 按步骤建模、做交互、检查结果的 Skill。

除了齿轮，还能试试透镜、智能戒指拆解、Attention 和流水线。代码开源，可以拿去改成你想解释的问题。

它用的是普通屏幕里的透视、遮挡和运动视差。最让我想继续做下去的，是把“看过了”变成“我能亲手弄明白”。

入口：funAgent 官网的 Explain3D，或 GitHub 搜索 funAgent/explain3d。

#AI工具 #交互设计 #3D可视化 #机械原理 #开源项目 #AI编程

备选标题：

- 这个齿轮，拆开后我才看懂
- 让 AI 把原理做成能操作的网页
- 不止画一张图：给原理加上空间和交互

## 小红书：方法向

标题：做3D讲解，我给AI加了这套工作方法

正文：

让 AI “做得炫酷一点”，很容易得到一段会转的东西。但一改参数就露馅，或者进度条在走，模型还在按另一套时间转。

所以我把过程固定下来：先选一个问题，写清对象和计算关系，再做几何、时间线与交互，最后检查暂停、拖动、重播和参数联动。

Explain3D 就是这套方法的开源版本。网站放了十个可操作模板，Skill 里保留了共享播放器、场景接口、检查方法和本地起步脚本。

可以交给 ChatGPT/Codex 使用，也给 Claude Code、WorkBuddy 准备了安装说明；DeepSeek 可以通过具备代码执行能力的 Agent 宿主配合提示词使用。不同平台的复现状态在网站上分开标了。

希望它能帮人做出这样的东西：十秒先看懂大概，停下来再亲手探索。

代码：github.com/funAgent/explain3d

#AgentSkill #ClaudeCode #Codex #AI编程 #知识可视化

## 朋友圈 / 社群短文

做了一个新东西：Explain3D。

让 AI 把原理做成可以亲手探索的 3D 网页。先从行星齿轮开始，再补了透镜、擒纵、Attention、流水线等十个模板。

能拖动、拆开、调参数；播放讲解时配置会退场，让主体更突出。网站、提示词和 Skill 一起开源。

体验：https://explain.funagent.app
源码：https://github.com/funAgent/explain3d

欢迎拿一个自己总觉得“没完全看懂”的原理来试试。

## 公众号 / 掘金：文章草稿

标题：我想把“看懂原理”做成一种可以操作的体验

做这个项目，起点是一个很小的困惑：一张原理图画得再清楚，看的人仍可能只记住了零件的名字，没有理解它们为什么这样运动。

我先选了行星齿轮。内齿圈固定，中央的太阳轮输入，三个行星轮同时自转和公转，行星架输出。在这个例子里，输入四圈，输出一圈。

如果只展示它在转，观看者很难分辨哪些是输入，哪些是约束。于是我加了拆解、部件观察、转速参数和十秒讲解。按下播放，两侧和底部的配置信息收起；演示结束，再回到可以探索的界面。

这个变化让产品的重点逐渐清楚了：先用一个完整过程吸引注意，再把控制权交还给观看者。

接下来，我把同一套工作方法整理成 Skill。它先要求 Agent 写清问题、对象、变量和约束，再建立几何与交互。不同场景共用时间线、暂停、拖动、重播与配置退场，新主题仍要重新定义自己的计算关系。

目前的模板覆盖机械、产品结构、光学、天文示意和 AI/系统流程。这里面也有明确的取舍：电机是换向示意，不是完整电磁仿真；Attention 是三个固定分数的玩具计算；Agent 工作流是确定性事件回放。这些边界都随模板一起写出来。

我更关心的是，使用者能不能把方法带走。在网站上体验后，可以复制对应提示词，查看源码，安装 Skill，再换一个自己想解释的问题。跨模型使用要依赖宿主的文件、执行和预览能力，所以官网把安装说明与实际验证分开标注。

Explain3D 的网站本身也是一个可复用的交付物：GitHub 保存源码和文档，Vercel 接收提交并构建，模型检查通过后更新站点。希望它慢慢积累成一组可以读、可以改、可以复现的解释作品。

体验：https://explain.funagent.app
源码：https://github.com/funAgent/explain3d

如果你有一个总想讲清楚的原理，欢迎从一个模板开始。

## X：英文发布帖

I built Explain3D: turn one principle into a 3D explanation you can actually explore.

Rotate it. Separate the parts. Change a parameter. Play a 10-second walkthrough while the controls step aside.

10 runnable templates, reusable prompts, and an Agent Skill. Open source.

https://explain.funagent.app
https://github.com/funAgent/explain3d

跟帖：

The interesting part is the workflow: define the question and constraints, build the geometry, synchronize playback, then verify the relationships and interactions. New topics still need new models. Provider installation instructions are labeled separately from tested reproductions.

## GitHub Release 草稿

Explain3D 0.1.0 introduces a public showcase, ten runnable procedural teaching scenes, a portable create-spatial-explainer Skill, create/remix/audit prompts, and deterministic model checks.

Guided playback hides secondary configuration with easing and restores it on pause or completion. Progress and geometry share a sampled clock.

Known limits: cloud browser QA uses CPU fallback; real mobile GPU/orientation checks and independent Claude Code/WorkBuddy/DeepSeek host reproductions remain pending. Models explicitly disclose teaching simplifications.

## 社区发布：V2EX / 即刻 / Hacker News

中文标题：做了一个开源的交互原理讲解工具：Explain3D

做了十个可运行的三维解释模板，并把制作方法整理成 Agent Skill。主题包括行星齿轮、曲柄滑块、透镜、Attention 和分拣流水线。每个模板附参数、提示词、源码与简化说明。

比较想交流的问题：这种“先看十秒、再自己操作”的形式，是否适合你们的教学、产品说明或技术分享？也欢迎提交一个更适合交互解释的场景。

Show HN title: Show HN: Explain3D – explorable 3D explanations with an Agent Skill

English body: Explain3D ships ten runnable teaching templates and the workflow behind them. Each scene has a bounded question, parameters, a sampled timeline, source and explicit approximations. The reusable Skill guides an agent from scene specification to implementation and validation. I would appreciate feedback on what is easier to understand through interaction than through a static diagram.

## 公开表述原则

使用“实时三维原理讲解”“普通屏幕中的深度感”“AI 辅助构建并检查”。不使用“任意场景一键成功”“所有模型已验证”“无需硬件实现真正双眼裸眼3D”“获奖级认证”等尚无证据的表述。不编造用户量、节省时间、获奖记录或模型背书。
