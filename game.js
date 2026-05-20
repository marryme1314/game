// ========================
// 何欣兰的消消乐 - 游戏逻辑
// ========================

// 游戏配置
const BOARD_SIZE = 8;
const TILE_TYPES = 6;
const MIN_MATCH = 3;
const BASE_SCORE = 10;
const BASE_TARGET = 500;
const LEVEL_MULTIPLIER = 300;

// 情话库
const romanticPhrases = [
    // 特别情话（包含何欣兰的名字）
    "何欣兰，你是我最珍贵的游戏奖励💕",
    "何欣兰，一生有你，满分游戏❤️",
    "何欣兰，你的笑容，是我最想要消除的距离💝",
    "何欣兰，与你相识，是我最好的选择🌟",
    
    // 甜蜜情话
    "你是我的梦想配对🌟",
    "和你在一起，我的心跳满分🎯",
    "你的爱，让我无限关卡也不厌倦💞",
    "遇见你，是我最好的配对🎪",
    "你是我游戏中最闪耀的宝石💎",
    "你让我的世界充满了色彩✨",
    
    // 励志情话
    "相爱就像消除方块，需要耐心和策略💪",
    "你是我生命中最完美的组合🧩",
    "一起度过每一个关卡，永远不放弃❤️",
    "你让我的游戏人生变得精彩万分🎮",
    "爱你就像玩你这个游戏，上瘾但幸福😊",
    
    // 温暖情话
    "想和你玩一场永远不会结束的游戏🌈",
    "你是我生命中最高的分数💯",
    "每一次配对都是为了你😘",
    "你的出现，让我的世界从灰白变成彩色🌺",
    "我想用一生的时间，和你消除所有距离💑",
    
    // 趣味情话
    "我们的爱，就像这游戏一样，永远掉不完💕",
    "你是我最想要的特殊方块🎁",
    "咱们两个人，是这个游戏最完美的配对🎨",
    "爱你是我的无限关卡❤️",
    "我是你的游戏中最忠实的玩家💗",
    
    // 深情情话
    "用一生的时间，和你玩这场爱情游戏💕",
    "你就是我一直在寻找的配对✨",
    "永远爱你，就像永远玩这个游戏一样💝",
    "你是我最珍贵的分数🌟",
    "此生最幸福的事，就是遇见你❤️",
    
    // 撩人情话
    "看着你，我就想消除世界上所有的烦恼💫",
    "你的每一个笑容，都是我最高的奖励🎊",
    "和你一起，每一天都是好关卡🎮",
    "你让我的人生游戏变得有意义💖",
    "我想要你成为我所有关卡的终极奖励👑"
];

// 游戏状态
let gameState = {
    board: [],
    level: 1,
    score: 0,
    totalScore: 0,
    matchCount: 0,
    selectedTile: null,
    isAnimating: false,
    targetScore: BASE_TARGET
};

// 初始化游戏
function initGame() {
    gameState.score = 0;
    gameState.matchCount = 0;
    gameState.board = [];
    gameState.selectedTile = null;
    gameState.isAnimating = false;
    gameState.targetScore = BASE_TARGET + (gameState.level - 1) * LEVEL_MULTIPLIER;
    
    // 生成新棋盘
    for (let i = 0; i < BOARD_SIZE * BOARD_SIZE; i++) {
        gameState.board[i] = Math.floor(Math.random() * TILE_TYPES);
    }
    
    // 移除初始匹配
    removeInitialMatches();
    renderBoard();
    updateUI();
}

// 移除初始匹配
function removeInitialMatches() {
    let hasMatches = true;
    let iterations = 0;
    
    while (hasMatches && iterations < 10) {
        hasMatches = false;
        const toRemove = new Set();
        
        // 检查水平匹配
        for (let row = 0; row < BOARD_SIZE; row++) {
            for (let col = 0; col < BOARD_SIZE - 2; col++) {
                const idx1 = row * BOARD_SIZE + col;
                const idx2 = row * BOARD_SIZE + col + 1;
                const idx3 = row * BOARD_SIZE + col + 2;
                
                if (gameState.board[idx1] === gameState.board[idx2] && 
                    gameState.board[idx2] === gameState.board[idx3]) {
                    toRemove.add(idx1);
                    toRemove.add(idx2);
                    toRemove.add(idx3);
                }
            }
        }
        
        // 检查垂直匹配
        for (let col = 0; col < BOARD_SIZE; col++) {
            for (let row = 0; row < BOARD_SIZE - 2; row++) {
                const idx1 = row * BOARD_SIZE + col;
                const idx2 = (row + 1) * BOARD_SIZE + col;
                const idx3 = (row + 2) * BOARD_SIZE + col;
                
                if (gameState.board[idx1] === gameState.board[idx2] && 
                    gameState.board[idx2] === gameState.board[idx3]) {
                    toRemove.add(idx1);
                    toRemove.add(idx2);
                    toRemove.add(idx3);
                }
            }
        }
        
        if (toRemove.size > 0) {
            hasMatches = true;
            toRemove.forEach(idx => {
                gameState.board[idx] = -1; // 标记为移除
            });
            applyGravity();
            iterations++;
        }
    }
    
    // 清理标记
    gameState.board = gameState.board.filter(tile => tile !== -1);
    while (gameState.board.length < BOARD_SIZE * BOARD_SIZE) {
        gameState.board.push(Math.floor(Math.random() * TILE_TYPES));
    }
}

// 获取方块索引
function getTileIndex(row, col) {
    return row * BOARD_SIZE + col;
}

// 获取行和列
function getRowCol(index) {
    return {
        row: Math.floor(index / BOARD_SIZE),
        col: index % BOARD_SIZE
    };
}

// 是否相邻
function isAdjacent(idx1, idx2) {
    const pos1 = getRowCol(idx1);
    const pos2 = getRowCol(idx2);
    
    const rowDiff = Math.abs(pos1.row - pos2.row);
    const colDiff = Math.abs(pos1.col - pos2.col);
    
    return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
}

// 选择方块
function selectTile(index) {
    if (gameState.isAnimating) return;
    
    if (gameState.selectedTile === null) {
        gameState.selectedTile = index;
        renderBoard();
    } else if (gameState.selectedTile === index) {
        gameState.selectedTile = null;
        renderBoard();
    } else if (isAdjacent(gameState.selectedTile, index)) {
        swapTiles(gameState.selectedTile, index);
        gameState.selectedTile = null;
    } else {
        gameState.selectedTile = index;
        renderBoard();
    }
}

// 交换方块
function swapTiles(idx1, idx2) {
    gameState.isAnimating = true;
    
    // 交换
    [gameState.board[idx1], gameState.board[idx2]] = [gameState.board[idx2], gameState.board[idx1]];
    renderBoard();
    
    // 延迟后检查匹配
    setTimeout(() => {
        const matchedIndices = findMatches();
        if (matchedIndices.length > 0) {
            removeMatchedTiles(matchedIndices);
        } else {
            // 如果没有匹配，交换回去
            [gameState.board[idx1], gameState.board[idx2]] = [gameState.board[idx2], gameState.board[idx1]];
            renderBoard();
            gameState.isAnimating = false;
        }
    }, 200);
}

// 查找匹配
function findMatches() {
    const matched = new Set();
    
    // 检查水平匹配
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE - 2; col++) {
            const idx1 = getTileIndex(row, col);
            const idx2 = getTileIndex(row, col + 1);
            const idx3 = getTileIndex(row, col + 2);
            
            if (gameState.board[idx1] !== -1 &&
                gameState.board[idx1] === gameState.board[idx2] && 
                gameState.board[idx2] === gameState.board[idx3]) {
                matched.add(idx1);
                matched.add(idx2);
                matched.add(idx3);
            }
        }
    }
    
    // 检查垂直匹配
    for (let col = 0; col < BOARD_SIZE; col++) {
        for (let row = 0; row < BOARD_SIZE - 2; row++) {
            const idx1 = getTileIndex(row, col);
            const idx2 = getTileIndex(row + 1, col);
            const idx3 = getTileIndex(row + 2, col);
            
            if (gameState.board[idx1] !== -1 &&
                gameState.board[idx1] === gameState.board[idx2] && 
                gameState.board[idx2] === gameState.board[idx3]) {
                matched.add(idx1);
                matched.add(idx2);
                matched.add(idx3);
            }
        }
    }
    
    return Array.from(matched);
}

// 移除匹配的方块
function removeMatchedTiles(matchedIndices) {
    // 添加动画类
    matchedIndices.forEach(idx => {
        const tile = document.querySelector(`[data-index="${idx}"]`);
        if (tile) tile.classList.add('matching');
    });
    
    // 计算得分
    gameState.score += matchedIndices.length * BASE_SCORE;
    gameState.matchCount += matchedIndices.length;
    gameState.totalScore += matchedIndices.length * BASE_SCORE;
    
    // 延迟后移除
    setTimeout(() => {
        matchedIndices.forEach(idx => {
            gameState.board[idx] = -1; // 标记为空
        });
        
        applyGravity();
        renderBoard();
        updateUI();
        
        // 继续检查是否还有匹配
        setTimeout(() => {
            const newMatches = findMatches();
            if (newMatches.length > 0) {
                removeMatchedTiles(newMatches);
            } else {
                gameState.isAnimating = false;
                checkLevelComplete();
            }
        }, 300);
    }, 300);
}

// 应用重力效果
function applyGravity() {
    // 对每一列应用重力
    for (let col = 0; col < BOARD_SIZE; col++) {
        let tiles = [];
        
        // 收集该列的所有方块
        for (let row = 0; row < BOARD_SIZE; row++) {
            const idx = getTileIndex(row, col);
            if (gameState.board[idx] !== -1) {
                tiles.push(gameState.board[idx]);
            }
        }
        
        // 填充新的方块
        while (tiles.length < BOARD_SIZE) {
            tiles.unshift(Math.floor(Math.random() * TILE_TYPES));
        }
        
        // 更新列
        for (let row = 0; row < BOARD_SIZE; row++) {
            const idx = getTileIndex(row, col);
            gameState.board[idx] = tiles[row];
        }
    }
}

// 检查关卡完成
function checkLevelComplete() {
    if (gameState.score >= gameState.targetScore) {
        showLevelUpModal();
    }
}

// 显示升级弹窗
function showLevelUpModal() {
    gameState.isAnimating = true;
    document.getElementById('modalScore').textContent = gameState.score;
    document.getElementById('modalPhrase').textContent = getRandomPhrase();
    document.getElementById('levelUpModal').classList.add('show');
}

// 隐藏升级弹窗
function hideLevelUpModal() {
    document.getElementById('levelUpModal').classList.remove('show');
}

// 下一关
function nextLevel() {
    hideLevelUpModal();
    gameState.level++;
    initGame();
}

// 重新开始
function resetGame() {
    hideLevelUpModal();
    gameState.level = 1;
    gameState.totalScore = 0;
    gameState.matchCount = 0;
    initGame();
}

// 更新UI
function updateUI() {
    document.getElementById('level').textContent = gameState.level;
    document.getElementById('levelDisplay').textContent = gameState.level;
    document.getElementById('score').textContent = gameState.score;
    document.getElementById('target').textContent = gameState.targetScore;
    document.getElementById('matchCount').textContent = gameState.matchCount;
    document.getElementById('totalScore').textContent = gameState.totalScore;
    
    // 更新进度条
    const progress = Math.min((gameState.score / gameState.targetScore) * 100, 100);
    document.getElementById('progressFill').style.width = progress + '%';
    document.getElementById('progressPercent').textContent = Math.round(progress) + '%';
}

// 渲染游戏板
function renderBoard() {
    const board = document.getElementById('gameBoard');
    board.innerHTML = '';
    
    for (let i = 0; i < BOARD_SIZE * BOARD_SIZE; i++) {
        const tile = document.createElement('div');
        tile.className = `tile type-${gameState.board[i]}`;
        tile.dataset.index = i;
        tile.textContent = '★';
        
        if (gameState.selectedTile === i) {
            tile.classList.add('selected');
        }
        
        tile.addEventListener('click', () => selectTile(i));
        board.appendChild(tile);
    }
}

// 获取随机情话
function getRandomPhrase() {
    return romanticPhrases[Math.floor(Math.random() * romanticPhrases.length)];
}

// 切换情话
function changePhrase() {
    document.getElementById('romanticText').textContent = getRandomPhrase();
}

// 页面加载完成后初始化
window.addEventListener('DOMContentLoaded', () => {
    initGame();
    changePhrase();
});

// 禁用页面缩放
document.addEventListener('touchmove', (e) => {
    if (e.scale !== 1) {
        e.preventDefault();
    }
}, { passive: false });
