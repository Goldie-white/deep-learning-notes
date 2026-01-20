// Articles data
const articles = [
    {
        id: 1,
        title: "ResNet",
        excerpt: "残差网络（Residual Network，简称 ResNet）是由 Kaiming He 等人在 2015 年提出的深度神经网络架构。它通过引入"跳跃连接"（Skip Connection），允许网络学习残差映射，从而让网络在变深的同时保持可训练性。",
        category: "architecture",
        date: "2024-01-20",
        readTime: "15分钟",
        content: `# ResNet

残差网络（Residual Network，简称 ResNet）是由 Kaiming He 等人在 2015 年提出的深度神经网络架构. 它通过引入"跳跃连接"（Skip Connection）或"快捷连接"（Shortcut Connection），允许网络学习残差映射，从而让网络**在变深的同时保持可训练性**. 

> Deep Residual Learning for Image Recognition, https://arxiv.org/pdf/1512.03385

### 动机：深度的诅咒——退化问题 (The Degradation Problem)

在 ResNet 提出之前，理论上认为越深的网络应该具有越强的表达能力. 然而实验发现，随着网络层数增加（例如从 20 层增加到 56 层），训练误差反而上升了. 

假设我们有一个浅层网络 A（比如 20 层），它已经达到了很好的性能. 现在我们构建一个更深的网络 B（比如 56 层），把 A 的网络架构复制过来，然后再在后面加上 36 个层. 

 * 理论上：网络 B 的性能至少应该等于网络 A（因为它可以完全包含 A 的解）. 
 * 实际上：普通的深层网络 B 训练出来的误差远高于 A. 

这不是过拟合（Overfitting），因为过拟合通常表现为训练误差低、测试误差高；而在退化问题中，深层网络的训练误差也比浅层网络高. 这说明深层网络遇到了严重的**优化困难 (Optimization Difficulty)**，它甚至无法学会复现浅层网络的表现. 

### 残差块 (The Residual Block)：The "Do No Harm" Principle

ResNet 的解决方案极其简洁，它改变了网络学习的目标：不再让网络直接学习目标映射 $H(x)$，而是改为学习残差 $F(x)$. 

假设我们希望网络层学习的目标映射为 $H(x)$. 

- 普通网络：直接尝试拟合 $H(x)$. 这相当于**每一层都试图重新构造一套特征表示**. 在浅层网络中，这尚可接受；但在上百层的网络中，要求每一层都"从头来过"，优化极其困难且不稳定. 

- ResNet：引入跳跃连接，将输入 $x$ 直接加到输出上. 网络实际上只需要学习残差函数 $F(x) := H(x) - x$. 因此，原目标映射变为：
  $$
  H(x) = F(x) + x
  $$
  其中 $x$ 是输入，$F(x)$ 是网络层学习到的非线性变换. 这相当于**在前面层提取出来的特征的基础上进行微调**. 

ResNet 的基本思想是：通过预设 $H(x) = F(x) + x$，我们将初始状态（当权重为 0 时）设定为恒等映射. 这为深层网络提供了一个"保底"性能——只有当非线性变换 $F(x)$ 确实能降低 Loss 时，网络才会去学习它；否则，它至少可以退化回恒等映射，保持浅层网络的性能. 这意味着，增加深度不会让模型变差（The "Do No Harm" Principle）. 

#### 为什么 ResNet 学习比传统网络容易？本质上是网络学习恒等映射远比零映射困难

到这里，也许读者还是会有疑问，为什么说不使用残差连接，每一层就要"从头来过"地去构造一套特征表示呢？直接去复制上一层的结果，然后稍作修改，这很难吗？

是的，对普通网络来说，这很难，以至于它们不擅长继承前面层的结果. **"直接去复制上一层的结果，然后稍作修改"**，这恰是 ResNet 才容易做到的事情，**是 ResNet 的 structural bias**. 

本质上，这是因为**网络学习恒等映射远比零映射困难**. 这个道理不难想清楚：

- 如果最优映射接近恒等映射，在普通网络中，由于非线性激活函数的存在，需要精确地将权重逼近某种特定配置以模拟恒等映射；
- 而在 ResNet 中，只需将权重推向 0（即让 $F(x) \\to 0$），即可轻松实现 $H(x) \\to x$. **学习零映射的难度远低于恒等映射**. 

正因为 ResNet 具有这种**容易继承浅层结果的能力**，相当于把恒等映射这个"保底解"直接写入了网络，使模型不至于因为层数加深而性能退化. 

一句话总结：换言之，在普通深层网络中，**继承并微调已有特征在优化上是高度不稳定的**，而 ResNet 通过显式的恒等通路，使这种继承变得结构性可行. 

### 为什么残差学习有效？

#### A. "保底"机制

这个原因，其实前面已经有很详细的论述了. 由于神经网络学习零映射的难度远低于恒等映射，因此对于 ResNet 来说，加深网络以后至少保持原有的性能是很容易的（"保底"机制），但对普通网络来说却很难. 

在极深的网络中，我们不应该把每一层看作是全新的特征提取器，而应看作是对特征的渐进式微调（Refinement）. 这就像雕刻：

- 普通网络：试图每一刀都直接砍出最终形状. 
- ResNet：先有一个大致轮廓（$x$），然后每一刀只是对之前的成果进行打磨（$F(x)$）. 

#### B. 改善梯度流

从反向传播的角度看，残差结构极大地改善了梯度流. 

在 ResNet 中，第 $l$ 个残差块的输出 $x_{l+1}$ 和输入 $x_l$ 的关系是：
$$
x_{l+1} = x_l + F(x_l, W_l)
$$
递推可得：
$$
x_L=x_l+\\sum_{i=l}^{L-1}F(x_i,W_i),\\ \\forall L>l
$$
假设损失函数为 $\\mathcal{L}$，根据链式法则，关于输入 $x_l$ 的梯度可以表示为：
$$
\\frac{\\partial \\mathcal{L}}{\\partial x_l}
=
\\frac{\\partial \\mathcal{L}}{\\partial x_L}
\\prod_{k=l}^{L-1}\\left(I+J_k\\right)
$$

- 公式中的 $1$ 保证了**深层的梯度信号可以畅通无阻地通过跳跃连接传回浅层**. 
- 这种结构**打破了传统网络中梯度的连乘衰减效应**：即便 $F(x)$ 部分的梯度很小，只要 $1$ 这一项存在，梯度就能有效回流. 这使得训练上百层甚至上千层的网络成为可能. 

#### C. Smoothing the Optimization Landscape

研究表明（如 *Visualizing the Loss Landscape of Neural Nets*, NIPS 2018），ResNet 的跳跃连接极大地平滑了损失函数的几何形状（Loss Landscape）. 

> *Visualizing the Loss Landscape of Neural Nets*, NIPS 2018, https://arxiv.org/pdf/1712.09913

- 普通深层网络：损失曲面非常崎岖，充满了非凸的局部极小值和鞍点. 如果网络试图学习恒等映射但不仅没学好，反而陷入了混乱的非线性变换中，梯度就会在这些崎岖的 landscape 中消失或爆炸. 
- 残差网络：由于 $x$ 可以直接流过，整个函数在初始化附近表现得更像一个线性系统（Linear-like behavior）. 这使得损失曲面变得更加平滑、凸性更好. 

### Takeaways

1. ResNet 改变了特征提取的范式，将学习目标从"全量重构特征"转变为对浅层特征的"渐进式微调". 
2. ResNet 学习比传统网络容易，本质上是因为拟合零映射（$F(x) \\to 0$）远比拟合恒等映射（$H(x) \\to x$）容易. ResNet 通过引入跳跃连接，将恒等映射设为初始解，确立了"性能不下降"的保底机制（The "Do No Harm" Principle）. 
3. 残差结构改善了梯度流，有效防止了梯度消失，并平滑了损失函数的 Loss Landscape，使深层网络更易收敛.`
    }
];

// Category labels
const categoryLabels = {
    architecture: "Model Architecture",
    paper: "Paper Reading"
};

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    initializeStats();
    renderArticles('all');
    setupFilterButtons();
    setupNavigation();
});

// Initialize statistics
function initializeStats() {
    const articleCount = articles.length;
    const topicCount = new Set(articles.map(a => a.category)).size;
    const dayCount = calculateLearningDays();
    
    animateCounter('articleCount', articleCount);
    animateCounter('topicCount', topicCount);
    animateCounter('dayCount', dayCount);
}

// Animate counter
function animateCounter(elementId, target) {
    const element = document.getElementById(elementId);
    const duration = 2000;
    const increment = target / (duration / 16);
    let current = 0;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current);
    }, 16);
}

// Calculate learning days (simplified)
function calculateLearningDays() {
    const dates = articles.map(a => new Date(a.date));
    const minDate = new Date(Math.min(...dates));
    const maxDate = new Date(Math.max(...dates));
    const diffTime = Math.abs(maxDate - minDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays || 1;
}

// Render articles
function renderArticles(filter) {
    const grid = document.getElementById('articlesGrid');
    const filteredArticles = filter === 'all' 
        ? articles 
        : articles.filter(a => a.category === filter);
    
    if (filteredArticles.length === 0) {
        grid.innerHTML = '<p style="text-align: center; color: var(--text-secondary); grid-column: 1 / -1;">No articles found</p>';
        return;
    }
    
    grid.innerHTML = filteredArticles.map(article => `
        <div class="article-card" onclick="openArticle(${article.id})">
            <span class="article-category">${categoryLabels[article.category]}</span>
            <h3 class="article-title">${article.title}</h3>
            <p class="article-excerpt">${article.excerpt}</p>
            <div class="article-meta">
                <span class="article-date">📅 ${formatDate(article.date)}</span>
                <span>⏱️ ${article.readTime}</span>
            </div>
        </div>
    `).join('');
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Setup filter buttons
function setupFilterButtons() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            // Update active state
            filterButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Filter articles
            const filter = this.getAttribute('data-filter');
            renderArticles(filter);
        });
    });
}

// Setup smooth navigation
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            
            // Update active nav link
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            // Scroll to section
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

// Open article - show article content
function openArticle(id) {
    const article = articles.find(a => a.id === id);
    if (!article) return;
    
    // Create modal overlay
    const modal = document.createElement('div');
    modal.className = 'article-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <button class="modal-close" onclick="closeArticle()">&times;</button>
            <div class="article-header">
                <span class="article-category">${categoryLabels[article.category]}</span>
                <h2 class="article-title">${article.title}</h2>
                <div class="article-meta">
                    <span class="article-date">📅 ${formatDate(article.date)}</span>
                    <span>⏱️ ${article.readTime}</span>
                </div>
            </div>
            <div class="article-body">${markdownToHtml(article.content)}</div>
        </div>
    `;
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
}

// Close article modal
function closeArticle() {
    const modal = document.querySelector('.article-modal');
    if (modal) {
        modal.remove();
        document.body.style.overflow = '';
    }
}

// Simple markdown to HTML converter
function markdownToHtml(markdown) {
    if (!markdown) return '';
    
    let html = markdown;
    
    // Code blocks (do this first to avoid processing inside code)
    html = html.replace(/```([\s\S]*?)```/g, function(match, code) {
        return '<pre><code>' + code.trim() + '</code></pre>';
    });
    
    // Inline code
    html = html.replace(/`([^`\n]+)`/g, '<code>$1</code>');
    
    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    
    // Blockquotes
    html = html.replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>');
    
    // Lists - handle both * and - 
    html = html.replace(/^[\*\-] (.*$)/gim, '<li>$1</li>');
    
    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
    
    // Bold (avoid matching inside code blocks)
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    
    // Italic (avoid matching bold)
    html = html.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>');
    
    // Split into lines for processing
    const lines = html.split('\n');
    const processedLines = [];
    let inList = false;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        if (!line) {
            if (inList) {
                processedLines.push('</ul>');
                inList = false;
            }
            processedLines.push('');
            continue;
        }
        
        // Check if it's a list item
        if (line.startsWith('<li>')) {
            if (!inList) {
                processedLines.push('<ul>');
                inList = true;
            }
            processedLines.push(line);
        } else {
            if (inList) {
                processedLines.push('</ul>');
                inList = false;
            }
            
            // Check if it's already a block element
            if (line.match(/^<(h[1-6]|pre|blockquote|ul|ol)/)) {
                processedLines.push(line);
            } else {
                // Regular paragraph
                processedLines.push('<p>' + line + '</p>');
            }
        }
    }
    
    if (inList) {
        processedLines.push('</ul>');
    }
    
    html = processedLines.join('\n');
    
    // Clean up empty paragraphs
    html = html.replace(/<p><\/p>/g, '');
    html = html.replace(/<p>\s*<\/p>/g, '');
    
    // Math expressions - preserve LaTeX (can be enhanced with MathJax later)
    // For now, just preserve them as-is with some styling
    html = html.replace(/\$\$([^$]+)\$\$/g, '<div class="math-block">$$$1$$</div>');
    html = html.replace(/\$([^$\n]+)\$/g, '<span class="math-inline">$$$1$$</span>');
    
    return html;
}

// Close modal on escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeArticle();
    }
});

// Close modal on background click
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('article-modal')) {
        closeArticle();
    }
});

// Update active nav link on scroll
window.addEventListener('scroll', function() {
    const sections = ['home', 'articles', 'about'];
    const scrollPos = window.scrollY + 100;
    
    sections.forEach(section => {
        const element = document.getElementById(section);
        if (element) {
            const top = element.offsetTop;
            const bottom = top + element.offsetHeight;
            
            if (scrollPos >= top && scrollPos < bottom) {
                document.querySelectorAll('.nav-link').forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${section}`) {
                        link.classList.add('active');
                    }
                });
            }
        }
    });
});

