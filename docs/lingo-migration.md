# Lingo → Taro 迁移记录

来源：https://github.com/sanidhyy/duolingo-clone/tree/096e2531f353bf7437fe9d64099402080a27c6d8

上游 LICENSE：MIT / Copyright (c) 2024 Sanidhya Kumar Verma，副本位于 `licenses/Lingo-MIT.txt`。

| 上游入口 | 本次适配 |
| --- | --- |
| components/ui/button.tsx | components/ui.tsx Action + app.css，保留绿色/蓝色、圆角、底边厚度和按下反馈 |
| app/(main)/learn/lesson-button.tsx、unit-banner.tsx | pages/index/index.tsx，Taro Button、逐课解锁、偏移路径和当前关卡提示 |
| components/sidebar.tsx、mobile-sidebar.tsx | components/ui.tsx Shell，桌面侧栏、手机底栏；离线个人成就取代联网排行榜 |
| app/lesson/card.tsx、quiz.tsx、footer.tsx | pages/lesson/index.tsx，本地选择、校验、反馈、重试与完成保存 |
| scripts/prod.ts | data/course.ts，提取入门名词语料并组织 6 节短练习，不执行数据库脚本 |
| public/*.svg | 选取角色和图标，浏览器导出 256×256 PNG，保留形状与颜色以兼容小程序 |
| public/*.mp3、correct.wav、incorrect.wav | 仅选用已打包的发音及反馈音，Taro InnerAudioContext 播放并在离开时销毁 |

上游 README 素材鸣谢包括 Kenney、Freesound、Elevenlabs、Flagpack；保留该归属记录。迁移不包含付费服务、在线字体或动态下载素材。上游自带素材仅用于本地迁移展示，正式发布仍应核对各素材的独立许可。

Next/Image/Link、React DOM/Radix、server actions、数据库、Clerk、Stripe 没有进入运行依赖。课程进度采用独立本机 key，不声称同步或线上排名。现有 package 依赖和锁文件不变，仅新增测试脚本及更新说明。

备份：替换前源码、配置和 skills 已归档；发布前对受保护 skills 和说明逐文件比较 SHA-256。替换不删除或重装 `.agents/skills`、skills-provenance.json、AGENTS.md、docs/skills.md。
