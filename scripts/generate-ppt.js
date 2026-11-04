// 知勤开题报告 PPT 生成脚本 — QA 修复版
const PptxGenJS = require("pptxgenjs");

const pres = new PptxGenJS();
pres.layout = "LAYOUT_16x9";
const SLIDE_W = 10, SLIDE_H = 5.625;
const MARGIN = 0.5, CONTENT_X = MARGIN, CONTENT_Y = MARGIN;
const CONTENT_W = SLIDE_W - 2 * MARGIN;
const C = {
  navy: "1E2761", indigo: "263077", ice: "CADCFC", white: "FFFFFF",
  cream: "F8F9FF", accent: "249980", gold: "D4A017", muted: "6B7BA8",
  text: "1A2448", light: "E8EDFB", darkbg: "121A3D"
};
const FONT_H = "Times New Roman", FONT_B = "Microsoft YaHei";

function darkSlide(title, subtitle) {
  const s = pres.addSlide();
  s.background = { color: C.navy };
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: SLIDE_H - 0.08, w: SLIDE_W, h: 0.08, fill: { color: C.accent } });
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 0.18, h: SLIDE_H, fill: { color: C.accent } });
  if (title) s.addText(title, { x: 0.5, y: 1.5, w: 9, h: 0.8, fontSize: 42, fontFace: FONT_H, color: C.white, bold: true, charSpacing: 2 });
  if (subtitle) s.addText(subtitle, { x: 0.5, y: 2.4, w: 9, h: 0.4, fontSize: 14, fontFace: FONT_B, color: C.ice });
  return s;
}
function lightSlide(title, index) {
  const s = pres.addSlide();
  s.background = { color: C.cream };
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: SLIDE_W, h: 0.06, fill: { color: C.accent } });
  if (index) s.addText(String(index).padStart(2, "0"), { x: 0.5, y: 0.5, w: 1.5, h: 0.35, fontSize: 16, fontFace: FONT_H, color: C.muted, italic: true });
  s.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 0.95, w: 0.05, h: 0.45, fill: { color: C.accent } });
  s.addText(title, { x: 0.7, y: 0.9, w: 8.8, h: 0.55, fontSize: 26, fontFace: FONT_H, color: C.text, bold: true, charSpacing: 1.5 });
  return s;
}
function footer(s) {
  s.addText("知勤 · 人脸识别考勤管理系统  |  开题报告", { x: 0.5, y: SLIDE_H - 0.35, w: 5, h: 0.3, fontSize: 9, fontFace: FONT_B, color: C.muted });
}
const CARD_TOP = 1.55;  // 卡片起始 Y，避开标题区

// ===== Slide 1 Cover =====
{
  const s = darkSlide();
  s.addText("Q", { x: 7.5, y: 0.4, w: 2.3, h: 2.6, fontSize: 180, fontFace: FONT_H, color: C.indigo, bold: true, align: "center" });
  s.addText("知 勤", { x: 0.5, y: 1.4, w: 4, h: 0.9, fontSize: 48, fontFace: FONT_H, color: C.white, bold: true, charSpacing: 6 });
  s.addText("人脸识别考勤管理系统", { x: 0.5, y: 2.25, w: 8, h: 0.55, fontSize: 22, fontFace: FONT_B, color: C.accent, bold: true });
  s.addText("设计与实现", { x: 0.5, y: 2.8, w: 4, h: 0.4, fontSize: 18, fontFace: FONT_B, color: C.ice });
  s.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 3.4, w: 3, h: 0.03, fill: { color: C.accent } });
  s.addText("软件工程课程设计 · 开题报告", { x: 0.5, y: 3.6, w: 6, h: 0.35, fontSize: 12, fontFace: FONT_B, color: C.muted });
  s.addText("2026 年 11 月", { x: 0.5, y: 3.95, w: 4, h: 0.3, fontSize: 12, fontFace: FONT_B, color: C.muted });
}

// ===== Slide 2 TOC =====
{
  const s = darkSlide("目  录", "Contents");
  const toc = ["01   研究背景与意义", "02   国内外研究现状", "03   研究内容与目标", "04   研究方法与技术路线", "05   系统设计方案", "06   项目计划与进度安排", "07   预期成果与技术亮点", "08   可能遇到的问题与解决方案"];
  toc.forEach((t, i) => {
    const col = i >= 4 ? 1 : 0, row = i % 4;
    const x = 0.7 + col * 4.3, y = 2.3 + row * 0.68;
    s.addShape(pres.shapes.OVAL, { x: x - 0.1, y: y + 0.1, w: 0.22, h: 0.22, fill: { color: C.accent } });
    s.addText(t, { x: x + 0.2, y: y, w: 4, h: 0.45, fontSize: 15, fontFace: FONT_B, color: C.white });
  });
  footer(s);
}

// ===== Slide 3 研究背景：考勤技术演进 =====
{
  const s = lightSlide("研究背景：考勤管理的技术演进", "3");
  const items = [
    { era: "1960s–1990s", name: "纸质签到", desc: "易代签、统计耗时", dot: "B85042" },
    { era: "2000s", name: "刷卡/指纹", desc: "硬件成本高、指纹易磨损", dot: "E8A87C" },
    { era: "2010s", name: "云端人脸识别", desc: "数据隐私风险、年费成本", dot: "3F86C5" },
    { era: "2020s", name: "浏览器端深度学习", desc: "全本地化、零硬件、零年费", dot: "249980" }
  ];
  const colW = 2.15, gap = 0.18;
  items.forEach((it, i) => {
    const x = 0.5 + i * (colW + gap);
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: CARD_TOP, w: colW, h: 3.0, fill: { color: C.white }, line: { color: C.light, width: 1 } });
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: CARD_TOP, w: colW, h: 0.12, fill: { color: it.dot } });
    s.addText(it.era, { x: x + 0.12, y: CARD_TOP + 0.18, w: colW - 0.24, h: 0.28, fontSize: 9, fontFace: FONT_H, color: C.muted, italic: true });
    s.addText(it.name, { x: x + 0.12, y: CARD_TOP + 0.45, w: colW - 0.24, h: 0.48, fontSize: 14, fontFace: FONT_H, color: C.text, bold: true });
    s.addText(it.desc, { x: x + 0.12, y: CARD_TOP + 1.0, w: colW - 0.24, h: 1.5, fontSize: 10.5, fontFace: FONT_B, color: "#44507A", autoFit: false, fit: "none" });
  });
  footer(s);
}

// ===== Slide 4 研究意义 =====
{
  const s = lightSlide("研究意义：三个层面", "4");
  const items = [
    { num: "01", title: "理论与方法层面", body: "探索浏览器端轻量级深度学习模型与后端业务系统的集成模式，研究【前端特征提取 + 后端欧氏距离匹配】的分布式人脸识别架构。" },
    { num: "02", title: "工程实践层面", body: "完整遵循 SPEC 编程方法，从需求调研 → OOA 三步建模 → SRS → V1.0 实现，展示一套面向小型项目的规范化软件工程流程。" },
    { num: "03", title: "应用价值层面", body: "产出【知勤】系统——全本地化部署、纯浏览器运行、零外部依赖、零硬件采购，适合 500 人以下小型团队或课程演示。" }
  ];
  items.forEach((it, i) => {
    const y = CARD_TOP + i * 1.15;
    s.addShape(pres.shapes.RECTANGLE, { x: 0.5, y, w: 0.05, h: 0.95, fill: { color: C.accent } });
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.65, y, w: 8.7, h: 0.95, fill: { color: C.white }, line: { color: C.light, width: 0.5 } });
    s.addText(it.num, { x: 0.8, y: y + 0.02, w: 0.7, h: 0.6, fontSize: 32, fontFace: FONT_H, color: C.accent, bold: true });
    s.addText(it.title, { x: 1.55, y: y + 0.05, w: 3.0, h: 0.35, fontSize: 14, fontFace: FONT_H, color: C.text, bold: true });
    s.addText(it.body, { x: 1.55, y: y + 0.4, w: 7.6, h: 0.5, fontSize: 10.5, fontFace: FONT_B, color: "#44507A", autoFit: false, fit: "none" });
  });
  footer(s);
}

// ===== Slide 5 国内外研究现状：技术演进 =====
{
  const s = lightSlide("国内外研究现状 — 人脸识别技术演进", "5");
  const rows = [
    ["1960s–1990s", "几何特征法", "眼距、鼻宽等人脸几何特征", "< 60%", "B85042"],
    ["1990s–2000s", "子空间方法", "PCA（特征脸）、LDA", "~ 70%", "D4A017"],
    ["2000s–2010s", "传统机器学习", "SVM + Haar Cascade", "~ 90%", "3F86C5"],
    ["2012 至今", "深度学习", "FaceNet / ArcFace（三元组损失）", "> 99%", "249980"]
  ];
  rows.forEach((r, i) => {
    const y = CARD_TOP + i * 0.82;
    s.addShape(pres.shapes.RECTANGLE, { x: 0.5, y, w: 9, h: 0.72, fill: { color: i % 2 === 0 ? C.white : C.light } });
    s.addText(r[0], { x: 0.7, y: y + 0.08, w: 1.8, h: 0.5, fontSize: 10, fontFace: FONT_B, color: C.muted, italic: true });
    s.addText(r[1], { x: 2.5, y: y + 0.08, w: 2.5, h: 0.5, fontSize: 14, fontFace: FONT_H, color: C.text, bold: true });
    s.addText(r[2], { x: 5.0, y: y + 0.12, w: 2.8, h: 0.45, fontSize: 10.5, fontFace: FONT_B, color: "#44507A" });
    s.addText(r[3], { x: 7.85, y: y + 0.12, w: 1.5, h: 0.45, fontSize: 13, fontFace: FONT_H, color: r[4], bold: true, align: "right" });
  });
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.5, y: 5.1, w: 9, h: 0.38, fill: { color: C.accent } });
  s.addText("本课题采用 FaceRecognitionNet 128 维描述符 + 欧氏距离匹配，属 FaceNet 技术路线的浏览器端轻量实现。",
    { x: 0.6, y: 5.14, w: 8.8, h: 0.32, fontSize: 10.5, fontFace: FONT_B, color: C.white, bold: true });
  footer(s);
}

// ===== Slide 6 竞品对照 =====
{
  const s = lightSlide("竞品功能对照 — 本项目的差异化定位", "6");
  const tableData = [
    ["功能", "钉钉", "企业微信", "中控 Face ID", "本项目「知勤」"],
    ["人脸识别打卡", "✅", "✅", "✅", "✅"],
    ["人脸特征本地存储", "❌ 云端", "❌ 云端", "✅ 本地", "✅ 本地"],
    ["管理员 Web 后台", "✅", "✅", "✅", "✅"],
    ["专用硬件采购", "需要", "需要", "需要", "❌ 零硬件"],
    ["外部云依赖", "需要", "需要", "可选", "❌ 完全本地化"],
    ["活体检测", "✅", "✅", "✅", "❌ 受监督演示"],
    ["成本", "年费", "年费", "硬件费", "✅ 零成本"]
  ];
  s.addTable(tableData, {
    x: 0.5, y: CARD_TOP, w: 9, colW: [2.0, 1.7, 1.7, 2.0, 1.6],
    fontSize: 10.5, fontFace: FONT_B, border: { type: "solid", color: C.light, pt: 0.5 },
    fill: { color: C.white }, rowH: 0.42,
    headerRow: { fill: { color: C.navy }, color: C.white, bold: true, fontSize: 11 },
    alternateRow: { fill: { color: "#F0F3FB" } }
  });
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.5, y: 5.1, w: 9, h: 0.38, fill: { color: C.cream }, line: { color: C.accent, width: 1.5 } });
  s.addText("核心价值：让小型团队用最轻量的方式实现人脸识别考勤 — 无需专用硬件、无需外部云、纯浏览器运行。",
    { x: 0.6, y: 5.14, w: 8.8, h: 0.32, fontSize: 10.5, fontFace: FONT_B, color: C.text, bold: true });
  footer(s);
}

// ===== Slide 7 研究内容 =====
{
  const s = lightSlide("研究内容", "7");
  const items = [
    { icon: "◎", color: "249980", title: "浏览器端人脸识别集成", desc: "三模型加载、摄像头帧处理、128 维描述符提取" },
    { icon: "∑", color: "3F86C5", title: "后端欧氏距离匹配算法", desc: "遍历比对 + 三重校验（阈值 + 模糊 + 状态）" },
    { icon: "⚙", color: "D4A017", title: "考勤业务逻辑建模", desc: "签到/签退互斥 + 事务 + 行锁并发安全" },
    { icon: "▣", color: "B85042", title: "Spring Boot 单体架构", desc: "Java 17 + Spring Boot 3.5.7 + H2" },
    { icon: "♺", color: "8B5FBF", title: "SPEC 编程方法实践", desc: "完整执行 SPEC 编程方法全流程（跨越两列）" }
  ];
  items.forEach((it, i) => {
    let x = 0.5 + (i % 2) * 4.55, w = 4.25, h = 1.15;
    if (i === 4) { x = 0.5; w = 9; h = 1.05; }
    const y = CARD_TOP + Math.floor(i / 2) * 1.35;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, fill: { color: C.white }, line: { color: C.light, width: 0.5 } });
    s.addText(it.icon, { x: x + 0.15, y: y + 0.15, w: 0.5, h: 0.75, fontSize: 24, fontFace: FONT_H, color: it.color, bold: true, align: "center" });
    s.addText(it.title, { x: x + 0.7, y: y + 0.12, w: w - 0.85, h: 0.38, fontSize: 12.5, fontFace: FONT_H, color: C.text, bold: true });
    s.addText(it.desc, { x: x + 0.7, y: y + 0.52, w: w - 0.85, h: h - 0.68, fontSize: 10, fontFace: FONT_B, color: "#44507A" });
  });
  footer(s);
}

// ===== Slide 8 研究目标 =====
{
  const s = lightSlide("研究目标（5 个量化指标）", "8");
  const goals = [
    { n: "G-01", kpi: "核心闭环", value: "8 大功能模块全链路", detail: "登录 → 建人 → 录脸 → 打卡" },
    { n: "G-02", kpi: "识别性能", value: "后端 ≤ 1 秒  ·  前端 ≤ 5 秒", detail: "500 人规模下匹配" },
    { n: "G-03", kpi: "安全防护", value: "CSRF + BCrypt + 401 JSON", detail: "Session 60min · 端口 127.0.0.1" },
    { n: "G-04", kpi: "代码质量", value: "7 / 7 集成测试通过", detail: "核心类 ≤ 150 行" },
    { n: "G-05", kpi: "部署体验", value: "一键启动 · 零外部依赖", detail: "start.ps1 + download-models.ps1" }
  ];
  goals.forEach((g, i) => {
    const y = CARD_TOP + i * 0.72;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.5, y, w: 9, h: 0.62, fill: { color: i % 2 === 0 ? C.white : C.light }, line: { color: C.light } });
    s.addShape(pres.shapes.OVAL, { x: 0.65, y: y + 0.1, w: 0.42, h: 0.42, fill: { color: C.accent } });
    s.addText(g.n, { x: 0.65, y: y + 0.12, w: 0.42, h: 0.42, fontSize: 8, fontFace: FONT_H, color: C.white, bold: true, align: "center" });
    s.addText(g.kpi, { x: 1.2, y: y + 0.05, w: 1.6, h: 0.42, fontSize: 13, fontFace: FONT_H, color: C.text, bold: true });
    s.addText(g.value, { x: 2.75, y: y + 0.1, w: 3.2, h: 0.38, fontSize: 13, fontFace: FONT_B, color: C.accent, bold: true });
    s.addText(g.detail, { x: 5.95, y: y + 0.12, w: 3.4, h: 0.36, fontSize: 10, fontFace: FONT_B, color: "#44507A" });
  });
  footer(s);
}

// ===== Slide 9 研究方法 =====
{
  const s = lightSlide("研究方法", "9");
  const methods = [
    { name: "文献研究法", desc: "梳理人脸技术演进、浏览器端深度学习、考勤架构文献" },
    { name: "竞品分析法", desc: "对标钉钉、企业微信、中控 Face ID 功能边界" },
    { name: "面向对象分析", desc: "OOA 三步建模：场景 → 静态 → 行为" },
    { name: "SPEC 编程方法", desc: "规格驱动开发，保证需求→设计→代码可追溯" },
    { name: "原型法", desc: "快速构建 Web 原型，26 个验收场景验证" },
    { name: "集成测试法", desc: "MockMvc + 内存 H2，7 条核心流程自动化验证" }
  ];
  const colW = 2.95, gap = 0.18;
  methods.forEach((m, i) => {
    const col = i % 3, row = Math.floor(i / 3);
    const x = 0.5 + col * (colW + gap), y = CARD_TOP + row * 1.9;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: colW, h: 1.68, fill: { color: C.white }, line: { color: C.light, width: 0.5 } });
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: colW, h: 0.42, fill: { color: C.navy } });
    s.addText(m.name, { x: x + 0.12, y: y + 0.04, w: colW - 0.24, h: 0.35, fontSize: 12, fontFace: FONT_H, color: C.white, bold: true });
    s.addText(m.desc, { x: x + 0.12, y: y + 0.5, w: colW - 0.24, h: 1.1, fontSize: 10, fontFace: FONT_B, color: "#44507A", autoFit: false, fit: "none" });
  });
  footer(s);
}

// ===== Slide 10 技术路线架构图 =====
{
  const s = lightSlide("技术路线：系统总体架构", "10");
  // 浏览器盒子
  const feX = 0.6, feY = CARD_TOP, feW = 3.2, feH = 3.6;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: feX, y: feY, w: feW, h: feH, fill: { color: "#F0F3FB" }, line: { color: C.navy, width: 1.2 } });
  s.addText("浏览器（前端）", { x: feX + 0.12, y: feY + 0.05, w: feW - 0.24, h: 0.35, fontSize: 12, fontFace: FONT_H, color: C.navy, bold: true });
  const feM = [["face-api.js", "检测·对齐·编码"], ["摄像头", "getUserMedia"], ["128维特征", "Float32Array"], ["原生 JS 界面", "6 个功能页面"]];
  feM.forEach((m, i) => {
    const my = feY + 0.45 + i * 0.72;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: feX + 0.1, y: my, w: feW - 0.2, h: 0.62, fill: { color: C.white }, line: { color: C.light } });
    s.addText(m[0], { x: feX + 0.2, y: my + 0.02, w: feW - 0.4, h: 0.3, fontSize: 10.5, fontFace: FONT_H, color: C.text, bold: true });
    s.addText(m[1], { x: feX + 0.2, y: my + 0.32, w: feW - 0.4, h: 0.22, fontSize: 9, fontFace: FONT_B, color: C.muted });
  });
  // 中间 REST 标识
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 3.95, y: 3.0, w: 2.1, h: 0.45, fill: { color: C.accent } });
  s.addText("REST API", { x: 3.95, y: 3.05, w: 2.1, h: 0.35, fontSize: 11, fontFace: FONT_B, color: C.white, bold: true, align: "center" });
  // Spring Boot 盒子
  const beX = 6.3, beW = 3.2, beH = 3.6;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: beX, y: feY, w: beW, h: beH, fill: { color: "#FFF4ED" }, line: { color: C.gold, width: 1.2 } });
  s.addText("Spring Boot 3.5.7", { x: beX + 0.1, y: feY + 0.05, w: beW - 0.2, h: 0.35, fontSize: 11, fontFace: FONT_H, color: "#8B6914", bold: true });
  const beM = [["SecurityConfig", "BCrypt · CSRF"], ["ApiController", "11 个 REST"], ["AttendanceService", "核心业务"], ["JdbcTemplate", "JDBC 访问"]];
  beM.forEach((m, i) => {
    const my = feY + 0.45 + i * 0.72;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: beX + 0.1, y: my, w: beW - 0.2, h: 0.62, fill: { color: C.white }, line: { color: "#E7D5A8" } });
    s.addText(m[0], { x: beX + 0.2, y: my + 0.02, w: beW - 0.4, h: 0.3, fontSize: 10.5, fontFace: FONT_H, color: C.text, bold: true });
    s.addText(m[1], { x: beX + 0.2, y: my + 0.32, w: beW - 0.4, h: 0.22, fontSize: 9, fontFace: FONT_B, color: C.muted });
  });
  // H2
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 7.2, y: feY + beH + 0.15, w: 1.4, h: 0.45, fill: { color: "#E8F4EA" }, line: { color: C.accent, width: 1 } });
  s.addText("H2 数据库", { x: 7.2, y: feY + beH + 0.18, w: 1.4, h: 0.4, fontSize: 10, fontFace: FONT_H, color: "#1F6E5A", bold: true, align: "center" });
  // ↓ 箭头
  s.addShape(pres.shapes.DOWN_ARROW, { x: 7.85, y: feY + beH - 0.02, w: 0.3, h: 0.3, fill: { color: C.gold } });
  footer(s);
}

// ===== Slide 11 核心算法 =====
{
  const s = lightSlide("核心算法：人脸识别 + 三重校验", "11");
  const steps = [
    { name: "摄像头帧", note: "640×480", col: "#1E2761" },
    { name: "TinyFaceDet.", note: "人脸检测", col: "#36454F" },
    { name: "Landmark68Net", note: "关键点对齐", col: "#3F86C5" },
    { name: "FaceRecog.Net", note: "128维编码", col: "#249980" },
    { name: "后端三重校验", note: "欧氏距离匹配", col: "#8B5FBF" }
  ];
  const stepW = (9 - (steps.length - 1) * 0.1 - 0.2) / steps.length;
  steps.forEach((st, i) => {
    const x = 0.5 + i * (stepW + 0.1);
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: CARD_TOP, w: stepW, h: 1.2, fill: { color: st.col } });
    s.addText(st.name, { x, y: CARD_TOP + 0.1, w: stepW, h: 0.5, fontSize: 10.5, fontFace: FONT_H, color: C.white, bold: true, align: "center" });
    s.addText(st.note, { x, y: CARD_TOP + 0.6, w: stepW, h: 0.5, fontSize: 9, fontFace: FONT_B, color: C.white, align: "center", italic: true });
    if (i < steps.length - 1) s.addShape(pres.shapes.RIGHT_ARROW, { x: x + stepW + 0.02, y: CARD_TOP + 0.45, w: 0.08, h: 0.26, fill: { color: C.accent } });
  });
  // 三重校验
  const checks = [
    { n: "①", t: "阈值判断", d: "best ≤ threshold（0.30–0.60 可配置）" },
    { n: "②", t: "模糊保护", d: "second − best ≥ 0.05（防止相似脸混淆）" },
    { n: "③", t: "身份有效", d: "active = TRUE 且已录入人脸" }
  ];
  checks.forEach((c, i) => {
    const y = CARD_TOP + 1.4 + i * 0.8;
    s.addShape(pres.shapes.OVAL, { x: 0.5, y: y + 0.08, w: 0.48, h: 0.48, fill: { color: C.accent } });
    s.addText(c.n, { x: 0.5, y: y + 0.1, w: 0.48, h: 0.48, fontSize: 16, fontFace: FONT_H, color: C.white, bold: true, align: "center" });
    s.addText(c.t, { x: 1.08, y: y + 0.05, w: 2.0, h: 0.38, fontSize: 13, fontFace: FONT_H, color: C.text, bold: true });
    s.addText(c.d, { x: 1.08, y: y + 0.4, w: 7.8, h: 0.35, fontSize: 11, fontFace: FONT_B, color: "#44507A" });
  });
  footer(s);
}

// ===== Slide 12 技术选型 =====
{
  const s = lightSlide("系统设计方案：技术选型", "12");
  const tech = [
    { layer: "后端", items: [["Java", "17"], ["Spring Boot", "3.5.7"], ["Spring Security", "6.x"], ["JDBC", "JdbcTemplate"], ["H2", "2.x"]] },
    { layer: "前端", items: [["face-api.js", "1.7.15"], ["摄像头 API", "getUserMedia"], ["界面", "原生 HTML/CSS/JS"]] },
    { layer: "工程化", items: [["构建", "Maven 3.6.3+"], ["测试", "JUnit 5 + MockMvc"], ["版本控制", "Git"]] }
  ];
  const colW = 2.95, gap = 0.18;
  tech.forEach((t, i) => {
    const x = 0.5 + i * (colW + gap);
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: CARD_TOP, w: colW, h: 3.7, fill: { color: C.white }, line: { color: C.light } });
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: CARD_TOP, w: colW, h: 0.42, fill: { color: C.navy } });
    s.addText(t.layer, { x: x + 0.12, y: CARD_TOP + 0.04, w: colW - 0.24, h: 0.35, fontSize: 13, fontFace: FONT_H, color: C.white, bold: true });
    t.items.forEach((it, j) => {
      const my = CARD_TOP + 0.48 + j * 0.55;
      s.addText(it[0], { x: x + 0.12, y: my, w: colW - 0.24, h: 0.3, fontSize: 11.5, fontFace: FONT_H, color: C.text, bold: true });
      s.addText(it[1], { x: x + 0.12, y: my + 0.3, w: colW - 0.24, h: 0.22, fontSize: 10, fontFace: FONT_B, color: C.muted });
    });
  });
  footer(s);
}

// ===== Slide 13 数据库设计 =====
{
  const s = lightSlide("数据库设计：三张表 ER 关系", "13");
  const tbX = 0.5, tbW = 2.9, tbColor = "249980";
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: tbX, y: CARD_TOP, w: tbW, h: 2.1, fill: { color: C.white }, line: { color: tbColor, width: 1 } });
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: tbX, y: CARD_TOP, w: tbW, h: 0.38, fill: { color: tbColor } });
  s.addText("employees", { x: tbX + 0.1, y: CARD_TOP + 0.02, w: tbW - 0.2, h: 0.35, fontSize: 12, fontFace: FONT_H, color: C.white, bold: true });
  const empFields = [["id", "BIGINT PK AUTO"], ["code", "VARCHAR(30) UNIQUE"], ["name", "VARCHAR(50)"], ["descriptor", "CLOB 128维"], ["active", "BOOLEAN"]];
  empFields.forEach((f, j) => {
    s.addText(f[0], { x: tbX + 0.12, y: CARD_TOP + 0.45 + j * 0.32, w: 1.3, h: 0.32, fontSize: 9.5, fontFace: FONT_B, color: C.text, bold: true });
    s.addText(f[1], { x: tbX + 1.3, y: CARD_TOP + 0.45 + j * 0.32, w: 1.55, h: 0.32, fontSize: 9, fontFace: FONT_B, color: C.muted });
  });
  // attendance
  const atX = 3.5, atColor = "3F86C5";
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: atX, y: CARD_TOP, w: 2.9, h: 3.0, fill: { color: C.white }, line: { color: atColor, width: 1 } });
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: atX, y: CARD_TOP, w: 2.9, h: 0.38, fill: { color: atColor } });
  s.addText("attendance", { x: atX + 0.1, y: CARD_TOP + 0.02, w: 2.7, h: 0.35, fontSize: 12, fontFace: FONT_H, color: C.white, bold: true });
  const atFields = [["id", "BIGINT PK AUTO"], ["employee_id", "BIGINT FK → emp"], ["attendance_date", "DATE"], ["check_in", "TIME"], ["status", "VARCHAR(30)"], ["resolved", "BOOLEAN"]];
  atFields.forEach((f, j) => {
    s.addText(f[0], { x: atX + 0.12, y: CARD_TOP + 0.45 + j * 0.32, w: 1.2, h: 0.32, fontSize: 9.5, fontFace: FONT_B, color: C.text, bold: true });
    s.addText(f[1], { x: atX + 1.25, y: CARD_TOP + 0.45 + j * 0.32, w: 1.55, h: 0.32, fontSize: 9, fontFace: FONT_B, color: C.muted });
  });
  // settings
  const seX = 6.5, seColor = "D4A017";
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: seX, y: CARD_TOP + 0.3, w: 3.0, h: 1.6, fill: { color: C.white }, line: { color: seColor, width: 1 } });
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: seX, y: CARD_TOP + 0.3, w: 3.0, h: 0.38, fill: { color: seColor } });
  s.addText("settings", { x: seX + 0.1, y: CARD_TOP + 0.32, w: 2.8, h: 0.35, fontSize: 12, fontFace: FONT_H, color: C.white, bold: true });
  const seFields = [["id", "INT PK (固定 = 1)"], ["start_time", "VARCHAR(5) HH:mm"], ["threshold", "DOUBLE 0.30-0.60"]];
  seFields.forEach((f, j) => {
    s.addText(f[0], { x: seX + 0.12, y: CARD_TOP + 0.75 + j * 0.3, w: 1.2, h: 0.3, fontSize: 9.5, fontFace: FONT_B, color: C.text, bold: true });
    s.addText(f[1], { x: seX + 1.25, y: CARD_TOP + 0.75 + j * 0.3, w: 1.65, h: 0.3, fontSize: 9, fontFace: FONT_B, color: C.muted });
  });
  // 关系说明
  s.addText("1 → N  employees:attendance", { x: 0.5, y: 4.65, w: 2.5, h: 0.3, fontSize: 10, fontFace: FONT_H, color: C.accent, bold: true });
  s.addText("FOREIGN KEY (employee_id → employees.id)  ·  UNIQUE(employee_id, attendance_date)", { x: 3.0, y: 4.65, w: 6.5, h: 0.3, fontSize: 9, fontFace: FONT_B, color: C.muted, italic: true, align: "right" });
  footer(s);
}

// ===== Slide 14 项目计划 =====
{
  const s = lightSlide("项目计划与里程碑", "14");
  const ms = [
    { m: "M1", name: "需求基线", st: "✅ 已达成" },
    { m: "M2", name: "API 就绪", st: "✅ 已达成" },
    { m: "M3", name: "功能闭环", st: "✅ 已达成" },
    { m: "M4", name: "PPT & 文档", st: "🔄 进行中" },
    { m: "M5", name: "答辩准备", st: "📋 规划中" }
  ];
  const stepW = (9 - 0.2) / ms.length;
  ms.forEach((m, i) => {
    const cx = 0.5 + i * stepW + stepW / 2;
    const dotColor = i <= 2 ? C.accent : i === 3 ? C.gold : C.light;
    s.addShape(pres.shapes.OVAL, { x: cx - 0.2, y: 1.7, w: 0.4, h: 0.4, fill: { color: dotColor } });
    s.addText(m.m, { x: cx - 0.2, y: 1.7, w: 0.4, h: 0.4, fontSize: 9, fontFace: FONT_H, color: C.white, bold: true, align: "center" });
    if (i < ms.length - 1) {
      const endColor = i <= 1 ? C.accent : C.light;
      s.addShape(pres.shapes.RECTANGLE, { x: cx + 0.2, y: 1.86, w: stepW - 0.4, h: 0.04, fill: { color: endColor } });
    }
    s.addText(m.name, { x: 0.5 + i * stepW + 0.05, y: 2.2, w: stepW - 0.1, h: 0.35, fontSize: 11.5, fontFace: FONT_H, color: C.text, bold: true, align: "center" });
    s.addText(m.st, { x: 0.5 + i * stepW + 0.05, y: 2.6, w: stepW - 0.1, h: 0.3, fontSize: 10, fontFace: FONT_B, color: i <= 2 ? C.accent : i === 3 ? C.gold : C.muted, bold: true, align: "center" });
  });
  // 下方进度摘要
  const phases = [["P0 需求分析", "3 天", "利益相关者 → SRS"], ["P1-P2 环境+后端", "4 天", "Spring Boot + AttendanceService"], ["P3-P5 API+前端+AI", "6 天", "REST + 6 页面 + face-api.js"], ["P6-P7 测试+文档", "3 天", "7 条集成测试 + README"]];
  phases.forEach((p, i) => {
    const y = 3.1 + i * 0.5;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.5, y, w: 9, h: 0.42, fill: { color: C.white }, line: { color: C.light } });
    s.addText(p[0], { x: 0.65, y: y + 0.05, w: 1.6, h: 0.35, fontSize: 10.5, fontFace: FONT_H, color: C.text, bold: true });
    s.addText(p[1], { x: 2.25, y: y + 0.05, w: 0.8, h: 0.35, fontSize: 10, fontFace: FONT_B, color: C.accent });
    s.addText(p[2], { x: 3.05, y: y + 0.05, w: 6.3, h: 0.35, fontSize: 10, fontFace: FONT_B, color: "#44507A" });
  });
  footer(s);
}

// ===== Slide 15 预期成果与技术亮点 =====
{
  const s = lightSlide("预期成果与技术亮点", "15");
  const highlights = [
    { icon: "▶", color: "249980", title: "浏览器端深度学习", desc: "三模型前端运行，无需服务端 GPU" },
    { icon: "≡", color: "3F86C5", title: "三重校验匹配", desc: "阈值 + 模糊 + 状态，拒绝假成功" },
    { icon: "◈", color: "D4A017", title: "核实闭环不篡改", desc: "核实仅写 note，status 永远不改" },
    { icon: "✓", color: "8B5FBF", title: "CSV 公式防护", desc: "= + @ - 开头自动前置单引号" },
    { icon: "▣", color: "B85042", title: "数据本地化零依赖", desc: "H2 + 本地模型 + 同源部署" },
    { icon: "★", color: "1E2761", title: "8 模块全链路", desc: "含趋势/环形图/部门分析" }
  ];
  const colW = 2.95, gap = 0.18;
  highlights.forEach((h, i) => {
    const col = i % 3, row = Math.floor(i / 3);
    const x = 0.5 + col * (colW + gap), y = CARD_TOP + row * 1.85;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: colW, h: 1.7, fill: { color: C.white }, line: { color: C.light } });
    // 图标深色圆（修复对比度问题）
    s.addShape(pres.shapes.OVAL, { x: x + 0.15, y: y + 0.15, w: 0.5, h: 0.5, fill: { color: h.color } });
    s.addText(h.icon, { x: x + 0.15, y: y + 0.12, w: 0.5, h: 0.5, fontSize: 16, fontFace: FONT_H, color: C.white, bold: true, align: "center" });
    s.addText(h.title, { x: x + 0.7, y: y + 0.15, w: colW - 0.85, h: 0.45, fontSize: 12, fontFace: FONT_H, color: C.text, bold: true });
    s.addText(h.desc, { x: x + 0.15, y: y + 0.7, w: colW - 0.3, h: 0.9, fontSize: 10, fontFace: FONT_B, color: "#44507A", autoFit: false, fit: "none" });
  });
  footer(s);
}

// ===== Slide 16 问题与解决方案 =====
{
  const s = lightSlide("可能遇到的问题与解决方案", "16");
  const risks = [
    { no: "01", p: "准确率受光线影响大", sol: "打卡提示光线 > 200 lux；阈值可配置" },
    { no: "02", p: "仅支持现代浏览器", sol: "明确声明仅支持 Chrome / Edge 最新版" },
    { no: "03", p: "首次模型下载需联网", sol: "download-models.ps1 脚本化下载" },
    { no: "04", p: "阈值难以精确校准", sol: "0.30–0.60 可配置 + 模糊保护兜底" },
    { no: "05", p: "照片重放 / 伪造描述符", sol: "边界声明：无活体检测，仅用于受监督演示" },
    { no: "06", p: "H2 并发能力有限", sol: "FOR UPDATE 行锁 + UNIQUE 约束防重复签到" }
  ];
  const colW = 4.4, gap = 0.2;
  risks.forEach((r, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = 0.5 + col * (colW + gap), y = CARD_TOP + row * 0.92;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: colW, h: 0.82, fill: { color: C.white }, line: { color: C.light } });
    s.addShape(pres.shapes.RECTANGLE, { x, y, w: 0.05, h: 0.82, fill: { color: C.gold } });
    s.addText(r.no, { x: x + 0.15, y: y + 0.05, w: 0.55, h: 0.35, fontSize: 16, fontFace: FONT_H, color: C.gold, bold: true });
    s.addText(r.p, { x: x + 0.7, y: y + 0.05, w: colW - 0.85, h: 0.35, fontSize: 11, fontFace: FONT_H, color: C.text, bold: true });
    s.addText(r.sol, { x: x + 0.7, y: y + 0.42, w: colW - 0.85, h: 0.35, fontSize: 10, fontFace: FONT_B, color: "#44507A" });
  });
  footer(s);
}

// ===== Slide 17 Thank You =====
{
  const s = darkSlide();
  s.addText("Q", { x: 4.5, y: 0.3, w: 2, h: 2.5, fontSize: 180, fontFace: FONT_H, color: C.indigo, bold: true, align: "center" });
  s.addText("致  谢", { x: 0.5, y: 3.0, w: 9, h: 0.8, fontSize: 36, fontFace: FONT_H, color: C.white, bold: true, align: "center", charSpacing: 6 });
  s.addText("感谢指导老师的悉心指导  ·  恳请各位老师批评指正", { x: 0.5, y: 3.9, w: 9, h: 0.35, fontSize: 13, fontFace: FONT_B, color: C.accent, bold: true, align: "center" });
  s.addShape(pres.shapes.RECTANGLE, { x: 4, y: 4.4, w: 2, h: 0.03, fill: { color: C.accent } });
  s.addText("知勤 · 人脸识别考勤管理系统  |  2026", { x: 0.5, y: 4.55, w: 9, h: 0.3, fontSize: 10, fontFace: FONT_B, color: C.muted, align: "center" });
}

pres.writeFile({ fileName: "知勤开题报告.pptx" }).then(() => console.log("OK")).catch(e => console.error(e));
