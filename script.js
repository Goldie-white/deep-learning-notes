// Architecture Notes Data
const architectureNotes = [
    {
        id: 1,
        title: "Mathematical Derivation of Residual Blocks",
        tags: ["ResNet", "Math"],
        summary: "残差网络（Residual Network，简称 ResNet）是由 Kaiming He 等人在 2015 年提出的深度神经网络架构。它通过引入\"跳跃连接\"（Skip Connection），允许网络学习残差映射，从而让网络在变深的同时保持可训练性。本文详细分析了残差块背后的数学原理，包括梯度流分析和优化景观的平滑性。",
        contentFile: "ResNet.md"
    }
];

// Paper Reading Data
const papers = [
    {
        id: 1,
        title: "Deep Residual Learning for Image Recognition",
        authors: "He et al.",
        year: 2015,
        takeaway: "ResNet 的核心创新在于将恒等映射设为初始解，使网络学习零映射而非恒等映射，从而解决了深度网络的退化问题。这种设计哲学——'Do No Harm' Principle——为后续的深度架构设计提供了重要启示。"
    }
];

// Lab Notebook Data
const notebookEntries = [
    {
        id: 1,
        date: "2024-01-20",
        title: "Why Cross-Entropy failed today",
        snippet: "Spent 3 hours debugging why my model wasn't learning. Turns out I was using cross-entropy loss on logits that weren't properly normalized. The gradients were vanishing because the softmax was saturating. Lesson: always check your activation functions match your loss function."
    },
    {
        id: 2,
        date: "2024-01-18",
        title: "Grokking observation: sudden phase transition",
        snippet: "Noticed something interesting in my grokking experiments. The model seems to plateau for a long time, then suddenly 'gets it' around epoch 2000. The loss drops dramatically in just a few epochs. This phase transition behavior is fascinating - need to investigate the weight dynamics during this period."
    }
];

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    console.log('Page loaded');
    
    renderArchitectureNotes();
    renderPapers();
    renderNotebookEntries();
    setupNavigation();
    
    console.log('Initialization complete');
});

// Render Architecture Notes
function renderArchitectureNotes() {
    const grid = document.getElementById('architectureGrid');
    if (!grid) {
        console.error('architectureGrid element not found!');
        return;
    }
    
    if (!architectureNotes || architectureNotes.length === 0) {
        grid.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 3rem 0;">No architecture notes available.</p>';
        return;
    }
    
    grid.innerHTML = '';
    
    architectureNotes.forEach(note => {
        const card = document.createElement('a');
        card.href = `article.html?id=${note.id}`;
        card.className = 'architecture-card';
        card.style.textDecoration = 'none';
        card.style.color = 'inherit';
        card.style.display = 'block';
        
        const tagsHtml = note.tags.map(tag => 
            `<span class="architecture-tag">${tag}</span>`
        ).join('');
        
        card.innerHTML = `
            <div class="architecture-card-tags">${tagsHtml}</div>
            <h3 class="architecture-card-title">${note.title}</h3>
            <p class="architecture-card-summary">${note.summary}</p>
            <div class="architecture-card-footer">Read Derivation</div>
        `;
        
        grid.appendChild(card);
    });
}

// Render Papers
function renderPapers() {
    const list = document.getElementById('papersList');
    if (!list) {
        console.error('papersList element not found!');
        return;
    }
    
    if (!papers || papers.length === 0) {
        list.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 3rem 0;">No papers available.</p>';
        return;
    }
    
    list.innerHTML = '';
    
    papers.forEach(paper => {
        const item = document.createElement('div');
        item.className = 'paper-item';
        item.style.cursor = 'pointer';
        
        item.innerHTML = `
            <div class="paper-title">${paper.title}</div>
            <div class="paper-meta">${paper.authors}, ${paper.year}</div>
            <div class="paper-takeaway">
                <strong>My Takeaway:</strong> ${paper.takeaway}
            </div>
        `;
        
        list.appendChild(item);
    });
}

// Render Notebook Entries
function renderNotebookEntries() {
    const timeline = document.getElementById('notebookTimeline');
    if (!timeline) {
        console.error('notebookTimeline element not found!');
        return;
    }
    
    if (!notebookEntries || notebookEntries.length === 0) {
        timeline.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 3rem 0;">No notebook entries available.</p>';
        return;
    }
    
    timeline.innerHTML = '';
    
    // Sort by date (newest first)
    const sortedEntries = [...notebookEntries].sort((a, b) => 
        new Date(b.date) - new Date(a.date)
    );
    
    sortedEntries.forEach(entry => {
        const item = document.createElement('div');
        item.className = 'notebook-entry';
        item.style.cursor = 'pointer';
        
        item.innerHTML = `
            <div class="notebook-date">${entry.date}</div>
            <div class="notebook-title">${entry.title}</div>
            <div class="notebook-snippet">${entry.snippet}</div>
        `;
        
        timeline.appendChild(item);
    });
}

// Setup smooth navigation
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Only prevent default for anchor links
            if (href.startsWith('#')) {
                e.preventDefault();
                
                // Update active nav link
                navLinks.forEach(l => {
                    if (l.getAttribute('href').startsWith('#')) {
                        l.classList.remove('active');
                    }
                });
                this.classList.add('active');
                
                // Scroll to section
                const targetId = href.substring(1);
                const targetSection = document.getElementById(targetId);
                if (targetSection) {
                    targetSection.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });
}

// Update active nav link on scroll
window.addEventListener('scroll', function() {
    const sections = ['home', 'architecture', 'papers', 'notebook'];
    const scrollPos = window.scrollY + 150;
    
    let currentSection = '';
    sections.forEach(section => {
        const element = document.getElementById(section);
        if (element) {
            const top = element.offsetTop;
            const bottom = top + element.offsetHeight;
            
            if (scrollPos >= top && scrollPos < bottom) {
                currentSection = section;
            }
        }
    });
    
    if (currentSection) {
        document.querySelectorAll('.nav-link').forEach(link => {
            const href = link.getAttribute('href');
            if (href === `#${currentSection}`) {
                link.classList.add('active');
            } else if (href.startsWith('#')) {
                link.classList.remove('active');
            }
        });
    }
});

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Simple markdown to HTML converter (for article pages)
function markdownToHtml(markdown) {
    if (!markdown) return '';
    
    let html = markdown;
    
    // First, protect block math formulas before other processing
    const blockMathPlaceholders = [];
    html = html.replace(/\$\$([\s\S]*?)\$\$/g, function(match, math) {
        const placeholder = `__BLOCK_MATH_${blockMathPlaceholders.length}__`;
        blockMathPlaceholders.push(math.trim());
        return placeholder;
    });
    
    // Protect inline math formulas
    const inlineMathPlaceholders = [];
    html = html.replace(/(?<!\$)\$(?!\$)([^$\n]+?)\$(?!\$)/g, function(match, math) {
        const placeholder = `__INLINE_MATH_${inlineMathPlaceholders.length}__`;
        inlineMathPlaceholders.push(math.trim());
        return placeholder;
    });
    
    // Code blocks (do this first to avoid processing inside code)
    html = html.replace(/```([\s\S]*?)```/g, function(match, code) {
        return '<pre><code>' + code.trim() + '</code></pre>';
    });
    
    // Inline code
    html = html.replace(/`([^`\n]+)`/g, '<code>$1</code>');
    
    // Headers - process from most # to least # to avoid conflicts
    html = html.replace(/^#### (.*$)/gim, '<h4>$1</h4>');
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
        
        // Check if it's a block math placeholder
        if (line.match(/^__BLOCK_MATH_\d+__$/)) {
            if (inList) {
                processedLines.push('</ul>');
                inList = false;
            }
            processedLines.push(line);
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
            
            // Check if it's already a block element (including h4)
            if (line.match(/^<(h[1-6]|pre|blockquote|ul|ol|div)/)) {
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
    
    // Restore block math formulas - use $$ for MathJax compatibility
    blockMathPlaceholders.forEach((math, index) => {
        // Clean up math content (remove extra whitespace/newlines)
        const cleanMath = math.replace(/\s+/g, ' ').trim();
        html = html.replace(`__BLOCK_MATH_${index}__`, `<div class="math-block">$$${cleanMath}$$</div>`);
    });
    
    // Restore inline math formulas
    inlineMathPlaceholders.forEach((math, index) => {
        html = html.replace(`__INLINE_MATH_${index}__`, `<span class="math-inline">\\(${math}\\)</span>`);
    });
    
    return html;
}

// Make functions globally accessible for article.html
window.markdownToHtml = markdownToHtml;
window.formatDate = formatDate;

// Category labels for article pages
const categoryLabels = {
    architecture: "Architecture Notes",
    paper: "Paper Reading",
    notebook: "Lab Notebook"
};

// For article.html compatibility - keep articles array reference
// Note: This will be populated with actual content when needed
const articles = architectureNotes.map(note => ({
    id: note.id,
    title: note.title,
    excerpt: note.summary,
    category: "architecture",
    date: "2024-01-20",
    readTime: "15分钟",
    content: `# ${note.title}\n\n${note.summary}`
}));

// Load ResNet content for article with id 1
if (articles.length > 0 && articles[0].id === 1) {
    // This will be loaded from ResNet.md if available, otherwise use summary
    // For now, we'll use a placeholder that can be replaced
    articles[0].content = `# ResNet

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
3. 残差结构改善了梯度流，有效防止了梯度消失，并平滑了损失函数的 Loss Landscape，使深层网络更易收敛.`;
}
