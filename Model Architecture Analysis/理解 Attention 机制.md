# 理解 Attention 机制

**注：** 现代大模型基本采用 Decoder-Only 架构，其中仅有 Self-Attention，而 Self-Attention 已足够代表 Attention 机制的核心原理. 因此，**本文的讨论均基于 Self-Attention**，范围限定为 **Multi-Head Self-Attention Block**. 同时，约定大写字母表示矩阵，粗体小写字母表示向量，普通小写字母表示标量. 

Attention 机制的核心公式是这样的：
$$
\text{Attention}(Q,K,V)=\text{softmax}\left( \frac{QK^T}{\sqrt{d_k}} \right)V,
$$
其中，
$$
V = W_V X, \quad Q = W_Q X, \quad K = W_K X,
$$
这里 $W_V,W_Q,W_K$ 是可训练的矩阵，$X=\begin{bmatrix}
\mathbf{x}_1 \\
\mathbf{x}_2 \\
\vdots \\
\mathbf{x}_n
\end{bmatrix}$ 是输入矩阵，本质上是 token 序列（更准确地说，是 token 的 embedding 序列）. 

可以看到，Q、K、V 三个矩阵（也可以说是向量，如果把一个 token 的 embedding 理解为一个元素的话）是 Attention 的核心，理解了它们的作用，基本上也就理解了 Attention 机制. 

## 1. Q、K、V 的本质：输入矩阵的三次线性变换

在 Transformer 中，Query（Q）、Key（K）和 Value（V）本质上是**对输入矩阵 $X$ 进行的三次独立线性变换**，即通过三个不同的全连接层得到输入矩阵的三个新的表示. 

这些线性变换的目的并**不是为输入赋予特定的语义**，而是通过可训练的参数将 $X$ 映射到不同的特征子空间，从而**提升模型的表达能力**. Q、K、V 并不承载特定的语义信息，一些回答为 Q、K、V 赋予可解释的意义，只是为了方便理解，有一些解释也不见得恰当. 要理解它们真正的作用，得看注意力计算过程：

$$
\text{Attention}(Q, K, V) = \text{softmax}\Big(\frac{QK^T}{\sqrt{d_k}}\Big)V,
$$

Q、K 用来计算 Attention Score 矩阵，起到加权的作用，而 V 是加权的对象. 

若忽略线性变换，Attention 公式可以简化为：
$$
\text{softmax}\Big(\frac{XX^T}{\sqrt{d_k}}\Big) X,
$$

其中 $XX^T$ 表示序列中各 token 向量之间的内积，反映它们的相关性. 内积越大，相关性越强；softmax 将这些相关性归一化，得到 Attention Score，并用此对原始向量 $X$ 进行加权求和，从而生成每个 token 的上下文表示. 可以理解为，每个 token 的表示会根据上下文 token 传递的相关信息在高维空间中被修正，保留与相关 token 的重要信息，为后续层提供丰富的上下文特征. 

为什么需要 $W_Q, W_K, W_V$ 三个线性变换，而不能直接用 $X$ 呢？直接使用 $X$ 虽然可行，但存在几个问题：

- 缺少可训练参数会显著限制模型的表达能力；
- token 对自身的注意力得分通常过高，压缩了对其他 token 的关注，削弱了上下文信息整合能力；
- 还有一点，我印象中没有人提到：**直接使用 $X$ 的话，Attention Score 矩阵 $\text{softmax}\Big(\frac{XX^T}{\sqrt{d_k}}\Big)$ 就是对称的了，这说明第 $i$ 个 token 对第 $j$ 个 token 的影响等于第 $j$ 个 token 对第 $i$ 个 token 的影响，但语言建模中 token 之间的依赖关系应该是有方向性的**. 

引入 $W_Q, W_K, W_V$ 不仅提升模型表达能力，也使 Attention 机制能够更灵活地捕捉 token 间复杂依赖，从而增强语义建模效果. 

## 2. 如何理解 Q、K、V 的作用

如前所述，Q、K、V 只是对输入矩阵 $X$ 进行三个独立线性变换的结果，其中 $W_Q, W_K, W_V$ 是对应的线性变换矩阵，本质上是为了增强模型的表达能力. 

Attention 的思想其实非常直观，论文《Attention Is All You Need》中的表述可能比较抽象，这可能是出于写作上的考虑，但这也导致网上出现了很多半桶水的解释，**把解释的重点放在了讲故事上，自己的故事讲圆了，而实际上可能已经偏离了模型运行的机制**. 笔者认为，**解释模型的目的，是为了更好地理解模型本身的运行逻辑，而不是把我们主观设想中的“应有之义”当作模型的运行方式**. 一份好的解释，首先必须忠实于模型的实际机制，其次才能为人类理解提供清晰、实用的见解. 

下面希望提供一种比较客观、清晰的见解，不试图为 Q、K、V 赋予语义信息，而是解释 Attention 计算中 Q、K、V 的作用. 

**一句话：Q, K 的作用是在 token 之间传递信息，V 的作用是提取、表达当前 token 中的信息. **

### 2.1 Attention Head 的结构

对于任意一个 attention head，其输出可以表示为：

$$
H = AV =
\begin{bmatrix}
a_{11} & a_{12} & \cdots & a_{1n} \\
a_{21} & a_{22} & \cdots & a_{2n} \\
\vdots & \vdots & \ddots & \vdots \\
a_{n1} & a_{n2} & \cdots & a_{nn}
\end{bmatrix}
\begin{bmatrix}
\mathbf{v}_1 \\
\mathbf{v}_2 \\
\vdots \\
\mathbf{v}_n
\end{bmatrix}
$$

其中

$$
A = \text{softmax}\left( \frac{QK^T}{\sqrt{d_k}} \right), \quad 
V = W_V X, \quad Q = W_Q X, \quad K = W_K X.
$$

这样的话，我们可以分两个部分来看 Attention：

- Attention Score 矩阵 $A$：由 Q、K 决定；
- Value 向量 V. 

### 2.2 Q、K 的作用：信息传递

从前面的展开式可以看出，$Q$ 和 $K$ 的作用在于决定 Attention Score 矩阵 $A$，而 $A$ 又唯一地确定了信息在 token 之间的传递方式. 换句话说，$Q$ 和 $K$ 决定了模型从哪些 token 中“读取”信息，以及这些信息如何组合后写入输出 token. 

以 $H$ 的第一行元素为例：

$$
\mathbf{h}_1 = a_{11} \mathbf{v}_1 + a_{12} \mathbf{v}_2 + \cdots + a_{1n} \mathbf{v}_n.
$$

假设在某种情况下，只有 $a_{11}$ 和 $a_{12}$ 非零，其余系数为零，那么该 attention head 实际上只从第 1 和第 2 个 token 中提取信息，并将加权后的结果写入 $h_1$. 

我们有 $a_{ij}=q_i\cdot k_j$，所以
$$
\mathbf{h}_i = \sum_{j=1}^n(\mathbf{q}_{i}\cdot\mathbf{k}_j)\mathbf{v}_j,
$$
上式说明，输出的第 $i$ 个 token（$\mathbf{h}_i$），取决于输入的第 $i$ 个 token 的信息（$\mathbf{q}_i$）与其他所有 token（$\mathbf{k}_j,\ j=1,\cdots,n$）的信息的交互关系，因此 Q 和 K 的叫法很形象：Q（Query）表示当前 token 上下文 token 中查询信息，K（Key）表示上下文 token 提供相关信息用于与查询匹配. 然而需注意，这种解释仅是一种便于理解的类比，**Q 和 K 本身并不具备预先定义的语义含义，它们本质上是通过训练学习得到的、输入 $X$ 在不同线性投影空间中的表示**. 

要注意的是，Q 和 K 是独立的，是不同的矩阵（一般情况下不会相等），所以一般有 $q_i\cdot k_j\ne q_j\cdot k_i$，即 $A$ 一般不对称. 所以**严格意义上，我们不能说 $a_{ij}$ 衡量了第 $i$ 个 token 和第 $j$ 个 token 的相关关系**，因为相关关系是对称的. 应该说，$a_{ij}$ 衡量了第 $j$ 个 token 的语义对第 $i$ 个 token 的影响，这种影响是不对称的、有方向的. 这个也和现实需求相符，允许这种不对称性可以增加模型表达的自由度. 

### 2.3 V 的作用：提取与表示信息

在 Attention 机制中，$Q$ 和 $K$ 决定信息如何传递，通过 Attention Score 矩阵 $A$ 给出每个 token 对其他 token 的关注（或依赖）权重. 而 $V$ 决定了在加权过程中每个 token 实际传递的具体信息，即信息的表达形式. 

每个 token 的原始表示为 $X$，通过可训练矩阵 $W_V$ 投影得到：

$$
V = W_V X,
$$

该投影允许模型学习**从原始表示中提取对下游任务最有用的特征**，以便在注意力加权时实现高效的信息整合. 如果 $W_V$ 是单位矩阵，则传递的就是原始嵌入；可训练的 $W_V$ 则提供了额外的表达能力，使模型能够优化信息形式，从而提升上下文信息的表示和融合效率. 

注意力计算的输出为：

$$
\text{Attention}(Q,K,V) = A V, \quad A = \mathrm{softmax}\Big(\frac{QK^\top}{\sqrt{d_k}}\Big),
$$

其中 $A$ 表示每个 token 对其他 token 的关注程度，而 $V$ 表示每个 token 在注意力加权时提供的具体信息内容. 加权后的 $V$ 决定输出向量包含的信息. 

因此，$V$ 的作用可以总结为：为 Attention 机制提供可加权的信息表示，使输出不仅反映关注关系，也反映被关注 token 的具体内容. 

### 总结

所谓 Attention 机制，本质上就是说我们对一个 token 语义的理解要结合上下文来看，“语义在语境中”. 

在 Transformer 中，每个 token（准确地说，是 token 的 embedding，为简洁起见表述为 token，下同）在高维空间中对应一个向量. 当某个 token 的含义受到上下文中其他 token 的影响时，它在空间中的位置也会随之变化. Attention 的加权求和本质上就是对 token 在高维空间所在位置的调整，通过融合来自其他 token 的信息来更新其表示. 

具体来说，

- Q 和 K 决定**信息的传递关系**，即从哪些 token 接收信息，以及这些信息应如何加权影响输出 token；
- V 则提供了**实际要传递的信息**；
- Q、K、V 本身**没有预设的语义信息**，本质上是通过三个不同的可训练矩阵 $W_Q, W_K, W_V$ 投影得到的，施加这种线性变换提高了模型的表达能力. 

经过这种信息传递，token 的 embedding 不再仅仅表示它自身，而是已经融合了上下文提供的各种信息，这就是所谓的“Context Word Embedding”. 