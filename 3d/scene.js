// 沈公馆场景。单位：尺。
const SCENE = {};
(function () {
  const H1 = 5;      // 一楼剖切高度
  const F2 = 12;     // 二楼楼面标高
  const WALLC = '#e6dccb';

  function yards(s) {
    // 地坪
    M.floor(s, 0, 0, 150, 30, TX.mud(), 14);
    M.floor(s, 0, 90, 150, 115, TX.brick(), 10);
    // 后院石板小径
    [[70.5, 26.5], [71.2, 23.2], [70, 19.9], [65, 18.5], [60, 18.8], [54.8, 20], [42, 22.4], [37, 23.2], [32, 23.8], [25, 24.2], [20.5, 22.4]].forEach(([x, z]) => M.box(s, 3.6, 0.15, 2.4, x + 2, 0, z + 1.3, M.texMat(TX.stone(), 0.3, 0.3)));
    // 花圃
    M.box(s, 44, 0.5, 26, 126, 0, 15, M.texMat(TX.soil(), 3, 2));
    for (let i = 0; i < 6; i++) for (let j = 0; j < 3; j++) M.shrub(s, 108 + i * 7, 7 + j * 7, 1.3);
    M.tree(s, 142, 23, 4.5, 8);
    M.tree(s, 93, 9, 6.5, 11);
    M.tree(s, 8, 25.5, 3.4, 7, '#5a7448');
    M.well(s, 64, 11, 2.2);
    // 柴房
    M.floor(s, 2, 2, 25, 19, TX.mud(), 8, 0.04);
    M.logs(s, 10, 7, 14, 5, 3.2); M.logs(s, 21, 9, 4.5, 9, 2.6);
    M.wall(s, 2, 2, 25, 2, H1, 1, WALLC); M.wall(s, 2, 19, 25, 19, H1, 1, WALLC, [[17.8, 23]]); M.wall(s, 2, 2, 2, 19, H1, 1, WALLC); M.wall(s, 25, 2, 25, 19, H1, 1, WALLC);
    M.door(s, 23, 19, 5, -0.9);
    // 管家房
    M.floor(s, 27, 2, 46, 19, TX.plank(), 10, 0.04);
    M.bed(s, 42, 8.6, 5.6, 10, 0, false); M.table(s, 32.5, 6.3, 7, 4.6); M.chair(s, 32.5, 10, Math.PI); M.wardrobe(s, 42, 16.5, 6, 2.6, 6, Math.PI);
    M.wall(s, 27, 2, 46, 2, H1, 1, WALLC, [[39.5, 44.5, 3, 'win']]); M.wall(s, 27, 19, 46, 19, H1, 1, WALLC, [[30, 35.2]]); M.wall(s, 27, 2, 27, 19, H1, 1, WALLC); M.wall(s, 46, 2, 46, 19, H1, 1, WALLC);
    M.door(s, 30, 19, 5, 0.9);
    // 前院
    for (let k = 0; k < 4; k++) M.box(s, 11, 0.35 * (4 - k), 1.2, 57, 0, 90.6 + k * 1.2, '#b9b6aa');
    M.box(s, 6, 0.12, 19, 57, 0, 105, M.texMat(TX.stone(), 0.5, 1.5));
    M.tree(s, 25, 103, 5.8, 10); M.tree(s, 89, 103, 5.8, 10);
    M.box(s, 33, 0.5, 11, 126.5, 0, 99, M.texMat(TX.soil(), 2, 1));
    for (let i = 0; i < 5; i++) M.shrub(s, 114 + i * 6.2, 99, 1.6);
    // 院墙
    M.courtWall(s, 0, 0, 150, 0); M.courtWall(s, 150, 0, 150, 30); M.courtWall(s, 0, 0, 0, 30, 7, 1.2, [[19, 24.4]]);
    M.courtWall(s, 0, 115, 150, 115, 7, 1.2, [[51.5, 62.5]]); M.courtWall(s, 0, 90, 0, 115); M.courtWall(s, 150, 90, 150, 115);
    M.gatehouse(s, 57, 115, 11);
    const bd = M.door(s, 0, 19, 5.4, -1.1, '#5a2e1e'); bd.position.x = 0;
  }

  function firstFloor(s) {
    // 地面
    M.floor(s, 0, 30, 150, 38, TX.terrazzo(), 8);
    M.floor(s, 0, 38, 30, 90, TX.plank(), 12);
    M.floor(s, 30, 38, 82, 90, TX.herring(), 10);
    M.floor(s, 82, 38, 106, 90, TX.plank([168, 120, 76]), 12);
    M.floor(s, 106, 64, 124, 90, TX.plank(), 12);
    M.floor(s, 106, 38, 124, 64, TX.terrazzo(), 8);
    M.floor(s, 124, 38, 150, 90, TX.tile(), 8);
    M.floor(s, 138, 30, 150, 38, TX.flowerTile(), 6, 0.03);
    // 墙
    M.wall(s, 0, 30, 150, 30, H1, 1.6, WALLC, [[9, 21, 3, 'win'], [70, 76], [129, 136, 3, 'win']]);
    M.wall(s, 0, 90, 150, 90, H1, 1.6, WALLC, [[6, 22, 3, 'win'], [36, 48, 3, 'win'], [52.5, 61.5], [66, 78, 3, 'win'], [87, 101, 3, 'win'], [108, 120, 3, 'win'], [130, 144, 3, 'win']]);
    M.wall(s, 0, 30, 0, 90, H1, 1.6, WALLC, [[56, 70, 3, 'win']]);
    M.wall(s, 150, 30, 150, 90, H1, 1.6, WALLC, [[48, 62, 3, 'win'], [70, 82, 3, 'win']]);
    M.wall(s, 0, 38, 150, 38, H1, 1, WALLC, [[3, 8.6], [34, 39.6], [86, 91.4], [108.4, 121.6], [126.2, 131.8]]);
    M.wall(s, 30, 38, 30, 90, H1, 1, WALLC, [[47, 52.6]]);
    M.wall(s, 82, 38, 82, 90, H1, 1, WALLC, [[44, 49.6], [78, 83.6]]);
    M.wall(s, 106, 38, 106, 90, H1, 1, WALLC);
    M.wall(s, 124, 38, 124, 90, H1, 1, WALLC);
    M.wall(s, 82, 64, 124, 64, H1, 1, WALLC, [[118, 122.6]]);
    M.wall(s, 138, 30, 138, 38, H1, 1, WALLC, [[31.2, 36.6]]);
    // 门扇
    M.door(s, 70, 30, 6, 0.8); M.door(s, 34, 38, 5.6, -0.7); M.door(s, 3, 38, 5.6, -0.7); M.door(s, 86, 38, 5.4, -0.7); M.door(s, 126.2, 38, 5.6, -0.7);
    M.door(s, 52.5, 90, 4.5, 1.0, '#5a2e1e'); const dr = M.door(s, 61.5, 90, 4.5, Math.PI - 1.0, '#5a2e1e');
    // 前厅
    M.carpet(s, 45, 45, 69, 80, '#6b2a24', '#2b3b52');
    M.dining(s, 57, 61, 6.4, 19, 2.8, 0, '#6b4128');
    M.armchair(s, 57, 48.6, 0);
    [54.5, 59.5, 64.5, 69.5].forEach((z, i) => { M.chair(s, 52.6, z, Math.PI / 2); M.chair(s, 61.4, z, -Math.PI / 2); });
    M.chair(s, 57, 73.4, Math.PI);
    M.table(s, 57, 40.5, 20, 2.6, 3.2, 0, '#3f2516');
    M.plant(s, 33, 41, 1.3); M.plant(s, 79, 41, 1.3); M.plant(s, 33, 86, 1.3); M.plant(s, 79, 86, 1.3);
    M.armchair(s, 34.2, 64, Math.PI / 2); M.armchair(s, 34.2, 70, Math.PI / 2); M.table(s, 33.6, 67, 2.4, 2, 2.4);
    // 西厢
    M.covered(s, 9, 68.5, 12, 17, 2.6); M.covered(s, 24, 43, 8, 4, 6.5); M.covered(s, 22, 85, 10, 6, 3);
    // 客厅
    M.carpet(s, 84, 40, 104, 61, '#4a3a34', '#6b2a24');
    M.sofa(s, 94, 59.0, 13, Math.PI); M.armchair(s, 87.6, 51, Math.PI / 2); M.armchair(s, 100.6, 51, -Math.PI / 2);
    M.roundTable(s, 94, 50, 2.4, 2); M.gramophone(s, 103, 42); M.plant(s, 84.5, 40.5, 1);
    // 东厢
    M.bed(s, 99.5, 84.2, 7.5, 9.2, Math.PI, true);
    M.wardrobe(s, 88.5, 67.7, 9, 3.4, 6.5, 0);
    M.table(s, 102.6, 67.7, 5.2, 3.4, 2.7, 0, '#4a2e1c'); M.box(s, 2.8, 1.2, 2.2, 102.6, 2.7, 67.7, '#3a1f12'); M.box(s, 1.8, 2.6, 0.2, 102.6, 2.7, 66.2, M.mat('#cfd8d8', { metalness: 0.6, roughness: 0.15 }));
    M.screen(s, 84.5, 86, 3, 3);
    // 楼梯
    for (let i = 0; i < 14; i++) M.box(s, 13.6, 0.45 * (i + 1), 1.63, 115, 0, 62 - i * 1.63 - 0.8, i % 2 ? '#a5794c' : '#9a6e44');
    M.box(s, 0.4, 7, 22.8, 108.4, 0, 51, '#3f2516'); M.box(s, 0.4, 7, 22.8, 121.6, 0, 51, '#3f2516');
    // 下人房
    M.bed(s, 110, 74.5, 5, 9, 0, false); M.bed(s, 120, 74.5, 5, 9, 0, false); M.box(s, 4, 3, 6, 115, 0, 85, '#6b4a2e');
    // 厨房
    M.stove(s, 143.4, 43.2, 10.8, 6.4, 0);
    M.table(s, 127.8, 62, 4, 20, 3, 0, '#4a2e1c');
    [56, 60, 64, 68].forEach(z => M.cyl(s, 0.8, 0.6, 1.4, 127.8, 3, z, ['#6b5a3a', '#3a5a5a', '#8a6a3a', '#5a4a3a'][z % 4]));
    M.table(s, 139, 65.5, 10, 7, 2.6); M.chair(s, 133, 65.5, Math.PI / 2); M.chair(s, 145, 65.5, -Math.PI / 2);
    M.vat(s, 146.8, 56, 1.4); M.vat(s, 146.8, 83, 1.1);
    M.box(s, 16, 4, 2.6, 134, 0, 87.6, '#5a3a24');
    // 后廊、洗手间
    M.vat(s, 115, 34, 1.3); M.basin(s, 142, 35); M.toilet(s, 147.5, 35.5);
  }

  function massing1F(s) {
    M.box(s, 151.6, F2, 61.6, 75, 0, 60, WALLC);
    // 一层窗洞
    [[6, 22], [36, 48], [66, 78], [87, 101], [108, 120], [130, 144]].forEach(([a, b]) => M.box(s, b - a, 5, 0.4, (a + b) / 2, 3, 90.8, M.mat('#3a3430', { roughness: 0.4 })));
    M.box(s, 10, 9, 0.4, 57, 0, 90.8, '#4a261a');
    for (let k = 0; k < 4; k++) M.box(s, 11, 0.35 * (4 - k), 1.2, 57, 0, 90.6 + k * 1.2 + 0.6, '#b9b6aa');
    [[9, 21], [129, 136]].forEach(([a, b]) => M.box(s, b - a, 5, 0.4, (a + b) / 2, 3, 29.2, M.mat('#3a3430', { roughness: 0.4 })));
    M.box(s, 6, 8, 0.4, 73, 0, 29.2, '#4a261a');
  }

  function secondFloor(s) {
    const y = F2, g = M.group(s, 0, y, 0);
    M.floor(g, 0, 30, 52, 52, TX.plank(), 12); M.floor(g, 52, 30, 106, 52, TX.plank([170, 122, 80]), 12); M.floor(g, 124, 30, 150, 52, TX.plank(), 12);
    M.floor(g, 0, 52, 150, 60, TX.terrazzo(), 8);
    M.floor(g, 0, 60, 50, 90, TX.plank(), 12); M.floor(g, 50, 60, 100, 90, TX.plank([160, 112, 70]), 12); M.floor(g, 100, 60, 150, 90, TX.plank([150, 116, 84]), 12);
    // 楼梯井
    M.box(g, 14, 0.1, 22, 115, 0.01, 41, '#1d1814');
    for (let i = 0; i < 8; i++) M.box(g, 13.6, 0.4, 1.63, 115, -0.4 - i * 0.45, 31 + i * 1.63, '#9a6e44');
    // 露台
    M.box(s, 150, 1, 14, 75, F2 - 1, 97, '#cfc5ae');
    M.floor(g, 0, 90, 150, 104, TX.square(), 6, 0.02);
    for (let x = 7.5; x < 150; x += 15) M.cyl(s, 0.6, 0.6, F2 - 1, x, 0, 103.3, '#d8cfbb');
    M.balustrade(g, 0, 150, 104);
    M.plant(g, 3, 100.5, 1.3); M.plant(g, 147, 100.5, 1.3);
    // 墙
    const W2 = '#ece4d2';
    M.wall(g, 0, 30, 150, 30, H1, 1.6, W2, [[16, 32, 3, 'win'], [68, 82, 3, 'win'], [130, 145, 3, 'win']]);
    M.wall(g, 0, 90, 150, 90, H1, 1.6, W2, [[13, 30, 3, 'win'], [62, 76, 3, 'win'], [87, 98], [120, 136, 3, 'win']]);
    M.wall(g, 0, 30, 0, 90, H1, 1.6, W2, [[53, 59, 3, 'win']]);
    M.wall(g, 150, 30, 150, 90, H1, 1.6, W2);
    M.wall(g, 0, 52, 106, 52, H1, 1, W2, [[42, 47], [95, 100]]); M.wall(g, 124, 52, 150, 52, H1, 1, W2, [[126, 131]]);
    M.wall(g, 0, 60, 150, 60, H1, 1, W2, [[42, 47.2], [56, 61.8], [101, 106.2]]);
    M.wall(g, 52, 30, 52, 52, H1, 1, W2); M.wall(g, 106, 30, 106, 52, H1, 1, W2); M.wall(g, 124, 30, 124, 52, H1, 1, W2);
    M.wall(g, 50, 60, 50, 90, H1, 1, W2); M.wall(g, 100, 60, 100, 90, H1, 1, W2);
    // 落地窗（虚掩）
    const fw = M.group(g, 87, 0, 90, 0); M.box(fw, 5.5, 8, 0.25, 2.75, 0, 0, M.mat('#a9c3c6', { transparent: true, opacity: 0.4 })); M.box(fw, 5.5, 0.3, 0.3, 2.75, 7.8, 0, '#3f2516');
    const fw2 = M.group(g, 98, 0, 90, 0.5); M.box(fw2, 5.5, 8, 0.25, -2.75, 0, 0, M.mat('#a9c3c6', { transparent: true, opacity: 0.4 })); M.box(fw2, 0.3, 8, 0.3, -5.4, 0, 0, '#3f2516'); M.box(fw2, 0.3, 8, 0.3, -0.1, 0, 0, '#3f2516');
    // 门扇
    M.door(g, 42, 60, 5.2, 0.7); M.door(g, 56, 60, 5.8, -1.2); M.door(g, 101, 60, 5.2, -0.7);
    M.door(g, 47, 52, 5, Math.PI + 0.8); M.door(g, 100, 52, 5, Math.PI + 0.8); M.door(g, 126, 52, 5, -0.8);
    // 走廊
    M.box(g, 88, 0.05, 3, 61, 0.03, 56, M.texMat(TX.carpet('#6b2a24', '#2b3b52'), 1, 1));
    M.box(g, 2.2, 2.8, 2.2, 3, 0, 56, '#3f2516'); M.plant(g, 3, 56, 1.0, 2.8); M.lamp(g, 6.5, 2.8, 53.6); M.box(g, 1.6, 2.8, 1.6, 6.5, 0, 53.6, '#3f2516');
    // 景行房
    M.bed(g, 8, 39.5, 10, 15, 0, false); M.table(g, 39, 34.7, 12, 5.4); M.chair(g, 39, 39, Math.PI);
    M.bookcase(g, 24.5, 32.4, 11, 2, 7); M.gramophone(g, 47, 47); M.armchair(g, 25, 46, Math.PI);
    // 仲衡房
    M.bed(g, 61, 39.5, 10, 15, 0, true); M.table(g, 88.5, 34.7, 13, 5.4); M.chair(g, 88.5, 39, Math.PI);
    M.wardrobe(g, 75, 31.9, 10, 3.2, 6.5, 0); M.basin(g, 101, 34);
    // 杂物间
    M.box(g, 22, 4, 3, 137, 0, 32, '#5a3a24'); M.trunkBox(g, 133, 42, 6, 4, 3); M.trunkBox(g, 142.5, 44.2, 7, 4.4, 3.2);
    // 卧房
    M.bed(g, 10, 71.5, 14, 17, 0, true);
    M.table(g, 20.2, 64.8, 4.4, 4, 2.6, 0, '#3f2516');
    M.wardrobe(g, 39.5, 63.8, 13, 3.6, 6.5, 0);
    M.table(g, 40, 81.5, 14, 5, 2.7, 0, '#4a2e1c'); M.chair(g, 40, 78, Math.PI);
    M.screen(g, 19, 73, 3, 3, Math.PI / 2);
    // 书房
    M.carpet(g, 60, 70, 93, 87, '#6b2a24', '#2b3b52');
    M.duobao(g, 52.7, 75.5, 23, 3.8, 7.5, Math.PI / 2, 13);
    M.bookcase(g, 80, 62.1, 20, 2.6, 7);
    M.ironBox(g, 79.3, 7, 62.1);
    M.desk(g, 76.5, 77.5, 11, 5, 2.6, 0, '#4a2e1c');
    M.box(g, 3.2, 0.02, 2.2, 75.6, 2.6, 78.3, '#6e4a2c');
    M.armchair(g, 76.5, 81.6, Math.PI);
    M.slumped(g, 76.5, 81.6, 0);
    M.cyl(g, 0.6, 0.4, 0.5, 72.4, 2.6, 79.0, '#f2efe6'); M.cyl(g, 0.45, 0.45, 0.02, 72.4, 3.1, 79.0, '#5a3418');
    M.armchair(g, 96.2, 68, -Math.PI / 2); M.table(g, 93.9, 71.2, 2, 2, 2.2);
    M.cyl(g, 0.8, 0.6, 1.8, 91, 0, 83.2, '#a08a6a');
    M.plant(g, 97, 63.5, 1.2); M.plant(g, 53.5, 88, 1.0);
    // 空客房
    [[122.5, 66.8, 9, 5.6, 3.2], [132.5, 65.5, 7, 5, 2.6], [122, 73.5, 8, 5, 2.8], [142.5, 68, 9, 6, 3.4], [143.5, 75.3, 7, 4.6, 2.4]].forEach(([x, z, w, d, h]) => M.trunkBox(g, x, z, w, d, h));
    M.trunkBox(g, 122.5, 66.8, 7, 4.6, 2.2, 0.2, 3.2);
    M.covered(g, 138, 83, 16, 8, 3); M.covered(g, 117, 84.5, 7, 5, 4.5);
    M.rattan(g, 104.5, 65, Math.PI * 0.8);
  }

  SCENE.buildGround = (s) => { yards(s); firstFloor(s); };
  SCENE.buildUpper = (s) => { yards(s); massing1F(s); secondFloor(s); };
  SCENE.F2 = F2;
})();
