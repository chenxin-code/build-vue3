<template>
  <div class="walk-page">
    <div ref="hostRef" class="canvas-host"></div>

    <div class="hud">
      <p class="hud-title">3D空间人物走动</p>
      <div class="key-row">
        <kbd>W</kbd><kbd>S</kbd>
        <span>前进 / 后退</span>
      </div>
      <div class="key-row">
        <kbd>A</kbd><kbd>D</kbd>
        <span>左转 / 右转</span>
      </div>
      <p class="hud-note">也可用方向键，按住 Shift 加速</p>
    </div>
  </div>
</template>

<script setup>
/**
 * ============================================================================
 * three.js 3D空间人物走动 —— 新手向说明
 * ============================================================================
 *
 * 【three.js 的"四件套"】
 * 任何 three.js 场景都由这四样东西拼起来，缺一不可：
 *
 *   1. Scene（场景）        —— 一个"舞台"，所有物体都要 add 进去才会被渲染。
 *   2. Camera（相机）       —— 决定"从哪儿看、看多大范围"。相机本身不渲染画面，
 *                              它只是一只眼睛。
 *   3. Mesh（网格）         —— 你看到的每个物体，都是 Geometry(形状) + Material(材质)
 *                              的组合：Geometry 决定"长什么形状"，
 *                              Material 决定"是什么颜色、反不反光"。
 *   4. Renderer（渲染器）   —— 把 Scene 按 Camera 的视角画到 <canvas> 上。
 *
 * 【三维坐标系约定】
 * three.js 默认用右手坐标系，且 **Y 轴朝上**（和 CSS/Canvas 的 Y 朝下相反）：
 *
 *              Y (上)
 *              |
 *              |
 *              +-------- X (右)
 *             /
 *            /
 *        Z (朝向屏幕外/朝向观察者)
 *
 * 所以"地面"是一个 XZ 平面，物体在地面上移动时改的是 position.x 和 position.z，
 * position.y 表示"离地多高"。
 *
 * 【动画是怎么动起来的】
 * three.js 没有内置时间轴。所谓动画，就是：
 *   改一下物体的 position / rotation → 调 renderer.render() 重画一帧
 *   → 用 requestAnimationFrame 在下一帧再改一点、再重画……
 * 一帧改的幅度 = 速度 × dt，dt 是这一帧与上一帧的时间差（秒）。
 * 乘以 dt 的好处：不管电脑跑 30 帧还是 144 帧，物体每秒移动的距离都一样，
 * 这就是下面反复出现 dt 的原因。
 * ============================================================================
 */

import {onMounted, onBeforeUnmount, ref} from 'vue';
import * as THREE from 'three';

// 存放 <canvas> 的容器 div。renderer 会把画布插到它里面。
const hostRef = ref(null);

/* --------------------------------------------------------------------------
 * 场景参数：改这些数字就能立刻感受到效果
 * ------------------------------------------------------------------------ */
const WORLD_RADIUS = 46; // 人物可活动范围的半径（单位是"米"，three.js 不强制单位）
const WALK_SPEED = 6.2; // 走路速度：每秒移动 6.2 个单位
const RUN_SPEED = 11; // 按住 Shift 的奔跑速度
const TURN_SPEED = 2.4; // 转向角速度：每秒转 2.4 弧度（约 137°）

/* --------------------------------------------------------------------------
 * 这些变量保存"整个组件生命周期内都要用"的 three.js 对象。
 * 用 let 而不是 const，是因为要等 onMounted 里 DOM 就绪后才能创建，
 * 卸载时再置回 null 方便 GC。
 * ------------------------------------------------------------------------ */
let renderer = null; // 渲染器：负责往 canvas 上画
let scene = null; // 场景：所有物体的容器
let camera = null; // 相机：观察视角
let character = null; // 人物整体（一个 Group，见 buildCharacter 的说明）
let limbPivot = null; // 四肢的旋转轴心，走路时靠它摆动手脚
let frameId = 0; // requestAnimationFrame 返回的编号，卸载时用它停掉循环
let walkPhase = 0; // 走路动画的"相位"，随时间累加后喂给 sin() 得到摆动

// 当前按住的键。用 Set 是因为可能同时按住 W 和 Shift（组合键）。
const pressed = new Set();

// THREE.Clock 在 0.187 已废弃，改用时间戳求帧间隔
let lastTime = 0;

/* --------------------------------------------------------------------------
 * 资源回收（three.js 新手最容易踩的坑）
 *
 * three.js 的 Geometry / Material / Texture 不只是普通 JS 对象，
 * 它们在 **显卡显存** 里也占了一块地方。Vue 组件销毁时如果不管它们，
 * 显存就永远收不回来 —— 切页面切个十几次，显卡内存就爆了。
 *
 * 解决办法：创建时统一走 track()，把它们登记进 disposables 数组，
 * 组件卸载时挨个 .dispose()。
 * ------------------------------------------------------------------------ */
const disposables = [];

const track = (item) => {
    disposables.push(item);
    return item; // 顺手把参数返回，这样能写在 new 的地方，不用多一行
};

/**
 * 材质工厂。这里用的是 MeshStandardMaterial（"标准材质"）：
 * 它是"基于物理"(PBR) 的材质，会真实地响应灯光，有明暗和反光，
 * 所以场景看起来是立体的。另外两种常见选择：
 *   - MeshBasicMaterial：完全不受灯光影响，永远是一个纯色，适合做发光体/UI 元素。
 *   - MeshPhongMaterial：老式的反光模型，比 Standard 便宜。
 * roughness（粗糙度）越大越"哑光"，metalness（金属度）越大越像金属。
 */
const createMaterial = (options) => track(new THREE.MeshStandardMaterial(options));

/* --------------------------------------------------------------------------
 * 地面
 * ------------------------------------------------------------------------ */

/** 地面 + 网格线，走动时提供位移参照 */
const buildGround = () => {
    /**
     * PlaneGeometry(宽, 高) 生成的是一张"立在 XY 平面上的纸片"，
     * 也就是竖着的。想让它变成水平地面，需要绕 X 轴转 -90°，
     * 把它的"上边"往后倒下去，铺到 XZ 平面上。
     * 这是 three.js 新手最常见的第一个困惑点：为什么地面要转一下。
     */
    const plane = new THREE.Mesh(
        track(new THREE.PlaneGeometry(WORLD_RADIUS * 2.6, WORLD_RADIUS * 2.6)),
        createMaterial({color: 0xdbe6f2, roughness: 0.95, metalness: 0})
    );
    plane.rotation.x = -Math.PI / 2;
    // receiveShadow：这个物体"接住"别人的影子。不设为 true，地上就看不到人物的影子。
    plane.receiveShadow = true;
    scene.add(plane);

    /**
     * GridHelper 画一张等分网格线。没有它的话，纯色的地面是"没有参照物的白布"，
     * 人物在原地还是移动根本看不出来 —— 三维场景里必须靠背景物体提供运动感。
     * 参数：总尺寸, 格子数量, 中心十字线颜色, 普通网格线颜色。
     */
    const grid = new THREE.GridHelper(WORLD_RADIUS * 2.6, 52, 0x9db6cf, 0xbcd0e4);
    // 往上抬一点点。地面和网格几乎在同一高度时，GPU 无法判断谁在前谁在后，
    // 会出现闪烁的"锯齿条纹"，这叫 z-fighting（深度冲突）。
    grid.position.y = 0.01;
    grid.material.opacity = 0.55;
    // transparent 必须是 true，opacity 才会生效（three.js 的硬性开关）。
    grid.material.transparent = true;
    scene.add(grid);
};

/* --------------------------------------------------------------------------
 * 障碍物（建筑 + 树）
 * ------------------------------------------------------------------------ */

/** 散布建筑块与树，形成空间纵深 */
const buildObstacles = () => {
    const blockMat = createMaterial({color: 0xa9c2dc, roughness: 0.8});
    const blockTopMat = createMaterial({color: 0x7f9dba, roughness: 0.7});
    const trunkMat = createMaterial({color: 0x8d6b4b, roughness: 0.9});
    const leafMat = createMaterial({color: 0x5f9e74, roughness: 0.85});

    // [x, z, 宽, 高, 深]
    const blocks = [
        [-18, -14, 6, 9, 6],
        [16, -20, 8, 6, 8],
        [24, 12, 5, 12, 5],
        [-26, 16, 7, 7, 7],
        [-6, 26, 9, 5, 6],
        [10, 30, 5, 8, 5],
    ];

    blocks.forEach(([x, z, w, h, d]) => {
        /**
         * BoxGeometry(宽, 高, 深) 生成的立方体，它的"中心"在自身原点。
         * 也就是说如果不移动它，它会有一半埋在地底下。
         * 所以这里 position.y = h / 2，把中心抬到半个高度，底面刚好贴地。
         * 这是摆放三维物体的通用套路：几何体中心在原点 → 抬升半个高度。
         */
        const block = new THREE.Mesh(track(new THREE.BoxGeometry(w, h, d)), blockMat);
        block.position.set(x, h / 2, z);
        // castShadow：这个物体"投射"影子出去。和 receiveShadow 是两回事，可以只开一个。
        block.castShadow = true;
        block.receiveShadow = true;
        scene.add(block);

        // 楼顶压一圈稍大的边，让轮廓不那么"纸片"，看起来像真建筑。
        const cap = new THREE.Mesh(track(new THREE.BoxGeometry(w * 1.12, 0.5, d * 1.12)), blockTopMat);
        cap.position.set(x, h + 0.25, z);
        cap.castShadow = true;
        scene.add(cap);
    });

    // [x, z]
    const trees = [
        [-12, 8],
        [8, -8],
        [30, -6],
        [-32, -4],
        [2, 18],
        [-20, 30],
        [22, 26],
        [-34, 26],
    ];

    trees.forEach(([x, z]) => {
        // CylinderGeometry(顶部半径, 底部半径, 高, 圆周分段数)
        // 顶比底略细 → 视觉上更像树干。分段数越高越圆，但顶点也越多。
        const trunk = new THREE.Mesh(track(new THREE.CylinderGeometry(0.42, 0.55, 3.2, 12)), trunkMat);
        trunk.position.set(x, 1.6, z);
        trunk.castShadow = true;
        scene.add(trunk);

        // ConeGeometry(底面半径, 高, 分段数) —— 圆锥树冠
        const crown = new THREE.Mesh(track(new THREE.ConeGeometry(2.3, 4.6, 14)), leafMat);
        crown.position.set(x, 5.2, z);
        crown.castShadow = true;
        scene.add(crown);
    });
};

/* --------------------------------------------------------------------------
 * 人物
 * ------------------------------------------------------------------------ */

/**
 * 用基本几何体拼一个小人。
 *
 * 【Group 是什么】
 * Group 是一个"看不见的容器"，它自己没有形状，但可以像物体一样设置位置、旋转，
 * 并且会 **带着里面所有子物体一起动**。这里：
 *   - 最外层 group = 整个人，走路时移动它、转向时旋转它。
 *   - 每条四肢各有一个自己的 Group（叫 pivot）当"关节"。
 *
 * 【为什么四肢要额外套一层 pivot —— 这是本文件最关键的一处设计】
 * 三维物体的旋转永远是 **绕着自己的原点** 转的。
 * 如果把手臂做成一个长方体就直接 rotation.x 摆动，它会绕"手臂中心"转，
 * 结果手臂像竹蜻蜓一样在肩膀位置打横旋转 —— 穿模。
 *
 * 我们要的是"肩关节不动、手臂整体绕肩甩"。做法是：
 *   pivot（关节点，放在肩膀坐标）
 *      └── 手臂几何体，往下挪半个长度，于是它的顶端正好贴在 pivot 上
 * 这样绕 pivot 转 X 轴，手臂就是绕肩膀前后摆动了。
 * 腿同理，绕髋关节摆。
 *
 *              pivot ●  ←—— 旋转发生在这里（肩）
 *                    |
 *                    |  手臂几何体（中心已下移 length/2）
 *                    |
 *                    ▾
 */
const buildCharacter = () => {
    const skinMat = createMaterial({color: 0xf1c49b, roughness: 0.7});
    const shirtMat = createMaterial({color: 0x3f7fd0, roughness: 0.65});
    const pantsMat = createMaterial({color: 0x35465c, roughness: 0.7});
    const shoeMat = createMaterial({color: 0x24292f, roughness: 0.6});
    const hairMat = createMaterial({color: 0x4a3526, roughness: 0.8});

    const group = new THREE.Group();

    // 躯干。position.y 都是"相对 group 原点(脚底)"的高度。
    const torso = new THREE.Mesh(track(new THREE.BoxGeometry(1.05, 1.35, 0.62)), shirtMat);
    torso.position.y = 1.78;
    torso.castShadow = true;
    group.add(torso);

    // SphereGeometry(半径, 横向分段, 纵向分段)
    const head = new THREE.Mesh(track(new THREE.SphereGeometry(0.42, 28, 22)), skinMat);
    head.position.y = 2.85;
    head.castShadow = true;
    group.add(head);

    /**
     * 头发 = 一个稍大一点的球，但只取上半部分。
     * SphereGeometry 的后两个参数 (0, Math.PI * 0.55) 控制"从顶部量起，画多少弧度"，
     * 0.55π < π 所以只画出一截球帽，扣在头上就像头发。
     * 这种"少画一点"的技巧在三维建模里非常常用。
     */
    const hair = new THREE.Mesh(track(new THREE.SphereGeometry(0.44, 26, 18, 0, Math.PI * 2, 0, Math.PI * 0.55)), hairMat);
    hair.position.y = 2.89;
    hair.castShadow = true;
    group.add(hair);

    /**
     * 造一条四肢：先建关节(pivot)，再把几何体挂到关节下方。
     * @param width  肢体粗细
     * @param length 肢体长度
     * @param mat    材质
     * @param px     关节的水平位置（左右）
     * @param py     关节的高度（肩或髋）
     */
    const makeLimb = (width, length, mat, px, py) => {
        const pivot = new THREE.Group();
        pivot.position.set(px, py, 0);

        const mesh = new THREE.Mesh(track(new THREE.BoxGeometry(width, length, width)), mat);
        // 几何体下移半个长度，使 pivot 落在肢体的顶端关节处
        mesh.position.y = -length / 2;
        mesh.castShadow = true;
        pivot.add(mesh);

        group.add(pivot);
        return pivot; // 返回关节，后面 animate 里要旋转它
    };

    // 手臂挂在肩高 2.36，左右各偏 0.68；腿挂在髋高 1.1。
    const leftArm = makeLimb(0.26, 0.95, shirtMat, -0.68, 2.36);
    const rightArm = makeLimb(0.26, 0.95, shirtMat, 0.68, 2.36);
    const leftLeg = makeLimb(0.3, 1.1, pantsMat, -0.26, 1.1);
    const rightLeg = makeLimb(0.3, 1.1, pantsMat, 0.26, 1.1);

    /**
     * 鞋子直接 add 到"腿"这个 pivot 上，成为它的孙子节点。
     * 三维变换是层层继承的：腿往前摆，鞋子会跟着一起往前摆，不用单独算。
     * 这就是父子层级结构在动画里的最大价值。
     */
    const addShoe = (leg) => {
        const shoe = new THREE.Mesh(track(new THREE.BoxGeometry(0.34, 0.18, 0.5)), shoeMat);
        // 腿长 1.1、中心下移了 0.55，所以腿末端在 pivot 局部坐标 -1.1 附近；
        // position.z = 0.1 把鞋子往前挪一点，露出"脚尖"。
        shoe.position.set(0, -1.05, 0.1);
        shoe.castShadow = true;
        leg.add(shoe);
    };
    addShoe(leftLeg);
    addShoe(rightLeg);

    limbPivot = {leftArm, rightArm, leftLeg, rightLeg};
    character = group;
    scene.add(group);
};

/* --------------------------------------------------------------------------
 * 灯光
 * ------------------------------------------------------------------------ */

/**
 * 前面提过：MeshStandardMaterial 不吃光就是一片黑。
 * 这里叠了三种灯，是三维场景很典型的"三点照明"思路：
 */
const setupLights = () => {
    // 环境光：从四面八方均匀照过来，没有方向、不产生影子。
    // 作用是"垫底"，保证阴影里的暗部不至于纯黑看不见。
    scene.add(new THREE.AmbientLight(0xffffff, 1.15));

    // 半球光：上方一种颜色(天空蓝)、下方一种颜色(地面灰)，模拟真实户外光照。
    // 比环境光柔和且有层次，是户外场景的常客。
    const hemi = new THREE.HemisphereLight(0xdcecff, 0xb6c4d4, 0.75);
    scene.add(hemi);

    // 平行光：所有光线互相平行，相当于"太阳"。只有它能投出方向一致的影子。
    const sun = new THREE.DirectionalLight(0xfff2dd, 1.5);
    sun.position.set(24, 38, 16);
    // 灯默认不投影，必须显式打开开关。
    sun.castShadow = true;

    /**
     * 影子的原理：GPU 会先从"灯的位置"再渲染一遍场景，得到一张深度图(shadow map)，
     * 之后正常渲染时拿它来判断"这个点被灯挡住了吗"。
     * 所以：
     *  - mapSize 越大，影子边缘越细腻，但显存和性能开销也越大（2048 是常用折中）。
     *  - 灯的 shadow.camera 是一个正交相机，定义了"多大范围内的影子会被计算"。
     *    超出这个范围的东西就没有影子了，所以这里开 ±60 覆盖整个活动场地。
     */
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = 130;
    sun.shadow.camera.left = -60;
    sun.shadow.camera.right = 60;
    sun.shadow.camera.top = 60;
    sun.shadow.camera.bottom = -60;
    scene.add(sun);
};

/* --------------------------------------------------------------------------
 * 输入：键盘
 * ------------------------------------------------------------------------ */

/**
 * 这里不"按下就移动"，而是把按住的键记进 Set，由动画循环每帧去查。
 * 好处：按住不放会连续移动，松开立刻停，手感才对。
 * 如果直接在 keydown 里改坐标，会受系统按键连发频率影响，非常卡顿。
 */
const onKeyDown = (e) => {
    pressed.add(e.code); // e.code 是物理按键位置（KeyW / ArrowUp），不受中英文输入法影响
    // 方向键和空格默认会滚动页面，阻止浏览器自带行为。
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
    }
};

const onKeyUp = (e) => {
    pressed.delete(e.code);
};

/* --------------------------------------------------------------------------
 * 自适应窗口
 * ------------------------------------------------------------------------ */

/**
 * 容器尺寸变了必须做两件事，少一件都会画面变形或糊掉：
 *   1. 更新相机的宽高比 aspect 并重算投影矩阵；
 *   2. 让渲染器按新尺寸重新分配画布。
 */
const onResize = () => {
    const host = hostRef.value;
    if (!host || !renderer || !camera) return;
    const w = host.clientWidth;
    const h = host.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
};

/* --------------------------------------------------------------------------
 * 主循环：每一帧干的事
 * ------------------------------------------------------------------------ */

/**
 * 这个函数会被 requestAnimationFrame 每秒调用几十次到上百次。
 * 顺序固定为：读输入 → 更新状态 → 摆放相机 → 渲染。
 */
const animate = () => {
    // 第一件事就登记下一帧，这样函数中途 return 也不会把循环断掉。
    frameId = requestAnimationFrame(animate);
    if (!character || !camera || !limbPivot) return;

    // dt = 距上一帧过了多少秒。上限 0.05 是保险：切到别的标签页再回来，
    // dt 可能是好几秒，不夹住的话人物会一瞬间"瞬移"出去。
    const now = performance.now();
    const dt = Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;

    const forward = pressed.has('KeyW') || pressed.has('ArrowUp');
    const backward = pressed.has('KeyS') || pressed.has('ArrowDown');
    const left = pressed.has('KeyA') || pressed.has('ArrowLeft');
    const right = pressed.has('KeyD') || pressed.has('ArrowRight');
    const running = pressed.has('ShiftLeft') || pressed.has('ShiftRight');

    /**
     * 转向：直接改 rotation.y，也就是绕竖直的 Y 轴旋转 —— 这正是"原地转身"。
     * three.js 里 rotation 用的是欧拉角(弧度)，2π = 360°。
     * 加号是向左转：因为 Y 轴朝上时，从上方俯视，绕 Y 正方向旋转是逆时针。
     */
    if (left) character.rotation.y += TURN_SPEED * dt;
    if (right) character.rotation.y -= TURN_SPEED * dt;

    /**
     * 前进/后退 —— 本文件第二个关键点：为什么要用 sin/cos。
     *
     * 人物可能已经转了个任意角度 yaw。"前进"不该是固定往 +Z 走，
     * 而应该是"沿着自己脸朝向的方向"走。
     *
     * 一个 rotation.y = yaw 的物体，它的"正前方"(局部 +Z 轴)在世界坐标里是：
     *     (sin(yaw), 0, cos(yaw))
     * 这就是把极坐标/单位圆用在三维里的结果。于是：
     *     新位置 = 旧位置 + 朝向向量 × 速度 × dt
     * 相机跟随也用同一对 sin/cos，两者永远保持同向。
     */
    let moving = false;
    if (forward || backward) {
        const dir = forward ? 1 : -1; // 后退就是沿朝向的反方向
        const speed = (running ? RUN_SPEED : WALK_SPEED) * dir;
        const yaw = character.rotation.y;
        character.position.x += Math.sin(yaw) * speed * dt;
        character.position.z += Math.cos(yaw) * speed * dt;
        moving = true;
    }

    // 限制在活动范围内，避免走出地面
    // Math.hypot(x, z) 就是原点到该点的直线距离，即勾股定理。
    // 超出半径时，把坐标整体按比例缩回圆周上 —— 相当于"撞墙就贴着墙"。
    const dist = Math.hypot(character.position.x, character.position.z);
    if (dist > WORLD_RADIUS) {
        const k = WORLD_RADIUS / dist;
        character.position.x *= k;
        character.position.z *= k;
    }

    /**
     * 走路时四肢按相位摆动，静止时平滑归位
     *
     * 摆动靠的是 sin：walkPhase 一直累加，sin(walkPhase) 就在 -1 到 1 之间来回，
     * 天然就是"前摆 → 回中 → 后摆 → 回中"的循环。乘 0.62 是摆幅（弧度）。
     *
     * 手脚要交叉同步（左腿配右臂），否则走起来像同手同脚，所以下面符号两两相反。
     * 跑的时候相位加得更快(13 vs 8.5)，看起来就是步频变高。
     */
    const {leftArm, rightArm, leftLeg, rightLeg} = limbPivot;
    if (moving) {
        walkPhase += dt * (running ? 13 : 8.5);
        const swing = Math.sin(walkPhase);
        leftLeg.rotation.x = swing * 0.62;
        rightLeg.rotation.x = -swing * 0.62;
        leftArm.rotation.x = -swing * 0.5;
        rightArm.rotation.x = swing * 0.5;
    } else {
        /**
         * 停下时不要"啪"一下弹回直立，用指数平滑（也叫 lerp 趋近）过渡：
         *   当前值 += (目标值 - 当前值) × ease
         * 每帧消掉剩余差距的一个固定比例，于是越接近目标变得越慢，非常自然。
         *
         * ease = 1 - Math.pow(0.001, dt) 这个写法是为了"跟帧率无关"：
         * 它表示"每秒消掉 99.9%"，dt 小时 ease 自动变小。
         * 如果直接写死 ease = 0.1，在 144Hz 屏上会比 60Hz 快得多。
         */
        const ease = 1 - Math.pow(0.001, dt);
        leftLeg.rotation.x += (0 - leftLeg.rotation.x) * ease;
        rightLeg.rotation.x += (0 - rightLeg.rotation.x) * ease;
        leftArm.rotation.x += (0 - leftArm.rotation.x) * ease;
        rightArm.rotation.x += (0 - rightArm.rotation.x) * ease;
    }

    /**
     * 第三人称跟随镜头。
     * 期望相机待在"人物身后 11、上方 7.5"的位置：
     *   身后 = 沿朝向的反方向退 11，所以是 position 减去 (sin, cos) × 11。
     *
     * 但不直接把相机"放"过去，而是用 lerp 插值：
     *   camera.position.lerp(目标点, 系数) —— 从当前位置往目标点移动"系数的比例"。
     * 系数接近 1 = 瞬间到位（生硬），接近 0 = 几乎不动（拖影）。
     * 这样转向和移动时镜头会带着一点惯性地跟上来，比硬跟舒服很多。
     */
    const target = new THREE.Vector3(
        character.position.x - Math.sin(character.rotation.y) * 11,
        7.5,
        character.position.z - Math.cos(character.rotation.y) * 11
    );
    camera.position.lerp(target, 1 - Math.pow(0.002, dt));
    // lookAt(x, y, z)：让相机镜头对准这个世界坐标点。
    // 对准 1.9 高度是人的胸口，这样人物在画面里居中而不是贴底。
    camera.lookAt(character.position.x, 1.9, character.position.z);

    // 全场景唯一真正"画出来"的一行：把 scene 按 camera 的视角渲染到 canvas。
    renderer.render(scene, camera);
};

/* --------------------------------------------------------------------------
 * 初始化
 * ------------------------------------------------------------------------ */

/**
 * 必须等 onMounted：three.js 要读容器的真实像素宽高，DOM 没挂载时 clientWidth 是 0，
 * 相机会算出一个错误的宽高比。
 */
onMounted(() => {
    const host = hostRef.value;
    if (!host) return;

    // ---- 1. 场景 ----
    scene = new THREE.Scene();
    // 背景色（也是雾的颜色，两者一致才有"远处融进天空"的效果）
    scene.background = new THREE.Color(0xeaf2fb);
    /**
     * 雾：Fog(颜色, 最近距离, 最远距离)。
     * 距相机 42 以内完全没雾，120 以外完全变成雾色，中间渐变。
     * 它既掩盖了"地面边界在哪"，又让远处的建筑发白、产生空气透视感。
     */
    scene.fog = new THREE.Fog(0xeaf2fb, 42, 120);

    /**
     * ---- 2. 相机 ----
     * PerspectiveCamera(视野角度fov, 宽高比aspect, 近裁剪面near, 远裁剪面far)
     *   fov：58° 接近人眼舒适范围；调大会有鱼眼感，调小像长焦。
     *   aspect：必须等于画布宽/高，否则画面会被拉伸变形。
     *   near/far：只有落在这两点之间的东西才会被画出来。
     *             范围过大还会降低深度精度，导致远处物体表面出现闪烁。
     */
    camera = new THREE.PerspectiveCamera(58, host.clientWidth / host.clientHeight, 0.1, 400);
    // 初始就摆在人物(0,0,0)的后上方，避免第一帧镜头从地面"飞起来"。
    camera.position.set(0, 7.5, -11);

    // ---- 3. 渲染器 ----
    renderer = new THREE.WebGLRenderer({antialias: true});
    /**
     * devicePixelRatio：高分屏上 1 个 CSS 像素对应 2~3 个物理像素。
     * 不设 pixelRatio，画面在 Retina 屏上就是糊的。
     * 但封顶到 2，因为 3 倍的性能开销翻倍、肉眼却看不出差别。
     */
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(host.clientWidth, host.clientHeight);
    // 阴影总开关，默认关闭（因为开销大）。不开，下面所有 castShadow 都没用。
    renderer.shadowMap.enabled = true;
    // PCF 是一种平滑影子边缘的算法。注意：three 0.187 已移除 PCFSoftShadowMap。
    renderer.shadowMap.type = THREE.PCFShadowMap;
    // 声明输出是 sRGB 色彩空间，颜色才不会被算得发灰发暗。现代浏览器的标准做法。
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    // 把渲染器自己创建的 <canvas> 塞进我们的容器里。
    host.appendChild(renderer.domElement);

    // ---- 4. 往场景里放东西（顺序无关，但灯光要先建好）----
    setupLights();
    buildGround();
    buildObstacles();
    buildCharacter();

    // ---- 5. 事件监听（记得在卸载时成对移除）----
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('resize', onResize);

    // ---- 6. 起跑 ----
    lastTime = performance.now();
    animate();
});

/* --------------------------------------------------------------------------
 * 销毁
 * ------------------------------------------------------------------------ */

/**
 * Vue 切走这个路由时组件就没了，但 WebGL 的资源不会自动回收。
 * 下面每一行都对应 onMounted / animate 里的一个创建，一一抵消：
 *   停循环 → 摘监听 → 释放显存 → 拆画布 → 断引用。
 * 少了任何一步，反复进出这个页面就会累积泄漏。
 */
onBeforeUnmount(() => {
    // 不取消的话，animate 会一直空转，而且下一帧访问的已是被销毁的对象。
    cancelAnimationFrame(frameId);
    window.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('keyup', onKeyUp);
    window.removeEventListener('resize', onResize);
    pressed.clear();

    disposables.forEach(item => item.dispose());
    disposables.length = 0;

    scene?.clear();
    renderer?.dispose();
    if (renderer?.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
    }

    renderer = null;
    scene = null;
    camera = null;
    character = null;
    limbPivot = null;
});
</script>

<style lang="less" scoped>
.walk-page {
  position: relative;
  width: 100%;
  height: 620px;
  border-radius: 10px;
  overflow: hidden;
  background: #eaf2fb;
}

.canvas-host {
  width: 100%;
  height: 100%;

  :deep(canvas) {
    display: block;
    outline: none;
  }
}

.hud {
  position: absolute;
  top: 16px;
  left: 16px;
  padding: 14px 16px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.78);
  backdrop-filter: blur(6px);
  border: 1px solid rgba(160, 190, 220, 0.5);
  color: #3a4a5c;
  user-select: none;
}

.hud-title {
  margin-bottom: 10px;
  font-size: 15px;
  font-weight: 600;
  color: #2b3f57;
}

.key-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
  font-size: 13px;

  span {
    margin-left: 4px;
    color: #5a6b7f;
  }
}

kbd {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 24px;
  padding: 0 6px;
  border-radius: 5px;
  border: 1px solid #c3d3e3;
  border-bottom-width: 2px;
  background: #fff;
  color: #33506e;
  font-size: 12px;
  font-family: inherit;
  font-weight: 600;
}

.hud-note {
  margin-top: 10px;
  font-size: 12px;
  color: #7b8b9c;
}
</style>
