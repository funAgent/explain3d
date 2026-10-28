# 分数如何变成下一个 Token

这是一段从候选分数出发的单步采样解释。同一组候选依次经历温度缩放、指数权重、归一化与随机数定位；词卡和颜色贯穿全过程。数值按数学定义实时计算，移动与形变用于引导注意力。

## 可复用的用户请求

“用精细、克制的彩色空间图解，解释分数如何经过温度和 Softmax 变成下一词的选择。每次只讲一步，气泡跟随正在变化的对象，播放时收起配置；能暂停检查计算并调温度比较。”

## 50 秒的教学顺序

| 时间 | 当前问题 | 可观察证据 |
| --- | --- | --- |
| 0–8 秒 | 模型给出的分数是什么？ | 四个候选和分数 `[3, 2, 1, 0]`，没有百分号 |
| 8–18 秒 | 温度改变什么？ | 原始分数保留；`z/T` 和分差随 T 变化 |
| 18–27 秒 | 怎样得到正权重？ | `exp(z/T)`，权重总和尚未归一化 |
| 27–36 秒 | 怎样得到概率？ | 每项除以同一个总和；概率带合计 100% |
| 36–45 秒 | 如何按概率选择？ | 固定种子生成的均匀随机数在 `[0,1)` 概率带上定位 |
| 45–50 秒 | 这次选择了什么？ | 浮起的词卡与所落区间一致；不继续生成下一词 |

默认 T=0.8，`mat` 概率约为 71.8%。固定随机数 `u≈0.621868`，本次会选择 `mat`；将 T 改成 2，同一随机数会落入 `floor` 区间。这个对照能够隔离“分布改变”的效果。点击再次抽样时才更换抽样序号，温度与输入保持不变。

## 图形与数学的边界

四个候选是本页完整的人工教学词表，分数不是任何真实语言模型的预测结果。真实 tokenizer 可能把一个词拆成多个 token，本页词卡不承担分词教学。本节也不讲 logits 是如何由神经网络算出来的。

所有阶段都保持候选身份与颜色一致。厚度、遮挡、倒角与微阴影只形成层次；概率必须由前视长度编码，不能用透视造成数值大小错觉。指数权重若使用自动量程，应显示量程或“相对高度”提示。概率带中的区域不可为了放文字而人为拉宽。

温度先缩放 logits，然后 Softmax 得到概率；原始 logits 不会被滑块改写。指数权重没有概率含义，必须完成归一化之后才显示百分比。提高温度使整体分布更平缓，不承诺每个较低排名候选概率都增加，也不承诺回答更正确。

累积概率区间采用左闭右开约定，边界上的 u 选择其右侧候选。随机数先确定，游标运动只展示这个数的位置。固定种子让暂停、倒退与重播可复现。多个抽样保持固定上下文；这是条件分布的重复实验，不是自回归续写。

## 实现与验证

纯模型位于 `model.mjs`，固定数据为只读常量，返回状态独立可修改。`compute(T)` 返回缩放分数、权重、权重和、概率、CDF 与熵；`sample(time, inputs)` 再加入章节、进度和采样结果。框架或渲染器只消费这些数据。

运行数学验证：

```sh
node apps/site/learn/token-choice/model.test.mjs
```

已经通过的计算检查包括 Python 独立黄金值、概率比恒等式、正权重、归一化、CDF 半开边界、温度与熵关系、两万次固定种子采样频率、43.2 秒的选择时点、正反向跳转和返回值隔离。

实际浏览器中的播放、布局、焦点、响应式和完成恢复由场景集成验证记录补充；纯模型测试不证明视觉或学习效果。

## 来源与范围

- [PyTorch Softmax 文档](https://docs.pytorch.org/docs/2.14/generated/torch.nn.Softmax.html)：指数归一化定义。
- [Hugging Face TemperatureLogitsWarper](https://huggingface.co/docs/transformers/en/internal/generation_utils#transformers.TemperatureLogitsWarper)：温度采样分布的调节。
- [Anatomy](https://github.com/wheresryan22/anatomy)：用户已确认的视觉工艺参考。本场景重新设计数学对象，不沿用轮盘作为主体。

此教学样例只在受限值域内直接计算 `exp(z/T)`，最大指数输入为 7.5，因此有限且安全。用于任意 logits 的通用实现应减去输入最大值，再计算指数；此平移不改变最终概率。

## 本地完成记录（2026-10-25）

- 新绘制 SVG 数学对象；主体未复用 Anatomy 轮盘。沿用前版已认可的浅色阶、细线、倒角与候选配色。
- 完整50秒播放后进度为50/50，设置恢复。中途暂停在29.45秒，恢复后保持原位置继续。
- 桌面浏览器与390×844手机布局：图形、气泡和公式无交叠，概率标签通过真实区间中心的细线关联。
- 相同u=0.621868…，T=.8选mat，T=2选floor；浏览器显示与模型测试一致。
- 指数阶段明细：mat的原分数3，除以.8得到3.75，指数42.52，权重总和59.19，概率71.8%；浏览器核对通过。
- 通用Skill的旧脚手架检查器要求runtime/viewer.mjs、runtime/playback.mjs、templates/catalog.mjs，本场景使用网站原生SVG适配层，因此该结构检查不适用且未通过；没有添加空文件凑通过。替代的evals/verify-token-choice.mjs检查实际交付依赖、完整spec、数值量程和概率区间。
- 未验证真实手机硬件、屏幕阅读器实机、系统减少动态效果开关或不同浏览器引擎；减少动态效果逻辑已实现。未运行真实LLM，无语音。
- 构建：npm run build；独立文件：node scripts/bundle-token-choice.mjs。完整检查：npm test。

## 2026-10-26 发布教学评审

通过开发者教学适配评审，尚未进行真实学习者效果研究。加入完成后的“检验理解”：先预测固定分数和u不变、T从.8到2时的候选，再得到累计概率区间的因果反馈，最后回到同一组参数的图形验证。错误答案不是只显示叉号；说明mat上界.4551、floor上界.7311，以及u=.6219为何属于floor。

本轮实查：课程入口可进入该场景；桌面端错误/正确选择与回到图形后T=2、floor27.6%一致；390×844手机布局下学习题完整可读。`npm run check`覆盖既有机械模板约束、新场景的独立模型测试与课程清单检查。真实设备与屏幕阅读器仍未实查。

## Reopened visual review: draft repair — 2026-10-28

The 32s probability-label defect has a source-level repair using shared geometry and ordered identity lanes. Numerical ownership/non-overlap/CDF/continuous-focus/reverse-seek checks cover3,620 poses. Full site checks pass. See `docs/ai-learning/reviews/2026-10-28-token-choice-rework.md` for precise changes and remaining gates. Browser connection was unavailable; no actual screenshots,390px legibility,lifecycle or4× craft acceptance were performed for this candidate. It is not published or visually accepted. Earlier published evidence remains historical and does not validate this new code.


## Follow-up visual and teaching review — 2026-10-28

Browser access was restored. Implemented exact operation rail, staged scale visibility, larger narrow type, continuous annotations and carrier contact repair. Actual desktop/390px and native4× review, forward/reverse intermediate frames, natural completion/replay/Escape, controlled hidden event and manual reduced-motion setting were exercised. Prediction check retained fixedu and returnedT=2/floor27.6%. See `docs/ai-learning/reviews/2026-10-28-token-choice-rework.md` for observed results/screenshots and untested limits. The initial draft's no-browser statement is historical. This is developer review, not measured learning gains or external aesthetic endorsement.
