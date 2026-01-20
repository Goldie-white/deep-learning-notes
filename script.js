// Articles data
const articles = [
    {
        id: 1,
        title: "ResNet: Deep Residual Learning for Image Recognition",
        excerpt: "Residual Network (ResNet), proposed by Kaiming He et al. in 2015, introduces skip connections that allow networks to learn residual mappings, enabling deeper networks while maintaining trainability.",
        category: "architecture",
        date: "2024-01-20",
        readTime: "15 min",
        content: `# ResNet: Deep Residual Learning for Image Recognition

Residual Network (ResNet), proposed by Kaiming He et al. in 2015, is a deep neural network architecture that introduces skip connections (also called shortcut connections) to allow networks to learn residual mappings, enabling networks to maintain trainability while becoming deeper.

> He, K., Zhang, X., Ren, S., & Sun, J. (2015). Deep residual learning for image recognition. *arXiv preprint arXiv:1512.03385*. https://arxiv.org/pdf/1512.03385

## Motivation: The Degradation Problem

Before ResNet, it was theoretically believed that deeper networks should have stronger representational power. However, experiments revealed that as network depth increased (e.g., from 20 to 56 layers), training error actually increased.

Suppose we have a shallow network A (e.g., 20 layers) that has achieved good performance. We then construct a deeper network B (e.g., 56 layers) by copying A's architecture and adding 36 more layers.

 * **Theoretically**: Network B should perform at least as well as network A (since it can completely contain A's solution).
 * **Actually**: The deeper network B achieves much higher error than A.

This is not overfitting, as overfitting typically manifests as low training error but high test error. In the degradation problem, deeper networks have higher training error than shallow networks. This indicates that deep networks face severe **optimization difficulties**—they cannot even learn to replicate shallow network performance. 

## The Residual Block: The "Do No Harm" Principle

ResNet's solution is elegantly simple: it changes the learning objective from directly learning the target mapping $H(x)$ to learning the residual $F(x)$.

Suppose we want the network layer to learn the target mapping $H(x)$.

- **Plain networks**: Directly attempt to fit $H(x)$. This is equivalent to **each layer trying to reconstruct a complete feature representation from scratch**. This is acceptable in shallow networks, but in networks with hundreds of layers, requiring each layer to "start over" makes optimization extremely difficult and unstable.

- **ResNet**: Introduces skip connections that add the input $x$ directly to the output. The network only needs to learn the residual function $F(x) := H(x) - x$. Thus, the target mapping becomes:
  $$
  H(x) = F(x) + x
  $$
  where $x$ is the input and $F(x)$ is the nonlinear transformation learned by the network layers. This is equivalent to **fine-tuning on top of features extracted by earlier layers**.

The key insight of ResNet is that by setting $H(x) = F(x) + x$, we initialize the network (when weights are near zero) to the identity mapping. This provides a "baseline" performance for deep networks—the network will only learn the nonlinear transformation $F(x)$ if it actually reduces the loss; otherwise, it can at least degrade to the identity mapping, maintaining shallow network performance. This means that adding depth will not make the model worse (The "Do No Harm" Principle). 

### Why is ResNet Easier to Learn? Learning Identity Mappings is Much Harder than Zero Mappings

At this point, readers might wonder: why does each layer need to "start over" constructing feature representations without residual connections? Why is it difficult to simply copy the previous layer's result and make slight modifications?

Yes, for plain networks, this is difficult—they are not good at inheriting results from previous layers. **"Copying the previous layer's result and making slight modifications"** is exactly what ResNet makes easy—this is ResNet's **structural bias**.

Essentially, this is because **learning identity mappings is much harder than learning zero mappings**. This is not difficult to understand:

- If the optimal mapping is close to identity, in plain networks, due to the presence of nonlinear activation functions, weights must be precisely configured to approximate identity mapping;
- In ResNet, we only need to push weights toward zero (i.e., let $F(x) \\to 0$) to easily achieve $H(x) \\to x$. **Learning zero mappings is much easier than learning identity mappings**.

Because ResNet has this **ability to easily inherit shallow results**, it effectively writes the identity mapping as a "baseline solution" directly into the network, preventing performance degradation as depth increases.

In summary: in plain deep networks, **inheriting and fine-tuning existing features is highly unstable in optimization**, while ResNet makes this inheritance structurally feasible through explicit identity pathways. 

## Why Does Residual Learning Work?

### A. Baseline Mechanism

This reason has been discussed in detail above. Since learning zero mappings is much easier than learning identity mappings, for ResNet, maintaining at least original performance after deepening the network is easy (the "baseline" mechanism), but this is difficult for plain networks.

In extremely deep networks, we should not view each layer as a completely new feature extractor, but rather as progressive refinement of features. This is like sculpting:

- **Plain networks**: Try to carve the final shape with each cut.
- **ResNet**: Start with a rough outline ($x$), then each cut only refines previous work ($F(x)$).

### B. Improved Gradient Flow

From the perspective of backpropagation, residual structures greatly improve gradient flow.

In ResNet, the relationship between the output $x_{l+1}$ and input $x_l$ of the $l$-th residual block is:
$$
x_{l+1} = x_l + F(x_l, W_l)
$$
By recursion:
$$
x_L=x_l+\\sum_{i=l}^{L-1}F(x_i,W_i),\\ \\forall L>l
$$
Assuming the loss function is $\\mathcal{L}$, according to the chain rule, the gradient with respect to input $x_l$ can be expressed as:
$$
\\frac{\\partial \\mathcal{L}}{\\partial x_l}
=
\\frac{\\partial \\mathcal{L}}{\\partial x_L}
\\prod_{k=l}^{L-1}\\left(I+J_k\\right)
$$

- The $1$ in the formula ensures that **gradient signals from deep layers can flow unimpeded back to shallow layers through skip connections**.
- This structure **breaks the multiplicative gradient decay effect in traditional networks**: even if gradients in the $F(x)$ part are small, as long as the $1$ term exists, gradients can flow back effectively. This makes training networks with hundreds or even thousands of layers possible.

### C. Smoothing the Optimization Landscape

Research (e.g., *Visualizing the Loss Landscape of Neural Nets*, NIPS 2018) shows that ResNet's skip connections greatly smooth the geometry of the loss function (Loss Landscape).

> Li, H., Xu, Z., Taylor, G., Studer, C., & Goldstein, T. (2018). Visualizing the loss landscape of neural nets. *Advances in neural information processing systems*, 31. https://arxiv.org/pdf/1712.09913

- **Plain deep networks**: Loss surfaces are very rugged, full of non-convex local minima and saddle points. If the network tries to learn identity mapping but fails, falling into chaotic nonlinear transformations, gradients will vanish or explode in these rugged landscapes.
- **Residual networks**: Since $x$ can flow directly through, the entire function behaves more like a linear system (linear-like behavior) near initialization. This makes the loss surface smoother and more convex.

## Takeaways

1. ResNet changes the paradigm of feature extraction, shifting the learning objective from "complete feature reconstruction" to "progressive refinement" of shallow features.
2. ResNet is easier to learn than traditional networks because fitting zero mappings ($F(x) \\to 0$) is much easier than fitting identity mappings ($H(x) \\to x$). By introducing skip connections, ResNet sets identity mapping as the initial solution, establishing a "performance non-decreasing" baseline mechanism (The "Do No Harm" Principle).
3. Residual structures improve gradient flow, effectively prevent gradient vanishing, and smooth the loss landscape, making deep networks easier to converge.`
    }
];

// Category labels
const categoryLabels = {
    architecture: "Model Architecture",
    paper: "Paper Reading"
};

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    console.log('Articles loaded:', articles.length);
    console.log('Articles:', articles);
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
    if (!grid) {
        console.error('articlesGrid element not found!');
        return;
    }
    
    const filteredArticles = filter === 'all' 
        ? articles 
        : articles.filter(a => a.category === filter);
    
    console.log('Filter:', filter, 'Filtered articles:', filteredArticles.length);
    
    if (filteredArticles.length === 0) {
        grid.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 3rem 0;">No articles found in this category.</p>';
        return;
    }
    
    grid.innerHTML = filteredArticles.map(article => {
        console.log('Rendering article:', article.id, article.title);
        return `
        <article class="article-card" data-article-id="${article.id}">
            <div class="article-header-meta">
                <span class="article-category">${categoryLabels[article.category]}</span>
                <span class="article-date">${formatDate(article.date)}</span>
            </div>
            <h3 class="article-title">${article.title}</h3>
            <p class="article-excerpt">${article.excerpt}</p>
            <div class="article-meta">
                <span class="read-time">⏱️ ${article.readTime}</span>
            </div>
        </article>
    `;
    }).join('');
    
    // Add click event listeners
    const articleCards = grid.querySelectorAll('.article-card');
    articleCards.forEach(card => {
        const articleId = parseInt(card.getAttribute('data-article-id'));
        card.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Card clicked, article ID:', articleId);
            openArticle(articleId);
        });
        card.style.cursor = 'pointer';
    });
    
    console.log('Articles rendered:', filteredArticles.length);
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
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
    console.log('Opening article:', id);
    const article = articles.find(a => a.id === id);
    if (!article) {
        console.error('Article not found:', id);
        return;
    }
    
    console.log('Article found:', article.title);
    
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

// Make functions globally accessible
window.openArticle = openArticle;
window.closeArticle = closeArticle;

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

