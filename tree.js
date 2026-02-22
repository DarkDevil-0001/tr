// In graph.js and tree.js - Add this after checkUserLogin()

// Override the signup button click handler to include return URL
document.getElementById('signupBtn')?.addEventListener('click', function(e) {
    e.preventDefault();
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    window.location.href = `signup.html?returnTo=${encodeURIComponent(currentPage)}`;
});

// If there's a login button, also handle it
document.getElementById('loginBtn')?.addEventListener('click', function(e) {
    e.preventDefault();
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    window.location.href = `login.html?returnTo=${encodeURIComponent(currentPage)}`;
});

// Also update any inline onclick handlers in HTML
// Remove any existing onclick attributes and use this approach
// Redirect to signup with current page as return URL
function redirectToSignup() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    window.location.href = `signup.html?returnTo=${encodeURIComponent(currentPage)}`;
}

// Redirect to login with current page as return URL
function redirectToLogin() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    window.location.href = `login.html?returnTo=${encodeURIComponent(currentPage)}`;
}

// Update the existing signup button event listener
document.getElementById('signupBtn')?.addEventListener('click', redirectToSignup);

// Also update any login links if they exist
document.getElementById('loginBtn')?.addEventListener('click', redirectToLogin);
// DOM Elements for user management
        const signupBtn = document.getElementById('signupBtn');
        const userInfo = document.getElementById('userInfo');
        const userName = document.getElementById('userName');
        const logoutBtn = document.getElementById('logoutBtn');

        // Check if user is logged in on page load
        function checkUserLogin() {
            const userData = localStorage.getItem('treeviz_user');
            if (userData) {
                const user = JSON.parse(userData);
                // Show user info, hide signup button
                signupBtn.style.display = 'none';
                userInfo.style.display = 'flex';
                userName.textContent = `${user.firstName} ${user.lastName}`;
            } else {
                // Show signup button, hide user info
                signupBtn.style.display = 'flex';
                userInfo.style.display = 'none';
            }
        }


        // Initialize user state
        checkUserLogin();
// Add this after the existing checkUserLogin() function

// Verify user with backend (optional)
async function verifyUserWithBackend() {
    const userData = localStorage.getItem('treeviz_user');
    if (!userData) return;
    
    try {
        const user = JSON.parse(userData);
        const response = await fetch('http://localhost:5000/api/user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: user.email })
        });
        
        const result = await response.json();
        if (!result.success) {
            // User not found in backend, clear local storage
            localStorage.removeItem('treeviz_user');
            checkUserLogin(); // Update UI
        }
    } catch (error) {
        console.log('Backend verification skipped (server might be offline)');
    }
}

// Call this after checkUserLogin()
verifyUserWithBackend();


        // Sign up button click handler
        signupBtn.addEventListener('click', function() {
            // Redirect to signup page with return URL
            window.location.href = 'signup.html?returnTo=' + encodeURIComponent(window.location.href);
        });

        // Logout button click handler
        logoutBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to log out?')) {
                localStorage.removeItem('treeviz_user');
                checkUserLogin();
            }
        });

        // In graph.js and tree.js - Add this after the signup button code

// Login button click handler (if login button exists)
document.getElementById('loginBtn')?.addEventListener('click', function(e) {
    e.preventDefault();
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    window.location.href = `login.html?returnTo=${encodeURIComponent(currentPage)}`;
});
// Mobile detection and redirect functionality
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is on mobile device
    if (isMobileDevice()) {
        // Show notification about desktop site
        showMobileNotification();
    }
});

// Function to detect mobile device
function isMobileDevice() {
    return (window.innerWidth <= 768) || 
           (window.innerHeight <= 600) ||
           /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Function to show mobile notification
function showMobileNotification() {
    // Create notification element
    const notification = document.createElement('div');
    notification.id = 'mobile-notification';
    notification.innerHTML = `
        <div class="mobile-notification-content">
            <i class="fas fa-info-circle"></i>
            <div class="mobile-notification-text">
                <strong>Desktop Site Recommended</strong>
                <p>For the best visualization experience, please switch to desktop site or view on a larger screen.</p>
            </div>
            <button class="mobile-notification-close" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto-hide after 8 seconds
    setTimeout(() => {
        if (document.getElementById('mobile-notification')) {
            document.getElementById('mobile-notification').remove();
        }
    }, 8000);
}

// Override the tree card click handlers to show notification before redirecting
document.addEventListener('DOMContentLoaded', function() {
    const continueBtns = document.querySelectorAll('.continue-btn');
    
    continueBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            if (isMobileDevice()) {
                e.preventDefault();
                
                // Ask user if they want to proceed
                if (confirm('For the best visualization experience, we recommend using desktop site. Do you want to continue anyway?')) {
                    // User chose to continue - hide mobile notification if visible
                    const notification = document.getElementById('mobile-notification');
                    if (notification) notification.remove();
                    
                    // Proceed with visualization
                    const treeType = this.getAttribute('data-tree');
                    proceedToVisualization(treeType);
                }
            }
        });
    });
});

// Function to proceed to visualization (you may already have this)
function proceedToVisualization(treeType) {
    // Your existing code to switch to page 2
    document.getElementById('page1').classList.remove('active');
    document.getElementById('page2').classList.add('active');
    
    // Update title based on tree type
    const titles = {
        'simple': 'Simple Tree',
        'binary': 'Binary Tree',
        'bst': 'Binary Search Tree',
        'avl': 'AVL Tree',
        'heap': 'Heap Tree',
        'trie': 'Trie Tree'
    };
    document.getElementById('selectedTreeTitle').textContent = titles[treeType] || 'Tree Visualization';
}

// Also update the signup button handler to ensure it's working
document.getElementById('signupBtn')?.addEventListener('click', function(e) {
    e.preventDefault();
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    window.location.href = `signup.html?returnTo=${encodeURIComponent(currentPage)}`;
});
// 1. Simple Tree Node
class SimpleTreeNode {
    constructor(value) {
        this.value = value;
        this.children = [];
    }

    addChild(childNode) {
        this.children.push(childNode);
    }
}

// 2. Binary Tree Node
class BinaryTreeNode {
    constructor(value) {
        this.value = value;
        this.left = null;
        this.right = null;
    }
}

// 3. BST Node (extends BinaryTreeNode)
class BSTNode extends BinaryTreeNode {
    constructor(value) {
        super(value);
    }
}

// 4. AVL Node (extends BSTNode)
class AVLNode extends BSTNode {
    constructor(value) {
        super(value);
        this.height = 1;
        this.balanceFactor = 0;
    }
}

// 5. Heap Tree (Array-based implementation)
class HeapTree {
    constructor(type = 'max') {
        this.heap = [];
        this.type = type; // 'max' or 'min'
        this.heapifySteps = 0;
    }

    insert(value) {
        this.heap.push(value);
        this._heapifyUp(this.heap.length - 1);
    }

    _heapifyUp(index) {
        this.heapifySteps++;
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);

            if (this.type === 'max') {
                if (this.heap[parentIndex] >= this.heap[index]) break;
            } else {
                if (this.heap[parentIndex] <= this.heap[index]) break;
            }

            [this.heap[parentIndex], this.heap[index]] = [this.heap[index], this.heap[parentIndex]];
            index = parentIndex;
        }
    }

    toTreeStructure() {
        if (this.heap.length === 0) return null;

        const nodes = [];
        for (let i = 0; i < this.heap.length; i++) {
            nodes.push({
                value: this.heap[i],
                left: 2 * i + 1 < this.heap.length ? 2 * i + 1 : null,
                right: 2 * i + 2 < this.heap.length ? 2 * i + 2 : null
            });
        }
        return nodes;
    }

    getStats() {
        return {
            nodeCount: this.heap.length,
            rootValue: this.heap.length > 0 ? this.heap[0] : null,
            heapifySteps: this.heapifySteps,
            type: this.type
        };
    }
}

// 6. Trie Node
class TrieNode {
    constructor() {
        this.children = new Map();
        this.isEndOfWord = false;
    }
}

class TrieTree {
    constructor() {
        this.root = new TrieNode();
        this.wordCount = 0;
        this.longestWord = '';
    }

    insert(word) {
        let current = this.root;
        for (const char of word) {
            if (!current.children.has(char)) {
                current.children.set(char, new TrieNode());
            }
            current = current.children.get(char);
        }
        if (!current.isEndOfWord) {
            current.isEndOfWord = true;
            this.wordCount++;
            if (word.length > this.longestWord.length) {
                this.longestWord = word;
            }
        }
    }

    search(prefix) {
        let current = this.root;
        for (const char of prefix) {
            if (!current.children.has(char)) {
                return [];
            }
            current = current.children.get(char);
        }
        return this._getAllWords(current, prefix);
    }

    _getAllWords(node, prefix) {
        const words = [];
        if (node.isEndOfWord) {
            words.push(prefix);
        }
        for (const [char, childNode] of node.children) {
            words.push(...this._getAllWords(childNode, prefix + char));
        }
        return words;
    }

    toTreeStructure() {
        const result = [];
        this._toArray(this.root, result, 0, '');
        return result;
    }

    _toArray(node, result, index, path) {
        if (!node) return;

        result[index] = {
            value: path || 'ROOT',
            isEndOfWord: node.isEndOfWord,
            children: []
        };

        let childIndex = 0;
        for (const [char, childNode] of node.children) {
            const childPos = index * 10 + childIndex + 1;
            result[index].children.push(childPos);
            this._toArray(childNode, result, childPos, char);
            childIndex++;
        }
    }

    getStats() {
        return {
            totalWords: this.wordCount,
            totalNodes: this._countNodes(this.root),
            longestWord: this.longestWord
        };
    }

    _countNodes(node) {
        if (!node) return 0;
        let count = 1;
        for (const child of node.children.values()) {
            count += this._countNodes(child);
        }
        return count;
    }
}

// AVL Tree Implementation
class AVLTree {
    constructor() {
        this.root = null;
        this.rotationCount = {
            ll: 0,
            rr: 0,
            lr: 0,
            rl: 0
        };
        this.operationHistory = [];
    }

    getHeight(node) {
        return node ? node.height : 0;
    }

    getBalanceFactor(node) {
        return node ? this.getHeight(node.left) - this.getHeight(node.right) : 0;
    }

    updateHeight(node) {
        if (node) {
            const leftHeight = this.getHeight(node.left);
            const rightHeight = this.getHeight(node.right);
            node.height = Math.max(leftHeight, rightHeight) + 1;
            node.balanceFactor = leftHeight - rightHeight;
        }
    }

    rightRotate(y) {
        this.rotationCount.ll++;
        this.operationHistory.push({
            type: 'rotation_ll',
            message: `Performing LL Rotation at node ${y.value}`
        });

        const x = y.left;
        const T2 = x.right;

        x.right = y;
        y.left = T2;

        this.updateHeight(y);
        this.updateHeight(x);

        return x;
    }

    leftRotate(x) {
        this.rotationCount.rr++;
        this.operationHistory.push({
            type: 'rotation_rr',
            message: `Performing RR Rotation at node ${x.value}`
        });

        const y = x.right;
        const T2 = y.left;

        y.left = x;
        x.right = T2;

        this.updateHeight(x);
        this.updateHeight(y);

        return y;
    }

    insert(value) {
        this.operationHistory = [];
        this.root = this._insert(this.root, value);
        return this.operationHistory;
    }

    _insert(node, value) {
        if (!node) {
            this.operationHistory.push({
                type: 'insert',
                message: `Insert ${value}`
            });
            return new AVLNode(value);
        }

        if (value < node.value) {
            node.left = this._insert(node.left, value);
        } else if (value > node.value) {
            node.right = this._insert(node.right, value);
        } else {
            return node;
        }

        this.updateHeight(node);

        const balance = node.balanceFactor;

        if (Math.abs(balance) > 1) {
            this.operationHistory.push({
                type: 'unbalance',
                message: `Node ${node.value} is unbalanced (balance factor: ${balance})`
            });
        }

        if (balance > 1 && value < node.left.value) {
            return this.rightRotate(node);
        }

        if (balance < -1 && value > node.right.value) {
            return this.leftRotate(node);
        }

        if (balance > 1 && value > node.left.value) {
            this.operationHistory.push({
                type: 'rotation_lr_start',
                message: `LR Rotation needed at node ${node.value}`
            });

            node.left = this.leftRotate(node.left);
            return this.rightRotate(node);
        }

        if (balance < -1 && value < node.right.value) {
            this.rotationCount.rl++;
            this.operationHistory.push({
                type: 'rotation_rl',
                message: `RL Rotation needed at node ${node.value}`
            });

            node.right = this.rightRotate(node.right);
            return this.leftRotate(node);
        }

        return node;
    }

    toArray() {
        const result = [];
        this._toArray(this.root, result, 0);
        return result;
    }

    _toArray(node, result, index) {
        if (!node) return;

        result[index] = {
            value: node.value,
            height: node.height,
            balanceFactor: node.balanceFactor,
            left: node.left ? 2 * index + 1 : null,
            right: node.right ? 2 * index + 2 : null,
            isUnbalanced: Math.abs(node.balanceFactor) > 1
        };

        this._toArray(node.left, result, 2 * index + 1);
        this._toArray(node.right, result, 2 * index + 2);
    }

    getStats() {
        const stats = {
            nodeCount: 0,
            leafCount: 0,
            height: 0,
            balanceFactor: 0
        };

        this._getStats(this.root, stats, 0);
        return stats;
    }

    _getStats(node, stats, depth) {
        if (!node) return;

        stats.nodeCount++;
        stats.height = Math.max(stats.height, depth + 1);

        if (!node.left && !node.right) {
            stats.leafCount++;
        }

        if (node === this.root) {
            stats.balanceFactor = node.balanceFactor;
        }

        this._getStats(node.left, stats, depth + 1);
        this._getStats(node.right, stats, depth + 1);
    }

    getRotationCounts() {
        return { ...this.rotationCount };
    }
}

// BST Implementation
class BST {
    constructor() {
        this.root = null;
        this.operationHistory = [];
    }

    insert(value) {
        this.operationHistory = [];
        this.root = this._insert(this.root, value);
        return this.operationHistory;
    }

    _insert(node, value) {
        if (!node) {
            this.operationHistory.push({
                type: 'insert',
                message: `Insert ${value}`
            });
            return new BSTNode(value);
        }

        if (value < node.value) {
            this.operationHistory.push({
                type: 'search',
                message: `${value} < ${node.value}, go to left subtree`
            });
            node.left = this._insert(node.left, value);
        } else if (value > node.value) {
            this.operationHistory.push({
                type: 'search',
                message: `${value} > ${node.value}, go to right subtree`
            });
            node.right = this._insert(node.right, value);
        } else {
            this.operationHistory.push({
                type: 'duplicate',
                message: `${value} already exists in tree`
            });
        }

        return node;
    }

    toArray() {
        const result = [];
        this._toArray(this.root, result, 0);
        return result;
    }

    _toArray(node, result, index) {
        if (!node) return;

        result[index] = {
            value: node.value,
            left: node.left ? 2 * index + 1 : null,
            right: node.right ? 2 * index + 2 : null
        };

        this._toArray(node.left, result, 2 * index + 1);
        this._toArray(node.right, result, 2 * index + 2);
    }

    getStats() {
        const stats = {
            nodeCount: 0,
            leafCount: 0,
            height: 0
        };

        this._getStats(this.root, stats, 0);
        return stats;
    }

    _getStats(node, stats, depth) {
        if (!node) return;

        stats.nodeCount++;
        stats.height = Math.max(stats.height, depth + 1);

        if (!node.left && !node.right) {
            stats.leafCount++;
        }

        this._getStats(node.left, stats, depth + 1);
        this._getStats(node.right, stats, depth + 1);
    }
}

// =========== UPDATED: Simple Tree Implementation ===========
class SimpleTree {
    constructor() {
        this.root = null;
        this.operationHistory = [];
        this.currentStepIndex = 0;
        this.values = [];
        this.nodes = [];
    }

    // Build tree step by step instead of all at once
    startStepwiseBuild(values) {
        this.operationHistory = [];
        this.currentStepIndex = 0;
        this.values = values;
        this.nodes = [];
        this.root = null;

        if (values.length === 0) return [];

        // Step 1: Create all nodes at once
        const nodeValues = values.filter(v => v !== null);
        this.operationHistory.push({
            type: 'create_all',
            message: `Create all ${nodeValues.length} nodes: ${nodeValues.join(', ')}`,
            treeState: this._getCurrentTreeState(),
            stepIndex: 0,
            values: nodeValues
        });

        // Step 2: Build connections step by step
        let connectionStep = 1;
        for (let i = 0; i < values.length; i++) {
            if (values[i] !== null) {
                const leftChildIndex = 2 * i + 1;
                const rightChildIndex = 2 * i + 2;

                if (leftChildIndex < values.length && values[leftChildIndex] !== null) {
                    this.operationHistory.push({
                        type: 'connect',
                        message: `Connect ${values[i]} to left child ${values[leftChildIndex]}`,
                        treeState: this._getTreeStateAtStep(connectionStep),
                        stepIndex: connectionStep,
                        parentIndex: i,
                        childIndex: leftChildIndex,
                        isLeftChild: true
                    });
                    connectionStep++;
                }

                if (rightChildIndex < values.length && values[rightChildIndex] !== null) {
                    this.operationHistory.push({
                        type: 'connect',
                        message: `Connect ${values[i]} to right child ${values[rightChildIndex]}`,
                        treeState: this._getTreeStateAtStep(connectionStep),
                        stepIndex: connectionStep,
                        parentIndex: i,
                        childIndex: rightChildIndex,
                        isLeftChild: false
                    });
                    connectionStep++;
                }
            }
        }

        // If no connections were needed (single node tree)
        if (connectionStep === 1 && values.length > 0 && values[0] !== null) {
            this.operationHistory.push({
                type: 'complete',
                message: 'Tree construction complete',
                treeState: this._getTreeStateAtStep(1),
                stepIndex: 1
            });
        }

        return this.operationHistory;
    }

    // Execute next step in building
    executeNextStep() {
        if (this.currentStepIndex >= this.operationHistory.length) {
            return null;
        }

        const step = this.operationHistory[this.currentStepIndex];

        if (step.type === 'create_all' && step.values) {
            // Create all nodes at once
            for (let i = 0; i < this.values.length; i++) {
                if (this.values[i] !== null) {
                    this.nodes[i] = new SimpleTreeNode(this.values[i]);
                }
            }

            if (this.values.length > 0 && this.values[0] !== null) {
                this.root = this.nodes[0];
            }
        }
        else if (step.type === 'connect' && step.parentIndex !== undefined && step.childIndex !== undefined) {
            // Connect nodes
            if (this.nodes[step.parentIndex] && this.nodes[step.childIndex]) {
                this.nodes[step.parentIndex].addChild(this.nodes[step.childIndex]);
            }
        }

        this.currentStepIndex++;
        return step;
    }

    // Get tree state at a specific step
    _getTreeStateAtStep(stepNum) {
        // Step 0: No nodes created
        if (stepNum === 0) {
            return [];
        }

        // Step 1: All nodes created but no connections
        if (stepNum === 1) {
            const tempNodes = [];
            for (let i = 0; i < this.values.length; i++) {
                if (this.values[i] !== null) {
                    tempNodes[i] = new SimpleTreeNode(this.values[i]);
                }
            }

            const result = [];
            for (let i = 0; i < this.values.length; i++) {
                if (tempNodes[i]) {
                    result[i] = {
                        value: tempNodes[i].value,
                        children: []
                    };
                }
            }
            return result;
        }

        // For steps > 1, simulate connections made so far
        const tempTree = new SimpleTree();
        tempTree.values = this.values;
        tempTree.nodes = [];

        // Create all nodes
        for (let i = 0; i < this.values.length; i++) {
            if (this.values[i] !== null) {
                tempTree.nodes[i] = new SimpleTreeNode(this.values[i]);
            }
        }

        if (tempTree.values.length > 0 && tempTree.values[0] !== null) {
            tempTree.root = tempTree.nodes[0];
        }

        // Apply connections up to this step
        // We need to consider that step 0 is "create all", step 1+ are connections
        // So stepNum - 1 connections have been made
        const connectionsToMake = Math.min(stepNum - 1, this.operationHistory.length - 1);

        for (let i = 1; i <= connectionsToMake; i++) {
            const step = this.operationHistory[i];
            if (step.type === 'connect' && step.parentIndex !== undefined && step.childIndex !== undefined) {
                if (tempTree.nodes[step.parentIndex] && tempTree.nodes[step.childIndex]) {
                    tempTree.nodes[step.parentIndex].addChild(tempTree.nodes[step.childIndex]);
                }
            }
        }

        return tempTree.toArray();
    }

    // Get current tree state
    _getCurrentTreeState() {
        return this.toArray();
    }

    toArray() {
        const result = [];
        this._toArray(this.root, result, 0);
        return result;
    }

    _toArray(node, result, index) {
        if (!node) return;

        result[index] = {
            value: node.value,
            children: []
        };

        // Store children indices
        for (let i = 0; i < node.children.length; i++) {
            const childIndex = index * 10 + i + 1;
            result[index].children.push(childIndex);
            this._toArray(node.children[i], result, childIndex);
        }
    }

    getStats() {
        const stats = {
            nodeCount: 0,
            leafCount: 0,
            height: 0
        };

        this._getStats(this.root, stats, 0);
        return stats;
    }

    _getStats(node, stats, depth) {
        if (!node) return;

        stats.nodeCount++;
        stats.height = Math.max(stats.height, depth + 1);

        if (node.children.length === 0) {
            stats.leafCount++;
        }

        for (const child of node.children) {
            this._getStats(child, stats, depth + 1);
        }
    }
}

// =========== UPDATED: Binary Tree Implementation ===========
class BinaryTree {
    constructor() {
        this.root = null;
        this.operationHistory = [];
        this.currentStepIndex = 0;
        this.values = [];
        this.nodes = [];
    }

    // Build tree step by step
    startStepwiseBuild(values) {
        this.operationHistory = [];
        this.currentStepIndex = 0;
        this.values = values;
        this.nodes = [];
        this.root = null;

        if (values.length === 0) return [];

        // Step 1: Create all nodes at once
        const nodeValues = values.filter(v => v !== null);
        this.operationHistory.push({
            type: 'create_all',
            message: `Create all ${nodeValues.length} nodes: ${nodeValues.join(', ')}`,
            treeState: this._getCurrentTreeState(),
            stepIndex: 0,
            values: nodeValues
        });

        // Step 2: Build connections step by step
        let connectionStep = 1;
        for (let i = 0; i < values.length; i++) {
            if (values[i] !== null) {
                const leftIndex = 2 * i + 1;
                const rightIndex = 2 * i + 2;

                if (leftIndex < values.length && values[leftIndex] !== null) {
                    this.operationHistory.push({
                        type: 'connect',
                        message: `Connect ${values[i]} to left child ${values[leftIndex]}`,
                        treeState: this._getTreeStateAtStep(connectionStep),
                        stepIndex: connectionStep,
                        parentIndex: i,
                        childIndex: leftIndex,
                        isLeft: true
                    });
                    connectionStep++;
                }

                if (rightIndex < values.length && values[rightIndex] !== null) {
                    this.operationHistory.push({
                        type: 'connect',
                        message: `Connect ${values[i]} to right child ${values[rightIndex]}`,
                        treeState: this._getTreeStateAtStep(connectionStep),
                        stepIndex: connectionStep,
                        parentIndex: i,
                        childIndex: rightIndex,
                        isLeft: false
                    });
                    connectionStep++;
                }
            }
        }

        // If no connections were needed (single node tree)
        if (connectionStep === 1 && values.length > 0 && values[0] !== null) {
            this.operationHistory.push({
                type: 'complete',
                message: 'Tree construction complete',
                treeState: this._getTreeStateAtStep(1),
                stepIndex: 1
            });
        }

        return this.operationHistory;
    }

    // Execute next step in building
    executeNextStep() {
        if (this.currentStepIndex >= this.operationHistory.length) {
            return null;
        }

        const step = this.operationHistory[this.currentStepIndex];

        if (step.type === 'create_all' && step.values) {
            // Create all nodes at once
            for (let i = 0; i < this.values.length; i++) {
                if (this.values[i] !== null) {
                    this.nodes[i] = new BinaryTreeNode(this.values[i]);
                }
            }

            if (this.values.length > 0 && this.values[0] !== null) {
                this.root = this.nodes[0];
            }
        }
        else if (step.type === 'connect' && step.parentIndex !== undefined && step.childIndex !== undefined) {
            // Connect nodes
            if (this.nodes[step.parentIndex] && this.nodes[step.childIndex]) {
                if (step.isLeft) {
                    this.nodes[step.parentIndex].left = this.nodes[step.childIndex];
                } else {
                    this.nodes[step.parentIndex].right = this.nodes[step.childIndex];
                }
            }
        }

        this.currentStepIndex++;
        return step;
    }

    // Get tree state at a specific step
    _getTreeStateAtStep(stepNum) {
        // Step 0: No nodes created
        if (stepNum === 0) {
            return [];
        }

        // Step 1: All nodes created but no connections
        if (stepNum === 1) {
            const result = [];
            for (let i = 0; i < this.values.length; i++) {
                if (this.values[i] !== null) {
                    result[i] = {
                        value: this.values[i],
                        left: null,
                        right: null
                    };
                }
            }
            return result;
        }

        // For steps > 1, simulate connections made so far
        const tempTree = new BinaryTree();
        tempTree.values = this.values;
        tempTree.nodes = [];

        // Create all nodes
        for (let i = 0; i < this.values.length; i++) {
            if (this.values[i] !== null) {
                tempTree.nodes[i] = new BinaryTreeNode(this.values[i]);
            }
        }

        if (tempTree.values.length > 0 && tempTree.values[0] !== null) {
            tempTree.root = tempTree.nodes[0];
        }

        // Apply connections up to this step
        // We need to consider that step 0 is "create all", step 1+ are connections
        // So stepNum - 1 connections have been made
        const connectionsToMake = Math.min(stepNum - 1, this.operationHistory.length - 1);

        for (let i = 1; i <= connectionsToMake; i++) {
            const step = this.operationHistory[i];
            if (step.type === 'connect' && step.parentIndex !== undefined && step.childIndex !== undefined) {
                if (tempTree.nodes[step.parentIndex] && tempTree.nodes[step.childIndex]) {
                    if (step.isLeft) {
                        tempTree.nodes[step.parentIndex].left = tempTree.nodes[step.childIndex];
                    } else {
                        tempTree.nodes[step.parentIndex].right = tempTree.nodes[step.childIndex];
                    }
                }
            }
        }

        return tempTree.toArray();
    }

    // Get current tree state
    _getCurrentTreeState() {
        return this.toArray();
    }

    // For traversal operations
    inorderTraversal() {
        this.operationHistory = [];
        const result = [];
        this._inorder(this.root, result);

        this.operationHistory.push({
            type: 'traversal_start',
            message: 'Starting inorder traversal'
        });

        return { result, steps: this.operationHistory };
    }

    _inorder(node, result) {
        if (!node) return;

        this.operationHistory.push({
            type: 'traversal_visit',
            message: `Visit left subtree of ${node.value}`
        });
        this._inorder(node.left, result);

        this.operationHistory.push({
            type: 'traversal_process',
            message: `Process node ${node.value}`
        });
        result.push(node.value);

        this.operationHistory.push({
            type: 'traversal_visit',
            message: `Visit right subtree of ${node.value}`
        });
        this._inorder(node.right, result);
    }

    toArray() {
        const result = [];
        this._toArray(this.root, result, 0);
        return result;
    }

    _toArray(node, result, index) {
        if (!node) return;

        result[index] = {
            value: node.value,
            left: node.left ? 2 * index + 1 : null,
            right: node.right ? 2 * index + 2 : null
        };

        this._toArray(node.left, result, 2 * index + 1);
        this._toArray(node.right, result, 2 * index + 2);
    }

    getStats() {
        const stats = {
            nodeCount: 0,
            leafCount: 0,
            height: 0
        };

        this._getStats(this.root, stats, 0);
        return stats;
    }

    _getStats(node, stats, depth) {
        if (!node) return;

        stats.nodeCount++;
        stats.height = Math.max(stats.height, depth + 1);

        if (!node.left && !node.right) {
            stats.leafCount++;
        }

        this._getStats(node.left, stats, depth + 1);
        this._getStats(node.right, stats, depth + 1);
    }
}
// Application State
const state = {
    currentPage: 1,
    selectedTree: 'avl',
    treeOptions: {},
    tree: null,
    steps: [],
    currentStep: 0,
    isAutoRunning: false,
    autoInterval: null,
    speed: 500,
    stats: {
        nodeCount: 0,
        leafCount: 0,
        treeHeight: 0,
        balanceFactor: 0
    },
    stepwiseBuilding: false,
    stepwiseTree: null,
    buildingValues: []
};

// DOM Elements
const page1 = document.getElementById('page1');
const page2 = document.getElementById('page2');
const treeCards = document.querySelectorAll('.tree-card');
const treeContinueBtns = document.querySelectorAll('.tree-continue-btn');
const backBtn = document.getElementById('backBtn');
const selectedTreeTitle = document.getElementById('selectedTreeTitle');
const nodeInput = document.getElementById('nodeInput');
const nodeInputLabel = document.getElementById('nodeInputLabel');
const operationType = document.getElementById('operationType');
const nodeValueField = document.getElementById('nodeValueField');
const nodeValueInput = document.getElementById('nodeValue');
const nodeValueLabel = document.getElementById('nodeValueLabel');
const buildTreeBtn = document.getElementById('buildTreeBtn');
const nextStepBtn = document.getElementById('nextStepBtn');
const prevStepBtn = document.getElementById('prevStepBtn');
const autoBuildBtn = document.getElementById('autoBuildBtn');
const resetBtn = document.getElementById('resetBtn');
const speedSlider = document.getElementById('speedSlider');
const speedValue = document.getElementById('speedValue');
const stepsList = document.getElementById('stepsList');
const treeSvg = document.getElementById('treeSvg');
const currentStepInfo = document.getElementById('currentStepInfo');
const traversalOutput = document.getElementById('traversalOutput');
const traversalResult = document.getElementById('traversalResult');
const traversalTitle = document.getElementById('traversalTitle');
const wordList = document.getElementById('wordList');

// Stats elements
const nodeCountEl = document.getElementById('nodeCount');
const leafCountEl = document.getElementById('leafCount');
const treeHeightEl = document.getElementById('treeHeight');
const balanceFactorEl = document.getElementById('balanceFactor');
const rotationStats = document.getElementById('rotationStats');
const llCountEl = document.getElementById('llCount');
const rrCountEl = document.getElementById('rrCount');
const lrCountEl = document.getElementById('lrCount');
const rlCountEl = document.getElementById('rlCount');
const totalRotationsEl = document.getElementById('totalRotations');
const heapStats = document.getElementById('heapStats');
const heapTypeDisplay = document.getElementById('heapTypeDisplay');
const rootValue = document.getElementById('rootValue');
const heapifySteps = document.getElementById('heapifySteps');
const trieStats = document.getElementById('trieStats');
const totalWords = document.getElementById('totalWords');
const trieNodeCount = document.getElementById('trieNodeCount');
const longestWord = document.getElementById('longestWord');

// Tree type names mapping
const treeNames = {
    simple: 'Simple Tree',
    binary: 'Binary Tree',
    bst: 'Binary Search Tree',
    avl: 'AVL Tree',
    heap: 'Heap Tree',
    trie: 'Trie Tree'
};

// Tree default inputs and labels
const treeConfig = {
    simple: {
        label: 'Enter values (comma-separated)',
        placeholder: 'e.g., 1, 2, 3, 4, 5, 6, 7',
        defaultValue: '1, 2, 3, 4, 5, 6, 7'
    },
    binary: {
        label: 'Enter values (comma-separated, use null for empty nodes)',
        placeholder: 'e.g., 1, 2, 3, 4, null, 6, 7',
        defaultValue: '1, 2, 3, 4, 5, 6, 7'
    },
    bst: {
        label: 'Enter values (comma-separated numbers)',
        placeholder: 'e.g., 50, 30, 70, 20, 40, 60, 80',
        defaultValue: '50, 30, 70, 20, 40, 60, 80'
    },
    avl: {
        label: 'Enter values (comma-separated numbers)',
        placeholder: 'e.g., 30, 20, 40, 10, 25, 35, 37',
        defaultValue: '30, 20, 40, 10, 25, 35, 37'
    },
    heap: {
        label: 'Enter values (comma-separated numbers)',
        placeholder: 'e.g., 10, 20, 15, 30, 40, 50, 100',
        defaultValue: '10, 20, 15, 30, 40, 50, 100'
    },
    trie: {
        label: 'Enter words (comma-separated)',
        placeholder: 'e.g., cat, car, bat, bar, cart, batman',
        defaultValue: 'cat, car, bat, bar, cart, batman'
    }
};

// Initialize the application
function init() {
    setupEventListeners();
    setupTreeSelection();
    updateUI();
}

// Setup event listeners
function setupEventListeners() {
    treeCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.classList.add('expanded');
        });

        card.addEventListener('mouseleave', () => {
            card.classList.remove('expanded');
        });

        card.addEventListener('click', (e) => {
            if (e.target.tagName === 'SELECT' || e.target.closest('.option-group')) {
                e.stopPropagation();
            }
        });
    });

    treeContinueBtns.forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            const treeType = this.dataset.tree;
            selectTree(treeType);
            goToPage2();
        });
    });

    backBtn.addEventListener('click', goToPage1);
    operationType.addEventListener('change', function () {
        const op = this.value;
        nodeValueField.style.display =
            (op === 'insert' || op === 'delete' || op === 'search') ? 'block' : 'none';

        if (state.selectedTree === 'trie') {
            if (op === 'search') {
                nodeValueLabel.textContent = 'Search Prefix';
                nodeValueInput.placeholder = 'Enter prefix to search';
            } else if (op === 'insert') {
                nodeValueLabel.textContent = 'Word to Insert';
                nodeValueInput.placeholder = 'Enter word';
            }
        } else {
            nodeValueLabel.textContent = 'Node Value';
            nodeValueInput.placeholder = 'Enter value';
        }
    });

    buildTreeBtn.addEventListener('click', buildTree);
    nextStepBtn.addEventListener('click', nextStep);
    prevStepBtn.addEventListener('click', prevStep);
    autoBuildBtn.addEventListener('click', toggleAutoRun);
    resetBtn.addEventListener('click', resetVisualization);
    speedSlider.addEventListener('input', updateSpeed);
    document.getElementById('homeBtn').addEventListener('click', goToPage1);
    document.getElementById('helpBtn').addEventListener('click', showHelp);
}

function setupTreeSelection() {
    document.querySelector('.tree-card[data-tree="avl"]').classList.add('expanded');
}

function selectTree(treeType) {
    state.selectedTree = treeType;
    const config = treeConfig[treeType];
    nodeInputLabel.textContent = config.label;
    nodeInput.placeholder = config.placeholder;
    nodeInput.value = config.defaultValue;
    updateTreeOptions();
}

function updateTreeOptions() {
    state.treeOptions = {};
    if (state.selectedTree === 'avl') {
        state.treeOptions.demo = document.getElementById('avlDemo')?.value || 'insertion';
    } else if (state.selectedTree === 'bst') {
        state.treeOptions.demo = document.getElementById('bstDemo')?.value || 'insertion';
    } else if (state.selectedTree === 'binary') {
        state.treeOptions.demo = document.getElementById('binaryDemo')?.value || 'traversal';
    } else if (state.selectedTree === 'simple') {
        state.treeOptions.demo = document.getElementById('simpleDemo')?.value || 'basic';
    } else if (state.selectedTree === 'heap') {
        state.treeOptions.heapType = document.getElementById('heapType')?.value || 'max';
    } else if (state.selectedTree === 'trie') {
        state.treeOptions.demo = document.getElementById('trieDemo')?.value || 'insertion';
    }
}

function goToPage2() {
    updateTreeOptions();
    selectedTreeTitle.textContent = `${treeNames[state.selectedTree]} Visualization`;
    page1.classList.remove('active');
    page2.classList.add('active');
    state.currentPage = 2;
    resetVisualization();
}

function goToPage1() {
    if (state.isAutoRunning) {
        toggleAutoRun();
    }
    page2.classList.remove('active');
    page1.classList.add('active');
    state.currentPage = 1;
}

function updateSpeed() {
    const speed = parseInt(speedSlider.value);
    state.speed = 1100 - (speed * 100);
    const speedLabels = ['Very Slow', 'Slow', 'Medium Slow', 'Medium', 'Medium Fast', 'Fast', 'Very Fast'];
    speedValue.textContent = speedLabels[Math.min(speed - 1, 6)] || 'Medium';

    if (state.isAutoRunning) {
        clearInterval(state.autoInterval);
        startAutoRun();
    }
}

function buildTree() {
    const inputText = nodeInput.value.trim();
    const operation = operationType.value;

    // Hide/show appropriate stats panels
    rotationStats.style.display = state.selectedTree === 'avl' ? 'block' : 'none';
    heapStats.style.display = state.selectedTree === 'heap' ? 'block' : 'none';
    trieStats.style.display = state.selectedTree === 'trie' ? 'block' : 'none';
    traversalOutput.style.display = 'none';
    wordList.style.display = 'none';

    if (state.selectedTree === 'trie') {
        const words = inputText.split(',').map(w => w.trim()).filter(w => w.length > 0);
        if (words.length === 0) {
            alert('Please enter valid words');
            return;
        }

        if (operation === 'insert' && nodeValueInput.value.trim()) {
            words.push(nodeValueInput.value.trim());
        }

        resetVisualization();
        generateTrieSteps(words, operation);
    } else {
        let values = [];
        if (state.selectedTree === 'binary') {
            // Parse binary tree values (allow null)
            values = inputText.split(',').map(v => {
                const trimmed = v.trim();
                return trimmed.toLowerCase() === 'null' ? null : parseInt(trimmed);
            }).filter(v => v !== undefined);
        } else {
            values = inputText.split(',').map(v => parseInt(v.trim())).filter(v => !isNaN(v));
        }

        if (values.length === 0) {
            alert('Please enter valid values');
            return;
        }

        if (operation === 'insert' && nodeValueInput.value.trim()) {
            const newValue = parseInt(nodeValueInput.value.trim());
            if (!isNaN(newValue)) {
                if (state.selectedTree === 'binary') {
                    values.push(newValue);
                } else {
                    values.push(newValue);
                }
            }
        }

        resetVisualization();
        generateSteps(values, operation);
    }

    updateStepInfo();
    updateButtons();
    renderTree();
}

function generateSteps(values, operation) {
    state.steps = [];
    state.buildingValues = values;
    state.stepwiseBuilding = false;

    // Create appropriate tree based on selection
    switch (state.selectedTree) {
        case 'simple':
            state.stepwiseBuilding = true;
            state.stepwiseTree = new SimpleTree();
            const simpleSteps = state.stepwiseTree.startStepwiseBuild(values);

            // Convert to our step format
            simpleSteps.forEach((step, i) => {
                state.steps.push({
                    index: i + 1,
                    title: getStepTitle(step.type),
                    description: step.message,
                    stepType: step.type,
                    treeState: step.treeState,
                    isStepwise: true,
                    stepData: step
                });
            });
            break;

        case 'binary':
            if (operation === 'traversal') {
                // For traversal, build tree first then do traversal
                state.tree = new BinaryTree();
                const binaryOps = state.tree.buildFromArray(values);
                state.steps.push(...binaryOps.map((op, i) => ({
                    index: i + 1,
                    title: op.type === 'build' ? 'Build Tree' : op.type === 'create' ? 'Create Node' : 'Connect Nodes',
                    description: op.message,
                    stepType: op.type,
                    treeState: state.tree.toArray()
                })));

                // Add traversal steps
                const traversal = state.tree.inorderTraversal();
                state.steps.push({
                    index: state.steps.length + 1,
                    title: 'Start Traversal',
                    description: 'Starting inorder traversal',
                    stepType: 'traversal_start',
                    treeState: state.tree.toArray()
                });

                state.steps.push(...traversal.steps.map((step, i) => ({
                    index: state.steps.length + 1,
                    title: step.type === 'traversal_visit' ? 'Visit Subtree' : 'Process Node',
                    description: step.message,
                    stepType: 'traversal',
                    treeState: state.tree.toArray(),
                    traversalResult: traversal.result.slice(0, i + 1)
                })));
            } else {
                // For construction, use stepwise building
                state.stepwiseBuilding = true;
                state.stepwiseTree = new BinaryTree();
                const binarySteps = state.stepwiseTree.startStepwiseBuild(values);

                binarySteps.forEach((step, i) => {
                    state.steps.push({
                        index: i + 1,
                        title: getStepTitle(step.type),
                        description: step.message,
                        stepType: step.type,
                        treeState: step.treeState,
                        isStepwise: true,
                        stepData: step
                    });
                });
            }
            break;

        case 'bst':
            state.tree = new BST();
            values.forEach((value, index) => {
                const ops = state.tree.insert(value);
                ops.forEach((op, opIndex) => {
                    state.steps.push({
                        index: state.steps.length + 1,
                        title: op.type === 'insert' ? 'Insert Node' : op.type === 'search' ? 'Search Path' : 'Duplicate Value',
                        description: op.message,
                        stepType: op.type,
                        treeState: state.tree.toArray(),
                        highlightNode: op.type === 'insert' ? value : null
                    });
                });
            });
            break;

        case 'avl':
            state.tree = new AVLTree();
            values.forEach((value, index) => {
                const ops = state.tree.insert(value);
                ops.forEach((op, opIndex) => {
                    state.steps.push({
                        index: state.steps.length + 1,
                        title: getStepTitle(op.type),
                        description: op.message,
                        stepType: op.type,
                        treeState: state.tree.toArray(),
                        highlightNode: op.type === 'insert' ? value : null
                    });
                });
            });
            break;

        case 'heap':
            const heapType = state.treeOptions.heapType || 'max';
            state.tree = new HeapTree(heapType);
            values.forEach((value, index) => {
                state.tree.insert(value);
                state.steps.push({
                    index: state.steps.length + 1,
                    title: 'Insert Node',
                    description: `Insert ${value} into ${heapType} heap`,
                    stepType: 'heapify',
                    treeState: state.tree.toTreeStructure(),
                    highlightNode: value
                });
            });
            break;
    }

    // Mark first step as active
    if (state.steps.length > 0) {
        state.steps[0].isActive = true;
    }

    // Update current step info
    if (state.steps.length > 0) {
        const step = state.steps[0];
        currentStepInfo.textContent = step.description;
    }

    updateStats();
}

function generateTrieSteps(words, operation) {
    state.steps = [];
    state.tree = new TrieTree();

    if (operation === 'search') {
        // First insert all words
        words.forEach((word, index) => {
            state.tree.insert(word);
            state.steps.push({
                index: state.steps.length + 1,
                title: 'Insert Word',
                description: `Insert word "${word}" into trie`,
                stepType: 'insert',
                treeState: state.tree.toTreeStructure()
            });
        });

        // Then search for the prefix
        const searchPrefix = nodeValueInput.value.trim();
        if (searchPrefix) {
            const results = state.tree.search(searchPrefix);
            state.steps.push({
                index: state.steps.length + 1,
                title: 'Search Prefix',
                description: `Search for words with prefix "${searchPrefix}"`,
                stepType: 'search',
                treeState: state.tree.toTreeStructure(),
                searchResults: results,
                searchPrefix: searchPrefix
            });
        }
    } else {
        // Just insert words
        words.forEach((word, index) => {
            state.tree.insert(word);
            state.steps.push({
                index: state.steps.length + 1,
                title: 'Insert Word',
                description: `Insert word "${word}" into trie`,
                stepType: 'insert',
                treeState: state.tree.toTreeStructure(),
                highlightWord: word
            });
        });
    }

    // Mark first step as active
    if (state.steps.length > 0) {
        state.steps[0].isActive = true;
    }

    // Update current step info
    if (state.steps.length > 0) {
        const step = state.steps[0];
        currentStepInfo.textContent = step.description;
    }

    updateStats();
}

function getStepTitle(type) {
    switch (type) {
        case 'create_all': return 'Create All Nodes';
        case 'build_start': return 'Start Building';
        case 'rotation_ll': return 'LL Rotation';
        case 'rotation_rr': return 'RR Rotation';
        case 'rotation_lr_start': return 'LR Rotation';
        case 'rotation_rl': return 'RL Rotation';
        case 'unbalance': return 'Node Unbalanced';
        case 'insert': return 'Insert Node';
        case 'create': return 'Create Node';
        case 'connect': return 'Connect Nodes';
        case 'complete': return 'Complete';
        case 'search': return 'Search Path';
        case 'duplicate': return 'Duplicate Value';
        case 'traversal_start': return 'Start Traversal';
        case 'traversal_visit': return 'Visit Subtree';
        case 'traversal_process': return 'Process Node';
        default: return 'Operation';
    }
}

function updateStepInfo() {
    stepsList.innerHTML = '';

    state.steps.forEach((step, index) => {
        const stepItem = document.createElement('div');
        stepItem.className = 'step-item';

        if (step.isActive) stepItem.classList.add('active');
        if (step.isCompleted) stepItem.classList.add('completed');
        if (step.stepType === 'insert' || step.stepType === 'create') stepItem.classList.add('insert');
        if (step.stepType.includes('rotation')) stepItem.classList.add('rotation');
        if (step.stepType === 'unbalance') stepItem.classList.add('unbalance');
        if (step.stepType.includes('traversal') || step.stepType === 'connect') stepItem.classList.add('traversal');
        if (step.stepType === 'heapify') stepItem.classList.add('heapify');
        if (step.stepType === 'build_start') stepItem.classList.add('completed');

        stepItem.innerHTML = `
                    <span class="step-index">${step.index}</span>
                    <div class="step-title">${step.title}</div>
                    <div class="step-description">${step.description}</div>
                `;

        stepItem.addEventListener('click', () => {
            goToStep(index);
        });

        stepsList.appendChild(stepItem);
    });
}

function goToStep(stepIndex) {
    if (stepIndex < 0 || stepIndex >= state.steps.length) return;

    // Handle stepwise building for Simple and Binary trees
    if (state.stepwiseBuilding && state.stepwiseTree) {
        // Execute all steps up to this point
        state.stepwiseTree.currentStepIndex = 0;
        for (let i = 0; i <= stepIndex; i++) {
            if (state.steps[i].isStepwise) {
                state.stepwiseTree.executeNextStep();
            }
        }

        // Update the tree state for this step
        state.steps[stepIndex].treeState = state.stepwiseTree.toArray();
        state.tree = state.stepwiseTree;
    }

    state.steps.forEach((step, index) => {
        step.isActive = (index === stepIndex);
        step.isCompleted = (index < stepIndex);
    });

    state.currentStep = stepIndex;
    updateStepInfo();
    renderTree();
    updateButtons();

    const step = state.steps[stepIndex];
    if (step) {
        currentStepInfo.textContent = step.description;

        // Show traversal output for binary tree
        if (state.selectedTree === 'binary' && step.traversalResult) {
            traversalOutput.style.display = 'block';
            traversalTitle.textContent = 'Inorder Traversal:';
            traversalResult.textContent = step.traversalResult.join(' → ');
        } else {
            traversalOutput.style.display = 'none';
        }

        // Show search results for trie
        if (state.selectedTree === 'trie' && step.searchResults) {
            wordList.style.display = 'flex';
            wordList.innerHTML = '';
            step.searchResults.forEach(word => {
                const wordItem = document.createElement('div');
                wordItem.className = 'word-item';
                wordItem.textContent = word;
                wordList.appendChild(wordItem);
            });
        }

        updateStatsFromStep();
    }
}

function nextStep() {
    if (state.currentStep < state.steps.length - 1) {
        goToStep(state.currentStep + 1);
    }
}

function prevStep() {
    if (state.currentStep > 0) {
        goToStep(state.currentStep - 1);
    }
}

function toggleAutoRun() {
    if (state.isAutoRunning) {
        clearInterval(state.autoInterval);
        state.isAutoRunning = false;
        autoBuildBtn.innerHTML = '<i class="fas fa-play-circle"></i> Auto Build';
        autoBuildBtn.classList.remove('btn-danger');
        autoBuildBtn.classList.add('btn-secondary');
    } else {
        startAutoRun();
        state.isAutoRunning = true;
        autoBuildBtn.innerHTML = '<i class="fas fa-stop-circle"></i> Stop';
        autoBuildBtn.classList.remove('btn-secondary');
        autoBuildBtn.classList.add('btn-danger');
    }
}

function startAutoRun() {
    state.autoInterval = setInterval(() => {
        if (state.currentStep < state.steps.length - 1) {
            nextStep();
        } else {
            toggleAutoRun();
        }
    }, state.speed);
}

function resetVisualization() {
    if (state.isAutoRunning) {
        toggleAutoRun();
    }

    state.steps = [];
    state.currentStep = 0;
    state.tree = null;
    state.stepwiseTree = null;
    state.stepwiseBuilding = false;
    state.buildingValues = [];

    state.stats = {
        nodeCount: 0,
        leafCount: 0,
        treeHeight: 0,
        balanceFactor: 0
    };

    updateStepInfo();
    updateButtons();
    updateStats();

    treeSvg.innerHTML = '';
    traversalOutput.style.display = 'none';
    wordList.style.display = 'none';
    currentStepInfo.textContent = `Ready to visualize ${treeNames[state.selectedTree]}. Click "Build Tree" to start.`;

    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", "300");
    text.setAttribute("y", "175");
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("fill", "#666");
    text.setAttribute("font-size", "16");
    text.textContent = `Click "Build Tree" to visualize ${treeNames[state.selectedTree]}`;
    treeSvg.appendChild(text);
}

function updateButtons() {
    nextStepBtn.disabled = state.steps.length === 0 || state.currentStep >= state.steps.length - 1;
    prevStepBtn.disabled = state.steps.length === 0 || state.currentStep <= 0;
    autoBuildBtn.disabled = state.steps.length === 0;

    nextStepBtn.style.opacity = nextStepBtn.disabled ? '0.5' : '1';
    prevStepBtn.style.opacity = prevStepBtn.disabled ? '0.5' : '1';
    autoBuildBtn.style.opacity = autoBuildBtn.disabled ? '0.5' : '1';
}

function updateStatsFromStep() {
    if (!state.tree) return;

    const stats = state.tree.getStats();
    state.stats = stats;

    nodeCountEl.textContent = stats.nodeCount || 0;
    leafCountEl.textContent = stats.leafCount || 0;
    treeHeightEl.textContent = stats.height || 0;
    balanceFactorEl.textContent = stats.balanceFactor || 0;

    // Update rotation counts for AVL
    if (state.selectedTree === 'avl' && state.tree.getRotationCounts) {
        const rotationCounts = state.tree.getRotationCounts();
        llCountEl.textContent = rotationCounts.ll || 0;
        rrCountEl.textContent = rotationCounts.rr || 0;
        lrCountEl.textContent = rotationCounts.lr || 0;
        rlCountEl.textContent = rotationCounts.rl || 0;
        totalRotationsEl.textContent = (rotationCounts.ll || 0) + (rotationCounts.rr || 0) +
            (rotationCounts.lr || 0) + (rotationCounts.rl || 0);
    }

    // Update heap stats
    if (state.selectedTree === 'heap') {
        heapTypeDisplay.textContent = stats.type === 'max' ? 'Max Heap' : 'Min Heap';
        rootValue.textContent = stats.rootValue || '-';
        heapifySteps.textContent = stats.heapifySteps || 0;
    }

    // Update trie stats
    if (state.selectedTree === 'trie') {
        totalWords.textContent = stats.totalWords || 0;
        trieNodeCount.textContent = stats.totalNodes || 0;
        longestWord.textContent = stats.longestWord || '-';
    }
}

function updateStats() {
    if (state.tree && state.tree.getStats) {
        updateStatsFromStep();
    } else {
        nodeCountEl.textContent = state.stats.nodeCount;
        leafCountEl.textContent = state.stats.leafCount;
        treeHeightEl.textContent = state.stats.treeHeight;
        balanceFactorEl.textContent = state.stats.balanceFactor;
    }
}

function renderTree() {
    const svg = treeSvg;
    svg.innerHTML = '';

    const currentStep = state.steps[state.currentStep];
    if (!currentStep || !currentStep.treeState) {
        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x", "300");
        text.setAttribute("y", "175");
        text.setAttribute("text-anchor", "middle");
        text.setAttribute("fill", "#666");
        text.setAttribute("font-size", "16");
        text.textContent = "Click 'Build Tree' to start visualization";
        svg.appendChild(text);
        return;
    }

    const treeState = currentStep.treeState;
    const highlightNode = currentStep.highlightNode;
    const stepType = currentStep.stepType;

    if (treeState.length === 0) {
        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x", "300");
        text.setAttribute("y", "175");
        text.setAttribute("text-anchor", "middle");
        text.setAttribute("fill", "#666");
        text.setAttribute("font-size", "16");
        text.textContent = "Tree is empty";
        svg.appendChild(text);
        return;
    }

    // Different rendering for different tree types
    if (state.selectedTree === 'trie') {
        renderTrie(treeState, currentStep);
    } else if (state.selectedTree === 'simple') {
        renderSimpleTree(treeState, highlightNode, stepType);
    } else {
        renderBinaryTree(treeState, highlightNode, stepType);
    }
}

function renderBinaryTree(treeState, highlightNode, stepType) {
    const svg = treeSvg;
    const nodeRadius = 22;
    const levelHeight = 70;
    const svgWidth = 600;
    const svgHeight = 350;

    // Calculate positions
    const nodePositions = [];
    const queue = [{ index: 0, depth: 0, x: svgWidth / 2, width: svgWidth }];

    while (queue.length > 0) {
        const { index, depth, x, width } = queue.shift();

        if (index < treeState.length && treeState[index]) {
            const node = treeState[index];
            const y = 40 + depth * levelHeight;

            nodePositions[index] = {
                x: x,
                y: y,
                value: node.value,
                height: node.height,
                balanceFactor: node.balanceFactor,
                isUnbalanced: node.isUnbalanced,
                isHeapRoot: (state.selectedTree === 'heap' && index === 0)
            };

            const childWidth = width / 2;
            if (node.left !== null && node.left < treeState.length) {
                queue.push({
                    index: node.left,
                    depth: depth + 1,
                    x: x - childWidth / 2,
                    width: childWidth
                });
            }

            if (node.right !== null && node.right < treeState.length) {
                queue.push({
                    index: node.right,
                    depth: depth + 1,
                    x: x + childWidth / 2,
                    width: childWidth
                });
            }
        }
    }

    // Draw edges
    for (let i = 0; i < treeState.length; i++) {
        if (!treeState[i] || !nodePositions[i]) continue;

        const node = treeState[i];
        const pos = nodePositions[i];

        if (node.left !== null && node.left < treeState.length && nodePositions[node.left]) {
            const childPos = nodePositions[node.left];
            const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
            line.setAttribute("x1", pos.x);
            line.setAttribute("y1", pos.y + nodeRadius);
            line.setAttribute("x2", childPos.x);
            line.setAttribute("y2", childPos.y - nodeRadius);
            line.setAttribute("class", "edge");

            svg.appendChild(line);
        }

        if (node.right !== null && node.right < treeState.length && nodePositions[node.right]) {
            const childPos = nodePositions[node.right];
            const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
            line.setAttribute("x1", pos.x);
            line.setAttribute("y1", pos.y + nodeRadius);
            line.setAttribute("x2", childPos.x);
            line.setAttribute("y2", childPos.y - nodeRadius);
            line.setAttribute("class", "edge");

            svg.appendChild(line);
        }
    }

    // Draw nodes
    for (let i = 0; i < treeState.length; i++) {
        if (!treeState[i] || !nodePositions[i]) continue;

        const node = treeState[i];
        const pos = nodePositions[i];

        // Draw node circle
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", pos.x);
        circle.setAttribute("cy", pos.y);
        circle.setAttribute("r", nodeRadius);
        circle.setAttribute("class", "node");

        if (i === 0) {
            if (state.selectedTree === 'heap') {
                circle.classList.add('heap-root');
            } else {
                circle.classList.add('root');
            }
        } else if (!node.left && !node.right) {
            circle.classList.add('leaf');
        }

        if (node.value === highlightNode && stepType === 'insert') {
            circle.classList.add('highlight');
        }

        if (node.isUnbalanced || stepType === 'unbalance') {
            circle.classList.add('unbalanced');
        }

        svg.appendChild(circle);

        // Draw node value
        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x", pos.x);
        text.setAttribute("y", pos.y);
        text.setAttribute("class", "node-text");
        text.textContent = node.value;
        svg.appendChild(text);

        // Draw height and balance factor for AVL
        if (state.selectedTree === 'avl') {
            const infoText = document.createElementNS("http://www.w3.org/2000/svg", "text");
            infoText.setAttribute("x", pos.x);
            infoText.setAttribute("y", pos.y + nodeRadius + 12);
            infoText.setAttribute("class", "balance-text");
            infoText.setAttribute("font-size", "9");
            infoText.textContent = `h:${node.height} bf:${node.balanceFactor}`;
            svg.appendChild(infoText);
        }
    }
}

function renderSimpleTree(treeState, highlightNode, stepType) {
    const svg = treeSvg;
    const nodeRadius = 20;
    const levelHeight = 60;
    const svgWidth = 600;
    const svgHeight = 350;

    // Calculate positions (simple tree layout)
    const nodePositions = [];
    const positions = [];

    // Calculate positions using BFS
    const queue = [{ index: 0, depth: 0, x: svgWidth / 2, width: svgWidth }];
    while (queue.length > 0) {
        const { index, depth, x, width } = queue.shift();

        if (treeState[index]) {
            const node = treeState[index];
            const y = 40 + depth * levelHeight;

            nodePositions[index] = {
                x: x,
                y: y,
                value: node.value
            };

            positions.push({ index, x, y });

            // Position children
            const childCount = node.children.length;
            const childWidth = width / (childCount || 1);

            node.children.forEach((childIndex, childNum) => {
                const childX = x - width / 2 + childWidth * (childNum + 0.5);
                queue.push({
                    index: childIndex,
                    depth: depth + 1,
                    x: childX,
                    width: childWidth
                });
            });
        }
    }

    // Draw edges
    positions.forEach(pos => {
        const node = treeState[pos.index];
        if (node && node.children) {
            node.children.forEach(childIndex => {
                const childPos = nodePositions[childIndex];
                if (childPos) {
                    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
                    line.setAttribute("x1", pos.x);
                    line.setAttribute("y1", pos.y + nodeRadius);
                    line.setAttribute("x2", childPos.x);
                    line.setAttribute("y2", childPos.y - nodeRadius);
                    line.setAttribute("class", "edge");
                    svg.appendChild(line);
                }
            });
        }
    });

    // Draw nodes
    positions.forEach(pos => {
        const node = treeState[pos.index];

        // Draw node circle
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", pos.x);
        circle.setAttribute("cy", pos.y);
        circle.setAttribute("r", nodeRadius);
        circle.setAttribute("class", "node");

        if (pos.index === 0) {
            circle.classList.add('root');
        } else if (!node.children || node.children.length === 0) {
            circle.classList.add('leaf');
        }

        if (node.value === highlightNode) {
            circle.classList.add('highlight');
        }

        svg.appendChild(circle);

        // Draw node value
        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x", pos.x);
        text.setAttribute("y", pos.y);
        text.setAttribute("class", "node-text");
        text.textContent = node.value;
        svg.appendChild(text);
    });
}

function renderTrie(treeState, currentStep) {
    const svg = treeSvg;
    const nodeRadius = 18;
    const levelHeight = 50;
    const horizontalSpacing = 40;
    const svgWidth = 600;
    const svgHeight = 350;

    // Calculate positions for trie (compact layout)
    const nodePositions = [];
    const positions = [];

    // Use DFS to position nodes
    const stack = [{ index: 0, depth: 0, x: svgWidth / 2, width: svgWidth }];
    const visited = new Set();

    while (stack.length > 0) {
        const { index, depth, x, width } = stack.pop();

        if (visited.has(index) || !treeState[index]) continue;
        visited.add(index);

        const node = treeState[index];
        const y = 40 + depth * levelHeight;

        nodePositions[index] = {
            x: x,
            y: y,
            value: node.value,
            isEndOfWord: node.isEndOfWord
        };

        positions.push({ index, x, y });

        // Position children
        const childCount = node.children.length;
        if (childCount > 0) {
            const childWidth = width / childCount;

            node.children.forEach((childIndex, childNum) => {
                const childX = x - width / 2 + childWidth * (childNum + 0.5);
                stack.push({
                    index: childIndex,
                    depth: depth + 1,
                    x: childX,
                    width: childWidth
                });
            });
        }
    }

    // Draw edges
    positions.forEach(pos => {
        const node = treeState[pos.index];
        if (node && node.children) {
            node.children.forEach(childIndex => {
                const childPos = nodePositions[childIndex];
                if (childPos) {
                    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
                    line.setAttribute("x1", pos.x);
                    line.setAttribute("y1", pos.y + nodeRadius);
                    line.setAttribute("x2", childPos.x);
                    line.setAttribute("y2", childPos.y - nodeRadius);
                    line.setAttribute("class", "trie-edge");

                    // Highlight search path
                    if (currentStep.searchPrefix &&
                        currentStep.searchResults &&
                        currentStep.searchResults.some(word =>
                            word.startsWith(currentStep.searchPrefix))) {
                        line.classList.add('highlight');
                    }

                    svg.appendChild(line);
                }
            });
        }
    });

    // Draw nodes
    positions.forEach(pos => {
        const node = treeState[pos.index];

        // Draw node circle
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", pos.x);
        circle.setAttribute("cy", pos.y);
        circle.setAttribute("r", nodeRadius);
        circle.setAttribute("class", "node trie");

        if (pos.index === 0) {
            circle.classList.add('root');
        }

        // Highlight if this word was just inserted
        if (currentStep.highlightWord && node.value &&
            currentStep.highlightWord.includes(node.value)) {
            circle.classList.add('highlight');
        }

        svg.appendChild(circle);

        // Draw node value
        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x", pos.x);
        text.setAttribute("y", pos.y);
        text.setAttribute("class", "trie-text");
        text.textContent = node.value === 'ROOT' ? '•' : node.value;
        svg.appendChild(text);

        // Draw end-of-word marker
        if (node.isEndOfWord) {
            const marker = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            marker.setAttribute("cx", pos.x + nodeRadius - 3);
            marker.setAttribute("cy", pos.y - nodeRadius + 3);
            marker.setAttribute("r", 3);
            marker.setAttribute("fill", "#dc3545");
            svg.appendChild(marker);
        }
    });
}

function showHelp() {
    alert("DSA Tree Visualizer - Help\n\n" +
        "1. Select a tree type from the homepage\n" +
        "2. Configure options for the selected tree\n" +
        "3. Click 'Visualize' to go to the visualization page\n" +
        "4. Enter values and click 'Build Tree'\n" +
        "5. Use Next/Previous buttons to step through the algorithm\n" +
        "6. Use Auto Build for automatic step-by-step visualization\n\n" +
        "Supported Trees:\n" +
        "- Simple Tree: Basic tree structure\n" +
        "- Binary Tree: Traversals and properties\n" +
        "- BST: Insertion, deletion, searching\n" +
        "- AVL Tree: Self-balancing with rotations\n" +
        "- Heap: Min-heap and Max-heap\n" +
        "- Trie: Word insertion and prefix search");
}

function updateUI() {
    updateButtons();
    updateStats();
}


// Initialize the application
init();