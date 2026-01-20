// Sample articles data
const articles = [
    {
        id: 1,
        title: "神经网络基础：从感知机到多层感知机",
        excerpt: "深入理解神经网络的基本原理，从最简单的感知机模型开始，逐步理解多层感知机的结构和训练过程。",
        category: "theory",
        date: "2024-01-15",
        readTime: "5分钟"
    },
    {
        id: 2,
        title: "使用PyTorch构建第一个CNN模型",
        excerpt: "手把手教你使用PyTorch框架构建卷积神经网络，实现图像分类任务，包含完整的代码示例和解释。",
        category: "practice",
        date: "2024-01-20",
        readTime: "10分钟"
    },
    {
        id: 3,
        title: "深度学习项目实战：猫狗分类器",
        excerpt: "从数据收集、预处理到模型训练和部署，完整记录一个深度学习项目的开发过程。",
        category: "project",
        date: "2024-02-01",
        readTime: "15分钟"
    },
    {
        id: 4,
        title: "如何高效学习深度学习：我的学习方法总结",
        excerpt: "分享我在学习深度学习过程中的经验和方法，包括资源推荐、学习路径规划等实用建议。",
        category: "tips",
        date: "2024-02-10",
        readTime: "8分钟"
    },
    {
        id: 5,
        title: "反向传播算法详解",
        excerpt: "深入解析反向传播算法的数学原理和实现细节，帮助理解神经网络如何通过梯度下降进行学习。",
        category: "theory",
        date: "2024-02-15",
        readTime: "12分钟"
    },
    {
        id: 6,
        title: "TensorFlow vs PyTorch：如何选择框架",
        excerpt: "对比分析两个主流深度学习框架的特点和适用场景，帮助你选择最适合的工具。",
        category: "tips",
        date: "2024-02-20",
        readTime: "7分钟"
    }
];

// Category labels
const categoryLabels = {
    theory: "理论基础",
    practice: "实践应用",
    project: "项目经验",
    tips: "学习技巧"
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
        grid.innerHTML = '<p style="text-align: center; color: var(--text-secondary); grid-column: 1 / -1;">暂无文章</p>';
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

// Open article (placeholder function)
function openArticle(id) {
    // You can implement article detail page here
    alert(`打开文章 #${id}\n\n这里可以跳转到文章详情页面，或者显示文章完整内容。`);
}

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

