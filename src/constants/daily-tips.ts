/** 每日小贴士分类 */
export type DailyTipCategory
  = | 'technique' // 刷牙手法
    | 'floss' // 牙线
    | 'rinse' // 漱口
    | 'tool' // 工具与更换
    | 'diet' // 饮食习惯
    | 'decay' // 龋齿与防护
    | 'special' // 特殊场景（孕期、矫正、智齿等）
    | 'clinic' // 看牙就诊

export interface DailyTip {
  id: string
  category: DailyTipCategory
  /** 标题，≤ 16 字 */
  title: string
  /** 正文，60-100 字 */
  body: string
  /** 来源（仅在确有可查证来源时填写） */
  source?: string
}

export const DAILY_TIP_CATEGORY_LABELS: Record<DailyTipCategory, string> = {
  technique: '刷牙手法',
  floss: '牙线',
  rinse: '漱口',
  tool: '工具',
  diet: '饮食',
  decay: '龋齿防护',
  special: '特殊场景',
  clinic: '就诊',
}

export const DAILY_TIPS: DailyTip[] = [
  // ── 刷牙手法 (technique) × 6 ──
  {
    id: 'technique_45deg',
    category: 'technique',
    title: '牙刷与牙龈成 45°',
    body: '巴氏刷牙法的核心是把刷毛对准牙齿与牙龈交界处，以约 45° 倾角轻贴牙龈线。这样刷毛能进入龈沟约 1mm，清除菌斑最有效的部位正在那里。',
    source: '参考：中华口腔医学会《巴氏刷牙法操作规范》',
  },
  {
    id: 'technique_small_strokes',
    category: 'technique',
    title: '小幅水平颤动',
    body: '不要大力来回拉锯。保持刷头稳定，做约 2 颗牙宽度的微小水平颤动，每个区域震颤 8-10 次后再换位置。这能避免牙龈萎缩与楔状缺损。',
  },
  {
    id: 'technique_two_minutes',
    category: 'technique',
    title: '总时间 2 分钟以上',
    body: '研究发现，2 分钟以下的刷牙清除菌斑效率显著下降。把口腔分成上下、内外、咬合面共 6 个区域，每个区域约 20 秒，刚好覆盖。',
    source: '参考：ADA（美国牙科协会）刷牙时长建议',
  },
  {
    id: 'technique_inner_vertical',
    category: 'technique',
    title: '门牙内侧要竖刷',
    body: '上下门牙内侧空间狭窄，把牙刷竖起来，用刷头前端的几束刷毛上下提刷。这是最容易被遗漏的死角，结石也最常堆积在这里。',
  },
  {
    id: 'technique_pressure',
    category: 'technique',
    title: '握笔式握刷柄',
    body: '像握铅笔那样三指轻握，而不是攥拳。刷牙的力量约为 150-200 克即可，太用力反而会磨损釉质和刺激牙龈。试着用非惯用手刷，自然就轻了。',
  },
  {
    id: 'technique_tongue',
    category: 'technique',
    title: '别忘了刷舌头',
    body: '舌背的舌乳头里藏有大量厌氧菌，是口臭的主要来源之一。每天最后用刷头或专用刮舌器从舌根向舌尖轻刮 3-5 下，注意别太靠后避免恶心反射。',
  },

  // ── 牙线 (floss) × 6 ──
  {
    id: 'floss_daily',
    category: 'floss',
    title: '牙线每天用一次',
    body: '牙刷只能清洁牙齿表面约 60% 的面积，邻面（两颗牙之间）要靠牙线。建议每晚刷牙前用一次牙线，不必早晚都用，关键是坚持每天。',
    source: '参考：WHO 口腔健康指南',
  },
  {
    id: 'floss_c_shape',
    category: 'floss',
    title: '牙线呈 C 形包绕',
    body: '把牙线轻轻滑过接触点，到达牙间后让它包绕牙齿成 C 形，紧贴一侧牙面上下移动 3-4 次，再换另一侧。不要直接横向拉锯切割牙龈。',
  },
  {
    id: 'floss_or_picks',
    category: 'floss',
    title: '牙线棒与牙线一样有效',
    body: '只要使用规范，一次性牙线棒和卷装牙线清洁邻面的效果差异很小。手部不灵巧或后牙难操作的人，用牙线棒更容易坚持。关键是每天都用。',
  },
  {
    id: 'floss_bleeding',
    category: 'floss',
    title: '牙龈出血先继续用',
    body: '初次使用牙线时牙龈出血，多半是早期牙龈炎症的表现。坚持每天正确使用，约 1-2 周后出血会明显减轻。如持续出血超过两周，建议看牙医。',
  },
  {
    id: 'floss_tight_contact',
    category: 'floss',
    title: '紧的牙缝用蜡线',
    body: '如果牙线总是断或塞不进去，换上有蜡涂层的牙线（dental tape），更顺滑。还是塞不进的紧密接触点，可能存在邻面龋或修复体悬突，建议就诊检查。',
  },
  {
    id: 'floss_braces',
    category: 'floss',
    title: '矫正中用牙线引导器',
    body: '佩戴固定矫治器时，普通牙线无法穿过弓丝。用牙线引导器（floss threader）或超级牙线，把线穿到弓丝之下，再清洁邻面。冲牙器是良好补充但不能完全替代。',
  },

  // ── 漱口 (rinse) × 4 ──
  {
    id: 'rinse_water_after_meal',
    category: 'rinse',
    title: '饭后清水漱口',
    body: '酸性食物或饮料（柑橘、可乐、咖啡）后牙釉质会暂时软化，立刻刷牙反而磨损。先用清水或无糖口香糖中和酸性，等 30 分钟再刷牙更安全。',
    source: '参考：英国 NHS 口腔卫生建议',
  },
  {
    id: 'rinse_fluoride_mouthwash',
    category: 'rinse',
    title: '含氟漱口水的用法',
    body: '含氟漱口水适合龋齿高风险人群（如戴矫治器、口干症患者）。每日 1-2 次，含漱 30 秒后吐出，30 分钟内不进食饮水以让氟化物充分作用于牙面。',
  },
  {
    id: 'rinse_dont_replace_brush',
    category: 'rinse',
    title: '漱口水不能代替刷牙',
    body: '漱口水冲不掉牙菌斑生物膜，只能减少游离细菌数量。真正去除菌斑必须靠机械刷洗与牙线。把漱口水当辅助而不是主角。',
  },
  {
    id: 'rinse_no_alcohol_kids',
    category: 'rinse',
    title: '儿童选无酒精漱口水',
    body: '6 岁以下不建议使用漱口水，避免误吞。6 岁以上选择无酒精配方，且每次用量不超过 10ml。年龄过小或吞咽控制不好时，刷牙加牙线已足够。',
  },

  // ── 工具 (tool) × 5 ──
  {
    id: 'tool_replace_3_months',
    category: 'tool',
    title: '牙刷三个月换一次',
    body: '当刷毛出现外翻、变形、变色，清洁效率会下降一半以上。即使外观正常，使用 3 个月（约 90 次刷洗）后也建议更换。生病康复后也应立即换刷。',
    source: '参考：ADA 牙刷使用建议',
  },
  {
    id: 'tool_soft_bristle',
    category: 'tool',
    title: '选软毛牙刷',
    body: '软毛比硬毛对牙龈更友好，且清除菌斑的能力相当甚至更好。挑选时注意刷头不要过大（覆盖 2-3 颗后牙的长度即可），方便深入到最里侧的磨牙区。',
  },
  {
    id: 'tool_electric_round',
    category: 'tool',
    title: '电动牙刷推荐圆头',
    body: '圆形小刷头的振动式电动牙刷在临床研究中清除菌斑、减少牙龈炎效果优于手动牙刷。但前提是仍需 2 分钟、覆盖所有牙面，机器只是替代了"颤动"动作。',
  },
  {
    id: 'tool_water_flosser',
    category: 'tool',
    title: '冲牙器是补充不是替代',
    body: '冲牙器能冲走食物残渣、改善牙周袋深处冲洗，对种植牙、矫正、牙周袋较深的人特别有用。但研究显示其去除菌斑效率仍弱于牙线，建议两者都用。',
  },
  {
    id: 'tool_storage',
    category: 'tool',
    title: '牙刷晾干立着放',
    body: '湿润的刷毛是细菌温床。刷完后甩干水珠，刷头朝上放置在通风处。多支牙刷共用一杯时彼此分开，避免交叉污染。不建议长期用密闭刷套。',
  },

  // ── 饮食 (diet) × 5 ──
  {
    id: 'diet_sugar_frequency',
    category: 'diet',
    title: '吃糖频率比总量更关键',
    body: '一次吃完一块巧克力，比分 5 次吃完同一块对牙齿伤害小得多。每次糖入口后牙菌斑产酸约持续 20-40 分钟。少吃零食、缩短"酸性窗口"是降低龋齿风险的核心。',
  },
  {
    id: 'diet_acidic_drinks',
    category: 'diet',
    title: '酸性饮料用吸管',
    body: '碳酸饮料、果汁、酸奶饮品都呈酸性，长期会侵蚀牙釉质。喝时使用吸管让液体绕过牙齿，喝完用清水漱口，避免立即刷牙以防加速磨损。',
  },
  {
    id: 'diet_water_after_snack',
    category: 'diet',
    title: '吃完零食喝口水',
    body: '没办法立刻刷牙时，喝几口清水冲走表面糖分和食物残渣，能显著降低牙菌斑产酸的强度。无糖口香糖也能促进唾液分泌，帮助中和酸性。',
  },
  {
    id: 'diet_xylitol',
    category: 'diet',
    title: '木糖醇可以减少龋齿',
    body: '木糖醇不能被致龋菌代谢成酸，长期咀嚼含木糖醇的口香糖可减少口腔中变形链球菌数量。但它仍是糖代用品，不能完全替代刷牙和牙线。',
  },
  {
    id: 'diet_calcium_phosphate',
    category: 'diet',
    title: '奶制品有助再矿化',
    body: '牛奶、奶酪、酸奶富含钙和磷酸盐，能在酸性侵蚀后帮助牙釉质再矿化。饭后吃一小块奶酪是简便的护牙习惯，比直接吃糖要友好得多。',
  },

  // ── 龋齿防护 (decay) × 4 ──
  {
    id: 'decay_fluoride_toothpaste',
    category: 'decay',
    title: '使用含氟牙膏',
    body: '含氟牙膏（含氟量 1000-1500 ppm）是预防龋齿最有效、最经济的方式。成人每次用量约黄豆大小，3-6 岁用米粒大小，3 岁以下需在医生指导下决定是否使用。',
    source: '参考：WHO 全球氟化物防龋共识',
  },
  {
    id: 'decay_no_rinse_after',
    category: 'decay',
    title: '刷完别立即大量漱口',
    body: '刷完牙后用清水大量漱口会冲走残留的氟化物，削弱防龋效果。建议吐掉牙膏泡沫即可，或仅用极少量水轻漱。这能让氟在牙面停留更久。',
    source: '参考：英国 NHS 含氟牙膏使用建议',
  },
  {
    id: 'decay_pit_fissure',
    category: 'decay',
    title: '窝沟封闭防龋齿',
    body: '后牙咬合面有许多深窝沟，刷毛进不去也是龋齿高发区。儿童（6 岁左右出第一颗恒磨牙时）做窝沟封闭，可降低龋齿发生率约 70%。',
  },
  {
    id: 'decay_white_spot',
    category: 'decay',
    title: '白斑是早期龋',
    body: '牙面上出现哑光的白色小斑块，是釉质脱矿、龋齿最早期的信号。这一阶段加强含氟产品使用、改善饮食与口腔卫生，仍可逆转，不必直接做填充。',
  },

  // ── 特殊场景 (special) × 4 ──
  {
    id: 'special_pregnancy',
    category: 'special',
    title: '孕期更需关注牙龈',
    body: '孕期激素变化会使牙龈更容易出血、肿胀，称为妊娠期牙龈炎。孕前检查并完成必要的治疗，孕中保持每天牙线，能减少早产、低体重儿的相关风险。',
    source: '参考：中华口腔医学会孕期口腔保健指南',
  },
  {
    id: 'special_braces',
    category: 'special',
    title: '矫正期间必备清洁',
    body: '托槽和弓丝周围特别容易堆积菌斑，矫正期间需要正畸专用牙刷、牙缝刷与冲牙器配合。每餐后清理一次，避免脱矫后牙面留下永久白斑。',
  },
  {
    id: 'special_dry_mouth',
    category: 'special',
    title: '口干症的护牙策略',
    body: '某些药物或疾病会引起口干，唾液不足会让龋齿和口臭风险大增。多次少量饮水、咀嚼无糖口香糖、使用含氟漱口水，必要时使用人工唾液产品。',
  },
  {
    id: 'special_wisdom_teeth',
    category: 'special',
    title: '智齿要不要拔',
    body: '完全萌出且能正常清洁、不影响咬合的智齿可以保留。位置不正、反复发炎、邻牙龋坏的智齿建议拔除。每年随访 X 光是判断的最佳依据。',
  },

  // ── 就诊 (clinic) × 4 ──
  {
    id: 'clinic_six_months',
    category: 'clinic',
    title: '半年检查一次',
    body: '健康的成年人每 6-12 个月做一次口腔检查。早期龋齿、牙周问题在没有症状时就能发现并处理，比拖到痛了再就医省时省钱也少受罪。',
    source: '参考：中华口腔医学会口腔健康行动计划',
  },
  {
    id: 'clinic_scaling',
    category: 'clinic',
    title: '洗牙不会让牙缝变大',
    body: '洗牙是去除牙石与色素，原本被牙石遮盖的牙缝、牙根暴露出来才会被察觉。规律洗牙（每年 1-2 次）反而能阻止牙周破坏导致的真正牙缝增大。',
  },
  {
    id: 'clinic_sensitivity',
    category: 'clinic',
    title: '牙齿敏感先就诊',
    body: '冷热酸甜刺激下牙齿一过性酸痛，可能是牙颈部楔状缺损、牙龈萎缩或早期龋。先到牙医处确认原因再决定使用脱敏牙膏，盲目用药会延误治疗。',
  },
  {
    id: 'clinic_emergency',
    category: 'clinic',
    title: '牙外伤越快越好',
    body: '恒牙整颗脱落时，用清水或牛奶冲洗（不要刷洗牙根），并尝试放回牙槽窝；做不到则含在嘴里或泡在牛奶中，30 分钟内到牙医处再植成功率最高。',
    source: '参考：国际牙外伤学会（IADT）指南',
  },
]
