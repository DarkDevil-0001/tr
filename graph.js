// ==================== GLOBAL VARIABLES ====================
let selectedAlgorithm = null;
let nodes = [];
let edges = [];
let nodeValues = {};
let currentStep = 0;
let traversalSteps = [];
let isLinking = false;
let startNode = null;
let autoPlayInterval = null;
let selectedStartNode = null;
let finalTraversalOrder = [];

// Mobile touch variables
let touchStartNode = null;
let isTouchLinking = false;
let longPressTimer = null;
let isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

// ==================== CANVAS SETUP ====================
const drawingCanvas = document.getElementById('drawingCanvas');
const visCanvas = document.getElementById('visCanvas');
const drawingCtx = drawingCanvas.getContext('2d');
const visCtx = visCanvas.getContext('2d');

// ==================== USER MANAGEMENT ====================
const signupBtn = document.getElementById('signupBtn');
const userInfo = document.getElementById('userInfo');
const userName = document.getElementById('userName');
const logoutBtn = document.getElementById('logoutBtn');

// Check if user is logged in on page load
function checkUserLogin() {
    const userData = localStorage.getItem('treeviz_user');
    if (userData) {
        const user = JSON.parse(userData);
        signupBtn.style.display = 'none';
        userInfo.style.display = 'flex';
        userName.textContent = `${user.firstName} ${user.lastName}`;
    } else {
        signupBtn.style.display = 'flex';
        userInfo.style.display = 'none';
    }
}

// Verify user with backend
async function verifyUserWithBackend() {
    const userData = localStorage.getItem('treeviz_user');
    if (!userData) return;
    
    try {
        const user = JSON.parse(userData);
        const response = await fetch('/api/user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: user.email })
        });
        
        const result = await response.json();
        if (!result.success) {
            localStorage.removeItem('treeviz_user');
            checkUserLogin();
        }
    } catch (error) {
        console.log('Backend verification skipped (server might be offline)');
    }
}

// Initialize user state
checkUserLogin();
verifyUserWithBackend();

// ==================== AUTHENTICATION HANDLERS ====================
function redirectToSignup() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    window.location.href = `signup.html?returnTo=${encodeURIComponent(currentPage)}`;
}

function redirectToLogin() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    window.location.href = `login.html?returnTo=${encodeURIComponent(currentPage)}`;
}

// Signup button handler
document.getElementById('signupBtn')?.addEventListener('click', redirectToSignup);

// Login button handler (if exists)
document.getElementById('loginBtn')?.addEventListener('click', redirectToLogin);

// Logout button handler
logoutBtn.addEventListener('click', function() {
    if (confirm('Are you sure you want to log out?')) {
        localStorage.removeItem('treeviz_user');
        checkUserLogin();
    }
});

// ==================== DOM ELEMENTS ====================
const bfsBtn = document.getElementById('bfsBtn');
const dfsBtn = document.getElementById('dfsBtn');
const selectedAlgorithmSpan = document.getElementById('selectedAlgorithm');
const clearBtn = document.getElementById('clearBtn');
const sampleTreeBtn = document.getElementById('sampleTreeBtn');
const sampleGraphBtn = document.getElementById('sampleGraphBtn');
const applyValuesBtn = document.getElementById('applyValuesBtn');
const visualizeBtn = document.getElementById('visualizeBtn');
const resetVisBtn = document.getElementById('resetVisBtn');
const prevStepBtn = document.getElementById('prevStepBtn');
const nextStepBtn = document.getElementById('nextStepBtn');
const autoPlayBtn = document.getElementById('autoPlayBtn');
const stepDetails = document.getElementById('stepDetails');
const nodeInputsContainer = document.getElementById('nodeInputsContainer');
const instructionModal = document.getElementById('instructionModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const startNodeSelect = document.getElementById('startNodeSelect');
const helpBtn = document.getElementById('helpBtn');

// ==================== HELPER FUNCTIONS ====================
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = 'mobile-toast';
    
    const colors = {
        info: '#17a2b8',
        success: '#28a745',
        error: '#dc3545',
        warning: '#ffc107'
    };
    
    toast.style.cssText = `
        position: fixed;
        bottom: 30px;
        left: 50%;
        transform: translateX(-50%);
        background: ${colors[type]};
        color: white;
        padding: 12px 24px;
        border-radius: 30px;
        box-shadow: 0 5px 20px rgba(0,0,0,0.2);
        z-index: 1001;
        font-weight: 500;
        animation: slideUp 0.3s ease;
        text-align: center;
        max-width: 80%;
    `;
    
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideDown 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

function showMobileContextMenu(x, y, nodeId) {
    const existingMenu = document.querySelector('.mobile-context-menu');
    if (existingMenu) existingMenu.remove();

    const menu = document.createElement('div');
    menu.className = 'mobile-context-menu';
    menu.style.cssText = `
        position: fixed;
        left: ${x}px;
        top: ${y}px;
        background: white;
        border-radius: 10px;
        box-shadow: 0 5px 25px rgba(0,0,0,0.2);
        padding: 10px 0;
        z-index: 1000;
        min-width: 180px;
        animation: fadeIn 0.2s ease;
    `;

    menu.innerHTML = `
        <div style="padding: 12px 20px; border-bottom: 1px solid #eee; font-weight: bold; color: #667eea;">
            Node ${nodeId} Actions
        </div>
        <div class="menu-item" data-action="delete" style="padding: 12px 20px; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: background 0.2s;">
            <i class="fas fa-trash" style="color: #dc3545; width: 20px;"></i>
            <span>Delete Node</span>
        </div>
        <div class="menu-item" data-action="link" style="padding: 12px 20px; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: background 0.2s;">
            <i class="fas fa-link" style="color: #28a745; width: 20px;"></i>
            <span>Start Linking</span>
        </div>
        <div class="menu-item" data-action="cancel" style="padding: 12px 20px; cursor: pointer; display: flex; align-items: center; gap: 10px; border-top: 1px solid #eee; margin-top: 5px;">
            <i class="fas fa-times" style="color: #6c757d; width: 20px;"></i>
            <span>Cancel</span>
        </div>
    `;

    menu.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('mouseenter', () => {
            item.style.backgroundColor = '#f8f9fa';
        });
        item.addEventListener('mouseleave', () => {
            item.style.backgroundColor = 'transparent';
        });
    });

    menu.querySelector('[data-action="delete"]').addEventListener('click', () => {
        nodes = nodes.filter(node => node.id !== nodeId);
        edges = edges.filter(edge => edge.from !== nodeId && edge.to !== nodeId);
        delete nodeValues[nodeId];
        redrawDrawingCanvas();
        updateNodeInputs();
        updateStartNodeSelect();
        updateVisualizeButton();
        menu.remove();
        showToast(`Node ${nodeId} deleted`, 'success');
        
        // Exit linking mode if active
        isTouchLinking = false;
        touchStartNode = null;
    });

    menu.querySelector('[data-action="link"]').addEventListener('click', () => {
        touchStartNode = nodes.find(n => n.id === nodeId);
        isTouchLinking = true;
        showToast(`Linking mode: Tap another node to connect to Node ${nodeId}`, 'info');
        menu.remove();
        
        // Visual feedback - redraw with highlight
        redrawDrawingCanvas();
        
        // Draw a highlight around the start node
        const ctx = drawingCtx;
        const node = touchStartNode;
        ctx.beginPath();
        ctx.arc(node.x, node.y, 25, 0, Math.PI * 2);
        ctx.strokeStyle = '#ff9800';
        ctx.lineWidth = 4;
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.setLineDash([]);
    });

    menu.querySelector('[data-action="cancel"]').addEventListener('click', () => {
        menu.remove();
    });

    // Close menu when clicking outside
    setTimeout(() => {
        document.addEventListener('click', function closeMenu(e) {
            if (!menu.contains(e.target)) {
                menu.remove();
                document.removeEventListener('click', closeMenu);
            }
        });
    }, 100);

    document.body.appendChild(menu);
}

// ==================== CANVAS RESIZE ====================
function resizeCanvases() {
    drawingCanvas.width = drawingCanvas.parentElement.clientWidth;
    drawingCanvas.height = drawingCanvas.parentElement.clientHeight;
    visCanvas.width = visCanvas.parentElement.clientWidth;
    visCanvas.height = visCanvas.parentElement.clientHeight;
    redrawDrawingCanvas();
    drawVisualization();
}

// ==================== HELP MODAL ====================
function showHelpModal() {
    document.getElementById('helpModal').style.display = 'flex';
}

function closeHelpModal() {
    document.getElementById('helpModal').style.display = 'none';
}

// ==================== INITIALIZATION ====================
window.addEventListener('load', () => {
    resizeCanvases();
    instructionModal.style.display = 'flex';
    showMobileInstructions();
});

window.addEventListener('resize', resizeCanvases);

// Close modal when clicking outside
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('helpModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeHelpModal();
            }
        });
        
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modal.style.display === 'flex') {
                closeHelpModal();
            }
        });
    }
});

// ==================== EVENT LISTENERS ====================
bfsBtn.addEventListener('click', () => {
    selectedAlgorithm = 'BFS';
    selectedAlgorithmSpan.textContent = 'Breadth-First Search';
    updateButtons();
    updateVisualizeButton();
    showToast('BFS algorithm selected', 'info');
});

dfsBtn.addEventListener('click', () => {
    selectedAlgorithm = 'DFS';
    selectedAlgorithmSpan.textContent = 'Depth-First Search';
    updateButtons();
    updateVisualizeButton();
    showToast('DFS algorithm selected', 'info');
});

clearBtn.addEventListener('click', () => {
    nodes = [];
    edges = [];
    nodeValues = {};
    currentStep = 0;
    traversalSteps = [];
    finalTraversalOrder = [];
    selectedStartNode = null;
    isTouchLinking = false;
    touchStartNode = null;
    redrawDrawingCanvas();
    updateNodeInputs();
    updateStartNodeSelect();
    resetVisualization();
    showToast('Canvas cleared', 'info');
});

sampleTreeBtn.addEventListener('click', generateSampleTree);
sampleGraphBtn.addEventListener('click', generateSampleGraph);
applyValuesBtn.addEventListener('click', applyNodeValues);
visualizeBtn.addEventListener('click', startVisualization);
resetVisBtn.addEventListener('click', resetVisualization);
prevStepBtn.addEventListener('click', previousStep);
nextStepBtn.addEventListener('click', nextStep);
autoPlayBtn.addEventListener('click', toggleAutoPlay);
closeModalBtn.addEventListener('click', () => {
    instructionModal.style.display = 'none';
});
helpBtn.addEventListener('click', showHelpModal);

startNodeSelect.addEventListener('change', (e) => {
    selectedStartNode = e.target.value ? parseInt(e.target.value) : null;
    updateVisualizeButton();
});

// ==================== MOUSE EVENTS (Desktop) ====================
drawingCanvas.addEventListener('mousedown', handleMouseDown);
drawingCanvas.addEventListener('mousemove', handleMouseMove);
drawingCanvas.addEventListener('mouseup', handleMouseUp);
drawingCanvas.addEventListener('contextmenu', handleRightClick);

// ==================== TOUCH EVENTS (Mobile) ====================
if (isMobile) {
    drawingCanvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    drawingCanvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    drawingCanvas.addEventListener('touchend', handleTouchEnd, { passive: false });
    drawingCanvas.addEventListener('touchcancel', handleTouchCancel, { passive: false });
    
    // Double tap to cancel linking
    let lastTapTime = 0;
    drawingCanvas.addEventListener('touchend', function(e) {
        const currentTime = new Date().getTime();
        const tapLength = currentTime - lastTapTime;
        
        if (tapLength < 300 && tapLength > 0 && isTouchLinking) {
            e.preventDefault();
            isTouchLinking = false;
            touchStartNode = null;
            redrawDrawingCanvas();
            showToast('Linking cancelled', 'info');
        }
        
        lastTapTime = currentTime;
    });
}

// ==================== TOUCH HANDLERS (Fixed) ====================
function handleTouchStart(e) {
    e.preventDefault();
    const rect = drawingCanvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    const touchedNode = nodes.find(node =>
        Math.sqrt((node.x - x) ** 2 + (node.y - y) ** 2) < 25
    );

    if (touchedNode) {
        touchStartNode = touchedNode;
        
        // If we're already in linking mode, don't start long press timer
        if (isTouchLinking) {
            // We're in linking mode, just store the start node and wait for touch end
            console.log('In linking mode, waiting for target node');
        } else {
            // Not in linking mode, start long press timer for context menu
            longPressTimer = setTimeout(() => {
                showMobileContextMenu(touch.clientX, touch.clientY, touchedNode.id);
                longPressTimer = null;
            }, 500);
        }
    } else {
        // If we're in linking mode and user taps empty space, cancel linking
        if (isTouchLinking) {
            isTouchLinking = false;
            touchStartNode = null;
            showToast('Linking cancelled', 'info');
            redrawDrawingCanvas();
            return;
        }
        
        // Create new node
        const newNodeId = nodes.length > 0 ? Math.max(...nodes.map(n => n.id)) + 1 : 0;
        nodes.push({ id: newNodeId, x, y });
        nodeValues[newNodeId] = newNodeId.toString();
        redrawDrawingCanvas();
        updateNodeInputs();
        updateStartNodeSelect();
        updateVisualizeButton();
        showToast(`Node ${newNodeId} created`, 'success');
    }
}

function handleTouchMove(e) {
    e.preventDefault();
    
    if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
    }
    
    if (!isTouchLinking || !touchStartNode) return;

    const rect = drawingCanvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    redrawDrawingCanvas();

    // Draw temporary dashed line
    drawingCtx.beginPath();
    drawingCtx.moveTo(touchStartNode.x, touchStartNode.y);
    drawingCtx.lineTo(x, y);
    drawingCtx.strokeStyle = '#ff9800';
    drawingCtx.lineWidth = 3;
    drawingCtx.setLineDash([5, 5]);
    drawingCtx.stroke();
    drawingCtx.setLineDash([]);
}

function handleTouchEnd(e) {
    e.preventDefault();
    
    if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
    }
    
    // If not in linking mode, just clean up and return
    if (!isTouchLinking || !touchStartNode) {
        isTouchLinking = false;
        touchStartNode = null;
        redrawDrawingCanvas();
        return;
    }

    const rect = drawingCanvas.getBoundingClientRect();
    const touch = e.changedTouches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    // Find the node at touch position
    const targetNode = nodes.find(node =>
        node.id !== touchStartNode.id &&
        Math.sqrt((node.x - x) ** 2 + (node.y - y) ** 2) < 25
    );

    if (targetNode) {
        // Check if edge already exists
        const edgeExists = edges.some(edge =>
            (edge.from === touchStartNode.id && edge.to === targetNode.id) ||
            (edge.from === targetNode.id && edge.to === touchStartNode.id)
        );

        if (!edgeExists) {
            edges.push({ from: touchStartNode.id, to: targetNode.id });
            showToast(`Connected Node ${touchStartNode.id} → Node ${targetNode.id}`, 'success');
            
            // Exit linking mode after successful connection
            isTouchLinking = false;
            touchStartNode = null;
        } else {
            showToast('Edge already exists!', 'warning');
            // Exit linking mode
            isTouchLinking = false;
            touchStartNode = null;
        }
    } else {
        // If no node found at touch position, cancel linking
        showToast('Tap on a node to connect', 'error');
        isTouchLinking = false;
        touchStartNode = null;
    }

    redrawDrawingCanvas();
    updateVisualizeButton();
}

function handleTouchCancel(e) {
    e.preventDefault();
    isTouchLinking = false;
    touchStartNode = null;
    if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
    }
    redrawDrawingCanvas();
}

// ==================== MOUSE HANDLERS ====================
function handleMouseDown(e) {
    const rect = drawingCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const clickedNode = nodes.find(node =>
        Math.sqrt((node.x - x) ** 2 + (node.y - y) ** 2) < 20
    );

    if (e.button === 2) { // Right click
        if (clickedNode) {
            nodes = nodes.filter(node => node.id !== clickedNode.id);
            edges = edges.filter(edge =>
                edge.from !== clickedNode.id && edge.to !== clickedNode.id
            );
            delete nodeValues[clickedNode.id];
            redrawDrawingCanvas();
            updateNodeInputs();
            updateStartNodeSelect();
            updateVisualizeButton();
            showToast(`Node ${clickedNode.id} deleted`, 'success');
        }
        return;
    }

    if (clickedNode) {
        isLinking = true;
        startNode = clickedNode;
    } else {
        const newNodeId = nodes.length > 0 ? Math.max(...nodes.map(n => n.id)) + 1 : 0;
        nodes.push({ id: newNodeId, x, y });
        nodeValues[newNodeId] = newNodeId.toString();
        redrawDrawingCanvas();
        updateNodeInputs();
        updateStartNodeSelect();
        updateVisualizeButton();
    }
}

function handleMouseMove(e) {
    if (!isLinking) return;

    const rect = drawingCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    redrawDrawingCanvas();

    drawingCtx.beginPath();
    drawingCtx.moveTo(startNode.x, startNode.y);
    drawingCtx.lineTo(x, y);
    drawingCtx.strokeStyle = '#ff0000';
    drawingCtx.lineWidth = 2;
    drawingCtx.stroke();
}

function handleMouseUp(e) {
    if (!isLinking || !startNode) {
        isLinking = false;
        startNode = null;
        return;
    }

    const rect = drawingCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const targetNode = nodes.find(node =>
        node.id !== startNode.id &&
        Math.sqrt((node.x - x) ** 2 + (node.y - y) ** 2) < 20
    );

    if (targetNode) {
        const edgeExists = edges.some(edge =>
            (edge.from === startNode.id && edge.to === targetNode.id) ||
            (edge.from === targetNode.id && edge.to === startNode.id)
        );

        if (!edgeExists) {
            edges.push({ from: startNode.id, to: targetNode.id });
        }
    }

    isLinking = false;
    startNode = null;
    redrawDrawingCanvas();
    updateVisualizeButton();
}

function handleRightClick(e) {
    e.preventDefault();
}

// ==================== DRAWING FUNCTIONS ====================
function redrawDrawingCanvas() {
    drawingCtx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);

    // Draw edges
    edges.forEach(edge => {
        const fromNode = nodes.find(n => n.id === edge.from);
        const toNode = nodes.find(n => n.id === edge.to);
        if (fromNode && toNode) {
            drawingCtx.beginPath();
            drawingCtx.moveTo(fromNode.x, fromNode.y);
            drawingCtx.lineTo(toNode.x, toNode.y);
            drawingCtx.strokeStyle = '#333';
            drawingCtx.lineWidth = 2;
            drawingCtx.stroke();
        }
    });

    // Draw nodes
    nodes.forEach(node => {
        drawingCtx.beginPath();
        drawingCtx.arc(node.x, node.y, 20, 0, Math.PI * 2);
        drawingCtx.fillStyle = node.id === selectedStartNode ? '#ffc107' : '#667eea';
        drawingCtx.fill();
        drawingCtx.strokeStyle = node.id === selectedStartNode ? '#ff9800' : '#764ba2';
        drawingCtx.lineWidth = 3;
        drawingCtx.stroke();

        drawingCtx.fillStyle = 'white';
        drawingCtx.font = 'bold 14px Arial';
        drawingCtx.textAlign = 'center';
        drawingCtx.textBaseline = 'middle';

        let displayValue = nodeValues[node.id] || node.id.toString();
        if (displayValue.length > 3) {
            displayValue = displayValue.substring(0, 3);
        }
        drawingCtx.fillText(displayValue, node.x, node.y);
    });
    
    // If in touch linking mode, draw highlight around start node
    if (isTouchLinking && touchStartNode) {
        drawingCtx.beginPath();
        drawingCtx.arc(touchStartNode.x, touchStartNode.y, 25, 0, Math.PI * 2);
        drawingCtx.strokeStyle = '#ff9800';
        drawingCtx.lineWidth = 4;
        drawingCtx.setLineDash([5, 5]);
        drawingCtx.stroke();
        drawingCtx.setLineDash([]);
    }
}

function drawVisualization() {
    visCtx.clearRect(0, 0, visCanvas.width, visCanvas.height);

    const margin = 40;
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;

    nodes.forEach(node => {
        minX = Math.min(minX, node.x);
        maxX = Math.max(maxX, node.x);
        minY = Math.min(minY, node.y);
        maxY = Math.max(maxY, node.y);
    });

    const graphWidth = maxX - minX;
    const graphHeight = maxY - minY;
    const canvasWidth = visCanvas.width - 2 * margin;
    const canvasHeight = visCanvas.height - 2 * margin;

    const scaleX = canvasWidth / graphWidth;
    const scaleY = canvasHeight / graphHeight;
    const scale = Math.min(scaleX, scaleY, 1.5);

    const offsetX = margin + (canvasWidth - graphWidth * scale) / 2;
    const offsetY = margin + (canvasHeight - graphHeight * scale) / 2;

    // Draw edges
    edges.forEach(edge => {
        const fromNode = nodes.find(n => n.id === edge.from);
        const toNode = nodes.find(n => n.id === edge.to);
        if (fromNode && toNode) {
            const x1 = (fromNode.x - minX) * scale + offsetX;
            const y1 = (fromNode.y - minY) * scale + offsetY;
            const x2 = (toNode.x - minX) * scale + offsetX;
            const y2 = (toNode.y - minY) * scale + offsetY;

            visCtx.beginPath();
            visCtx.moveTo(x1, y1);
            visCtx.lineTo(x2, y2);

            const step = traversalSteps[currentStep];
            const isVisited = step?.visited?.has(edge.from) && step?.visited?.has(edge.to);
            const isCurrentEdge = (step?.node === edge.from || step?.node === edge.to) &&
                step?.visited?.has(edge.from) && step?.visited?.has(edge.to);

            if (isCurrentEdge) {
                visCtx.strokeStyle = '#FF5722';
                visCtx.lineWidth = 4;
            } else if (isVisited) {
                visCtx.strokeStyle = '#4CAF50';
                visCtx.lineWidth = 3;
            } else {
                visCtx.strokeStyle = '#333';
                visCtx.lineWidth = 2;
            }

            visCtx.stroke();
        }
    });

    // Draw nodes
    nodes.forEach(node => {
        const x = (node.x - minX) * scale + offsetX;
        const y = (node.y - minY) * scale + offsetY;

        const step = traversalSteps[currentStep];
        const isVisited = step?.visited?.has(node.id);
        const isCurrent = step?.node === node.id;
        const nodeRadius = 22;

        if (isCurrent || isVisited) {
            visCtx.beginPath();
            visCtx.arc(x, y + 2, nodeRadius, 0, Math.PI * 2);
            visCtx.fillStyle = 'rgba(0,0,0,0.2)';
            visCtx.fill();
        }

        visCtx.beginPath();
        visCtx.arc(x, y, nodeRadius, 0, Math.PI * 2);

        if (isCurrent) {
            visCtx.fillStyle = '#FF5722';
            visCtx.strokeStyle = '#D84315';
        } else if (isVisited) {
            visCtx.fillStyle = '#4CAF50';
            visCtx.strokeStyle = '#388E3C';
        } else if (node.id === selectedStartNode) {
            visCtx.fillStyle = '#FFC107';
            visCtx.strokeStyle = '#FF9800';
        } else {
            visCtx.fillStyle = '#667eea';
            visCtx.strokeStyle = '#764ba2';
        }

        visCtx.fill();
        visCtx.lineWidth = 3;
        visCtx.stroke();

        visCtx.fillStyle = 'white';
        visCtx.font = 'bold 14px Arial';
        visCtx.textAlign = 'center';
        visCtx.textBaseline = 'middle';

        let displayValue = nodeValues[node.id] || node.id.toString();
        if (displayValue.length > 3) {
            displayValue = displayValue.substring(0, 3);
        }
        visCtx.fillText(displayValue, x, y);

        visCtx.fillStyle = 'rgba(0,0,0,0.6)';
        visCtx.font = '10px Arial';
        visCtx.fillText(`ID:${node.id}`, x, y + 25);
    });
}

// ==================== UI UPDATE FUNCTIONS ====================
function updateButtons() {
    bfsBtn.style.opacity = selectedAlgorithm === 'BFS' ? '1' : '0.6';
    dfsBtn.style.opacity = selectedAlgorithm === 'DFS' ? '1' : '0.6';
}

function updateVisualizeButton() {
    const hasAlgorithm = selectedAlgorithm !== null;
    const hasGraph = nodes.length > 0;
    const hasStartNode = selectedStartNode !== null;

    visualizeBtn.disabled = !(hasAlgorithm && hasGraph && hasStartNode);

    if (!hasAlgorithm) {
        visualizeBtn.title = "Please select an algorithm first";
    } else if (!hasGraph) {
        visualizeBtn.title = "Please draw a graph first";
    } else if (!hasStartNode) {
        visualizeBtn.title = "Please select a starting node";
    } else {
        visualizeBtn.title = "Start visualization";
    }
}

function updateStartNodeSelect() {
    startNodeSelect.innerHTML = '<option value="">-- Select a node --</option>';
    nodes.forEach(node => {
        const option = document.createElement('option');
        option.value = node.id;
        option.textContent = `Node ${node.id} (${nodeValues[node.id] || node.id})`;
        startNodeSelect.appendChild(option);
    });

    if (nodes.length > 0) {
        startNodeSelect.value = nodes[0].id;
        selectedStartNode = nodes[0].id;
        updateVisualizeButton();
    }
}

function updateNodeInputs() {
    nodeInputsContainer.innerHTML = '';
    nodes.sort((a, b) => a.id - b.id).forEach(node => {
        const inputDiv = document.createElement('div');
        inputDiv.className = 'node-input';
        inputDiv.innerHTML = `
            <div class="node-circle" style="background-color: ${node.id === selectedStartNode ? '#ffc107' : '#667eea'}">${node.id}</div>
            <input type="text" value="${nodeValues[node.id] || ''}" 
                   data-node-id="${node.id}" 
                   placeholder="Value">
        `;
        nodeInputsContainer.appendChild(inputDiv);
    });
}

function updateStepControls() {
    prevStepBtn.disabled = currentStep === 0;
    nextStepBtn.disabled = currentStep >= traversalSteps.length - 1;
    autoPlayBtn.disabled = traversalSteps.length === 0;

    if (traversalSteps.length > 0) {
        prevStepBtn.disabled = false;
        nextStepBtn.disabled = false;
        autoPlayBtn.disabled = false;
    }
}

function updateStepDisplay() {
    if (currentStep >= traversalSteps.length) {
        let html = `<p><strong>Visualization complete!</strong></p>`;
        html += `<p>Traversal visited ${traversalSteps[traversalSteps.length - 1]?.visited?.size || 0} nodes.</p>`;

        html += `<div class="final-traversal">`;
        html += `<h4>Final ${selectedAlgorithm} Traversal Order:</h4>`;
        html += `<p>${finalTraversalOrder.map(id =>
            `<span class="highlight">${nodeValues[id] || id}</span>`
        ).join(' → ')}</p>`;

        html += `<p><strong>Node Details:</strong><br>`;
        finalTraversalOrder.forEach(id => {
            html += `Node ${id} = ${nodeValues[id] || id}<br>`;
        });
        html += `</p></div>`;

        stepDetails.innerHTML = html;
        return;
    }

    const step = traversalSteps[currentStep];
    let html = `<p><strong>Step ${currentStep + 1}/${traversalSteps.length}:</strong> ${step.action}</p>`;

    if (selectedAlgorithm === 'BFS') {
        html += `<p>Queue: [${step.queue?.map(id =>
            `<span class="${step.node === id ? 'current-node' : ''}">${nodeValues[id] || id}</span>`
        ).join(', ') || 'Empty'}]</p>`;
    } else {
        html += `<p>Stack: [${step.stack?.map(id =>
            `<span class="${step.node === id ? 'current-node' : ''}">${nodeValues[id] || id}</span>`
        ).join(', ') || 'Empty'}]</p>`;
    }

    html += `<p>Visited: {${[...step.visited].map(id =>
        `<span class="${step.node === id ? 'current-node' : ''}">${nodeValues[id] || id}</span>`
    ).join(', ')}}</p>`;

    stepDetails.innerHTML = html;
    drawVisualization();
}

// ==================== SAMPLE DATA FUNCTIONS ====================
function generateSampleTree() {
    nodes = [];
    edges = [];
    nodeValues = {};
    selectedStartNode = null;

    const centerX = drawingCanvas.width / 2;
    const centerY = 100;

    nodes.push({ id: 0, x: centerX, y: centerY });
    nodes.push({ id: 1, x: centerX - 120, y: centerY + 100 });
    nodes.push({ id: 2, x: centerX, y: centerY + 100 });
    nodes.push({ id: 3, x: centerX + 120, y: centerY + 100 });
    nodes.push({ id: 4, x: centerX - 150, y: centerY + 200 });
    nodes.push({ id: 5, x: centerX - 90, y: centerY + 200 });
    nodes.push({ id: 6, x: centerX + 90, y: centerY + 200 });
    nodes.push({ id: 7, x: centerX + 150, y: centerY + 200 });

    edges.push({ from: 0, to: 1 });
    edges.push({ from: 0, to: 2 });
    edges.push({ from: 0, to: 3 });
    edges.push({ from: 1, to: 4 });
    edges.push({ from: 1, to: 5 });
    edges.push({ from: 3, to: 6 });
    edges.push({ from: 3, to: 7 });

    nodes.forEach(node => {
        nodeValues[node.id] = String.fromCharCode(65 + node.id);
    });

    redrawDrawingCanvas();
    updateNodeInputs();
    updateStartNodeSelect();
    updateVisualizeButton();
    showToast('Sample tree generated', 'success');
}

function generateSampleGraph() {
    nodes = [];
    edges = [];
    nodeValues = {};
    selectedStartNode = null;

    const centerX = drawingCanvas.width / 2;
    const centerY = drawingCanvas.height / 2;
    const radius = 120;

    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * 2 * Math.PI;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        nodes.push({ id: i, x, y });
        nodeValues[i] = String.fromCharCode(65 + i);
    }

    edges.push({ from: 0, to: 1 });
    edges.push({ from: 0, to: 2 });
    edges.push({ from: 1, to: 3 });
    edges.push({ from: 1, to: 4 });
    edges.push({ from: 2, to: 5 });
    edges.push({ from: 3, to: 6 });
    edges.push({ from: 4, to: 6 });
    edges.push({ from: 5, to: 7 });
    edges.push({ from: 6, to: 7 });
    edges.push({ from: 7, to: 0 });

    redrawDrawingCanvas();
    updateNodeInputs();
    updateStartNodeSelect();
    updateVisualizeButton();
    showToast('Sample graph generated', 'success');
}

// ==================== NODE VALUE FUNCTIONS ====================
function applyNodeValues() {
    const inputs = document.querySelectorAll('.node-input input');
    inputs.forEach(input => {
        const nodeId = parseInt(input.dataset.nodeId);
        const value = input.value.trim();
        if (value) {
            nodeValues[nodeId] = value;
        } else {
            nodeValues[nodeId] = nodeId.toString();
        }
    });
    updateStartNodeSelect();
    showToast('Node values applied successfully!', 'success');
}

// ==================== TRAVERSAL FUNCTIONS ====================
function getNeighbors(nodeId) {
    return edges
        .filter(edge => edge.from === nodeId || edge.to === nodeId)
        .map(edge => edge.from === nodeId ? edge.to : edge.from)
        .sort((a, b) => a - b);
}

function bfsTraversal(startId) {
    const steps = [];
    const visited = new Set();
    const queue = [startId];
    visited.add(startId);

    steps.push({
        node: startId,
        visited: new Set(visited),
        queue: [...queue],
        action: `Start BFS from node ${nodeValues[startId] || startId}`
    });

    while (queue.length > 0) {
        const current = queue.shift();
        const neighbors = getNeighbors(current).filter(neighbor => !visited.has(neighbor));

        neighbors.forEach(neighbor => {
            visited.add(neighbor);
            queue.push(neighbor);

            steps.push({
                node: neighbor,
                visited: new Set(visited),
                queue: [...queue],
                action: `Visit ${nodeValues[neighbor] || neighbor} (neighbor of ${nodeValues[current] || current})`
            });
        });

        if (neighbors.length === 0 && queue.length > 0) {
            steps.push({
                node: queue[0],
                visited: new Set(visited),
                queue: [...queue],
                action: `Move to next in queue: ${nodeValues[queue[0]] || queue[0]}`
            });
        }
    }

    steps.push({
        node: null,
        visited: new Set(visited),
        queue: [],
        action: `BFS Complete! Visited ${visited.size} nodes.`
    });

    return steps;
}

function dfsTraversal(startId) {
    const steps = [];
    const visited = new Set();
    const stack = [startId];

    function dfs(current) {
        if (visited.has(current)) return;

        visited.add(current);
        steps.push({
            node: current,
            visited: new Set(visited),
            stack: [...stack],
            action: `Visit ${nodeValues[current] || current}`
        });

        const neighbors = getNeighbors(current).filter(neighbor => !visited.has(neighbor));

        neighbors.forEach(neighbor => {
            if (!visited.has(neighbor)) {
                stack.push(neighbor);
                dfs(neighbor);
                stack.pop();
            }
        });
    }

    dfs(startId);

    steps.push({
        node: null,
        visited: new Set(visited),
        stack: [],
        action: `DFS Complete! Visited ${visited.size} nodes.`
    });

    return steps;
}

function startVisualization() {
    if (!selectedAlgorithm) {
        showToast('Please select an algorithm first!', 'error');
        return;
    }

    if (nodes.length === 0) {
        showToast('Please draw a graph first!', 'error');
        return;
    }

    if (selectedStartNode === null) {
        showToast('Please select a starting node!', 'error');
        return;
    }

    if (selectedAlgorithm === 'BFS') {
        traversalSteps = bfsTraversal(selectedStartNode);
    } else {
        traversalSteps = dfsTraversal(selectedStartNode);
    }

    finalTraversalOrder = [...(traversalSteps[traversalSteps.length - 1]?.visited || [])];

    currentStep = 0;
    updateStepControls();
    updateStepDisplay();
    drawVisualization();
    showToast(`Starting ${selectedAlgorithm} traversal`, 'info');
}

// ==================== STEP NAVIGATION ====================
function previousStep() {
    if (currentStep > 0) {
        currentStep--;
        updateStepControls();
        updateStepDisplay();
    }
}

function nextStep() {
    if (currentStep < traversalSteps.length - 1) {
        currentStep++;
        updateStepControls();
        updateStepDisplay();
    }
}

function toggleAutoPlay() {
    if (autoPlayInterval) {
        clearInterval(autoPlayInterval);
        autoPlayInterval = null;
        autoPlayBtn.textContent = 'Auto Play';
        autoPlayBtn.classList.remove('btn-warning');
        autoPlayBtn.classList.add('btn-success');
    } else {
        autoPlayBtn.textContent = 'Stop';
        autoPlayBtn.classList.remove('btn-success');
        autoPlayBtn.classList.add('btn-warning');
        autoPlayInterval = setInterval(() => {
            if (currentStep < traversalSteps.length - 1) {
                nextStep();
            } else {
                toggleAutoPlay();
            }
        }, 1500);
    }
}

function resetVisualization() {
    currentStep = 0;
    traversalSteps = [];
    finalTraversalOrder = [];
    stepDetails.innerHTML = 'Select an algorithm, draw a graph, choose starting node, then click "Start Visualization"';
    drawVisualization();

    if (autoPlayInterval) {
        clearInterval(autoPlayInterval);
        autoPlayInterval = null;
        autoPlayBtn.textContent = 'Auto Play';
        autoPlayBtn.classList.remove('btn-warning');
        autoPlayBtn.classList.add('btn-success');
    }

    updateStepControls();
}

// ==================== MOBILE INSTRUCTIONS ====================
function showMobileInstructions() {
    if (isMobile) {
        const instructions = document.querySelector('.instructions');
        if (instructions) {
            const mobileNote = document.createElement('div');
            mobileNote.style.cssText = `
                background: #e3f2fd;
                border-left: 4px solid #2196f3;
                padding: 12px;
                margin-top: 10px;
                border-radius: 4px;
                font-size: 14px;
            `;
            mobileNote.innerHTML = `
                <strong><i class="fas fa-mobile-alt"></i> Mobile Controls:</strong><br>
                • Tap empty area: Create node<br>
                • Long press node: Show options (Delete/Link)<br>
                • Tap "Start Linking" then drag from node to another node: Connect<br>
                • Double tap: Cancel linking
            `;
            instructions.appendChild(mobileNote);
        }
    }
}

// ==================== ADD MOBILE STYLES ====================
const mobileStyles = document.createElement('style');
mobileStyles.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; transform: scale(0.9); }
        to { opacity: 1; transform: scale(1); }
    }
    
    @keyframes slideUp {
        from { transform: translate(-50%, 20px); opacity: 0; }
        to { transform: translate(-50%, 0); opacity: 1; }
    }
    
    @keyframes slideDown {
        from { transform: translate(-50%, 0); opacity: 1; }
        to { transform: translate(-50%, 20px); opacity: 0; }
    }
    
    .mobile-context-menu {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }
    
    .mobile-context-menu .menu-item:active {
        background-color: #e9ecef !important;
    }
    
    @media (max-width: 768px) {
        .node {
            cursor: pointer;
        }
        
        .btn {
            padding: 15px 20px;
            font-size: 16px;
        }
        
        .form-control {
            padding: 15px;
            font-size: 16px;
        }
        
        #drawingCanvas {
            touch-action: none;
        }
    }
`;

document.head.appendChild(mobileStyles);